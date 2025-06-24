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
const { addMember, editMember,getAllMember,deleteMember ,getUserInfo} = require("./controllers/member");
const { createHealthMetric,editHealthMetric,deleteHealthMetric,getHealthMetric } = require("./controllers/healthMetric");
const { getAllReports,getAllPrescription,getCombainedDocs,editReportStatus,editprescriptionStatus,deleteReports,deleteReportImages,deletePrescriptions ,generateTempUrl} = require("./controllers/doc");

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


require('./utils/cleanupScheduler');


app.post(`${BASE_URL}/getAllUsers`, getAllUsers);
app.post(`${BASE_URL}/gauth`, gauth);
app.post(`${BASE_URL}/auth`, auth);
app.post(`${BASE_URL}/token`, token);
app.post(`${BASE_URL}/logout`, logout);

app.post(`${BASE_URL}/editUser`, editUser);
app.post(`${BASE_URL}/getUserInfo`, getUserInfo);
app.post(`${BASE_URL}/addMember`, addMember);
app.post(`${BASE_URL}/editMember`, editMember);
app.post(`${BASE_URL}/getAllMember`, getAllMember);
app.post(`${BASE_URL}/deleteMember`, deleteMember);

app.post(`${BASE_URL}/createHealthMetric`, createHealthMetric);
app.post(`${BASE_URL}/editHealthMetric`, editHealthMetric);
app.post(`${BASE_URL}/deleteHealthMetric`, deleteHealthMetric);
app.post(`${BASE_URL}/getHealthMetric`, getHealthMetric);

app.post(`${BASE_URL}/getAllReports`, getAllReports);
app.post(`${BASE_URL}/getAllPrescription`, getAllPrescription);
app.post(`${BASE_URL}/getCombainedDocs`, getCombainedDocs);
app.post(`${BASE_URL}/editReportStatus`, editReportStatus);
app.post(`${BASE_URL}/editprescriptionStatus`, editprescriptionStatus);
app.post(`${BASE_URL}/deleteReports`, deleteReports);
app.post(`${BASE_URL}/deleteReportImages`, deleteReportImages);
app.post(`${BASE_URL}/deletePrescriptions`, deletePrescriptions);
app.post(`${BASE_URL}/generateTempUrl`, generateTempUrl);

http.createServer(app).listen(app.get("port"), "0.0.0.0", function () {
  console.log("🚀 Server is up and running on port " + app.get("port") + " 🎉");
});
