import React from 'react'
import CircleIcon from '@mui/icons-material/Circle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const DEFAULT_IMAGE = "https://via.placeholder.com/150";

const EquipmentCard = ({item, onView, onEdit, onDelete}) => {
    // Xác định màu status
    const getStatusColor = (status) => {
        switch(status) {
            case 'Available': return 'green';
            case 'In Use': return 'orange';
            case 'Maintenance': return 'red';
            default: return 'gray';
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return dateString.slice(0,10).split('-').reverse().join('-');
        } catch (error) {
            return 'N/A';
        }
    };

    const formatCurrency = (value) => {
        if (value === null || value === undefined || isNaN(value)) return 'N/A';
        return Number(value).toLocaleString('vi-VN') + '₫';
    };

    const getImageSrc = (src) => {
        if (!src) return DEFAULT_IMAGE;
        if (src.startsWith('http')) return src;
        return `http://localhost:5000${src}`;
    };

    return (
        <div className='bg-white rounded-lg p-3 hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:text-white cursor-pointer transition-colors'>
            <div className='bg-white rounded-lg p-3 hover:bg-gradient-to-r from-indigo-500 to-pink-500 hover:text-white cursor-pointer transition-colors'>
                <div className="w-28 h-28 flex justify-center relative items-center border-2 p-1 mx-auto rounded-lg">
                    <img 
                        className="w-full h-full rounded-lg object-cover" 
                        src={getImageSrc(item?.image)} 
                        alt="equipment" 
                    />
                    <CircleIcon 
                        className="absolute bottom-1 right-1 ring-2 ring-white rounded-full" 
                        sx={{ color: getStatusColor(item?.status), fontSize: 16 }} 
                    />                    
                </div>
                <div className="mx-auto mt-5 text-center text-xl font-semibold font-mono">
                    {item?.name || "Thiết bị"}   
                </div>
                <div className="mx-auto mt-2 text-center text-lg font-mono">
                    {item?.category || "Chưa phân loại"}   
                </div>
                <div className="mx-auto mt-2 text-center text-lg font-mono">
                    Trạng thái: {item?.status || "N/A"}   
                </div>
                <div className="mx-auto mt-2 text-center text-sm font-mono">
                    Vị trí: {item?.location || "N/A"}   
                </div>
                <div className="mx-auto mt-2 text-center text-sm font-mono">
                    Bảo trì: {formatDate(item?.maintenanceDate)}
                </div>
                <div className="mx-auto mt-1 text-center text-sm font-mono">
                    Chi phí: {formatCurrency(item?.maintenanceCost)}
                </div>
                <div className="mx-auto mt-1 text-center text-sm font-mono">
                    Giá mua: {formatCurrency(item?.purchasePrice)}
                </div>
                <div className="mt-4 flex flex-col gap-2">
                    <button
                        onClick={() => onView && onView(item)}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg border border-indigo-500 text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                        <VisibilityIcon fontSize="small" /> Xem chi tiết
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit && onEdit(item)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-amber-500 text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                            <EditIcon fontSize="small" /> Sửa
                        </button>
                        <button
                            onClick={() => onDelete && onDelete(item)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-500 text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <DeleteIcon fontSize="small" /> Xóa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EquipmentCard