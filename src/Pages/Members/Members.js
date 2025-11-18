import React, { useState, useEffect, useCallback } from 'react'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AddIcon from '@mui/icons-material/Add';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MemberCard from '@/components/MemberCard/MemberCard';
import AddMemberShip from '@/components/AddMembership/AddMembership';
import AddMembers from '@/components/AddMembers/AddMembers';
import Modal from '@/components/Modal/Modal';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { getGymId } from '@/utils/gymUtils';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';

const Members = () => {
    const navigate = useNavigate();
    const [addMembership, setAddMemberShip] = useState(false);
    const [addMember, setAddMember] = useState(false);
    const [data, setData] = useState([]);
    const [search, setSearch] = useState("");
    const [isSearchModeOn, setIsSearchModeOn] = useState(false);
    const [allMembers, setAllMembers] = useState([]); // State để lưu tất cả thành viên
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [startFrom, setStartFrom] = useState(0);
    const [endTo, setEndTo] = useState(9);
    const [totalData, setTotalData] = useState(0);
    const limit = 9; // Constant thay vì state
    const [noOfPage, setNoOfPage] = useState(0);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchData = useCallback(async (skip, limits) => {
        try {
            // Lấy gymId từ localStorage (hoặc mặc định là 1)
            const gymId = getGymId();
            // Gọi API để lấy dữ liệu từ backend
            const response = await axios.get(`http://localhost:5000/api/members?gymId=${gymId}`);
            const members = response.data || [];
            
            console.log("Members từ API:", members.length, members); // Debug
            
            // Cập nhật allMembers với dữ liệu từ API
            setAllMembers(members);
            
            // Pagination
            const membersData = members.slice(skip, skip + limits);
            setData(membersData);
            
            const total = members.length;
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
            console.error("Lỗi khi tải dữ liệu thành viên:", err);
            toast.error("Không thể tải dữ liệu thành viên. Vui lòng thử lại sau.");
            setData([]);
            setAllMembers([]);
            setTotalData(0);
            setStartFrom(-1);
            setEndTo(0);
            setNoOfPage(0);
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchData(0, 9);
        setCurrentPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleMemberShip = () => {
        setAddMemberShip(prev => !prev);
    }

    const handleMembers = () => {
        setAddMember(prev => !prev);
    }

    const handlePrev = () => {
        if (currentPage !== 1) {
            const currPage = currentPage - 1;
            setCurrentPage(currPage);
            const from = (currPage - 1) * limit;
            fetchData(from, limit);
        }
    }

    const handleNext = () => {
        if (currentPage !== noOfPage) {
            const currPage = currentPage + 1;
            setCurrentPage(currPage);
            const from = (currPage - 1) * limit;
            fetchData(from, limit);
        }
    }

    const handleSearchData = async () => {
        if (!search.trim()) {
            return;
        }
        
        setIsSearchModeOn(true);
        
        // Filter từ allMembers (dữ liệu đã load từ API)
        const filtered = allMembers.filter(item => 
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

    const handleDeleteClick = (member) => {
        setMemberToDelete(member);
        setIsDeleteDialogOpen(true);
    };

    const handleCancelDelete = () => {
        setMemberToDelete(null);
        setIsDeleteDialogOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (!memberToDelete) return;
        setDeleteLoading(true);
        try {
            await axios.delete(`http://localhost:5000/api/members/${memberToDelete.id}`);
            toast.success(`Đã xóa hội viên ${memberToDelete.name}`);
            await fetchData(0, 9);
            setCurrentPage(1);
            setIsSearchModeOn(false);
            setSearch("");
        } catch (err) {
            console.error('Lỗi khi xóa hội viên:', err);
            toast.error(err.response?.data?.message || 'Không thể xóa hội viên');
        } finally {
            setDeleteLoading(false);
            handleCancelDelete();
        }
    };

    const handleAddSuccess = async (newMember) => {
        // Member đã được thêm thành công từ AddMembers component
        // Chỉ cần refresh danh sách và đóng modal
        try {
            // Refresh danh sách
            await fetchData(0, 9);
        } catch (err) {
            console.error("Lỗi khi refresh danh sách:", err);
        }
        
        setAddMember(false); // Đóng modal
        setCurrentPage(1); // Reset về trang 1
        setIsSearchModeOn(false); // Tắt chế độ tìm kiếm
        setSearch(""); // Xóa từ khóa tìm kiếm
    }

    // Callback để cập nhật danh sách membership khi thêm gói tập mới
    const handleMembershipAdded = (newMembership) => {
        // Gọi lại fetchMembership trong AddMembers component
        // Bằng cách truyền callback vào AddMembers
        toast.success("Gói tập đã được thêm! Danh sách gói tập sẽ được cập nhật.");
    }
    return (
        <div className='text-black p-5 h-[100vh]'>

            {/* block for banner */}
            <div className='border-2 w-100 bg-slate-900 flex justify-between w-full text-white rounded-lg p-3'>

                <div className='border-2 pl-3 pr-3 pt-1 pb-1 rounded-2xl cursor-pointer hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:text-black' onClick={() => handleMembers()}>Add Member <FitnessCenterIcon /> </div>
                <div className='border-2 pl-3 pr-3 pt-1 pb-1 rounded-2xl cursor-pointer hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:text-black' onClick={() => handleMemberShip()}>Membership <AddIcon /> </div>

            </div>

            {/* block for back to dashboard button */}
            <div className ="m-3">
                <Link to={'/dashboard'}><ArrowBackIcon/> Back to Dashboard </Link>
            </div>
            

            <div className='flex gap-2'>
                <input 
                    type='text' 
                    value={search} 
                    onChange={(e) => { setSearch(e.target.value) }} 
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSearchData(); }}
                    className='border-2 w-80 p-2 rounded-lg' 
                    placeholder='Search By Name or Mobile No' 
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

            <div className='mt-5 text-xl flex justify-between text-slate-900'>
                <div>Total Members: {totalData}</div>
                {
                    !isSearchModeOn ? <div className='flex gap-5'>
                        <div>{startFrom + 1} - {endTo} of {totalData} Members</div>
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

           <div className="bg-slate-100 p-5 rounded-lg grid gap-2 grid-cols-3 overflow-x-auto mt-5 h-[65%]">
                {loading ? (
                    <div className="col-span-3 text-center text-gray-500 text-xl mt-10">
                        Đang tải dữ liệu...
                    </div>
                ) : data.length > 0 ? (
                    data.map((item, index) => (
                        <MemberCard
                            key={item.id || index}
                            item={item}
                            onView={() => navigate(`/member/${item.id}`)}
                            onEdit={() => navigate(`/member/${item.id}?edit=1`)}
                            onDelete={() => handleDeleteClick(item)}
                        />
                    ))
                ) : (
                    <div className="col-span-3 text-center text-gray-500 text-xl mt-10">
                        Không có thành viên nào
                    </div>
                )}
           </div>

            {addMembership && (
                <Modal 
                    header={"Add Membership"} 
                    handleClose={handleMemberShip} 
                    content={<AddMemberShip onSuccess={handleMembershipAdded} />} 
                />
            )}
            {addMember && (
                <Modal 
                    header={"Add New Member"} 
                    handleClose={handleMembers} 
                    content={<AddMembers onSuccess={handleAddSuccess} onMembershipAdded={handleMembershipAdded} />} 
                />
            )}
            {isDeleteDialogOpen && memberToDelete && (
                <ConfirmDialog
                    title="Xác nhận xóa"
                    message={`Bạn có chắc chắn muốn xóa hội viên "${memberToDelete.name}"?\nHành động này không thể hoàn tác.`}
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

export default Members