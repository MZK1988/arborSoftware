SELECT DISTINCT
copia.OrderedPanel.orderedPanelKey,
copia.OrderedPanel.labOrderedStamp,
copia.Result.approvedStamp,
copia.OrderedPanel.isCancelled,
copia.OrderedPanel.labFillerOrderNumber,
copia.staff.firstName as [Provider First],
copia.staff.lastName as [Provider Last]
FROM copia.OrderedPanel
	LEFT JOIN copia.result ON copia.orderedpanel.orderedPanelKey = copia.result.orderedPanelKey
	LEFT JOIN copia.specimen ON copia.orderedpanel.specimenKey = copia.specimen.specimenKey
	LEFT JOIN copia.staff ON copia.specimen.orderingPhysicianKey = copia.staff.staffKey
	LEFT JOIN copia.requisition ON copia.result.requisitionKey = copia.Requisition.requisitionKey
	LEFT JOIN copia.Patient ON copia.requisition.patientKey = copia.patient.patientKey
WHERE copia.orderedPanel.isCancelled=0 AND copia.patient.isTestPatient=0 and copia.result.approvedStamp > 1562621408000
ORDER BY approvedStamp;