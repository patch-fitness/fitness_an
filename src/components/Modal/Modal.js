import React, { useEffect } from 'react'
import ClearIcon from '@mui/icons-material/Clear';

const Modal = ({handleClose,content,header}) => {
  // Ngăn scroll body khi modal mở
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      className='w-full h-[100vh] fixed bg-black bg-opacity-50 text-black top-0 left-0 flex justify-center items-center z-50 p-4'
      onClick={(e) => {
        // Đóng modal khi click vào overlay
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
        <div className='w-full max-w-3xl bg-white rounded-lg max-h-[90vh] flex flex-col shadow-2xl'>
            {/* Header - Fixed */}
            <div className='flex justify-between items-center p-4 md:p-5 border-b-2 border-gray-200 bg-white rounded-t-lg flex-shrink-0'>
                <div className="text-xl md:text-2xl lg:text-3xl font-semibold"> 
                  {header}
                </div>  
                <button
                  onClick={handleClose}
                  className='cursor-pointer hover:bg-gray-100 rounded-full p-1 transition-colors flex items-center justify-center'
                  title="Đóng"
                  aria-label="Đóng modal"
                >
                  <ClearIcon sx={{ fontSize: 28 }} />
                </button>
            </div>
            
            {/* Content - Scrollable */}
            <div className='overflow-y-auto flex-1 p-4 md:p-5' style={{ 
              maxHeight: 'calc(90vh - 80px)',
              scrollBehavior: 'smooth'
            }}>
                {content}
            </div>
        </div>
    </div>
  )
}

export default Modal