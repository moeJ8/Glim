import { HiOutlineExclamationCircle, HiOutlineCheckCircle, HiOutlineInformationCircle } from 'react-icons/hi';
import PropTypes from 'prop-types';

export default function CustomAlert({ 
  message, 
  type = 'error', 
  size = 'md',
  className = '',
  icon = null
}) {
  // Define styles based on alert type
  const styles = {
    error: {
      bg: 'bg-red-200 dark:bg-red-900/30',
      border: 'border-red-500',
      text: 'text-red-700 dark:text-red-400',
      icon: <HiOutlineExclamationCircle className={size === 'sm' ? 'h-4 w-4 mr-2 flex-shrink-0' : 'h-5 w-5 mr-2 flex-shrink-0'} />
    },
    success: {
      bg: 'bg-green-200 dark:bg-green-800',
      border: 'border-green-500',
      text: 'text-green-800 dark:text-green-100',
      icon: <HiOutlineCheckCircle className={size === 'sm' ? 'h-4 w-4 mr-2 flex-shrink-0' : 'h-5 w-5 mr-2 flex-shrink-0'} />
    },
    info: {
      bg: 'bg-blue-200 dark:bg-blue-900/30',
      border: 'border-blue-500',
      text: 'text-blue-700 dark:text-blue-400',
      icon: <HiOutlineInformationCircle className={size === 'sm' ? 'h-4 w-4 mr-2 flex-shrink-0' : 'h-5 w-5 mr-2 flex-shrink-0'} />
    },
    warning: {
      bg: 'bg-yellow-200 dark:bg-yellow-900/30',
      border: 'border-yellow-500',
      text: 'text-yellow-700 dark:text-yellow-600',
      icon: <HiOutlineExclamationCircle className={size === 'sm' ? 'h-4 w-4 mr-2 flex-shrink-0' : 'h-5 w-5 mr-2 flex-shrink-0'} />
    }
  };

  const alertStyle = styles[type] || styles.error;
  const sizeClass = size === 'sm' ? 'p-2 text-xs' : 'p-3';

  return (
    <div className={`${alertStyle.bg} border-l-4 ${alertStyle.border} ${alertStyle.text} ${sizeClass} rounded ${className}`}>
      <div className="flex items-center">
        {icon || alertStyle.icon}
        <p className={size === 'sm' ? 'text-xs' : ''}>{message}</p>
      </div>
    </div>
  );
}

CustomAlert.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['error', 'success', 'info', 'warning']),
  size: PropTypes.oneOf(['sm', 'md']),
  className: PropTypes.string,
  icon: PropTypes.node
}; 