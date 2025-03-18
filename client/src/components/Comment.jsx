import { useEffect } from "react"
import PropTypes from 'prop-types';
import { useState } from "react";
import moment from 'moment';

export default function Comment({comment}) {
    const [user, setUser] = useState({});

    useEffect(() => {
        const getUser = async () => {
            try{
                const res = await fetch(`/api/user/${comment.userId}`);
                const data = await res.json();
                if(res.ok){
                    setUser(data)
                }
            } catch(err){
                console.log(err.message)
            }
        }
        getUser();
    },[comment])
  return (
    <div className="flex p-4 border-b dark:border-gray-600 text-sm">
      <div className="flex-shrink-0 mr-3">
        <img src={user.profilePicture} alt={user.username} className="w-10 h-10 rounded-full bg-gray-200" />
      </div>
      <div className="">
        <div className="flex items-center mb-1">
            <span className="font-bold mr-1 text-xs truncate">{user ? `@${user.username}` : "annonymous user"}</span>
            <span className="text-gray-500 text-xs">
                {moment(comment.createdAt).fromNow()}
            </span>
        </div>
        <p className="text-gray-500 pb-2">{comment.content}</p>
      </div>
    </div>
  )
}
Comment.propTypes = {
    comment: PropTypes.shape({
        userId: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
    }).isRequired,
};