import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Button,
  FileInput,
  Select,
  Spinner,
  TextInput,
  Alert,
} from 'flowbite-react';
import { app } from '../firebase';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { FaInfoCircle } from 'react-icons/fa';
import CountrySelect from '../components/CountrySelect';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function UpdateStory() {
  const { storyId } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    country: '',
    category: '',
    contactPlatform: '',
    contactUsername: '',
    image: '',
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        setInitialLoading(true);
        const res = await fetch(`/api/story/get/${storyId}`);
        const data = await res.json();
        
        if (!res.ok) {
          console.error(data.message);
          setPublishError(data.message);
          setInitialLoading(false);
          return;
        }
        
        // Only allow editing if the user is the author or an admin
        if (data.userId !== currentUser._id && !currentUser.isAdmin) {
          navigate('/dashboard?tab=narratives');
          return;
        }
        
        setFormData({
          title: data.title,
          body: data.body,
          country: data.country,
          category: data.category,
          contactPlatform: data.contactPlatform,
          contactUsername: data.contactUsername,
          image: data.image,
        });
        setPreviewUrl(data.image);
        setInitialLoading(false);
      } catch (error) {
        console.error(error);
        setPublishError('Failed to fetch story');
        setInitialLoading(false);
      }
    };
    
    fetchStory();
  }, [storyId, currentUser._id, currentUser.isAdmin, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Don't set preview URL here, it will be set after upload
    }
  };
  
  const uploadImage = async () => {
    try {
      if (!imageFile) {
        return formData.image; // Keep existing image if no new one is uploaded
      }
      
      // Set temporary preview for user feedback
      setPreviewUrl(URL.createObjectURL(imageFile));
      
      const storage = getStorage(app);
      const fileName = new Date().getTime() + imageFile.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setImageFileUploadProgress(progress.toFixed(0));
          },
          (error) => {
            setImageFileUploadError('Image upload failed');
            setPreviewUrl(formData.image); // Revert to original image on error
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref)
              .then((downloadURL) => {
                setImageFileUploadProgress(null);
                setImageFileUploadError(null);
                setFormData({ ...formData, image: downloadURL });
                resolve(downloadURL);
              })
              .catch((err) => {
                setImageFileUploadError('Failed to get download URL');
                setPreviewUrl(formData.image); // Revert to original image on error
                reject(err);
              });
          }
        );
      });
      
    } catch (error) {
      setImageFileUploadError('Image upload failed');
      setPreviewUrl(formData.image); // Revert to original image on error
      console.error(error);
      return formData.image; // Fallback to existing image
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setPublishError(null);
      
      // Validation
      if (!formData.title || !formData.body || !formData.country || 
          !formData.contactUsername) {
        setPublishError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      // Upload image if selected but not already uploaded
      if (imageFile) {
        const imageUrl = await uploadImage();
        if (!imageUrl) {
          setLoading(false);
          return;
        }
      }
      
      // Submit to API
      const res = await fetch(`/api/story/update/${storyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const responseData = await res.json();
      
      if (!res.ok) {
        setPublishError(responseData.message || 'Something went wrong');
        setLoading(false);
        return;
      }
      
      // Show success notification
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        // Redirect admin users to "All Stories" tab, regular users to "stories" tab
        if (currentUser.isAdmin) {
          navigate('/dashboard?tab=allnarratives');
        } else {
          navigate('/dashboard?tab=narratives');
        }
      }, 2000);
      
    } catch (error) {
      console.error(error);
      setPublishError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  
  const categoryOptions = [
    { value: 'general', label: 'General' },
    { value: 'medical', label: 'Medical' },
    { value: 'education', label: 'Education' },
    { value: 'housing', label: 'Housing' },
    { value: 'food', label: 'Food' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'other', label: 'Other' },
  ];
  
  const platformOptions = [
    { value: 'email', label: 'Email' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'discord', label: 'Discord' },
  ];
  
  // Define modules with H1 and H2 buttons instead of dropdown
  const modules = {
    toolbar: [
      [{ 'header': 1 }, { 'header': 2 }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image']
    ]
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Update Your Narrative</h1>
      
      <div className="mb-6 p-4 bg-blue-50 dark:bg-gray-800 border-l-4 border-blue-500 rounded-md">
        <div className="flex items-start">
          <FaInfoCircle className="text-blue-500 mt-1 mr-3" />
          <div>
            <h3 className="font-semibold text-blue-800 dark:text-blue-300">About Updating Your Narrative</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Make your changes to reach more people who can help. Updated stories will be reviewed again before being published.
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title field */}
          <div className="md:col-span-2">
            <TextInput
              id="title"
              placeholder="Narrative Title"
              value={formData.title}
              onChange={handleChange}
              required
              className="text-lg"
            />
          </div>
          
          {/* Country and Category fields */}
          <div>
            <CountrySelect
              value={formData.country}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <Select
              id="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          
          {/* Contact fields */}
          <div>
            <Select
              id="contactPlatform"
              value={formData.contactPlatform}
              onChange={handleChange}
              required
            >
              {platformOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          
          <div>
            <TextInput
              id="contactUsername"
              placeholder={`Your ${formData.contactPlatform} contact`}
              value={formData.contactUsername}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        {/* Image upload section */}
        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3 rounded-lg">
          <div className="flex-1">
            <FileInput
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imageFile && !imageFileUploadProgress && (
              <p className="text-xs mt-1 text-gray-500">Click &quot;Upload Image&quot; to preview and upload</p>
            )}
          </div>
          <Button
            type="button"
            gradientDuoTone="purpleToBlue"
            size="sm"
            outline
            onClick={uploadImage}
            disabled={!imageFile || imageFileUploadProgress !== null}
          >
            {imageFileUploadProgress ? (
              <div className="w-16 h-16">
                <CircularProgressbar
                  value={imageFileUploadProgress || 0}
                  text={`${imageFileUploadProgress}%`}
                />
              </div>
            ) : (
              "Upload Image"
            )}
          </Button>
        </div>
        
        {/* Image preview */}
        {imageFileUploadError && (
          <Alert color="failure">
            {imageFileUploadError}
          </Alert>
        )}
        
        {(previewUrl || formData.image) && (
          <div className="relative w-full h-72 rounded-lg overflow-hidden">
            <img
              src={formData.image || previewUrl}
              alt="Narrative preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Narrative body */}
        <ReactQuill 
          theme="snow" 
          value={formData.body}
          placeholder="Share your narrative (details about your situation, what kind of help you need, etc.)" 
          className="h-72 mb-12" 
          modules={modules}
          required 
          onChange={(value) => setFormData({...formData, body: value})}
        />
        
        {/* Submit button */}
        <Button
          type="submit"
          gradientDuoTone="purpleToPink"
          className="w-full"
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Updating...
            </>
          ) : (
            'Update Narrative'
          )}
        </Button>
        
        {showNotification && (
          <Alert color="success" className="mt-5">
            Your narrative has been updated successfully!
          </Alert>
        )}
        
        {publishError && (
          <Alert color="failure" className="mt-5">
            {publishError}
          </Alert>
        )}
      </form>
    </div>
  );
} 