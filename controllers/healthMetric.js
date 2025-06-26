const { api, auth } = require("../helpers/common");
const errors = require("../helpers/errors");











exports.getHealthOverview = api(["member_id"], auth(async (req, connection, userInfo) => {
  const { member_id } = req.body;

  if (!Number.isInteger(+member_id)) {
    throw new errors.INVALID_FIELDS_PROVIDED("Invalid member_id.");
  }

  const isExist = await connection.queryOne(
    'SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2 AND deleted = false',
    [member_id, userInfo.user_id]
  );
  if (!isExist) throw new errors.UNAUTHORIZED();

  // Fetch latest record from each table
  const [latestWeight] = await connection.query(
    `SELECT id, weight, created_at FROM weights WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [member_id]
  );

  const [latestBP] = await connection.query(
    `SELECT id, systolic, diastolic, created_at FROM blood_pressures WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [member_id]
  );

  const [latestSugar] = await connection.query(
    `SELECT id, sugar_level, created_at FROM sugar_levels WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [member_id]
  );

  const [latestO2] = await connection.query(
    `SELECT id, o2_level, created_at FROM oxygen_levels WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [member_id]
  );

  return {
    flag: 200,
    overview: {
      weight: latestWeight || null,
      blood_pressure: latestBP || null,
      sugar_level: latestSugar || null,
      o2_level: latestO2 || null
    },
    message: "Health overview fetched successfully."
  };
}));

















exports.createWeightMetric = api(["member_id", "weight"],
  auth(async (req, connection, userInfo) => {
    const { member_id, weight } = req.body;

    if (!Number.isInteger(+member_id) || isNaN(parseFloat(weight))) {
      throw new errors.INVALID_FIELDS_PROVIDED("Valid member_id and weight are required.");
    }

    const isExist = await connection.queryOne(
      'SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2 AND deleted = false',
      [member_id, userInfo.user_id]
    );
    if (!isExist) throw new errors.UNAUTHORIZED();

    await connection.queryOne(
      `INSERT INTO weights (user_id, weight) VALUES ($1, $2)`,
      [member_id, weight]
    );

    return { flag: 200, message: "Weight recorded successfully." };
  })
);


exports.deleteWeightMetric = api(["metric_id", "member_id"],
  auth(async (req, connection, userInfo) => {
    const { metric_id, member_id } = req.body;

    const isExist = await connection.queryOne(
      'SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2 AND deleted = false',
      [member_id, userInfo.user_id]
    );
    if (!isExist) throw new errors.UNAUTHORIZED();

    const result = await connection.queryOne(
      `DELETE FROM weights WHERE id = $1 AND user_id = $2 RETURNING id`,
      [metric_id, member_id]
    );

    if (!result) throw new errors.NOT_FOUND("Weight entry not found.");
    return { flag: 200, message: "Weight entry deleted." };
  })
);


exports.createBPMetric = api(["member_id", "systolic", "diastolic"],
  auth(async (req, connection, userInfo) => {
    const { member_id, systolic, diastolic } = req.body;

    if (!Number.isInteger(+member_id) || isNaN(+systolic) || isNaN(+diastolic)) {
      throw new errors.INVALID_FIELDS_PROVIDED("Valid member_id, systolic, and diastolic required.");
    }

    const isExist = await connection.queryOne(
      'SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2 AND deleted = false',
      [member_id, userInfo.user_id]
    );
    if (!isExist) throw new errors.UNAUTHORIZED();

    await connection.queryOne(
      `INSERT INTO blood_pressures (user_id, systolic, diastolic) VALUES ($1, $2, $3)`,
      [member_id, systolic, diastolic]
    );

    return { flag: 200, message: "Blood pressure recorded successfully." };
  })
);


exports.deleteBPMetric = api(["metric_id", "member_id"],
  auth(async (req, connection, userInfo) => {
    const { metric_id, member_id } = req.body;

    const isExist = await connection.queryOne(
      'SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2 AND deleted = false',
      [member_id, userInfo.user_id]
    );
    if (!isExist) throw new errors.UNAUTHORIZED();

    const result = await connection.queryOne(
      `DELETE FROM blood_pressures WHERE id = $1 AND user_id = $2 RETURNING id`,
      [metric_id, member_id]
    );

    if (!result) throw new errors.NOT_FOUND("Blood pressure entry not found.");
    return { flag: 200, message: "Blood pressure entry deleted." };
  })
);


exports.createSugarMetric = api(["member_id", "sugar_level"],
  auth(async (req, connection, userInfo) => {
    const { member_id, sugar_level } = req.body;

    if (!Number.isInteger(+member_id) || isNaN(parseFloat(sugar_level))) {
      throw new errors.INVALID_FIELDS_PROVIDED("Valid member_id and sugar_level are required.");
    }

    const isExist = await connection.queryOne(
      'SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2 AND deleted = false',
      [member_id, userInfo.user_id]
    );
    if (!isExist) throw new errors.UNAUTHORIZED();

    await connection.queryOne(
      `INSERT INTO sugar_levels (user_id, sugar_level) VALUES ($1, $2)`,
      [member_id, sugar_level]
    );

    return { flag: 200, message: "Sugar level recorded successfully." };
  })
);


