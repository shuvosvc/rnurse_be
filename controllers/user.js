const { api, auth, verifyJwt } = require("../helpers/common");
const errors = require("../helpers/errors");
require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");

exports.getAllUsers = api(


  async (req, connection, dealerInfo) => {


    const isExist = await connection.query(
      "SELECT * FROM public.users", []
    );

    return { flag: 200, isExist };
  }
);
// const jwt = require('jsonwebtoken');



exports.gauthRegistration = api(
  [
    "gauthToken"
  ],
  async (req, connection) => {
    const { gauthToken } = req.body;

    try {

      const decodedToken = await verifyJwt(gauthToken, '');
      // Decode the JWT
      const decoded = jwt.decode(jwt_token);

      if (!decoded || !decoded.email) {
        throw new Error("Invalid or missing email in JWT.");
      }

      // Extract user data from the decoded token
      const {
        email,
        given_name: firstName,
        family_name: lastName,
        picture: profileImageUrl,
        hd: domain,
        name: fullName,
      } = decoded;

      // Optional fields with defaults
      const mc_id = domain === "dippuzen.com" ? 1 : null; // Example logic for mc_id
      const phone = null; // Assuming phone is not provided in JWT

      // Check if user already exists
      const [existingUser] = await connection.query(
        "SELECT * FROM public.users WHERE email = $1",
        [email]
      );

      if (existingUser) {
        // Update user record
        await connection.query(
          `UPDATE public.users
           SET first_name = $1, last_name = $2, profile_image_url = $3, updated_at = NOW()
           WHERE email = $4`,
          [firstName, lastName, profileImageUrl, email]
        );
      } else {
        // Insert new user record
        await connection.query(
          `INSERT INTO public.users
           (mc_id, first_name, last_name, email, profile_image_url, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          [mc_id, firstName, lastName, email, profileImageUrl]
        );
      }

      return decodedToken;
    } catch (error) {
      console.error("Error updating user:", error.message);
      return { flag: 500, message: "Failed to update user information.", error: error.message };
    }
  }
);


// exports.createCustomer = api(
//   ["name", "address", "area", "primary_phone"],
//   auth(async (req, connection, dealerInfo) => {
//     const {
//       name,
//       name_en,
//       address,
//       area,
//       area_en,
//       primary_phone,
//       secondary_phone,
//     } = req.body;

//     if (secondary_phone == primary_phone)
//       throw new errors.GIVE_A_DIFFRENT_NUMBER();

//     const isExist = await connection.queryOne(
//       "SELECT id FROM customer WHERE primary_phone = $1 OR primary_phone = $2 OR secondary_phone = $3 OR secondary_phone = $4",
//       [primary_phone, secondary_phone, primary_phone, secondary_phone]
//     );
//     if (isExist) throw new errors.CUSTOMER_ALREADY_EXIST();

//     const sql_customer_insert =
//       "INSERT INTO customer (name, name_en, address, area, area_en, primary_phone, secondary_phone) VALUES($1, $2, $3, $4, $5, $6, $7)";
//     await connection.query(sql_customer_insert, [
//       name,
//       name_en,
//       address,
//       area,
//       area_en,
//       primary_phone,
//       secondary_phone,
//     ]);
//     return { flag: 200, message: "Customer created successfully." };
//   })
// );


// Replace with your Google Client ID


exports.gauth = async (req, res) => {


  const { token } = req.body;
  if (!token) throw new errors.PARAMETER_MISSING();

  const client = new OAuth2Client(process.env.GAUTH_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GAUTH_CLIENT_ID
  });

  if (!ticket) throw new errors.INVALID_ACCESS_TOKEN();

  const payload = ticket.getPayload();

  // Check if user already exists
  const isExist = await connection.queryOne("SELECT user_id,first_name,last_name,phone,email,profile_image_url FROM public.users WHERE email = $1", [payload.email]);


  if (isExist && isExist.id != null) {

    const accessToken = jwt.sign({
      userId: isExist.user_id,
      firstName: isExist.first_name,
      lastName: isExist.last_name,
      phone: isExist.phone,
      email: isExist.email,
      image: isExist.profile_image_url
    }, jwtSecret, { expiresIn: '1h' });

    // Generate a refresh token
    const refreshToken = jwt.sign({ userId: isExist.user_id, email: isExist.email }, refreshSecret, { expiresIn: '3d' });

    // Save the refresh token in the database
    const saveRefreshTokenQuery = 'UPDATE public.users SET refresh_token = $1 WHERE user_id = $2';
    await connection.query(saveRefreshTokenQuery, [refreshToken, isExist.user_id]);


    // Set refresh token as an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // Set to true in production with HTTPS
      sameSite: "Strict",
      maxAge: 4 * 24 * 60 * 60 * 1000  // browser can store max 4 days
    });

    const result = { flag: 200, accessToken }

    res.status(200).json(result);
  } else {





  }


  return payload;
};


exports.gauth = async (req, res) => {
  const { token } = req.body;
  if (!token) throw new errors.PARAMETER_MISSING();

  const client = new OAuth2Client(process.env.GAUTH_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GAUTH_CLIENT_ID,
  });

  if (!ticket) throw new errors.INVALID_ACCESS_TOKEN();

  const payload = ticket.getPayload();
  if (!payload.email) throw new errors.INVALID_ACCESS_TOKEN();
    
  // Check if user already exists
  const isExist = await connection.queryOne(
    "SELECT user_id,first_name,last_name,phone,email,profile_image_url FROM public.users WHERE email = $1",
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
      refreshSecret,
      { expiresIn: "3d" }
    );

    // Save the refresh token in the database
    const saveRefreshTokenQuery =
      "UPDATE public.users SET refresh_token = $1 WHERE user_id = $2";
    await connection.query(saveRefreshTokenQuery, [refreshToken, isExist.user_id]);

    // Set refresh token as an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // Set to true in production with HTTPS
      sameSite: "Strict",
      maxAge: 4 * 24 * 60 * 60 * 1000, // Browser can store for a maximum of 4 days
    });

    const result = { flag: 200, accessToken };
    res.status(200).json(result);
  }






  else {
    // Register new user
    const firstName = payload.given_name || "";
    const lastName = payload.family_name || "";
    const email = payload.email;
    const profileImage = payload.picture || "";
  
    const insertQuery = `
            INSERT INTO public.users (first_name, last_name, email, profile_image_url, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING user_id
        `;
    const newUser = await connection.queryOne(insertQuery, [firstName, lastName, email, profileImage]);

    if (!newUser || !newUser.user_id) {
      throw new Error("Failed to register new user");
    }

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
      refreshSecret,
      { expiresIn: "3d" }
    );

    // Save refresh token in the database
    const saveRefreshTokenQuery =
      "UPDATE public.users SET refresh_token = $1 WHERE user_id = $2";
    await connection.query(saveRefreshTokenQuery, [refreshToken, newUser.user_id]);

    // Set refresh token as an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 4 * 24 * 60 * 60 * 1000,
    });

    const result = { flag: 201, accessToken };
    res.status(201).json(result);
  }

  return payload;
};
