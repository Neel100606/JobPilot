import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, CircularProgress } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice'; 
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', data);
      
      dispatch(setCredentials({
        user: response.data.user,
        token: response.data.token
      }));

      toast.success("Login Successful!");
      navigate('/dashboard'); 

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4">
      
      {/* CARD */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
        
        {/* LEFT SIDE */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#d4a5ff] to-[#755eea] items-center justify-center p-10 text-white">
          <div className="space-y-4 max-w-xs">
            <h2 className="text-3xl font-extrabold leading-tight">
              Welcome back, recruiter
            </h2>
            <p className="text-sm text-white/80">
              Log in to manage your postings, review applications and connect with top talent.
            </p>
            <ul className="text-xs space-y-1 text-white/80">
              <li>• View and track candidates</li>
              <li>• Edit and repost job listings</li>
              <li>• Collaborate with your hiring team</li>
            </ul>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
          
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 text-center md:text-left">
              Login as a Company
            </h2>
            <p className="text-sm text-gray-500 mt-1 text-center md:text-left">
              Access your dashboard and continue hiring.
            </p>
          </div>
          
          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 flex flex-col gap-2">
            
            <Controller
              name="email"
              control={control}
              rules={{ required: "Required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email ID"
                  size="small"
                  fullWidth
                  error={!!errors.email}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={{ required: "Required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="password"
                  label="Enter your password"
                  size="small"
                  fullWidth
                  error={!!errors.password}
                />
              )}
            />

            {/* Actions */}
            <div className="flex justify-between items-center text-xs mt-1">
              <button type="button" className="text-blue-600 hover:underline">
                Login with OTP
              </button>
              <button type="button" className="text-blue-600 hover:underline">
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="!bg-[#5664d2] !normal-case !py-2.5 !rounded-lg"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
            </Button>
            
            {/* Switch */}
            <div className="text-center text-sm mt-3">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-bold text-blue-600">
                Sign up
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
