import React, { useState, useMemo, useEffect } from "react";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import AddFinance from "@/components/AddFinance/AddFinance";
import Modal from "@/components/Modal/Modal";
import { mockFinance } from "@/data/mockData";

const Finance = () => {
  const [records, setRecords] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const totals = useMemo(() => {
    const incomeTotal = records.reduce((sum, record) => sum + record.income, 0);
    const expenseTotal = records.reduce((sum, record) => sum + record.expense, 0);
    const profitTotal = records.reduce((sum, record) => sum + record.profit, 0);
    return {
      incomeTotal,
      expenseTotal,
      profitTotal,
    };
  }, [records]);

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("vi-VN") + "₫";

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/transactions?gymId=1');
      setRecords(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu tài chính:", err);
      toast.error("Lỗi khi tải dữ liệu tài chính. Sử dụng dữ liệu mẫu.");
      setRecords([...mockFinance]);
      setLoading(false);
    }
  };

  const handleAddFinance = async (payload) => {
    try {
      const transactionData = {
        bill: payload.bill,
        income: payload.income,
        expense: payload.expense,
        category: payload.income > 0 ? 'Income' : 'Expense',
        gymId: 1 // TODO: Lấy từ context hoặc state
      };
      
      const response = await axios.post('http://localhost:5000/api/transactions', transactionData);
      toast.success("Đã thêm bản ghi tài chính mới!");
      
      // Refresh danh sách
      await fetchTransactions();
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Lỗi khi thêm bản ghi tài chính:", err);
      toast.error("Lỗi khi thêm bản ghi tài chính!");
    }
  };

  return (
    <div className="text-black p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <MonetizationOnIcon sx={{ fontSize: 40 }} />
          <div>
            <div className="text-2xl font-bold">Quản lý tài chính</div>
            <div className="text-sm text-white/80">
              Theo dõi thu chi và lợi nhuận của phòng gym
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-white text-indigo-700 px-5 py-3 rounded-lg font-semibold hover:bg-indigo-100 transition-all shadow-md"
        >
          <AddCircleIcon />
          Thêm bản ghi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
        <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-emerald-400">
          <div className="text-sm text-gray-500">Tiền thu vào</div>
          <div className="text-2xl font-bold text-emerald-500 mt-2">
            {formatCurrency(totals.incomeTotal)}
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-rose-400">
          <div className="text-sm text-gray-500">Tiền trả ra</div>
          <div className="text-2xl font-bold text-rose-500 mt-2">
            {formatCurrency(totals.expenseTotal)}
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-sky-400">
          <div className="text-sm text-gray-500">Lợi nhuận</div>
          <div
            className={`text-2xl font-bold mt-2 ${
              totals.profitTotal >= 0 ? "text-sky-500" : "text-rose-500"
            }`}
          >
            {formatCurrency(totals.profitTotal)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md mt-8 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100 text-left text-gray-600 uppercase text-sm">
            <tr>
              <th className="p-4">Hóa đơn / Giao dịch</th>
              <th className="p-4 text-right">Tiền thu vào</th>
              <th className="p-4 text-right">Tiền trả ra</th>
              <th className="p-4 text-right">Lợi nhuận</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500 text-lg">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : records.length > 0 ? (
              records.map((record) => (
                <tr
                  key={record.id}
                  className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 font-semibold text-slate-800">
                    {record.bill}
                  </td>
                  <td className="p-4 text-right text-emerald-600 font-medium">
                    {formatCurrency(record.income)}
                  </td>
                  <td className="p-4 text-right text-rose-500 font-medium">
                    {formatCurrency(record.expense)}
                  </td>
                  <td
                    className={`p-4 text-right font-bold ${
                      record.profit >= 0 ? "text-sky-600" : "text-rose-600"
                    }`}
                  >
                    {formatCurrency(record.profit)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="p-6 text-center text-gray-500 text-lg"
                >
                  Chưa có bản ghi tài chính nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <Modal
          header="Thêm bản ghi tài chính"
          handleClose={() => setIsAddModalOpen(false)}
          content={<AddFinance onSuccess={handleAddFinance} />}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default Finance;

