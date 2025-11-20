import React, { useState, useEffect, useCallback } from 'react'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AddIcon from '@mui/icons-material/Add';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TrainerCard from '@/components/TrainerCard/TrainerCard'; // Thay MemberCard bằng TrainerCard
import AddTrainer from '@/components/AddTrainers/AddTrainers';   // Thay AddMembers bằng AddTrainer
import AddMemberShip from '@/components/AddMembership/AddMembership';
import Modal from '@/components/Modal/Modal';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { getGymId } from '@/utils/gymUtils';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import {mockTrainers} from '@/data/mockData';

const Trainers = () => {
    const navigate = useNavigate();
    const [addTrainer, setAddTrainer] = useState(false);
    const [data, setData] = useState([]);
    const [search, setSearch] = useState("");
    const [isSearchModeOn, setIsSearchModeOn] = useState(false);
    const [allTrainers, setAllTrainers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [startFrom, setStartFrom] = useState(0);
    const [endTo, setEndTo] = useState(9);
    const [totalData, setTotalData] = useState(0);
    const limit = 9;
    const [noOfPage, setNoOfPage] = useState(0);
    const [trainerToDelete, setTrainerToDelete] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchData = useCallback(async (skip, limits) => {
        try {
            const gymId = getGymId();
            const response = await axios.get(`http://localhost:5000/api/trainers?gymId=${gymId}`);
            const trainers = response.data || [];

            console.log("Trainers từ API:", trainers.length, trainers);
            
            setAllTrainers(trainers);

            const trainersData = trainers.slice(skip, skip + limits);
            setData(trainersData);

            const total = trainers.length;
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
            console.error("Lỗi khi tải dữ liệu trainer:", err);
            toast.error("Không thể tải dữ liệu trainer. Vui lòng thử lại sau.");
            setData([]);
            setAllTrainers([]);
            setTotalData(0);
            setStartFrom(-1);
            setEndTo(0);
            setNoOfPage(0);
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
    // Thay vì fetchData từ backend
    setAllTrainers(mockTrainers);
    setData(mockTrainers.slice(0, 9));
    setTotalData(mockTrainers.length);
    setNoOfPage(Math.ceil(mockTrainers.length / 9));
    setStartFrom(0);
    setEndTo(Math.min(9, mockTrainers.length));
    setLoading(false);
}, []);
    const handleAddTrainer = () => setAddTrainer(prev => !prev);

    const handlePrev = () => {
        if (currentPage !== 1) {
            const currPage = currentPage - 1;
            setCurrentPage(currPage);
            fetchData((currPage - 1) * limit, limit);
        }
    }

    const handleNext = () => {
        if (currentPage !== noOfPage) {
            const currPage = currentPage + 1;
            setCurrentPage(currPage);
            fetchData((currPage - 1) * limit, limit);
        }
    }

    const handleSearchData = () => {
        if (!search.trim()) return;
        setIsSearchModeOn(true);

        const filtered = allTrainers.filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            (item.mobileNo && item.mobileNo.toLowerCase().includes(search.toLowerCase()))
        );
        setData(filtered);
        setTotalData(filtered.length);
    }

    const handleClearSearch = () => {
        setSearch("");
        setIsSearchModeOn(false);
        fetchData(0, 9);
        setCurrentPage(1);
    }

    const handleDeleteClick = (trainer) => {
        setTrainerToDelete(trainer);
        setIsDeleteDialogOpen(true);
    }

    const handleCancelDelete = () => {
        setTrainerToDelete(null);
        setIsDeleteDialogOpen(false);
    }

    const handleConfirmDelete = async () => {
        if (!trainerToDelete) return;
        setDeleteLoading(true);
        try {
            await axios.delete(`http://localhost:5000/api/trainers/${trainerToDelete.id}`);
            toast.success(`Đã xóa trainer ${trainerToDelete.name}`);
            await fetchData(0, 9);
            setCurrentPage(1);
            setIsSearchModeOn(false);
            setSearch("");
        } catch (err) {
            console.error('Lỗi khi xóa trainer:', err);
            toast.error(err.response?.data?.message || 'Không thể xóa trainer');
        } finally {
            setDeleteLoading(false);
            handleCancelDelete();
        }
    }

    const handleAddSuccess = async (newTrainer) => {
        try { await fetchData(0, 9); } catch (err) { console.error(err); }
        setAddTrainer(false);
        setCurrentPage(1);
        setIsSearchModeOn(false);
        setSearch("");
    }

    return (
        <div className='text-black p-5 h-[100vh]'>

            <div className='border-2 w-100 bg-slate-900 flex justify-between w-full text-white rounded-lg p-3'>
                <div className='border-2 pl-3 pr-3 pt-1 pb-1 rounded-2xl cursor-pointer hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:text-black' onClick={handleAddTrainer}>Add Trainer <FitnessCenterIcon /> </div>
            </div>
            <div className="m-3 flex justify-between items-center">
                <Link to={'/dashboard'} className="flex items-center gap-1"><ArrowBackIcon/> Back to Dashboard </Link>
            
                <div className='flex gap-2'>
                    <input 
                        type='text'
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyPress={e => { if(e.key === 'Enter') handleSearchData(); }}
                        className='border-2 w-80 p-2 rounded-lg'
                        placeholder='Search By Name or Mobile No'
                    />
                    <div 
                        onClick={handleSearchData} 
                        className='bg-slate-900 p-3 border-2 text-white rounded-lg cursor-pointer hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
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
            </div>
            

            <div className='mt-5 text-xl flex justify-between text-slate-900'>
                <div>Total Trainers: {totalData}</div>
                {!isSearchModeOn && (
                    <div className='flex gap-5'>
                        <div>{startFrom + 1} - {endTo} of {totalData} Trainers</div>
                        <div onClick={handlePrev} className={`w-8 h-8 cursor-pointer border-2 flex items-center justify-center hover:text-white hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 ${currentPage === 1 ? 'bg-gray-200 text-gray-400' : ''}`}>
                            <ChevronLeftIcon />
                        </div>
                        <div onClick={handleNext} className={`w-8 h-8 cursor-pointer border-2 flex items-center justify-center hover:text-white hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 ${currentPage === noOfPage ? 'bg-gray-200 text-gray-400' : ''}`}>
                            <ChevronRightIcon />
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-slate-100 p-5 rounded-lg grid gap-2 grid-cols-3 overflow-x-auto mt-5 h-[65%]">
                {loading ? (
                    <div className="col-span-3 text-center text-gray-500 text-xl mt-10">
                        Đang tải dữ liệu...
                    </div>
                ) : data.length > 0 ? (
                    data.map((item, index) => (
                        <TrainerCard
                            key={item.id}
                            trainer={item}   // ⚠️ sửa từ item sang trainer
                            onView={() => navigate(`/trainers/${item.id}`)}
                            onEdit={() => navigate(`/trainers/${item.id}?edit=1`)}
                            onDelete={() => handleDeleteClick(item)}
                        />

                    ))
                ) : (
                    <div className="col-span-3 text-center text-gray-500 text-xl mt-10">
                        Không có trainer nào
                    </div>
                )}
            </div>

            {addTrainer && (
                <Modal 
                    header={"Add New Trainer"} 
                    handleClose={handleAddTrainer} 
                    content={<AddTrainer onSuccess={handleAddSuccess} />} 
                />
            )}
            {isDeleteDialogOpen && trainerToDelete && (
                <ConfirmDialog
                    title="Xác nhận xóa"
                    message={`Bạn có chắc chắn muốn xóa trainer "${trainerToDelete.name}"?\nHành động này không thể hoàn tác.`}
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

export default Trainers;
