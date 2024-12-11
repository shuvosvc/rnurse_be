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

require("dotenv").config();


const multipartMiddleware = multipart();
const cookieParser = require("cookie-parser");

const {getAllUsers,
  gauth

} = require("./controllers/user");



require("dotenv").config();
// const api = require('./routes');
const ApplicationSettings = require("./config/ApplicationSettings");
const { log } = require("logfmt");

// require('./utils/connection');

/* Routes Config */
app.set("port", process.env.PORT || ApplicationSettings.port);


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
app.get(`${process.env.BASE_URL}/`, (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


app.post( `${process.env.BASE_URL}/getAllUsers`, getAllUsers);
app.post( `${process.env.BASE_URL}/gauth`, gauth);


http.createServer(app).listen(app.get("port"), function () {
  console.log("🚀 Server is up and running on port " + app.get("port") + " 🎉");
});
