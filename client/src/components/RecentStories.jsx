import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from 'flowbite-react';
import StoryCard from './StoryCard';

export default function RecentStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/story/get?limit=6&sort=desc');
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error('Failed to fetch recent stories');
        }
        
        setStories(data.stories);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recent stories:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-8">
      <Spinner size="lg" />
    </div>
  );

  if (error) return null;

  if (stories.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {stories.map((story) => (
          <div key={story._id} className="w-full">
            <StoryCard story={story} />
          </div>
        ))}
      </div>
      <Link to="/stories" className="text-lg text-teal-500 hover:underline text-center">
        View All Narratives
      </Link>
    </div>
  );
} 