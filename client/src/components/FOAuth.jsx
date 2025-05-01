import { Button, Spinner } from "flowbite-react"
import { AiFillFacebook } from "react-icons/ai"
import { app } from "../firebase";
import { FacebookAuthProvider, getAuth, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signInSuccess } from "../redux/user/userSlice";
import { useState, useEffect } from "react";

export default function FOAuth() {
    const auth = getAuth(app);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Handle redirect result when component mounts
    useEffect(() => {
      const checkRedirectResult = async () => {
        try {
          const result = await getRedirectResult(auth);
          if (result) {
            setLoading(true);
            await processAuthResult(result);
          }
        } catch (error) {
          console.error("Redirect result error:", error);
          setLoading(false);
        }
      };
      
      checkRedirectResult();
    }, [auth]);
    
    const processAuthResult = async (resultFromFacebook) => {
      try {
        const res = await fetch('/api/auth/facebook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: resultFromFacebook.user.displayName,
            email: resultFromFacebook.user.email,
            facebookPhotoUrl: resultFromFacebook.user.photoURL,
          }),
        });
        
        const data = await res.json();
        if(res.ok){
          dispatch(signInSuccess(data));
          
          if (data.isAdmin) {
            navigate('/dashboard?tab=dashboard');
          } else {
            navigate('/');
          }
          setLoading(false);
        } else {
          console.error("Server response error:", data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Facebook auth error:", error);
        setLoading(false);
      }
    };

    const handleFacebookClick = async() => {
      setLoading(true);
      
      try {
        // Create Facebook provider
        const provider = new FacebookAuthProvider();
        provider.addScope('email');
        provider.addScope('public_profile');
        
        // Detect if on mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
          // Use redirect for mobile devices
          await signInWithRedirect(auth, provider);
          // This will redirect the user away from the app
          // The useEffect above will handle the redirect result when they return
        } else {
          // Use popup for desktop
          const result = await signInWithPopup(auth, provider);
          await processAuthResult(result);
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
