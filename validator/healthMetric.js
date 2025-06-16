
const validator = require('validator');
const errors = require('../helpers/errors');

exports.validateCreateHealthMetric = async (req) => {


  const optionalFields = ['weight', 'bp_systolic', 'bp_diastolic', 'sugar_level', 'o2_level'];
  for (const field of optionalFields) {
    if (req.body[field] !== undefined && typeof req.body[field] !== 'number') {
      throw new errors.INVALID_FIELDS_PROVIDED(`${field} must be a number.`);
    }
  }
};


