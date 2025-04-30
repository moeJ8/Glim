import { Table, Button, Select, TextInput, Spinner, Alert } from "flowbite-react"
import { HiOutlineExclamationCircle, HiOutlineSearch } from "react-icons/hi"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import CustomModal from "./CustomModal"

export default function DashPosts() {
  const {currentUser} = useSelector((state) => state.user);
  const [userPosts, setUserPosts] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try{
          // If user is admin, fetch all posts, otherwise fetch only user's posts
          const url = currentUser.isAdmin 
            ? `/api/post/getposts` 
            : `/api/post/getposts?userId=${currentUser._id}`;
            
          // Add category and search filters if they exist
          const categoryParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
          const searchParam = searchTerm ? `&searchTerm=${searchTerm}` : '';
          const fullUrl = `${url}${url.includes('?') ? '&' : '?'}limit=9${categoryParam}${searchParam}`;
          
          const res = await fetch(fullUrl);
          const data = await res.json();
          
          if(res.ok){
            setUserPosts(data.posts);
            if(data.posts.length < 9){
              setShowMore(false);
            } else {
              setShowMore(true);
            }
            
            // Extract unique categories for the filter
            if (data.posts.length > 0) {
              const uniqueCategories = [...new Set(data.posts.map(post => post.category))];
              setCategories(uniqueCategories);
            }
          } else {
            setError(data.message);
          }
      } catch(err){
        setError('Failed to fetch posts');
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser.isAdmin || currentUser.isPublisher) {
      fetchPosts();
    }
  }, [currentUser._id, currentUser.isAdmin, currentUser.isPublisher, selectedCategory, searchTerm]);
  
  const handleShowMore = async () => {
    const startIndex = userPosts.length;
    try{
      const url = currentUser.isAdmin 
        ? `/api/post/getposts?startIndex=${startIndex}` 
        : `/api/post/getposts?userId=${currentUser._id}&startIndex=${startIndex}`;
        
      const categoryParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
      const searchParam = searchTerm ? `&searchTerm=${searchTerm}` : '';
      const fullUrl = `${url}${categoryParam}${searchParam}`;
      
      const res = await fetch(fullUrl);
      const data = await res.json();
      
      if(res.ok){
        setUserPosts((prev) => [...prev, ...data.posts]);
        if(data.posts.length < 9){
          setShowMore(false);
        }
      } else {
        console.error(data.message);
      }
    } catch(err){
      console.log(err);
    }
  }

  const handleDeletePost = async () => {
    setShowModal(false);
    try {
      const res = await fetch(`/api/post/deletepost/${postIdToDelete}/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json()
      if(!res.ok){
        console.log(data.message);
        
      } else{
        setUserPosts((prev) => prev.filter((post) => post._id !== postIdToDelete));
      }

    } catch (err) {
      console.log(err);
    }
  }
  
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = () => {
    setSearchTerm(searchInput);
  };

  const handleRemoveFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setSearchInput('');
  };
  
  // Render posts as cards for mobile
  const renderPostCards = () => {
    return (
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {userPosts.map((post) => (
          <div key={post._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {/* Post Image */}
            <Link to={`/post/${post.slug}`}>
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300" 
              />
            </Link>
            
            {/* Post Info */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(post.updatedAt).toLocaleDateString()}
                </span>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded">
                  {post.category}
                </span>
              </div>
              
              <Link to={`/post/${post.slug}`} className="block mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                  {post.title}
                </h3>
              </Link>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Views:</span>
                  <span className="text-xs font-medium">{post.views || 0}</span>
                </div>
                
                {currentUser.isAdmin && post.userId && typeof post.userId === 'object' && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    By: <span className="font-medium">{post.userId.username}</span>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-between gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <Link 
                  to={`/update-post/${post._id}`} 
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white text-center py-2 px-3 rounded text-sm font-medium transition-colors"
                >
                  Edit Post
                </Link>
                <button
                  onClick={() => {
                    setShowModal(true);
                    setPostIdToDelete(post._id);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                >
                  Delete Post
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {showMore && (
          <div className="flex justify-center mt-4">
            <Button
              onClick={handleShowMore}
              color="teal"
              className="text-sm"
            >
              Show More
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] w-full">
        <div className="text-center">
          <Spinner size="xl" className="mx-auto" />
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <Alert color="failure">
          <span>{error}</span>
        </Alert>
      </div>
    );
  }

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <h1 className="text-center text-2xl sm:text-3xl my-4 sm:my-5 font-bold text-gray-800 dark:text-gray-100">
        Manage Posts
      </h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Category filter */}
        <div className="md:w-1/4">
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Select>
        </div>
        
        {/* Search input */}
        <div className="md:w-3/4 flex gap-2">
          <div className="flex-grow">
            <TextInput
              type="text"
              placeholder="Search by title or content..."
              value={searchInput}
              onChange={handleSearchInputChange}
              icon={HiOutlineSearch}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            />
          </div>
          <Button 
            outline
            gradientDuoTone="purpleToBlue"
            onClick={handleSearchSubmit}
          >
            Search
          </Button>
          <Button 
            outline
            gradientDuoTone="pinkToOrange"
            onClick={handleRemoveFilters}
          >
            Reset
          </Button>
        </div>
      </div>
      
      {(currentUser.isAdmin || currentUser.isPublisher) && userPosts.length > 0 ? (
        <>
          {isMobile ? (
            // Mobile card view
            renderPostCards()
          ) : (
            // Table view for desktop
            <div className="hidden md:block">
              <Table hoverable className="shadow-md">
                <Table.Head>
                  <Table.HeadCell>Date Updated</Table.HeadCell>
                  <Table.HeadCell>Post Image</Table.HeadCell>
                  <Table.HeadCell>Post Title</Table.HeadCell>
                  <Table.HeadCell>Post Category</Table.HeadCell>
                  <Table.HeadCell>Views</Table.HeadCell>
                  {currentUser.isAdmin && <Table.HeadCell>Author</Table.HeadCell>}
                  <Table.HeadCell>Delete</Table.HeadCell>
                  <Table.HeadCell>
                    <span>Edit</span>
                  </Table.HeadCell>
                </Table.Head>
                {userPosts.map((post) =>(
                  <Table.Body key={post._id} className="divide-y">
                    <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell>
                        {new Date(post.updatedAt).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell>
                        <Link to = {`/post/${post.slug}`}>
                        <img src= {post.image} alt="post" className="w-20 h-10 object-cover bg-gray-500" />
                        </Link>
                      </Table.Cell>
                      <Table.Cell>
                        <Link to={`/post/${post.slug}`} className="font-medium text-gray-900 dark:text-white">
                          {post.title}
                        </Link>
                      </Table.Cell>
                      <Table.Cell>
                        {post.category}
                      </Table.Cell>
                      <Table.Cell>
                        {post.views || 0}
                      </Table.Cell>
                      {currentUser.isAdmin && (
                        <Table.Cell>
                          {post.userId && typeof post.userId === 'object' ? post.userId.username : 'Unknown'}
                        </Table.Cell>
                      )}
                      <Table.Cell>
                        <span onClick={() => {
                          setShowModal(true)
                          setPostIdToDelete(post._id)
                        }} className="font-medium text-red-500 hover:underline cursor-pointer">
                          Delete
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <Link to={`/update-post/${post._id}`} className="text-teal-500 hover:underline">
                        <span>Edit</span>
                        </Link>
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                ))}
              </Table>
              {showMore && (
                <button onClick={handleShowMore} className="w-full text-teal-500 self-center text-sm py-7">
                  Show More
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">No posts found</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {selectedCategory !== 'all' || searchTerm 
              ? 'Try adjusting your filters or search term'
              : "You haven't created any posts yet"}
          </p>
          <div className="mt-4">
            <Link to="/create-post">
              <Button gradientDuoTone="purpleToPink">
                Create your first post
              </Button>
            </Link>
          </div>
        </div>
      )}
      
      {/* Delete Modal */}
      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Delete Post"
        maxWidth="md"
        footer={
          <div className="flex justify-center gap-4 w-full">
            <Button 
              color="failure" 
              onClick={handleDeletePost}
              className="bg-gradient-to-r from-red-500 to-pink-500"
            >
              Yes, delete it
            </Button>
            <Button color="gray" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        }
      >
        <div className="text-center py-4">
          <HiOutlineExclamationCircle className="h-14 w-14 text-red-500 dark:text-red-400 mb-4 mx-auto" />
          <h3 className="mb-5 text-lg text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this post?
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone. All data associated with this post will be permanently removed.
          </p>
        </div>
      </CustomModal>
    </div>
  );
}

