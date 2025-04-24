import { Table, Modal, Button, TextInput, Label, Select } from "flowbite-react"
import {HiOutlineExclamationCircle} from "react-icons/hi"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import {FaCheck, FaTimes} from "react-icons/fa"

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

  useEffect(() => {
    const fetchUsers = async () => {
      try{
          const res = await fetch(`/api/user/getusers`)
          const data = await res.json()
          if(res.ok){
            setUsers(data.users)
            if(data.users.length < 9){
              setShowMore(false)
            }
          }

      }catch(err){
        console.log(err)
      }
    };
    if (currentUser.isAdmin) {
      fetchUsers();
    }
  }, [currentUser._id])
  const handleShowMore = async () => {
    const startIndex = users.length;
    try{
      const res = await fetch(`/api/user/getusers?startIndex=${startIndex}`)
      const data = await res.json()
      if(res.ok){
        setUsers((prev) => [...prev, ...data.users]);
        if(data.users.length < 9){
          setShowMore(false)
        }
      }
    } catch(err){
      console.log(err)
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
        console.log(err.message)
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
 
  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      
      {currentUser.isAdmin && users.length > 0 ? (
        <>
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
               
                  {user.username}
                
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
            <button onClick={handleShowMore} className="w-full text-teal-500 self-center text-sm py-7">
              Show More
            </button>
          )
        }
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

