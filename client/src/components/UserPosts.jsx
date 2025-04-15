import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Spinner } from "flowbite-react";
import { FiFileText } from "react-icons/fi";
import PropTypes from 'prop-types';

export default function UserPosts({ userId, username }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [cachedPosts, setCachedPosts] = useState({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 6;

  // Paginate posts on client side after fetching all
  const paginatePosts = useCallback((allPosts, page) => {
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    return allPosts.slice(startIndex, endIndex);
  }, [postsPerPage]);

  // Memoized fetch implementation
  const fetchUserPosts = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoadingPosts(true);
      
      // Check if posts for this user are already cached
      if (cachedPosts[userId]) {
        const allUserPosts = cachedPosts[userId];
        setTotalPosts(allUserPosts.length);
        setUserPosts(paginatePosts(allUserPosts, currentPage));
        setLoadingPosts(false);
        return;
      }
      
      // Fetch posts with progressive loading
      const res = await fetch(`/api/post/getposts?userId=${userId}&limit=1000`);
      const data = await res.json();
      
      if (res.ok) {
        const allUserPosts = data.posts;
        
        // Cache posts for this user
        setCachedPosts(prevCache => ({
          ...prevCache,
          [userId]: allUserPosts
        }));
        
        setTotalPosts(allUserPosts.length);
        setUserPosts(paginatePosts(allUserPosts, currentPage));
      }
    } catch (err) {
      console.error("Error fetching user posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  }, [userId, currentPage, paginatePosts, cachedPosts]);

  // Effect for pagination and posts fetching
  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  const onPageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update URL without refreshing
    const currentPath = location.pathname;
    navigate(`${currentPath}?page=${page}`, { replace: true });
    
    // If we have cached posts, update displayed posts immediately
    if (userId && cachedPosts[userId]) {
      setUserPosts(paginatePosts(cachedPosts[userId], page));
    }
  }, [navigate, location.pathname, cachedPosts, paginatePosts, userId]);

  // Set initial page from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const pageParam = searchParams.get('page');
    if (pageParam) {
      const page = parseInt(pageParam);
      if (!isNaN(page) && page > 0) {
        setCurrentPage(page);
      }
    }
  }, [location.search]);

  const pageCount = useMemo(() => Math.ceil(totalPosts / postsPerPage), [totalPosts, postsPerPage]);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold border-b pb-2 mb-6">
        Posts by {username}
        {totalPosts > 0 && <span className="text-gray-500 text-base ml-2">({totalPosts})</span>}
      </h2>
      {loadingPosts ? (
        <div className="flex justify-center my-8">
          <Spinner />
        </div>
      ) : totalPosts === 0 ? (
        <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
          <div className="flex flex-col items-center">
            <FiFileText className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              This user hasn&apos;t published any posts yet.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userPosts.map((post) => (
              <div 
                key={post._id} 
                className="overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all h-full flex flex-col"
              >
                <Link to={`/post/${post.slug}`} className="block relative">
                  <div className="h-44 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Category badge */}
                  <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                    {post.category}
                  </span>
                </Link>
                
                <div className="p-4 flex flex-col flex-grow">
                  <Link to={`/post/${post.slug}`} className="flex-grow">
                    <h4 className="font-semibold text-lg mb-2 hover:text-purple-800 dark:hover:text-purple-500 transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                  </Link>
                  
                  {/* Show snippet of content if available */}
                  {post.content && (
                    <div 
                      className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 h-10"
                      dangerouslySetInnerHTML={{
                        __html: post.content
                          .replace(/<[^>]*>/g, '')
                          .substring(0, 120) + (post.content.length > 120 ? '...' : '')
                      }}
                    />
                  )}
                  
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t dark:border-gray-700 mt-auto">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {post.views || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md border ${
                    currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700' 
                      : 'bg-white hover:bg-gray-100 text-teal-600 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
                  }`}
                  aria-label="Previous page"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page Numbers */}
                {(() => {
                  return Array.from({ length: pageCount }, (_, i) => i + 1)
                    .map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === pageNum
                            ? 'bg-teal-600 text-white dark:bg-teal-700'
                            : 'bg-white hover:bg-gray-100 text-teal-600 dark:bg-gray-800 dark:border dark:border-gray-700 dark:hover:bg-gray-700'
                        }`}
                        aria-label={`Page ${pageNum}`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    ));
                })()}
                
                {/* Next button */}
                <button
                  onClick={() => currentPage < pageCount && onPageChange(currentPage + 1)}
                  disabled={currentPage >= pageCount}
                  className={`px-3 py-1 rounded-md border ${
                    currentPage >= pageCount
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700'
                      : 'bg-white hover:bg-gray-100 text-teal-600 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
                  }`}
                  aria-label="Next page"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

UserPosts.propTypes = {
  userId: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired
}; 