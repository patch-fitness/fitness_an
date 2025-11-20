import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const AddTrainer = ({ onSuccess }) => {
  const [inputField, setInputField] = useState({
    name: "",
    mobileNo: "",
    sex: "",
    degree: "",
    salary: "",
    profilePic: "https://th.bing.com/th/id/OIP.gj6t3grz5no6UZ03uIluiwHaHa?rs=1&pid=ImgDetMain",
    gymId: localStorage.getItem('gymId') || '1',
  });

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleOnChange = (event, name) => {
    setInputField({ ...inputField, [name]: event.target.value });
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setInputField({ ...inputField, profilePic: preview });
  }

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    }
  }, [imagePreview]);

  const handleRegisterButton = async () => {
    // Validate
    if (!inputField.name || !inputField.mobileNo || !inputField.degree || !inputField.salary || !inputField.sex) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', inputField.name);
      formData.append('mobileNo', inputField.mobileNo);
      formData.append('sex', inputField.sex);
      formData.append('degree', inputField.degree);
      formData.append('salary', inputField.salary);
      formData.append('gymId', parseInt(inputField.gymId, 10));

      if (selectedImageFile) {
        formData.append('avatar', selectedImageFile);
      } else if (inputField.profilePic) {
        formData.append('profilePic', inputField.profilePic);
      }

      const response = await axios.post('http://localhost:5000/api/trainers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success("Thêm huấn luyện viên thành công!");
      if (onSuccess) {
        setTimeout(() => onSuccess(response.data), 500);
      }

      // Reset form
      setInputField({
        name: "",
        mobileNo: "",
        sex: "",
        degree: "",
        salary: "",
        profilePic: "https://th.bing.com/th/id/OIP.gj6t3grz5no6UZ03uIluiwHaHa?rs=1&pid=ImgDetMain",
        gymId: localStorage.getItem('gymId') || '1',
      });
      setSelectedImageFile(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);

    } catch (err) {
      console.error("Lỗi khi thêm trainer:", err);
      const errorMessage = err.response?.data?.message || err.message || "Thêm trainer thất bại!";
      toast.error(errorMessage);
    }
  }

  return (
    <div className='text-black'>
      <div className='grid gap-5 grid-cols-2 text-lg'>

        <input 
          value={inputField.name}
          onChange={(e) => handleOnChange(e, "name")}
          placeholder='Tên huấn luyện viên'
          type='text'
          className='border-2 w-[90%] pl-3 pr-3 pt-2 pb-2 border-slate-400 rounded-md h-12'
        />

        <input 
          value={inputField.mobileNo}
          onChange={(e) => handleOnChange(e, "mobileNo")}
          placeholder='Số điện thoại'
          type='text'
          className='border-2 w-[90%] pl-3 pr-3 pt-2 pb-2 border-slate-400 rounded-md h-12'
        />

        <select
          value={inputField.sex}
          onChange={(e) => handleOnChange(e, "sex")}
          className='border-2 w-[90%] h-12 pt-2 pb-2 border-slate-400 rounded-md placeholder:text-gray'
        >
          <option value="">Chọn giới tính</option>
          <option value="Male">Nam</option>
          <option value="Female">Nữ</option>
        </select>

        <input 
          value={inputField.degree}
          onChange={(e) => handleOnChange(e, "degree")}
          placeholder='Bằng cấp / Chuyên môn'
          type='text'
          className='border-2 w-[90%] pl-3 pr-3 pt-2 pb-2 border-slate-400 rounded-md h-12'
        />

        <input 
          value={inputField.salary}
          onChange={(e) => handleOnChange(e, "salary")}
          placeholder='Lương (VND)'
          type='number'
          className='border-2 w-[90%] pl-3 pr-3 pt-2 pb-2 border-slate-400 rounded-md h-12'
        />

        <div className='col-span-2'>
          <label className='block mb-2'>Ảnh đại diện:</label>
          <input 
            type='file' 
            onChange={handleImageChange} 
            accept="image/*"
            className='border-2 p-2 rounded-md'
          />
          {inputField.profilePic && (
            <img 
              src={inputField.profilePic} 
              alt="profile preview" 
              className='mt-2 w-32 h-32 object-cover rounded-full'
            />
          )}
        </div>

        <div 
          onClick={handleRegisterButton}
          className='col-span-2 p-3 border-2 w-32 text-lg h-14 text-center bg-slate-900 text-white rounded-xl cursor-pointer hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
        >
          Đăng ký
        </div>

      </div>
      <ToastContainer />
    </div>
  )
}

export default AddTrainer;
