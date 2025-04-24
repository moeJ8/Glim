import { useState, useEffect } from 'react';
import { Button, Table, Spinner, Alert, Badge, Card } from 'flowbite-react';
import { HiCheck, HiEye, HiTrash, HiOutlineExclamationCircle, HiFilter } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import moment from 'moment';
import CustomModal from './CustomModal';
import { useDispatch } from 'react-redux';
import { decrementPendingReports } from '../redux/report/reportSlice';

export default function DashReports() {
    const dispatch = useDispatch();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentReport, setCurrentReport] = useState(null);
    const [totalReports, setTotalReports] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStatus, setFilterStatus] = useState('pending');
    const [processing, setProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/report?status=${filterStatus}&page=${currentPage}&limit=10`, {
                    credentials: 'include'
                });
                const data = await res.json();
                
                if (!res.ok) {
                    throw new Error(data.message || 'Error fetching reports');
                }
                
                setReports(data.reports);
                setTotalReports(data.totalReports);
                setTotalPages(data.totalPages);
                setCurrentPage(data.currentPage);
                
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchReports();
    }, [currentPage, filterStatus]);

    const handleMarkAsReviewed = async (reportId) => {
        setProcessing(true);
        try {
            const res = await fetch(`/api/report/${reportId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'reviewed'
                }),
                credentials: 'include'
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.message || 'Error updating report');
            }
            
            // Update the reports list
            setReports(reports.map(report => 
                report._id === reportId
                    ? { ...report, status: 'reviewed' }
                    : report
            ));

            // Decrement the pending reports count
            if (filterStatus === 'pending' || filterStatus === '') {
                dispatch(decrementPendingReports());
            }
            
            setSuccessMessage('Report marked as reviewed. A notification has been sent to the user.');
            setTimeout(() => {
                setSuccessMessage('');
                setShowModal(false);
            }, 1500);
            
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteReport = async (reportId) => {
        setProcessing(true);
        try {
            const res = await fetch(`/api/report/${reportId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.message || 'Error deleting report');
            }
            
            setReports(reports.filter(report => report._id !== reportId));
            setTotalReports(prev => prev - 1);
            
            setSuccessMessage('Report deleted successfully');
            // Close modals immediately without delay
            setShowDeleteModal(false);
            setShowModal(false);
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleViewReport = (report) => {
        setCurrentReport(report);
        setShowModal(true);
    };

    const confirmDelete = (reportId) => {
        setCurrentReport(reports.find(report => report._id === reportId));
        setShowDeleteModal(true);
    };

    const getTargetLink = (report) => {
        if (report.targetType === 'post' && report.targetContent?.slug) {
            return `/post/${report.targetContent.slug}`;
        } else if (report.targetType === 'comment' && report.targetContent?.postId?.slug) {
            // For comments and replies, link to the parent post
            return `/post/${report.targetContent.postId.slug}`;
        }
        // Fallback if we can't determine the link
        return '#';
    };
    
    return (
        <div className="max-w-7xl mx-auto p-3">
            <h1 className="text-center text-3xl my-5 font-bold text-gray-800 dark:text-gray-100 ">
                Manage Reports
            </h1>
            
            {successMessage && (
                <Alert color="success" className="mb-3 border-l-4 border-green-500">
                    {successMessage}
                </Alert>
            )}
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold flex items-center">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-500 w-2 h-6 rounded mr-2 inline-block"></span>
                    Total Reports: {totalReports}
                </h2>
                
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400 mr-1 flex items-center">
                        <HiFilter className="mr-1" /> Filter:
                    </span>
                    <Button 
                        size="sm" 
                        color={filterStatus === 'pending' ? 'failure' : 'gray'}
                        onClick={() => setFilterStatus('pending')}
                        className={filterStatus === 'pending' ? 'bg-gradient-to-r from-red-500 to-orange-500 border-0' : ''}
                    >
                        Pending
                    </Button>
                    <Button 
                        size="sm" 
                        color={filterStatus === 'reviewed' ? 'success' : 'gray'}
                        onClick={() => setFilterStatus('reviewed')}
                        className={filterStatus === 'reviewed' ? 'bg-gradient-to-r from-green-500 to-teal-500 border-0' : ''}
                    >
                        Reviewed
                    </Button>
                    <Button 
                        size="sm" 
                        color={filterStatus === '' ? 'purple' : 'gray'}
                        onClick={() => setFilterStatus('')}
                        className={filterStatus === '' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 border-0' : ''}
                    >
                        All
                    </Button>
                </div>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="text-center">
                        <Spinner size="xl" className="mx-auto" />
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Loading reports...</p>
                    </div>
                </div>
            ) : error ? (
                <Alert color="failure" className="my-5 border-l-4 border-red-500">
                    {error}
                </Alert>
            ) : reports.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-sm text-center">
                    <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                        <HiOutlineExclamationCircle className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No Reports Found</h3>
                    <p className="text-gray-500 dark:text-gray-400">There are no reports matching your current filter.</p>
                </div>
            ) : isMobile ? (
                // Mobile card view
                <div className="grid grid-cols-1 gap-4">
                    {reports.map((report) => (
                        <Card key={report._id} className="mb-2 border-0 shadow-md hover:shadow-lg transition-shadow dark:bg-gray-800">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                                <div className="flex flex-wrap gap-2">
                                    <Badge 
                                        color={report.targetType === 'post' ? 'info' : (report.targetContent?.parentId || report.targetContent?.isReply) ? 'purple' : 'success'} 
                                        className="inline-flex"
                                        style={{
                                            background: report.targetType === 'post' 
                                                ? 'linear-gradient(to right, #3b82f6, #60a5fa)' 
                                                : (report.targetContent?.parentId || report.targetContent?.isReply)
                                                    ? 'linear-gradient(to right, #8b5cf6, #a78bfa)'
                                                    : 'linear-gradient(to right, #10b981, #34d399)'
                                        }}
                                    >
                                        {report.targetType === 'post' 
                                            ? 'post' 
                                            : (report.targetContent?.parentId || report.targetContent?.isReply) ? 'reply' : 'comment'
                                        }
                                    </Badge>
                                    <Badge 
                                        color={report.status === 'pending' ? 'warning' : 'success'}
                                        className="inline-flex"
                                        style={{
                                            background: report.status === 'pending'
                                                ? 'linear-gradient(to right, #f59e0b, #fbbf24)'
                                                : 'linear-gradient(to right, #10b981, #34d399)'
                                        }}
                                    >
                                        {report.status}
                                    </Badge>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full inline-flex items-center justify-center">
                                    {moment(report.createdAt).fromNow()}
                                </div>
                            </div>
                            
                            <div className="mb-2">
                                <p className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Reported by:</p>
                                <Link to={`/profile/${report.userId?.username}`} className="text-purple-600 dark:text-purple-400 hover:underline flex items-center">
                                    @{report.userId?.username}
                                </Link>
                            </div>
                            
                            <div className="mb-2">
                                <p className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Content:</p>
                                <p className="text-sm line-clamp-2 p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                                    {report.targetType === 'post' 
                                        ? report.targetContent?.title
                                        : report.targetContent?.content
                                    }
                                </p>
                            </div>
                            
                            <div className="mb-3">
                                <p className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Reason:</p>
                                <p className="text-sm line-clamp-2 p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">{report.reason}</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <Button 
                                    size="xs" 
                                    color="info"
                                    onClick={() => handleViewReport(report)}
                                    className="bg-gradient-to-r from-blue-500 to-blue-600"
                                >
                                    <HiEye className="mr-2 mt-0.5" />
                                    View Details
                                </Button>
                                {report.status === 'pending' && (
                                    <Button 
                                        size="xs" 
                                        color="success"
                                        onClick={() => handleMarkAsReviewed(report._id)}
                                        className="bg-gradient-to-r from-green-500 to-teal-500"
                                    >
                                        <HiCheck className="mr-2 mt-0.5" />
                                        Mark Reviewed
                                    </Button>
                                )}
                                <Button 
                                    size="xs" 
                                    color="failure"
                                    onClick={() => confirmDelete(report._id)}
                                    className="bg-gradient-to-r from-red-500 to-pink-600"
                                >
                                    <HiTrash className="mr-2 mt-0.5" />
                                    Delete
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                // Desktop table view
                <>
                    <div className="overflow-hidden rounded-lg shadow">
                        <Table hoverable className="min-w-full" theme={{
                            root: {
                                base: "w-full text-left text-sm text-gray-500 dark:text-gray-400"
                            },
                            head: {
                                base: "bg-gradient-to-r from-purple-50 to-pink-50 dark:bg-gradient-to-r dark:from-gray-700 dark:to-gray-800",
                                cell: {
                                    base: "px-6 py-3 font-medium text-gray-900 dark:text-white"
                                }
                            }
                        }}>
                            <Table.Head>
                                <Table.HeadCell className="py-3">Type</Table.HeadCell>
                                <Table.HeadCell className="py-3">Reported By</Table.HeadCell>
                                <Table.HeadCell className="py-3">Content Owner</Table.HeadCell>
                                <Table.HeadCell className="py-3">Content</Table.HeadCell>
                                <Table.HeadCell className="py-3">Status</Table.HeadCell>
                                <Table.HeadCell className="py-3">Date</Table.HeadCell>
                                <Table.HeadCell className="py-3">Actions</Table.HeadCell>
                            </Table.Head>
                            <Table.Body className="divide-y">
                                {reports.map((report) => (
                                    <Table.Row 
                                        key={report._id} 
                                        className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700 transition-colors"
                                    >
                                        <Table.Cell className="capitalize whitespace-nowrap py-3 font-medium">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                report.targetType === 'post' 
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                                                    : (report.targetContent?.parentId || report.targetContent?.isReply)
                                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            }`}>
                                                {report.targetType === 'post' 
                                                    ? 'post' 
                                                    : (report.targetContent?.parentId || report.targetContent?.isReply) ? 'reply' : 'comment'
                                                }
                                            </span>
                                        </Table.Cell>
                                        <Table.Cell className="whitespace-nowrap py-3">
                                            <Link to={`/profile/${report.userId?.username}`} className="font-medium text-purple-600 dark:text-purple-400 hover:underline">
                                                @{report.userId?.username}
                                            </Link>
                                        </Table.Cell>
                                        <Table.Cell className="whitespace-nowrap py-3">
                                            {report.contentOwner ? (
                                                <Link to={`/profile/${report.contentOwner?.username}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                                    @{report.contentOwner?.username}
                                                </Link>
                                            ) : (
                                                <span className="text-gray-500 dark:text-gray-400">Unknown</span>
                                            )}
                                        </Table.Cell>
                                        <Table.Cell className="max-w-[300px] py-3">
                                            <span className="line-clamp-1">
                                                {report.targetType === 'post' 
                                                    ? report.targetContent?.title
                                                    : report.targetContent?.content
                                                }
                                            </span>
                                        </Table.Cell>
                                        <Table.Cell className="whitespace-nowrap py-3">
                                            <Badge 
                                                color={report.status === 'pending' ? 'warning' : 'success'}
                                                className="w-fit"
                                                style={{
                                                    background: report.status === 'pending'
                                                        ? 'linear-gradient(to right, #f59e0b, #fbbf24)'
                                                        : 'linear-gradient(to right, #10b981, #34d399)'
                                                }}
                                            >
                                                {report.status}
                                            </Badge>
                                        </Table.Cell>
                                        <Table.Cell className="whitespace-nowrap py-3">
                                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs inline-flex items-center justify-center">
                                                {moment(report.createdAt).fromNow()}
                                            </span>
                                        </Table.Cell>
                                        <Table.Cell className="whitespace-nowrap py-3">
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    size="xs" 
                                                    color="info"
                                                    onClick={() => handleViewReport(report)}
                                                    className="bg-gradient-to-r from-blue-500 to-blue-600"
                                                >
                                                    <HiEye className="mr-2 mt-0.5" />
                                                    View
                                                </Button>
                                                {report.status === 'pending' && (
                                                    <Button 
                                                        size="xs" 
                                                        color="success"
                                                        onClick={() => handleMarkAsReviewed(report._id)}
                                                        className="bg-gradient-to-r from-green-500 to-teal-500"
                                                    >
                                                        <HiCheck className="mr-2 mt-0.5" />
                                                        Reviewed
                                                    </Button>
                                                )}
                                                <Button 
                                                    size="xs" 
                                                    color="failure"
                                                    onClick={() => confirmDelete(report._id)}
                                                    className="bg-gradient-to-r from-red-500 to-pink-600"
                                                >
                                                    <HiTrash className="mr-2 mt-0.5" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    </div>
                </>
            )}
            
            {/* Pagination */}
            {!loading && reports.length > 0 && (
                <div className="flex justify-center mt-5">
                    <div className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg shadow-sm">
                        <Button 
                            size="sm"
                            color="purple"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className={currentPage !== 1 ? "bg-gradient-to-r from-purple-500 to-pink-500" : ""}
                        >
                            Previous
                        </Button>
                        <span className="flex items-center px-4 py-1 bg-white dark:bg-gray-700 rounded-lg font-medium text-sm shadow-sm border border-gray-200 dark:border-gray-600">
                            {currentPage} / {totalPages}
                        </span>
                        <Button 
                            size="sm"
                            color="purple"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className={currentPage !== totalPages ? "bg-gradient-to-r from-purple-500 to-pink-500" : ""}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
            
            {/* Custom Report Detail Modal */}
            <CustomModal
                isOpen={showModal && currentReport !== null}
                onClose={() => setShowModal(false)}
                title="Report Details"
                maxWidth="4xl"
                footer={
                    <div className="flex justify-center gap-4 w-full">
                        {currentReport && currentReport.status === 'pending' && (
                            <Button
                                color="success"
                                onClick={() => handleMarkAsReviewed(currentReport._id)}
                                disabled={processing}
                                className="bg-gradient-to-r from-green-500 to-teal-500"
                            >
                                {processing ? (
                                    <>
                                        <Spinner size="sm" className="mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <HiCheck className="mr-2 mt-0.5" />
                                        Mark as Reviewed
                                    </>
                                )}
                            </Button>
                        )}
                        {currentReport && (
                            <Button
                                color="failure"
                                onClick={() => {
                                    setShowModal(false);
                                    confirmDelete(currentReport._id);
                                }}
                                disabled={processing}
                                className="bg-gradient-to-r from-red-500 to-pink-600"
                            >
                                <HiTrash className="mr-2 mt-0.5" />
                                Delete Report
                            </Button>
                        )}
                        <Button 
                            color="gray" 
                            onClick={() => setShowModal(false)} 
                            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                            Close
                        </Button>
                    </div>
                }
            >
                {currentReport && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:gap-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <div className="mb-2 sm:mb-0 sm:w-1/2">
                                <span className="font-bold text-gray-700 dark:text-gray-300">Type:</span> 
                                <span className={`capitalize ml-2 px-2 py-1 rounded-full text-xs ${
                                    currentReport.targetType === 'post' 
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                                        : (currentReport.targetContent?.parentId || currentReport.targetContent?.isReply)
                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                }`}>
                                    {currentReport.targetType === 'post' 
                                        ? 'post' 
                                        : (currentReport.targetContent?.parentId || currentReport.targetContent?.isReply) ? 'reply' : 'comment'
                                    }
                                </span>
                            </div>
                            <div className="sm:w-1/2">
                                <span className="font-bold text-gray-700 dark:text-gray-300">Status:</span>
                                <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    currentReport.status === 'pending'
                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-300 dark:border-green-700'
                                }`}>
                                    <span className={`mr-1.5 h-2 w-2 rounded-full ${
                                        currentReport.status === 'pending'
                                            ? 'bg-amber-500 animate-pulse'
                                            : 'bg-green-500'
                                    }`}></span>
                                    {currentReport.status.charAt(0).toUpperCase() + currentReport.status.slice(1)}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:gap-4">
                            <div className="mb-2 sm:mb-0 sm:w-1/2">
                                <span className="font-bold text-gray-700 dark:text-gray-300">Reported By:</span>
                                <Link to={`/profile/${currentReport.userId?.username}`} className="ml-2 text-purple-600 dark:text-purple-400 hover:underline">
                                    @{currentReport.userId?.username}
                                </Link>
                            </div>
                            <div className="sm:w-1/2">
                                <span className="font-bold text-gray-700 dark:text-gray-300">Reported On:</span>
                                <span className="ml-2 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full text-xs inline-flex items-center justify-center">
                                    {new Date(currentReport.createdAt).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        
                        <div>
                            <span className="font-bold text-gray-700 dark:text-gray-300">Content Owner:</span>
                            {currentReport.contentOwner ? (
                                <Link to={`/profile/${currentReport.contentOwner?.username}`} className="ml-2 text-blue-600 dark:text-blue-400 hover:underline">
                                    @{currentReport.contentOwner?.username}
                                </Link>
                            ) : (
                                <span className="ml-2 text-gray-500 dark:text-gray-400">Unknown</span>
                            )}
                        </div>
                        
                        <div>
                            <span className="font-bold text-gray-700 dark:text-gray-300">Content:</span>
                            <div className="mt-1 p-3 border rounded-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 shadow-inner">
                                {currentReport.targetType === 'post' 
                                    ? currentReport.targetContent?.title
                                    : currentReport.targetContent?.content
                                }
                            </div>
                            <Link 
                                to={getTargetLink(currentReport)} 
                                className="text-purple-600 dark:text-purple-400 hover:underline text-sm mt-1 inline-flex items-center gap-1"
                            >
                                <HiEye className="text-xs" /> View in context
                            </Link>
                        </div>
                        
                        <div>
                            <span className="font-bold text-gray-700 dark:text-gray-300">Reason for Report:</span>
                            <div className="mt-1 p-3 border rounded-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 shadow-inner">
                                {currentReport.reason}
                            </div>
                        </div>
                    </div>
                )}
            </CustomModal>
            
            {/* Delete Confirmation Modal */}
            <CustomModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Confirm Deletion"
                maxWidth="sm"
                footer={
                    <div className="flex justify-center gap-4 w-full">
                        <Button 
                            color="gray" 
                            onClick={() => setShowDeleteModal(false)}
                            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </Button>
                        <Button
                            color="failure"
                            onClick={() => handleDeleteReport(currentReport?._id)}
                            disabled={processing}
                            className="bg-gradient-to-r from-red-500 to-pink-600"
                        >
                            {processing ? (
                                <>
                                    <Spinner size="sm" className="mr-2" />
                                    Processing...
                                </>
                            ) : (
                                "Yes, delete it"
                            )}
                        </Button>
                    </div>
                }
            >
                <div className="text-center">
                    <div className="mx-auto mb-4 h-14 w-14 flex items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-900/20 dark:text-red-400">
                        <HiOutlineExclamationCircle className="h-8 w-8" />
                    </div>
                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this report?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                        This action cannot be undone. The report will be permanently removed from the database.
                    </p>
                </div>
            </CustomModal>
        </div>
    );
} 