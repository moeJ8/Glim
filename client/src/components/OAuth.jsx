import { Button } from "flowbite-react";
import { AiFillGoogleCircle } from "react-icons/ai";
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, getAuth } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function OAuth() {
    const auth = getAuth(app);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
      const checkRedirectResult = async () => {
        try {
          const result = await getRedirectResult(auth);
          if (result) {
            const res = await fetch('/api/auth/google', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: result.user.displayName,
                email: result.user.email,
                googlePhotoUrl: result.user.photoURL,
              }),
            });
            
            const data = await res.json();
            if(res.ok){
              dispatch(signInSuccess(data))
              if (data.isAdmin) {
                navigate('/dashboard?tab=dashboard');
              } else {
                navigate('/');
              }
            }
          }
        } catch (error) {
          console.log(error);
        }
      };

      checkRedirectResult();
    }, [auth, dispatch, navigate]);

  const handleGoogleClick = async() => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account"
      });
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.log(error);
    }
  }
  
  return (
    <Button type="button" gradientDuoTone="pinkToOrange" outline onClick={handleGoogleClick}>
      <div className="flex items-center justify-center">
        <AiFillGoogleCircle size={20} className="mr-2" />
        <span className="text-xs">Continue with Google</span>
      </div>
    </Button>
  )
}