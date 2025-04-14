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
        navigate('/');
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
        <div className="w-full max-w-[450px] sm:w-[450px] p-3 flex flex-col gap-5">
          <div className="text-center mb-1">
            <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
            <p className="text-gray-600 dark:text-gray-400">Sign in to continue</p>
          </div>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div>
              <Label value="Your Email" className="block" />
              <TextInput 
                type="email" 
                placeholder="name@mail.com" 
                id="email" 
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value="Your Password" className="block" />
              <TextInput 
                type="password" 
                placeholder="**********" 
                id="password" 
                onChange={handleChange}
              />
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
            <OAuth />
            <FOAuth />
          </form>

          <div className="flex gap-2 text-sm mt-3 justify-center">
            <span>don&apos;t Have an account?</span>
            <Link to='/sign-up' className="text-blue-500">
              Sign Up
            </Link>
          </div>
          {errorMessage && (
            <Alert className="mt-5" color="failure">
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
