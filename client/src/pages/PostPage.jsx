import { Button, Spinner } from "flowbite-react";
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import CallToAction from "../components/CallToAction";
import CommentSection from "../components/CommentSection";
import PostCard from "../components/PostCard";
import { useSelector } from "react-redux";
import { HiPlus, HiMinus } from "react-icons/hi";

export default function PostPage() {
    const {postSlug} = useParams()
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [post, setPost] = useState(null);
    const [recentPosts, setRecentPosts] = useState(null);
    const { currentUser } = useSelector(state => state.user);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    

    useEffect(() => {
        const fetchPost = async () => {
            try{
                setLoading(true);
                const res = await fetch(`/api/post/getposts?slug=${postSlug}`);
                const data = await res.json();
                if(!res.ok){
                    setError(true);
                    setLoading(false);
                    return;
                }
                if(res.ok){
                    const postData = data.posts[0];
                    setPost(postData);
                    
                    // Get complete author data with followers information
                    if (postData?.userId?._id) {
                        try {
                            const authorRes = await fetch(`/api/user/${postData.userId._id}`, {
                                credentials: 'include'
                            });
                            const authorData = await authorRes.json();
                            
                            if (authorRes.ok) {
                                // Update post with complete author data
                                setPost(prev => ({
                                    ...prev,
                                    userId: authorData
                                }));
                            }
                        } catch (error) {
                            console.error('Error fetching author data:', error);
                        }
                    }
                    
                    setLoading(false);
                    setError(false);
                    
                    // Increment view count
                    if (data.posts[0]?._id) {
                        try {
                            await fetch(`/api/post/view/${data.posts[0]._id}`, {
                                method: 'PUT',
                            });
                        } catch (error) {
                            console.error('Error incrementing view count:', error);
                        }
                    }
                }
            } catch (err) {
                setError(true);
                setLoading(false);
                console.log(err);
                
            }
        }
        fetchPost();
    }, [postSlug])

    // Check if the current user is following the post author
    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!post?.userId || !currentUser) {
                console.log("Missing data for follow check:", { 
                    hasPostUserId: !!post?.userId,
                    hasCurrentUser: !!currentUser
                });
                return;
            }
            
            console.log("Follow check data:", {
                postAuthorId: post.userId._id,
                authorFollowers: post.userId.followers,
                currentUserId: currentUser._id,
                isAdmin: post.userId.isAdmin,
                isPublisher: post.userId.isPublisher,
                isSameUser: post.userId._id === currentUser._id
            });
            
            // Check if user's followers array includes currentUser id
            if (post.userId.followers && post.userId.followers.includes(currentUser._id)) {
                setIsFollowing(true);
            } else {
                setIsFollowing(false);
            }
        };
        
        checkFollowStatus();
    }, [post, currentUser]);

    useEffect(() => {
        try{
            const fetchRecentPosts = async () => {
                const res = await fetch('/api/post/getposts?limit=3');
                const data = await res.json();
                if(res.ok){
                    setRecentPosts(data.posts);
                }
            }
            fetchRecentPosts();
        } catch(err) {
            console.log(err);
        }
    }, [])

    const handleFollow = async () => {
        if (!currentUser) {
            // Redirect to sign in if not logged in
            window.location.href = "/sign-in";
            return;
        }
        
        if (!post?.userId || followLoading) return;
        
        setFollowLoading(true);
        
        try {
            const res = await fetch(`/api/user/follow/${post.userId._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                console.error(data.message);
                return;
            }
            
            setIsFollowing(true);
            
        } catch (err) {
            console.error("Error following user:", err);
        } finally {
            setFollowLoading(false);
        }
    };
    
    const handleUnfollow = async () => {
        if (!currentUser || !post?.userId || followLoading) return;
        
        setFollowLoading(true);
        
        try {
            const res = await fetch(`/api/user/unfollow/${post.userId._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                console.error(data.message);
                return;
            }
            
            setIsFollowing(false);
            
        } catch (err) {
            console.error("Error unfollowing user:", err);
        } finally {
            setFollowLoading(false);
        }
    };

    if(loading){
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner size="xl "/>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen text-red-500">
                <p>Something went wrong. Please try again later.</p>
            </div>
        );
    }
  return <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen"><h1 className="text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl">{post && post.title}</h1>
  <Link to={`/search?category=${post && post.category}`} className="self-center mt-5">
    <Button color="gray" pill size="xs">
        {post && post.category}
    </Button>
  </Link>
  
  {/* Author Info */}
  <div className="flex items-center justify-center gap-2 mt-6 mb-2">
    {post && post.userId && (
      <div className="flex items-center gap-2">
        <Link to={`/profile/${post.userId.username}`} className="flex items-center gap-2 hover:text-purple-700 dark:hover:text-purple-500">
          <img 
            src={post.userId.profilePicture} 
            alt={post.userId.username} 
            className="w-8 h-8 rounded-full object-cover border border-purple-800 dark:border-purple-500"
            loading="lazy"
          />
          <p className="text-sm font-medium">{post.userId.username}</p>
        </Link>
        
        {/* Follow/Unfollow button */}
        {currentUser && 
         post.userId && 
         currentUser._id !== post.userId._id && 
         (post.userId.isAdmin || post.userId.isPublisher) && (
          <div className="flex items-center ml-1 border-l border-gray-300 dark:border-gray-700 pl-2">
            {isFollowing ? (
              <button 
                onClick={handleUnfollow}
                disabled={followLoading}
                className="bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-full p-0.5 hover:opacity-90 w-5 h-5 flex items-center justify-center"
                title="Unfollow"
              >
                <HiMinus className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button 
                onClick={handleFollow}
                disabled={followLoading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-0.5 hover:opacity-90 w-5 h-5 flex items-center justify-center"
                title="Follow"
              >
                <HiPlus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    )}
  </div>

  <img src={post && post.image} alt={post && post.title} className="mt-2 p-3 max-h-[600px] w-full object-cover"/>
  <div className="flex justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-xs">
    <span>{post && new Date(post.createdAt).toLocaleDateString()}</span>
    <span className="italic">{post && (post.content.length /1000).toFixed(0)} mins read</span>
  </div>
  <div className="p-3 max-w-2xl mx-auto w-full post-content" dangerouslySetInnerHTML={{__html: post && post.content}}>

  </div>
  <div className="max-w-4xl mx-auto w-full">
    <CallToAction/>
  </div>
  <div className="">
    <CommentSection postId={post._id}/>
  </div>
  <div className="flex flex-col justify-center items-center mb-5">
    <h1 className="text-xl mt-5 mb-5">Recent Articles</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-3">
        {
            recentPosts &&
             recentPosts.map((post) => (
                <div key={post._id} className="w-full">
                    <PostCard post={post}/>
                </div>
             ))
        }
    </div>
  </div>
  </main>
}
