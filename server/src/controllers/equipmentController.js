const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { validateRequiredFields } = require('../utils/validation');

const selectableColumns = [
  'id',
  'name',
  'category',
  'location',
  'status',
  'condition',
  'image',
  'description',
  'purchase_price',
  'purchase_date',
  'maintenance_date',
  'maintenance_cost',
  'monthly_maintenance_cost',
  'gymId',
];

const buildUpdateQuery = (payload) => {
  const allowedFields = [
    'name',
    'category',
    'location',
    'status',
    'condition',
    'image',
    'description',
    'purchase_price',
    'purchase_date',
    'maintenance_date',
    'maintenance_cost',
    'monthly_maintenance_cost',
    'gymId',
  ];
  return Object.entries(payload).filter(([field, value]) => allowedFields.includes(field) && value !== undefined);
};

exports.getEquipment = asyncHandler(async (req, res) => {
  const { gymId } = req.query;
  const whereClause = gymId ? 'WHERE gymId = ?' : '';
  const params = gymId ? [gymId] : [];

  const [equipment] = await pool.query(
    `SELECT 
      id,
      name,
      category,
      location,
      status,
      \`condition\`,
      image,
      description,
      purchase_price as purchasePrice,
      purchase_date as purchaseDate,
      maintenance_date as maintenanceDate,
      maintenance_cost as maintenanceCost,
      monthly_maintenance_cost as monthlyMaintenanceCost,
      gymId
    FROM Equipment ${whereClause} ORDER BY purchase_date DESC`,
    params
  );

  res.json(equipment);
});

exports.getEquipmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [equipment] = await pool.query(
    `SELECT 
      id,
      name,
      category,
      location,
      status,
      \`condition\`,
      image,
      description,
      purchase_price as purchasePrice,
      purchase_date as purchaseDate,
      maintenance_date as maintenanceDate,
      maintenance_cost as maintenanceCost,
      monthly_maintenance_cost as monthlyMaintenanceCost,
      gymId
    FROM Equipment WHERE id = ?`,
    [id]
  );

  if (equipment.length === 0) {
    return res.status(404).json({ message: 'Equipment not found' });
  }

  return res.json(equipment[0]);
});

exports.createEquipment = asyncHandler(async (req, res) => {
  validateRequiredFields(req.body, ['name', 'gymId']);

  const {
    name,
    category = null,
    location = null,
    status = 'Available',
    condition = 'Good',
    image = null,
    description = null,
    purchase_price = null,
    purchasePrice = null,
    purchase_date = null,
    purchaseDate = null,
    maintenance_date = null,
    maintenanceDate = null,
    maintenance_cost = 0,
    maintenanceCost = 0,
    monthly_maintenance_cost = 0,
    monthlyMaintenanceCost = 0,
    gymId,
  } = req.body;

  // Support both snake_case and camelCase from frontend
  const finalPurchasePrice = purchase_price || purchasePrice;
  const finalPurchaseDate = purchase_date || purchaseDate;
  const finalMaintenanceDate = maintenance_date || maintenanceDate;
  const finalMaintenanceCost = maintenance_cost || maintenanceCost;
  const finalMonthlyMaintenanceCost = monthly_maintenance_cost || monthlyMaintenanceCost;

  const [result] = await pool.execute(
    `INSERT INTO Equipment (
      name, category, location, status, \`condition\`, image, description,
      purchase_price, purchase_date, maintenance_date, maintenance_cost, monthly_maintenance_cost, gymId
    )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      category,
      location,
      status,
      condition,
      image,
      description,
      finalPurchasePrice,
      finalPurchaseDate,
      finalMaintenanceDate,
      finalMaintenanceCost,
      finalMonthlyMaintenanceCost,
      gymId,
    ]
  );

  const [equipment] = await pool.query(
    `SELECT 
      id,
      name,
      category,
      location,
      status,
      \`condition\`,
      image,
      description,
      purchase_price as purchasePrice,
      purchase_date as purchaseDate,
      maintenance_date as maintenanceDate,
      maintenance_cost as maintenanceCost,
      monthly_maintenance_cost as monthlyMaintenanceCost,
      gymId
    FROM Equipment WHERE id = ?`,
    [result.insertId]
  );

  res.status(201).json(equipment[0]);
});

exports.updateEquipment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Map camelCase to snake_case for database
  const fieldMapping = {
    purchasePrice: 'purchase_price',
    purchaseDate: 'purchase_date',
    maintenanceDate: 'maintenance_date',
    maintenanceCost: 'maintenance_cost',
    monthlyMaintenanceCost: 'monthly_maintenance_cost',
  };

  const mappedBody = {};
  Object.entries(req.body).forEach(([key, value]) => {
    const dbField = fieldMapping[key] || key;
    mappedBody[dbField] = value;
  });

  const entries = buildUpdateQuery(mappedBody);

  if (entries.length === 0) {
    return res.status(400).json({ message: 'No updatable fields provided' });
  }

  const sets = entries.map(([field]) => {
    // Use backticks for reserved keywords
    const fieldName = field === 'condition' ? '`condition`' : field;
    return `${fieldName} = ?`;
  });
  const values = entries.map(([, value]) => (value === '' ? null : value));
  values.push(id);

  const [result] = await pool.execute(`UPDATE Equipment SET ${sets.join(', ')} WHERE id = ?`, values);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Equipment not found' });
  }

  const [equipment] = await pool.query(
    `SELECT 
      id,
      name,
      category,
      location,
      status,
      \`condition\`,
      image,
      description,
      purchase_price as purchasePrice,
      purchase_date as purchaseDate,
      maintenance_date as maintenanceDate,
      maintenance_cost as maintenanceCost,
      monthly_maintenance_cost as monthlyMaintenanceCost,
      gymId
    FROM Equipment WHERE id = ?`,
    [id]
  );
  
  res.json(equipment[0]);
});

exports.deleteEquipment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.execute('DELETE FROM Equipment WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Equipment not found' });
  }

  res.status(204).send();
});

