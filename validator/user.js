
const validator = require('validator');
const errors = require('../helpers/errors');


exports.validateAuth = async  (req) =>{

    const { email ,password} = req.body;


 
    if (!validator.isEmail(email)) {
        throw new errors.INVALID_FIELDS_PROVIDED('Invalid email format.');
    }

    if (!validator.isLength(password, { min: 8, max: 12 })) {
        throw new errors.INVALID_FIELDS_PROVIDED('Password must be between 8 and 12 characters.');
    }



}
exports.validateEditUser = async  (req) =>{
    const allowedFields = [
        'first_name', 'last_name', 'phone', 'gender', 'blood_group', 'birthday', 'address', 'chronic_disease', 'password'
    ];
    const { body } = req;

    // Filter out only allowed fields
    const updateFields = Object.keys(body).reduce((acc, key) => {
        if (allowedFields.includes(key)) acc[key] = body[key];
        return acc;
    }, {});

    if (Object.keys(updateFields).length === 0) {
        throw new errors.NO_FIELDS_PROVIDED();
    }

    // Validation logic for each field
    if (updateFields.first_name && !validator.isAlpha(updateFields.first_name, 'en-US', { ignore: ' ' })) {
        throw new errors.INVALID_FIELDS_PROVIDED('First name can only contain letters and spaces.');
    }

    if (updateFields.last_name && !validator.isAlpha(updateFields.last_name, 'en-US', { ignore: ' ' })) {
        throw new errors.INVALID_FIELDS_PROVIDED('Last name can only contain letters and spaces.');
    }

    if (updateFields.phone && !validator.isMobilePhone(updateFields.phone, 'any')) {
        throw new errors.INVALID_FIELDS_PROVIDED('Invalid phone number.');
    }

    if (updateFields.gender && !['M', 'F', 'O'].includes(updateFields.gender)) {
        throw new errors.INVALID_FIELDS_PROVIDED('Invalid gender. Must be "M", "F", or "O".');
    }

    if (updateFields.blood_group && !['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].includes(updateFields.blood_group)) {
        throw new errors.INVALID_FIELDS_PROVIDED('Invalid blood group.');
    }

    if (updateFields.birthday && !validator.isDate(updateFields.birthday)) {
        throw new errors.INVALID_FIELDS_PROVIDED('Invalid birthday. Must be a valid date.');
    }

    if (updateFields.address && updateFields.address.length > 255) {
        throw new errors.INVALID_FIELDS_PROVIDED('Address cannot exceed 255 characters.');
    }

    if (updateFields.chronic_disease && updateFields.chronic_disease.length > 255) {
        throw new errors.INVALID_FIELDS_PROVIDED('Chronic disease description cannot exceed 255 characters.');
    }

    if (updateFields.password) {

 
        
        if (!validator.isLength(updateFields.password, { min: 8, max: 12 })) {
            throw new errors.INVALID_FIELDS_PROVIDED(
                'Password must be between 8 and 12 characters long.'
            );
        }

      
    }


}


