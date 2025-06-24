const { api, auth,generateAlphaNumericToken,formatDateTime } = require("../helpers/common");
const errors = require("../helpers/errors");





exports.getAllReports = api(["member_id"],
  auth(async (req, connection, userInfo) => {
    const { member_id, limit = 20, offset = 0 } = req.body;

    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);

    if (isNaN(parsedLimit) || isNaN(parsedOffset)) {
      throw new errors.INVALID_FIELDS_PROVIDED("Limit and offset must be numbers");
    }

    // Step 1: Authorization check
    const member = await connection.queryOne(
      `SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2 AND deleted = false`,
      [member_id, userInfo.user_id]
    );

    if (!member) {
      throw new errors.UNAUTHORIZED("You are not authorized to access this member’s reports.");
    }

    // Step 2: Fetch paginated reports
    const reports = await connection.query(
      `SELECT id, prescription_id, shared, test_name, delivery_date, created_at
       FROM reports
       WHERE user_id = $1 AND deleted = false
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [member_id, parsedLimit, parsedOffset]
    );

    // Step 3: Attach images for each report
    for (let report of reports) {
      const images = await connection.query(
        `SELECT id as report_img_id, resiged, thumb FROM report_images WHERE report_id = $1 AND deleted = false ORDER BY created_at ASC`,
        [report.id]
      );
      report.images = images; // Add images array to each report
    }

    // Step 4: Total count
    const countResult = await connection.queryOne(
      `SELECT COUNT(*) AS total FROM reports WHERE user_id = $1 AND deleted = false`,
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



exports.getAllPrescription = api(["member_id"],
  auth(async (req, connection, userInfo) => {
    const { member_id, limit = 20, offset = 0 } = req.body;

    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);

    if (isNaN(parsedLimit) || isNaN(parsedOffset)) {
      throw new errors.INVALID_FIELDS_PROVIDED("Limit and offset must be numbers");
    }

    // Step 1: Authorization check
    const member = await connection.queryOne(
      `SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2 AND deleted = false`,
      [member_id, userInfo.user_id]
    );

    if (!member) {
      throw new errors.UNAUTHORIZED("You are not authorized to access this member’s prescriptions.");
    }

    // Step 2: Fetch paginated prescriptions
    const prescriptions = await connection.query(
      `SELECT id, shared, department, doctor_name, visited_date, created_at
       FROM prescriptions
       WHERE user_id = $1 AND deleted = false
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [member_id, parsedLimit, parsedOffset]
    );

    // Step 3: Attach images for each prescription
    for (let prescription of prescriptions) {
      const images = await connection.query(
        `SELECT id as prescription_img_id, resiged, thumb FROM prescription_images
         WHERE prescription_id = $1 AND deleted = false ORDER BY created_at ASC`,
        [prescription.id]
      );
      prescription.images = images;
    }

    // Step 4: Total count
    const countResult = await connection.queryOne(
      `SELECT COUNT(*) AS total FROM prescriptions
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


// exports.getCombainedDocs = api(["member_id"],
//   auth(async (req, connection, userInfo) => {
//     const { member_id, limit = 20, offset = 0 } = req.body;

//     // Validate pagination inputs
//     const parsedLimit = parseInt(limit, 10);
//     const parsedOffset = parseInt(offset, 10);

//     if (isNaN(parsedLimit) || isNaN(parsedOffset)) {
//       throw new errors.INVALID_FIELDS_PROVIDED("Limit and offset must be numbers");
//     }

//     // Step 1: Validate member under MC
//     const member = await connection.queryOne(
//       `SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2`,
//       [member_id, userInfo.user_id]
//     );

//     if (!member) throw new errors.UNAUTHORIZED("You are not authorized to access this member’s documents.");

//     // Step 2: Get prescriptions
//     const prescriptions = await connection.query(
//       `SELECT id, resized, thumbnail, shared, created_at
//        FROM prescription
//        WHERE user_id = $1 AND deleted = false
//        ORDER BY created_at DESC
//        LIMIT $2 OFFSET $3`,
//       [member_id, parsedLimit, parsedOffset]
//     );

//     const prescriptionIds = prescriptions.map(p => p.id);

//     if (prescriptionIds.length === 0) {
//       return {
//         flag: 200,
//         data: [],
//         total: 0,
//         message: "No documents found."
//       };
//     }

//     // Step 3: Get all reports under these prescriptions
//     const reports = await connection.query(
//       `SELECT id, resized, thumbnail, shared, prescription_id, created_at
//        FROM report
//        WHERE prescription_id = ANY($1::int[]) AND deleted = false`,
//       [prescriptionIds]
//     );

//     // Step 4: Group reports under each prescription
//     const reportMap = {};
//     for (const report of reports) {
//       if (!reportMap[report.prescription_id]) {
//         reportMap[report.prescription_id] = [];
//       }
//       reportMap[report.prescription_id].push(report);
//     }

//     // Step 5: Attach reports to prescriptions
//     const combined = prescriptions.map(p => ({
//       ...p,
//       reports: reportMap[p.id] || []
//     }));

//     // Step 6: Get total count of prescriptions
//     const countResult = await connection.queryOne(
//       `SELECT COUNT(*) AS total FROM prescription
//        WHERE user_id = $1 AND deleted = false`,
//       [member_id]
//     );

//     return {
//       flag: 200,
//       data: combined,
//       total: parseInt(countResult.total, 10),
//       message: "Combined documents fetched successfully."
//     };
//   })
// );

exports.getCombainedDocs = api(["member_id"],
  auth(async (req, connection, userInfo) => {
    const { member_id, limit = 20, offset = 0 } = req.body;

    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);

    if (isNaN(parsedLimit) || isNaN(parsedOffset)) {
      throw new errors.INVALID_FIELDS_PROVIDED("Limit and offset must be numbers");
    }

    // Step 1: Verify MC ownership
    const member = await connection.queryOne(
      `SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2 AND deleted = false`,
      [member_id, userInfo.user_id]
    );

    if (!member) throw new errors.UNAUTHORIZED("You are not authorized to access this member’s documents.");

    // Step 2: Get paginated prescriptions
    const prescriptions = await connection.query(
      `SELECT id, shared, department, doctor_name, visited_date, created_at
       FROM prescriptions
       WHERE user_id = $1 AND deleted = false
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [member_id, parsedLimit, parsedOffset]
    );

    if (prescriptions.length === 0) {
      return {
        flag: 200,
        data: [],
        total: 0,
        message: "No documents found."
      };
    }

    // Step 3: Attach prescription images
    for (let prescription of prescriptions) {
      const images = await connection.query(
        `SELECT id as prescription_img_id, resiged, thumb FROM prescription_images
         WHERE prescription_id = $1 AND deleted = false  ORDER BY created_at ASC`,
        [prescription.id]
      );
      prescription.images = images;
    }

    // Step 4: Get all reports for these prescriptions
    const prescriptionIds = prescriptions.map(p => p.id);
    const reports = await connection.query(
      `SELECT id, shared, test_name, delivery_date, prescription_id, created_at
       FROM reports
       WHERE prescription_id = ANY($1::int[]) AND deleted = false`,
      [prescriptionIds]
    );

    // Step 5: Attach images to reports
    for (let report of reports) {
      const images = await connection.query(
        `SELECT  id as report_img_id, resiged, thumb FROM report_images
         WHERE report_id = $1 ORDER BY created_at ASC`,
        [report.id]
      );
      report.images = images;
    }

    // Step 6: Group reports under each prescription
    const reportMap = {};
    for (let report of reports) {
      if (!reportMap[report.prescription_id]) {
        reportMap[report.prescription_id] = [];
      }
      reportMap[report.prescription_id].push(report);
    }

    // Step 7: Attach grouped reports to prescriptions
    const combined = prescriptions.map(p => ({
      ...p,
      reports: reportMap[p.id] || []
    }));

    // Step 8: Get total count
    const countResult = await connection.queryOne(
      `SELECT COUNT(*) AS total FROM prescriptions
       WHERE user_id = $1 AND deleted = false`,
      [member_id]
    );

    return {
      flag: 200,
      prescriptions: combined,
      total: parseInt(countResult.total, 10),
      message: "Combined documents fetched successfully."
    };
  })
);


// exports.editReportStatus = api(["member_id", "reports", "status"],
//   auth(async (req, connection, userInfo) => {
//     const { member_id, reports, status } = req.body;

//     // Validation: status must be a boolean
//     if (typeof status !== "boolean") {
//       throw new errors.INVALID_FIELDS_PROVIDED("Status must be true or false.");
//     }

//     // Validation: reports must be a non-empty array of integers
//     if (!Array.isArray(reports) || reports.length === 0 || !reports.every(id => Number.isInteger(id))) {
//       throw new errors.INVALID_FIELDS_PROVIDED("Reports must be an array of report IDs (numbers).");
//     }

//     // Step 1: Verify member is under current MC
//     const member = await connection.queryOne(
//       `SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2`,
//       [member_id, userInfo.user_id]
//     );

//     if (!member) throw new errors.UNAUTHORIZED("You are not authorized to access this member’s reports.");

//     // Step 2: Update shared status of valid reports for that user
//    await connection.query(
//       `UPDATE report
//        SET shared = $1
//        WHERE id = ANY($2::int[]) AND user_id = $3 AND deleted = false`,
//       [status, reports, member_id]
//     );

//     return {
//       flag: 200,
//       message: `Report sharing status updated to ${status ? "shared" : "private"} for ${reports.length} report(s).`
//     };
//   })
// );

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
      `SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2 and deleted = false`,
      [member_id, userInfo.user_id]
    );

    if (!member) {
      throw new errors.UNAUTHORIZED("You are not authorized to access this member’s reports.");
    }

    // Step 2: Update reports and return affected row count
    const result = await connection.query(
      `UPDATE reports
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
      `SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2 and deleted = false`,
      [member_id, userInfo.user_id]
    );

    if (!member) {
      throw new errors.UNAUTHORIZED("You are not authorized to access this member’s prescriptions.");
    }

    // Step 2: Update prescriptions and return affected row count
    const result = await connection.query(
      `UPDATE prescriptions
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



exports.deleteReports = api(["member_id", "reports"],
  auth(async (req, connection, userInfo) => {
    const { member_id, reports } = req.body;

    if (!Array.isArray(reports) || reports.length === 0 || !reports.every(id => Number.isInteger(id))) {
      throw new errors.INVALID_FIELDS_PROVIDED("Reports must be an array of report IDs (numbers).");
    }

    const member = await connection.queryOne(
      `SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2 and deleted = false`,
      [member_id, userInfo.user_id]
    );

    if (!member) {
      throw new errors.UNAUTHORIZED("You are not authorized to access this member’s reports.");
    }

    const result = await connection.query(
      `UPDATE reports
       SET deleted = true
       WHERE id = ANY($1::int[]) AND user_id = $2 AND deleted = false RETURNING id`,
      [reports, member_id]
    );

    const deletedCount = result.length;
    const notFoundCount = reports.length - deletedCount;

    return {
      flag: 200,
      message: `Deleted ${deletedCount} report(s).`,
      not_found: notFoundCount > 0 ? `${notFoundCount} report(s) were not found or unauthorized.` : 0
    };
  })
);



exports.deleteReportImages = api(["member_id", "report_img_ids"],
  auth(async (req, connection, userInfo) => {
    const { member_id, report_img_ids } = req.body;

    if (!Array.isArray(report_img_ids) || report_img_ids.length === 0 || !report_img_ids.every(id => Number.isInteger(id))) {
      throw new errors.INVALID_FIELDS_PROVIDED("report_img_ids must be an array of image IDs (numbers).");
    }

    // Authorization: MC validation
    const member = await connection.queryOne(
      `SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2 AND deleted = false`,
      [member_id, userInfo.user_id]
    );
    if (!member) {
      throw new errors.UNAUTHORIZED("You are not authorized to access this member’s report images.");
    }

    // Update with condition on report_id’s user
    const result = await connection.query(
      `UPDATE report_images ri
       SET deleted = true
       WHERE id = ANY($1::int[]) AND EXISTS (
         SELECT 1 FROM reports r
         WHERE r.id = ri.report_id AND r.user_id = $2 AND r.deleted = false
       ) and ri.deleted = false
       RETURNING id`,
      [report_img_ids, member_id]
    );

    const deletedCount = result.length;
    const notFoundCount = report_img_ids.length - deletedCount;

    return {
      flag: 200,
      message: `Deleted ${deletedCount} report image(s).`,
      not_found: notFoundCount > 0 ? `${notFoundCount} image(s) not found or unauthorized.` : 0
    };
  })
);


exports.deletePrescriptions = api(["member_id", "prescriptions"],
  auth(async (req, connection, userInfo) => {
    const { member_id, prescriptions } = req.body;

    if (!Array.isArray(prescriptions) || prescriptions.length === 0 || !prescriptions.every(id => Number.isInteger(id))) {
      throw new errors.INVALID_FIELDS_PROVIDED("Prescriptions must be an array of prescription IDs (numbers).");
    }

    const member = await connection.queryOne(
      `SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2 and deleted = false`,
      [member_id, userInfo.user_id]
    );

    if (!member) {
      throw new errors.UNAUTHORIZED("You are not authorized to access this member’s prescriptions.");
    }

    const result = await connection.query(
      `UPDATE prescriptions
       SET deleted = true
       WHERE id = ANY($1::int[]) AND user_id = $2 AND deleted = false RETURNING id`,
      [prescriptions, member_id]
    );

    const deletedCount = result.length;
    const notFoundCount = prescriptions.length - deletedCount;

    return {
      flag: 200,
      message: `Deleted ${deletedCount} prescription(s).`,
      not_found: notFoundCount > 0 ? `${notFoundCount} prescription(s) were not found or unauthorized.` : 0
    };
  })
);

exports.deletePrescriptionImages = api(["member_id", "prescription_img_ids"],
  auth(async (req, connection, userInfo) => {
    const { member_id, prescription_img_ids } = req.body;

    if (!Array.isArray(prescription_img_ids) || prescription_img_ids.length === 0 || !prescription_img_ids.every(id => Number.isInteger(id))) {
      throw new errors.INVALID_FIELDS_PROVIDED("prescription_img_ids must be an array of image IDs (numbers).");
    }

    // Authorization check
    const member = await connection.queryOne(
      `SELECT user_id FROM users WHERE user_id = $1 AND mc_id = $2 AND deleted = false`,
      [member_id, userInfo.user_id]
    );
    if (!member) {
      throw new errors.UNAUTHORIZED("You are not authorized to access this member’s prescription images.");
    }

    const result = await connection.query(
      `UPDATE prescription_images pi
       SET deleted = true
       WHERE id = ANY($1::int[]) AND EXISTS (
         SELECT 1 FROM prescriptions p
         WHERE p.id = pi.prescription_id AND p.user_id = $2 AND p.deleted = false
       ) and pi.deleted = false
       RETURNING id`,
      [prescription_img_ids, member_id]
    );

    const deletedCount = result.length;
    const notFoundCount = prescription_img_ids.length - deletedCount;

    return {
      flag: 200,
      message: `Deleted ${deletedCount} prescription image(s).`,
      not_found: notFoundCount > 0 ? `${notFoundCount} image(s) not found or unauthorized.` : 0
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