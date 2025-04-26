import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner, Button, Card } from 'flowbite-react';
import StoryCard from './StoryCard';
import { useSelector } from 'react-redux';

export default function RecentStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);

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

  // Check if user is a regular user (not an admin or publisher)
  const isRegularUser = currentUser && !currentUser.isAdmin && !currentUser.isPublisher;

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
      
      <Link to="/stories" className="text-lg text-teal-500 hover:underline text-center mt-2">
        View All Narratives
      </Link>
      
      {/* Narrative Request Call-to-Action - only shown to regular users */}
      {isRegularUser && (
        <Card className="mt-6 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 border-0 shadow-md">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-3">Need Help Sharing Your Narrative?</h3>
            <p className="mb-4">
              If you want to get help from the community, don&apos;t hesitate and request to share your narrative from one of our publishers.
            </p>
            <div className="flex items-center justify-center">
              <a href="mailto:glimapp2@gmail.com" className="inline-flex">
                <Button gradientDuoTone="purpleToBlue">
                  Email Us Now
                </Button>
              </a>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
} 