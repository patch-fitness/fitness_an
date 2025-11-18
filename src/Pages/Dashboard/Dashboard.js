import React from "react";
import DashboardCard from "@/Pages/Dashboard/DashboardCard";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import ErrorIcon from "@mui/icons-material/Error";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ReportIcon from "@mui/icons-material/Report";
import WarningIcon from "@mui/icons-material/Warning";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import { useTheme } from "@/contexts/ThemeContext";

const Dashboard = () => {
  const { theme } = useTheme();
  
  const handleOnClickMenu = (func) => {
    sessionStorage.setItem("func", func);
  };

  return (
    <div className={`w-full p-8 transition-colors duration-300 ${
      theme === 'dark' ? 'text-white' : 'text-slate-800'
    }`}>
      <div className="mb-8 animate-fade-in">
        <h1 className={`text-4xl font-bold mb-2 transition-colors ${
          theme === 'dark' ? 'text-white' : 'text-slate-900'
        }`}>
          Dashboard
        </h1>
        <p className={`text-lg transition-colors ${
          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
        }`}>
          Tổng quan hệ thống quản lý phòng gym
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* 1️⃣ Joined Members */}
        <DashboardCard
          to="/members"
          icon={<PeopleAltIcon sx={{ fontSize: 48 }} />}
          title="Joined Members"
          color="#34d399"
          onClick={() => handleOnClickMenu("joinedMembers")}
        />

        {/* 2️⃣ Monthly Joined */}
        <DashboardCard
          to="/specific/monthly"
          icon={<SignalCellularAltIcon sx={{ fontSize: 48 }} />}
          title="Monthly Joined"
          color="#a78bfa"
          onClick={() => handleOnClickMenu("monthlyJoined")}
        />

        {/* 3️⃣ Expiring in 3 Days */}
        <DashboardCard
          to="/specific/threeDayExpire"
          icon={<AccessAlarmIcon sx={{ fontSize: 48 }} />}
          title="Expiring in 3 Days"
          color="#f87171"
          onClick={() => handleOnClickMenu("threeDayExpire")}
        />

        {/* 4️⃣ Expiring in 4–7 Days */}
        <DashboardCard
          to="/specific/fourToSevenDaysExpire"
          icon={<WarningIcon sx={{ fontSize: 48 }} />}
          title="Expiring in 4–7 Days"
          color="#fb923c"
          onClick={() => handleOnClickMenu("fourToSevenDaysExpire")}
        />

        {/* 5️⃣ Expired Members */}
        <DashboardCard
          to="/specific/expired"
          icon={<ErrorIcon sx={{ fontSize: 48 }} />}
          title="Expired Members"
          color="#ef4444"
          onClick={() => handleOnClickMenu("expired")}
        />

        {/* 6️⃣ Inactive Members */}
        <DashboardCard
          to="/specific/inactive"
          icon={<ReportIcon sx={{ fontSize: 48 }} />}
          title="Inactive Members"
          color="#facc15"
          onClick={() => handleOnClickMenu("inActiveMembers")}
        />

        {/* 7️⃣ Equipment Management */}
        <DashboardCard
          to="/equipment"
          icon={<FitnessCenterIcon sx={{ fontSize: 48 }} />}
          title="Quản lý thiết bị"
          color="#60a5fa"
          onClick={() => handleOnClickMenu("equipment")}
        />

        {/* 8️⃣ Finance Management */}
        <DashboardCard
          to="/finance"
          icon={<AccountBalanceWalletIcon sx={{ fontSize: 48 }} />}
          title="Quản lý tài chính"
          color="#f472b6"
          onClick={() => handleOnClickMenu("finance")}
        />
      </div>

    </div>
  );
};

export default Dashboard;
