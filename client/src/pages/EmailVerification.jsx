import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateSuccess } from '../redux/user/userSlice';
import { Alert, Spinner, Button } from 'flowbite-react';

export default function EmailVerification() {
  const { userId, token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.user);
  
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(`/api/auth/${userId}/verify/${token}`);
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.message || 'Verification failed');
        } else {
          setSuccess(true);
          
          // Set success message based on verification status
          const successMessage = data.alreadyVerified 
            ? 'Your email was already verified!'
            : 'Your email has been verified successfully!';
          
          // Store the message in state for display
          setVerificationMessage(successMessage);
          
          // Check if the user is already logged in
          if (currentUser && currentUser._id === userId) {
            dispatch(updateSuccess({ ...currentUser, verified: true }));
            
            // Automatically redirect to dashboard after 3 seconds
            setTimeout(() => {
              navigate('/dashboard?tab=profile&verified=success');
            }, 3000);
          }
        }
      } catch (err) {
        setError(err.message || 'An error occurred during verification');
      } finally {
        setLoading(false);
      }
    };
    
    verifyEmail();
  }, [userId, token, navigate, dispatch, currentUser]);
  
  // Handle navigation based on login state
  const handleContinue = () => {
    if (currentUser) {
      navigate('/dashboard?tab=profile');
    } else {
      navigate('/sign-in');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-6">Email Verification</h1>
        
        {loading && (
          <div className="flex justify-center my-8">
            <Spinner size="xl" />
          </div>
        )}
        
        {error && (
          <div>
            <Alert color="failure" className="mb-4">
              {error}
            </Alert>
            <div className="mt-6">
              <Button onClick={() => navigate('/sign-in')} gradientDuoTone="purpleToBlue">
                Go to Sign In
              </Button>
            </div>
          </div>
        )}
        
        {success && (
          <div>
            <Alert color="success" className="mb-4">
              {verificationMessage}
            </Alert>
            
            {currentUser && currentUser._id === userId ? (
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                Redirecting to your profile...
              </p>
            ) : (
              <div className="mt-6">
                <Button onClick={handleContinue} gradientDuoTone="purpleToBlue">
                  {currentUser ? 'Go to Dashboard' : 'Sign In'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 