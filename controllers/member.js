const { api, auth } = require("../helpers/common");
const errors = require("../helpers/errors");

const { validateCreateMember, validateeditMember } = require("../validator/member");



exports.addMember = api(
  auth(async (req, connection, userInfo) => {

    await validateCreateMember(req);


    let { accessToken, ...insertFields } = req.body;

    if (insertFields.phone) {
      const existingPhone = await connection.queryOne(
        'SELECT user_id FROM users WHERE phone = $1 AND mc_id = $2',
        [insertFields.phone, userInfo.user_id]
      );

      if (existingPhone) {
        throw new errors.INVALID_FIELDS_PROVIDED('Phone is already registered.');
      }
    }


    insertFields.mc_id = userInfo.user_id;


    const columns = Object.keys(insertFields).join(', ');
    const placeholders = Object.keys(insertFields)
      .map((_, index) => `$${index + 1}`)
      .join(', ');
    const values = Object.values(insertFields);


    const sql_insert_user = `INSERT INTO users (${columns}) VALUES (${placeholders}) RETURNING user_id`;
    const result = await connection.queryOne(sql_insert_user, values);

    return {
      flag: 200,
      member_id: result.user_id,
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


    console.log("dddddddddddd",isExist);
    
    if (isExist == null || isExist.user_id == null) throw new errors.UNAUTHORIZED();



    const setClause = Object.keys(updateFields).map((field, index) => `${field}=$${index + 1}`).join(', ');


    const values = Object.values(updateFields);


    const sql_user_update = `UPDATE users SET ${setClause} WHERE user_id=$${values.length + 1}`;
    values.push(isExist.user_id);

    await connection.query(sql_user_update, values);


    return { flag: 200, message: "User details updated successfully." };
  })
);
