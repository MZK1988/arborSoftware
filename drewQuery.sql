USE [Copia Drew]
GO

/****** Object:  View [dbo].[View_All_Orders]    Script Date: 9/19/2019 4:28:48 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



ALTER view [dbo].[View_All_Orders]
as


    with
        Result
        as
        (
            select
                res.[orderedPanelKey]
, res.[approvedStamp]
, cast(DATEADD(hh, -6, DATEADD(s, res.approvedStamp/1000,'1970-01-01 00:00:00')) as date) as [Approved Date]
, format(cast(DATEADD(hh, -6, DATEADD(s, res.approvedStamp/1000,'1970-01-01 00:00:00')) as date), 'MM/01/yyyy')as [Approved Date Month]	   
, ROW_NUMBER() OVER (PARTITION BY res.[orderedPanelKey]  ORDER BY res.approvedStamp asc ) AS [row]
            From [ARBORCP1].[Copia].[Copia].result res
            where
res.approvedStamp > 0 -- Remove bad Approved dates
                and res.valueToReport = 1
        ),

        Bill
        as
        
        (
            SELECT [createStamp]
      , [isActive]
      , [isDefault]
      , [name]
      , [patientBillingGroupKey]
      , [patientKey]
      , [updateStamp]
      , [updateVersion]
            FROM [ARBORCP1].[Copia].[Copia].[PatientBillingGroup]
            where [isActive] = 1 and [isDefault] = 1
        )


    SELECT
        subs.id as labFillerOrderNumber

		--iif(op.labParentFillerOrderNumber ='',op.labFillerOrderNumber, op.labParentFillerOrderNumber) as labFillerOrderNumber--OrderPanel
		, op.labFillerOrderNumber as [labFillerOrderNumberOriginal]
		, op.labParentFillerOrderNumber
	   , op.specimenKey
	   , p.[name] as [Order Choice]
       , pat.ID1 [Copia ID]
	   --,pat.firstName+' '+pat.lastName as [Patient Name]
       , pt.[name] as [Order Type]
	   , case when pt.[name] = 'AP Sendout' then 'Sendout'
	         when pt.[name] = 'GeneticsC' then 'Genetics'
	         when pt.[name] = 'Urinalysis' then 'Micro'
	         when pt.[name] = 'MolecularC' then 'Molecular'
			 else pt.[name]
			 end as [Order Type Rollup]

	   , ptr.[Ranking] as [PT_Ranking]
       , o.[NAME] [Practice]
       , st.lastName + ', ' + st.firstname AS [Ordering Physician]
	   , ip.[name] as [Primary Insurance]

	   , i.policyID as [Primary Policy ID]
	   , i.groupname as [Primary Group Name]
	   , i.groupID as [Primary Group ID]
	   , ioc.name as [Fin Class] 
       , iif(r.proposeddrawstamp=-63082522800000,null,r.proposeddrawstamp) as proposeddrawstamp
       , cast(DATEADD(hh, -6, DATEADD(s,  iif(r.proposeddrawstamp=-63082522800000,null,r.proposeddrawstamp)/1000,'1970-01-01 00:00:00')) as date) as [Collected Date]
	    , dbo.getweek(cast(DATEADD(hh, -6, DATEADD(s,  iif(r.proposeddrawstamp=-63082522800000,null,r.proposeddrawstamp)/1000,'1970-01-01 00:00:00')) as date)) as [Collected Date Week]
	   , format(cast(DATEADD(hh, -6, DATEADD(s,  iif(r.proposeddrawstamp=-63082522800000,null,r.proposeddrawstamp)/1000,'1970-01-01 00:00:00')) as date), 'MM/01/yyyy')as [Collected Date Month]
	   , dbo.getmonth(cast(DATEADD(hh, -6, DATEADD(s,  iif(r.proposeddrawstamp=-63082522800000,null,r.proposeddrawstamp)/1000,'1970-01-01 00:00:00')) as date)) as [Collected Date Month2]
	   , datepart(hh,DATEADD(hh, -6, DATEADD(s, r.orderforstamp/1000,'1970-01-01 00:00:00')))  as [Ordered Date Hour]
	   , cast(DATEADD(hh, -6, DATEADD(s, r.orderforstamp/1000,'1970-01-01 00:00:00')) as date) as [Ordered Date]
	   , dbo.getweek(cast(DATEADD(hh, -6, DATEADD(s, r.orderforstamp/1000,'1970-01-01 00:00:00')) as date)) as [Ordered Date Week]
	   , format(cast(DATEADD(hh, -6, DATEADD(s, r.orderforstamp/1000,'1970-01-01 00:00:00')) as date), 'MM/01/yyyy')as [Ordered Date Month]

	   , res.[Approved Date]
	   , res.[Approved Date Month]
	   --,sm.[Sales Rep]
	   , pat.lastName + ', ' + pat.firstName as [Patient Name]
	   --,i.patientBillingGroupKey
	   , pat.patientKey
	  -- ,r.patientBillingGroupKey
	  , ta.[Total Payment]
	  --,ROW_NUMBER() OVER (PARTITION BY p.[name],op.specimenKey  ORDER BY op.specimenKey asc ) AS [Dup>1]
	  --,ROW_NUMBER() OVER (PARTITION BY p.[name],op.specimenKey  ORDER BY op.specimenKey asc ) AS [Accession>1]
	  --,ROW_NUMBER() OVER (PARTITION BY subs.id  ORDER BY subs.id asc ) AS [Accession>1] op.labFillerOrderNumber
	  --,ROW_NUMBER() OVER (PARTITION BY op.labFillerOrderNumber  ORDER BY op.labFillerOrderNumber asc ) AS [Accession>1] 
	  , o.organizationKey
	  , isnull(hs.[Test Group],'Not PAP') as [Test Group]
	  , case when hs.[Test Group] = 'Pap'then 1 else 0 end as [Pap Count]
	  , case when hs1.[Test Group] = 'HPV' then 1 else 0 end as [HPV Count]
	 , case when hs2.[Test Group] = 'CT' then 1 else 0 end as [CT/NG Count]

	  
	  , case when p.[name]  like '%Pap%' then 1 else Null end as [Pap Countold]
	  , case when p.[name]  like '%HPV%' then 1 else Null end as [HPV Countold]
	 , case when p.[name]  like '%CT[/]%' then 1
		   when p.[name]  like '% CT%' then 1
		   when p.[name]  like '%chla%' then 1
		    when p.[name]  like '%neis%' then 1
		   when p.[name]  like '%CT %' then 1 else Null end as [CT/NG Countold]
	 , case when p.[name]  like '%Pap%' then 'Pap' else 'Not PAP' end as [Test Groupold]
	 

	  , pat.patientKey as [patket]
	  , sp.patientKey as[Spec Patkey]
	  , op.specimenKey as [opspeckey]
	  , op.requisitionkey as [op.reqkey]
	  , r.requisitionkey 

	  , r.patientBillingGroupKey as [resulkpatbillingkey]
	  , i.[position] 
	  , i.patientBillingGroupKey
	  , i.insurancePlanKey
	  , ip1.insurancePlanKey as [ip.insplankey]
	 , pat.birthDateYear as [Bday Year]
	 , convert(varchar(10),concat(pat.birthDatemonth,'/',pat.birthDateday,'/',pat.birthDateYear),101) as [PT DOB]
	 --,cast(concat(pat.birthDatemonth,'/',pat.birthDateday,'/',pat.birthDateYear) as date) as [PT DOB]
	-- ,concat(cast(concat(pat.birthDatemonth,'/',pat.birthDateday,'/',pat.birthDateYear) as date),cast(DATEADD(hh, -6, DATEADD(s, r.proposeddrawstamp/1000,'1970-01-01 00:00:00')) as date)) as [DOBDOS]


		, iif(rst.username is null, '',rst.username) as [Entered By]
		, r.requisitionnumber as [Order ID]
		, C.[Description] as [SalesRepNames]
		, l.ID as Locationcode
		, l.name as locationname
		, c.code as [TeclorClientCode]
		, p.panelkey
		, op.panelkey as [orderpanelkey]
		, ins_t.[name] as [Insruance Type]

    --select * from [ARBORCP1].[Copia].[Copia].organization where name like 'complete wom%'

    --select * from [216.58.227.152,50008].[L0132_Replication].[dbo].[tblClient] 

    FROM [ARBORCP1].[Copia].[Copia].Patient pat
        left join [ARBORCP1].[Copia].[Copia].organization o ON pat.organizationkey = o.organizationkey
        left join [ARBORCP1].[Copia].[Copia].Specimen sp ON sp.patientKey = pat.patientKey
        left join [ARBORCP1].[Copia].[Copia].OrderedPanel op ON op.specimenKey = sp.specimenKey
        left join [ARBORCP1].[Copia].[Copia].Requisition r ON r.requisitionkey = op.requisitionkey
        left join [ARBORCP1].[Copia].[Copia].[Location] L on L.locationKey = r.orderingLocationKey
        left join [Telcor Data].[dbo].[ClientSales] C on L.ID=C.Code
        --left join [ARBORCP1].[Copia].copia.subSpecimen  Subs on Subs.specimenKey= sp.specimenKey
        left join [Copia Drew].[dbo].[subSpecimen] Subs on Subs.specimenKey= sp.specimenKey

        left join [ARBORCP1].[Copia].[Copia].panel p on op.panelkey = p.panelkey
        left join [ARBORCP1].[Copia].[Copia].panel_paneltype_map ppm on ppm.panelkey = p.panelkey
        inner join [ARBORCP1].[Copia].[Copia].paneltype pt on ppm.paneltypekey = pt.paneltypekey
        left join [ARBORCP1].[Copia].[Copia].Staff st ON st.staffKey = sp.orderingPhysicianKey
        LEFT JOIN [ARBORCP1].[Copia].[Copia].Staff rst ON r.placerKey = rst.staffKey
        --left join [ARBORCP1].[Copia].[Copia].PatientBillingGroup bg on bg.patientKey = pat.patientKey
        left join bill on bill.[patientKey] = pat.patientKey
        left join [ARBORCP1].[Copia].[Copia].PatientInsurance i on i.[patientBillingGroupKey] = bill.[patientBillingGroupKey] and i.position=0 --Primary only --and i.[effectiveDate] >= r.proposeddrawstamp and iif(i.[expirationDate]='-63082522800000',6308252280,i.[expirationDate]) <= r.proposeddrawstamp
        left join [ARBORCP1].[Copia].[Copia].InsurancePlan ip1 on ip1.insurancePlanKey=i.insurancePlanKey
        left join [ARBORCP1].[Copia].[Copia].InsurancePlan ip on ip.insurancePlanKey=iif(ip1.mappedSystemInsPlanKey=-1,ip1.insurancePlanKey,ip1.mappedSystemInsPlanKey)

        left join [ARBORCP1].[Copia].[Copia].InsuranceCo ioc on ioc.insuranceCoKey=ip.insuranceCoKey
        left join [ARBORCP1].[Copia].[Copia].[InsuranceType] ins_t on ins_t.[insuranceTypeKey]=ioc.[insuranceTypeKey] -- use this for fin class. aka ins type
        left join result res on res.[orderedPanelKey] = op.[orderedPanelKey] and res.[row]=1
        left join [Copia Drew].[dbo].[SalesMappings] sm ON o.organizationKey = sm.copiaorganizationKey
        left join [Telcor Data].[dbo].[PaymentAccession] ta on ta.[Accession #]=subs.id
        left join [Harvest].[dbo].[Table_Harvest_Sample] hs on hs.[Sample ID]=subs.id and hs.[test group] = 'PAP'--op.labFillerOrderNumber 
        left join [Harvest].[dbo].[Table_Harvest_Sample] hs1 on hs1.[Sample ID]=subs.id and hs1.[test group] = 'HPV'
        left join [Harvest].[dbo].[Table_Harvest_Sample] hs2 on hs2.[Sample ID]=subs.id and hs2.[test group] = 'CT'
        left join [Copia Drew].[dbo].[PanelTypeRanking] PTR on PTR.paneltypekey = ppm.paneltypekey

    WHERE 
       
       op.isCancelled = 0 --Exclude cancelled orders
        and r.CanceledStamp < 0 -- Exclude cancel reqs
        and pat.istestpatient = 0 --Exclude test patients
        and o.id != 'TEST' --Exclude test practice
        -- and r.proposeddrawstamp > 0 -- Remove bad collection dates
        --and ip1.mappedSystemInsPlanKey = 89
        -- and r.requisitionnumber = '1001-Oaks-20181105'
        and p.panelKey = op.panelKey
        AND p.panelkey = ppm.panelkey
        AND ppm.paneltypekey = pt.paneltypekey
        AND op.requisitionKey = r.requisitionKey
        AND r.drawCompletedStamp > 0
        -- and op.[labpanelcode] not in ('181003_DEL','PD1618','RD1618','HPVABN_DEL','RHPVGT_DEL','RASCUS_DEL','RASCUSLG_DEL','RGTIFPOS_DEL')
        and p.[name] not like '%[[i]]%'
















GO


