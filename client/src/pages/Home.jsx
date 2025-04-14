import { Link } from "react-router-dom";
import CallToAction from "../components/CallToAction";
import Hero from "../components/Hero";
import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import MostReadPosts from "../components/MostReadPosts";

export default function Home() {
  const [posts, setPosts] = useState([]);

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
        {
          posts && posts.length > 0 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold text-center">Recent Posts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {
                  posts.slice(0, 6).map((post) => (
                    <div key={post._id} className="w-full">
                      <PostCard post={post} />
                    </div>
                  ))
                }
              </div>
              <Link to={'/categories'} className="text-lg text-teal-500 hover:underline text-center">
                View All Posts
              </Link>
            </div>
          )
        }
      </div>
      
      {/* Most Read Posts Carousel */}
      <div className="max-w-4xl mx-auto p-2 flex flex-col gap-8 mb-6">
        <MostReadPosts />
      </div>
      
      <div className="p-1">
        <CallToAction />
      </div>
    </div>
  )
}
