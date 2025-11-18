import React, { useEffect, useState } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useNavigate } from 'react-router-dom';
import MemberCard from '@/components/MemberCard/MemberCard';
import { getMonthlyJoined, threeDayExpire, fourToSevenDaysExpire, expired, inActiveMembers } from '@/data/data';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GeneralUser = () => {
    const [header, setHeader] = useState("");
    const [data,setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const func = sessionStorage.getItem('func') || 'monthlyJoined';
        functionCall(func);
    }, [])

    const functionCall = async (func) => {
        setLoading(true);
        setError("");
        let membersResponse = { members: [] };
        try {
            switch (func) {
                case "monthlyJoined":
                    setHeader("Hội viên tham gia trong tháng này");
                    membersResponse = await getMonthlyJoined();
                    break;

                case "threeDayExpire":
                    setHeader("Hội viên sắp hết hạn trong 3 ngày");
                    membersResponse = await threeDayExpire();
                    break;

                case "fourToSevenDaysExpire":
                    setHeader("Hội viên sắp hết hạn trong 4 - 7 ngày");
                    membersResponse = await fourToSevenDaysExpire();
                    break;

                case "expired":
                    setHeader("Hội viên đã hết hạn");
                    membersResponse = await expired();
                    break;

                case "inActiveMembers":
                    setHeader("Hội viên đang tạm ngưng");
                    membersResponse = await inActiveMembers();
                    break;

                default:
                    setHeader("Danh sách hội viên");
                    membersResponse = await getMonthlyJoined();
                    break;
            }
            setData(membersResponse.members || []);
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu hội viên theo bộ lọc:", err);
            const message = err.response?.data?.message || "Không thể tải dữ liệu hội viên. Vui lòng thử lại sau.";
            setError(message);
            setData([]);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    const handleViewMember = (member) => {
        if (!member?.id) return;
        navigate(`/member/${member.id}`);
    }
    return (
        <div className='text-black p-5 w-3/4 flex-col'>

            <div className='border-2 bg-slate-900 flex justify-between w-full text-white rounded-lg p-3'>
                <Link to={'/dashboard'} className='border-2 pl-3 pr-3 pt-1 pb-1 rounded-2xl cursor-pointer hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:text-black'>
                    <ArrowBackIcon /> Back To Dashboard
                </Link>
            </div>

            <div className='mt-5 text-xl text-slate-900'>
                {header}
            </div>

            <div className='bg-slate-100 p-5 rounded-lg mt-5 min-h-[60vh]'>
                {loading ? (
                    <div className='text-center text-xl text-gray-500'>Đang tải dữ liệu...</div>
                ) : error ? (
                    <div className='text-center text-xl text-red-500'>{error}</div>
                ) : data.length === 0 ? (
                    <div className='text-center text-xl text-gray-500'>Không có hội viên phù hợp.</div>
                ) : (
                    <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
                        {data.map((member) => (
                            <MemberCard
                                key={member.id}
                                item={member}
                                onView={() => handleViewMember(member)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <ToastContainer />

        </div>
    )
}

export default GeneralUser