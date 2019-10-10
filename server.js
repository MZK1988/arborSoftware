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
const results =[];
sql.connect(config).then(() => {
    return sql.query`SELECT DISTINCT
    copia.OrderedPanel.labFillerOrderNumber,
    copia.panel.name,
    copia.OrderedPanel.orderedPanelKey,
    copia.OrderedPanel.labOrderedStamp,
    copia.Result.approvedStamp,
    copia.OrderedPanel.isCancelled,
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
    ORDER BY approvedStamp`
}).then(result => {
    console.log("*********done with query********************")    
    for(i = 0; i < result.recordset.length; i++) {
        var specimenNumber = result.recordset[i].labFillerOrderNumber
        var labOrderedTime = moment.unix(result.recordset[i].labOrderedStamp/1000).format("DD MMM YYYY hh:mm a")
        var approvedTime = moment.unix(result.recordset[i].approvedStamp/1000).format("DD MMM YYYY hh:mm a")
        var orderCancelled = result.recordset[i].isCancelled
        var providerFirst = result.recordset[i].firstName
        var providerLast = result.recordset[i].lastName

        var terminalObject = {
            specimenNumber,
            labOrderedTime,
            approvedTime,
            orderCancelled,
            providerFirst,
            providerLast
        }

        results.push(terminalObject);
    }
    
}).catch(err => {
    console.log(err);// ... error checks
})
sql.on('error', err => {
    console.log(err);// ... error handler
})



app.get('/', (req, res) => res.send(results[0]));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
