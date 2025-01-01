// Import modules:
//import * as errors from './errors.js';
//import * as database from '../utils/database.js';
const errors = require("./errors");
const responses = require("./responses");
const database = require('../utils/connection');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/ApplicationSettings');


exports.checkParams = function checkParams(req, requiredParams) {
    // Go through each required parameter, check if blank:
    for (const arg of requiredParams) {
        let val = req.body[arg];
        // NOTE: triple equals checks if arr[i] is a string in addition to it being empty
        if (val == null || val === '') {
            // Required parameter is blank, return error:
            throw new errors.PARAMETER_MISSING({ missing: arg });
        }
    }
}


exports.verifyJwt = async (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
  
        resolve(null);
      } else {
        resolve(decoded);
      }
    });
  });
};


  exports.api = function api(requiredParams, func) {
    if (func == null) {
        func = requiredParams;
        requiredParams = [];
    }
    return async (req, res) => {
        let connection;
        try {
            exports.checkParams(req, requiredParams);
            connection = await database.getConnection();
            await connection.beginTransaction();
            const result = await func(req, connection);
            await connection.commit();
            await connection.release();
            if (result instanceof responses.QResponse) return result.apply(res);
            return result != null && res.send(result);
        } catch (err) {
            if (connection != null) {
                await connection.rollback();
                await connection.release();
            }
            if (err instanceof errors.QError) return res.send(err);
            req.logger.error(err);
            return res.send(new errors.ERROR_IN_EXECUTION());
        }
    }
};

exports.auth = function auth(extraFields, func) {
    if (func == null) {
        func = extraFields;
        extraFields = [];
    }
    return async (req, connection) => {
        exports.checkParams(req, ["accessToken"]);
        const accessToken = req.body.accessToken;
        const decodedToken = await exports.verifyJwt(accessToken, jwtSecret);
        if (decodedToken == null || decodedToken.userId == null) throw new errors.INVALID_ACCESS_TOKEN();
       
        const userQuery = "SELECT  user_id, first_name, last_name, phone, email,pinned FROM public.users WHERE user_id=$1 and deleted=false";
        const userInfo = await connection.queryOne(userQuery, [decodedToken.userId]);



        if (userInfo == null || userInfo.user_id == null) throw new errors.INVALID_ACCESS_TOKEN();
      
        return await func(req, connection, userInfo);
    };
};


