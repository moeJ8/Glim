import { Table, Modal, Button } from "flowbite-react"
import {HiOutlineExclamationCircle} from "react-icons/hi"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"

export default function DashPosts() {

  const {currentUser} = useSelector((state) => state.user);
  const [userPosts, setUserPosts] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try{
          // If user is admin, fetch all posts, otherwise fetch only user's posts
          const url = currentUser.isAdmin 
            ? `/api/post/getposts` 
            : `/api/post/getposts?userId=${currentUser._id}`;
            
          const res = await fetch(url);
          const data = await res.json();
          
          if(res.ok){
            setUserPosts(data.posts);
            if(data.posts.length < 9){
              setShowMore(false);
            }
          }
      }catch(err){
        console.log(err);
      }
    };
    if (currentUser.isAdmin || currentUser.isPublisher) {
      fetchPosts();
    }
  }, [currentUser._id, currentUser.isAdmin, currentUser.isPublisher]);
  
  const handleShowMore = async () => {
    const startIndex = userPosts.length;
    try{
      // If user is admin, fetch all posts, otherwise fetch only user's posts
      const url = currentUser.isAdmin 
        ? `/api/post/getposts?startIndex=${startIndex}` 
        : `/api/post/getposts?userId=${currentUser._id}&startIndex=${startIndex}`;
        
      const res = await fetch(url);
      const data = await res.json();
      
      if(res.ok){
        setUserPosts((prev) => [...prev, ...data.posts]);
        if(data.posts.length < 9){
          setShowMore(false);
        }
      }
    } catch(err){
      console.log(err);
    }
  }

  const handleDeletePost = async () => {
    setShowModal(false);
    try {
      const res = await fetch(`/api/post/deletepost/${postIdToDelete}/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json()
      if(!res.ok){
        console.log(data.message);
        
      } else{
        setUserPosts((prev) => prev.filter((post) => post._id !== postIdToDelete));
      }

    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {(currentUser.isAdmin || currentUser.isPublisher) && userPosts.length > 0 ? (
        <>
        <Table hoverable className="shadow-md">
        <Table.Head>
          <Table.HeadCell>Date Updated</Table.HeadCell>
          <Table.HeadCell>Post Image</Table.HeadCell>
          <Table.HeadCell>Post Title</Table.HeadCell>
          <Table.HeadCell>Post Category</Table.HeadCell>
          <Table.HeadCell>Views</Table.HeadCell>
          {currentUser.isAdmin && <Table.HeadCell>Author</Table.HeadCell>}
          <Table.HeadCell>Delete</Table.HeadCell>
          <Table.HeadCell>
            <span>Edit</span>
          </Table.HeadCell>
        </Table.Head>
        {userPosts.map((post) =>(
          <Table.Body key={post._id} className="divide-y">
            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell>
                {new Date(post.updatedAt).toLocaleDateString()}
              </Table.Cell>
              <Table.Cell>
                <Link to = {`/post/${post.slug}`}>
                <img src= {post.image} alt="post" className="w-20 h-10 object-cover bg-gray-500" />
                </Link>
              </Table.Cell>
              <Table.Cell>
                <Link to={`/post/${post.slug}`} className="font-medium text-gray-900 dark:text-white">
                  {post.title}
                </Link>
              </Table.Cell>
              <Table.Cell>
                {post.category}
              </Table.Cell>
              <Table.Cell>
                {post.views || 0}
              </Table.Cell>
              {currentUser.isAdmin && (
                <Table.Cell>
                  {post.userId && typeof post.userId === 'object' ? post.userId.username : 'Unknown'}
                </Table.Cell>
              )}
              <Table.Cell>
                <span onClick={() => {
                  setShowModal(true)
                  setPostIdToDelete(post._id)
                } } className="font-medium text-red-500 hover:underline cursor-pointer">
                  Delete
                </span>
              </Table.Cell>
              <Table.Cell>
                <Link to={`/update-post/${post._id}`} className="text-teal-500 hover:underline">
                <span>Edit</span>
                </Link>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        ))}
       
        </Table>
        {
          showMore && (
            <button onClick={handleShowMore} className="w-full text-teal-500 self-center text-sm py-7">
              Show More
            </button>
          )
        }
        </>
      ):(
        <p>You have no posts yet</p>
      )}
      <Modal show={showModal} onClose={()=> setShowModal(false)} popup size ='md'>
        <Modal.Header/>
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-red-500 dark:text-red-500 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">Are you sure you want to delete this post?</h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={()=> handleDeletePost()}>Yes, I&apos;m sure</Button>
              <Button color="gray" onClick={()=> setShowModal(false)}>No, cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}

