import { Alert, Button, TextInput, Label } from "flowbite-react"
import { useSelector } from "react-redux"
import { useState, useRef, useEffect } from "react"
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from 'firebase/storage'
import { app } from "../firebase"
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {updateStart, updateSuccess, updateFailure, deleteUserStart, deleteUserSuccess, deleteUserFailure, signoutSuccess} from "../redux/user/userSlice"
import { useDispatch } from "react-redux"
import {HiOutlineExclamationCircle} from "react-icons/hi"
import {FaEye, FaCheckCircle, FaTimesCircle, FaCalendarAlt} from "react-icons/fa"
import { Link, useLocation, useNavigate } from "react-router-dom"
import UserPosts from "./UserPosts"
import UserListModal from "./UserListModal"
import CustomModal from "./CustomModal"

export default function DashProfile() {
    const {currentUser, errormodal, loading} = useSelector(state => state.user)
    const [imageFile, setImageFile] = useState(null);
    const [imageFileUrl, setImageFileUrl] = useState(null);
    const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
    const [imageFileUploadError, setImageFileUploadError] = useState(null);
    const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
    const [updateUserError, setUpdateUserError] = useState(null);
    const [formData, setFormData] = useState({});
    const [imageFileUploading, setImageFileUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const filePickerRef = useRef(null);
    const dispatch = useDispatch()
    const [sendingVerification, setSendingVerification] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [loadingFollowers, setLoadingFollowers] = useState(false);
    const [loadingFollowing, setLoadingFollowing] = useState(false);
    
    // Check for verification success in URL
    useEffect(() => {
      const queryParams = new URLSearchParams(location.search);
      const verificationStatus = queryParams.get('verified');
      const tab = queryParams.get('tab');
      
      if (verificationStatus === 'success') {
        setVerificationMessage({ 
          type: 'success', 
          message: 'Your email has been verified successfully!' 
        });

        if (tab) {
          navigate(`${location.pathname}?tab=${tab}`, { replace: true });
        } else {
          navigate(location.pathname, { replace: true });
        }

        const fetchUpdatedUser = async () => {
          try {
            const res = await fetch(`/api/user/${currentUser._id}`, {
              credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
              dispatch(updateSuccess(data));
              setFollowersCount(data.followers?.length || 0);
              setFollowingCount(data.following?.length || 0);
            }
          } catch (err) {
            console.error("Failed to fetch updated user data:", err);
          }
        };
        
        fetchUpdatedUser();
      }
    }, [location, navigate, dispatch, currentUser._id, currentUser]);

    useEffect(() => {
      if (currentUser) {
        setFollowersCount(currentUser.followers?.length || 0);
        setFollowingCount(currentUser.following?.length || 0);
        const fetchCompleteUserData = async () => {
          try {
            const res = await fetch(`/api/user/${currentUser._id}`, {
              credentials: 'include'
            });
            const data = await res.json();
            
            if (res.ok) {
              dispatch(updateSuccess(data));
              setFollowersCount(data.followers?.length || 0);
              setFollowingCount(data.following?.length || 0);
            }
          } catch (err) {
            console.error("Failed to fetch complete user data:", err);
          }
        };
        
        fetchCompleteUserData();
      }
    }, [currentUser, dispatch]);

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImageFile(file);
        setImageFileUrl(URL.createObjectURL(file));
      }
    }
    
    useEffect(() => {
      if (imageFile) {
        uploadImage();
      }
    }, [imageFile]);

    const uploadImage = async () => {
     /* rules_version = '2';
      // Craft rules based on data in your Firestore database
      // allow write: if firestore.get(
      //    /databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin;
      service firebase.storage {
        match /b/{bucket}/o {
          match /{allPaths=**} {
            allow read;
            allow write: if
            request.resource.size < 2 * 1024 * 1024 && 
            request.resource.contentType.matches('image/.*')
          }
        }
      }*/
        setImageFileUploading(true);
        setImageFileUploadError(null);
        const storage = getStorage(app);
        const fileName = new Date().getTime() + imageFile.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setImageFileUploadProgress(progress.toFixed(0));
          },
          (error) => {
            console.error("Upload error:", error);
            setImageFileUploadError('Could not upload image (File must be less than 2MB)');
            setImageFileUploadProgress(null);
            setImageFile(null);
            setImageFileUrl(null);
            setImageFileUploading(false);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              setImageFileUrl(downloadURL);
              setFormData({...formData, profilePicture: downloadURL});
              setImageFileUploading(false);
            })
          }
        );
    };
    
    const handleChange = (e) => {
      setFormData({...formData, [e.target.id]: e.target.value});
    };
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      setUpdateUserError(null);
      setUpdateUserSuccess(null);
      
      if(Object.keys(formData).length === 0) {
        setUpdateUserError('No changes made')
        return;
      }
      
      if(imageFileUploading){
        setUpdateUserError('Please wait for image to upload');
        return;
      }
      
      // Date of birth validation - user must be at least 13 years old
      if (formData.dateOfBirth) {
        const birthDate = new Date(formData.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < 13) {
          setUpdateUserError('You must be at least 13 years old to use this platform');
          return;
        }
      }
      
      try{
        dispatch(updateStart());
        const res = await fetch(`api/user/update/${currentUser._id}`,{
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if(!res.ok) {
          dispatch(updateFailure(data.message));
          setUpdateUserError(data.message)
        } else {
          dispatch(updateSuccess(data));
          setUpdateUserSuccess("User Profile Updated Successfully")
        }
      } catch(err) {
        dispatch(updateFailure(err.message));
        setUpdateUserError(err.message)
      }
    };
    
    const handleDeleteUser = async () => {
      setShowModal(false);
      try{
        dispatch(deleteUserStart());
        const res = await fetch(`api/user/delete/${currentUser._id}`,{
          method: 'DELETE',
        });
        const data = await res.json();
        if(!res.ok) {
          dispatch(deleteUserFailure(data.message));
        } else {
          dispatch(deleteUserSuccess(data));
          
        }
      } catch(error) {
        dispatch(deleteUserFailure(error.message));
      }
    };
    
    const handleSignOut = async () => {
      try{
        const res = await fetch('api/user/signout',{
          method: 'POST',
        });
        const data = await res.json();
        if(!res.ok) {
          console.log(data.message)
        }else{
          dispatch(signoutSuccess());
        }
      } catch(error) {
        console.log(error.message)
      }
    };
    
    const handleSendVerification = async () => {
      if (currentUser.verified) {
        setVerificationMessage({ type: 'failure', message: 'Your account is already verified' });
        return;
      }

      try {
        setSendingVerification(true);
        setVerificationMessage(null);
        
        const res = await fetch(`/api/user/${currentUser._id}/resend-verification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          setVerificationMessage({ type: 'failure', message: data.message || 'Failed to send verification email' });
        } else {
          setVerificationMessage({ type: 'success', message: data.message || 'Verification email sent successfully' });
        }
      } catch (err) {
        setVerificationMessage({ type: 'failure', message: err.message || 'An error occurred' });
      } finally {
        setSendingVerification(false);
      }
    };
    
    // Functions to fetch followers and following
    const fetchFollowers = async () => {
      if (!currentUser || loadingFollowers) return;
      
      setLoadingFollowers(true);
      
      try {
        const res = await fetch(`/api/user/${currentUser._id}/followers`, {
          credentials: 'include'
        });
        const data = await res.json();
        
        if (!res.ok) {
          console.error("Failed to fetch followers");
          return;
        }
        
        setFollowers(data);
        setShowFollowersModal(true);
      } catch (err) {
        console.error("Error fetching followers:", err);
      } finally {
        setLoadingFollowers(false);
      }
    };
    
    const fetchFollowing = async () => {
      if (!currentUser || loadingFollowing) return;
      
      setLoadingFollowing(true);
      
      try {
        const res = await fetch(`/api/user/${currentUser._id}/following`, {
          credentials: 'include'
        });
        const data = await res.json();
        
        if (!res.ok) {
          console.error("Failed to fetch following");
          return;
        }
        
        setFollowing(data);
        setShowFollowingModal(true);
      } catch (err) {
        console.error("Error fetching following:", err);
      } finally {
        setLoadingFollowing(false);
      }
    };

    // Custom icon component to handle color
    const VerificationIcon = () => {
      return currentUser.verified ? 
        <FaCheckCircle className="text-green-500" /> : 
        <FaTimesCircle className="text-red-500" />;
    };

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="file" accept="image/*" onChange={handleImageChange} ref={filePickerRef} hidden/>
        <div className="relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full" onClick={() => filePickerRef.current.click()}>
          {imageFileUploadProgress && 
          (<CircularProgressbar value={imageFileUploadProgress || 0 } text={`${imageFileUploadProgress}%`}
            strokeWidth={5} 
            styles={{ root:{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
            },
            path: {
              stroke: `rgba(62,152,199, ${imageFileUploadProgress / 100})`,
            },
          }}
          />)}
            <img src= {imageFileUrl || currentUser.profilePicture} alt="user" className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] ${imageFileUploadProgress && imageFileUploadProgress < 100 && 'opacity-60'}`} />
        </div>

        {imageFileUploadError && <Alert color="failure">{imageFileUploadError}</Alert>}
        
        {/* Follow Stats */}
        <div className="flex justify-center gap-6 my-2">
          <button 
            type="button"
            onClick={fetchFollowers}
            className="text-gray-600 dark:text-gray-400 hover:underline"
            disabled={loadingFollowers}
          >
            <span className="font-bold text-gray-800 dark:text-gray-200">{followersCount}</span> Followers
          </button>
          <button 
            type="button"
            onClick={fetchFollowing}
            className="text-gray-600 dark:text-gray-400 hover:underline"
            disabled={loadingFollowing}
          >
            <span className="font-bold text-gray-800 dark:text-gray-200">{followingCount}</span> Following
          </button>
        </div>
        
        <TextInput type="text" id="username" placeholder="Username" defaultValue={currentUser.username} onChange={handleChange}/>
        
        {/* Email field with verification elements */}
        <div className="space-y-1">
          <div className="relative">
            <TextInput 
              type="email" 
              id="email" 
              placeholder="Email" 
              defaultValue={currentUser.email} 
              onChange={handleChange}
              className="w-full"
              rightIcon={VerificationIcon}
            />
          </div>
          
          {/* Centered verification link - now bigger and bold */}
          {!currentUser.verified && (
            <div className="flex justify-center">
              <p 
                onClick={handleSendVerification} 
                className="text-sm font-medium text-blue-600 hover:underline cursor-pointer"
              >
                {sendingVerification ? 'Sending...' : 'Verify email'}
              </p>
            </div>
          )}
        </div>
        
        {verificationMessage && (
          <Alert color={verificationMessage.type} className="mt-2">
            {verificationMessage.message}
          </Alert>
        )}

        <TextInput type="password" id="password" placeholder="Password" onChange={handleChange}/>
        
        {/* Date of Birth field */}
        <div className="space-y-1">
          <div className="flex items-center">
            <Label htmlFor="dateOfBirth" className="mb-1 block font-medium">Date of Birth</Label>
            <span className="text-xs text-gray-500 ml-2">(must be 13 years or older)</span>
          </div>
          <div className="relative">
            <TextInput
              type="date"
              id="dateOfBirth"
              className="w-full"
              onChange={handleChange}
              defaultValue={currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth).toISOString().split('T')[0] : ''}
              icon={FaCalendarAlt}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
            />
          </div>
        </div>

        <Button type="submit" gradientDuoTone="purpleToBlue" outline disabled={loading || imageFileUploading} className="mt-2">
            {loading ? 'Updating...' : 'Update'}
        </Button>

        {/* Create Post button (only for admin/publisher) */}
        {(currentUser.isAdmin || currentUser.isPublisher) && (
          <Link to={'/create-post'}>
            <Button type="button" gradientDuoTone="purpleToPink" className="w-full">
              Create a Post
            </Button>
          </Link>
        )}
        
        <Link to={`/profile/${currentUser.username}`} className="w-full block text-center">
          <p className="flex items-center justify-center gap-2 text-teal-600 dark:text-teal-400 font-medium hover:text-teal-800 dark:hover:text-teal-300 transition-colors">
            <FaEye className="h-4 w-4" />
            Show Your Profile as Anonymous
          </p>
        </Link>

      </form>
      <div className="text-red-500 mt-5 flex justify-between">
        <span onClick={()=> setShowModal(true)} className="cursor-pointer hover:underline">Delete Account</span>
        <span onClick={handleSignOut} className="cursor-pointer hover:underline">Sign Out</span>
      </div>

      {updateUserSuccess && 
      (
        <Alert color="success" className="mt-5">
          {updateUserSuccess}
        </Alert>
      )}
      {updateUserError && 
      (
        <Alert color="failure" className="mt-5">
          {updateUserError}
        </Alert>
      )}
      {errormodal && 
      (
        <Alert color="failure" className="mt-5">
          {errormodal}
        </Alert>
      )}
      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Delete Account"
        maxWidth="md"
        footer={
          <div className="flex justify-center gap-4 w-full">
            <Button 
              color="failure" 
              onClick={handleDeleteUser}
              className="bg-gradient-to-r from-red-500 to-pink-500"
            >
              Yes, I&apos;m sure
            </Button>
            <Button color="gray" onClick={() => setShowModal(false)}>
              No, cancel
            </Button>
          </div>
        }
      >
        <div className="text-center py-4">
          <HiOutlineExclamationCircle className="h-14 w-14 text-red-500 dark:text-red-400 mb-4 mx-auto" />
          <h3 className="mb-5 text-lg text-gray-600 dark:text-gray-300">
            Are you sure you want to delete your account?
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone. All your data will be permanently removed.
          </p>
        </div>
      </CustomModal>
     
      <div className="mt-10">
        {currentUser && <UserPosts userId={currentUser._id} username={currentUser.username} />}
      </div>
      
      {/* Followers Modal */}
      <UserListModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        title="Followers"
        users={followers}
        loading={loadingFollowers}
        emptyIcon="👥"
        emptyTitle="No followers yet"
        emptyMessage="When someone follows you, they'll appear here."
      />
      
      {/* Following Modal */}
      <UserListModal
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        title="Following"
        users={following}
        loading={loadingFollowing}
        emptyIcon="👤"
        emptyTitle="Not following anyone yet"
        emptyMessage="When you follow someone, they'll appear here."
      />
    </div>
  )
}
