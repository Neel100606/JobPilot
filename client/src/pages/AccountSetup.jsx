import React, { useEffect, useState } from 'react';
import {
  Stepper, Step, StepLabel, Button, TextField, MenuItem,
  Select, FormControl, InputLabel, Typography, CircularProgress, Paper, Box
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import WorkIcon from '@mui/icons-material/Work';

const steps = ['Personal', 'Profile Info', 'Social Links', 'Contact'];

// ---------- NAVBAR FOR ACCOUNT SETUP ----------
const SetupNavbar = ({ activeStep }) => {
  const navigate = useNavigate();

  // clamp activeStep so progress never goes above 100%
  const completedSteps = Math.min(activeStep, steps.length);
  const progress = (completedSteps / steps.length) * 100;

  return (
    <header className="w-full bg-white border-b">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Left: Jobpilot logo */}
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2"
        >
          <WorkIcon sx={{ color: '#2563eb' }} />
          <span className="font-semibold text-lg text-gray-900">Jobpilot</span>
        </button>

        {/* Right: progress + skip */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end text-xs text-gray-500">
            <span>Finish your company profile</span>
            <div className="mt-1 w-40 h-1 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-blue-600"
                style={{ width: `${progress}%`, transition: 'width 0.3s ease' }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const AccountSetup = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    founded_date: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    website: '',
    logo: null,
    banner: null
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger
  } = useForm({
    mode: 'onChange',
    defaultValues: formData
  });

  // If company already exists → go to settings instead of wizard
  useEffect(() => {
    const checkCompany = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.get('http://localhost:5000/api/company/profile', config);
        navigate('/settings');
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error('Profile check error', err);
        }
      }
    };
    if (token) checkCompany();
  }, [token, navigate]);

  const handleNext = async () => {
    let isValid = false;

    if (activeStep === 0) {
      isValid = await trigger(['company_name', 'industry', 'founded_date']);
    } else if (activeStep === 1) {
      isValid = await trigger([
        'description',
        'address',
        'city',
        'state',
        'country',
        'postal_code'
      ]);
    } else if (activeStep === 2) {
      isValid = await trigger(['website']);
    } else {
      isValid = true;
    }

    if (isValid) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [fieldName]: file }));
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.post('http://localhost:5000/api/company/register', data, config);

      if (formData.logo) {
        const logoData = new FormData();
        logoData.append('logo', formData.logo);
        await axios.post('http://localhost:5000/api/company/upload-logo', logoData, config);
      }

      if (formData.banner) {
        const bannerData = new FormData();
        bannerData.append('banner', formData.banner);
        await axios.post('http://localhost:5000/api/company/upload-banner', bannerData, config);
      }

      toast.success('Company Profile Completed!');
      setActiveStep(steps.length); // show final message screen
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Setup failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR LIKE IN FIGMA */}
      <SetupNavbar activeStep={activeStep} />

      {/* Wizard container */}
      <div className="flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-4xl mb-8 text-center">
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Complete Your Company Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Just a few simple steps to get started.
          </Typography>
        </div>

        <Paper elevation={2} className="w-full max-w-4xl rounded-xl p-8">
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Final success screen */}
          {activeStep === steps.length ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Great! Your company profile is ready 🎉
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                You can now manage all your details from the Settings page.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/settings')}
                sx={{ px: 4 }}
              >
                Go to Settings
              </Button>
            </Box>
          ) : (
            <form>
              {/* STEP 1: PERSONAL */}
              {activeStep === 0 && (
                <div className="space-y-6 animate-fade-in">
                  <Typography variant="h6" fontWeight="bold">
                    Personal / Company Basics
                  </Typography>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Controller
                      name="company_name"
                      control={control}
                      rules={{ required: 'Company Name is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Company Name"
                          fullWidth
                          error={!!errors.company_name}
                          helperText={errors.company_name?.message}
                        />
                      )}
                    />

                    <Controller
                      name="industry"
                      control={control}
                      rules={{ required: 'Industry is required' }}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.industry}>
                          <InputLabel>Industry Type</InputLabel>
                          <Select {...field} label="Industry Type">
                            <MenuItem value="IT">Technology / IT</MenuItem>
                            <MenuItem value="Finance">Finance / Banking</MenuItem>
                            <MenuItem value="Healthcare">Healthcare</MenuItem>
                            <MenuItem value="Education">Education</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />

                    <Controller
                      name="founded_date"
                      control={control}
                      rules={{ required: 'Founded Date is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="date"
                          label="Founded Date"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          error={!!errors.founded_date}
                          helperText={errors.founded_date?.message}
                        />
                      )}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: PROFILE INFO */}
              {activeStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <Typography variant="h6" fontWeight="bold">
                    Profile Information
                  </Typography>

                  <Controller
                    name="description"
                    control={control}
                    rules={{ required: 'Description is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="About Company"
                        multiline
                        rows={4}
                        fullWidth
                        placeholder="Write a short summary about your company..."
                        error={!!errors.description}
                        helperText={errors.description?.message}
                      />
                    )}
                  />

                  <Controller
                    name="address"
                    control={control}
                    rules={{ required: 'Address is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Street Address"
                        fullWidth
                        error={!!errors.address}
                        helperText={errors.address?.message}
                      />
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Controller
                      name="city"
                      control={control}
                      rules={{ required: 'City is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="City"
                          fullWidth
                          error={!!errors.city}
                          helperText={errors.city?.message}
                        />
                      )}
                    />

                    <Controller
                      name="postal_code"
                      control={control}
                      rules={{ required: 'Postal Code is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Postal Code"
                          fullWidth
                          error={!!errors.postal_code}
                          helperText={errors.postal_code?.message}
                        />
                      )}
                    />

                    <Controller
                      name="state"
                      control={control}
                      rules={{ required: 'State is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="State"
                          fullWidth
                          error={!!errors.state}
                          helperText={errors.state?.message}
                        />
                      )}
                    />

                    <Controller
                      name="country"
                      control={control}
                      rules={{ required: 'Country is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Country"
                          fullWidth
                          error={!!errors.country}
                          helperText={errors.country?.message}
                        />
                      )}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: SOCIAL LINKS */}
              {activeStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <Typography variant="h6" fontWeight="bold">
                    Social Links
                  </Typography>

                  <Controller
                    name="website"
                    control={control}
                    rules={{
                      required: 'Website is required',
                      pattern: {
                        value: /^https?:\/\/.*/i,
                        message: 'Must start with http:// or https://'
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Website URL"
                        fullWidth
                        placeholder="https://www.yourcompany.com"
                        error={!!errors.website}
                        helperText={errors.website?.message}
                      />
                    )}
                  />

                  <TextField label="LinkedIn URL (Optional)" fullWidth />
                  <TextField label="Twitter URL (Optional)" fullWidth />
                </div>
              )}

              {/* STEP 4: CONTACT / MEDIA */}
              {activeStep === 3 && (
                <div className="space-y-8 animate-fade-in">
                  <Typography variant="h6" fontWeight="bold">
                    Contact & Branding
                  </Typography>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition">
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Company Logo
                    </Typography>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="logo-upload"
                      type="file"
                      onChange={(e) => handleFileChange(e, 'logo')}
                    />
                    <label htmlFor="logo-upload">
                      <Button variant="outlined" component="span">
                        {formData.logo ? 'Change File' : 'Upload Logo'}
                      </Button>
                    </label>
                    {formData.logo && (
                      <Typography variant="body2" sx={{ mt: 2, color: 'green' }}>
                        Selected: {formData.logo.name}
                      </Typography>
                    )}
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition">
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Company Banner
                    </Typography>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="banner-upload"
                      type="file"
                      onChange={(e) => handleFileChange(e, 'banner')}
                    />
                    <label htmlFor="banner-upload">
                      <Button variant="outlined" component="span">
                        {formData.banner ? 'Change File' : 'Upload Banner'}
                      </Button>
                    </label>
                    {formData.banner && (
                      <Typography variant="body2" sx={{ mt: 2, color: 'green' }}>
                        Selected: {formData.banner.name}
                      </Typography>
                    )}
                  </div>
                </div>
              )}

              {/* BUTTONS */}
              <div className="mt-8 flex justify-between">
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                  sx={{ px: 4, py: 1 }}
                >
                  Back
                </Button>

                {activeStep === steps.length - 1 ? (
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    variant="contained"
                    color="primary"
                    sx={{ px: 4, py: 1 }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Finish'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    color="primary"
                    sx={{ px: 4, py: 1 }}
                  >
                    Next
                  </Button>
                )}
              </div>
            </form>
          )}
        </Paper>
      </div>
    </div>
  );
};

export default AccountSetup;
