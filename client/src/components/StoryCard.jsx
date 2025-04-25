import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaMapMarkerAlt, FaTag } from 'react-icons/fa';
import { FaCalendarDays } from 'react-icons/fa6';
import { FaFacebook, FaWhatsapp, FaTelegram, FaDiscord } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

export default function StoryCard({ story }) {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get the appropriate contact icon
  const getContactIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <FaFacebook className="text-blue-600" />;
      case 'whatsapp':
        return <FaWhatsapp className="text-green-500" />;
      case 'telegram':
        return <FaTelegram className="text-blue-500" />;
      case 'discord':
        return <FaDiscord className="text-purple-600" />;
      case 'email':
        return <MdEmail className="text-red-500" />;
      default:
        return null;
    }
  };

  // Truncate text to a specific length
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <div className="group relative w-full border border-teal-500 hover:border-2 h-[480px] overflow-hidden rounded-lg transition-all shadow-md hover:shadow-lg">
      <Link to={`/story/${story.slug}`}>
        <div className="relative">
          <img 
            src={story.image} 
            alt={story.title} 
            loading="lazy"
            className="h-[180px] w-full object-cover group-hover:h-[160px] transition-all duration-300 z-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </Link>
      <div className="p-4 flex flex-col gap-1">
        <Link to={`/story/${story.slug}`} className="hover:text-teal-600 transition-colors">
          <h3 className="text-lg font-semibold line-clamp-2 mb-1">{story.title}</h3>
        </Link>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
          {truncateText(story.body.replace(/<[^>]*>/g, ''), 80)}
        </p>
        
        <div className="flex flex-wrap gap-2 mt-1">
          <div className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
            <FaTag className="text-teal-500" />
            <span>{story.category}</span>
          </div>
          <div className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
            <FaMapMarkerAlt className="text-red-500" />
            <span>{story.country}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
          <div className="flex items-center gap-1">
            <FaCalendarDays className="text-blue-500" />
            <span>{formatDate(story.createdAt)}</span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-md">
            <span className="bg-white dark:bg-gray-700 p-1 rounded-full shadow-sm flex items-center justify-center">
              {getContactIcon(story.contactPlatform)}
            </span>
            <div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {story.contactPlatform}: <span className="text-gray-600">{story.contactUsername}</span>
              </span>
            </div>
          </div>
        </div>
        
        <Link 
          to={`/story/${story.slug}`} 
          className="z-10 absolute bottom-[-100px] group-hover:bottom-0 left-0 right-0 border border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white transition-all duration-300 text-center py-2 rounded-md !rounded-tl-none m-2"
        >
          Read Full Story
        </Link>
      </div>
    </div>
  );
}

StoryCard.propTypes = {
  story: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    views: PropTypes.number.isRequired,
    createdAt: PropTypes.string.isRequired,
    contactPlatform: PropTypes.string.isRequired,
    contactUsername: PropTypes.string.isRequired
  }).isRequired,
}; 