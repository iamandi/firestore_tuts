const Web3 = require("web3");
const keccak_256 = require("js-sha3").keccak256;

const { Movie, validate } = require("../models/movie");
const auth = require("../middleware/auth");

const express = require("express");
const router = express.Router();
