const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { validateRequiredFields } = require('../utils/validation');

const selectableColumns = [
  'id',
  'name',
  'mobileNo',
  'address',
  'profilePic',
  'joinDate',
  'status',
  'gymId',
];

const buildUpdateQuery = (payload) => {
  const allowedFields = ['name', 'mobileNo', 'address', 'profilePic', 'joinDate', 'status', 'gymId'];
  return Object.entries(payload).filter(([field, value]) => allowedFields.includes(field) && value !== undefined);
};

exports.getMembers = asyncHandler(async (req, res) => {
  const { gymId } = req.query;
  const whereClause = gymId ? 'WHERE m.gymId = ?' : '';
  const params = gymId ? [gymId] : [];

  // Join with subscriptions to get plan and nextBillDate
  const [members] = await pool.query(
    `SELECT 
      m.id,
      m.name,
      m.mobileNo,
      m.address,
      m.profilePic,
      m.joinDate as createdAt,
      m.status,
      m.gymId,
      COALESCE(MAX(ms.endDate), NULL) as nextBillDate,
      COALESCE(MAX(mem.title), NULL) as plan
    FROM Members m
    LEFT JOIN Member_Subscriptions ms ON m.id = ms.memberId AND ms.status = 'Active'
    LEFT JOIN Memberships mem ON ms.membershipId = mem.id
    ${whereClause}
    GROUP BY m.id
    ORDER BY m.joinDate DESC`,
    params
  );

  // Format response to match frontend expectations
  const formattedMembers = members.map(member => ({
    id: member.id,
    name: member.name,
    mobileNo: member.mobileNo,
    address: member.address,
    profilePic: member.profilePic,
    createdAt: member.createdAt,
    nextBillDate: member.nextBillDate,
    status: member.status || 'Active',
    plan: member.plan || 'No Plan',
  }));

  res.json(formattedMembers);
});

exports.getMemberById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const [members] = await pool.query(
    `SELECT 
      m.id,
      m.name,
      m.mobileNo,
      m.address,
      m.profilePic,
      m.joinDate as createdAt,
      m.status,
      m.gymId,
      COALESCE(MAX(ms.endDate), NULL) as nextBillDate,
      COALESCE(MAX(mem.title), NULL) as plan
    FROM Members m
    LEFT JOIN Member_Subscriptions ms ON m.id = ms.memberId AND ms.status = 'Active'
    LEFT JOIN Memberships mem ON ms.membershipId = mem.id
    WHERE m.id = ?
    GROUP BY m.id`,
    [id]
  );

  if (members.length === 0) {
    return res.status(404).json({ message: 'Member not found' });
  }

  const member = members[0];
  const formattedMember = {
    id: member.id,
    name: member.name,
    mobileNo: member.mobileNo,
    address: member.address,
    profilePic: member.profilePic,
    createdAt: member.createdAt,
    nextBillDate: member.nextBillDate,
    status: member.status || 'Active',
    plan: member.plan || 'No Plan',
  };

  return res.json(formattedMember);
});

