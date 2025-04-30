import { Button, FileInput, Select, TextInput } from "flowbite-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useEffect, useState } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from 'react-hot-toast';


export default function UpdatePost() {
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [formData, setFormData] = useState({});
  const {postId} = useParams();

  // Define modules with H1 and H2 buttons
  const modules = {
    toolbar: [
      [{ 'header': 1 }, { 'header': 2 }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image']
    ]
  };

 const navigate = useNavigate();
 const {currentUser} = useSelector((state) => state.user);

 useEffect(() => {
     try{
        const fetchPost = async () => {
            const res = await fetch(`/api/post/getposts?postId=${postId}`);
            const data = await res.json();
            if(!res.ok){
                console.log(data.message);
                toast.error(data.message, {
                  duration: 4000,
                  style: {
                    background: '#991b1b',
                    color: '#fff',
                  },
                });
                return;
            }
            if(res.ok){
                setFormData(data.posts[0]);
            }
        }
        
        fetchPost();
     } catch(error){
         console.log(error);
         toast.error("Error fetching post", {
           duration: 4000,
           style: {
             background: '#991b1b',
             color: '#fff',
           },
         });
     }
 }, [postId]);

  const handleUploadImage = async () => {
    try{
      if(!file){
        toast.error('Please select an Image', {
          duration: 4000,
          style: {
            background: '#991b1b',
            color: '#fff',
          },
        });
        return;
      }
      const storage = getStorage(app);
      const fileName = new Date().getTime() + '-' + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          console.error("Upload error:", error);
          toast.error('Image upload failed, try different image', {
            duration: 4000,
            style: {
              background: '#991b1b',
              color: '#fff',
            },
          });
          setImageUploadProgress(null);
          setFile(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadProgress(null);
            setFormData({...formData, image: downloadURL});
          });
        }

      );
    }catch(error){
      toast.error('Image upload failed, try different image', {
        duration: 4000,
        style: {
          background: '#991b1b',
          color: '#fff',
        },
      });
      setImageUploadProgress(null);
      console.log(error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.title || !formData.title.trim()) {
      toast.error('Title is required', {
        duration: 4000,
        style: {
          background: '#991b1b',
          color: '#fff',
        },
      });
      return;
    }
    
    if (!formData.content || formData.content.trim() === '<p><br></p>') {
      toast.error('Content is required', {
        duration: 4000,
        style: {
          background: '#991b1b',
          color: '#fff',
        },
      });
      return;
    }
    
    try{
      const res = await fetch(`/api/post/updatepost/${postId}/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message, {
          duration: 4000,
          style: {
            background: '#991b1b',
            color: '#fff',
          },
        });
        return;
      }
   
      if (res.ok) {
        toast.success('Post updated successfully', {
          duration: 4000,
          style: {
            background: '#15803d', // green-700 from Tailwind
            color: '#fff',
          },
        });
        navigate(`/post/${data.slug}`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong', {
        duration: 4000,
        style: {
          background: '#991b1b',
          color: '#fff',
        },
      });
    }
  };
  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Update Post</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
            <TextInput type="text" placeholder="Title" id="title" className="flex-1" onChange={(e) => setFormData({...formData, title: e.target.value})} value={formData.title}/>
            <Select onChange={(e) => setFormData({...formData, category: e.target.value})} value={formData.category}>
                    <option value= "uncategorized">Select a Category</option>
                    <option value="art">Art</option>
                    <option value="health">Health</option>
                    <option value="history">History</option>
                    <option value="literature">Literature</option>
                    <option value="music">Music</option>
                    <option value="news">News</option>
                    <option value="politics">Politics</option>
                    <option value="sport">Sport</option>
                    <option value="tech">Tech</option>
            </Select>
        </div>
        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
            <FileInput type ='file' accept="image/*" onChange={(e) => setFile(e.target.files[0])}/> 
            <Button type="button" gradientDuoTone="purpleToBlue" size="sm" outline onClick={handleUploadImage} disabled = {imageUploadProgress}>

              {imageUploadProgress ? 
              <div className="w-16 h-16 ">
                <CircularProgressbar value={imageUploadProgress || 0} text={`${imageUploadProgress}%`} />
              </div>
              : "Upload Image"}
              </Button>

        </div>
        {formData.image && (
          <img 
          src={formData.image}
          alt="upload"
          className="w-full h-72 object-cover"
          />
        )}
        <ReactQuill theme="snow" value={formData.content} placeholder="Write your post here" className="h-72 mb-12" onChange={(value) => setFormData({...formData, content: value})} modules={modules}/>
        <Button type="submit" gradientDuoTone="purpleToPink">Update</Button>
      </form>
    </div>
  )
}
