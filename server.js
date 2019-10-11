const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const moment = require('moment');
const connectDB = require('./config/db');
const connectCopiaDB = require('./config/copiaDb');
const sql = require('mssql');

//Connect to MongoDB
connectDB();
//Connect to CopiaDB
connectCopiaDB();
//Init Middleware
app.use(express.json({ extended: false }));

app.use(express.urlencoded({ extended: true }));

//Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/auth', require('./routes/api/auth'));

//*****************************BEGINNING TERMINAL GET********************************************************************************/
app.get('/', (req, res) => {
  const config = {
    user: 'mkorenvaes',
    password: 'R0dm0n88**',
    server: '192.168.191.42', // You can use 'localhost\\instance' to connect to named instance
    database: 'Copia',

    options: {
      encrypt: true // Use this if you're on Windows Azure
    }
  };
  const results = [];
  //May put this whole thing in a get or scrape into the MongoDB, can put the request/user data into the
  //Get get the request data here, store to variable, and put in SQL query using jsx ${} syntax
  sql
    .connect(config)
    .then(() => {
      return sql.query`SELECT DISTINCT
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
          copia.patient.lastName as [Patient Last]
          FROM copia.OrderedPanel
              LEFT JOIN copia.result ON copia.orderedpanel.orderedPanelKey = copia.result.orderedPanelKey
              LEFT JOIN copia.specimen ON copia.orderedpanel.specimenKey = copia.specimen.specimenKey
              LEFT JOIN copia.staff ON copia.specimen.orderingPhysicianKey = copia.staff.staffKey
              LEFT JOIN copia.requisition ON copia.result.requisitionKey = copia.Requisition.requisitionKey
              LEFT JOIN copia.Patient ON copia.requisition.patientKey = copia.patient.patientKey
              LEFT JOIN copia.Panel ON copia.orderedpanel.panelKey = copia.panel.panelKey
          WHERE copia.orderedPanel.isCancelled=0 
          AND copia.patient.isTestPatient=0 
          AND copia.result.approvedStamp > 1562621408000
          ORDER BY approvedStamp`;
    })
    .then(result => {
      for (i = 0; i < result.recordset.length; i++) {
        var specimenNumber = result.recordset[i].labFillerOrderNumber;
        var panelName = result.recordset[i].name;
        var collectionTime = moment
          .unix(result.recordset[i].ProposedDrawStamp / 1000)
          .format('DD MMM YYYY hh:mm a');
        var accessionedTime = moment
          .unix(result.recordset[i].orderForStamp / 1000)
          .format('DD MMM YYYY hh:mm a');
        var resultApprovedTime = moment
          .unix(result.recordset[i].approvedStamp / 1000)
          .format('DD MMM YYYY hh:mm a');
        var orderCancelled = result.recordset[i].isCancelled;
        var techId = result.recordset[i].techID;
        var providerFirst = result.recordset[i].firstName;
        var providerLast = result.recordset[i].lastName;
        //*****************************CALCULATION OF TAT**********************************************//
        var TATMilliseconds =
          result.recordset[i].approvedStamp - result.recordset[i].orderForStamp;
        var tempTATOne = moment.duration(TATMilliseconds);
        var TAT =
          'Days: ' +
          tempTATOne.days() +
          ' Hours: ' +
          tempTATOne.hours() +
          ' Minutes: ' +
          tempTATOne.minutes();
        //*****************************END CALCULATION OF TAT**********************************************//
        //*****************************CREATION OF TERMINAL OBJECT*****************************************//
        var terminalObject = {
          specimenNumber,
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
      const responseArrayOne = [];
      //trying to control for number of objects in the response array here such that Postman does not crash
      for (i = 0; i < 100; i++) {
        responseArrayOne.push(results[i]);
      }
      res.json(responseArrayOne);
    })
    .catch(err => {
      console.log(err); // ... error checks
    });
  sql.on('error', err => {
    console.log(err); // ... error handler
  });
});
//*****************************END TERMINAL GET********************************************************************************/
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
