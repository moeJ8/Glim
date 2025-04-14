import { Modal } from 'flowbite-react';
import PropTypes from 'prop-types';
export default function PolicyModal({ isOpen, onClose, title, content }) {
  return (
    <Modal show={isOpen} onClose={onClose} size="4xl" >
      <Modal.Header>{title}</Modal.Header>
      <Modal.Body>
        <div className="space-y-6 p-4 ">
          {content}
        </div>
      </Modal.Body>
    </Modal>
  );
} 
PolicyModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.node.isRequired,
  };
