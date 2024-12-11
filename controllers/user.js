const { api, auth, verifyJwt } = require("../helpers/common");
const errors = require("../helpers/errors");
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



// exports.gauthRegistration = api(
//   [
//     "gauthToken" 
//   ],
//   async (req, connection) => {
//     const { gauthToken } = req.body;

//     try {

//       const decodedToken = await verifyJwt(gauthToken,'');
//       // Decode the JWT
//       // const decoded = jwt.decode(jwt_token);

//       // if (!decoded || !decoded.email) {
//       //   throw new Error("Invalid or missing email in JWT.");
//       // }

//       // // Extract user data from the decoded token
//       // const {
//       //   email,
//       //   given_name: firstName,
//       //   family_name: lastName,
//       //   picture: profileImageUrl,
//       //   hd: domain,
//       //   name: fullName,
//       // } = decoded;

//       // // Optional fields with defaults
//       // const mc_id = domain === "dippuzen.com" ? 1 : null; // Example logic for mc_id
//       // const phone = null; // Assuming phone is not provided in JWT

//       // // Check if user already exists
//       // const [existingUser] = await connection.query(
//       //   "SELECT * FROM public.users WHERE email = $1",
//       //   [email]
//       // );

//       // if (existingUser) {
//       //   // Update user record
//       //   await connection.query(
//       //     `UPDATE public.users
//       //      SET first_name = $1, last_name = $2, profile_image_url = $3, updated_at = NOW()
//       //      WHERE email = $4`,
//       //     [firstName, lastName, profileImageUrl, email]
//       //   );
//       // } else {
//       //   // Insert new user record
//       //   await connection.query(
//       //     `INSERT INTO public.users
//       //      (mc_id, first_name, last_name, email, profile_image_url, created_at, updated_at)
//       //      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
//       //     [mc_id, firstName, lastName, email, profileImageUrl]
//       //   );
//       // }

//       return decodedToken;
//     } catch (error) {
//       console.error("Error updating user:", error.message);
//       return { flag: 500, message: "Failed to update user information.", error: error.message };
//     }
//   }
// );


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
const CLIENT_ID = "86548941450-m44vqa6iaedj752kd6niqv9d1aemmalr.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

exports.gauthRegistration = api(
  async (req, connection) => {


    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();

    return payload;
  }
);

