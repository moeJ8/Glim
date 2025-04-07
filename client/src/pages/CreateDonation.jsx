import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextInput, Button, Spinner, Label, Textarea, Alert } from "flowbite-react";
//import { useSelector } from "react-redux";
import { HiDocumentAdd, HiTrash } from 'react-icons/hi';
import { app } from '../firebase.js';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function CreateDonation() {
  //const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amountOptions: [10, 25, 50, 100],
    goalAmount: "",
    image: "",
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleAmountOptionChange = (index, value) => {
    const newAmountOptions = [...formData.amountOptions];
    newAmountOptions[index] = Number(value);
    setFormData({ ...formData, amountOptions: newAmountOptions });
  };

  const handleAddAmountOption = () => {
    if (formData.amountOptions.length < 6) {
      setFormData({
        ...formData,
        amountOptions: [...formData.amountOptions, 0],
      });
    }
  };

  const handleRemoveAmountOption = (index) => {
    if (formData.amountOptions.length > 1) {
      const newAmountOptions = formData.amountOptions.filter((_, i) => i !== index);
      setFormData({ ...formData, amountOptions: newAmountOptions });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    setImageUploadError(null);
    setImageUploadProgress(null);
    
    if (!imageFile) return null;
    
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError('Could not upload image (File must be less than 2MB)');
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadProgress(null);
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPublishError(null);
    
    if (!formData.title || !formData.description) {
      return setPublishError('Title and description are required');
    }
    
    // Validate amount options
    const invalidAmounts = formData.amountOptions.filter(amount => amount <= 0);
    if (invalidAmounts.length > 0) {
      return setPublishError('All amount options must be greater than 0');
    }
    
    try {
      setLoading(true);
      
      // Upload image if selected
      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await uploadImage();
      }
      
      // Create donation case
      const res = await fetch('/api/donation/case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setPublishError(data.message);
        setLoading(false);
        return;
      }
      
      setLoading(false);
      navigate(`/donate/${data._id}`);
      
    } catch (err) {
      setPublishError('Something went wrong');
      setLoading(false);
      console.log(err);
      
    }
  };

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-3 py-8">
      <h1 className="text-3xl font-semibold text-center mb-6">Create Donation Case</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="title" value="Title *" />
          <TextInput
            id="title"
            placeholder="Title for the donation case"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description" value="Description *" />
          <Textarea
            id="description"
            placeholder="Describe what this donation is for..."
            rows={6}
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <Label value="Donation Amount Options *" />
          <div className="space-y-3">
            {formData.amountOptions.map((amount, index) => (
              <div key={index} className="flex items-center gap-3">
                <TextInput
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => handleAmountOptionChange(index, e.target.value)}
                  className="flex-grow"
                  placeholder="Amount"
                />
                <Button
                  color="failure"
                  size="sm"
                  onClick={() => handleRemoveAmountOption(index)}
                  disabled={formData.amountOptions.length <= 1}
                >
                  <HiTrash className="h-5 w-5" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              gradientDuoTone="purpleToBlue"
              onClick={handleAddAmountOption}
              disabled={formData.amountOptions.length >= 6}
              className="mt-2"
              size="sm"
            >
              Add Amount Option
            </Button>
          </div>
        </div>
        
        <div>
          <Label htmlFor="goalAmount" value="Goal Amount (Optional)" />
          <TextInput
            id="goalAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="Total fundraising goal"
            value={formData.goalAmount}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <Label htmlFor="image" value="Image URL (Optional)" />
          <TextInput
            id="image"
            placeholder="Image URL for the donation case"
            value={formData.image}
            onChange={handleChange}
          />
        </div>
        
        <div className="flex flex-col gap-4">
          <Label htmlFor="imageUpload" value="Or upload an image" />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            id="imageUpload"
            className="hidden"
          />
          <label
            htmlFor="imageUpload"
            className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-32 w-full"
          >
            {imageFileUrl ? (
              <img
                src={imageFileUrl}
                alt="Donation case"
                className="h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <HiDocumentAdd className="w-10 h-10 mx-auto text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">
                  Click to upload an image
                </p>
              </div>
            )}
          </label>
        </div>
        
        {imageUploadError && (
          <Alert color="failure">
            {imageUploadError}
          </Alert>
        )}
        
        {publishError && (
          <Alert color="failure">
            {publishError}
          </Alert>
        )}
        
        <Button
          type="submit"
          gradientDuoTone="purpleToBlue"
          disabled={loading || imageUploadProgress !== null}
        >
          {loading || imageUploadProgress !== null ? (
            <>
              <Spinner size="sm" className="mr-2" />
              {imageUploadProgress ? `Uploading... ${imageUploadProgress}%` : 'Creating...'}
            </>
          ) : (
            'Create Donation Case'
          )}
        </Button>
      </form>
    </div>
  );
} 