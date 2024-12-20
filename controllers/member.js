const { api, auth } = require("../helpers/common");
const errors = require("../helpers/errors");

const {  validateCreateMember } = require("../validator/member");



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
          user_id: result.user_id,
      };
  })
);
