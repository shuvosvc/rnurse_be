const { api, auth } = require("../helpers/common");
const errors = require("../helpers/errors");

const { validateCreateHealthMetric } = require("../validator/healthMetric");





























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
  const { member_id, limit = 20, offset = 0, from, to } = req.body;

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

  const dateFilter = (table) => {
    let condition = `user_id = $1`;
    const values = [member_id];
    let idx = 2;

    if (fromDate) {
      condition += ` AND created_at >= $${idx++}`;
      values.push(fromDate.toISOString().split('T')[0]);
    }

    if (toDate) {
      condition += ` AND created_at <= $${idx++}`;
      values.push(toDate.toISOString().split('T')[0]);
    }

    condition += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx}`;
    values.push(parsedLimit, parsedOffset);
    return { condition, values };
  };

  const metricQuery = async (table, fields) => {
    const { condition, values } = dateFilter(table);
    const result = await connection.query(
      `SELECT id, ${fields.join(', ')}, created_at FROM ${table} WHERE ${condition}`, values
    );
    return result;
  };

  const weights = await metricQuery("weights", ["weight"]);
  const bloodPressures = await metricQuery("blood_pressures", ["systolic", "diastolic"]);
  const sugarLevels = await metricQuery("sugar_levels", ["sugar_level"]);
  const oxygenLevels = await metricQuery("oxygen_levels", ["o2_level"]);

  return {
    flag: 200,
    metrics: {
      weights,
      bloodPressures,
      sugarLevels,
      oxygenLevels
    },
    message: "Health metrics fetched successfully."
  };
}));
