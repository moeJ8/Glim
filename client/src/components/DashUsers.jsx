import { Table, Modal, Button, TextInput, Label, Select, Spinner, Alert } from "flowbite-react"
import {HiOutlineExclamationCircle, HiOutlineSearch} from "react-icons/hi"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import {FaCheck, FaTimes} from "react-icons/fa"
import { Link } from "react-router-dom"

export default function DashUsers() {

  const {currentUser} = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState("");
  const [showBanModal, setShowBanModal] = useState(false);
  const [userToBan, setUserToBan] = useState(null);
  const [banDuration, setBanDuration] = useState('1d');
  const [banReason, setBanReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successIcons, setSuccessIcons] = useState({});
  const [failureIcons, setFailureIcons] = useState({});
  // New state variables for search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try{
          setLoading(true);
          // Build URL with filters
          let url = `/api/user/getusers`;
          const queryParams = [];
          
          // Add search parameter if present
          if (searchTerm) {
            queryParams.push(`searchTerm=${encodeURIComponent(searchTerm)}`);
          }
          
          // Add role filter if not 'all'
          if (roleFilter !== 'all') {
            queryParams.push(`role=${roleFilter}`);
          }
          
          // Add status filter if not 'all'
          if (statusFilter !== 'all') {
            queryParams.push(`status=${statusFilter}`);
          }
          
          // Add query parameters to URL
          if (queryParams.length > 0) {
            url += `?${queryParams.join('&')}`;
          }
          
          const res = await fetch(url);
          const data = await res.json();
          
          if(res.ok){
            setUsers(data.users);
            if(data.users.length < 9){
              setShowMore(false);
            } else {
              setShowMore(true);
            }
          } else {
            setError(data.message || "Failed to fetch users");
          }
      } catch(err){
        console.log(err);
        setError("An error occurred while fetching users");
      } finally {
        setLoading(false);
      }
    };
    if (currentUser.isAdmin) {
      fetchUsers();
    }
  }, [currentUser.isAdmin, searchTerm, roleFilter, statusFilter]);

  const handleShowMore = async () => {
    const startIndex = users.length;
    try{
      let url = `/api/user/getusers?startIndex=${startIndex}`;
      
      // Add search parameter if present
      if (searchTerm) {
        url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
      }
      
      // Add role filter if not 'all'
      if (roleFilter !== 'all') {
        url += `&role=${roleFilter}`;
      }
      
      // Add status filter if not 'all'
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if(res.ok){
        setUsers((prev) => [...prev, ...data.users]);
        if(data.users.length < 9){
          setShowMore(false);
        }
      }
    } catch(err){
      console.log(err);
    }
  }

  const handleDeleteUser = async () => {
      try{
        const res = await fetch(`/api/user/delete/${userIdToDelete}`, {
            method : "DELETE",

        });
        const data = await res.json();
        if(res.ok){
            setUsers((prev) => prev.filter((user) => user._id !== userIdToDelete));
            setShowModal(false);
        } else {
            console.log(data.error);
        }
      }catch(err){
        console.log(err.message);
      }
  };

  const handleTogglePublisher = async (userId, isPublisher) => {
    try{
        const res = await fetch(`/api/user/update-role`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, isPublisher: !isPublisher }),
        });
        if (res.ok) {
          setUsers((prev) =>
            prev.map((user) =>
              user._id === userId ? { ...user, isPublisher: !isPublisher } : user
            )
          );
          setSuccessIcons((prev) => ({ ...prev, [userId]: true }));
          setTimeout(() => setSuccessIcons((prev) => ({ ...prev, [userId]: false })), 3000);
      } else {
        setFailureIcons((prev) => ({ ...prev, [userId]: true }));
        setTimeout(() => setFailureIcons((prev) => ({ ...prev, [userId]: false })), 3000);
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  const handleBanUser = async () => {
    if (!userToBan) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/user/ban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userToBan._id,
          duration: banDuration,
          reason: banReason
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || 'Failed to ban user');
        setLoading(false);
        return;
      }

      // Update using the data from the API
      setUsers(users.map(user => 
        user._id === userToBan._id 
          ? { ...user, ...data.user }
          : user
      ));
      
      setShowBanModal(false);
      setLoading(false);
      setUserToBan(null);
      setBanReason('');
      
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      setLoading(true);
      
      const res = await fetch(`/api/user/unban/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || 'Failed to unban user');
        setLoading(false);
        return;
      }     
      // Update the user's ban status in the UI
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, isBanned: false, banExpiresAt: null, banReason: null } 
          : user
      ));
      
      setLoading(false);
      
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const formatBanTime = (banExpiresAt) => {
    if (!banExpiresAt) return { dateStr: 'Permanent', timeStr: '' };
    
    const expiryDate = new Date(banExpiresAt);
    const now = new Date();
    
    if (expiryDate < now) return { dateStr: 'Expired', timeStr: '' };
    
    // Format date and time separately
    const dateStr = expiryDate.toLocaleDateString();
    const timeStr = expiryDate.toLocaleTimeString(undefined, { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    
    return { dateStr, timeStr };
  };
  
  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    setSearchTerm(searchInput);
  };

  // Handle role filter change
  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Handle removing all filters
  const handleRemoveFilters = () => {
    setSearchTerm('');
    setSearchInput('');
    setRoleFilter('all');
    setStatusFilter('all');
  };
  
  // Render mobile cards
  const renderMobileCards = () => {
    return (
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {users.map((user) => (
          <div key={user._id} className="bg-gray-800 rounded-lg overflow-hidden">
            {/* User info */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <img 
                  src={user.profilePicture} 
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <Link to={`/profile/${user.username}`} className="text-blue-400 font-medium">
                    {user.username}
                  </Link>
                  <p className="text-xs text-gray-400">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Email */}
            <div className="px-4 pt-3">
              <p className="text-xs text-gray-400 mb-1">Email:</p>
              <p className="text-sm text-gray-200 bg-gray-700 p-2 rounded">
                {user.email}
              </p>
            </div>
            
            {/* Status badges */}
            <div className="grid grid-cols-3 gap-3 p-4">
              <div className="bg-gray-700 rounded p-2 flex flex-col items-center">
                <p className="text-xs text-gray-400 mb-1">Publisher</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  user.isPublisher ? "bg-green-500 text-white" : "bg-gray-600 text-gray-300"
                }`}>
                  {user.isPublisher ? "Yes" : "No"}
                </span>
              </div>
              
              <div className="bg-gray-700 rounded p-2 flex flex-col items-center">
                <p className="text-xs text-gray-400 mb-1">Admin</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  user.isAdmin ? "bg-purple-500 text-white" : "bg-gray-600 text-gray-300"
                }`}>
                  {user.isAdmin ? "Yes" : "No"}
                </span>
              </div>
              
              <div className="bg-gray-700 rounded p-2 flex flex-col items-center">
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  user.isBanned ? "bg-red-500 text-white" : "bg-green-500 text-white"
                }`}>
                  {user.isBanned ? "Banned" : "Active"}
                </span>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-2 p-4">
              <Button
                color={user.isPublisher ? "blue" : "purple"}
                size="xs"
                onClick={() => handleTogglePublisher(user._id, user.isPublisher)}
                disabled={user.isAdmin}
                className="flex items-center justify-center h-9"
              >
                {user.isPublisher ? "Revoke Publisher" : "Assign Publisher"}
              </Button>
              
              {!user.isAdmin && (
                <>
                  {user.isBanned ? (
                    <Button
                      color="info"
                      size="xs"
                      onClick={() => handleUnbanUser(user._id)}
                      disabled={loading}
                      className="flex items-center justify-center h-9"
                    >
                      Unban User
                    </Button>
                  ) : (
                    <Button
                      color="pink"
                      size="xs"
                      onClick={() => {
                        setUserToBan(user);
                        setShowBanModal(true);
                      }}
                      disabled={loading}
                      className="flex items-center justify-center h-9"
                    >
                      Ban User
                    </Button>
                  )}
                </>
              )}
              
              <Button
                color="failure"
                size="xs"
                onClick={() => {
                  setShowModal(true);
                  setUserIdToDelete(user._id);
                }}
                className="flex items-center justify-center h-9"
              >
                Delete User
              </Button>
            </div>
          </div>
        ))}
        
        {showMore && (
          <div className="flex justify-center mt-4">
            <Button 
              color="purple"
              onClick={handleShowMore}
            >
              Show More
            </Button>
          </div>
        )}
      </div>
    );
  };
 
  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <h1 className="text-center text-2xl sm:text-3xl my-4 sm:my-5 font-bold text-gray-800 dark:text-gray-100">
        Manage Users
      </h1>
      
      {currentUser.isAdmin && (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Role filter */}
          <div className="md:w-1/4">
            <Select
              value={roleFilter}
              onChange={handleRoleFilterChange}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="publisher">Publisher</option>
              <option value="user">Regular User</option>
            </Select>
          </div>
          
          {/* Status filter */}
          <div className="md:w-1/4">
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </Select>
          </div>
          
          {/* Search input */}
          <div className="md:w-2/4 flex gap-2">
            <div className="flex-grow">
              <TextInput
                type="text"
                placeholder="Search by username or email..."
                value={searchInput}
                onChange={handleSearchInputChange}
                icon={HiOutlineSearch}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              />
            </div>
            <Button 
              outline
              gradientDuoTone="purpleToBlue"
              onClick={handleSearchSubmit}
            >
              Search
            </Button>
            <Button 
              outline
              gradientDuoTone="pinkToOrange"
              onClick={handleRemoveFilters}
              disabled={roleFilter === 'all' && statusFilter === 'all' && !searchTerm}
            >
              Reset
            </Button>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="text-center">
            <Spinner size="xl" className="mx-auto" />
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading users...</p>
          </div>
        </div>
      ) : error ? (
        <Alert color="failure" className="mb-4">
          {error}
        </Alert>
      ) : users.length > 0 ? (
        <>
          {/* Desktop view */}
          <div className="hidden md:block">
            <Table hoverable className="shadow-md">
              <Table.Head>
                <Table.HeadCell>Date Created</Table.HeadCell>
                <Table.HeadCell>User Image</Table.HeadCell>
                <Table.HeadCell>Username</Table.HeadCell>
                <Table.HeadCell>Email</Table.HeadCell>
                <Table.HeadCell>Publisher</Table.HeadCell>
                <Table.HeadCell>Admin</Table.HeadCell>
                <Table.HeadCell>Ban Status</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              {users.map((user) =>(
                <Table.Body key={user._id} className="divide-y">
                  <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      
                      <img src= {user.profilePicture} alt={user.username} className="w-10 h-10 object-cover bg-gray-500 rounded-full" />
                      
                    </Table.Cell>
                    <Table.Cell>
                      <Link to={`/profile/${user.username}`} className="text-blue-500 hover:underline font-medium">
                        {user.username}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>
                      {user.email}
                    </Table.Cell>
                    <Table.Cell>
                          <Button gradientDuoTone="purpleToBlue" outline
                            size="xs"
                            onClick={() => handleTogglePublisher(user._id, user.isPublisher)}
                          >
                            {user.isPublisher ? "Revoke" : "Assign"}
                          </Button>
                          {successIcons[user._id] && (
                          <FaCheck className="text-green-500 mt-3 mx-auto" />
                          )}
                          {failureIcons[user._id] &&(
                           <FaTimes className="text-green-500 mt-3 mx-auto" />
                           )}
                        </Table.Cell>
                    <Table.Cell>
                      {user.isAdmin ? (<FaCheck className="text-green-500"/>) : (<FaTimes className="text-red-500"/>)}
                    </Table.Cell>
                    <Table.Cell>
                      {user.isBanned ? (
                        <div className="relative group">
                          <span className="w-fit px-2 py-0.5 bg-red-100 text-red-800 rounded-md text-xs font-medium mb-1 cursor-help">
                            Banned
                          </span>
                          {/* Tooltip content */}
                          <div className="absolute left-0 top-full mt-1 z-10 invisible group-hover:visible bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 text-xs border border-gray-200 dark:border-gray-700 min-w-[180px]">
                            <div className="font-medium">
                              Until: {formatBanTime(user.banExpiresAt).dateStr}
                            </div>
                            <div>
                              {formatBanTime(user.banExpiresAt).timeStr}
                            </div>
                            {user.banReason && (
                              <div className="mt-1 border-t border-gray-200 dark:border-gray-700 pt-1">
                                <span className="font-medium">Reason:</span> {user.banReason}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="w-fit px-2 py-0.5 bg-green-100 text-green-800 rounded-md text-xs font-medium">
                          Active
                        </span>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        {!user.isAdmin && (
                          <>
                            {user.isBanned ? (
                              <Button
                                size="xs"
                                gradientDuoTone="cyanToBlue"
                                outline
                                onClick={() => handleUnbanUser(user._id)}
                                disabled={loading}
                              >
                                Unban
                              </Button>
                            ) : (
                              <Button
                                size="xs"
                                gradientDuoTone="pinkToOrange"
                                outline
                                onClick={() => {
                                  setUserToBan(user);
                                  setShowBanModal(true);
                                }}
                                disabled={loading}
                              >
                                Ban
                              </Button>
                            )}
                          </>
                        )}
                        <Button
                          size="xs"
                          color="failure"
                          outline
                          onClick={() => {
                            setShowModal(true);
                            setUserIdToDelete(user._id);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </Table.Cell>
                    
                  </Table.Row>
                </Table.Body>
              ))}
             
            </Table>
            {
              showMore && (
                <div className="flex justify-center mt-5">
                  <Button 
                    color="purple" 
                    onClick={handleShowMore}
                  >
                    Show More
                  </Button>
                </div>
              )
            }
          </div>
          
          {/* Mobile view */}
          {renderMobileCards()}
        </>
      ):(
        <p>You have no users yet</p>
      )}
      <Modal show={showModal} onClose={()=> setShowModal(false)} popup size ='md'>
        <Modal.Header/>
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-red-500 dark:text-red-500 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">Are you sure you want to delete this user?</h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={()=> handleDeleteUser()}>Yes, I&apos;m sure</Button>
              <Button color="gray" onClick={()=> setShowModal(false)}>No, cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={showBanModal}
        onClose={() => setShowBanModal(false)}
        popup
        size="md"
      >
        <Modal.Header>
          <div className="text-xl font-bold">Ban User</div>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            {userToBan && (
              <div className="text-center py-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {userToBan.username}
                </span>
                <p className="text-sm text-gray-500">{userToBan.email}</p>
              </div>
            )}
            
            <div className="mb-2">
              <Label htmlFor="banDuration" value="Ban Duration" />
              <Select
                id="banDuration"
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
                required
              >
                <option value="30m">30 minutes</option>
                <option value="1h">1 hour</option>
                <option value="12h">12 hours</option>
                <option value="1d">1 day</option>
                <option value="3d">3 days</option>
                <option value="1w">1 week</option>
                <option value="2w">2 weeks</option>
                <option value="1m">1 month</option>
                <option value="3m">3 months</option>
                <option value="6m">6 months</option>
                <option value="1y">1 year</option>
                <option value="2y">2 years</option>
                <option value="permanent">Permanent</option>
              </Select>
            </div>
            
            <div className="mb-2">
              <Label htmlFor="banReason" value="Ban Reason" />
              <TextInput
                id="banReason"
                placeholder="Why is this user being banned?"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
            
            {error && (
              <div className="text-sm text-red-600 dark:text-red-500">
                {error}
              </div>
            )}
            
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={handleBanUser}
                isProcessing={loading}
              >
                Ban User
              </Button>
              <Button
                color="gray"
                onClick={() => setShowBanModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}

