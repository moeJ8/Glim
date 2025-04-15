import { Alert, Button, Textarea } from "flowbite-react"
import { useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import PropTypes from 'prop-types';
import Comment from "../components/Comment";
import { Modal } from "flowbite-react";
import {HiOutlineExclamationCircle} from 'react-icons/hi';

export default function CommentSection({postId}) {
    const {currentUser} = useSelector(state => state.user)
    const [comment, setComment] = useState('')
    const [commentError, setCommentError] = useState(null);
    const [comments, setComments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);
    
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.length > 200) {
        return;
    }
    try {
      const res = await fetch('/api/comment/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: comment, 
            postId, 
            userId: currentUser._id
        }),
    });

    const data = await res.json();
    if (res.ok) {
        setComment('');
        setCommentError(null);
        setComments([data, ...comments])
    }
    if(!res.ok){
      setCommentError(data.message || "Failed to submit comment.");
      return;
    }
    
    } catch(err){
      setCommentError(err.message);
    }
    
};

useEffect(() => {
  const getComments = async () => {
    try{
      const res = await fetch(`/api/comment/getPostComments/${postId}`);
      if(res.ok){
        const data = await res.json();
        setComments(data);
      }
    }catch(err){
      console.log(err);
    }
  }
  getComments();
},[postId])

const handleLike = async (commentId) => {
    try{
      if(!currentUser){
        navigate('/sign-in');
        return;
      }
      const res = await fetch(`/api/comment/likeComment/${commentId}`,{
        method: 'PUT',
      });
      if(res.ok){
        const data = await res.json();
        // Check if this is a main comment or a reply
        const isMainComment = comments.some(c => c._id === commentId);
        
        if (isMainComment) {
          setComments(comments.map(comment => 
            comment._id === commentId ? {
              ...comment,
              likes: data.likes,
              numberOfLikes: data.likes.length,
            } : comment
          ));
        } else {
          // It's a reply, so we need to find the parent comment
          setComments(comments.map(comment => {
            if (comment.replies && comment.replies.some(reply => reply._id === commentId)) {
              return {
                ...comment,
                replies: comment.replies.map(reply => 
                  reply._id === commentId ? {
                    ...reply,
                    likes: data.likes,
                    numberOfLikes: data.likes.length,
                  } : reply
                )
              };
            }
            return comment;
          }));
        }
      }
      
    } catch (err){
      console.log(err);
    }
};

const handleEdit = async (comment, editedContent) => {
  setComments(comments.map((c)=>
    c._id === comment._id ? {...c, content: editedContent} : c));
};

const handleDelete = async (commentId) => {
  setShowModal(false);
  try{
    if(!currentUser){
      navigate('/sign-in');
      return;
    }
    const res = await fetch(`/api/comment/deleteComment/${commentId}`,{
      method: 'DELETE',
    })
    if(res.ok){
      await res.json();
      
      // Check if this is a main comment
      const isMainComment = comments.some(c => c._id === commentId);
      
      if (isMainComment) {
        setComments(comments.filter((comment) => comment._id !== commentId));
      } else {
        // It's a reply, find the parent and remove the reply
        setComments(comments.map(comment => {
          if (comment.replies && comment.replies.some(reply => reply._id === commentId)) {
            return {
              ...comment,
              replies: comment.replies.filter(reply => reply._id !== commentId)
            };
          }
          return comment;
        }));
      }
    }
  } catch(err){
    console.log(err.message);
  }
}

const handleReply = (parentId, newReply) => {
  setComments(comments.map(comment => 
    comment._id === parentId ? {
      ...comment,
      replies: [...(comment.replies || []), newReply]
    } : comment
  ));
}

return (
    <div className="max-w-2xl mx-auto w-full p-3">
      {currentUser ? 
      (
        <div className="flex items-center gap-1 my-5 text-gray-500 text-sm">
            <p>Signed in as:</p>
            <img className="h-5 w-5 object-cover rounded-full" src={currentUser.profilePicture} alt="" />
            <Link to={'/dashboard?tab=profile'} className="text-xs text-cyan-700 dark:text-cyan-400 hover:underline">
                @{currentUser.username}
            </Link>
        </div>
      ):
      (
        <div className="text-sm text-teal-500 my-5 flex gap-1">
            You must be signed in to comment
            <Link to={'/sign-in'} className="text-blue-500 hover:underline">
                Sign in
            </Link>
        </div>
        
      )
    }
    {currentUser && (
            <form onSubmit={handleSubmit} className="border border-purple-700 dark:border-purple-500 rounded-md p-3">
                <Textarea
                    placeholder="Add a comment..."
                    rows='3'
                    maxLength='200'
                    onChange={(e) => setComment(e.target.value)}
                    value={comment}
                />
                <div className="flex justify-between items-center mt-5">
                    <p className="text-gray-500 text-xs">{200 - comment.length} characters remaining</p>
                    <Button outline gradientDuoTone="purpleToBlue" type="submit">
                        Submit
                    </Button>
                </div>
                {commentError &&(
                  <Alert color='failure' className="mt-5">
                    {commentError}
                  </Alert>)}
              
            </form>
        )}
        {comments.length === 0 ? (
          <p className="text-sm my-5">No comments yet</p>
        ): (
          <>
            <div className="text-sm my-5 flex items-center gap-1">
            <p>Comments</p>
            <div className="border border-gray-400 py-1 px-2 rounded-sm">
            <p>{comments.length}</p>
            </div>
          </div>
            {
              comments.map(comment => (
                <Comment key={comment._id} comment={comment}
                 onLike={handleLike}
                 onEdit={handleEdit}
                 onDelete={(commentId)=>{
                  setShowModal(true)
                  setCommentToDelete(commentId)
                 }}
                 onReply={handleReply}/>
              ))
            }
          </>

        )}
        <Modal show={showModal} onClose={()=> setShowModal(false)} popup size ='md'>
        <Modal.Header/>
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-red-500 dark:text-red-500 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">Are you sure you want to delete this comment?</h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={()=> handleDelete(commentToDelete)}>Yes, I&apos;m sure</Button>
              <Button color="gray" onClick={()=> setShowModal(false)}>No, cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

CommentSection.propTypes = {
  postId: PropTypes.string.isRequired,
};