exports.deleteSugarMetric = api(["metric_id", "member_id"],
  auth(async (req, connection, userInfo) => {
    const { metric_id, member_id } = req.body;

    const isExist = await connection.queryOne(
      'SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2 AND deleted = false',
      [member_id, userInfo.user_id]
    );
    if (!isExist) throw new errors.UNAUTHORIZED();

    const result = await connection.queryOne(
      `DELETE FROM sugar_levels WHERE id = $1 AND user_id = $2 RETURNING id`,
      [metric_id, member_id]
    );

    if (!result) throw new errors.NOT_FOUND("Sugar level entry not found.");
    return { flag: 200, message: "Sugar level entry deleted." };
  })
);


exports.createO2Metric = api(["member_id", "o2_level"],
  auth(async (req, connection, userInfo) => {
    const { member_id, o2_level } = req.body;

    if (!Number.isInteger(+member_id) || isNaN(parseFloat(o2_level))) {
      throw new errors.INVALID_FIELDS_PROVIDED("Valid member_id and o2_level are required.");
    }

    const isExist = await connection.queryOne(
      'SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2 AND deleted = false',
      [member_id, userInfo.user_id]
    );
    if (!isExist) throw new errors.UNAUTHORIZED();

    await connection.queryOne(
      `INSERT INTO oxygen_levels (user_id, o2_level) VALUES ($1, $2)`,
      [member_id, o2_level]
    );

    return { flag: 200, message: "Oxygen level recorded successfully." };
  })
);


exports.deleteO2Metric = api(["metric_id", "member_id"],
  auth(async (req, connection, userInfo) => {
    const { metric_id, member_id } = req.body;

    const isExist = await connection.queryOne(
      'SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2 AND deleted = false',
      [member_id, userInfo.user_id]
    );
    if (!isExist) throw new errors.UNAUTHORIZED();

    const result = await connection.queryOne(
      `DELETE FROM oxygen_levels WHERE id = $1 AND user_id = $2 RETURNING id`,
      [metric_id, member_id]
    );

    if (!result) throw new errors.NOT_FOUND("Oxygen level entry not found.");
    return { flag: 200, message: "Oxygen level entry deleted." };
  })
);

exports.getHealthMetrics = api(["member_id"], auth(async (req, connection, userInfo) => {
  const {
    member_id,
    type = 'all',
    limit = 20,
    offset = 0,
    from,
    to
  } = req.body;

  const parsedLimit = parseInt(limit, 10);
  const parsedOffset = parseInt(offset, 10);
  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;

  if (!Number.isInteger(+member_id)) throw new errors.INVALID_FIELDS_PROVIDED("Invalid member_id.");
  if (isNaN(parsedLimit) || isNaN(parsedOffset)) throw new errors.INVALID_FIELDS_PROVIDED("Limit and offset must be numbers.");
  if ((from && isNaN(fromDate)) || (to && isNaN(toDate))) throw new errors.INVALID_FIELDS_PROVIDED("Invalid date format.");

  const isExist = await connection.queryOne(
    'SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2 AND deleted = false',
    [member_id, userInfo.user_id]
  );
  if (!isExist) throw new errors.UNAUTHORIZED();

  const buildQuery = (table) => {
    let where = `user_id = $1 `;
    const values = [member_id];
    let idx = 2;

    if (fromDate) {
      where += ` AND created_at >= $${idx++}`;
      values.push(fromDate.toISOString().split("T")[0]);
    }

    if (toDate) {
      where += ` AND created_at <= $${idx++}`;
      values.push(toDate.toISOString().split("T")[0]);
    }

    const countQuery = `SELECT COUNT(*) AS total FROM ${table} WHERE ${where}`;
    const dataQuery = `
      SELECT * FROM ${table}
      WHERE ${where}
      ORDER BY created_at DESC
      LIMIT $${idx++} OFFSET $${idx}
    `;
    values.push(parsedLimit, parsedOffset);

    return { countQuery, dataQuery, values };
  };

  const results = {};

  if (type === 'weight' || type === 'all') {
    const { countQuery, dataQuery, values } = buildQuery('weights');
    const data = await connection.query(dataQuery, values);
    const count = await connection.queryOne(countQuery, values.slice(0, -2));
    results.weights = data;
    results.weightsCount = parseInt(count.total, 10);
  }

  if (type === 'bp' || type === 'all') {
    const { countQuery, dataQuery, values } = buildQuery('blood_pressures');
    const data = await connection.query(dataQuery, values);
    const count = await connection.queryOne(countQuery, values.slice(0, -2));
    results.bloodPressures = data;
    results.bpCount = parseInt(count.total, 10);
  }

  if (type === 'sugar' || type === 'all') {
    const { countQuery, dataQuery, values } = buildQuery('sugar_levels');
    const data = await connection.query(dataQuery, values);
    const count = await connection.queryOne(countQuery, values.slice(0, -2));
    results.sugarLevels = data;
    results.sugarCount = parseInt(count.total, 10);
  }

  if (type === 'o2' || type === 'all') {
    const { countQuery, dataQuery, values } = buildQuery('oxygen_levels');
    const data = await connection.query(dataQuery, values);
    const count = await connection.queryOne(countQuery, values.slice(0, -2));
    results.oxygenLevels = data;
    results.o2Count = parseInt(count.total, 10);
  }

  return {
    flag: 200,
    metrics: results,
    message: "Health metrics fetched successfully."
  };
}));

