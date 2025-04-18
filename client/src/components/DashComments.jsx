import { Table, Modal, Button } from "flowbite-react"
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }
 
  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {(currentUser.isAdmin || currentUser.isPublisher) && comments.length > 0 ? (
        <>
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
        </>
      ) : (
        <p>You have no comments yet</p>
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

