import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Spinner, Alert, Badge } from 'flowbite-react';
import { FaCalendarDays } from 'react-icons/fa6';
import { FaFacebook, FaWhatsapp, FaTelegram, FaDiscord, FaTag, FaMapMarkerAlt } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

export default function StoryPage() {
  const { slug } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/story/getbyslug/${slug}`);
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.message || 'Failed to fetch story');
          return;
        }
        
        setStory(data);
      } catch (error) {
        setError('Something went wrong');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStory();
  }, [slug]);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Get contact icon
  const getContactIcon = (platform) => {
    if (!platform) return null;
    
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <FaFacebook size={24} className="text-blue-600" />;
      case 'whatsapp':
        return <FaWhatsapp size={24} className="text-green-500" />;
      case 'telegram':
        return <FaTelegram size={24} className="text-blue-500" />;
      case 'discord':
        return <FaDiscord size={24} className="text-purple-600" />;
      case 'email':
        return <MdEmail size={24} className="text-red-500" />;
      default:
        return null;
    }
  };
  
  // Get contact link
  const getContactLink = (platform, username) => {
    if (!platform || !username) return '#';
    
    switch (platform.toLowerCase()) {
      case 'facebook':
        return `https://facebook.com/${username}`;
      case 'whatsapp':
        // Remove any non-digit characters for WhatsApp
        const cleanNumber = username.replace(/\D/g, '');
        return `https://wa.me/${cleanNumber}`;
      case 'telegram':
        return `https://t.me/${username}`;
      case 'discord':
        return `https://discord.com/users/${username}`;
      case 'email':
        return `mailto:${username}`;
      default:
        return '#';
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 mt-8">
        <Alert color="failure">
          <p>{error}</p>
          <div className="mt-4">
            <Link to="/stories">
              <Button color="purple">Back to Stories</Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }
  
  if (!story) {
    return (
      <div className="max-w-4xl mx-auto p-4 mt-8">
        <Alert color="info">
          <p>Story not found</p>
          <div className="mt-4">
            <Link to="/stories">
              <Button color="purple">Back to Stories</Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 my-8">
      {/* Story header */}
      <div className="mb-8 pb-4 border-b dark:border-gray-700">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-white">{story.title}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            <FaCalendarDays className="text-purple-500" />
            <span>{formatDate(story.createdAt)}</span>
          </div>
          
          <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900 px-3 py-1 rounded-full text-purple-700 dark:text-purple-300">
            <FaTag className="text-purple-500" />
            <span>{story.category}</span>
          </div>
          
          <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full text-blue-700 dark:text-blue-300">
            <FaMapMarkerAlt className="text-blue-500" />
            <span>{story.country}</span>
          </div>
        </div>
      </div>
      
      {/* Story image */}
      <div className="mb-10 overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
        <div className="relative">
          <img
            src={story.image}
            alt={story.title}
            className="w-full h-auto max-h-[500px] object-cover hover:scale-105 transition-transform duration-700 ease-in-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>
      
      {/* Story content */}
      <div className="prose dark:prose-invert max-w-none mb-10 text-gray-700 dark:text-gray-300">
        {/* Split paragraphs and render them */}
        {story.body.split('\n').map((paragraph, index) => (
          paragraph ? <p key={index} className="mb-4 leading-relaxed">{paragraph}</p> : <br key={index} />
        ))}
      </div>
      
      {/* Contact information */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-purple-900 p-6 rounded-xl shadow-md mb-10 border-l-4 border-purple-500">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Contact Information</h2>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-gray-900 rounded-full shadow-md">
              {getContactIcon(story.contactPlatform)}
            </div>
            <div>
              <span className="font-medium block text-gray-700 dark:text-gray-300">
                {story.contactPlatform.charAt(0).toUpperCase() + story.contactPlatform.slice(1)}
              </span>
              <span className="text-gray-600 dark:text-gray-400">{story.contactUsername}</span>
            </div>
          </div>
          
          <a
            href={getContactLink(story.contactPlatform, story.contactUsername)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-md hover:shadow-lg transition-all duration-200"
          >
            Contact via {story.contactPlatform.charAt(0).toUpperCase() + story.contactPlatform.slice(1)}
          </a>
        </div>
      </div>
      
      {/* Back to stories button */}
      <div className="flex justify-center">
        <Link to="/stories" className="w-full sm:w-auto">
          <Button gradientDuoTone="purpleToPink" className="w-full px-6 py-2.5 shadow-md hover:shadow-lg transition-all duration-200">
            Back to Stories
          </Button>
        </Link>
      </div>
    </div>
  );
} 