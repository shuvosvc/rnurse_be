const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const compression = require("compression");
const bodyParser = require("body-parser");

const errorhandler = require("errorhandler");
const http = require("http");
const helmet = require("helmet");
const methodOverride = require("method-override");
const multipart = require("connect-multiparty");

const { port, BASE_URL } = require("./config/ApplicationSettings");

const multipartMiddleware = multipart();
const cookieParser = require("cookie-parser");

const {
  getAllUsers,
  gauth,
  auth,
  token,
  logout,
  editUser,
} = require("./controllers/user");
const { addMember, editMember } = require("./controllers/member");

require("dotenv").config();

const ApplicationSettings = require("./config/ApplicationSettings");
const { log } = require("logfmt");

/* Routes Config */
app.set("port", port);

/* Middleware Configuration */

app.use(bodyParser.json({ limit: "2mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

app.use(methodOverride());
app.use(require("./utils/logger"));
app.use(helmet());
app.use(compression());

if ("development" === app.get("env") || "local" === app.get("env")) {
  app.use(errorhandler());
}
app.use(express.static(path.join(__dirname, "public")));

module.exports = app;

// Root API Route
app.get(`${BASE_URL}/`, (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post(`${BASE_URL}/getAllUsers`, getAllUsers);
app.post(`${BASE_URL}/gauth`, gauth);
app.post(`${BASE_URL}/auth`, auth);
app.post(`${BASE_URL}/token`, token);
app.post(`${BASE_URL}/logout`, logout);

app.post(`${BASE_URL}/editUser`, editUser);

app.post(`${BASE_URL}/addMember`, addMember);
app.post(`${BASE_URL}/editMember`, editMember);

http.createServer(app).listen(app.get("port"), "0.0.0.0", function () {
  console.log("🚀 Server is up and running on port " + app.get("port") + " 🎉");
});
