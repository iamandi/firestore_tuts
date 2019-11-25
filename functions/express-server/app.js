"use strict";
const express = require("express");
const app = express();

require("./startup/routes")(app);
//require("./startup/db")();
//require("./startup/config")();
//require("./startup/validation")();

module.exports = app;
