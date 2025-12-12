import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem, Select, FormControl, InputLabel,
  Grid, Divider, Tab, Tabs, IconButton, Avatar
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux'; // <--- Added useDispatch
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice'; // <--- Import logout action

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined'; 
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'; 
import DeleteIcon from '@mui/icons-material/Delete';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PublicIcon from '@mui/icons-material/Public'; 
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// --- COMPONENTS ---

// 1. Top Navigation Strip
const TopNavStrip = () => (
  <div className="bg-[#F1F2F4] border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between text-sm text-gray-600">
      <div className="flex gap-6">
        <a href="#" className="hover:text-blue-600">Home</a>
        <a href="#" className="hover:text-blue-600">Find Candidate</a>
        <a href="#" className="text-blue-600 font-medium">Dashboard</a>
        <a href="#" className="hover:text-blue-600">My Jobs</a>
        <a href="#" className="hover:text-blue-600">Applications</a>
        <a href="#" className="hover:text-blue-600">Customer Supports</a>
      </div>
      <div className="flex gap-6 items-center">
        <div className="flex items-center gap-1">
          <PhoneInTalkOutlinedIcon fontSize="small" />
          <span>+1-202-555-0178</span>
        </div>
        <div className="flex items-center gap-1 cursor-pointer">
          <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-5" />
          <span>English</span>
        </div>
      </div>
    </div>
  </div>
);

// 2. Main Logo Header
const MainHeader = () => (
  <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-lg">
           <WorkOutlineIcon sx={{ color: 'white' }} />
        </div>
        <span className="text-xl font-bold text-gray-900">Jobpilot</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <IconButton>
          <NotificationsNoneOutlinedIcon />
        </IconButton>
        <Button variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }}>
          Post A Job
        </Button>
        <Avatar src="/path-to-avatar.jpg" sx={{ width: 40, height: 40, bgcolor: 'orange' }} />
      </div>
    </div>
  </div>
);

// 3. Sidebar Item
const SidebarItem = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 mb-1 cursor-pointer transition-colors border-l-4 ${
      active 
        ? 'bg-blue-50 border-blue-600 text-blue-600' 
        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    {React.cloneElement(icon, { fontSize: "small", color: active ? "primary" : "inherit" })}
    <span className="text-sm font-medium">{label}</span>
  </div>
);

