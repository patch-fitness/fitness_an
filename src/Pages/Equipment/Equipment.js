import React, { useState, useEffect, useCallback } from 'react'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EquipmentCard from '@/components/EquipmentCard/EquipmentCard';
import AddEquipment from '@/components/AddEquipment/AddEquipment';
import Modal from '@/components/Modal/Modal';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { mockEquipment } from '@/data/mockData';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';

const Equipment = () => {
    const navigate = useNavigate();
    const [addEquipment, setAddEquipment] = useState(false);
    const [data, setData] = useState([]);
    const [search, setSearch] = useState("");
    const [isSearchModeOn, setIsSearchModeOn] = useState(false);
    const [allEquipment, setAllEquipment] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [startFrom, setStartFrom] = useState(0);
    const [endTo, setEndTo] = useState(9);
    const [totalData, setTotalData] = useState(0);
    const limit = 9;
    const [noOfPage, setNoOfPage] = useState(0);
    const [equipmentToDelete, setEquipmentToDelete] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchData = useCallback(async (skip, limits) => {
        try {
            // Gọi API để lấy dữ liệu từ backend
            const response = await axios.get(`http://localhost:5000/api/equipment?gymId=1`);
            const equipment = response.data || [];
            
            // Cập nhật allEquipment với dữ liệu từ API
            setAllEquipment(equipment);
            
            // Pagination
            const equipmentData = equipment.slice(skip, skip + limits);
            setData(equipmentData);
            
            const total = equipment.length;
            setTotalData(total);

            const extraPage = total % limit === 0 ? 0 : 1;
            const totalPage = parseInt(total / limit + extraPage);
            setNoOfPage(totalPage);

            if(total === 0) {
                setStartFrom(-1);
                setEndTo(0);
            } else {
                setStartFrom(skip);
                setEndTo(Math.min(skip + limits, total));
            }
            
            setLoading(false);
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu thiết bị:", err);
            toast.error("Lỗi khi tải dữ liệu thiết bị. Sử dụng dữ liệu mẫu.");
            // Fallback to mock data nếu API lỗi
            const equipmentData = mockEquipment.slice(skip, skip + limits);
            setData(equipmentData);
            setAllEquipment([...mockEquipment]);
            setTotalData(mockEquipment.length);
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchData(0, 9);
        setCurrentPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleEquipment = () => {
        setAddEquipment(prev => !prev);
    }

    const handleAddSuccess = async (newEquipment) => {
        // Gọi API để thêm thiết bị mới
        try {
            const equipmentData = {
                name: newEquipment.name,
                category: newEquipment.category || null,
                location: newEquipment.location || null,
                status: newEquipment.status || 'Available',
                condition: newEquipment.condition || 'Good',
                image: newEquipment.image || null,
                description: newEquipment.description || null,
                purchasePrice: newEquipment.purchasePrice || 0,
                purchaseDate: newEquipment.purchaseDate || null,
                maintenanceDate: newEquipment.maintenanceDate || null,
                maintenanceCost: newEquipment.maintenanceCost || 0,
                monthlyMaintenanceCost: 0,
                gymId: 1 // TODO: Lấy từ context hoặc state
            };
            
            const response = await axios.post('http://localhost:5000/api/equipment', equipmentData);
            toast.success("Thêm thiết bị thành công!");
            
            // Refresh danh sách
            await fetchData(0, 9);
        } catch (err) {
            console.error("Lỗi khi thêm thiết bị:", err);
            toast.error("Lỗi khi thêm thiết bị!");
        }
        
        setAddEquipment(false);
        setCurrentPage(1);
        setIsSearchModeOn(false);
        setSearch("");
    }

    const handlePrev = () => {
        if (currentPage !== 1) {
            const currPage = currentPage - 1;
            setCurrentPage(currPage);
            const from = (currPage - 1) * limit;
            const to = currPage * limit;
            setStartFrom(from);
            setEndTo(Math.min(to, totalData));
            fetchData(from, limit);
        }
    }

    const handleNext = () => {
        if (currentPage !== noOfPage) {
           const currPage = currentPage + 1;
            setCurrentPage(currPage);
            const from = (currPage - 1) * limit;
            const to = Math.min(currPage * limit, totalData);
            setStartFrom(from);
            setEndTo(to);
            fetchData(from, limit);
        }
    }

    const handleSearchData = async () => {
        if (!search.trim()) {
            toast.warning("Vui lòng nhập từ khóa tìm kiếm!");
            return;
        }
        
        setIsSearchModeOn(true);
        // API call sẽ được tích hợp sau
        // await axios.get(`http://localhost:4000/equipment/search?q=${search}`, { withCredentials: true }).then((response) => {
        //     setData(response.data.equipment);
        //     setTotalData(response.data.total);
        // }).catch(err => {
        //     toast.error("Lỗi khi tìm kiếm");
        // });

        // Hiện tại filter từ allEquipment (bao gồm cả thiết bị mới thêm)
        const keyword = search.toLowerCase();
        const filtered = allEquipment.filter(item => {
            const maintenanceDate = item.maintenanceDate ? item.maintenanceDate.toLowerCase() : "";
            const maintenanceCost = item.maintenanceCost !== undefined ? String(item.maintenanceCost) : "";
            const purchasePrice = item.purchasePrice !== undefined ? String(item.purchasePrice) : "";
            return (
                item.name.toLowerCase().includes(keyword) ||
                item.category.toLowerCase().includes(keyword) ||
                item.location.toLowerCase().includes(keyword) ||
                maintenanceDate.includes(keyword) ||
                maintenanceCost.includes(keyword) ||
                purchasePrice.includes(keyword)
            );
        });
        setData(filtered);
        setTotalData(filtered.length);
    }

    const handleClearSearch = () => {
        setSearch("");
        setIsSearchModeOn(false);
        fetchData(0, 9);
        setCurrentPage(1);
    }

    const handleDeleteClick = (equipment) => {
        setEquipmentToDelete(equipment);
        setIsDeleteDialogOpen(true);
    };

    const handleCancelDelete = () => {
        setEquipmentToDelete(null);
        setIsDeleteDialogOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (!equipmentToDelete) return;
        setDeleteLoading(true);
        try {
            await axios.delete(`http://localhost:5000/api/equipment/${equipmentToDelete.id}`);
            toast.success(`Đã xóa thiết bị ${equipmentToDelete.name}`);
            await fetchData(0, 9);
            setCurrentPage(1);
            setIsSearchModeOn(false);
            setSearch("");
        } catch (err) {
            console.error('Lỗi khi xóa thiết bị:', err);
            toast.error(err.response?.data?.message || 'Không thể xóa thiết bị');
        } finally {
            setDeleteLoading(false);
            handleCancelDelete();
        }
    };

    return (
        <div className='text-black p-5 h-[100vh]'>
            {/* Block for banner */}
            <div className='border-2 w-100 bg-slate-900 flex justify-between w-full text-white rounded-lg p-3'>
                <div className='border-2 pl-3 pr-3 pt-1 pb-1 rounded-2xl cursor-pointer hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:text-black' onClick={() => handleEquipment()}>
                    Thêm thiết bị <FitnessCenterIcon /> 
                </div>
            </div>

            {/* Block for back to dashboard button */}
            <div className="m-3">
                <Link to={'/dashboard'}><ArrowBackIcon/> Back to Dashboard </Link>
            </div>

            {/* Search bar */}
            <div className='flex gap-2'>
                <input 
                    type='text' 
                    value={search} 
                    onChange={(e) => { setSearch(e.target.value) }} 
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSearchData(); }}
                    className='border-2 w-80 p-2 rounded-lg' 
                    placeholder='Tìm kiếm theo tên, loại, vị trí, giá...' 
                />
                <div 
                    onClick={() => { handleSearchData() }} 
                    className='bg-slate-900 p-3 border-2 text-white rounded-lg cursor-pointer hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:text-black'
                >
                    <SearchIcon />
                </div>
                {isSearchModeOn && (
                    <div 
                        onClick={handleClearSearch} 
                        className='bg-gray-500 p-3 border-2 text-white rounded-lg cursor-pointer hover:bg-gray-600'
                    >
                        Xóa tìm kiếm
                    </div>
                )}
            </div>

            {/* Total and pagination info */}
            <div className='mt-5 text-xl flex justify-between text-slate-900'>
                <div>Tổng thiết bị: {totalData}</div>
                {
                    !isSearchModeOn ? <div className='flex gap-5'>
                        <div>{startFrom + 1} - {endTo} of {totalData} Thiết bị</div>
                        <div 
                            className={`w-8 h-8 cursor-pointer border-2 flex items-center justify-center hover:text-white hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 ${currentPage === 1 ? 'bg-gray-200 text-gray-400' : null}`} 
                            onClick={() => { handlePrev() }}
                        >
                            <ChevronLeftIcon />
                        </div>
                        <div 
                            className={`w-8 h-8 cursor-pointer border-2 flex items-center justify-center hover:text-white hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 ${currentPage === noOfPage ? 'bg-gray-200 text-gray-400' : null}`} 
                            onClick={() => { handleNext() }}
                        >
                            <ChevronRightIcon />
                        </div>
                    </div> : null
                }
            </div>

            {/* Grid for Equipment Cards */}
            <div className="bg-slate-100 p-5 rounded-lg grid gap-2 grid-cols-3 overflow-x-auto mt-5 h-[65%]">
                {loading ? (
                    <div className="col-span-3 text-center text-gray-500 text-xl mt-10">
                        Đang tải dữ liệu...
                    </div>
                ) : data.length > 0 ? (
                    data.map((item, index) => (
                        <EquipmentCard
                            key={item.id || index}
                            item={item}
                            onView={() => navigate(`/equipment/${item.id}`)}
                            onEdit={() => navigate(`/equipment/${item.id}?edit=1`)}
                            onDelete={() => handleDeleteClick(item)}
                        />
                    ))
                ) : (
                    <div className="col-span-3 text-center text-gray-500 text-xl mt-10">
                        Không có thiết bị nào
                    </div>
                )}
            </div>

            {/* Modal for adding equipment */}
            {addEquipment && (
                <Modal 
                    header={"Thêm thiết bị mới"} 
                    handleClose={handleEquipment} 
                    content={<AddEquipment onSuccess={handleAddSuccess} />} 
                />
            )}
            {isDeleteDialogOpen && equipmentToDelete && (
                <ConfirmDialog
                    title="Xác nhận xóa thiết bị"
                    message={`Bạn có chắc chắn muốn xóa thiết bị "${equipmentToDelete.name}"?\nHành động này không thể hoàn tác.`}
                    confirmText="Xóa"
                    cancelText="Hủy"
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                    loading={deleteLoading}
                />
            )}
            <ToastContainer />
        </div>
    )
}

export default Equipment

