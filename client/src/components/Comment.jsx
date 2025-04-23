import { useState } from "react"
import PropTypes from 'prop-types';
import moment from 'moment';
import {FaThumbsUp} from 'react-icons/fa';
import { useSelector } from "react-redux";
import { Button, Textarea, Alert } from "flowbite-react";
import { Link } from "react-router-dom";
import { FaReply, FaChevronDown, FaChevronUp, FaFlag } from 'react-icons/fa';
import ReportModal from './ReportModal';

export default function Comment({comment, onLike, onEdit, onDelete, onReply}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.content);
    const {currentUser} = useSelector(state => state.user);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [replyError, setReplyError] = useState(null);
    const [showReplies, setShowReplies] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

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
                        <Textarea
                            className="mb-2"
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                        />
                        <div className="flex justify-end gap-2 text-xs">
                            <Button
                                type="button"
                                size="sm"
                                gradientDuoTone="purpleToBlue"
                                onClick={handleSave}
                            >
                                Save
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                gradientDuoTone="purpleToBlue"
                                outline
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-gray-600 dark:text-gray-300 pb-2 break-all">{comment.content}</p>
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
                                    <button type="button" onClick={() => onDelete(comment._id)} className="text-gray-400 hover:text-red-500">
                                        Delete
                                    </button>
                                </>
                            )}
                            {currentUser && currentUser._id !== comment.userId._id && (
                                <button 
                                    type="button" 
                                    onClick={() => setShowReportModal(true)} 
                                    className="text-gray-400 hover:text-red-500 flex items-center gap-1"
                                >
                                    <FaFlag className="text-sm"/>
                                    Report
                                </button>
                            )}
                        </div>
                        
                        {showReplyForm && (
                            <div className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                <Textarea
                                    placeholder="Write a reply..."
                                    rows='2'
                                    maxLength='200'
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    value={replyContent}
                                    className="mb-2"
                                />
                                <div className="flex justify-between items-center">
                                    <p className="text-gray-500 text-xs">{200 - replyContent.length} characters remaining</p>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            size="xs"
                                            gradientDuoTone="purpleToBlue"
                                            onClick={handleReplySubmit}
                                        >
                                            Reply
                                        </Button>
                                        <Button
                                            type="button"
                                            size="xs"
                                            gradientDuoTone="purpleToBlue"
                                            outline
                                            onClick={() => {
                                                setShowReplyForm(false);
                                                setReplyContent('');
                                                setReplyError(null);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                                {replyError && (
                                    <Alert color='failure' className="mt-2 text-xs">
                                        {replyError}
                                    </Alert>
                                )}
                            </div>
                        )}
                        
                        {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-3">
                                <button 
                                    onClick={() => setShowReplies(!showReplies)}
                                    className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
                                >
                                    {showReplies ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                                    {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                                </button>
                                
                                {showReplies && (
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
                                                <p className="text-gray-600 dark:text-gray-300 text-xs ml-8">{reply.content}</p>
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
                                                    {currentUser && reply.userId && (currentUser._id === reply.userId._id || currentUser.isAdmin) && (
                                                        <>
                                                            <button type="button" onClick={() => onDelete(reply._id)} className="text-gray-400 hover:text-red-500 text-xs">
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                    {currentUser && reply.userId && currentUser._id !== reply.userId._id && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setShowReportModal(true)} 
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
                            </div>
                        )}
                    </>
                )}
            </div>
            {showReportModal && (
                <ReportModal
                    show={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    targetId={comment._id}
                    targetType="comment"
                />
            )}
        </div>
    )
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