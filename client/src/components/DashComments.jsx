import { Table, Modal, Button, Spinner } from "flowbite-react"
import {HiOutlineExclamationCircle} from "react-icons/hi"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"

export default function DashComments() {
  const {currentUser} = useSelector((state) => state.user);
  const [comments, setComments] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        // Use different endpoint based on user role
        const endpoint = currentUser.isAdmin 
          ? `/api/comment/getComments` 
          : `/api/comment/getPublisherComments`;
          
        const res = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        
        const data = await res.json();
        
        if(res.ok){
          setComments(data.comments);
          if(data.comments.length < 9){
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
      fetchComments();
    }
  }, [currentUser]);
  
  const handleShowMore = async () => {
    const startIndex = comments.length;
    try{
      // Use different endpoint based on user role
      const endpoint = currentUser.isAdmin 
        ? `/api/comment/getComments?startIndex=${startIndex}` 
        : `/api/comment/getPublisherComments?startIndex=${startIndex}`;
        
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      
      const data = await res.json();
      
      if(res.ok){
        setComments((prev) => [...prev, ...data.comments]);
        if(data.comments.length < 9){
          setShowMore(false);
        }
      }
    } catch(err){
      console.log(err);
    }
  };

  const handleDeleteComment = async () => {
    setShowModal(false);
    try {
      const res = await fetch(`/api/comment/deleteComment/${commentIdToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      
      const data = await res.json();
      
      if(res.ok){
        setComments((prev) => prev.filter((comment) => comment._id !== commentIdToDelete));
      } else {
        console.log(data.error);
      }
    } catch(err){
      console.log(err.message);
    }
  };
  
  // Render comments as cards for mobile
  const renderCommentsCards = () => {
    return (
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {comments.map((comment) => (
          <div key={comment._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            {/* User Info and Date */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {comment.userId && typeof comment.userId === 'object' ? (
                  <>
                    <img 
                      src={comment.userId.profilePicture} 
                      alt={comment.userId.username}
                      className="w-10 h-10 rounded-full object-cover bg-gray-200" 
                    />
                    <span className="font-medium">{comment.userId.username}</span>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                    <span>Unknown User</span>
                  </>
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(comment.updatedAt).toLocaleDateString()}
              </div>
            </div>
            
            {/* Comment Content */}
            <div className="mb-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-gray-800 dark:text-gray-200">{comment.content}</p>
            </div>
            
            {/* Post and Likes Info */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Post:</span>
                {comment.postId && typeof comment.postId === 'object' ? (
                  <Link 
                    to={`/post/${comment.postId.slug}`} 
                    className="text-blue-500 hover:underline dark:text-blue-400 text-sm font-medium"
                  >
                    {comment.postId.title}
                  </Link>
                ) : (
                  <span className="text-sm">Unknown Post</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Likes:</span>
                <span className="text-sm font-medium">{comment.numberOfLikes}</span>
              </div>
            </div>
            
            {/* Delete Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowModal(true);
                  setCommentIdToDelete(comment._id);
                }}
                className="text-white bg-red-500 hover:bg-red-600 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                Delete Comment
              </button>
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
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading comments...</p>
        </div>
      </div>
    );
  }
 
  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <h1 className="text-center text-2xl sm:text-3xl my-4 sm:my-5 font-bold text-gray-800 dark:text-gray-100">
        Manage Comments
      </h1>
      
      {(currentUser.isAdmin || currentUser.isPublisher) && comments.length > 0 ? (
        <>
          {/* Table view for desktop */}
          <div className="hidden md:block">
            <Table hoverable className="shadow-md">
              <Table.Head>
                <Table.HeadCell>Date Updated</Table.HeadCell>
                <Table.HeadCell>Comment Content</Table.HeadCell>
                <Table.HeadCell>Number of Likes</Table.HeadCell>
                <Table.HeadCell>Post Title</Table.HeadCell>
                <Table.HeadCell>User</Table.HeadCell>
                <Table.HeadCell>Delete</Table.HeadCell>
              </Table.Head>
              {comments.map((comment) =>(
                <Table.Body key={comment._id} className="divide-y">
                  <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell>
                      {new Date(comment.updatedAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      {comment.content}
                    </Table.Cell>
                    <Table.Cell>
                      {comment.numberOfLikes}
                    </Table.Cell>
                    <Table.Cell>
                      {comment.postId && typeof comment.postId === 'object' ? (
                        <Link 
                          to={`/post/${comment.postId.slug}`} 
                          className="text-blue-500 hover:underline dark:text-blue-400"
                        >
                          {comment.postId.title}
                        </Link>
                      ) : (
                        "Unknown Post"
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {comment.userId && typeof comment.userId === 'object' ? (
                        <div className="flex items-center gap-2">
                          <img 
                            src={comment.userId.profilePicture} 
                            alt="user" 
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span>{comment.userId.username}</span>
                        </div>
                      ) : (
                        "Unknown User"
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <span onClick={() => {
                        setShowModal(true);
                        setCommentIdToDelete(comment._id);
                      }} className="font-medium text-red-500 hover:underline cursor-pointer">
                        Delete
                      </span>
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              ))}
            </Table>
            {showMore && (
              <button 
                onClick={handleShowMore} 
                className="w-full text-teal-500 self-center text-sm py-7"
              >
                Show More
              </button>
            )}
          </div>
          
          {/* Card view for mobile */}
          {renderCommentsCards()}
        </>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-8 rounded-lg shadow-sm text-center">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
            <HiOutlineExclamationCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium mb-1">No Comments Yet</h3>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            There are no comments to manage at this time.
          </p>
        </div>
      )}
      
      <Modal show={showModal} onClose={()=> setShowModal(false)} popup size="md">
        <Modal.Header/>
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-red-500 dark:text-red-500 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">Are you sure you want to delete this comment?</h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={()=> handleDeleteComment()}>Yes, I&apos;m sure</Button>
              <Button color="gray" onClick={()=> setShowModal(false)}>No, cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

