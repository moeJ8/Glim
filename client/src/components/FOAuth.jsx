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
    
    // Chrome detection
    const isChromeMobile = /Android.*Chrome|Chrome.*Mobile/i.test(navigator.userAgent);
    
    // Handle redirect result when component mounts
    useEffect(() => {
      // Set a flag in sessionStorage to track authentication attempts
      const authInProgress = sessionStorage.getItem('fbAuthInProgress');
      
      const checkRedirectResult = async () => {
        try {
          // Add an initial delay for Chrome mobile
          if (isChromeMobile) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          const result = await getRedirectResult(auth);
          
          if (result) {
            setLoading(true);
            await processAuthResult(result);
            // Clear the auth in progress flag
            sessionStorage.removeItem('fbAuthInProgress');
          } else if (authInProgress) {
            // If we had a redirect but no result, something went wrong
            console.error("Redirect completed but no result found");
            sessionStorage.removeItem('fbAuthInProgress');
            setLoading(false);
          }
        } catch (error) {
          console.error("Redirect result error:", error);
          sessionStorage.removeItem('fbAuthInProgress');
          setLoading(false);
        }
      };
      
      checkRedirectResult();
      
      // Cleanup function
      return () => {
        if (!loading) {
          sessionStorage.removeItem('fbAuthInProgress');
        }
      };
    }, [auth, isChromeMobile]);
    
    const processAuthResult = async (resultFromFacebook) => {
      try {
        // Add a longer delay for Chrome mobile
        const delayTime = isChromeMobile ? 1500 : 800;
        await new Promise(resolve => setTimeout(resolve, delayTime));
        
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
          
          // Add an even longer delay before navigation for Chrome mobile
          const navigationDelay = isChromeMobile ? 2000 : 800;
          
          setTimeout(() => {
            if (data.isAdmin) {
              navigate('/dashboard?tab=dashboard');
            } else {
              navigate('/');
            }
            setLoading(false);
          }, navigationDelay);
        } else {
          console.error("Server response not OK:", data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Facebook auth error:", error);
        setLoading(false);
      }
    };

    const handleFacebookClick = async() => {
      setLoading(true);
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      provider.addScope('public_profile');
      
      try {
        // Use redirect for mobile devices, popup for desktop
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
          // Set a flag in sessionStorage to track the auth attempt
          sessionStorage.setItem('fbAuthInProgress', 'true');
          
          // For Chrome mobile, add extra parameters
          if (isChromeMobile) {
            provider.setCustomParameters({
              'display': 'popup',
              'auth_type': 'rerequest',
              'prompt': 'select_account'
            });
          }
          
          // For mobile, use redirect (this will navigate away and come back)
          await signInWithRedirect(auth, provider);
          // Code after this point won't execute until redirect completes and user returns
        } else {
          // For desktop, use popup
          const resultFromFacebook = await signInWithPopup(auth, provider);
          await processAuthResult(resultFromFacebook);
        }
      } catch (error) {
        console.error("Facebook login error:", error);
        sessionStorage.removeItem('fbAuthInProgress');
        setLoading(false);
      }
    };

  return (
    <Button type="button" className="bg-gradient-to-r from-pink-500 to-blue-500 text-white" outline onClick={handleFacebookClick} disabled={loading}>
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