// --- MAIN PAGE COMPONENT ---
const Settings = () => {
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch(); // <--- Initialize dispatch
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      company_name: '', description: '', industry: '', founded_date: '',
      website: '', social_links: { facebook: '', twitter: '', instagram: '', youtube: '' },
      phone: '', email: '', address: ''
    }
  });

  // Handle Logout Logic
  const handleLogout = () => {
    dispatch(logout()); // Clear Redux state & LocalStorage
    navigate('/login'); // Redirect to login page
  };

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get('http://localhost:5000/api/company/profile', config);
        const company = data.data;

        setValue('company_name', company.company_name);
        setValue('description', company.description);
        setValue('industry', company.industry);
        setValue('founded_date', company.founded_date ? company.founded_date.split('T')[0] : '');
        setValue('website', company.website);
        setValue('address', company.address);
        if (company.social_links) setValue('social_links', company.social_links);
        
        setLogoPreview(company.logo_url);
        setBannerPreview(company.banner_url);
        
        // User info is read-only
        setValue('email', user?.email);
        setValue('phone', user?.mobile_no);
      } catch (err) {
        console.error("Fetch error", err);
        if (err.response?.status === 404) navigate('/setup');
      }
    };
    if (token) fetchData();
  }, [token, setValue, user, navigate]);

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append(type, file);
    
    const objectUrl = URL.createObjectURL(file);
    if (type === 'logo') setLogoPreview(objectUrl);
    else setBannerPreview(objectUrl);

    try {
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
      await axios.post(`http://localhost:5000/api/company/upload-${type}`, formData, config);
      toast.success(`${type} updated!`);
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put('http://localhost:5000/api/company/profile', data, config);
      toast.success("Profile Updated Successfully!");
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      
      {/* 1. Header Section */}
      <TopNavStrip />
      <MainHeader />

      {/* 2. Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-start gap-8">
        
        {/* --- LEFT SIDEBAR --- */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <Typography variant="caption" className="text-gray-400 font-semibold px-4 mb-4 block tracking-wider">
            EMPLOYERS DASHBOARD
          </Typography>
          
          <div className="flex flex-col gap-1">
            <SidebarItem icon={<DashboardIcon />} label="Overview" onClick={() => navigate('/dashboard')} />
            <SidebarItem icon={<PersonOutlineIcon />} label="Employers Profile" />
            <SidebarItem icon={<CloudUploadOutlinedIcon />} label="Post a Job" />
            <SidebarItem icon={<WorkOutlineIcon />} label="My Jobs" />
            <SidebarItem icon={<BookmarkBorderIcon />} label="Saved Candidate" />
            <SidebarItem icon={<LayersOutlinedIcon />} label="Plans & Billing" />
            <SidebarItem icon={<BusinessOutlinedIcon />} label="All Companies" />
            <SidebarItem icon={<SettingsIcon />} label="Settings" active onClick={() => {}} />
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200">
             {/* Updated Log-out Item */}
             <SidebarItem icon={<LogoutIcon />} label="Log-out" onClick={handleLogout} />
          </div>
        </div>

        {/* --- RIGHT CONTENT AREA --- */}
        <div className="flex-1 bg-white rounded-none md:rounded-xl shadow-sm border border-gray-100 min-h-[600px]">
          
          {/* Settings Title */}
          <div className="p-6 border-b border-gray-100">
             <Typography variant="h6" fontWeight="bold">Settings</Typography>
          </div>

          {/* Custom Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="settings tabs"
              sx={{ 
                '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, minHeight: 60, fontSize: '0.95rem' },
                '& .Mui-selected': { color: '#0A65CC' },
                '& .MuiTabs-indicator': { backgroundColor: '#0A65CC' }
              }}
            >
              <Tab label="Company Info" icon={<PersonOutlineIcon />} iconPosition="start" />
              <Tab label="Founding Info" icon={<PublicIcon />} iconPosition="start" />
              <Tab label="Social Media Profile" icon={<PublicIcon />} iconPosition="start" />
              <Tab label="Account Setting" icon={<SettingsIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Form Content */}
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              
              {/* TAB 1: Company Info */}
              <div className={activeTab === 0 ? "block" : "hidden"}>
                 <Typography variant="h6" gutterBottom className="mb-6">Logo & Banner Image</Typography>
                 <Grid container spacing={4} className="mb-8">
                    <Grid item xs={12} md={4}>
                       <Typography variant="body2" className="mb-2 font-medium">Upload Logo</Typography>
                       <div className="relative w-full aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <CloudUploadIcon className="text-gray-300 text-4xl" />
                          )}
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'logo')} />
                       </div>
                    </Grid>
                    <Grid item xs={12} md={8}>
                       <Typography variant="body2" className="mb-2 font-medium">Banner Image</Typography>
                       <div className="relative w-full h-full min-h-[200px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition">
                          {bannerPreview ? (
                            <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <CloudUploadIcon className="text-gray-300 text-4xl" />
                          )}
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'banner')} />
                       </div>
                    </Grid>
                 </Grid>

                 <div className="space-y-6">
                    <Controller name="company_name" control={control}
                      render={({ field }) => <TextField {...field} label="Company Name" fullWidth />}
                    />
                    <Controller name="description" control={control}
                      render={({ field }) => <TextField {...field} label="About Us" multiline rows={6} fullWidth placeholder="Write down about your company here..." />}
                    />
                 </div>
                 <Button type="submit" variant="contained" sx={{ mt: 4, bgcolor: '#0A65CC', px: 4, py: 1.5 }}>Save Changes</Button>
              </div>

              {/* TAB 2: Founding Info */}
              <div className={activeTab === 1 ? "block" : "hidden"}>
                 <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                       <FormControl fullWidth>
                         <InputLabel>Industry Type</InputLabel>
                         <Controller name="industry" control={control}
                           render={({ field }) => (
                             <Select {...field} label="Industry Type">
                               <MenuItem value="IT">Technology</MenuItem>
                               <MenuItem value="Finance">Finance</MenuItem>
                               <MenuItem value="Health">Healthcare</MenuItem>
                             </Select>
                           )}
                         />
                       </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Controller name="founded_date" control={control}
                        render={({ field }) => <TextField {...field} type="date" label="Year of Establishment" fullWidth InputLabelProps={{ shrink: true }} />}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Controller name="website" control={control}
                        render={({ field }) => <TextField {...field} label="Company Website" fullWidth />}
                      />
                    </Grid>
                 </Grid>
                 <Button type="submit" variant="contained" sx={{ mt: 4, bgcolor: '#0A65CC', px: 4, py: 1.5 }}>Save Changes</Button>
              </div>

              {/* TAB 3: Social Media */}
              <div className={activeTab === 2 ? "block" : "hidden"}>
                 <div className="space-y-4">
                    {['facebook', 'twitter', 'instagram', 'youtube'].map((social) => (
                      <div key={social} className="flex gap-4 items-center">
                        <div className="w-32 capitalize font-medium text-gray-600 flex items-center gap-2">
                           {social === 'facebook' && <FacebookIcon color="primary"/>}
                           {social === 'twitter' && <TwitterIcon color="primary"/>}
                           {social === 'instagram' && <InstagramIcon sx={{color: '#E1306C'}}/>}
                           {social === 'youtube' && <YouTubeIcon color="error"/>}
                           {social}
                        </div>
                        <Controller 
                          name={`social_links.${social}`} 
                          control={control}
                          render={({ field }) => <TextField {...field} label="Profile Link/URL..." fullWidth size="small" />}
                        />
                      </div>
                    ))}
                 </div>
                 <Button type="submit" variant="contained" sx={{ mt: 4, bgcolor: '#0A65CC', px: 4, py: 1.5 }}>Save Changes</Button>
              </div>

              {/* TAB 4: Account Setting */}
              <div className={activeTab === 3 ? "block" : "hidden"}>
                 <Typography variant="h6" className="mb-4">Contact Information</Typography>
                 <div className="space-y-4 mb-8 flex flex-col gap-2">
                    <Controller name="address" control={control}
                      render={({ field }) => <TextField {...field} label="Map Location" fullWidth />}
                    />
                    <Controller name="phone" control={control}
                      render={({ field }) => <TextField {...field} label="Phone Number" fullWidth disabled />}
                    />
                    <Controller name="email" control={control}
                      render={({ field }) => <TextField {...field} label="Email" fullWidth disabled />}
                    />
                 </div>
                 
                 <Divider className="my-8" />
                 
                 <Typography variant="h6" className="mb-4">Delete Company</Typography>
                 <div className="bg-red-50 p-4 rounded-lg flex justify-between items-center border border-red-100">
                    <div>
                       <Typography variant="subtitle2" color="error" fontWeight="bold">Delete Your Account</Typography>
                       <Typography variant="caption" color="textSecondary">If you delete your account, you will lose all data.</Typography>
                    </div>
                    <Button color="error" variant="outlined" startIcon={<DeleteIcon />}>Delete Account</Button>
                 </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;