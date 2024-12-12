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
exports.INVALID_ACCESS_TOKEN = QError.bind(null, 401, "You have been logged out. Please log in again.");
exports.NO_FIELDS_PROVIDED = QError.bind(null, 400, "No fields provided.");
exports.INVALID_FIELDS_PROVIDED = QError.bind(null, 422, "Invalid data provided.");
exports.INVALID_USER = QError.bind(null, 404, "User not registered or not found.");
exports.PHONE_PASSWORD_NOT_MATCH = QError.bind(null, 401, "Invalid phone or password combination.");
exports.INVALID_PARAMETER = QError.bind(null, 100, "Please enter valid parameters.");
exports.PRODUCT_NOT_FOUND = QError.bind(null, 404, "Product not found.");
exports.PRODUCT_ALREADY_EXIST = QError.bind(null, 404, "Product already exist.");
exports.INSUFFICIENT_STOCK = QError.bind(null, 404, "These products doesn't have enough stocks.");
exports.GIVE_A_PRODUCT = QError.bind(null, 404, "Please provide a product.");
exports.GAME_SOME_MONEY = QError.bind(null, 404, "Give some monwy!!.");
exports.CUSTOMER_ALREADY_EXIST = QError.bind(null, 404, "Customer already exist.");
exports.CUSTOMER_NOT_FOUND = QError.bind(null, 404, "Customer not found.");
exports.TRADE_NOT_FOUND = QError.bind(null, 404, "Trade not found.");
exports.AREA_NOT_FOUND = QError.bind(null, 404, "Area not found.");
exports.AREA_ALREADY_EXIST = QError.bind(null, 404, "Area already exist.");
exports.GIVE_A_DIFFRENT_NUMBER = QError.bind(null, 404, "Please provide a diffrent phone number.");
exports.SUPPLY_NOT_FOUND = QError.bind(null, 404, "Supply record not found.");
exports.TOO_MUCH_DISCOUNT = QError.bind(null, 422, "The given discount is over the limit");
exports.OVERPAYMENT_NOT_ALLOWED = QError.bind(null, 422, "The given money is over the price");