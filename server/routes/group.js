const express = require("express");
const router = express.Router();

const { createGroup } = require("../controllers/group");

router.post("/create", createGroup);

module.exports = router;


