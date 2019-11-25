const axios = require("axios");

const projectSecret = `${functions.config().infura_project.key}`;
const projectIdEndPt = `/${functions.config().infura_project.id}`;
const projectIdEndPtUrl = `https://mainnet.infura.io/v3${projectIdEndPt}`;
const infuraEndPt = axios.create({
  baseURL: "https://mainnet.infura.io/v3",
  headers: { "Content-type": "application/json" },
  auth: { username: "", password: projectSecret }
});

module.exports.projectSecret = projectSecret;
module.exports.projectIdEndPt = projectIdEndPt;
module.exports.projectIdEndPtUrl = projectIdEndPtUrl;
module.exports.infuraEndPt = infuraEndPt;
