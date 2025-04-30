import { useState, useEffect } from 'react';
import { Button, Label, Textarea } from 'flowbite-react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { HiExclamationCircle, HiBell } from 'react-icons/hi';
import CustomModal from './CustomModal';
import CustomAlert from './CustomAlert';

export default function ReportModal({ show, onClose, targetId, targetType }) {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const { currentUser } = useSelector(state => state.user);
    
    // Clear error message after 3 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError('Please provide a reason for reporting');
            return;
        }

        if (!currentUser) {
            setError('You must be logged in to report');
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const res = await fetch('/api/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    targetId,
                    targetType,
                    reason
                })
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }
            
            setSuccess(true);
            setReason('');
            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 2000);
            
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    const modalFooter = (
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-end">
            <Button
                color="gray"
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
            >
                Cancel
            </Button>
            <Button
                type="submit"
                form="reportForm"
                color="failure"
                isProcessing={loading}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:bg-gradient-to-r hover:from-red-600 hover:to-pink-700"
            >
                Submit Report
            </Button>
        </div>
    );

    return (
        <CustomModal
            isOpen={show}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <HiExclamationCircle className="text-red-500 dark:text-red-400 w-6 h-6" />
                    <span>Report {targetType.charAt(0).toUpperCase() + targetType.slice(1)}</span>
                </div>
            }
            footer={!success && modalFooter}
            maxWidth="md"
        >
            <div className="space-y-6">
                {success ? (
                    <CustomAlert 
                        message={
                            <div className="flex flex-col">
                                <h3 className="font-medium mb-1">Report Submitted</h3>
                                <p>Thank you for helping to keep our community safe.</p>
                                <p className="text-sm mt-2">Admins have been notified and you&apos;ll receive a notification when your report is reviewed.</p>
                            </div>
                        }
                        type="success"
                    />
                ) : (
                    <form id="reportForm" onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div>
                            <Label htmlFor="reason" value="Reason for reporting" className="text-gray-700 dark:text-gray-300 mb-2" />
                            <Textarea
                                id="reason"
                                placeholder="Please explain why you are reporting this content..."
                                rows={4}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-500 dark:focus:border-purple-500 rounded-lg"
                            />
                            <div className="mt-2 flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-800 dark:text-blue-300">
                                <HiBell className="flex-shrink-0 w-4 h-4 mt-0.5" />
                                <div>
                                    <p>Your report will be reviewed by our moderation team.</p>
                                    <p className="mt-1">Admins will be notified immediately, and you&apos;ll receive a notification when your report is reviewed.</p>
                                </div>
                            </div>
                        </div>
                        {error && (
                            <CustomAlert message={error} type="error" />
                        )}
                    </form>
                )}
            </div>
        </CustomModal>
    );
}

ReportModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    targetId: PropTypes.string.isRequired,
    targetType: PropTypes.oneOf(['post', 'comment']).isRequired
}; 