"use strict";
const express = require("express");
const app = express();

require("./startup/routes")(app);
//require("./startup/db")();
//require("./startup/config")();
//require("./startup/validation")();

const port = 3003;
app.listen(port, () => console.log(`Listening on ${port}...`));
