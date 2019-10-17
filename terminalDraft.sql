SELECT DISTINCT
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
	--first and last filters
	AND copia.staff.firstName = 'Kelly'
	AND copia.staff.lastName = 'Rising'
	--fromDate
	AND copia.result.approvedStamp > 1570721408000
	--toDate
	AND copia.result.approvedStamp < 1571326208000
ORDER BY approvedStamp;