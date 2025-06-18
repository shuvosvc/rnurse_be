const { api, auth } = require("../helpers/common");
const errors = require("../helpers/errors");

const { validateCreateHealthMetric } = require("../validator/healthMetric");


exports.createHealthMetric = api(["member_id"],
  auth(async (req, connection, userInfo) => {

    await validateCreateHealthMetric(req); // validation first

    const { member_id, weight, bp_systolic, bp_diastolic, sugar_level, o2_level } = req.body;

    const isExist = await connection.queryOne(
      'SELECT user_id FROM users WHERE  user_id = $1 and mc_id = $2',
      [member_id, userInfo.user_id]
    );

    if (isExist == null || isExist.user_id == null) throw new errors.UNAUTHORIZED();



    const isExistHM = await connection.queryOne(
      'SELECT user_id FROM health_metrics WHERE  user_id = $1 and deleted = false',
      [member_id]
    );

    if (isExistHM ) throw new errors.ALL_READY_EXIST("Health metric already exists for this member.");




    const fields = {
      user_id:member_id,
      weight,
      bp_systolic,
      bp_diastolic,
      sugar_level,
      o2_level,
    };

    // Filter out undefined/null optional values
    const insertFields = Object.fromEntries(
      Object.entries(fields).filter(([_, value]) => value !== undefined && value !== null)
    );

    const columns = Object.keys(insertFields).join(', ');
    const placeholders = Object.keys(insertFields).map((_, index) => `$${index + 1}`).join(', ');
    const values = Object.values(insertFields);

    const sql = `INSERT INTO health_metrics (${columns}) VALUES (${placeholders}) RETURNING id`;
    const result = await connection.queryOne(sql, values);

    return {
      flag: 200,
      metric_id: result.id,
      message: "Health metric recorded successfully.",
    };
  })
);




exports.editHealthMetric = api(["id"], 
  auth(async (req, connection, userInfo) => {

    await validateCreateHealthMetric(req); // ✅ reusing the create validator

    const { id, weight, bp_systolic, bp_diastolic, sugar_level, o2_level } = req.body;

    const optionalFields = { weight, bp_systolic, bp_diastolic, sugar_level, o2_level };

    const updates = Object.entries(optionalFields)
      .filter(([_, value]) => value !== undefined && value !== null);

    if (updates.length === 0) {
      throw new errors.INVALID_FIELDS_PROVIDED("No valid fields provided to update.");
    }

    // 🔒 Step 1: Validate metric exists and belongs to the same MC user
    const metric = await connection.queryOne(
      `SELECT hm.id FROM health_metrics hm 
       JOIN users u ON hm.user_id = u.user_id 
       WHERE hm.id = $1 AND u.mc_id = $2 and hm.deleted = false`,
      [id, userInfo.user_id]
    );

    if (!metric) throw new errors.NOT_FOUND("Health metric not found or you are not authorized to edit it.");

    // ⚙️ Step 2: Build dynamic update query
    const setClause = updates.map(([key], idx) => `${key} = $${idx + 1}`).join(', ');
    const values = updates.map(([_, value]) => value);
    values.push(id); // for WHERE clause

    const updateSql = `UPDATE health_metrics SET ${setClause} WHERE id = $${values.length}`;

    await connection.query(updateSql, values);

    return {
      flag: 200,
      message: "Health metric updated successfully."
    };
  })
);




exports.deleteHealthMetric = api(["id"], 
  auth(async (req, connection, userInfo) => {
    const { id } = req.body;

    // Step 1: Check ownership through mc_id
    const metric = await connection.queryOne(
      `SELECT hm.id FROM health_metrics hm
       JOIN users u ON hm.user_id = u.user_id
       WHERE hm.id = $1 AND u.mc_id = $2 AND hm.deleted = false`,
      [id, userInfo.user_id]
    );

    if (!metric) throw new errors.NOT_FOUND("Health metric not found or you are not authorized to delete it.");

    // Step 2: Perform soft delete
    await connection.query(
      `UPDATE health_metrics SET deleted = true WHERE id = $1`,
      [id]
    );

    return {
      flag: 200,
      message: "Health metric deleted successfully."
    };
  })
);
