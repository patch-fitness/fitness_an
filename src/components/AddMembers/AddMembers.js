import React, { useState,useEffect } from 'react'
import axios from 'axios';

import { ToastContainer,toast } from 'react-toastify';

const AddMembers = ({ onSuccess, onMembershipAdded }) => {

  const [inputField, setInputField] = useState({ 
    name: "", 
    mobileNo: "", 
    address: "", 
    membership: "", 
    profilePic: "https://th.bing.com/th/id/OIP.gj6t3grz5no6UZ03uIluiwHaHa?rs=1&pid=ImgDetMain", 
    joiningDate: "",
    status: "Active",
    plan: "Standard Plan"
  });
  const [membershipList, setMembershipList] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const handleOnChange = (event, name) => {
    setInputField({ ...inputField, [name]: event.target.value });
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setSelectedImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setInputField({ ...inputField, profilePic: preview });
  };

  const fetchMembership = async () => {
    try {
      // Lấy gymId từ localStorage
      const gymId = localStorage.getItem('gymId') || '1';
      const response = await axios.get(`http://localhost:5000/api/memberships?gymId=${gymId}`);
      const memberships = response.data || [];
      
      // Format dữ liệu để phù hợp với component
      const formattedMemberships = memberships.map(m => ({
        _id: m.id.toString(),
        id: m.id,
        months: m.months || m.duration_in_months,
        title: m.title || m.name,
        price: m.price
      }));
      
      setMembershipList(formattedMemberships);
    } catch (err) {
      console.error("Lỗi khi tải danh sách gói tập:", err);
      toast.error("Lỗi khi tải danh sách gói tập");
      // Fallback to empty array
      setMembershipList([]);
    }
  }

  useEffect(() => {
    fetchMembership();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Lắng nghe sự kiện khi có membership mới được thêm
  useEffect(() => {
    const handleMembershipUpdate = () => {
      fetchMembership();
    };
    window.addEventListener('membershipAdded', handleMembershipUpdate);
    return () => {
      window.removeEventListener('membershipAdded', handleMembershipUpdate);
    };
  }, []);

  const handleOnChangeSelect = (event) => {
    const value = event.target.value;
    setSelectedOption(value);
    setInputField({ ...inputField, membership: value });
  };

  const handleRegisterButton = async () => {
    // Validate
    if (!inputField.name || !inputField.mobileNo || !inputField.membership) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      // Lấy gymId từ localStorage
      const gymId = localStorage.getItem('gymId') || '1';
      
      const formData = new FormData();
      formData.append('name', inputField.name);
      formData.append('mobileNo', inputField.mobileNo);
      formData.append('address', inputField.address || '');
      formData.append('joinDate', inputField.joiningDate || new Date().toISOString());
      formData.append('status', inputField.status || 'Active');
      formData.append('gymId', parseInt(gymId, 10));
      if (inputField.membership) {
        formData.append('membershipId', parseInt(inputField.membership, 10));
      }
      if (selectedImageFile) {
        formData.append('avatar', selectedImageFile);
      } else if (inputField.profilePic) {
        formData.append('profilePic', inputField.profilePic);
      }
      
      // Gọi API để thêm thành viên
      const response = await axios.post('http://localhost:5000/api/members', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success("Thêm thành viên thành công!");
      console.log("Member đã được thêm:", response.data);
      
      // Gọi callback để đóng modal và refresh danh sách
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(response.data); // Truyền dữ liệu từ API response
        }, 500);
      }
      
      // Reset form sau khi đóng modal
      setTimeout(() => {
        setInputField({ 
          name: "", 
          mobileNo: "", 
          address: "", 
          membership: "", 
          profilePic: "https://th.bing.com/th/id/OIP.gj6t3grz5no6UZ03uIluiwHaHa?rs=1&pid=ImgDetMain", 
          joiningDate: "",
          status: "Active",
          plan: "Standard Plan"
        });
        setSelectedOption("");
        setSelectedImageFile(null);
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
      }, 600);
    } catch (err) {
      console.error("Lỗi khi thêm thành viên:", err);
      const errorMessage = err.response?.data?.message || err.message || "Thêm thành viên thất bại!";
      toast.error(errorMessage);
    }
  }
  return (
    <div className='text-black'>
      <div className='grid gap-5 grid-cols-2 text-lg'>

        <input 
          value={inputField.name} 
          onChange={(event) => { handleOnChange(event, "name") }} 
          placeholder='Tên thành viên' 
          type='text' 
          className='border-2 w-[90%] pl-3 pr-3 pt-2 pb-2 border-slate-400 rounded-md h-12' 
        />
        
        <input 
          value={inputField.mobileNo} 
          onChange={(event) => { handleOnChange(event, "mobileNo") }} 
          placeholder='Số điện thoại' 
          type='text' 
          className='border-2 w-[90%] pl-3 pr-3 pt-2 pb-2 border-slate-400 rounded-md h-12' 
        />

        <input 
          value={inputField.address} 
          onChange={(event) => { handleOnChange(event, "address") }} 
          placeholder='Địa chỉ' 
          type='text' 
          className='border-2 w-[90%] pl-3 pr-3 pt-2 pb-2 border-slate-400 rounded-md h-12' 
        />

        <select 
          value={selectedOption} 
          onChange={handleOnChangeSelect} 
          className='border-2 w-[90%] h-12 pt-2 pb-2 border-slate-400 rounded-md placeholder:text-gray'
        >
          <option value="">Chọn gói tập</option>
          {membershipList.map((item, index) => (
            <option key={item.id || item._id || index} value={item.id || item._id}>
              {item.title || item.name || `${item.months} Tháng`} - {item.price ? `${item.price.toLocaleString('vi-VN')} VND` : ''}
            </option>
          ))}
        </select>

        <input 
          value={inputField.joiningDate} 
          onChange={(event) => { handleOnChange(event, "joiningDate") }} 
          placeholder='Ngày tham gia' 
          type='date' 
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
          onClick={() => handleRegisterButton()} 
          className='col-span-2 p-3 border-2 w-32 text-lg h-14 text-center bg-slate-900 text-white rounded-xl cursor-pointer hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
        >
          Đăng ký
        </div>

      </div>
      <ToastContainer/>
    </div>
  )
}

export default AddMembers