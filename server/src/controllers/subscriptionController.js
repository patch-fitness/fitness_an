const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { validateRequiredFields } = require('../utils/validation');

const baseSelect = `
  ms.id,
  ms.memberId,
  ms.membershipId,
  ms.trainerId,
  ms.pt_schedule,
  ms.startDate,
  ms.endDate,
  ms.status,
  m.name AS memberName,
  m.gymId AS memberGymId,
  mem.title AS membershipTitle,
  mem.price AS membershipPrice,
  mem.gymId AS membershipGymId,
  t.name AS trainerName
`;

const getSubscriptionByConditions = async (conditions, params) => {
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `
    SELECT ${baseSelect}
    FROM Member_Subscriptions ms
    INNER JOIN Members m ON ms.memberId = m.id
    INNER JOIN Memberships mem ON ms.membershipId = mem.id
    LEFT JOIN Trainers t ON ms.trainerId = t.id
    ${whereClause}
    ORDER BY ms.startDate DESC
    `,
    params
  );

  return rows;
};

exports.getSubscriptions = asyncHandler(async (req, res) => {
  const { gymId, memberId, status } = req.query;

  const conditions = [];
  const params = [];

  if (gymId) {
    conditions.push('(m.gymId = ? OR mem.gymId = ?)');
    params.push(gymId, gymId);
  }

  if (memberId) {
    conditions.push('ms.memberId = ?');
    params.push(memberId);
  }

  if (status) {
    conditions.push('ms.status = ?');
    params.push(status);
  }

  const subscriptions = await getSubscriptionByConditions(conditions, params);
  res.json(subscriptions);
});

exports.getSubscriptionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const subscriptions = await getSubscriptionByConditions(['ms.id = ?'], [id]);

  if (subscriptions.length === 0) {
    return res.status(404).json({ message: 'Subscription not found' });
  }

  return res.json(subscriptions[0]);
});

exports.createSubscription = asyncHandler(async (req, res) => {
  validateRequiredFields(req.body, ['memberId', 'membershipId', 'startDate', 'endDate']);

  const {
    memberId,
    membershipId,
    trainerId = null,
    pt_schedule = null,
    startDate,
    endDate,
    status = 'Active',
  } = req.body;

  const [result] = await pool.execute(
    `
    INSERT INTO Member_Subscriptions
      (memberId, membershipId, trainerId, pt_schedule, startDate, endDate, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [memberId, membershipId, trainerId, pt_schedule, startDate, endDate, status]
  );

  const subscriptions = await getSubscriptionByConditions(['ms.id = ?'], [result.insertId]);

  res.status(201).json(subscriptions[0]);
});

exports.updateSubscription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const allowedFields = ['memberId', 'membershipId', 'trainerId', 'pt_schedule', 'startDate', 'endDate', 'status'];

  const entries = Object.entries(req.body).filter(
    ([field, value]) => allowedFields.includes(field) && value !== undefined
  );

  if (entries.length === 0) {
    return res.status(400).json({ message: 'No updatable fields provided' });
  }

  const sets = entries.map(([field]) => `${field} = ?`);
  const values = entries.map(([, value]) => (value === '' ? null : value));
  values.push(id);

  const [result] = await pool.execute(`UPDATE Member_Subscriptions SET ${sets.join(', ')} WHERE id = ?`, values);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Subscription not found' });
  }

  const subscriptions = await getSubscriptionByConditions(['ms.id = ?'], [id]);
  res.json(subscriptions[0]);
});

exports.deleteSubscription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.execute('DELETE FROM Member_Subscriptions WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Subscription not found' });
  }

  res.status(204).send();
});

