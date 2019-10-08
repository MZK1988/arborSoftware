SELECT 
copia.result.resultKey,
copia.orderedpanel.orderedPanelKey,
copia.CPT.cPTKey,
copia.requisition.requisitionKey,
copia.specimen.specimenKey,
copia.test.testKey,
copia.patient.patientKey,
copia.orderedpanel.labFillerOrderNumber,
copia.orderedpanel.labParentFillerOrderNumber,
copia.Specimen.labOrderedStamp as [Lab Ordered Datetime],
copia.Result.approvedStamp as [Result Approved Datetime],
copia.Result.createStamp [Result Created Datetime],
copia.Staff.firstName as [Provider First],
copia.Staff.lastName as [Provider Last],
copia.Staff.NPID,
copia.Staff.professionalSuffix,
copia.patient.firstName as [Patient First],
copia.patient.lastName as [Patient Last],
copia.patient.birthTimestamp as [Patient Birth Datetime],
copia.organization.name as [Organization Name],
copia.patient.isTestPatient,
copia.orderedpanel.isCancelled as [orderIsCancelled],
copia.OrderedPanel_CPT_Map.cptCount,
copia.cpt.code as [CPT Code(s)],
copia.panel.name as [Panel Name],
copia.Result.labTestDescription,
copia.test.description,
copia.Result.techID [Approving Technician],
copia.Result.numericPart,
copia.Result.range,
copia.result.result,
copia.resultNote.note
FROM copia.Result
       LEFT JOIN copia.Test ON copia.result.testKey = copia.test.testKey
       LEFT JOIN copia.OrderedPanel ON copia.result.orderedPanelKey = copia.OrderedPanel.orderedPanelKey
       LEFT JOIN copia.ResultNote ON copia.result.resultKey = copia.ResultNote.resultKey
       LEFT JOIN copia.Requisition ON copia.result.requisitionKey = copia.Requisition.requisitionKey
       LEFT JOIN copia.Patient ON copia.requisition.patientKey = copia.patient.patientKey
       LEFT JOIN copia.Panel ON copia.orderedpanel.panelKey = copia.panel.panelKey
       LEFT JOIN copia.Specimen ON copia.orderedpanel.specimenKey = copia.specimen.specimenKey
       LEFT JOIN copia.Organization ON copia.requisition.organizationKey = copia.Organization.organizationKey
       LEFT JOIN copia.OrderedPanel_CPT_Map ON copia.orderedpanel.orderedPanelKey = copia.OrderedPanel_CPT_Map.orderedPanelKey
       LEFT JOIN copia.CPT ON copia.OrderedPanel_CPT_Map.cptKey = copia.CPT.cPTKey 
	   LEFT JOIN copia.staff ON copia.specimen.orderingPhysicianKey = copia.staff.staffKey
--where copia.orderedPanel.isCancelled=1 means cancelled
--only approximately 10,000/13mm records wherein the order is cancelled and a result is issued
--need to do the attachment mapping
--need to find ordering provider!
--need to get addresses
WHERE copia.orderedPanel.isCancelled=0 AND copia.patient.isTestPatient=0
--WHERE copia.result.approvedStamp = -63082522800000;
ORDER BY copia.result.approvedStamp;
