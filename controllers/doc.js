const { api, auth,generateAlphaNumericToken,formatDateTime } = require("../helpers/common");
const errors = require("../helpers/errors");





exports.getAllReports = api(["member_id"],
  auth(async (req, connection, userInfo) => {
    const { member_id, limit = 20, offset = 0 } = req.body;
      // Validate limit and offset to ensure they're integers
  const parsedLimit = parseInt(limit, 10);
  const parsedOffset = parseInt(offset, 10);

 if (isNaN(parsedLimit) || isNaN(parsedOffset)) {
    throw new errors.INVALID_FIELDS_PROVIDED("Limit and offset must be numbers");
  }

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


exports.getAllprscription = api(["member_id"],
  auth(async (req, connection, userInfo) => {
    const { member_id, limit = 20, offset = 0 } = req.body;
      // Validate limit and offset to ensure they're integers
  const parsedLimit = parseInt(limit, 10);
  const parsedOffset = parseInt(offset, 10);

 if (isNaN(parsedLimit) || isNaN(parsedOffset)) {
    throw new errors.INVALID_FIELDS_PROVIDED("Limit and offset must be numbers");
  }

    // Step 1: Verify member is under the MC
    const member = await connection.queryOne(
      `SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2`,
      [member_id, userInfo.user_id]
    );

    if (!member) {
      throw new errors.UNAUTHORIZED("You are not authorized to access this member’s reports.");
    }

    // Step 2: Get paginated reports
    const prescriptions = await connection.query(
      `SELECT id, resized, thumbnail, shared, created_at
       FROM prescription
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
      prescriptions,
      total: parseInt(countResult.total, 10),
      message: "Prescriptions fetched successfully."
    };
  })
);



exports.getCombainedDocs = api(["member_id"],
  auth(async (req, connection, userInfo) => {
    const { member_id, limit = 20, offset = 0 } = req.body;

    // Validate pagination inputs
    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);

    if (isNaN(parsedLimit) || isNaN(parsedOffset)) {
      throw new errors.INVALID_FIELDS_PROVIDED("Limit and offset must be numbers");
    }

    // Step 1: Validate member under MC
    const member = await connection.queryOne(
      `SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2`,
      [member_id, userInfo.user_id]
    );

    if (!member) throw new errors.UNAUTHORIZED("You are not authorized to access this member’s documents.");

    // Step 2: Get prescriptions
    const prescriptions = await connection.query(
      `SELECT id, resized, thumbnail, shared, created_at
       FROM prescription
       WHERE user_id = $1 AND deleted = false
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [member_id, parsedLimit, parsedOffset]
    );

    const prescriptionIds = prescriptions.map(p => p.id);

    if (prescriptionIds.length === 0) {
      return {
        flag: 200,
        data: [],
        total: 0,
        message: "No documents found."
      };
    }

    // Step 3: Get all reports under these prescriptions
    const reports = await connection.query(
      `SELECT id, resized, thumbnail, shared, prescription_id, created_at
       FROM report
       WHERE prescription_id = ANY($1::int[]) AND deleted = false`,
      [prescriptionIds]
    );

    // Step 4: Group reports under each prescription
    const reportMap = {};
    for (const report of reports) {
      if (!reportMap[report.prescription_id]) {
        reportMap[report.prescription_id] = [];
      }
      reportMap[report.prescription_id].push(report);
    }

    // Step 5: Attach reports to prescriptions
    const combined = prescriptions.map(p => ({
      ...p,
      reports: reportMap[p.id] || []
    }));

    // Step 6: Get total count of prescriptions
    const countResult = await connection.queryOne(
      `SELECT COUNT(*) AS total FROM prescription
       WHERE user_id = $1 AND deleted = false`,
      [member_id]
    );

    return {
      flag: 200,
      data: combined,
      total: parseInt(countResult.total, 10),
      message: "Combined documents fetched successfully."
    };
  })
);



exports.editReportStatus = api(["member_id", "reports", "status"],
  auth(async (req, connection, userInfo) => {
    const { member_id, reports, status } = req.body;

    // Validation: status must be a boolean
    if (typeof status !== "boolean") {
      throw new errors.INVALID_FIELDS_PROVIDED("Status must be true or false.");
    }

    // Validation: reports must be a non-empty array of integers
    if (!Array.isArray(reports) || reports.length === 0 || !reports.every(id => Number.isInteger(id))) {
      throw new errors.INVALID_FIELDS_PROVIDED("Reports must be an array of report IDs (numbers).");
    }

    // Step 1: Verify member is under current MC
    const member = await connection.queryOne(
      `SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2`,
      [member_id, userInfo.user_id]
    );

    if (!member) throw new errors.UNAUTHORIZED("You are not authorized to access this member’s reports.");

    // Step 2: Update shared status of valid reports for that user
   await connection.query(
      `UPDATE report
       SET shared = $1
       WHERE id = ANY($2::int[]) AND user_id = $3 AND deleted = false`,
      [status, reports, member_id]
    );

    return {
      flag: 200,
      message: `Report sharing status updated to ${status ? "shared" : "private"} for ${reports.length} report(s).`
    };
  })
);

exports.editReportStatus = api(["member_id", "reports", "status"],
  auth(async (req, connection, userInfo) => {
    const { member_id, reports, status } = req.body;

    // Validate status
    if (typeof status !== "boolean") {
      throw new errors.INVALID_FIELDS_PROVIDED("Status must be true or false.");
    }

    // Validate report array
    if (!Array.isArray(reports) || reports.length === 0 || !reports.every(id => Number.isInteger(id))) {
      throw new errors.INVALID_FIELDS_PROVIDED("Reports must be an array of report IDs (numbers).");
    }

    // Step 1: Confirm member belongs to the MC
    const member = await connection.queryOne(
      `SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2`,
      [member_id, userInfo.user_id]
    );

    if (!member) {
      throw new errors.UNAUTHORIZED("You are not authorized to access this member’s reports.");
    }

    // Step 2: Update reports and return affected row count
    const result = await connection.query(
      `UPDATE report
       SET shared = $1
       WHERE id = ANY($2::int[]) AND user_id = $3 AND deleted = false returning id`,
      [status, reports, member_id]
    );

    const updatedCount = result.length;
    const notFoundCount = reports.length - updatedCount;

    return {
      flag: 200,
      message: `Updated ${updatedCount} report(s).`,
      not_found: notFoundCount > 0 ? `${notFoundCount} report(s) were not found or unauthorized.` : 0
    };
  })
);



exports.editprescriptionStatus = api(["member_id", "prescriptions", "status"],
  auth(async (req, connection, userInfo) => {
    const { member_id, prescriptions, status } = req.body;

    // Validate status
    if (typeof status !== "boolean") {
      throw new errors.INVALID_FIELDS_PROVIDED("Status must be true or false.");
    }

    // Validate report array
    if (!Array.isArray(prescriptions) || prescriptions.length === 0 || !prescriptions.every(id => Number.isInteger(id))) {
      throw new errors.INVALID_FIELDS_PROVIDED("Prescriptions must be an array of report IDs (numbers).");
    }

    // Step 1: Confirm member belongs to the MC
    const member = await connection.queryOne(
      `SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2`,
      [member_id, userInfo.user_id]
    );

    if (!member) {
      throw new errors.UNAUTHORIZED("You are not authorized to access this member’s prescriptions.");
    }

    // Step 2: Update prescriptions and return affected row count
    const result = await connection.query(
      `UPDATE prescription
       SET shared = $1
       WHERE id = ANY($2::int[]) AND user_id = $3 AND deleted = false returning id`,
      [status, prescriptions, member_id]
    );

    const updatedCount = result.length;
    const notFoundCount = prescriptions.length - updatedCount;

    return {
      flag: 200,
      message: `Updated ${updatedCount} prescription(s).`,
      not_found: notFoundCount > 0 ? `${notFoundCount} prescription(s) were not found or unauthorized.` : 0
    };
  })
);



exports.generateTempUrl = api(["member_id", "expires_in"],
  auth(async (req, connection, userInfo) => {
    const { member_id, expires_in } = req.body;

    // Verify ownership of the member
    const member = await connection.queryOne(
      "SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2 AND deleted = false",
      [member_id, userInfo.user_id]
    );

    if (!member) {
      throw new errors.UNAUTHORIZED("User not found or unauthorized.");
    }

    const token = generateAlphaNumericToken(10);
const expiresAt = new Date(Date.now() + parseInt(expires_in) * 1000);
    await connection.query(
      `INSERT INTO token (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [member_id, token, formatDateTime(expiresAt)]
    );

    return {
      flag: 200,
      message: "Temporary token generated successfully.",

        token

    };
  })
);