import { Link } from "react-router-dom";
import CallToAction from "../components/CallToAction";
import Hero from "../components/Hero";
import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import MostReadPosts from "../components/MostReadPosts";
import RecentStories from "../components/RecentStories";
import { useSelector } from "react-redux";
import { Button } from "flowbite-react";
import FrequentlyAskedQuestions from "../components/FrequentlyAskedQuestions";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const { currentUser } = useSelector(state => state.user);

  useEffect(() => {
    try{
        const fetchPosts = async () => {
        const response = await fetch("/api/post/getposts?sort=desc");
        const data = await response.json();
        setPosts(data.posts);
      }
      fetchPosts();
    }catch(err){
      console.log(err)
    }
  },[])
  return (
    <div>
      <Hero />
      
      {/* Recent Posts */}
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Recent Posts</h2>
          {currentUser && (currentUser.isAdmin || currentUser.isPublisher) && (
            <Link to="/create-post">
              <Button gradientDuoTone="purpleToPink" className="font-semibold">
                Create Post
              </Button>
            </Link>
          )}
        </div>
        {
          posts && posts.length > 0 && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {
                  posts.slice(0, 6).map((post) => (
                    <div key={post._id} className="w-full">
                      <PostCard post={post} />
                    </div>
                  ))
                }
              </div>
              <Link to={'/posts'} className="text-lg text-teal-500 hover:underline text-center">
                View All Posts
              </Link>
            </div>
          )
        }
      </div>
      
      {/* Most Read Posts Carousel */}
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Most Read Posts</h2>
        </div>
        <MostReadPosts />
      </div>
      
      {/* Recent Stories Section */}
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Recent Narratives</h2>
          {currentUser && (currentUser.isAdmin || currentUser.isPublisher) && (
            <Link to="/create-narrative">
              <Button gradientDuoTone="purpleToPink" className="w-full sm:w-auto">
                Create Narrative
              </Button>
            </Link>
          )}
        </div>
        <RecentStories />
      </div>
      
      <div className="p-1">
        <CallToAction />
      </div>

      {/* FAQ Section */}
      <FrequentlyAskedQuestions />
    </div>
  )
}
