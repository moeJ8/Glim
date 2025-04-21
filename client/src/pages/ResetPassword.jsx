import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { HiInformationCircle } from 'react-icons/hi';

export default function ResetPassword() {
  const { userId, token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Redirect to sign-in page after success and countdown
    let timer;
    if (success && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (success && countdown === 0) {
      navigate('/sign-in');
    }
    return () => clearTimeout(timer);
  }, [success, countdown, navigate]);

  // Clear error messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`/api/auth/reset-password/${userId}/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
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
          <h1 className='text-3xl font-bold'>Reset Your Password</h1>
          <p className='text-sm mt-2'>
            Enter your new password below
          </p>
        </div>
        
        {error && (
          <Alert color='failure' icon={HiInformationCircle}>
            <span className='font-medium'>{error}</span>
          </Alert>
        )}
        
        {success && (
          <Alert color='success' icon={HiInformationCircle}>
            <span className='font-medium'>
              {success} Redirecting to sign in page in {countdown} seconds...
            </span>
          </Alert>
        )}
        
        {!success && (
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div>
              <Label value='New Password' />
              <TextInput
                type='password'
                placeholder='••••••••'
                id='newPassword'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            
            <div>
              <Label value='Confirm Password' />
              <TextInput
                type='password'
                placeholder='••••••••'
                id='confirmPassword'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                'Reset Password'
              )}
            </Button>
          </form>
        )}
        
        <div className='flex gap-2 text-sm mt-5 justify-center'>
          <span>Remember your password?</span>
          <Link to='/sign-in' className='text-blue-500 hover:underline'>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
} 