import { Sidebar } from "flowbite-react";
import { HiUser, HiArrowSmRight, HiDocumentText, HiOutlineUserGroup, HiAnnotation, HiChartPie, HiInboxIn, HiExclamation } from "react-icons/hi";
import { FaBookOpen, FaList } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { signoutSuccess } from "../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { setPendingRequests } from "../redux/request/requestSlice";
import { setPendingReports } from "../redux/report/reportSlice";

export default function DashSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const {currentUser} = useSelector((state) => state.user);
  const {pendingRequests} = useSelector((state) => state.request);
  const {pendingReports} = useSelector((state) => state.report);
  const [tab, setTab] = useState('');
  const [pendingStories, setPendingStories] = useState(0);
  const [totalPendingRequests, setTotalPendingRequests] = useState(0);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if(tabFromUrl) {
      setTab(tabFromUrl)
    }
  }, [location.search])

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const res = await fetch('/api/user/publisher-requests/get?status=pending', {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          dispatch(setPendingRequests(data.totalRequests));
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    if (currentUser && currentUser.isAdmin) {
      fetchPendingRequests();
      // Set up polling every 30 seconds
      const interval = setInterval(fetchPendingRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser, dispatch]);

  useEffect(() => {
    const fetchPendingReports = async () => {
      try {
        const res = await fetch('/api/report?status=pending&page=1&limit=1', {
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) {
          dispatch(setPendingReports(data.totalReports));
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    if (currentUser && currentUser.isAdmin) {
      fetchPendingReports();
      // Set up polling every 30 seconds
      const interval = setInterval(fetchPendingReports, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser, dispatch]);

  useEffect(() => {
    // Fetch pending stories count for admin
    const fetchPendingStories = async () => {
      try {
        const res = await fetch('/api/story/counts');
        const data = await res.json();
        
        if (res.ok) {
          const newPendingStories = data.pendingStories;
          setPendingStories(newPendingStories);
          // Calculate total pending requests
          setTotalPendingRequests(pendingRequests + newPendingStories);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    
    if (currentUser && currentUser.isAdmin) {
      fetchPendingStories();
      // Set up polling every 30 seconds
      const interval = setInterval(fetchPendingStories, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser, pendingRequests]);

  const handleSignOut = async () => {
    try{
      const res = await fetch('api/user/signout',{
        method: 'POST',
      });
      const data = await res.json();
      if(!res.ok) {
        console.log(data.message)
      }else{
        dispatch(signoutSuccess());
      }
    } catch(error) {
      console.log(error.message)
    }
  };

  return (
    <Sidebar className="w-full md:w-56">
      <Sidebar.Items>
        <Sidebar.ItemGroup className="flex flex-col gap-1">
            {
              currentUser && currentUser.isAdmin && (
               <Link to={`/dashboard?tab=dashboard`}>
                <Sidebar.Item active={tab==='dashboard' || !tab} icon={HiChartPie} as='div'>
                  Dashboard
                </Sidebar.Item>
                </Link>
            )}
            <Link to={`/dashboard?tab=profile`}>
              <Sidebar.Item active={tab === 'profile'} icon={HiUser}
               label={currentUser.isAdmin ? 'Admin' : currentUser.isPublisher ? 'Publisher' : 'User'} 
               labelColor='dark' as='div'>
                Profile
              </Sidebar.Item>
          </Link>
          {/* Posts tab for both admin and publisher */}
          {(currentUser.isAdmin || currentUser.isPublisher) && (
            <Link to={`/dashboard?tab=posts`}>
              <Sidebar.Item active = {tab === 'posts'} icon={HiDocumentText} as='div'>
                Posts
              </Sidebar.Item>
            </Link>
          )}
          {/* All Stories tab (admin only) */}
          {currentUser.isAdmin && (
            <Link to={`/dashboard?tab=allnarratives`}>
              <Sidebar.Item active={tab === 'allnarratives'} icon={FaList} as='div'>
                All Narratives
              </Sidebar.Item>
            </Link>
          )}
          {/* Stories tab for admins and publishers */}
          {(currentUser.isAdmin || currentUser.isPublisher) && (
            <Link to={`/dashboard?tab=narratives`}>
              <Sidebar.Item active={tab === 'narratives'} icon={FaBookOpen} as='div'>
                Narratives
              </Sidebar.Item>
            </Link>
          )}
          {/* Comments tab for admin */}
          {currentUser.isAdmin && (
            <>
              <Link to={`/dashboard?tab=users`}>
                <Sidebar.Item active = {tab === 'users'} icon={HiOutlineUserGroup} as='div'>
                    Users
                </Sidebar.Item>
              </Link>
              <Link to={`/dashboard?tab=comments`}>
                <Sidebar.Item active = {tab === 'comments'} icon={HiAnnotation} as='div'>
                    Comments
                </Sidebar.Item>
              </Link>
              <Link to={`/dashboard?tab=requests`}>
                <Sidebar.Item active={tab === 'requests'} icon={HiInboxIn} as='div'>
                  Requests
                  {(pendingRequests > 0 || pendingStories > 0) && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {totalPendingRequests}
                    </span>
                  )}
                </Sidebar.Item>
              </Link>
              <Link to={`/dashboard?tab=reports`}>
                <Sidebar.Item active={tab === 'reports'} icon={HiExclamation} as='div'>
                  Reports
                  {pendingReports > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {pendingReports}
                    </span>
                  )}
                </Sidebar.Item>
              </Link>
            </>
          )}
          {/* Comments tab for publisher */}
          {currentUser.isPublisher && !currentUser.isAdmin && (
            <Link to={`/dashboard?tab=comments`}>
              <Sidebar.Item active = {tab === 'comments'} icon={HiAnnotation} as='div'>
                  Comments
              </Sidebar.Item>
            </Link>
          )}
          
          <Sidebar.Item icon={HiArrowSmRight} className='cursor-pointer' onClick={handleSignOut} as='div'>
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  )
}
