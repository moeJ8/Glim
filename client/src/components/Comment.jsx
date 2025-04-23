import { useState, useEffect, useRef } from "react"
import PropTypes from 'prop-types';
import moment from 'moment';
import {FaThumbsUp} from 'react-icons/fa';
import { useSelector } from "react-redux";
import { Button, Textarea, Alert, Modal } from "flowbite-react";
import { Link } from "react-router-dom";
import { FaReply, FaChevronDown, FaChevronUp, FaFlag } from 'react-icons/fa';
import ReportModal from './ReportModal';
import { HiOutlineExclamationCircle } from "react-icons/hi";
import MentionSuggestions from "./MentionSuggestions";

export default function Comment({comment, onLike, onEdit, onDelete, onReply}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.content);
    const {currentUser} = useSelector(state => state.user);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [replyError, setReplyError] = useState(null);
    const [showReplies, setShowReplies] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [currentReportTarget, setCurrentReportTarget] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);
    
    const editTextareaRef = useRef(null);
    const replyTextareaRef = useRef(null);
    const activeTextareaRef = useRef(null);
    
    const editMentionSuggestions = MentionSuggestions({
        textareaRef: editTextareaRef,
        content: editedContent,
        setContent: setEditedContent
    });
    
    const replyMentionSuggestions = MentionSuggestions({
        textareaRef: replyTextareaRef,
        content: replyContent,
        setContent: setReplyContent
    });

    useEffect(() => {
        if (isEditing) {
            activeTextareaRef.current = editTextareaRef.current;
        } else if (showReplyForm) {
            activeTextareaRef.current = replyTextareaRef.current;
        } else {
            activeTextareaRef.current = null;
        }
    }, [isEditing, showReplyForm]);

    const handleEdit = () => {
        setIsEditing(true);
        setEditedContent(comment.content);
    }

    const handleSave = async () => {
        try{
            const res = await fetch(`/api/comment/editComment/${comment._id}`,{
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: editedContent
                })
            });
            if(res.ok){
                setIsEditing(false);
                onEdit(comment, editedContent);
            }
        } catch(err){
            console.log(err.message)
        }
    }

    const handleReplySubmit = async () => {
        if (!replyContent.trim()) {
            setReplyError("Reply cannot be empty");
            return;
        }
        
        try {
            const res = await fetch('/api/comment/reply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: replyContent,
                    postId: comment.postId._id,
                    userId: currentUser._id,
                    parentId: comment._id
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setReplyContent('');
                setShowReplyForm(false);
                setReplyError(null);
                onReply(comment._id, data);
                setShowReplies(true);
            } else {
                setReplyError(data.message || "Failed to submit reply.");
            }
        } catch (err) {
            setReplyError(err.message);
        }
    }

    const handleReportComment = () => {
        setCurrentReportTarget(comment._id);
        setShowReportModal(true);
    }

    const handleReportReply = (replyId) => {
        setCurrentReportTarget(replyId);
        setShowReportModal(true);
    }

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedContent(comment.content);
    }

    const handleCancelReply = () => {
        setShowReplyForm(false);
        setReplyContent('');
        setReplyError(null);
    }

    const formatContent = (content) => {
        const parts = content.split(/(@\w+)/g);
        
        return parts.map((part, index) => {
            if (part.match(/^@\w+$/)) {
                const username = part.substring(1);
                return (
                    <Link 
                        key={index} 
                        to={`/profile/${username}`} 
                        className="text-blue-600 hover:underline"
                    >
                        {part}
                    </Link>
                );
            }
            return part;
        });
    }

    return (
        <div className="flex p-4 border-b dark:border-gray-600 text-sm">
            <div className="flex-shrink-0 mr-3">
                <Link to={`/profile/${comment.userId.username}`}>
                    <img 
                        src={comment.userId.profilePicture} 
                        alt={comment.userId.username} 
                        className="w-10 h-10 rounded-full bg-gray-200 hover:ring-2 hover:ring-blue-500" 
                    />
                </Link>
            </div>
            <div className="flex-1">
                <div className="flex items-center mb-1">
                    <Link to={`/profile/${comment.userId.username}`} className="hover:text-blue-500">
                        <span className="font-bold mr-1 text-xs truncate">
                            @{comment.userId.username}
                        </span>
                    </Link>
                    <span className="text-gray-500 text-xs">
                        {moment(comment.createdAt).fromNow()}
                    </span>
                </div>
                {isEditing ? (
                    <>
                        <div className="relative">
                            <Textarea
                                ref={editTextareaRef}
                                className="mb-2"
                                value={editedContent}
                                onChange={editMentionSuggestions.handleTextareaChange}
                                rows={3}
                            />
                            {editMentionSuggestions.renderSuggestions()}
                        </div>
                        <div className="flex gap-2">
                            <Button size="xs" outline gradientDuoTone="purpleToBlue" onClick={handleSave}>
                                Save
                            </Button>
                            <Button size="xs" outline gradientDuoTone="pinkToOrange" onClick={handleCancelEdit}>
                                Cancel
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-gray-600 dark:text-gray-300 pb-2 break-all">{formatContent(comment.content)}</p>
                        <div className="flex items-center pt-2 text-xs border-t dark:border-gray-700 max-w-fit gap-2">
                            <button 
                                type="button" 
                                onClick={() => onLike(comment._id)} 
                                className={`text-gray-400 hover:text-blue-500 ${currentUser && comment.likes.includes(currentUser._id) && '!text-blue-500'}`}
                            >
                                <FaThumbsUp className="text-sm"/>
                            </button>
                            <p className="text-gray-400">
                                {comment.likes.length > 0 && comment.numberOfLikes + " " + (comment.numberOfLikes === 1 ? "like" : "likes")}
                            </p>
                            {currentUser && (
                                <>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowReplyForm(!showReplyForm)} 
                                        className="text-gray-400 hover:text-blue-500 flex items-center gap-1"
                                    >
                                        <FaReply className="text-sm"/>
                                        Reply
                                    </button>
                                </>
                            )}
                            {currentUser && (currentUser._id === comment.userId._id || currentUser.isAdmin) && (
                                <>
                                    <button type="button" onClick={handleEdit} className="text-gray-400 hover:text-blue-500">
                                        Edit
                                    </button>
                                    <button type="button" onClick={() => setShowModal(true)} className="text-gray-400 hover:text-red-500">
                                        Delete
                                    </button>
                                </>
                            )}
                            {currentUser && currentUser._id !== comment.userId._id && (
                                <button 
                                    type="button" 
                                    onClick={handleReportComment} 
                                    className="text-gray-400 hover:text-red-500 flex items-center gap-1"
                                >
                                    <FaFlag className="text-sm"/>
                                    Report
                                </button>
                            )}
                        </div>
                        
                        {showReplyForm && (
                            <div className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                <div className="relative">
                                    <Textarea
                                        ref={replyTextareaRef}
                                        placeholder="Write a reply..."
                                        rows={3}
                                        value={replyContent}
                                        onChange={replyMentionSuggestions.handleTextareaChange}
                                        className="mb-2"
                                    />
                                    {replyMentionSuggestions.renderSuggestions()}
                                </div>
                                
                                {replyError && (
                                    <Alert color='failure' className="my-2">
                                        {replyError}
                                    </Alert>
                                )}
                                
                                <div className="flex gap-2">
                                    <Button size="xs" outline gradientDuoTone="purpleToBlue" onClick={handleReplySubmit}>
                                        Reply
                                    </Button>
                                    <Button size="xs" outline gradientDuoTone="pinkToOrange" onClick={handleCancelReply}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                        
                        {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-3">
                                <button 
                                    onClick={() => setShowReplies(!showReplies)} 
                                    className="flex items-center text-xs text-blue-500 hover:underline"
                                >
                                    {showReplies ? (
                                        <>
                                            <FaChevronUp className="mr-1" />
                                            Hide {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                                        </>
                                    ) : (
                                        <>
                                            <FaChevronDown className="mr-1" />
                                            Show {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                        
                        {showReplies && comment.replies && comment.replies.length > 0 && (
                            <div className="mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                {comment.replies.map(reply => (
                                    <div key={reply._id} className="py-2 border-b dark:border-gray-700 last:border-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {reply.userId ? (
                                                <>
                                                    <Link to={`/profile/${reply.userId.username}`}>
                                                        <img 
                                                            src={reply.userId.profilePicture} 
                                                            alt={reply.userId.username} 
                                                            className="w-6 h-6 rounded-full bg-gray-200" 
                                                        />
                                                    </Link>
                                                    <Link to={`/profile/${reply.userId.username}`} className="hover:text-blue-500">
                                                        <span className="font-bold text-xs">
                                                            @{reply.userId.username}
                                                        </span>
                                                    </Link>
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-500">Deleted User</span>
                                            )}
                                            <span className="text-gray-500 text-xs">
                                                {moment(reply.createdAt).fromNow()}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-xs ml-8">{formatContent(reply.content)}</p>
                                        <div className="flex items-center mt-1 ml-8 text-xs gap-2">
                                            <button 
                                                type="button" 
                                                onClick={() => onLike(reply._id)} 
                                                className={`text-gray-400 hover:text-blue-500 ${currentUser && reply.likes && reply.likes.includes(currentUser._id) && '!text-blue-500'}`}
                                            >
                                                <FaThumbsUp className="text-xs"/>
                                            </button>
                                            <p className="text-gray-400 text-xs">
                                                {reply.likes && reply.likes.length > 0 && reply.numberOfLikes + " " + (reply.numberOfLikes === 1 ? "like" : "likes")}
                                            </p>
                                            {currentUser && (currentUser._id === reply.userId?._id || currentUser.isAdmin) && (
                                                <>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => {
                                                            setShowModal(true);
                                                            setCommentToDelete(reply._id);
                                                        }} 
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                            {currentUser && reply.userId && currentUser._id !== reply.userId._id && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleReportReply(reply._id)} 
                                                    className="text-gray-400 hover:text-red-500 flex items-center gap-1"
                                                >
                                                    <FaFlag className="text-xs"/>
                                                    Report
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {/* Delete confirmation modal */}
            <Modal show={showModal} onClose={() => setShowModal(false)} popup size='sm'>
                <Modal.Header />
                <Modal.Body>
                    <div className="text-center">
                        <HiOutlineExclamationCircle className="h-14 w-14 text-red-500 dark:text-red-500 mb-4 mx-auto" />
                        <h3 className="mb-5 text-lg text-gray-600 dark:text-gray-400">
                            Are you sure you want to delete this comment?
                        </h3>
                        <div className="flex justify-center gap-4">
                            <Button color="failure" onClick={() => {
                                onDelete(commentToDelete || comment._id);
                                setShowModal(false);
                            }}>
                                Yes, delete it
                            </Button>
                            <Button color="gray" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
            
            {/* Report modal */}
            {showReportModal && (
                <ReportModal
                    show={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    targetId={currentReportTarget}
                    targetType="comment"
                />
            )}
        </div>
    );
}

Comment.propTypes = {
    comment: PropTypes.shape({
        userId: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            username: PropTypes.string.isRequired,
            profilePicture: PropTypes.string.isRequired,
        }).isRequired,
        content: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
        _id: PropTypes.string.isRequired,
        likes: PropTypes.arrayOf(PropTypes.string).isRequired,
        numberOfLikes: PropTypes.number,
        postId: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            title: PropTypes.string,
            slug: PropTypes.string
        }).isRequired,
        replies: PropTypes.array
    }).isRequired,
    onLike: PropTypes.func.isRequired, 
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onReply: PropTypes.func.isRequired,
};