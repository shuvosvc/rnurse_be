const { api, auth } = require("../helpers/common");
const errors = require("../helpers/errors");


exports.getAllUsers = api(

  async (req, connection, dealerInfo) => {


    const isExist = await connection.query(
      "SELECT * FROM public.users"
    );

    return { flag: 200, isExist };
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

