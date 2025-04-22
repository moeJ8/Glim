import { Button } from "flowbite-react"
import { AiFillFacebook } from "react-icons/ai"
import { app } from "../firebase";
import { FacebookAuthProvider, getAuth, signInWithPopup} from "firebase/auth";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signInSuccess } from "../redux/user/userSlice";

export default function FOAuth() {
    const auth = getAuth(app);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleFacebookClick = async() => {
        // TODO: Implement Facebook OAuth
        const provider = new FacebookAuthProvider();
        provider.setCustomParameters({
          prompt: "select_account"
        });

        try {
            const resultFromFacebook = await signInWithPopup(auth, provider);
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
            }
            )
            const data = await res.json();
            if(res.ok){
              dispatch(signInSuccess(data))
              if (data.isAdmin) {
                navigate('/dashboard?tab=dashboard');
              } else {
                navigate('/')
              }
            }
          } catch (error) {
           console.log(error);
          }
        }

  return (
    <Button type="button" className="bg-gradient-to-r from-pink-500 to-blue-500 text-white" outline onClick={handleFacebookClick}>
      <div className="flex items-center justify-center">
        <AiFillFacebook size={20} className="mr-2 ml-3 sm:ml-0" />
        <span className="text-xs">Continue with Facebook</span>
      </div>
    </Button>
  )
} 
