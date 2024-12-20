
const validator = require('validator');
const errors = require('../helpers/errors');


exports.validateCreateMember = async  (req) =>{
    const allowedFields = [
        'first_name', 'last_name', 'phone', 'gender', 'blood_group', 'birthday', 'address', 'chronic_disease'
    ];
    const { body } = req;

    // Filter out only allowed fields
    const insertFields = Object.keys(body).reduce((acc, key) => {
        if (allowedFields.includes(key)) acc[key] = body[key];
        return acc;
    }, {});

    if (Object.keys(insertFields).length === 0) {
        throw new errors.NO_FIELDS_PROVIDED();
    }


    if (!insertFields.first_name || !insertFields.last_name) {
        throw new errors.INVALID_FIELDS_PROVIDED('First name and last name are required.');
    }

   
    if (insertFields.first_name && !validator.isAlpha(insertFields.first_name, 'en-US', { ignore: ' ' })) {
        throw new errors.INVALID_FIELDS_PROVIDED('First name can only contain letters and spaces.');
    }

    if (insertFields.last_name && !validator.isAlpha(insertFields.last_name, 'en-US', { ignore: ' ' })) {
        throw new errors.INVALID_FIELDS_PROVIDED('Last name can only contain letters and spaces.');
    }

    if (insertFields.phone && !validator.isMobilePhone(insertFields.phone, 'any')) {
        throw new errors.INVALID_FIELDS_PROVIDED('Invalid phone number.');
    }

    if (insertFields.gender && !['M', 'F', 'O'].includes(insertFields.gender)) {
        throw new errors.INVALID_FIELDS_PROVIDED('Invalid gender. Must be "M", "F", or "O".');
    }

    if (insertFields.blood_group && !['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].includes(insertFields.blood_group)) {
        throw new errors.INVALID_FIELDS_PROVIDED('Invalid blood group.');
    }

    if (insertFields.birthday && !validator.isDate(insertFields.birthday)) {
        throw new errors.INVALID_FIELDS_PROVIDED('Invalid birthday. Must be a valid date.');
    }

    if (insertFields.address && insertFields.address.length > 255) {
        throw new errors.INVALID_FIELDS_PROVIDED('Address cannot exceed 255 characters.');
    }

    if (insertFields.chronic_disease && insertFields.chronic_disease.length > 255) {
        throw new errors.INVALID_FIELDS_PROVIDED('Chronic disease description cannot exceed 255 characters.');
    }




}

