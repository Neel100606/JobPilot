import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  TextField, Button, MenuItem, Select, FormControl, InputLabel, 
  Dialog, DialogContent, Checkbox, FormControlLabel, CircularProgress 
} from '@mui/material';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { useNavigate, Link } from 'react-router-dom';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, // Required for existing users
  sendEmailVerification 
} from 'firebase/auth';
import { auth } from '../config/firebase'; 
import axios from 'axios';
import { toast } from 'react-toastify';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import CloseIcon from '@mui/icons-material/Close';

const Register = () => {
  const [openOtp, setOpenOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registeredMobile, setRegisteredMobile] = useState('');
  
  const navigate = useNavigate();

  const { 
    control, 
    handleSubmit, 
    watch, 
    formState: { errors } 
  } = useForm({
    defaultValues: { full_name: '', email: '', password: '', confirmPassword: '', gender: '', mobile_no: '' }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formattedMobile = data.mobile_no.startsWith('+') ? data.mobile_no : `+${data.mobile_no}`;
      setRegisteredMobile(formattedMobile);

      // Remove confirmPassword before sending to backend
      const { confirmPassword, ...payload } = data;

      // 1. Save in Postgres via Backend
      await axios.post('http://localhost:5000/api/auth/register', { ...payload, mobile_no: formattedMobile });

      // 2. FIREBASE: Handle Email Verification
      let user;
      try {
        // Try creating a new user
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        user = userCredential.user;
      } catch (firebaseError) {
        if (firebaseError.code === 'auth/email-already-in-use') {
          // If user exists in Firebase, sign them in to send the email
          console.log("User exists in Firebase, signing in...");
          const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
          user = userCredential.user;
        } else {
          throw firebaseError; // Stop if it's a real error
        }
      }

      // Send Verification Email
      if (user) {
        await sendEmailVerification(user);
        console.log("Verification email sent");
      }
      
      // 3. FIREBASE: Send SMS OTP
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'invisible' });
      }

      const confirmation = await signInWithPhoneNumber(auth, formattedMobile, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      
      setLoading(false);
      setOpenOtp(true); 
      toast.success("OTP and Email sent!");

    } catch (error) {
      console.error(error);
      setLoading(false);
      const msg = error.response?.data?.message || error.message || "Registration failed";
      toast.error(msg);
    }
  };

  const verifyOtp = async () => {
    if(!otp) return;
    try {
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();

      await axios.post('http://localhost:5000/api/auth/verify-mobile', {
        mobile_no: registeredMobile,
        idToken
      });

      toast.success("Mobile Verified!");
      setOpenOtp(false);
      navigate('/login'); 

    } catch (error) {
      console.error(error);
      toast.error("Invalid OTP");
    }
  };

  return (
    // MAIN BACKGROUND
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4">
      
      {/* CARD CONTAINER */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
        
        {/* LEFT SIDE: Info / Illustration area */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#d4a5ff] to-[#755eea] items-center justify-center p-10 text-white">
          <div className="space-y-4 max-w-xs">
             <h2 className="text-3xl font-extrabold leading-tight">Hire smarter with JobPilot</h2>
             <p className="text-sm text-white/80">Create your company account, verify your mobile number and start posting jobs in minutes.</p>
             <ul className="text-xs space-y-1 text-white/80">
                <li>• Post openings instantly</li>
                <li>• Manage applicants in one place</li>
                <li>• Built for fast-growing teams</li>
             </ul>
          </div>
        </div>

        {/* RIGHT SIDE: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col">
          
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Register as a Company</h2>
            <p className="text-sm text-gray-500 mt-1">Create your recruiter account to start hiring talent.</p>
          </div>
          
          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 flex-1 flex flex-col">
            
            {/* Row 1: Full Name + Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Controller name="full_name" control={control} rules={{ required: "Required" }}
                render={({ field }) => (
                  <TextField {...field} label="Full Name" size="small" fullWidth error={!!errors.full_name} helperText={errors.full_name?.message} />
                )}
              />
              
              <Controller name="gender" control={control} rules={{ required: "Required" }}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={!!errors.gender}>
                    <InputLabel>Gender</InputLabel>
                    <Select {...field} label="Gender">
                      <MenuItem value="m">Male</MenuItem>
                      <MenuItem value="f">Female</MenuItem>
                      <MenuItem value="o">Other</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </div>

            {/* Row 2: Mobile + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <Controller name="mobile_no" control={control} rules={{ required: "Required" }}
                    render={({ field: { onChange, value } }) => (
                       <PhoneInput country={'in'} value={value} onChange={onChange} inputStyle={{ width: '100%', height: '40px' }} />
                    )}
                  />
                  {errors.mobile_no && <p className="text-xs text-red-600 mt-1">{errors.mobile_no.message}</p>}
               </div>

               <Controller name="email" control={control} rules={{ required: "Required" }}
                render={({ field }) => (
                  <TextField {...field} label="Organization Email" size="small" fullWidth error={!!errors.email} helperText={errors.email?.message} />
                )}
              />
            </div>

            {/* Row 3: Password + Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Controller name="password" control={control} 
                  rules={{ 
                    required: "Password is required",
                    minLength: { value: 8, message: "Min 8 chars" },
                    pattern: { 
                      value: /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/, 
                      message: "Must include Uppercase, Lowercase, Number & Symbol" 
                    }
                  }}
                render={({ field }) => (
                  <TextField {...field} type="password" label="Password" size="small" fullWidth error={!!errors.password} helperText={errors.password?.message} />
                )}
              />

               <Controller name="confirmPassword" control={control} 
                  rules={{ 
                    validate: (value) => value === watch('password') || "Passwords do not match"
                  }}
                render={({ field }) => (
                  <TextField {...field} type="password" label="Confirm Password" size="small" fullWidth error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
                )}
              />
            </div>

            {/* Terms */}
            <FormControlLabel 
              control={<Checkbox size="small" />} 
              label={<span className="text-xs text-gray-500">By signing up you agree to our terms.</span>} 
              className="mt-1"
            />

            {/* Submit button */}
            <div className="mt-2">
              <Button type="submit" fullWidth variant="contained" className="!bg-[#5664d2] !normal-case !py-2.5 !rounded-lg" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit"/> : "Register"}
              </Button>
            </div>
            
            {/* Login link */}
            <div className="text-center text-sm mt-3">
              Already have an account? <Link to="/login" className="font-bold text-blue-600">Login</Link>
            </div>
            
            <div id="recaptcha-container"></div>
          </form>
        </div>
      </div>

      {/* OTP MODAL */}
      <Dialog open={openOtp} onClose={() => setOpenOtp(false)} maxWidth="sm" fullWidth PaperProps={{ className: "!rounded-xl !p-2" }}>
        <DialogContent>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold">Great, almost done!</h3>
              <p className="text-sm text-gray-500">Please verify your mobile number</p>
            </div>
            <CloseIcon onClick={() => setOpenOtp(false)} className="cursor-pointer text-gray-400 hover:text-gray-600" />
          </div>

          {/* Green Box: Email Info */}
          <div className="bg-[#e8f5e9] p-4 rounded-lg flex items-center mb-4">
            <EmailIcon className="text-[#2e7d32] mr-3 text-3xl" />
            <p className="text-sm text-gray-700">A verification link has been sent to your email. Please check your inbox and verify.</p>
          </div>

          {/* Pink Box: SMS Info */}
          <div className="bg-[#fff0f3] p-4 rounded-lg flex items-center mb-6">
            <SmsIcon className="text-[#d81b60] mr-3 text-3xl" />
            <p className="text-sm font-bold text-gray-800">
               Enter the One Time Password (OTP) which has been sent to ({registeredMobile})
            </p>
          </div>

          <TextField 
            fullWidth 
            placeholder="Enter Your OTP Here" 
            variant="outlined" 
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="!bg-gray-50 !rounded-md"
            InputProps={{ className: "!rounded-lg" }}
          />

          <div className="mt-2 mb-6">
             <span className="text-xs text-blue-600 cursor-pointer hover:underline">Didn't receive OTP? Resend OTP</span>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outlined" color="inherit" onClick={() => setOpenOtp(false)} className="!rounded-full !px-8 !border-gray-300">
              Close
            </Button>
            <Button variant="contained" onClick={verifyOtp} className="!bg-[#5664d2] !rounded-full !px-8">
              Verify Mobile
            </Button>
          </div>

        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Register;