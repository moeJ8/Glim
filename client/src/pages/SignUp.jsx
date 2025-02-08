import { Label, TextInput, Button, Alert, Spinner } from "flowbite-react";
import {Link, useNavigate} from "react-router-dom";
import { useState } from 'react';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
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
    if(!formData.username || !formData.password || !formData.email){
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
  
  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        {/* Left */}
        <div className="flex-1">
        <Link to ="/" className=" font-bold dark:text-white text-4xl">
        <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">Moe&apos;s</span>
        Blog
        </Link>
        <p className="text-sm mt-5 font-semibold dark:text-white">
          You can sign up using any username and password or with your gmail account.
        </p>
        </div>


        {/* Right */}
        <div className="flex-1">

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label value="Your Username" />
              <TextInput type="text" placeholder="Username" id="username" onChange={handleChange}/>
            </div>
            <div>
              <Label value="Your Email" />
              <TextInput type="email" placeholder="name@mail.com" id="email" onChange={handleChange}/>
            </div>
            <div>
              <Label value="Your Password" />
              <TextInput type="password" placeholder="Password" id="password" onChange={handleChange}/>
            </div>
            <Button gradientDuoTone="purpleToPink" type="submit" disabled={loading}>
              {
                loading ? <> <Spinner size="sm"/> <span className="pl-3">Loading...</span></> : 'Sign Up'
              }
            </Button>
          </form>

          <div className="flex gap-2 text-sm mt-5">
            <span>Have an account?</span>
            <Link to='/sign-in' className="text-blue-500">
              Sign In
            </Link>
          </div>
          {
          errorMessage && 
          (<Alert className="mt-5" color="failure">
            {errorMessage}
          </Alert>)}
        </div>
      </div>
    </div>
  )
}
