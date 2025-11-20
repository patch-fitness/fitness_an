import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockTrainers , mockMembers, mockSubscriptions } from "@/data/mockData";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";



const DEFAULT_AVATAR =
  "https://th.bing.com/th/id/OIP.gj6t3grz5no6UZ03uIluiwHaHa?rs=1&pid=ImgDetMain";

export default function TrainerDetail() {
  const { id } = useParams(); // lấy id từ URL
  const navigate = useNavigate();

  const [trainer, setTrainer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    mobileNo: "",
    sex: "",
    degree: "",
    salary: "",
    profilePic: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [members, setMembers] = useState([]);




  useEffect(() => {
    // Tìm trainer từ mock theo id
    const found = mockTrainers.find((t) => t.id === Number(id));
    if (found) {
      setTrainer(found);
      setEditForm({
        name: found.name,
        mobileNo: found.mobileNo,
        sex: found.sex,
        degree: found.degree,
        salary: found.salary,
        profilePic: found.profilePic || "",
      });
      setAvatarPreview(found.profilePic || DEFAULT_AVATAR);
    } else {
      setTrainer(null);
    }
  }, [id]);
  // Lấy dữ liệu members của trainer từ mock data
  useEffect(() => {
        const foundTrainer = mockTrainers.find(t => t.id === Number(id));
        setTrainer(foundTrainer || null);

        // Lọc member của trainer
        const trainerSubs = mockSubscriptions.filter(sub => sub.trainerId === Number(id));
        const trainerMembers = trainerSubs
            .map(sub => mockMembers.find(m => m.id === sub.memberId))
            .filter(Boolean);
        setMembers(trainerMembers);
    }, [id]);

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };
  // Hủy chỉnh sửa
  const cancelEdit = () => {
    if (!trainer) return;
    setIsEditing(false);
    setEditForm({
      name: trainer.name,
      mobileNo: trainer.mobileNo,
      sex: trainer.sex,
      degree: trainer.degree,
      salary: trainer.salary,
      profilePic: trainer.profilePic || "",
    });
    setAvatarPreview(trainer.profilePic || DEFAULT_AVATAR);
    setNewAvatarFile(null);
  };

 const handleSaveEdit = () => {
  if (!trainer) return;

  const updatedTrainer = {
    ...trainer,
    ...editForm,
    profilePic: newAvatarFile ? URL.createObjectURL(newAvatarFile) : avatarPreview,
  };

  setTrainer(updatedTrainer);

  // TODO: upload newAvatarFile lên server nếu có
};

  if (!trainer) return <p>Trainer not found!</p>;

  return (
    <div className="w-3/4 text-black p-5 space-y-5 ">

  {/* Go Back */}
  <div
    onClick={() => navigate(-1)}
    className="border-2 w-fit text-xl font-sans text-white p-2 rounded-xl bg-slate-900 cursor-pointer mb-5 flex items-center gap-2"
  >
    <ArrowBackIcon /> Go Back
  </div>

  <div className="flex flex-col md:flex-row gap-6">

    {/* Avatar */}
    <div className="md:w-1/3 mx-auto flex flex-col items-center">
      <img
        src={avatarPreview || DEFAULT_AVATAR}
        alt="avatar"
        className="w-full rounded-lg shadow-md object-cover"
      />
      {isEditing && (
        <input
          type="file"
          accept="image/*"
          className="mt-2 border-2 border-dashed p-2 rounded w-full"
          onChange={(e) => {
            const file = e.target.files[0];
            setNewAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
          }}
        />
      )}
    </div>

    {/* Info */}
    <div className="md:w-2/3 bg-white/80 p-6 rounded-2xl shadow-lg flex flex-col gap-4 mt-5">
      
      {/* Edit / Save / Cancel */}
      <div className="flex justify-end gap-2">
        {!isEditing ? (
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        ) : (
          <>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              onClick={handleSaveEdit}
            >
              Save
            </button>
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {/* Info Fields */}
      <div className="space-y-3">
        <div>
          <label className="font-semibold">Name:</label>
          {isEditing ? (
            <input
              value={editForm.name}
              onChange={(e) => handleEditChange("name", e.target.value)}
              className="w-full border p-2 rounded"
            />
          ) : (
            <p>{trainer.name}</p>
          )}
        </div>

        <div>
          <label className="font-semibold">Mobile:</label>
          {isEditing ? (
            <input
              value={editForm.mobileNo}
              onChange={(e) => handleEditChange("mobileNo", e.target.value)}
              className="w-full border p-2 rounded"
            />
          ) : (
            <p>{trainer.mobileNo}</p>
          )}
        </div>

        <div>
          <label className="font-semibold">Sex:</label>
          {isEditing ? (
            <select
              value={editForm.sex}
              onChange={(e) => handleEditChange("sex", e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Select…</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          ) : (
            <p>{trainer.sex}</p>
          )}
        </div>

        <div>
          <label className="font-semibold">Degree:</label>
          {isEditing ? (
            <input
              value={editForm.degree}
              onChange={(e) => handleEditChange("degree", e.target.value)}
              className="w-full border p-2 rounded"
            />
          ) : (
            <p>{trainer.degree}</p>
          )}
        </div>

        <div>
          <label className="font-semibold">Salary:</label>
          {isEditing ? (
            <input
              type="number"
              value={editForm.salary}
              onChange={(e) => handleEditChange("salary", e.target.value)}
              className="w-full border p-2 rounded"
            />
          ) : (
            <p>{trainer.salary}</p>
          )}
        </div>
      </div>
    </div>
  </div>
  {/* Members list */}
<h2 className="text-2xl font-semibold text-slate-900 mb-3">
  Học viên của Trainer
</h2>

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ">
  {members.length > 0 ? (
    members.map((m) => (
      <div
        key={m.id}
        className="bg-white p-4 rounded-xl shadow hover:shadow-md cursor-pointer transition"
        onClick={() => navigate(`/member/${m.id}`)} // navigate đến MemberDetail (chỉ xem)
      >
        {/* Avatar */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
            {m.profilePic ? (
              <img
                src={m.profilePic}
                alt={m.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <PersonIcon className="text-slate-700" />
            )}
          </div>
          <div>
            <div className="text-lg font-semibold">{m.name}</div>
            <div className="text-sm text-slate-500">{m.mobileNo}</div>
          </div>
        </div>
      </div>
    ))
  ) : (
    <div className="col-span-3 text-center text-slate-500 text-xl mt-10">
      Trainer chưa có học viên
    </div>
  )}
</div>

</div>

  );
}
