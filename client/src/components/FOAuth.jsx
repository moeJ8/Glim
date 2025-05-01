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
    
    // Detect Chrome on mobile
    const isChromeMobile = /Android.*Chrome|Chrome.*Mobile/i.test(navigator.userAgent) &&
                         !/OPR|Opera|Brave|Edge|Firefox/i.test(navigator.userAgent);
    
    // Handle redirect result when component mounts
    useEffect(() => {
      const checkRedirectResult = async () => {
        try {
          // Add delay for Chrome mobile
          if (isChromeMobile) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
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
    }, [auth, isChromeMobile]);
    
    const processAuthResult = async (resultFromFacebook) => {
      try {
        // Add a delay to allow UI to catch up
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
          // Add a delay before navigation
          const navigationDelay = isChromeMobile ? 1500 : 800;
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
      
      // Different approach for Chrome mobile vs other browsers
      try {
        // Use popup for all browsers including mobile Chrome
        // This approach helps avoid the redirect issues on Chrome mobile
        if (isChromeMobile) {
          provider.setCustomParameters({
            // Force use of Facebook mobile login UI
            display: 'touch',
            // Force reauthentication
            auth_type: 'reauthenticate',
            // Maximum permissions
            response_type: 'token,signed_request',
          });
          
          // Use popup for Chrome mobile
          const resultFromFacebook = await signInWithPopup(auth, provider);
          await processAuthResult(resultFromFacebook);
        } else {
          // For other mobile browsers, use redirect
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          
          if (isMobile && !isChromeMobile) {
            await signInWithRedirect(auth, provider);
            // Code after this point won't execute until redirect completes and user returns
          } else {
            // For desktop, use popup
            const resultFromFacebook = await signInWithPopup(auth, provider);
            await processAuthResult(resultFromFacebook);
          }
        }
      } catch (error) {
        console.error("Facebook login error:", error);
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
