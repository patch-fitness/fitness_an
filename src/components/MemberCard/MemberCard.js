import React from 'react'
import CircleIcon from '@mui/icons-material/Circle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

const DEFAULT_AVATAR = "https://th.bing.com/th/id/OIP.gj6t3grz5no6UZ03uIluiwHaHa?rs=1&pid=ImgDetMain";

const MemberCard = ({item, onEdit, onDelete, onView}) => {
    const navigate = useNavigate();
    if (!item) return null;
    const canEdit = typeof onEdit === 'function';
    const canDelete = typeof onDelete === 'function';

    // Xác định màu status
    const getStatusColor = (status) => {
        switch(status) {
            case 'Active': return 'green';
            case 'Inactive': return 'red';
            default: return 'gray';
        }
    }

    // Format ngày
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return dateString.slice(0,10).split('-').reverse().join('-');
        } catch {
            return 'N/A';
        }
    }

    const getProfileImageSrc = (src) => {
        if (!src) return DEFAULT_AVATAR;
        if (src.startsWith('http')) return src;
        return `http://localhost:5000${src}`;
    };

    return (
        <div className='bg-white rounded-lg p-3 hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:text-white cursor-pointer transition-colors'>
            <div className='bg-white rounded-lg p-3 hover:bg-gradient-to-r from-indigo-500 to-pink-500 hover:text-white cursor-pointer transition-colors'>
                <div className="w-28 h-28 flex justify-center relative items-center border-2 p-1 mx-auto rounded-full">
                    <img 
                        className="w-full h-full rounded-full object-cover" 
                        src={getProfileImageSrc(item?.profilePic)} 
                        alt="profile pic" 
                    />
                    <CircleIcon 
                        className="absolute bottom-1 right-1 ring-2 ring-white rounded-full" 
                        sx={{ color: getStatusColor(item?.status), fontSize: 16 }} 
                    />                    
                </div>
                <div className="mx-auto mt-5 text-center text-xl font-semibold font-mono">
                    {item?.name || "N/A"}   
                </div>
                <div className="mx-auto mt-2 text-center text-lg font-mono">
                    {item?.mobileNo ? `+84 ${item.mobileNo}` : "N/A"}   
                </div>  
                {item?.nextBillDate && (
                    <div className='mx-auto mt-2 text-center text-sm font-mono'>
                        Next Bill: {formatDate(item.nextBillDate)}
                    </div>
                )}
                {item?.createdAt && !item?.nextBillDate && (
                    <div className='mx-auto mt-2 text-center text-sm font-mono'>
                        Joined: {formatDate(item.createdAt)}
                    </div>
                )}
                <div className="mt-4 flex flex-col gap-2">
                    <button
                        onClick={() => onView ? onView(item) : navigate(`/member/${item?.id}`)}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg border border-indigo-500 text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                        <VisibilityIcon fontSize="small" /> Xem chi tiết
                    </button>
                    {(canEdit || canDelete) && (
                        <div className="flex gap-2">
                            {canEdit && (
                                <button
                                    onClick={() => onEdit(item)}
                                    className={`${canDelete ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-amber-500 text-amber-600 hover:bg-amber-50 transition-colors`}
                                >
                                    <EditIcon fontSize="small" /> Sửa
                                </button>
                            )}
                            {canDelete && (
                                <button
                                    onClick={() => onDelete(item)}
                                    className={`${canEdit ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-500 text-red-600 hover:bg-red-50 transition-colors`}
                                >
                                    <DeleteIcon fontSize="small" /> Xóa
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MemberCard