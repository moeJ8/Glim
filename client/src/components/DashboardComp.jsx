import { Button, Table } from "flowbite-react"
import { useEffect, useState } from "react"
import { HiAnnotation, HiArrowNarrowUp, HiDocumentText, HiOutlineUserGroup, HiInboxIn, HiBookOpen, HiExclamation } from "react-icons/hi"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
export default function DashboardComp() {
  const [users, setUsers] = useState([])
  const [comments, setComments] = useState([])
  const [posts, setPosts] = useState([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalPosts, setTotalPosts] = useState(0)
  const [totalComments, setTotalComments] = useState(0)
  const [totalRequests, setTotalRequests] = useState(0)
  const [approvedStories, setApprovedStories] = useState(0)
  const [pendingReports, setPendingReports] = useState(0)
  const [lastMonthUsers, setLastMonthUsers] = useState(0)
  const [lastMonthPosts, setLastMonthPosts] = useState(0)
  const [lastMonthComments, setLastMonthComments] = useState(0)
  const [lastMonthStories, setLastMonthStories] = useState(0)
  const {currentUser} = useSelector(state => state.user)


  useEffect(() => {
    const fetchUsers = async () => {
      try{
          const res = await fetch('/api/user/getusers?limit=5')
          const data = await res.json()
          if(res.ok) {
            setUsers(data.users)
            setTotalUsers(data.totalUsers)
            setLastMonthUsers(data.lastMonthUsers)
          }
      }catch(err) {
        console.log(err)
      }
    }
    const fetchPosts = async () => {
      try{
        const res = await fetch('/api/post/getposts?limit=5')
        const data = await res.json()
        if(res.ok) {
          setPosts(data.posts)
          setTotalPosts(data.totalPosts)
          setLastMonthPosts(data.lastMonthPosts)
        }
      } catch(err) {
        console.log(err)
      }
    }
    const fetchComments = async () => {
      try{
        const res = await fetch('/api/comment/getcomments?limit=5')
        const data = await res.json()
        if(res.ok) {
          setComments(data.comments)
          setTotalComments(data.totalComments)
          setLastMonthComments(data.lastMonthComments)
        }
      }catch(err) {
        console.log(err)
      }
    }
    const fetchRequests = async () => {
      try {
        // Fetch publisher requests
        const res = await fetch('/api/user/publisher-requests/get?status=pending', {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        const data = await res.json();
        
        // Fetch story counts
        const storyRes = await fetch('/api/story/counts');
        const storyData = await storyRes.json();
        
        let totalCount = 0;
        
        if (res.ok) {
          totalCount += data.totalRequests || 0;
        }
        
        if (storyRes.ok) {
          totalCount += storyData.pendingStories || 0;
        }
        
        setTotalRequests(totalCount);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchStories = async () => {
      try {
        const res = await fetch('/api/story/counts');
        const data = await res.json();
        
        if (res.ok) {
          setApprovedStories(data.approvedStories || 0);
          setLastMonthStories(data.lastMonthStories || 0);
        }
      } catch (err) {
        console.log(err);
      }
    };

    const fetchReports = async () => {
      try {
        const res = await fetch('/api/report?count=true', {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        const data = await res.json();
        
        if (res.ok) {
          setPendingReports(data.pendingReports || 0);
        }
      } catch (err) {
        console.log(err);
      }
    };
    
    if (currentUser.isAdmin) {
      fetchUsers();
      fetchPosts();
      fetchComments();
      fetchRequests();
      fetchStories();
      fetchReports();
    }
  },[currentUser])



  return (
    <div className="p-3 md:mx-auto">
      <div className="flex-wrap flex gap-4 justify-center">
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div>
              <h3 className="text-gray-500 text-md uppercase">Total Users</h3>
              <p className="text-2xl">{totalUsers}</p>
            </div>
              <HiOutlineUserGroup className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg"/>
          </div>
          <div className="flex gap-2 text-sm">
              <span className="text-green-500 flex items-center">
                <HiArrowNarrowUp />
                {lastMonthUsers}
              </span>
              <div className="text-gray-500">
                Last Month
              </div>
          </div>
        </div>
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div>
              <h3 className="text-gray-500 text-md uppercase">Total Posts</h3>
              <p className="text-2xl">{totalPosts}</p>
            </div>
              <HiDocumentText className="bg-lime-600 text-white rounded-full text-5xl p-3 shadow-lg"/>
          </div>
          <div className="flex gap-2 text-sm">
              <span className="text-green-500 flex items-center">
                <HiArrowNarrowUp />
                {lastMonthPosts}
              </span>
              <div className="text-gray-500">
                Last Month
              </div>
          </div>
        </div>
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div>
              <h3 className="text-gray-500 text-md uppercase">Approved Narratives</h3>
              <p className="text-2xl">{approvedStories}</p>
            </div>
              <HiBookOpen className="bg-amber-600 text-white rounded-full text-5xl p-3 shadow-lg"/>
          </div>
          <div className="flex gap-2 text-sm">
              <span className="text-green-500 flex items-center">
                <HiArrowNarrowUp />
                {lastMonthStories}
              </span>
              <div className="text-gray-500">
                Last Month
              </div>
          </div>
        </div>
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div>
              <h3 className="text-gray-500 text-md uppercase">Total Comments</h3>
              <p className="text-2xl">{totalComments}</p>
            </div>
              <HiAnnotation className="bg-indigo-600 text-white rounded-full text-5xl p-3 shadow-lg"/>
          </div>
          <div className="flex gap-2 text-sm">
              <span className="text-green-500 flex items-center">
                <HiArrowNarrowUp />
                {lastMonthComments}
              </span>
              <div className="text-gray-500">
                Last Month
              </div>
          </div>
        </div>
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div>
              <h3 className="text-gray-500 text-md uppercase">Pending Requests</h3>
              <p className="text-2xl">{totalRequests}</p>
            </div>
              <HiInboxIn className="bg-purple-600 text-white rounded-full text-5xl p-3 shadow-lg"/>
          </div>
          <div className="flex justify-end">
            <Link to="/dashboard?tab=requests">
              <Button outline gradientDuoTone="purpleToPink" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div>
              <h3 className="text-gray-500 text-md uppercase">Pending Reports</h3>
              <p className="text-2xl">{pendingReports}</p>
            </div>
              <HiExclamation className="bg-red-600 text-white rounded-full text-5xl p-3 shadow-lg"/>
          </div>
          <div className="flex justify-end">
            <Link to="/dashboard?tab=reports">
              <Button outline gradientDuoTone="purpleToPink" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 py-3 mx-auto justify-center">
        <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800">
          <div className="flex justify-between p-3 text-sm font-semibold">
            <h1 className="text-center p-2">Recent Users</h1>
            <Button outline gradientDuoTone="purpleToPink">
              <Link to={"/dashboard?tab=users"}>
                See All
              </Link>
            </Button>
          </div>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell> User Image</Table.HeadCell>
              <Table.HeadCell> Username</Table.HeadCell>
            </Table.Head>
            {users && users.map((user) => (
              <Table.Body key={user._id} className="divide-y">
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    <img 
                    src={user.profilePicture} 
                    alt="User" 
                    className="w-10 h-10 rounded-full bg-gray-500"
                    />
                  </Table.Cell>
                  <Table.Cell>
                    {user.username}
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
        </div>
        <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800">
          <div className="flex justify-between p-3 text-sm font-semibold">
            <h1 className="text-center p-2">Recent Posts</h1>
            <Button outline gradientDuoTone="purpleToPink">
              <Link to={"/dashboard?tab=posts"}>
                See All
              </Link>
            </Button>
          </div>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell> Post Image</Table.HeadCell>
              <Table.HeadCell> Post Title </Table.HeadCell>
              <Table.HeadCell> Category </Table.HeadCell>
            </Table.Head>
            {posts && posts.map((post) => (
              <Table.Body key={post._id} className="divide-y">
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="w-150">
                    <img 
                    src={post.image} 
                    alt="User" 
                    className="w-14 h-10 rounded-md bg-gray-500"
                    />
                  </Table.Cell>
                  <Table.Cell className="w-60">
                    <p className="line-clamp-2">
                      {post.title}
                    </p>
                  </Table.Cell>
                  <Table.Cell className="w-5">
                    {post.category}
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
        </div>
        <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800">
          <div className="flex justify-between p-3 text-sm font-semibold">
            <h1 className="text-center p-2">Recent Comments</h1>
            <Button outline gradientDuoTone="purpleToPink">
              <Link to={"/dashboard?tab=comments"}>
                See All
              </Link>
            </Button>
          </div>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell> Comment Content</Table.HeadCell>
              <Table.HeadCell> Likes </Table.HeadCell>
            </Table.Head>
            {comments && comments.map((comment) => (
              <Table.Body key={comment._id} className="divide-y">
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="w-96">
                    <p className="line-clamp-2">
                      {comment.content}
                    </p>
                  </Table.Cell>
                  <Table.Cell>
                    {comment.numberOfLikes}
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
        </div>
      </div>
    </div>
  )
}
