import React from 'react';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] bg-gray-900 p-2 rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image container
      >
        <img 
          src={imageUrl} 
          alt="Enlarged thumbnail" 
          className="w-full h-full object-contain"
        />
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center text-2xl border-2 border-gray-600 hover:bg-red-500 transition-colors"
          aria-label="Close image viewer"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default ImageModal;
