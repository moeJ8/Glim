import { Button, Spinner } from "flowbite-react"
import { AiFillFacebook } from "react-icons/ai"
import { app } from "../firebase";
import { FacebookAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signInSuccess } from "../redux/user/userSlice";
import { useState } from "react";

export default function FOAuth() {
    const auth = getAuth(app);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleFacebookClick = async() => {
      setLoading(true);
      
      try {
        // Create Facebook provider with explicit scopes
        const provider = new FacebookAuthProvider();
        provider.addScope('email');
        provider.addScope('public_profile');
        
        // Set consistent parameters for all devices
        provider.setCustomParameters({
          // Force authentication prompt
          auth_type: 'reauthenticate',
          // Use touch-optimized UI for all devices
          display: 'popup'
        });
        
        // Use signInWithPopup for all platforms - more reliable than redirect
        const result = await signInWithPopup(auth, provider);
        
        // Process login on backend
        const res = await fetch('/api/auth/facebook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: result.user.displayName,
            email: result.user.email,
            facebookPhotoUrl: result.user.photoURL,
          }),
        });
        
        const data = await res.json();
        
        if(res.ok) {
          dispatch(signInSuccess(data));
          
          // Navigate to appropriate page
          if (data.isAdmin) {
            navigate('/dashboard?tab=dashboard');
          } else {
            navigate('/');
          }
        } else {
          console.error("Server response error:", data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Facebook login error:", error);
        setLoading(false);
      }
    };

    return (
      <Button 
        type="button" 
        className="bg-gradient-to-r from-pink-500 to-blue-500 text-white" 
        outline 
        onClick={handleFacebookClick} 
        disabled={loading}
      >
        <div className="flex items-center justify-center">
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              <span className="text-xs">Signing in...</span>
            </>
          ) : (
            <>
              <AiFillFacebook size={20} className="mr-2 ml-3 sm:ml-0" />
              <span className="text-xs">Continue with Facebook</span>
            </>
          )}
        </div>
      </Button>
    )
} 