exports.createMember = asyncHandler(async (req, res) => {
  validateRequiredFields(req.body, ['name', 'mobileNo', 'address', 'gymId']);

  const {
    name,
    mobileNo,
    address,
    profilePic = null,
    joinDate = null,
    status = 'Active',
    gymId,
    membershipId = null,
  } = req.body;

  const parsedGymId = parseInt(gymId, 10);
  const parsedMembershipId = membershipId ? parseInt(membershipId, 10) : null;
  const normalizedJoinDate = joinDate && joinDate !== 'null' ? new Date(joinDate) : new Date();
  const avatarPath = req.file ? `/uploads/avatars/${req.file.filename}` : profilePic || null;

  const [result] = await pool.execute(
    `INSERT INTO Members (name, mobileNo, address, profilePic, joinDate, status, gymId)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, mobileNo, address, avatarPath, normalizedJoinDate, status, parsedGymId]
  );

  let planName = 'No Plan';
  let nextBillDate = null;

  if (parsedMembershipId) {
    const [membershipRows] = await pool.query(
      `SELECT id, title, name as membershipName, duration_in_months FROM Memberships WHERE id = ?`,
      [parsedMembershipId]
    );

    if (membershipRows.length === 0) {
      return res.status(400).json({ message: 'Membership not found' });
    }

    const membership = membershipRows[0];
    planName = membership.title || membership.membershipName || planName;
    const durationInMonths = membership.duration_in_months || 1;
    const endDate = new Date(normalizedJoinDate);
    endDate.setMonth(endDate.getMonth() + durationInMonths);
    nextBillDate = endDate.toISOString();

    await pool.execute(
      `INSERT INTO Member_Subscriptions (memberId, membershipId, trainerId, pt_schedule, startDate, endDate, status)
       VALUES (?, ?, NULL, NULL, ?, ?, 'Active')`,
      [result.insertId, membership.id, normalizedJoinDate, endDate]
    );
  }

  const formattedMember = {
    id: result.insertId,
    name,
    mobileNo,
    address,
    profilePic: avatarPath,
    createdAt: normalizedJoinDate.toISOString(),
    nextBillDate,
    status: status || 'Active',
    plan: planName,
  };

  res.status(201).json(formattedMember);
});

exports.updateMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (req.file) {
    req.body.profilePic = `/uploads/avatars/${req.file.filename}`;
  }
  const entries = buildUpdateQuery(req.body);

  if (entries.length === 0) {
    return res.status(400).json({ message: 'No updatable fields provided' });
  }

  const sets = entries.map(([field]) => `${field} = ?`);
  const values = entries.map(([, value]) => (value === '' ? null : value));
  values.push(id);

  const [result] = await pool.execute(`UPDATE Members SET ${sets.join(', ')} WHERE id = ?`, values);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Member not found' });
  }

  const [members] = await pool.query(
    `SELECT 
      m.id,
      m.name,
      m.mobileNo,
      m.address,
      m.profilePic,
      m.joinDate as createdAt,
      m.status,
      m.gymId,
      COALESCE(MAX(ms.endDate), NULL) as nextBillDate,
      COALESCE(MAX(mem.title), NULL) as plan
    FROM Members m
    LEFT JOIN Member_Subscriptions ms ON m.id = ms.memberId AND ms.status = 'Active'
    LEFT JOIN Memberships mem ON ms.membershipId = mem.id
    WHERE m.id = ?
    GROUP BY m.id`,
    [id]
  );

  const member = members[0];
  const formattedMember = {
    id: member.id,
    name: member.name,
    mobileNo: member.mobileNo,
    address: member.address,
    profilePic: member.profilePic,
    createdAt: member.createdAt,
    nextBillDate: member.nextBillDate,
    status: member.status || 'Active',
    plan: member.plan || 'No Plan',
  };

  res.json(formattedMember);
});

exports.deleteMember = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Lấy danh sách subscriptionId của member
  const [subscriptionRows] = await pool.query(
    'SELECT id FROM Member_Subscriptions WHERE memberId = ?',
    [id]
  );
  const subscriptionIds = subscriptionRows.map((row) => row.id);

  // Xóa transactions liên quan đến các subscriptions này trước
  if (subscriptionIds.length > 0) {
    const placeholders = subscriptionIds.map(() => '?').join(', ');
    await pool.query(
      `DELETE FROM Transactions WHERE subscriptionId IN (${placeholders})`,
      subscriptionIds
    );
  }
  
  // Xóa tất cả subscriptions của member trước (foreign key constraint)
  await pool.execute('DELETE FROM Member_Subscriptions WHERE memberId = ?', [id]);
  
  // Sau đó mới xóa member
  const [result] = await pool.execute('DELETE FROM Members WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Member not found' });
  }

  res.status(204).send();
});

