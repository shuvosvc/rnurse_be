const { api, auth, verifyJwt } = require("../helpers/common");
const errors = require("../helpers/errors");
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


exports.gauth = api(["gauthToken"], async (req, connection) => {
  const { gauthToken } = req.body;



  const client = new OAuth2Client(GAUTH_CLIENT_ID);
  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken: gauthToken,
      audience: GAUTH_CLIENT_ID,
    });

  } catch (err) {
    throw new errors.INVALID_ACCESS_TOKEN();
  }

  const payload = ticket.getPayload();
  if (!payload.email) throw new errors.INVALID_ACCESS_TOKEN();



  // Check if the user already exists
  const isExist = await connection.queryOne(
    "SELECT user_id, first_name, last_name, phone, email, profile_image_url,pinned FROM public.users WHERE email = $1",
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
        pinned: isExist.pinned,
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


    return { flag: 200, accessToken, refreshToken }
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
        pinned:newUser.pinned
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



    return { flag: 200, accessToken, refreshToken }
  }


});


exports.token = api(["refreshToken"], async(req, connection) => {
  const {refreshToken:refreshToken_body} = req.body;
 
  const decodedToken_body = await verifyJwt(refreshToken_body, jwtSecret);

  
  if (decodedToken_body == null || decodedToken_body.userId == null) throw new errors.INVALID_ACCESS_TOKEN();

  // Check if the user  exists

  
  const isExist = await connection.queryOne(
    "SELECT user_id, first_name, last_name, phone, email, profile_image_url,pinned,refresh_token FROM public.users WHERE user_id = $1",
    [decodedToken_body.userId]
  ); 
  
  



  if (isExist == null || isExist.user_id == null ) throw new errors.INVALID_USER();
  if (isExist.refresh_token == null) throw new errors.INVALID_ACCESS_TOKEN();
  if (isExist.refresh_token != refreshToken_body) throw new errors.INVALID_USER();

   // Generate a new access token
   const newAccessToken = jwt.sign(
    {
      userId: isExist.user_id,
      firstName: isExist.first_name,
      lastName: isExist.last_name,
      phone: isExist.phone,
      email: isExist.email,
      image: isExist.profile_image_url,
      pinned: isExist.pinned,
      
    },
    jwtSecret,
    { expiresIn: "1h" }
  );

  return { flag: 200, accessToken:newAccessToken }
});



// // Endpoint to logout
// app.post("/logout", (req, res) => {
//   const refreshToken = req.cookies.refreshToken;

//   // Remove the token from the database and clear the cookie
//   refreshTokensDB = refreshTokensDB.filter((token) => token !== refreshToken);
//   res.clearCookie("refreshToken");
//   res.status(200).json({ message: "Logged out" });
// });


