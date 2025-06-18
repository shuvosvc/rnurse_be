const { api, auth } = require("../helpers/common");
const errors = require("../helpers/errors");



exports.getAllReports = api(["member_id"],
  auth(async (req, connection, userInfo) => {
    const { member_id, limit = 10, offset = 0 } = req.body;
      // Validate limit and offset to ensure they're integers
  const parsedLimit = parseInt(limit, 10);
  const parsedOffset = parseInt(offset, 10);
    // Step 1: Verify member is under the MC
    const member = await connection.queryOne(
      `SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2`,
      [member_id, userInfo.user_id]
    );

    if (!member) {
      throw new errors.UNAUTHORIZED("You are not authorized to access this member’s reports.");
    }

    // Step 2: Get paginated reports
    const reports = await connection.query(
      `SELECT id, resized, thumbnail, prescription_id, shared, created_at
       FROM report
       WHERE user_id = $1 AND deleted = false
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [member_id, parsedLimit, parsedOffset]
    );

    // Step 3: Get total count
    const countResult = await connection.queryOne(
      `SELECT COUNT(*) AS total FROM report
       WHERE user_id = $1 AND deleted = false`,
      [member_id]
    );

    return {
      flag: 200,
      reports,
      total: parseInt(countResult.total, 10),
      message: "Reports fetched successfully."
    };
  })
);
