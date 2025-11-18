import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

const DashboardCard = ({ to, icon, title, color, onClick }) => {
  const { theme } = useTheme();
  
  const cardBg = theme === 'dark'
    ? 'bg-slate-800/80 backdrop-blur-sm border border-slate-700/50'
    : 'bg-white/90 backdrop-blur-sm border border-slate-200/50';
  
  const hoverEffect = theme === 'dark'
    ? 'hover:bg-slate-700/80 hover:border-slate-600 hover:shadow-xl hover:shadow-blue-500/10'
    : 'hover:bg-white hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/20';

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`${cardBg} ${hoverEffect} rounded-2xl p-8 text-center transition-all duration-300 transform hover:-translate-y-2 group animate-fade-in`}
      style={{ animationDelay: `${Math.random() * 0.3}s` }}
    >
      <div 
        className="mb-4 transition-transform duration-300 group-hover:scale-110"
        style={{ color }}
      >
        {icon}
      </div>
      <p className={`text-lg font-semibold transition-colors ${
        theme === 'dark' ? 'text-white' : 'text-slate-800'
      }`}>
        {title}
      </p>
      <div className="mt-4 h-1 w-0 group-hover:w-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 mx-auto rounded-full"></div>
    </Link>
  );
};

export default DashboardCard;
