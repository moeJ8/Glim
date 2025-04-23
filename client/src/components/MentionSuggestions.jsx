import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

export default function MentionSuggestions({ 
  textareaRef,
  content,
  setContent,
  onSuggestionSelected = () => {} 
}) {
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const suggestionsRef = useRef(null);

  const handleTextareaChange = (e) => {
    const textarea = e.target;
    const newContent = textarea.value;
    const cursorPos = textarea.selectionStart;
    setCursorPosition(cursorPos);
    
    setContent(newContent);
    
    const textBeforeCursor = newContent.slice(0, cursorPos);
    const atSignIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atSignIndex !== -1 && (atSignIndex === 0 || /\s/.test(textBeforeCursor[atSignIndex - 1]))) {
      const searchTerm = textBeforeCursor.slice(atSignIndex + 1);
      
      const hasSpaceAfterUsername = /\s/.test(searchTerm);
      
      if (!hasSpaceAfterUsername) {
        fetchUserSuggestions(searchTerm);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const fetchUserSuggestions = async (searchTerm) => {
    try {
      const res = await fetch(`/api/user/search?username=${searchTerm}&limit=5`);
      const data = await res.json();
      if (res.ok) {
        setUserSuggestions(data.users);
      }
    } catch (err) {
      console.error('Error fetching user suggestions:', err);
    }
  };

  const handleSelectUser = (username) => {
    const textBeforeCursor = content.slice(0, cursorPosition);
    const textAfterCursor = content.slice(cursorPosition);
    
    const atSignIndex = textBeforeCursor.lastIndexOf('@');
    const newText = textBeforeCursor.slice(0, atSignIndex) + '@' + username + ' ' + textAfterCursor;
    
    setContent(newText);
    setShowSuggestions(false);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = atSignIndex + username.length + 2;
        textareaRef.current.selectionStart = newCursorPos;
        textareaRef.current.selectionEnd = newCursorPos;
        setCursorPosition(newCursorPos);
        onSuggestionSelected(username, newCursorPos);
      }
    }, 0);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) && 
          textareaRef.current && !textareaRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [textareaRef]);

  return {
    showSuggestions,
    suggestionsRef,
    handleTextareaChange,
    renderSuggestions: () => (
      showSuggestions && (
        <div 
          ref={suggestionsRef} 
          className="absolute z-10 bg-white dark:bg-gray-800 shadow-lg rounded-md mt-1 border border-gray-200 dark:border-gray-700 w-full max-h-60 overflow-y-auto"
        >
          {userSuggestions.length > 0 ? (
            userSuggestions.map(user => (
              <div 
                key={user._id} 
                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => handleSelectUser(user.username)}
              >
                <img 
                  src={user.profilePicture} 
                  alt={user.username} 
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-medium">{user.username}</span>
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 dark:text-gray-400 text-center">
              No users found
            </div>
          )}
        </div>
      )
    )
  };
}

MentionSuggestions.propTypes = {
  textareaRef: PropTypes.object.isRequired,
  content: PropTypes.string.isRequired,
  setContent: PropTypes.func.isRequired,
  onSuggestionSelected: PropTypes.func
}; 