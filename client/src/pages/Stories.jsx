import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import StoryCard from '../components/StoryCard';
import {
  Button,
  Select,
  TextInput,
  Spinner,
} from 'flowbite-react';
import { FaSearch } from 'react-icons/fa';
import { useSelector } from 'react-redux';

export default function Stories() {
  const [filterData, setFilterData] = useState({
    searchTerm: '',
    category: '',
    country: '',
  });
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useSelector(state => state.user);
  const [categories] = useState([
    'general',
    'medical',
    'education',
    'housing',
    'food',
    'clothing',
    'emergency',
    'other',
  ]);
  const [countries, setCountries] = useState([]);
  const [allCountries, setAllCountries] = useState([]); // Store all unique countries

  useEffect(() => {
    // Initialize filter data from URL
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const categoryFromUrl = urlParams.get('category');
    const countryFromUrl = urlParams.get('country');

    setFilterData({
      searchTerm: searchTermFromUrl || '',
      category: categoryFromUrl || '',
      country: countryFromUrl || '',
    });

    // Fetch all unique countries first (only once)
    const fetchAllCountries = async () => {
      try {
        const res = await fetch('/api/story/get?limit=100');
        if (res.ok) {
          const data = await res.json();
          const uniqueCountries = [...new Set(data.stories.map(story => story.country))];
          setAllCountries(uniqueCountries);
          setCountries(uniqueCountries);
        }
      } catch (error) {
        console.error('Failed to fetch countries:', error);
      }
    };

    if (allCountries.length === 0) {
      fetchAllCountries();
    }

    const fetchStories = async () => {
      setLoading(true);
      try {
        console.log("Query params:", urlParams.toString()); // Debug log
        const res = await fetch(`/api/story/get?limit=9&${urlParams.toString()}`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        setStories(data.stories);
        
        setLoading(false);
        if (data.stories.length === 9) {
          setShowMore(true);
        } else {
          setShowMore(false);
        }
      } catch (error) {
        console.error('Failed to fetch stories:', error);
        setLoading(false);
      }
    };

    fetchStories();
  }, [location.search, allCountries.length]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    const newFilterData = { ...filterData, [id]: value };
    setFilterData(newFilterData);
    
    // Update URL params
    const urlParams = new URLSearchParams(location.search);
    
    if (value) {
      urlParams.set(id, value);
    } else {
      urlParams.delete(id);
    }
    
    // Logging for debugging
    console.log(`Setting ${id} to '${value}'`);
    console.log("New URL params:", urlParams.toString());
    
    navigate(`/stories?${urlParams.toString()}`);
  };

  const handleShowMore = async () => {
    const startIndex = stories.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const searchQuery = urlParams.toString();
    
    try {
      const res = await fetch(`/api/story/get?limit=9&${searchQuery}`);
      if (!res.ok) return;
      const data = await res.json();
      setStories([...stories, ...data.stories]);
      if (data.stories.length === 9) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveFilters = () => {
    setFilterData({
      searchTerm: '',
      category: '',
      country: '',
    });
    navigate('/stories');
  };

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-3 py-8">
      <div className="flex flex-col gap-6 mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold">Stories</h1>
          <p className="text-gray-300">Discover stories from our community</p>
        </div>

        <div className="flex flex-col gap-4 items-center justify-center">
          <div className="w-full sm:w-[600px]">
            <TextInput
              placeholder="Search stories..."
              value={filterData.searchTerm}
              onChange={handleChange}
              id="searchTerm"
              className="w-full focus:border-blue-500"
              rightIcon={FaSearch}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Select
              onChange={handleChange}
              value={filterData.category}
              id="category"
              className="w-full sm:w-[200px] focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </Select>
            <Select
              onChange={handleChange}
              value={filterData.country}
              id="country"
              className="w-full sm:w-[200px] focus:border-blue-500"
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button 
                onClick={handleRemoveFilters}
                outline 
                gradientDuoTone="purpleToPink" 
                className="w-full sm:w-auto"
              >
                Remove Filters
              </Button>
              {currentUser && (currentUser.isAdmin || currentUser.isPublisher) && (
                <Link to="/create-story" className="w-full sm:w-auto">
                  <Button gradientDuoTone="purpleToPink" className="w-full font-semibold">
                    Share Your Story
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        {!loading && (
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
            {stories.length === 0 
              ? "No stories found" 
              : `Showing ${stories.length} ${stories.length === 1 ? 'story' : 'stories'}`
            }
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full text-center text-xl text-gray-400">
            <Spinner size="xl" />
          </div>
        ) : (
          stories.map((story) => (
            <div key={story._id} className="w-full max-w-[600px] mx-auto">
              <StoryCard story={story} />
            </div>
          ))
        )}
        {
          !loading && stories.length === 0 && (
            <div className="col-span-full text-center text-xl text-gray-400">No Stories Found.</div>
          )
        }
      </div>

      {showMore && !loading && (
        <div className="text-center mt-8">
          <button onClick={handleShowMore} className="text-teal-500 hover:underline">
            Show more
          </button>
        </div>
      )}
    </div>
  );
} 