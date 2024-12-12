const { api, auth, verifyJwt } = require("../helpers/common");
const database = require('../utils/connection');
const errors = require("../helpers/errors");
require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");
const { jwtSecret, GAUTH_CLIENT_ID } = require('../config/ApplicationSettings');
const jwt = require('jsonwebtoken');


exports.getAllUsers = api(


  async (req, connection, dealerInfo) => {


    const isExist = await connection.query(
      "SELECT * FROM public.users", []
    );

    return { flag: 200, isExist };
  }
);


exports.gauth = async (req, res) => {
  let connection;
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json(new errors.PARAMETER_MISSING());
    }

    const client = new OAuth2Client(GAUTH_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GAUTH_CLIENT_ID,
    });

    if (!ticket) {
      return res.status(401).json(new errors.INVALID_ACCESS_TOKEN());
    }

    const payload = ticket.getPayload();
    if (!payload.email) {
      return res.status(401).json(new errors.INVALID_ACCESS_TOKEN());
    }

    // Obtain DB connection
    connection = await database.getConnection();

    // Check if the user already exists
    const isExist = await connection.queryOne(
      "SELECT user_id, first_name, last_name, phone, email, profile_image_url FROM public.users WHERE email = $1",
      [payload.email]
    );


    if (isExist && isExist.user_id != null) {


 

      const accessToken = jwt.sign(
        {
          userId: isExist.user_id,
          firstName: isExist.first_name,
          lastName: isExist.last_name,
          phone: isExist.phone,
          email: isExist.email,
          image: isExist.profile_image_url,
        },
        jwtSecret,
        { expiresIn: "1h" }
      );
  
      // Generate a refresh token
      const refreshToken = jwt.sign(
        { userId: isExist.user_id, email: isExist.email },
        jwtSecret,
        { expiresIn: "3d" }
      );


      // Save refresh token
      await connection.query(
        "UPDATE public.users SET refresh_token = $1 WHERE user_id = $2",
        [refreshToken, isExist.user_id]
      );

      // Set refresh token cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 4 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({ flag: 200, accessToken });
    } else {
      // Register new user
      const { given_name: firstName = "", family_name: lastName = "", email, picture: profileImage = "" } = payload;

      const newUser = await connection.queryOne(
        `INSERT INTO public.users (first_name, last_name, email, profile_image_url)
         VALUES ($1, $2, $3, $4) RETURNING user_id`,
        [firstName, lastName, email, profileImage]
      );



          // Generate tokens
    const accessToken = jwt.sign(
      {
        userId: newUser.user_id,
        firstName,
        lastName,
        email,
        image: profileImage,
      },
      jwtSecret,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { userId: newUser.user_id, email },
      jwtSecret,
      { expiresIn: "3d" }
    );

      // Save refresh token and mc_id
      await connection.query(
        "UPDATE public.users SET refresh_token = $1, mc_id = $2 WHERE user_id = $3",
        [refreshToken, newUser.user_id, newUser.user_id]
      );

      // Set refresh token cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 4 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({ flag: 201, accessToken });
    }
  } catch (error) {
    console.error("Error in gauth API:", error);

    if (error instanceof errors.QError) {
      return res.status(400).json(error);
    }
    return res.status(500).json(new errors.ERROR_IN_EXECUTION());
  } finally {
    if (connection) {
      await connection.rollback();
      await connection.release(); // Ensure connection is released
    }
  }
};
