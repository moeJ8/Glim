import { useRef, useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import PropTypes from 'prop-types';

export default function CustomModal({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    footer,
    maxWidth = '2xl',
    showCloseButton = true
}) {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Handle escape key to close
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const getMaxWidthClass = () => {
        const widths = {
            sm: 'max-w-sm',
            md: 'max-w-md',
            lg: 'max-w-lg',
            xl: 'max-w-xl',
            '2xl': 'max-w-2xl',
            '3xl': 'max-w-3xl',
            '4xl': 'max-w-4xl',
            '5xl': 'max-w-5xl',
            '6xl': 'max-w-6xl',
            '7xl': 'max-w-7xl',
            full: 'max-w-full'
        };
        
        return widths[maxWidth] || 'max-w-2xl';
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal Container */}
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4"
                onClick={handleOverlayClick}
            >
                {/* Modal Content */}
                <div 
                    ref={modalRef}
                    className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-xl ${getMaxWidthClass()} w-full max-h-[90vh] transform transition-all duration-300 ease-in-out flex flex-col`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    {title && (
                        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-700 rounded-t-lg">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {title}
                            </h3>
                            {showCloseButton && (
                                <button 
                                    onClick={onClose}
                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg p-1.5 inline-flex bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-200"
                                    aria-label="Close"
                                >
                                    <HiX className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    )}
                    
                    {/* Modal Body */}
                    <div className="p-4 sm:p-6 overflow-y-auto flex-grow">
                        {children}
                    </div>
                    
                    {/* Modal Footer */}
                    {footer && (
                        <div className="flex p-4 sm:p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

CustomModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.node,
    children: PropTypes.node,
    footer: PropTypes.node,
    maxWidth: PropTypes.string,
    showCloseButton: PropTypes.bool
}; 