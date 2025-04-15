import PropTypes from "prop-types";
import { Link } from "react-router-dom"

export default function PostCard({post}) {
  return (
    <div className="group relative w-full border border-teal-500 hover:border-2 h-[380px] overflow-hidden rounded-lg transition-all">
      <Link to={`/post/${post.slug}`}>
        <img src={post.image} loading="lazy" alt="Post Cover" className="h-[260px] w-full object-cover group-hover:h-[200px] transition-all duration-300 z-20"/>
      </Link>
      <div className="p-3 flex flex-col gap-2">
        <p className="text-lg font-semibold line-clamp-2">{post.title}</p>
        <div className="flex justify-between items-center">
          <span className="italic text-sm">{post.category}</span>
          {post.userId && (
            <Link 
              to={`/profile/${post.userId.username}`}
              className="flex items-center gap-1 text-xs"
            >
              <img 
                src={post.userId.profilePicture} 
                alt={post.userId.username}
                className="w-4 h-4 rounded-full object-cover border border-purple-500" 
              />
              <span className="text-xs text-gray-500">{post.userId.username}</span>
            </Link>
          )}
        </div>
        <Link to={`/post/${post.slug}`} className="z-10 group-hover:bottom-0 absolute bottom-[-200px] left-0 right-0 border border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white transition-all duration-300 text-center py-2 rounded-md !rounded-tl-none m-2">
          Read Article
        </Link>
      </div>
    </div>
  )
}

PostCard.propTypes = {
  post: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    userId: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      profilePicture: PropTypes.string.isRequired,
    }),
  }).isRequired,
};