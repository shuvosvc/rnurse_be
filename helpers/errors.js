class QError {
    constructor(flag, error, ...extra) {
        this.flag = flag;
        this.error = error;
        if (extra.length > 0) Object.assign(this, ...extra.map(v => typeof v === 'string' || v instanceof String ? { error: v } : v));
    }

    extend(...objs) {
        let target = new QError();
        Object.assign(target, this, ...extra.map(v => typeof v === 'string' || v instanceof String ? { error: v } : v));
        return target;
    }


}
exports.QError = QError;

// Define constant errors:

exports.PARAMETER_MISSING = QError.bind(null, 100, "Please fill all the required fields.");
exports.ERROR_IN_EXECUTION = QError.bind(null, 102, "Something went wrong! Please try again later.");
exports.UNAUTHORIZED = QError.bind(null, 403, "You don't have authority for this action.");
exports.INVALID_EMAIL_PASS = QError.bind(null, 400, "Invalid email or password.");
exports.INVALID_ACCESS_TOKEN = QError.bind(null, 401, "You have been logged out. Please log in again.");
exports.NO_FIELDS_PROVIDED = QError.bind(null, 400, "No fields provided.");
exports.INVALID_FIELDS_PROVIDED = QError.bind(null, 422, "Invalid data provided.");
exports.INVALID_USER = QError.bind(null, 404, "User not registered or not found.");

exports.ALL_READY_EXIST = QError.bind(null, 409, "This data already exists.");
exports.NOT_FOUND = QError.bind(null, 404, "Data not found.");