import "./App.css";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Dashboard from "@/Pages/Dashboard/Dashboard";
import Home from "@/Pages/Home/Home";
import Members from "@/Pages/Members/Members";
import GeneralUser from "@/Pages/GeneralUser/GeneralUser";
import MemberDetail from "@/Pages/MemberDetail/MemberDetail";
import Equipment from "@/Pages/Equipment/Equipment";
import EquipmentDetail from "@/Pages/EquipmentDetail/EquipmentDetail";
import Finance from "@/Pages/Finance/Finance";
import { ToastContainer,toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Help from "@/components/Help/Help";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(null);
  const { theme } = useTheme();
  //  Kiểm tra login khi load app
  useEffect(() => {
  const token = localStorage.getItem("token");
  setIsLogin(!!token);

  if (token && location.pathname === "/") {
    navigate("/dashboard", { replace: true });
  } else if (!token && location.pathname !== "/") {
    navigate("/", { replace: true });
  }
}, [location.pathname, navigate]);

  // 🕐 Khi đang kiểm tra login
  if (isLogin === null) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-xl">
        Đang tải...
      </div>
    );
  }
  //logout function

  const handleLogout = () => {
    localStorage.removeItem("token"); // xoá token
    setIsLogin(false);
    navigate("/");
    toast.success("Đăng xuất thành công!");
  };





  // Background gradient based on theme
  const backgroundClass = theme === 'dark' 
    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50';

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${backgroundClass}`}>
      {/* Sidebar chỉ hiện khi login */}
      {isLogin && location.pathname !== "/" && <Sidebar onLogout={handleLogout} />}

      <div className="flex-1 relative">
        {/* Theme Toggle Button - Fixed position */}
        {isLogin && location.pathname !== "/" && (
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
        )}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/member/:id" element={<MemberDetail />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/equipment/:id" element={<EquipmentDetail />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/specific/:page" element={<GeneralUser />} />
        </Routes>
      </div>

      {/* ToastContainer toàn cục */}
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        theme={theme}
        toastClassName="!rounded-xl !shadow-lg"
        progressClassName={theme === 'dark' ? '!bg-blue-500' : '!bg-blue-600'}
      />
      {/* Nút trợ giúp */}
      {isLogin && location.pathname !== "/" && <Help />}
    </div>
  );
}

export default App;
