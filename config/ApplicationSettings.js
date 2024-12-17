require("dotenv").config();

var ApplicationSettings = {
  port: process.env.PORT || "5000",
  BASE_URL: process.env.BASE_URL || "/v1",
  jwtSecret: process.env.JWTSECRET || "fish",
  GAUTH_CLIENT_ID: process.env.GAUTH_CLIENT_ID || "86548941450-m44vqa6iaedj752kd6niqv9d1aemmalr.apps.googleusercontent.com",
  // Individual PostgreSQL settings
  postgresHost: process.env.POSTGRES_HOST || "localhost",
  postgresUser: process.env.POSTGRES_USER || "default",
  postgresPassword: process.env.POSTGRES_PASSWORD || "",
  postgresDatabase: process.env.POSTGRES_DATABASE || "mydatabase",
  connectionLimit: process.env.CONNECTION_LIMIT || 100,

};

module.exports = ApplicationSettings;
