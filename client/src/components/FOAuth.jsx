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
    
    // Chrome detection - more specific Chrome mobile detection
    const isChromeMobile = /Android.*Chrome|Chrome.*Mobile/i.test(navigator.userAgent) &&
                           !/OPR|Opera|Brave|Edge|Firefox/i.test(navigator.userAgent);
    
    // Set up FB SDK
    useEffect(() => {
      // Only load Facebook SDK if it hasn't been loaded already
      if (!window.FB) {
        // Create script element
        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        document.body.appendChild(script);
        
        // Initialize FB SDK
        window.fbAsyncInit = function() {
          window.FB.init({
            appId: import.meta.env.VITE_FACEBOOK_APP_ID || '949489573472137', // Use your Facebook App ID
            cookie: true,
            xfbml: true,
            version: 'v18.0'
          });
        };
      }
    }, []);
    
    // Check for pending Facebook auth on component mount
    useEffect(() => {
      const checkPendingAuth = async () => {
        const pendingAuth = localStorage.getItem('fbPendingAuth');
        
        if (pendingAuth) {
          try {
            setLoading(true);
            
            // Parse the stored auth data
            const authData = JSON.parse(pendingAuth);
            
            // Call your backend API with the Facebook data
            await processStoredAuthData(authData);
            
            // Clear the pending auth flag
            localStorage.removeItem('fbPendingAuth');
          } catch (error) {
            console.error("Error processing stored Facebook auth:", error);
            localStorage.removeItem('fbPendingAuth');
            setLoading(false);
          }
        }
      };
      
      checkPendingAuth();
    }, []);
    
    // Handle redirect result from Firebase for non-Chrome mobile browsers
    useEffect(() => {
      if (!isChromeMobile) {
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
      }
    }, [auth, isChromeMobile]);
    
    // Process auth data from Facebook JavaScript SDK
    const processStoredAuthData = async (authData) => {
      try {
        const res = await fetch('/api/auth/facebook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: authData.name,
            email: authData.email,
            facebookPhotoUrl: authData.picture?.data?.url || null,
          }),
        });
        
        const data = await res.json();
        if (res.ok) {
          dispatch(signInSuccess(data));
          
          setTimeout(() => {
            if (data.isAdmin) {
              navigate('/dashboard?tab=dashboard');
            } else {
              navigate('/');
            }
            setLoading(false);
          }, 500);
        } else {
          console.error("Server response error:", data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Facebook auth processing error:", error);
        setLoading(false);
      }
    };
    
    // Process Firebase auth result (for non-Chrome mobile)
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
          
          setTimeout(() => {
            if (data.isAdmin) {
              navigate('/dashboard?tab=dashboard');
            } else {
              navigate('/');
            }
            setLoading(false);
          }, 800);
        } else {
          console.error("Server response not OK:", data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Facebook auth error:", error);
        setLoading(false);
      }
    };

    // Handle Facebook login via JavaScript SDK (for Chrome mobile)
    const handleFacebookJSLogin = () => {
      if (!window.FB) {
        console.error("Facebook SDK not loaded");
        setLoading(false);
        return;
      }
      
      window.FB.login(function(response) {
        if (response.authResponse) {
          // Get user details
          window.FB.api('/me', {fields: 'name,email,picture'}, function(userInfo) {
            // Store auth data in localStorage
            localStorage.setItem('fbPendingAuth', JSON.stringify({
              name: userInfo.name,
              email: userInfo.email,
              picture: userInfo.picture
            }));
            
            // Reload the page to process the stored auth
            window.location.reload();
          });
        } else {
          console.log('User cancelled login or did not fully authorize.');
          setLoading(false);
        }
      }, {scope: 'email,public_profile'});
    };

    const handleFacebookClick = async() => {
      setLoading(true);
      
      // For Chrome mobile, use the Facebook JS SDK approach
      if (isChromeMobile) {
        handleFacebookJSLogin();
        return;
      }
      
      // For all other browsers, use the Firebase approach
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      provider.addScope('public_profile');
      
      try {
        // Use redirect for mobile devices, popup for desktop
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
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
