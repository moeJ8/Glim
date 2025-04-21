import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { HiInformationCircle } from 'react-icons/hi';

export default function RequestPasswordReset() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Clear alerts after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        if (error) setError(null);
        if (success) setSuccess(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message);
        setLoading(false);
        return;
      }
      
      setSuccess(data.message);
      setLoading(false);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen mt-20 mb-10'>
      <div className='flex flex-col max-w-md mx-auto p-3 gap-5'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold'>Reset Password</h1>
          <p className='text-sm mt-2'>
            Enter your email and we&apos;ll send you a password reset link
          </p>
        </div>
        
        
        
        
        
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div>
            <Label value='Your email' />
            <TextInput
              type='email'
              placeholder='name@company.com'
              id='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <Button
            gradientDuoTone='purpleToPink'
            type='submit'
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size='sm' />
                <span className='pl-3'>Loading...</span>
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>
          {error && (
          <Alert color='failure' icon={HiInformationCircle}>
            <span className='font-medium'>{error}</span>
          </Alert>
        )}
          {success && (
          <Alert color='success' icon={HiInformationCircle}>
            <span className='font-medium'>{success}</span>
          </Alert>
        )}
        </form>
        
        <div className='flex gap-2 text-sm justify-center'>
          <span>Remember your password?</span>
          <Link to='/sign-in' className='text-blue-500 hover:underline'>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
} 