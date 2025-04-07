import { Sidebar } from "flowbite-react";
import { HiUser, HiArrowSmRight, HiDocumentText, HiOutlineUserGroup, HiAnnotation, HiChartPie, HiInboxIn, HiCash } from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { signoutSuccess } from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";


export default function DashSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const {currentUser} = useSelector((state) => state.user)
  const [tab, setTab] = useState('')
  useEffect(() => {
  const urlParams = new URLSearchParams(location.search);
  const tabFromUrl = urlParams.get('tab');
  if(tabFromUrl) {
    setTab(tabFromUrl)
  }

}, [location.search])

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
                <Sidebar.Item active={tab==='dashboard' || !tab} icon={HiChartPie}>
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
              {/* Donation management links for admin */}
              <Link to="/donation-dashboard">
                <Sidebar.Item icon={HiCash} as='div'>
                  Donations
                </Sidebar.Item>
              </Link>
              <Link to="/create-donation">
                <Sidebar.Item icon={HiDocumentText} as='div'>
                  Create Donation
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
          {currentUser.isAdmin && (
            <Link to={`/dashboard?tab=requests`}>
              <Sidebar.Item active={tab === 'requests'} icon={HiInboxIn} as='div'>
                Requests
              </Sidebar.Item>
            </Link>
          )}
          
          <Sidebar.Item icon={HiArrowSmRight} className='cursor-pointer' onClick={handleSignOut}>
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
    
  )
}
