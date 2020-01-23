const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const MongoClient = require("mongodb").MongoClient;

// @route GET api/drewDb/terminal/orderType
// @desc  GET terminal object
// @access Private
router.get(
  "/terminal/orderType",
  [
    auth,
    [
      check("orderType", "Order Type is required")
        .not()
        .isEmpty(),
      check("Practice", "Practice is Required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const url = "mongodb://localhost:27017/";
    const { orderType, Practice } = req.body;
    //Destructure the req.body
    //I think this where we plugin the request
    MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
      if (err) throw err;
      const dbo = db.db("admin");
      dbo
        .collection("Orders")
        .find({ $and: [{ "Order Type": orderType }, { Practice: Practice }] })
        .toArray(function(err, result) {
          if (err) throw err;
          res.json(result);
          db.close();
        });
    });
  }
);

router.get(
  "/terminal/patientLong",
  [
    auth,
    [
      check("patientId", "Patient ID is required")
        .not()
        .isEmpty(),
      check("orderChoice", "Order Choice is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const url = "mongodb://localhost:27017/";
    const { patientId, orderChoice } = req.body;
    //Destructure the req.body
    //I think this where we plugin the request
    MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
      if (err) throw err;
      const dbo = db.db("admin");
      dbo
        .collection("Orders")
        .find({
          $and: [{ patientKey: patientId }, { "Order Choice": orderChoice }]
        })
        .toArray(function(err, result) {
          if (err) throw err;
          const resultObjectArray = [];
          for (i = 0; i < result.length; i++) {
            var orderNumber = result[i].labFillerOrderNumber;
            var patient = result[i].patientKey;
            var practice = result[i].Practice;

            var resultObject = {
              patient: patient,
              order: orderNumber,
              practice: practice
            };
            resultObjectArray.push(resultObject);
          }
          res.json(resultObjectArray);
          db.close();
        });
    });
  }
);

module.exports = router;
