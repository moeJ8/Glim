import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Modal, Table, Spinner, Alert } from "flowbite-react";
import { HiDocumentAdd, HiOutlineEye, HiOutlineTrash, HiOutlinePencilAlt } from "react-icons/hi";
import { useSelector } from "react-redux";

export default function DonationDashboard() {
  const { currentUser } = useSelector((state) => state.user);
  const [donationCases, setDonationCases] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [selectedCaseTitle, setSelectedCaseTitle] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactionsError, setTransactionsError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCaseId, setDeleteCaseId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchDonationCases = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/donation/cases?limit=10&active=all`);
        if (!res.ok) {
          throw new Error("Failed to fetch donation cases");
        }
        const data = await res.json();
        setDonationCases(data.donationCases);
        setLoading(false);
        if (data.donationCases.length === 10) {
          setShowMore(true);
        } else {
          setShowMore(false);
        }
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    if (currentUser.isAdmin) {
      fetchDonationCases();
    }
  }, [currentUser.isAdmin]);

  const handleShowMore = async () => {
    const startIndex = donationCases.length;
    try {
      const res = await fetch(`/api/donation/cases?startIndex=${startIndex}&limit=10&active=all`);
      if (!res.ok) {
        throw new Error("Failed to load more cases");
      }
      const data = await res.json();
      setDonationCases([...donationCases, ...data.donationCases]);
      if (data.donationCases.length < 10) {
        setShowMore(false);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleViewTransactions = async (caseId, caseTitle) => {
    setSelectedCaseId(caseId);
    setSelectedCaseTitle(caseTitle);
    setShowTransactionsModal(true);
    
    try {
      setTransactionsLoading(true);
      setTransactionsError(null);
      
      const res = await fetch(`/api/donation/transactions/${caseId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch transactions");
      }
      
      const data = await res.json();
      setTransactions(data);
      setTransactionsLoading(false);
    } catch (error) {
      setTransactionsError(error.message);
      setTransactionsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCaseId) return;
    
    try {
      setDeleteLoading(true);
      
      const res = await fetch(`/api/donation/case/${deleteCaseId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete donation case");
      }
      
      // Remove the deleted case from the state
      setDonationCases(donationCases.filter(c => c._id !== deleteCaseId));
      setDeleteLoading(false);
      setShowDeleteModal(false);
    } catch (error) {
      setError(error.message);
      setDeleteLoading(false);
      console.log(selectedCaseId);
      
    }
  };

  const confirmDelete = (caseId) => {
    setDeleteCaseId(caseId);
    setShowDeleteModal(true);
  };

  // Format amount with commas and two decimal places
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!currentUser.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert color="failure">
          You do not have permission to access this page
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-3 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Manage Donations</h1>
        <Link to="/create-donation">
          <Button gradientDuoTone="purpleToBlue">
            <HiDocumentAdd className="mr-2 h-5 w-5" />
            Create Donation Case
          </Button>
        </Link>
      </div>

      {error && (
        <Alert color="failure" className="mb-4">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner size="xl" />
        </div>
      ) : donationCases.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No donation cases found</p>
          <Link to="/create-donation">
            <Button gradientDuoTone="purpleToBlue">
              Create Your First Donation Case
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table striped>
              <Table.Head>
                <Table.HeadCell>Title</Table.HeadCell>
                <Table.HeadCell>Date Created</Table.HeadCell>
                <Table.HeadCell>Goal</Table.HeadCell>
                <Table.HeadCell>Raised</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {donationCases.map((donationCase) => (
                  <Table.Row key={donationCase._id}>
                    <Table.Cell className="font-medium">
                      <Link to={`/donate/${donationCase._id}`} className="hover:underline">
                        {donationCase.title}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>{formatDate(donationCase.createdAt)}</Table.Cell>
                    <Table.Cell>
                      {donationCase.goalAmount ? formatAmount(donationCase.goalAmount) : "No Goal"}
                    </Table.Cell>
                    <Table.Cell>{formatAmount(donationCase.raisedAmount)}</Table.Cell>
                    <Table.Cell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          donationCase.active
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {donationCase.active ? "Active" : "Inactive"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Button
                          size="xs"
                          color="info"
                          onClick={() => handleViewTransactions(donationCase._id, donationCase.title)}
                        >
                          <HiOutlineEye className="h-4 w-4" />
                        </Button>
                        <Link to={`/edit-donation/${donationCase._id}`}>
                          <Button size="xs" color="warning">
                            <HiOutlinePencilAlt className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="xs"
                          color="failure"
                          onClick={() => confirmDelete(donationCase._id)}
                        >
                          <HiOutlineTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>

          {showMore && (
            <div className="flex justify-center mt-6">
              <Button onClick={handleShowMore} outline gradientDuoTone="purpleToBlue">
                Show More
              </Button>
            </div>
          )}
        </>
      )}

      {/* Transactions Modal */}
      <Modal
        show={showTransactionsModal}
        onClose={() => setShowTransactionsModal(false)}
        size="xl"
      >
        <Modal.Header>
          Donations for: {selectedCaseTitle}
        </Modal.Header>
        <Modal.Body>
          {transactionsError && (
            <Alert color="failure" className="mb-4">
              {transactionsError}
            </Alert>
          )}

          {transactionsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="xl" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No donations have been made for this case yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table striped>
                <Table.Head>
                  <Table.HeadCell>Donor</Table.HeadCell>
                  <Table.HeadCell>Amount</Table.HeadCell>
                  <Table.HeadCell>Date</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {transactions.map((transaction) => (
                    <Table.Row key={transaction._id}>
                      <Table.Cell>
                        {transaction.donorName || "Anonymous"}
                        {transaction.donorEmail && (
                          <div className="text-xs text-gray-500">
                            {transaction.donorEmail}
                          </div>
                        )}
                      </Table.Cell>
                      <Table.Cell>{formatAmount(transaction.amount)}</Table.Cell>
                      <Table.Cell>{formatDate(transaction.createdAt)}</Table.Cell>
                      <Table.Cell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowTransactionsModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        size="md"
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineTrash className="h-14 w-14 text-red-500 mx-auto" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-5">
              Are you sure you want to delete this donation case?
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              This action cannot be undone. All transactions associated with this case will still be recorded,
              but the case will be removed from the public view.
            </p>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Yes, delete it"
                )}
              </Button>
              <Button color="gray" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
} 