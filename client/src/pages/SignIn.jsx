import { Label, TextInput, Button, Spinner } from "flowbite-react";
import {Link, useNavigate} from "react-router-dom";
import { useState, useEffect } from 'react';
import {signInStart,signInSuccess,signInFailure} from "../redux/user/userSlice";
import {useDispatch, useSelector} from "react-redux";
import OAuth from "../components/OAuth";
import FOAuth from "../components/FOAuth";
import GlimSignInImage from "../assets/GlimSignIn.jpg";
import CustomAlert from "../components/CustomAlert";
import PasswordInput from "../components/PasswordInput";

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const [emailError, setEmailError] = useState(null);
  const {loading, error: errorMessage} = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Clear session expired flag if it exists
  useEffect(() => {
    localStorage.removeItem('sessionExpired');
  }, []);
  
  const handleChange = (e) => {
    const { id, value } = e.target;
    let trimmedValue = value.trim(); // Trims the input
    
    // Custom email validation for the email field
    if (id === 'email' && trimmedValue.includes('@')) {
      // Check if it looks like an email (basic validation)
      if (!validateEmail(trimmedValue)) {
        setEmailError("Please enter a valid email address.");
      } else {
        setEmailError(null);
      }
    } else if (id === 'email') {
      // If it doesn't have @, assume it's a username
      setEmailError(null);
    }
  
    setFormData((prev) => ({
      ...prev,
      [id]: trimmedValue,
    }));
  
    // Optional: Force update input field value in real-time
    e.target.value = trimmedValue;
  };
  
  // Email validation function
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page refresh
    
    if (emailError) {
      return dispatch(signInFailure(emailError));
    }
    
    if (!formData.password || !formData.email) {
      return dispatch(signInFailure('Please fill out all fields'));
    }
    
    try {
      dispatch(signInStart());
      const res = await fetch('api/auth/signin', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData), // send formData as JSON
      });
      const data = await res.json();
      if(data.success === false){
       dispatch(signInFailure(data.message));
      } 
      if(res.ok){
        dispatch(signInSuccess(data));
        if (data.isAdmin) {
          navigate('/dashboard?tab=dashboard');
        } else {
          navigate('/');
        }
      }

    } catch (err) {
     dispatch(signInFailure(err.message));
    }
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      
      {/* Form Section */} 
      <div className="flex-[1.3] flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-[450px] sm:w-[450px] p-3 flex flex-col gap-3">
          <div className="text-center mb-0">
            <h2 className="text-2xl font-bold mb-1">Welcome Back!</h2>
            <p className="text-gray-600 dark:text-gray-400">Sign in to continue</p>
          </div>
          
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <div>
              <Label value="Email or Username" className="block" />
              <TextInput 
                type="text"
                placeholder="user@mail.com" 
                id="email"
                onChange={handleChange}
              />
              {emailError && (
                <CustomAlert message={emailError} type="error" size="sm" className="mt-1" />
              )}
            </div>
            <div>
              <Label value="Password" className="block" />
              <PasswordInput 
                placeholder="Password" 
                id="password" 
                onChange={handleChange}
              />
              <div className="flex justify-end mt-0.5">
                <Link to="/request-password-reset" className="text-xs text-blue-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
            <Button 
              gradientDuoTone="purpleToPink" 
              type="submit" 
              disabled={loading || emailError}
            >
              {
                loading ? <> <Spinner size="sm"/> <span className="pl-3">Loading...</span></> : 'Sign In'
              }
            </Button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <OAuth />
              <FOAuth />
            </div>
          </form>

          <div className="flex gap-2 text-sm justify-center">
            <span>don&apos;t Have an account?</span>
            <Link to='/sign-up' className="text-blue-500">
              Sign Up
            </Link>
          </div>
          {errorMessage && (
            <CustomAlert message={errorMessage} type="error" className="mt-2" />
          )}
        </div>
      </div>

      {/* Image Section */}
      <div className="flex-[1.1] relative hidden md:block">
        <img 
          src={GlimSignInImage} 
          alt="Artist painting" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
