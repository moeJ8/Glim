import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner, Carousel } from 'flowbite-react';
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiEye, HiCalendar } from 'react-icons/hi';

export default function MostReadPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMostReadPosts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/post/most-read?limit=5');
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error('Failed to fetch most read posts');
        }
        
        setPosts(data.posts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching most read posts:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchMostReadPosts();
  }, []);

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) return (
    <div className="w-full h-[400px] md:h-[450px] xl:h-[500px] flex justify-center items-center rounded-lg bg-gray-100 dark:bg-gray-800 loading-skeleton">
      <Spinner size="lg" />
    </div>
  );

  if (error) return (
    <div className="w-full h-[400px] md:h-[450px] xl:h-[500px] flex justify-center items-center rounded-lg bg-gray-100 dark:bg-gray-800">
      <p className="text-gray-500">Unable to load posts</p>
    </div>
  );

  if (posts.length === 0) return (
    <div className="w-full h-[400px] md:h-[450px] xl:h-[500px] flex justify-center items-center rounded-lg bg-gray-100 dark:bg-gray-800">
      <p className="text-gray-500">No posts available</p>
    </div>
  );

  return (
    <div className="w-full">
      <div className="h-[400px] md:h-[450px] xl:h-[500px] rounded-lg overflow-hidden" style={{minHeight: '400px'}}>
        <Carousel
          leftControl={
            <span className="bg-gray-100/30 dark:bg-gray-800/30 p-2 rounded-full">
              <HiOutlineChevronLeft className="h-6 w-6 text-white" />
            </span>
          }
          rightControl={
            <span className="bg-gray-100/30 dark:bg-gray-800/30 p-2 rounded-full">
              <HiOutlineChevronRight className="h-6 w-6 text-white" />
            </span>
          }
          indicators={false}
          slideInterval={5000}
        >
          {posts.map((post) => (
            <div key={post._id} className="relative h-full flex-1">
              <img
                src={post.image}
                alt={post.title}
                className="h-full w-full object-cover brightness-75"
                width="800"
                height="500"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-6 pl-12 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                <div className="flex gap-6 text-gray-200 text-sm mb-3">
                  <div className="flex items-center">
                    <HiCalendar className="mr-1" />
                    {formatDate(post.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <HiEye className="mr-1" />
                    {post.views} views
                  </div>
                </div>
                
                <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md w-fit mb-2">
                  {post.category}
                </div>
                
                <h3 className="text-white text-xl md:text-2xl font-bold mb-3">
                  {post.title}
                </h3>
                
                <p className="text-gray-200 mb-4 line-clamp-2">
                  {post.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                </p>
                
                <Link 
                  to={`/post/${post.slug}`}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-blue-600 transition duration-300 w-fit"
                >
                  Read Post
                </Link>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
      
     
    </div>
  );
} 