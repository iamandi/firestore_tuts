const projectSecret = `${process.env.project_secret}`;
const projectIdEndPt = `/${process.env.project_id}`;
const projectIdEndPtUrl = `https://mainnet.infura.io/v3${projectIdEndPt}`;
const infuraEndPt = Axios.create({
  baseURL: "https://mainnet.infura.io/v3",
  headers: { "Content-type": "application/json" },
  auth: { username: "", password: projectSecret }
});

module.exports.projectSecret = projectSecret;
module.exports.projectIdEndPt = projectIdEndPt;
module.exports.projectIdEndPtUrl = projectIdEndPtUrl;
module.exports.infuraEndPt = infuraEndPt;
