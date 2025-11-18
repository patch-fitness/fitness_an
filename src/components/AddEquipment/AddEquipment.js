import React, { useState, useRef } from 'react'
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const AddEquipment = ({ onSuccess }) => {
    const fileInputRef = useRef(null);
    const [inputField, setInputField] = useState({ 
        name: "", 
        category: "", 
        location: "", 
        condition: "Good", 
        status: "Available",
        image: "https://via.placeholder.com/150",
        description: "",
        purchaseDate: "",
        maintenanceDate: "",
        maintenanceCost: "",
        purchasePrice: ""
    });
    const [imageLoader, setImageLoader] = useState(false);

    const handleOnChange = (event, name) => {
        setInputField({ ...inputField, [name]: event.target.value });
    }

    const uploadImage = async (event) => {
        const files = event.target.files;
        if (!files || !files[0]) {
            return;
        }

        const file = files[0];
        
        // Kiểm tra kích thước file (tối đa 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File ảnh quá lớn! Vui lòng chọn file nhỏ hơn 5MB");
            return;
        }

        // Kiểm tra loại file
        if (!file.type.startsWith('image/')) {
            toast.error("Vui lòng chọn file ảnh!");
            return;
        }

        // Hiển thị preview ảnh ngay lập tức bằng FileReader (local)
        const reader = new FileReader();
        reader.onload = (e) => {
            setInputField({ ...inputField, image: e.target.result });
        };
        reader.readAsDataURL(file);

        // Thử upload lên Cloudinary (tùy chọn)
        setImageLoader(true);
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', 'gym-management');

        try {
            const response = await axios.post("https://api.cloudinary.com/v1_1/mashhuudanny/image/upload", data);
            if (response.data && response.data.url) {
                setInputField({ ...inputField, image: response.data.url });
                toast.success("Upload ảnh lên Cloudinary thành công!");
            }
        } catch (err) {
            console.log("Upload lên Cloudinary thất bại, sử dụng ảnh local:", err);
        } finally {
            setImageLoader(false);
        }
    }

    const handleRegisterButton = async () => {
        // Validate
        if (!inputField.name || !inputField.category || !inputField.location) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
            return;
        }

        if (!inputField.purchasePrice || Number(inputField.purchasePrice) <= 0) {
            toast.error("Giá mua phải lớn hơn 0!");
            return;
        }

        if (inputField.maintenanceCost && Number(inputField.maintenanceCost) < 0) {
            toast.error("Giá bảo trì không hợp lệ!");
            return;
        }

        try {
            const maintenanceCostNumber = inputField.maintenanceCost ? Number(inputField.maintenanceCost) : 0;
            const purchasePriceNumber = Number(inputField.purchasePrice);

            const payload = {
                ...inputField,
                maintenanceCost: maintenanceCostNumber,
                purchasePrice: purchasePriceNumber,
            };

            toast.success("Thêm thiết bị thành công!");
            
            if (onSuccess) {
                setTimeout(() => {
                    onSuccess(payload);
                }, 500);
            }
            
            // Reset form sau khi đóng modal
            setTimeout(() => {
                setInputField({ 
                    name: "", 
                    category: "", 
                    location: "", 
                    condition: "Good", 
                    status: "Available",
                    image: "https://via.placeholder.com/150",
                    description: "",
                    purchaseDate: "",
                    maintenanceDate: "",
                    maintenanceCost: "",
                    purchasePrice: ""
                });
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }, 600);
        } catch (err) {
            console.log(err);
            toast.error("Thêm thiết bị thất bại!");
        }
    }

    return (
        <div className='text-black'>
            <div className='grid gap-5 grid-cols-1 md:grid-cols-2 text-lg'>
                <input 
                    value={inputField.name} 
                    onChange={(event) => { handleOnChange(event, "name") }} 
                    placeholder='Tên thiết bị' 
                    type='text' 
                    className='border-2 w-full pl-3 pr-3 pt-2 pb-2 border-slate-400 rounded-md h-12' 
                />
                
                <select 
                    value={inputField.category} 
                    onChange={(event) => { handleOnChange(event, "category") }} 
                    className='border-2 w-full h-12 pt-2 pb-2 border-slate-400 rounded-md'
                >
                    <option value="">Chọn loại thiết bị</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Strength">Strength</option>
                    <option value="Free Weights">Free Weights</option>
                    <option value="Machines">Machines</option>
                    <option value="Accessories">Accessories</option>
                </select>

                <input 
                    value={inputField.location} 
                    onChange={(event) => { handleOnChange(event, "location") }} 
                    placeholder='Vị trí (ví dụ: Khu vực A, Phòng 101)' 
                    type='text' 
                    className='border-2 w-full pl-3 pr-3 pt-2 pb-2 border-slate-400 rounded-md h-12' 
                />

                <select 
                    value={inputField.status} 
                    onChange={(event) => { handleOnChange(event, "status") }} 
                    className='border-2 w-full h-12 pt-2 pb-2 border-slate-400 rounded-md'
                >
                    <option value="Available">Sẵn sàng</option>
                    <option value="In Use">Đang sử dụng</option>
                    <option value="Maintenance">Bảo trì</option>
                </select>

                <select 
                    value={inputField.condition} 
                    onChange={(event) => { handleOnChange(event, "condition") }} 
                    className='border-2 w-full h-12 pt-2 pb-2 border-slate-400 rounded-md'
                >
                    <option value="Excellent">Tuyệt vời</option>
                    <option value="Good">Tốt</option>
                    <option value="Fair">Khá</option>
                    <option value="Poor">Kém</option>
                </select>

                <input 
                    value={inputField.purchaseDate} 
                    onChange={(event) => { handleOnChange(event, "purchaseDate") }} 
                    placeholder='Ngày mua' 
                    type='date' 
                    className='border-2 w-full pl-3 pr-3 pt-2 pb-2 border-slate-400 rounded-md h-12' 
                />

                <input 
                    value={inputField.maintenanceDate} 
                    onChange={(event) => { handleOnChange(event, "maintenanceDate") }} 
                    placeholder='Ngày bảo trì' 
                    type='date' 
                    className='border-2 w-full pl-3 pr-3 pt-2 pb-2 border-slate-400 rounded-md h-12' 
                />

                <input 
                    value={inputField.maintenanceCost} 
                    onChange={(event) => { handleOnChange(event, "maintenanceCost") }} 
                    placeholder='Giá bảo trì (₫)' 
                    type='number' 
                    min='0'
                    className='border-2 w-full pl-3 pr-3 pt-2 pb-2 border-slate-400 rounded-md h-12' 
                />

                <input 
                    value={inputField.purchasePrice} 
                    onChange={(event) => { handleOnChange(event, "purchasePrice") }} 
                    placeholder='Giá mua (₫)' 
                    type='number' 
                    min='0'
                    className='border-2 w-full pl-3 pr-3 pt-2 pb-2 border-slate-400 rounded-md h-12' 
                    required
                />

                <textarea 
                    value={inputField.description} 
                    onChange={(event) => { handleOnChange(event, "description") }} 
                    placeholder='Mô tả thiết bị' 
                    className='border-2 w-full pl-3 pr-3 pt-2 pb-2 border-slate-400 rounded-md h-24 md:col-span-2' 
                />

                <div className='md:col-span-2'>
                    <label className='block mb-2 text-lg font-semibold'>Ảnh thiết bị:</label>
                    <input 
                        ref={fileInputRef}
                        type='file' 
                        onChange={(e) => uploadImage(e)} 
                        accept="image/*"
                        className='border-2 p-2 rounded-md w-full mb-2 cursor-pointer'
                    />
                    {imageLoader && (
                        <div className='flex items-center gap-2 mt-2'>
                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
                            <p className='text-blue-500 text-sm'>Đang upload ảnh lên Cloudinary...</p>
                        </div>
                    )}
                    {inputField.image && inputField.image !== "https://via.placeholder.com/150" && (
                        <div className='mt-3'>
                            <p className='text-sm text-gray-600 mb-2'>Preview ảnh:</p>
                            <img 
                                src={inputField.image} 
                                alt="equipment preview" 
                                className='w-48 h-48 object-cover rounded-lg border-2 border-gray-300 shadow-md'
                            />
                        </div>
                    )}
                </div>

                <div className='md:col-span-2 border-t-2 border-gray-200 pt-6 mt-8 mb-4'>
                    <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
                        <button
                            type='button'
                            onClick={() => {
                                setInputField({ 
                                    name: "", 
                                    category: "", 
                                    location: "", 
                                    condition: "Good", 
                                    status: "Available",
                                    image: "https://via.placeholder.com/150",
                                    description: "",
                                    purchaseDate: "",
                                    maintenanceDate: "",
                                    maintenanceCost: "",
                                    purchasePrice: ""
                                });
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                }
                                toast.info("Đã xóa form");
                            }}
                            className='w-full sm:w-auto px-6 py-3 border-2 border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium'
                        >
                            🔄 Xóa form
                        </button>
                        <button
                            type='button'
                            onClick={() => handleRegisterButton()} 
                            className='w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg cursor-pointer hover:from-indigo-700 hover:to-purple-700 transition-all font-bold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105'
                        >
                            ✓ XÁC NHẬN THÊM THIẾT BỊ
                        </button>
                    </div>
                </div>
            </div>
            <ToastContainer/>
        </div>
    )
}

export default AddEquipment

