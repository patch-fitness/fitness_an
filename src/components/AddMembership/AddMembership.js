import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {toast,ToastContainer} from 'react-toastify';

const AddMemberShip = ({ onSuccess }) => {
    const [inputField, setInputField] = useState({ 
        months: "", 
        price: "", 
        title: "",
        trainer_id: "",
        schedule: ""
    });
    const [membershipList, setMembershipList] = useState([]);
    const [trainerList, setTrainerList] = useState([]);
    const [trainerSearch, setTrainerSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [showTrainerDropdown, setShowTrainerDropdown] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const handleOnChange = (event, name) => {
        setInputField({ ...inputField, [name]: event.target.value })
    }
    

    const fetchMembership = async () => {
        try {
            // Lấy gymId từ localStorage
            const gymId = localStorage.getItem('gymId') || '1';
            const response = await axios.get(`http://localhost:5000/api/memberships?gymId=${gymId}`);
            const memberships = response.data || [];
            setMembershipList(memberships);
        } catch (err) {
            console.error("Lỗi khi tải danh sách gói tập:", err);
            toast.error("Lỗi khi tải danh sách gói tập");
        }
    }

    const fetchTrainers = async () => {
        try {
            const gymId = localStorage.getItem('gymId') || '1';
            const response = await axios.get(`http://localhost:5000/api/trainers?gymId=${gymId}`);
            const trainers = response.data || [];
            setTrainerList(trainers);
        } catch (err) {
            console.error("Lỗi khi tải danh sách huấn luyện viên:", err);
            toast.error("Lỗi khi tải danh sách huấn luyện viên");
        }
    }

    useEffect(() => {
        fetchMembership();
        fetchTrainers();
    }, [])

    // Đóng dropdown khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showTrainerDropdown && !event.target.closest('.trainer-dropdown-container')) {
                setShowTrainerDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showTrainerDropdown])

    // Filter trainers based on search
    const filteredTrainers = trainerList.filter(trainer =>
        trainer.name.toLowerCase().includes(trainerSearch.toLowerCase())
    );

    const handleTrainerSelect = (trainer) => {
        setInputField({ ...inputField, trainer_id: trainer.id });
        setTrainerSearch(trainer.name);
        setShowTrainerDropdown(false);
    }

    const handleScheduleChange = (schedule) => {
        setInputField({ ...inputField, schedule });
    }

    const handleDeleteMembership = async (membership) => {
        if (!membership?.id) return;
        const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa gói tập "${membership.title || membership.name}"?`);
        if (!confirmDelete) return;

        try {
            setDeletingId(membership.id);
            await axios.delete(`http://localhost:5000/api/memberships/${membership.id}`);
            toast.success(`Đã xóa gói tập ${membership.title || membership.name}`);
            setMembershipList(prev => prev.filter(item => item.id !== membership.id));
            window.dispatchEvent(new Event('membershipDeleted'));
        } catch (error) {
            console.error("Lỗi khi xóa gói tập:", error);
            toast.error(error.response?.data?.message || "Không thể xóa gói tập");
        } finally {
            setDeletingId(null);
        }
    };

    const handleAddMembership = async () => {
        // Validate
        if (!inputField.months || !inputField.price) {
            toast.error("Vui lòng điền đầy đủ thông tin (Số tháng và Giá)!");
            return;
        }

        // Trainer và schedule là optional (chỉ required nếu đã chạy migration)
        // Nếu đã chọn trainer thì phải chọn schedule và ngược lại
        if (inputField.trainer_id && !inputField.schedule) {
            toast.error("Vui lòng chọn lịch tập khi đã chọn huấn luyện viên!");
            return;
        }

        if (!inputField.trainer_id && inputField.schedule) {
            toast.error("Vui lòng chọn huấn luyện viên trước khi chọn lịch tập!");
            return;
        }

        const months = parseInt(inputField.months, 10);
        const price = parseFloat(inputField.price);

        if (isNaN(months) || months <= 0) {
            toast.error("Số tháng phải là số dương!");
            return;
        }

        if (isNaN(price) || price <= 0) {
            toast.error("Giá phải là số dương!");
            return;
        }

        setLoading(true);
        try {
            // Lấy gymId từ localStorage
            const gymId = parseInt(localStorage.getItem('gymId') || '1', 10);
            
            // Tạo title mặc định nếu chưa có
            const title = inputField.title || `Gói ${months} tháng`;
            
            // Chuẩn bị dữ liệu
            const membershipData = {
                title: title,
                name: title,
                price: price,
                duration_in_months: months,
                package_type: 'Normal',
                gymId: gymId
            };

            // Chỉ thêm trainer_id và schedule nếu đã chọn
            if (inputField.trainer_id && inputField.schedule) {
                membershipData.trainer_id = parseInt(inputField.trainer_id, 10);
                membershipData.schedule = inputField.schedule;
            }

            // Gọi API để thêm gói tập
            const response = await axios.post('http://localhost:5000/api/memberships', membershipData);
            
            toast.success("Thêm gói tập thành công!");
            console.log("Membership đã được thêm:", response.data);

            // Gọi callback để cập nhật danh sách trong AddMembers
            if (onSuccess) {
                onSuccess(response.data);
            }

            // Dispatch event để AddMembers component có thể cập nhật danh sách
            window.dispatchEvent(new Event('membershipAdded'));

            // Refresh danh sách gói tập
            await fetchMembership();

            // Reset form
            setInputField({ 
                months: "", 
                price: "", 
                title: "",
                trainer_id: "",
                schedule: ""
            });
            setTrainerSearch("");
        } catch (err) {
            console.error("Lỗi khi thêm gói tập:", err);
            const errorMessage = err.response?.data?.message || err.message || "Thêm gói tập thất bại!";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='text-black'>
            {/* Hiển thị danh sách gói tập hiện có */}
            <div className='mb-6'>
                <h3 className='text-lg font-semibold mb-3'>Danh sách gói tập hiện có:</h3>
                <div className='flex flex-wrap gap-5 items-center justify-center'>
                    {membershipList.length > 0 ? (
                        membershipList.map((item) => (
                            <div 
                                key={item.id} 
                                className='relative text-lg bg-slate-900 text-white pl-4 pr-4 pt-2 pb-2 rounded-xl font-semibold hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                            >
                                <button
                                    className='absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700 transition-colors'
                                    onClick={() => handleDeleteMembership(item)}
                                    disabled={deletingId === item.id}
                                    title='Xóa gói tập'
                                >
                                    {deletingId === item.id ? "…" : "×"}
                                </button>
                                <div className='pr-4'>{item.title || item.name || `${item.months || item.duration_in_months} Tháng`}</div>
                                <div>{item.price ? `${item.price.toLocaleString('vi-VN')} VND` : 'N/A'}</div>
                            </div>
                        ))
                    ) : (
                        <div className='text-gray-500'>Chưa có gói tập nào</div>
                    )}
                </div>
            </div>

            <hr className='mt-6 mb-6' />
            
            {/* Form thêm gói tập mới */}
            <div className='space-y-4'>
                <div>
                    <label className='block mb-2 text-sm font-medium'>Tên gói tập (tùy chọn):</label>
                    <input 
                        value={inputField.title} 
                        onChange={(event) => handleOnChange(event, "title")} 
                        className='border-2 rounded-lg text-lg w-full p-2' 
                        type='text' 
                        placeholder="Ví dụ: Gói 1 tháng, Gói VIP 3 tháng..." 
                    />
                </div>

                <div className='flex gap-4'>
                    <div className='flex-1'>
                        <label className='block mb-2 text-sm font-medium'>Số tháng:</label>
                        <input 
                            value={inputField.months} 
                            onChange={(event) => handleOnChange(event, "months")} 
                            className='border-2 rounded-lg text-lg w-full p-2' 
                            type='number' 
                            min="1"
                            placeholder="Nhập số tháng" 
                        />
                    </div>

                    <div className='flex-1'>
                        <label className='block mb-2 text-sm font-medium'>Giá (VND):</label>
                        <input 
                            value={inputField.price} 
                            onChange={(event) => handleOnChange(event, "price")} 
                            className='border-2 rounded-lg text-lg w-full p-2' 
                            type='number' 
                            min="0"
                            step="1000"
                            placeholder="Nhập giá" 
                        />
                    </div>
                </div>

                {/* Chọn Huấn luyện viên */}
                <div className='relative trainer-dropdown-container'>
                    <label className='block mb-2 text-sm font-medium'>
                        Chọn Huấn luyện viên <span className='text-gray-500 text-xs'>(Tùy chọn)</span>
                    </label>
                    <div className='relative'>
                        <input
                            type='text'
                            value={trainerSearch}
                            onChange={(e) => {
                                setTrainerSearch(e.target.value);
                                setShowTrainerDropdown(true);
                            }}
                            onFocus={() => setShowTrainerDropdown(true)}
                            className='border-2 rounded-lg text-lg w-full p-2 pr-10'
                            placeholder='Tìm kiếm và chọn huấn luyện viên...'
                        />
                        {showTrainerDropdown && filteredTrainers.length > 0 && (
                            <div className='absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
                                {filteredTrainers.map((trainer) => (
                                    <div
                                        key={trainer.id}
                                        onClick={() => handleTrainerSelect(trainer)}
                                        className='p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0'
                                    >
                                        <div className='font-semibold'>{trainer.name}</div>
                                        {trainer.mobileNo && (
                                            <div className='text-sm text-gray-600'>SĐT: {trainer.mobileNo}</div>
                                        )}
                                        {trainer.degree && (
                                            <div className='text-sm text-gray-500'>{trainer.degree}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {showTrainerDropdown && filteredTrainers.length === 0 && trainerSearch && (
                            <div className='absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-3'>
                                <div className='text-gray-500'>Không tìm thấy huấn luyện viên</div>
                            </div>
                        )}
                    </div>
                    {inputField.trainer_id && (
                        <div className='mt-2 text-sm text-green-600'>
                            ✓ Đã chọn: {trainerList.find(t => t.id === parseInt(inputField.trainer_id, 10))?.name}
                        </div>
                    )}
                </div>

                {/* Chọn Lịch tập - chỉ hiển thị sau khi chọn HLV */}
                {inputField.trainer_id && (
                    <div>
                        <label className='block mb-2 text-sm font-medium'>
                            Chọn Lịch tập trong tuần <span className='text-red-500'>*</span>
                            <span className='text-gray-500 text-xs ml-2'>(Bắt buộc khi đã chọn HLV)</span>
                        </label>
                        <div className='flex gap-4'>
                            <label className='flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 flex-1'>
                                <input
                                    type='radio'
                                    name='schedule'
                                    value='2-4-6'
                                    checked={inputField.schedule === '2-4-6'}
                                    onChange={(e) => handleScheduleChange(e.target.value)}
                                    className='mr-2 w-5 h-5'
                                />
                                <span className='text-lg font-semibold'>Thứ 2 - 4 - 6</span>
                            </label>
                            <label className='flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 flex-1'>
                                <input
                                    type='radio'
                                    name='schedule'
                                    value='3-5-7'
                                    checked={inputField.schedule === '3-5-7'}
                                    onChange={(e) => handleScheduleChange(e.target.value)}
                                    className='mr-2 w-5 h-5'
                                />
                                <span className='text-lg font-semibold'>Thứ 3 - 5 - 7</span>
                            </label>
                        </div>
                    </div>
                )}

                <div 
                    onClick={handleAddMembership} 
                    className={`text-lg border-2 p-3 text-center rounded-xl cursor-pointer ${
                        loading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-slate-900 text-white hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                    }`}
                >
                    {loading ? 'Đang thêm...' : 'Thêm gói tập +'}
                </div>
            </div>
            <ToastContainer/>
        </div >
    )
}

export default AddMemberShip