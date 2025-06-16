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

exports.editMember = api(["member_id"],
  auth( async (req, connection, userInfo) => {

    await validateeditMember(req);


    let { member_id, accessToken, ...updateFields } = req.body;

    if (updateFields.phone) {
      const existingPhone = await connection.queryOne(
        'SELECT user_id FROM users WHERE phone = $1 AND mc_id = $2',
        [updateFields.phone, userInfo.user_id]
      );

      if (existingPhone) {
        throw new errors.INVALID_FIELDS_PROVIDED('Phone is already registered.');
      }
    }

    const isExist = await connection.queryOne(
      'SELECT user_id FROM users WHERE  user_id = $1 and mc_id = $2',
      [member_id, userInfo.user_id]
    );


    
    if (isExist == null || isExist.user_id == null) throw new errors.UNAUTHORIZED();



    const setClause = Object.keys(updateFields).map((field, index) => `${field}=$${index + 1}`).join(', ');


    const values = Object.values(updateFields);


    const sql_user_update = `UPDATE users SET ${setClause} WHERE user_id=$${values.length + 1}`;
    values.push(isExist.user_id);

    await connection.query(sql_user_update, values);


    return { flag: 200, message: "User details updated successfully." };
  })
);



exports.getAllMember = api(
  auth(async (req, connection, userInfo) => {
    const { limit = 10, offset = 0 } = req.body;

      // Validate limit and offset to ensure they're integers
  const parsedLimit = parseInt(limit, 10);
  const parsedOffset = parseInt(offset, 10);

  if (isNaN(parsedLimit) || isNaN(parsedOffset)) {
    throw new errors.INVALID_FIELDS_PROVIDED("Limit and offset must be numbers");
  }

    const members = await connection.query(
      `
      SELECT user_id, mc_id, first_name, last_name, phone, email, gender, blood_group, birthday, profile_image_url, address, chronic_disease,  created_at
      FROM users
      WHERE mc_id = $1 and deleted = false
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
      `,
      [userInfo.user_id, parsedLimit, parsedOffset]
    );

    const total = await connection.queryOne(
      `
      SELECT COUNT(*) AS count
      FROM users
      WHERE mc_id = $1
      `,
      [userInfo.user_id]
    );

    return {
      flag: 200,
      members,
      total: parseInt(total.count),
      limit,
      offset,
    };
  })
);
