import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useLocation } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

const menuItems = [
  { icon: DashboardIcon, label: "Dashboard", path: "/dashboard" },
  { icon: PeopleIcon, label: "Thành viên", path: "/members" },
  { icon: SportsHandballIcon, label: "Huấn luyện viên", path: "/trainers" }, // Trainer item
  { icon: FitnessCenterIcon, label: "Thiết bị", path: "/equipment" },
  { icon: AccountBalanceWalletIcon, label: "Tài chính", path: "/finance" },
];
const Sidebar = ({ userName = "Người dùng" }) => {
  const [userAvatar, setUserAvatar] = useState("/people.png");
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  // 🌐 Đồng bộ menu với đường dẫn
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const currentItem = menuItems.find((item) =>
      location.pathname.startsWith(item.path)
    );
    if (currentItem) {
      setActiveMenu(currentItem.label);
    }
  }, [location.pathname, navigate]);
  if (!localStorage.getItem("token")) return null;

  // 📸 Upload avatar
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUserAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  // 🌅 Greeting theo giờ
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");// reset toàn bộ app state
  };
  // 🧭 Điều hướng menu
  const handleClick= (item) => {
    setActiveMenu(item.label);
    navigate(item.path);
  }   

  const sidebarBg = theme === 'dark' 
    ? 'bg-slate-800/90 backdrop-blur-xl border-r border-slate-700/50'
    : 'bg-white/90 backdrop-blur-xl border-r border-slate-200/50';

  return (
    <div className={`w-80 min-h-screen ${sidebarBg} p-6 shadow-2xl flex flex-col justify-between transition-all duration-300`}>
      {/* Hồ sơ người dùng */}
      <div>
        <div className="text-center mb-8 animate-fade-in">
          <div
            className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 border-4 border-white/50 dark:border-slate-700/50 mx-auto mb-4 cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={() => document.getElementById("avatar-upload").click()}
          >
           {userAvatar ? (
    <img
      src={userAvatar}
      alt="avatar"
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="flex items-center justify-center w-full h-full">
      <svg
        className="w-16 h-16 text-white/70"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  )}

          {/* Overlay khi hover */}
          <label
            htmlFor="avatar-upload"
            className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
             Click để tải ảnh
          </label>
          </div>

          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />

          <h3 className={`text-xl font-semibold mt-2 transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            {getGreeting()}!
          </h3>
          <p className={`transition-colors ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
          }`}>admin</p>
          <p className={`text-sm mt-1 transition-colors ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Chúc bạn một ngày tốt lành ☀️
          </p>
        </div>

        {/* Menu */}
        <nav className="space-y-2">
          {menuItems.map((item, idx) => {
            const IconComponent = item.icon;
            const isActive = activeMenu === item.label;
            return (
              <button
                key={idx}
                onClick={() => handleClick(item)}
                className={`group flex items-center px-4 py-3 rounded-xl w-full text-left transition-all duration-300 ${
                  isActive
                    ? theme === 'dark'
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 border-l-4 border-blue-400"
                      : "bg-blue-600 text-white shadow-lg shadow-blue-500/20 border-l-4 border-blue-400"
                    : theme === 'dark'
                    ? "text-slate-300 hover:text-white hover:bg-slate-700/50"
                    : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <IconComponent 
                  className={`mr-3 transition-transform duration-300 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`}
                  sx={{ fontSize: 24 }}
                />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Nút Logout */}
      <div className={`mt-8 pt-6 border-t transition-colors ${
        theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer ${
            theme === 'dark'
              ? 'text-slate-300 hover:text-white hover:bg-red-600/20 hover:border-red-500/50'
              : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
          } border border-transparent hover:border-red-200 dark:hover:border-red-800`}
        >
          <LogoutIcon className="mr-3" sx={{ fontSize: 20 }} />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
      
    </div>
    
  );
};

export default Sidebar;
