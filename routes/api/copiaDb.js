const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const sql = require('mssql');
const moment = require('moment');

// @route GET api/copiaDb/terminal/dateSort
// @desc  GET terminal object
// @access Private
router.get(
  '/terminal/dateSort',
  [
    auth,
    [
      //this will likely be changed into department
      check('fromDate', 'From Date is required')
        .not()
        .isEmpty(),
      //this will likely be changed into a custom tailored list of specialties
      check('toDate', 'To Date is Required')
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
    const fromDateUnix = moment(fromDate, 'M/D/YYYY H:mm')
      .valueOf()
      .toString();
    const toDateUnix = moment(toDate, 'M/D/YYYY H:mm')
      .valueOf()
      .toString();

    try {
      await sql.connect('mssql://mkorenvaes:R0dm0n88**@192.168.191.42/copia');
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
          WHERE copia.orderedPanel.isCancelled=0 
          AND copia.patient.isTestPatient=0 
          AND copia.result.approvedStamp > ${fromDateUnix}
          AND copia.result.approvedStamp < ${toDateUnix}
          AND copia.panel.isReportable = 1
          ORDER BY approvedStamp`;
      console.log('Copia Connected Async Aswait Config Folder....');
      const results = [];
      for (i = 0; i < terminalQuery.recordset.length; i++) {
        let specimenNumber = terminalQuery.recordset[i].labFillerOrderNumber;
        let patientKey = terminalQuery.recordset[i].patientKey;
        let panelName = terminalQuery.recordset[i].name;
        let collectionTime = moment
          .unix(terminalQuery.recordset[i].ProposedDrawStamp / 1000)
          .format('DD MMM YYYY hh:mm a');
        let accessionedTime = moment
          .unix(terminalQuery.recordset[i].orderForStamp / 1000)
          .format('DD MMM YYYY hh:mm a');
        let resultApprovedTime = moment
          .unix(terminalQuery.recordset[i].approvedStamp / 1000)
          .format('DD MMM YYYY hh:mm a');
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
          'Days: ' +
          tempTATOne.days() +
          ' Hours: ' +
          tempTATOne.hours() +
          ' Minutes: ' +
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

// @route GET api/copiaDb/terminal/nameSort
// @desc  GET terminal object sorted by Physician First and Last
// @access Private
router.get(
  '/terminal/nameSort',
  [
    auth,
    [
      //this will likely be changed into department
      check('firstName', 'First Name is required')
        .not()
        .isEmpty(),
      //this will likely be changed into a custom tailored list of specialties
      check('lastName', 'Last Name is Required')
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
      await sql.connect('mssql://mkorenvaes:R0dm0n88**@192.168.191.42/copia');
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
            WHERE copia.orderedPanel.isCancelled=0 
            AND copia.patient.isTestPatient=0 
            AND copia.staff.firstName = ${firstName}
            AND copia.staff.lastName = ${lastName}
            AND copia.panel.isReportable = 1
            ORDER BY approvedStamp`;
      console.log('Copia Connected Async Aswait Config Folder....');
      const results = [];
      for (i = 0; i < terminalQuery.recordset.length; i++) {
        let specimenNumber = terminalQuery.recordset[i].labFillerOrderNumber;
        let patientKey = terminalQuery.recordset[i].patientKey;
        let panelName = terminalQuery.recordset[i].name;
        let collectionTime = moment
          .unix(terminalQuery.recordset[i].ProposedDrawStamp / 1000)
          .format('DD MMM YYYY hh:mm a');
        let accessionedTime = moment
          .unix(terminalQuery.recordset[i].orderForStamp / 1000)
          .format('DD MMM YYYY hh:mm a');
        let resultApprovedTime = moment
          .unix(terminalQuery.recordset[i].approvedStamp / 1000)
          .format('DD MMM YYYY hh:mm a');
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
          'Days: ' +
          tempTATOne.days() +
          ' Hours: ' +
          tempTATOne.hours() +
          ' Minutes: ' +
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
  '/terminal/dateAndNameSort',
  [
    auth,
    [
      //this will likely be changed into department
      check('firstName', 'First Name is required')
        .not()
        .isEmpty(),
      //this will likely be changed into a custom tailored list of specialties
      check('lastName', 'Last Name is Required')
        .not()
        .isEmpty(),
      //this will likely be changed into department
      check('fromDate', 'From Date is required')
        .not()
        .isEmpty(),
      //this will likely be changed into a custom tailored list of specialties
      check('toDate', 'To Date is Required')
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

    const fromDateUnix = moment(fromDate, 'M/D/YYYY H:mm')
      .valueOf()
      .toString();
    const toDateUnix = moment(toDate, 'M/D/YYYY H:mm')
      .valueOf()
      .toString();

    //format intake time to Unix milliseconds using moment

    try {
      await sql.connect('mssql://mkorenvaes:R0dm0n88**@192.168.191.42/copia');
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
            WHERE copia.orderedPanel.isCancelled=0 
            AND copia.patient.isTestPatient=0 
            AND copia.staff.firstName = ${firstName}
            AND copia.staff.lastName = ${lastName}
            AND copia.result.approvedStamp > ${fromDateUnix}
            AND copia.result.approvedStamp < ${toDateUnix}
            AND copia.panel.isReportable = 1
            ORDER BY approvedStamp`;
      console.log('Copia Connected Async Aswait Config Folder....');
      const results = [];
      for (i = 0; i < terminalQuery.recordset.length; i++) {
        let specimenNumber = terminalQuery.recordset[i].labFillerOrderNumber;
        let patientKey = terminalQuery.recordset[i].patientKey;
        let panelName = terminalQuery.recordset[i].name;
        let collectionTime = moment
          .unix(terminalQuery.recordset[i].ProposedDrawStamp / 1000)
          .format('DD MMM YYYY hh:mm a');
        let accessionedTime = moment
          .unix(terminalQuery.recordset[i].orderForStamp / 1000)
          .format('DD MMM YYYY hh:mm a');
        let resultApprovedTime = moment
          .unix(terminalQuery.recordset[i].approvedStamp / 1000)
          .format('DD MMM YYYY hh:mm a');
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
          'Days: ' +
          tempTATOne.days() +
          ' Hours: ' +
          tempTATOne.hours() +
          ' Minutes: ' +
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
