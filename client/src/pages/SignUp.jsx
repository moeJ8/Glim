import { Label, TextInput, Button, Spinner } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from 'react';
import OAuth from "../components/OAuth";
import FOAuth from "../components/FOAuth";
import GlimSignInImage from "../assets/GlimSignIn.jpg";
import CustomAlert from "../components/CustomAlert";

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { id, value } = e.target;
    let trimmedValue = value.trim(); // Trims the input
    
    // Custom email validation
    if (id === 'email') {
      if (trimmedValue && !trimmedValue.includes('@')) {
        setEmailError("Please include an '@' in the email address.");
      } else {
        setEmailError(null);
      }
    }
  
    setFormData((prev) => ({
      ...prev,
      [id]: trimmedValue,
    }));
  
    // Optional: Force update input field value in real-time
    e.target.value = trimmedValue;
  };
  
  const handleDateChange = (e) => {
    const birthDate = new Date(e.target.value);
    const today = new Date();
    
    // Calculate age by comparing year, month, and day
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 13) {
      setDateError('You must be at least 13 years old to register');
    } else {
      setDateError(null);
      handleChange(e);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page refresh
    
    // Custom validation
    if (dateError) {
      return setErrorMessage('You must be at least 13 years old to register');
    }
    
    if (emailError) {
      return setErrorMessage(emailError);
    }
    
    // Validate email format
    if (formData.email && !validateEmail(formData.email)) {
      return setErrorMessage('Please enter a valid email address');
    }
    
    if(!formData.username || !formData.password || !formData.email || !formData.dateOfBirth){
      return setErrorMessage('Please fill out all fields');
    }
    
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch('api/auth/signup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData), // send formData as JSON
      });
      const data = await res.json();
      if(data.success === false){
        return setErrorMessage(data.message);
      } 
      setLoading(false);
      if(res.ok){
        navigate('/sign-in');
      }

    } catch (err) {
      setErrorMessage(err.message);
      setLoading(false);
    }
  }
  
  // Email validation function
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  // Calculate max date (13 years ago from today)
  const calculateMaxDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 13);
    return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Form Section */}
      <div className="flex-[1.3] flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-[450px] sm:w-[450px] p-3 flex flex-col gap-3">
          
          <div className="text-center mb-0">
            <h2 className="text-2xl font-bold mb-1">Become a Member</h2>
            <p className="text-gray-600 dark:text-gray-400">Create your account</p>
          </div>
          
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <div>
              <Label value="Your Username" className="block" />
              <TextInput type="text" placeholder="Username" id="username" onChange={handleChange}/>
            </div>
            <div>
              <Label value="Your Email" className="block" />
              <TextInput 
                type="text" 
                placeholder="name@mail.com" 
                id="email" 
                onChange={handleChange}
              />
              {emailError && (
                <CustomAlert message={emailError} type="error" size="sm" className="mt-1" />
              )}
            </div>
            <div>
              <Label value="Your Password" className="block" />
              <TextInput type="password" placeholder="Password" id="password" onChange={handleChange}/>
            </div>
            <div>
              <Label value="Date of Birth" className="block" />
              <TextInput 
                type="date" 
                id="dateOfBirth" 
                onChange={handleDateChange}
                max={calculateMaxDate()}
              />
              {dateError && (
                <CustomAlert message={dateError} type="error" size="sm" className="mt-1" />
              )}
              <p className="text-xs text-gray-500 mt-1">You must be at least 13 years old to register</p>
            </div>
            <Button gradientDuoTone="purpleToPink" type="submit" disabled={loading || dateError || emailError}>
              {
                loading ? <> <Spinner size="sm"/> <span className="pl-3">Loading...</span></> : 'Sign Up'
              }
            </Button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <OAuth />
              <FOAuth />
            </div>
          </form>

          <div className="flex gap-2 text-sm justify-center">
            <span>Have an account?</span>
            <Link to='/sign-in' className="text-blue-500">
              Sign In
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
  )
}
