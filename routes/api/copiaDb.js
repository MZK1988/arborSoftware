const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const sql = require("mssql");
const moment = require("moment");

// @route GET api/copiaDb/terminal/tatByDepartments
// @desc  GET Average TAT Accross All Departments
// @access Private
router.get(
  "/terminal/tatByDepartments",
  [
    auth,
    [
      //this will likely be changed into department
      check("fromDate", "From Date is required")
        .not()
        .isEmpty(),
      //this will likely be changed into a custom tailored list of specialties
      check("toDate", "To Date is Required")
        .not()
        .isEmpty(),
      check("departmentOne", "department is Required")
        .not()
        .isEmpty(),
      check("departmentTwo", "department is Required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fromDate, toDate, departmentOne, departmentTwo } = req.body;
    const departments = [];
    departments.push(departmentOne, departmentTwo);
    console.log(departments);
    //format intake time to Unix milliseconds using moment
    const fromDateUnix = moment(fromDate, "M/D/YYYY H:mm")
      .valueOf()
      .toString();
    const toDateUnix = moment(toDate, "M/D/YYYY H:mm")
      .valueOf()
      .toString();

    // //If # department > 1 for loop to create sql query
    // const departmentQuery = [];
    // if (departments.length < 1) {
    //   let departmentQueryText =
    //     "AND copia.PanelType.name = " + "'" + departments + "'" + " ";
    //   departmentQuery.push(departmentQueryText);
    // } else {
    //   for (i = 1; i < departments.length; i++) {
    //     let departmentQueryTextOne =
    //       "AND copia.PanelType.name = " + "'" + departments[0] + "'" + " ";
    //     departmentQuery.push(departmentQueryTextOne);
    //     let departmentQueryTextTwo =
    //       "OR copia.PanelType.name = " + "'" + departments[i] + "'" + " ";
    //     departmentQuery.push(departmentQueryTextTwo);
    //   }
    // }

    // const departmentQueryTextInsert = departmentQuery.join("");
    // const departmentQueryTextInsertString = departmentQueryTextInsert.toString();
    // console.log(departmentQueryTextInsertString);
    try {
      await sql.connect("mssql://Mkorenvaes:oPB2zh@1!t@192.168.191.236/copia");
      let terminalQuery = await sql.query`SELECT DISTINCT
      copia.PanelType.name as [Department],
      copia.Requisition.orderForStamp,
      copia.Result.approvedStamp
      FROM copia.OrderedPanel
          LEFT JOIN copia.result ON copia.orderedpanel.orderedPanelKey = copia.result.orderedPanelKey
          LEFT JOIN copia.requisition ON copia.result.requisitionKey = copia.Requisition.requisitionKey
          LEFT JOIN copia.Patient ON copia.requisition.patientKey = copia.patient.patientKey
          LEFT JOIN copia.Panel ON copia.orderedpanel.panelKey = copia.panel.panelKey
          LEFT JOIN copia.Panel_PanelType_Map ON copia.Panel_PanelType_Map.panelKey = copia.panel.panelKey
          LEFT JOIN copia.PanelType ON copia.Panel_PanelType_Map.panelTypeKey = copia.paneltype.panelTypeKey
      WHERE copia.orderedPanel.isCancelled=0 
          AND copia.patient.isTestPatient=0 
          AND copia.result.approvedStamp > ${fromDateUnix}
          AND copia.result.approvedStamp < ${toDateUnix}
          AND copia.panel.isReportable = 1
          AND copia.paneltype.name IS NOT NULL
      ORDER BY approvedStamp`;

      const sortObject = [];
      for (i = 0; i < terminalQuery.recordset.length; i++) {
        //if terminalQuery.recordset[i].department === "Clinical"
        for (a = 0; a < departments.length; a++) {
          if ((terminalQuery.recordset[i].name = departments[a])) {
            var TATMilliseconds =
              terminalQuery.recordset[i].approvedStamp -
              terminalQuery.recordset[i].orderForStamp;

            var departmentInsert = departments[a];
            var departmentObject = {
              departmentInsert,
              TATMilliseconds
            };
          }
        }
        sortObject.push(departmentObject);
      }
      console.log(sortObject[0]);
      // let sum = 0;
      // for (i = 0; i < sortObject.length; i++) {
      //   sum += sortObject[i];
      // }
      // const avg = sum / sortObject.length;
      // let avgDisplay = moment.duration(parseInt(avg.toFixed()));
      // const avgDisplayOne =
      //   "Days: " +
      //   avgDisplay.days() +
      //   " Hours: " +
      //   avgDisplay.hours() +
      //   " Minutes: " +
      //   avgDisplay.minutes();
      // res.json(avgDisplayOne);
      sql.close();
    } catch (err) {
      console.error(err.message);
      //Exit process with failure
      process.exit(1);
    }
  }
);

// @route GET api/copiaDb/terminal/tatDateSort
// @desc  GET Average TAT Accross All Departments
// @access Private

router.get(
  "/terminal/tatDateSort",
  [
    auth,
    [
      //this will likely be changed into department
      check("fromDate", "From Date is required")
        .not()
        .isEmpty(),
      //this will likely be changed into a custom tailored list of specialties
      check("toDate", "To Date is Required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fromDate, toDate } = req.body;

    //format intake time to Unix milliseconds using moment
    const fromDateUnix = moment(fromDate, "M/D/YYYY H:mm")
      .valueOf()
      .toString();
    const toDateUnix = moment(toDate, "M/D/YYYY H:mm")
      .valueOf()
      .toString();
    //If we still have to use sql database, then we request that everyone on management team have respective credentials?
    try {
      await sql.connect("mssql://Mkorenvaes:oPB2zh@1!t@192.168.191.236/copia");
      let terminalQuery = await sql.query`SELECT DISTINCT
      copia.OrderedPanel.labFillerOrderNumber,
      copia.panel.name,
      copia.OrderedPanel.orderedPanelKey,
      copia.PanelType.name as [Department],
      copia.Requisition.ProposedDrawStamp,
      copia.Requisition.orderForStamp,
      copia.Result.approvedStamp,
      copia.OrderedPanel.isCancelled,
      copia.result.techID,
      copia.staff.firstName,
      copia.staff.lastName,
      copia.patient.firstName as [Patient First],
      copia.patient.lastName as [Patient Last],
      copia.patient.patientKey
      FROM copia.OrderedPanel
          LEFT JOIN copia.result ON copia.orderedpanel.orderedPanelKey = copia.result.orderedPanelKey
          LEFT JOIN copia.specimen ON copia.orderedpanel.specimenKey = copia.specimen.specimenKey
          LEFT JOIN copia.staff ON copia.specimen.orderingPhysicianKey = copia.staff.staffKey
          LEFT JOIN copia.requisition ON copia.result.requisitionKey = copia.Requisition.requisitionKey
          LEFT JOIN copia.Patient ON copia.requisition.patientKey = copia.patient.patientKey
          LEFT JOIN copia.Panel ON copia.orderedpanel.panelKey = copia.panel.panelKey
          LEFT JOIN copia.Panel_PanelType_Map ON copia.Panel_PanelType_Map.panelKey = copia.panel.panelKey
          LEFT JOIN copia.PanelType ON copia.Panel_PanelType_Map.panelTypeKey = copia.paneltype.panelTypeKey
      WHERE copia.orderedPanel.isCancelled=0 
          AND copia.patient.isTestPatient=0 
          AND copia.result.approvedStamp > ${fromDateUnix}
          AND copia.result.approvedStamp < ${toDateUnix}
          AND copia.panel.isReportable = 1
          AND copia.paneltype.name IS NOT NULL
          AND NOT copia.panel.name = 'PDF Report'
      ORDER BY approvedStamp`;

      console.log("Copia Connected Async Await Config Folder....");
      //const tatClinical, tat
      const tat = [];
      for (i = 0; i < terminalQuery.recordset.length; i++) {
        //if terminalQuery.recordset[i].department === "Clinical"
        let TATMilliseconds =
          terminalQuery.recordset[i].approvedStamp -
          terminalQuery.recordset[i].orderForStamp;
        tat.push(TATMilliseconds);
      }
      let sum = 0;
      for (i = 0; i < tat.length; i++) {
        sum += tat[i];
      }
      const avg = sum / tat.length;
      let avgDisplay = moment.duration(parseInt(avg.toFixed()));

      const avgDisplayOne =
        "Days: " +
        avgDisplay.days() +
        " Hours: " +
        avgDisplay.hours() +
        " Minutes: " +
        avgDisplay.minutes();

      res.json(avgDisplayOne);
      sql.close();
    } catch (err) {
      console.error(err.message);
      //Exit process with failure
      process.exit(1);
    }
  }
);
// @route GET api/copiaDb/terminal/listDepartments
// @desc  GET list of departments at lab
// @access Private
//The idea is that this will populate a filterable table
router.get("/terminal/listDepartments", [auth], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    await sql.connect("mssql://Mkorenvaes:oPB2zh@1!t@192.168.191.236/copia");
    let listDepartmentsQuery = await sql.query`SELECT DISTINCT
      copia.paneltype.name from copia.PanelType`;

    const departmentFilters = [];
    for (i = 0; i < listDepartmentsQuery.recordset.length; i++) {
      departmentFilters.push(listDepartmentsQuery.recordset[i].name);
    }
    res.json(departmentFilters);
    sql.close();
  } catch (err) {
    console.error(err.message);
    //Exit process with failure
    process.exit(1);
  }
});

// @route GET api/copiaDb/terminal/dateSort
// @desc  GET terminal object
// @access Private
//The idea is that this will populate a filterable table
router.get(
  "/terminal/dateSort",
  [
    auth,
    [
      //this will likely be changed into department
      check("fromDate", "From Date is required")
        .not()
        .isEmpty(),
      //this will likely be changed into a custom tailored list of specialties
      check("toDate", "To Date is Required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fromDate, toDate } = req.body;

    //format intake time to Unix milliseconds using moment
    const fromDateUnix = moment(fromDate, "M/D/YYYY H:mm")
      .valueOf()
      .toString();
    const toDateUnix = moment(toDate, "M/D/YYYY H:mm")
      .valueOf()
      .toString();
    //If we still have to use sql database, then we request that everyone on management team have respective credentials?
    try {
      await sql.connect("mssql://Mkorenvaes:oPB2zh@1!t@192.168.191.236/copia");
      let terminalQuery = await sql.query`SELECT DISTINCT
      copia.OrderedPanel.labFillerOrderNumber,
      copia.panel.name,
      copia.OrderedPanel.orderedPanelKey,
      copia.PanelType.name as [Department],
      copia.Requisition.ProposedDrawStamp,
      copia.Requisition.orderForStamp,
      copia.Result.approvedStamp,
      copia.OrderedPanel.isCancelled,
      copia.result.techID,
      copia.staff.firstName,
      copia.staff.lastName,
      copia.patient.firstName as [Patient First],
      copia.patient.lastName as [Patient Last],
      copia.patient.patientKey
      FROM copia.OrderedPanel
          LEFT JOIN copia.result ON copia.orderedpanel.orderedPanelKey = copia.result.orderedPanelKey
          LEFT JOIN copia.specimen ON copia.orderedpanel.specimenKey = copia.specimen.specimenKey
          LEFT JOIN copia.staff ON copia.specimen.orderingPhysicianKey = copia.staff.staffKey
          LEFT JOIN copia.requisition ON copia.result.requisitionKey = copia.Requisition.requisitionKey
          LEFT JOIN copia.Patient ON copia.requisition.patientKey = copia.patient.patientKey
          LEFT JOIN copia.Panel ON copia.orderedpanel.panelKey = copia.panel.panelKey
          LEFT JOIN copia.Panel_PanelType_Map ON copia.Panel_PanelType_Map.panelKey = copia.panel.panelKey
          LEFT JOIN copia.PanelType ON copia.Panel_PanelType_Map.panelTypeKey = copia.paneltype.panelTypeKey
      WHERE copia.orderedPanel.isCancelled=0 
          AND copia.patient.isTestPatient=0 
          AND copia.result.approvedStamp > ${fromDateUnix}
          AND copia.result.approvedStamp < ${toDateUnix}
          AND copia.panel.isReportable = 1
          AND copia.paneltype.name IS NOT NULL
          AND NOT copia.panel.name = 'PDF Report'
      ORDER BY approvedStamp`;

      console.log("Copia Connected Async Aswait Config Folder....");
      const results = [];
      for (i = 0; i < terminalQuery.recordset.length; i++) {
        let specimenNumber = terminalQuery.recordset[i].labFillerOrderNumber;
        let department = terminalQuery.recordset[i].Department;
        let patientKey = terminalQuery.recordset[i].patientKey;
        let panelName = terminalQuery.recordset[i].name;
        let collectionTime = moment
          .unix(terminalQuery.recordset[i].ProposedDrawStamp / 1000)
          .format("DD MMM YYYY hh:mm a");
        let accessionedTime = moment
          .unix(terminalQuery.recordset[i].orderForStamp / 1000)
          .format("DD MMM YYYY hh:mm a");
        let resultApprovedTime = moment
          .unix(terminalQuery.recordset[i].approvedStamp / 1000)
          .format("DD MMM YYYY hh:mm a");
        let orderCancelled = terminalQuery.recordset[i].isCancelled;
        let techId = terminalQuery.recordset[i].techID;
        let providerFirst = terminalQuery.recordset[i].firstName;
        let providerLast = terminalQuery.recordset[i].lastName;
        //*****************************CALCULATION OF TAT**********************************************//
        let TATMilliseconds =
          terminalQuery.recordset[i].approvedStamp -
          terminalQuery.recordset[i].orderForStamp;
        let tempTATOne = moment.duration(TATMilliseconds);
        let TAT =
          "Days: " +
          tempTATOne.days() +
          " Hours: " +
          tempTATOne.hours() +
          " Minutes: " +
          tempTATOne.minutes();
        //*****************************END CALCULATION OF TAT**********************************************//
        //*****************************CREATION OF TERMINAL OBJECT*****************************************//
        const terminalObject = {
          specimenNumber,
          department,
          patientKey,
          panelName,
          collectionTime,
          accessionedTime,
          resultApprovedTime,
          orderCancelled,
          techId,
          providerFirst,
          providerLast,
          TAT
        };

        results.push(terminalObject);
      }
      res.json(results);
      sql.close();
    } catch (err) {
      console.error(err.message);
      //Exit process with failure
      process.exit(1);
    }
  }
);

// @route GET api/copiaDb/terminal/nameSort
// @desc  GET terminal object sorted by Physician First and Last
// @access Private
router.get(
  "/terminal/nameSort",
  [
    auth,
    [
      //this will likely be changed into department
      check("firstName", "First Name is required")
        .not()
        .isEmpty(),
      //this will likely be changed into a custom tailored list of specialties
      check("lastName", "Last Name is Required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName } = req.body;

    //format intake time to Unix milliseconds using moment

    try {
      await sql.connect("mssql://Mkorenvaes:oPB2zh@1!t@192.168.191.236/copia");
      let terminalQuery = await sql.query`SELECT DISTINCT
            copia.OrderedPanel.labFillerOrderNumber,
            copia.panel.name,
            copia.OrderedPanel.orderedPanelKey,
            copia.Requisition.ProposedDrawStamp,
            copia.Requisition.orderForStamp,
            copia.Result.approvedStamp,
            copia.OrderedPanel.isCancelled,
            copia.result.techID,
            copia.staff.firstName,
            copia.staff.lastName,
            copia.patient.firstName as [Patient First],
            copia.patient.lastName as [Patient Last],
            copia.patient.patientKey
            FROM copia.OrderedPanel
                LEFT JOIN copia.result ON copia.orderedpanel.orderedPanelKey = copia.result.orderedPanelKey
                LEFT JOIN copia.specimen ON copia.orderedpanel.specimenKey = copia.specimen.specimenKey
                LEFT JOIN copia.staff ON copia.specimen.orderingPhysicianKey = copia.staff.staffKey
                LEFT JOIN copia.requisition ON copia.result.requisitionKey = copia.Requisition.requisitionKey
                LEFT JOIN copia.Patient ON copia.requisition.patientKey = copia.patient.patientKey
                LEFT JOIN copia.Panel ON copia.orderedpanel.panelKey = copia.panel.panelKey
                LEFT JOIN copia.Panel_PanelType_Map ON copia.Panel_PanelType_Map.panelKey = copia.panel.panelKey
                LEFT JOIN copia.PanelType ON copia.Panel_PanelType_Map.panelTypeKey = copia.paneltype.panelTypeKey
            WHERE copia.orderedPanel.isCancelled=0 
            AND copia.patient.isTestPatient=0 
            AND copia.staff.firstName = ${firstName}
            AND copia.staff.lastName = ${lastName}
            AND copia.panel.isReportable = 1
            ORDER BY approvedStamp`;
      console.log("Copia Connected Async Aswait Config Folder....");
      const results = [];
      for (i = 0; i < terminalQuery.recordset.length; i++) {
        let specimenNumber = terminalQuery.recordset[i].labFillerOrderNumber;
        let patientKey = terminalQuery.recordset[i].patientKey;
        let panelName = terminalQuery.recordset[i].name;
        let collectionTime = moment
          .unix(terminalQuery.recordset[i].ProposedDrawStamp / 1000)
          .format("DD MMM YYYY hh:mm a");
        let accessionedTime = moment
          .unix(terminalQuery.recordset[i].orderForStamp / 1000)
          .format("DD MMM YYYY hh:mm a");
        let resultApprovedTime = moment
          .unix(terminalQuery.recordset[i].approvedStamp / 1000)
          .format("DD MMM YYYY hh:mm a");
        let orderCancelled = terminalQuery.recordset[i].isCancelled;
        let techId = terminalQuery.recordset[i].techID;
        let providerFirst = terminalQuery.recordset[i].firstName;
        let providerLast = terminalQuery.recordset[i].lastName;
        //*****************************CALCULATION OF TAT**********************************************//
        let TATMilliseconds =
          terminalQuery.recordset[i].approvedStamp -
          terminalQuery.recordset[i].orderForStamp;
        let tempTATOne = moment.duration(TATMilliseconds);
        let TAT =
          "Days: " +
          tempTATOne.days() +
          " Hours: " +
          tempTATOne.hours() +
          " Minutes: " +
          tempTATOne.minutes();
        //*****************************END CALCULATION OF TAT**********************************************//
        //*****************************CREATION OF TERMINAL OBJECT*****************************************//
        const terminalObject = {
          specimenNumber,
          patientKey,
          panelName,
          collectionTime,
          accessionedTime,
          resultApprovedTime,
          orderCancelled,
          techId,
          providerFirst,
          providerLast,
          TAT
        };
        results.push(terminalObject);
      }

      res.json(results);
      sql.close();
    } catch (err) {
      console.error(err.message);
      //Exit process with failure
      process.exit(1);
    }
  }
);

// @route GET api/copiaDb/terminal/dateAndNameSort
// @desc  GET terminal object sorted by Physician First and Last and Date
// @access Private
router.get(
  "/terminal/dateAndNameSort",
  [
    auth,
    [
      //this will likely be changed into department
      check("firstName", "First Name is required")
        .not()
        .isEmpty(),
      //this will likely be changed into a custom tailored list of specialties
      check("lastName", "Last Name is Required")
        .not()
        .isEmpty(),
      //this will likely be changed into department
      check("fromDate", "From Date is required")
        .not()
        .isEmpty(),
      //this will likely be changed into a custom tailored list of specialties
      check("toDate", "To Date is Required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, fromDate, toDate } = req.body;

    const fromDateUnix = moment(fromDate, "M/D/YYYY H:mm")
      .valueOf()
      .toString();
    const toDateUnix = moment(toDate, "M/D/YYYY H:mm")
      .valueOf()
      .toString();

    //format intake time to Unix milliseconds using moment

    try {
      await sql.connect("mssql://Mkorenvaes:oPB2zh@1!t@192.168.191.236/copia");
      let terminalQuery = await sql.query`SELECT DISTINCT
            copia.OrderedPanel.labFillerOrderNumber,
            copia.panel.name,
            copia.OrderedPanel.orderedPanelKey,
            copia.Requisition.ProposedDrawStamp,
            copia.Requisition.orderForStamp,
            copia.Result.approvedStamp,
            copia.OrderedPanel.isCancelled,
            copia.result.techID,
            copia.staff.firstName,
            copia.staff.lastName,
            copia.patient.firstName as [Patient First],
            copia.patient.lastName as [Patient Last],
            copia.patient.patientKey
            FROM copia.OrderedPanel
                LEFT JOIN copia.result ON copia.orderedpanel.orderedPanelKey = copia.result.orderedPanelKey
                LEFT JOIN copia.specimen ON copia.orderedpanel.specimenKey = copia.specimen.specimenKey
                LEFT JOIN copia.staff ON copia.specimen.orderingPhysicianKey = copia.staff.staffKey
                LEFT JOIN copia.requisition ON copia.result.requisitionKey = copia.Requisition.requisitionKey
                LEFT JOIN copia.Patient ON copia.requisition.patientKey = copia.patient.patientKey
                LEFT JOIN copia.Panel ON copia.orderedpanel.panelKey = copia.panel.panelKey
                LEFT JOIN copia.Panel_PanelType_Map ON copia.Panel_PanelType_Map.panelKey = copia.panel.panelKey
                LEFT JOIN copia.PanelType ON copia.Panel_PanelType_Map.panelTypeKey = copia.paneltype.panelTypeKey
            WHERE copia.orderedPanel.isCancelled=0 
            AND copia.patient.isTestPatient=0 
            AND copia.staff.firstName = ${firstName}
            AND copia.staff.lastName = ${lastName}
            AND copia.result.approvedStamp > ${fromDateUnix}
            AND copia.result.approvedStamp < ${toDateUnix}
            AND copia.panel.isReportable = 1
            ORDER BY approvedStamp`;
      console.log("Copia Connected Async Aswait Config Folder....");
      const results = [];
      for (i = 0; i < terminalQuery.recordset.length; i++) {
        let specimenNumber = terminalQuery.recordset[i].labFillerOrderNumber;
        let patientKey = terminalQuery.recordset[i].patientKey;
        let panelName = terminalQuery.recordset[i].name;
        let collectionTime = moment
          .unix(terminalQuery.recordset[i].ProposedDrawStamp / 1000)
          .format("DD MMM YYYY hh:mm a");
        let accessionedTime = moment
          .unix(terminalQuery.recordset[i].orderForStamp / 1000)
          .format("DD MMM YYYY hh:mm a");
        let resultApprovedTime = moment
          .unix(terminalQuery.recordset[i].approvedStamp / 1000)
          .format("DD MMM YYYY hh:mm a");
        let orderCancelled = terminalQuery.recordset[i].isCancelled;
        let techId = terminalQuery.recordset[i].techID;
        let providerFirst = terminalQuery.recordset[i].firstName;
        let providerLast = terminalQuery.recordset[i].lastName;
        //*****************************CALCULATION OF TAT**********************************************//
        let TATMilliseconds =
          terminalQuery.recordset[i].approvedStamp -
          terminalQuery.recordset[i].orderForStamp;
        let tempTATOne = moment.duration(TATMilliseconds);
        let TAT =
          "Days: " +
          tempTATOne.days() +
          " Hours: " +
          tempTATOne.hours() +
          " Minutes: " +
          tempTATOne.minutes();
        //*****************************END CALCULATION OF TAT**********************************************//
        //*****************************CREATION OF TERMINAL OBJECT*****************************************//
        const terminalObject = {
          specimenNumber,
          patientKey,
          panelName,
          collectionTime,
          accessionedTime,
          resultApprovedTime,
          orderCancelled,
          techId,
          providerFirst,
          providerLast,
          TAT
        };
        results.push(terminalObject);
      }

      res.json(results);
      sql.close();
    } catch (err) {
      console.error(err.message);
      //Exit process with failure
      process.exit(1);
    }
  }
);

module.exports = router;
