SELECT DISTINCT
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
ORDER BY approvedStamp;