import { Table, Modal, Button } from "flowbite-react"
import {HiOutlineExclamationCircle} from "react-icons/hi"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"

export default function DashPosts() {

  const {currentUser} = useSelector((state) => state.user);
  const [userPosts, setUserPosts] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try{
          // If user is admin, fetch all posts, otherwise fetch only user's posts
          const url = currentUser.isAdmin 
            ? `/api/post/getposts` 
            : `/api/post/getposts?userId=${currentUser._id}`;
            
          const res = await fetch(url);
          const data = await res.json();
          
          if(res.ok){
            setUserPosts(data.posts);
            if(data.posts.length < 9){
              setShowMore(false);
            }
          }
      } catch(err){
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser.isAdmin || currentUser.isPublisher) {
      fetchPosts();
    }
  }, [currentUser._id, currentUser.isAdmin, currentUser.isPublisher]);
  
  const handleShowMore = async () => {
    const startIndex = userPosts.length;
    try{
      const url = currentUser.isAdmin 
        ? `/api/post/getposts?startIndex=${startIndex}` 
        : `/api/post/getposts?userId=${currentUser._id}&startIndex=${startIndex}`;
        
      const res = await fetch(url);
      const data = await res.json();
      
      if(res.ok){
        setUserPosts((prev) => [...prev, ...data.posts]);
        if(data.posts.length < 9){
          setShowMore(false);
        }
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
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="text-center">
          <span className="loading loading-spinner text-primary"></span>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <h1 className="text-center text-2xl sm:text-3xl my-4 sm:my-5 font-bold text-gray-800 dark:text-gray-100">
        Manage Posts
      </h1>
      
      {(currentUser.isAdmin || currentUser.isPublisher) && userPosts.length > 0 ? (
        <>
          {/* Table view for desktop */}
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
                      } } className="font-medium text-red-500 hover:underline cursor-pointer">
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
          
          {/* Card view for mobile */}
          {renderPostCards()}
        </>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-8 rounded-lg shadow-sm text-center">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
            <HiOutlineExclamationCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium mb-1">No Posts Yet</h3>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            You haven&apos;t created any posts yet.
          </p>
        </div>
      )}
      
      <Modal show={showModal} onClose={()=> setShowModal(false)} popup size ='md'>
        <Modal.Header/>
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-red-500 dark:text-red-500 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">Are you sure you want to delete this post?</h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={()=> handleDeletePost()}>Yes, I&apos;m sure</Button>
              <Button color="gray" onClick={()=> setShowModal(false)}>No, cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}

