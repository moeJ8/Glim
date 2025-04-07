import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Table, Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function DashRequests() {
  const { currentUser } = useSelector((state) => state.user);
  const [requests, setRequests] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [requestToHandle, setRequestToHandle] = useState(null);
  const [actionType, setActionType] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/user/publisher-requests/get?status=pending`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setRequests(data.requests);
          if (data.requests.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser && currentUser.isAdmin) {
      fetchRequests();
    }
  }, [currentUser]);

  const handleShowMore = async () => {
    const startIndex = requests.length;
    try {
      const res = await fetch(`/api/user/publisher-requests/get?startIndex=${startIndex}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setRequests((prev) => [...prev, ...data.requests]);
        if (data.requests.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleAction = (request, action) => {
    setRequestToHandle(request);
    setActionType(action);
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    try {
      const res = await fetch("/api/user/publisher-requests/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          requestId: requestToHandle._id,
          status: actionType,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRequests((prev) => 
          prev.filter((request) => request._id !== requestToHandle._id)
        );
        setShowModal(false);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {currentUser.isAdmin && requests.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date</Table.HeadCell>
              <Table.HeadCell>User Image</Table.HeadCell>
              <Table.HeadCell>Username</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {requests.map((request) => (
                <Table.Row
                  key={request._id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <img
                      src={request.userId.profilePicture}
                      alt={request.userId.username}
                      className="w-10 h-10 rounded-full bg-gray-500"
                    />
                  </Table.Cell>
                  <Table.Cell>{request.userId.username}</Table.Cell>
                  <Table.Cell>{request.userId.email}</Table.Cell>
                  <Table.Cell className="flex flex-wrap gap-2">
                    <Button
                    outline
                      size="sm"
                      color="success"
                      onClick={() => handleAction(request, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                    outline
                      size="sm"
                      color="failure"
                      onClick={() => handleAction(request, "rejected")}
                    >
                      Reject
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          {showMore && (
            <div className="flex justify-center mt-4">
              <Button onClick={handleShowMore} gradientDuoTone="purpleToPink">
                Show More
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center">No publisher requests found.</p>
      )}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body className="">
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-red-600 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              {actionType === "approved"
                ? "Are you sure you want to approve this publisher request?"
                : "Are you sure you want to reject this publisher request?"}
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="success" onClick={handleConfirmAction}>
                Yes, I&apos;m sure
              </Button>
              <Button color="failure" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
} 