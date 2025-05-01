import { Button, Spinner } from "flowbite-react";
import { AiFillGoogleCircle } from "react-icons/ai";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, getAuth } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function OAuth() {
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
    
    const processAuthResult = async (resultFromGoogle) => {
      try {
        // Add a slight delay to allow UI to catch up
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: resultFromGoogle.user.displayName,
            email: resultFromGoogle.user.email,
            googlePhotoUrl: resultFromGoogle.user.photoURL,
          }),
        });
        
        const data = await res.json();
        if(res.ok){
          dispatch(signInSuccess(data));
          // Add a slight delay before navigation
          setTimeout(() => {
            if (data.isAdmin) {
              navigate('/dashboard?tab=dashboard');
            } else {
              navigate('/');
            }
            setLoading(false);
          }, 500);
        }
      } catch (error) {
        console.error("Google auth error:", error);
        setLoading(false);
      }
    };
    
    const handleGoogleClick = async() => {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      try {
        // Use redirect for mobile devices, popup for desktop
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
          // For mobile, use redirect (this will navigate away and come back)
          await signInWithRedirect(auth, provider);
          // Code after this point won't execute until redirect completes and user returns
        } else {
          // For desktop, use popup
          const resultFromGoogle = await signInWithPopup(auth, provider);
          await processAuthResult(resultFromGoogle);
        }
      } catch (error) {
        console.error("Google login error:", error);
        setLoading(false);
      }
    };
    
  return (
    <Button type="button" gradientDuoTone="pinkToOrange" outline onClick={handleGoogleClick} disabled={loading}>
      <div className="flex items-center justify-center">
        {loading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            <span className="text-xs">Signing in...</span>
          </>
        ) : (
          <>
            <AiFillGoogleCircle size={20} className="mr-2" />
            <span className="text-xs">Continue with Google</span>
          </>
        )}
      </div>
    </Button>
  )
}