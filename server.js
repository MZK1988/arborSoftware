const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
var moment = require('moment');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const sql = require('mssql');
const config = {
    user: 'mkorenvaes',
    password: 'R0dm0n88**',
    server: 'arborcp1', // You can use 'localhost\\instance' to connect to named instance
    database: 'Copia',
 
    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
}
sql.connect(config).then(() => {
    return sql.query`SELECT DISTINCT
    copia.OrderedPanel.labFillerOrderNumber,
    copia.panel.name,
    copia.OrderedPanel.orderedPanelKey,
    copia.OrderedPanel.labOrderedStamp,
    copia.Result.approvedStamp,
    copia.OrderedPanel.isCancelled,
    copia.staff.firstName as [Provider First],
    copia.staff.lastName as [Provider Last],
    copia.patient.firstName as [Patient First],
    copia.patient.lastName as [Patient Last]
    FROM copia.OrderedPanel
        LEFT JOIN copia.result ON copia.orderedpanel.orderedPanelKey = copia.result.orderedPanelKey
        LEFT JOIN copia.specimen ON copia.orderedpanel.specimenKey = copia.specimen.specimenKey
        LEFT JOIN copia.staff ON copia.specimen.orderingPhysicianKey = copia.staff.staffKey
        LEFT JOIN copia.requisition ON copia.result.requisitionKey = copia.Requisition.requisitionKey
        LEFT JOIN copia.Patient ON copia.requisition.patientKey = copia.patient.patientKey
        LEFT JOIN copia.Panel ON copia.orderedpanel.panelKey = copia.panel.panelKey
    WHERE copia.orderedPanel.isCancelled=0 AND copia.patient.isTestPatient=0 and copia.result.approvedStamp > 1562621408000
    ORDER BY approvedStamp`
}).then(result => {
    console.log("done with query")
    //var dateString = moment.unix(value).format("MM/DD/YYYY");
    //put for loop here to process into datetime, and do other data processing
    results.push(moment.unix(result.recordset[0].approvedStamp/1000).format("DD MMM YYYY hh:mm a"),moment.unix(result.recordset[1].approvedStamp/1000).format("DD MMM YYYY hh:mm a"),moment.unix(result.recordset[2].approvedStamp/1000).format("DD MMM YYYY hh:mm a"));
}).catch(err => {
    console.log(err);// ... error checks
})
sql.on('error', err => {
    console.log(err);// ... error handler
})

var results =[];

app.get('/', (req, res) => res.send(results));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
