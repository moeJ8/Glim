import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  FileInput,
  Select,
  Spinner,
  TextInput,
  Textarea,
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

export default function CreateStory() {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    country: '',
    category: 'general',
    contactPlatform: 'email',
    contactUsername: '',
    image: '',
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  const navigate = useNavigate();
  
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
        setImageFileUploadError('Please select an image');
        return null;
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
            setPreviewUrl(null);
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
                setPreviewUrl(null);
                reject(err);
              });
          }
        );
      });
      
    } catch (error) {
      setImageFileUploadError('Image upload failed');
      setPreviewUrl(null);
      console.error(error);
      return null;
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
      if (imageFile && !formData.image) {
        const imageUrl = await uploadImage();
        if (!imageUrl) {
          setLoading(false);
          return;
        }
      }
      
      // Submit to API
      const res = await fetch('/api/story/create', {
        method: 'POST',
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
        navigate('/dashboard?tab=stories');
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

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Share Your Story</h1>
      
      <div className="mb-6 p-4 bg-blue-50 dark:bg-gray-800 border-l-4 border-blue-500 rounded-md">
        <div className="flex items-start">
          <FaInfoCircle className="text-blue-500 mt-1 mr-3" />
          <div>
            <h3 className="font-semibold text-blue-800 dark:text-blue-300">About Sharing Your Story</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Share your story to reach people who can help. Be specific about your needs and provide contact information.
              All stories are reviewed before being published.
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
              placeholder="Story Title"
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
            {imageFile && !formData.image && !previewUrl && (
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
              alt="Story preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Story body */}
        <Textarea
          id="body"
          placeholder="Share your story (details about your situation, what kind of help you need, etc.)"
          value={formData.body}
          onChange={handleChange}
          required
          rows={8}
          className="resize-none"
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
              Publishing...
            </>
          ) : (
            'Publish Story'
          )}
        </Button>
        
        {showNotification && (
          <Alert color="success" className="mt-5">
            Your story has been published successfully!
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