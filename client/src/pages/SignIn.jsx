import { Label, TextInput, Button, Alert, Spinner } from "flowbite-react";
import {Link, useNavigate} from "react-router-dom";
import { useState } from 'react';
import {signInStart,signInSuccess,signInFailure} from "../redux/user/userSlice";
import {useDispatch, useSelector} from "react-redux";
import OAuth from "../components/OAuth";
import FOAuth from "../components/FOAuth";
import GlimSignInImage from "../assets/GlimSignIn.jpg";

export default function SignIn() {
  const [formData, setFormData] = useState({});
  //const [errorMessage, setErrorMessage] = useState(null);
  //const [loading, setLoading] = useState(false);
  const {loading, error: errorMessage} = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleChange = (e) => {
    let value = e.target.value.trim(); // Trims the input
  
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: value,
    }));
  
    // Optional: Force update input field value in real-time
    e.target.value = value;
  };
  const handleSubmit = async (e) => {
    e.preventDefault() // prevent page refresh
    if( !formData.password || !formData.email){
     // return setErrorMessage('Please fill out all fields');'
     return dispatch(signInFailure('Please fill out all fields'));
    }
    try {
      //setLoading(true);
      //setErrorMessage(null);
      dispatch(signInStart());
      const res = await fetch('api/auth/signin', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData), // send formData as JSON
      });
      const data = await res.json();
      if(data.success === false){
       // return setErrorMessage(data.message);
       dispatch(signInFailure(data.message));
      } 
      //setLoading(false);
      if(res.ok){
        dispatch(signInSuccess(data));
        if (data.isAdmin) {
          navigate('/dashboard?tab=dashboard');
        } else {
          navigate('/');
        }
      }

    } catch (err) {
     // setErrorMessage(err.message);
     // setLoading(false);
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
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label value="Email or Username" className="block" />
              <TextInput 
                type="text"
                placeholder="user@mail.com" 
                id="email"
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value="Password" className="block" />
              <TextInput 
                type="password" 
                placeholder="**********" 
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
              disabled={loading}
              
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
            <Alert className="mt-2" color="failure">
              {errorMessage}
            </Alert>
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
