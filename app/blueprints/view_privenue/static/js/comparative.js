console.log(cfy, budget,json);

// Create the crossfilter represents the multi-dimensional data set
const cs = crossfilter(json);
console.log('crossfilter size(no.rows): ',cs.size());
// Constructs a new dimension using the specified value accessor function.
const dimFY = cs.dimension(d=>d['FY'])
	,dimFYMTH = cs.dimension(d=>d['FYMTH'])
	,dimLTD = cs.dimension(d=>d['ISLTD'])
	,dimTRX = cs.dimension(d=>d['ISTRX'])
	,dimSTREAM = cs.dimension(d=>d['STREAM'])
	,dimCAMPAIGN = cs.dimension(d=>d['CAMPAIGNCODE'])
	,dimPLEDGETYPE = cs.dimension(d=>d['PLEDGETYPE'])
;
const mesTrxCount = dimTRX.group().reduceCount()
;

console.log(Date.parse(json[0]['DATEOFPAYMENT']));

console.log(json.filter(row => row['FY'] === cfy).sum("PAYMENTAMOUNT").toFixed(2));
console.log(json.filter(row => row['FY'] === (cfy -1) ).sum("PAYMENTAMOUNT").toFixed(2));


dimFY.filter(cfy);
// dimFYMTH.filter(2);
dimSTREAM.filter('Fundraising');

console.log('CFY TOTAL:', cs.groupAll().reduceSum(fact => fact['PAYMENTAMOUNT']).value().toFixed(2));
console.log('CFY PAYMENTS:', cs.groupAll().reduceCount().value());





console.log(stream.monthlyDataTLMA);

let dataTLMA = [];
//ADD Budget
dataTLMA.push({
	name: 'FY' + cfy +' Budget',
	stack: 'CFY',
	color: 'rgba(168,36,0,0.6)',
	tooltip: {
		valuePrefix: '$',
		valueSuffix: ' AUD'
	},
	pointPadding: 0.12,
	pointPlacement: -0.22,
	data: budget['FY'][cfy]['TLMA']
});
// Add CFY Total
dataTLMA.push({
	name: 'FY' + cfy +' Actual',
	stack: 'CFY',
	color: '#00ff00',
	tooltip: {
		valuePrefix: '$',
		valueSuffix: ' AUD'
	},
 	pointPadding: 0.3,
	pointPlacement: -0.22,
	data: totalCFY
});



console.log(dataTLMA);

const  drawOverlappingColumnChart = obj => {
	Highcharts.chart(obj.renderTo, {
	chart: {
	type: 'column'
	},
	title: {
	text: obj.title
	},
	subtitle: {
	text: stamp
	},
	legend: {
	shadow: false
	},
	tooltip: {
	shared: false
	},
	plotOptions: {
		column: {
			grouping: false,
			shadow: false,
			borderWidth: 0,
			stacking: obj.stacking
		}
	},
	yAxis:{
	title: {
	text: obj.yAxisTitle
	}
	},
	xAxis: {
	categories: obj.categories
	},
	credits: {
	enabled: false
	},
	series: obj.data
	});
}


let resetColumnPlacement = (arr, backgroundStackName) => {
	let dupArr = JSON.parse(JSON.stringify(arr));
	dupArr.forEach((obj) => {
		if (obj.stack === backgroundStackName) {
			obj['pointPadding'] = 0;
		} else {
			obj['pointPadding'] = 0.2;
		}
		delete obj['pointPlacement'];
	});
	return dupArr
};



drawOverlappingColumnChart({
	renderTo: 'chart0',
	title: 'Month on Month LTD',
	yAxisTitle: 'Total Monthly Revenue (AUD)',
	categories: $FY_MONTH_LIST_NAME,
	stacking: null,
	data: stream.monthlyDataTLMA
});


drawOverlappingColumnChart({
	renderTo: 'chart1',
	title: '3 Major Revenue Streams Month on Month Budget vs Actual Stacking',
	yAxisTitle: 'Total Monthly Revenue (AUD)',
	categories: $FY_MONTH_LIST_NAME,
	stacking: 'normal',
	data: resetColumnPlacement(stream.monthlyDataCFY, 'Budget')
});

drawOverlappingColumnChart({
	renderTo: 'chart2',
	title: '3 Major Revenue Streams Cumulative Budget vs Actual Stacking',
	yAxisTitle: 'Total Cumulative Revenue (AUD)',
	categories: $FY_MONTH_LIST_NAME,
	stacking: 'normal',
	data: resetColumnPlacement(stream.monthlyDataCumsumCFY, 'Budget')
});


drawOverlappingColumnChart({
	renderTo: 'chart3',
	title: '3 Major Revenue Streams Month on Month Budget vs Actual Spread',
	yAxisTitle: 'Total Monthly Revenue (AUD)',
	categories: $FY_MONTH_LIST_NAME,
	stacking: null,
	data: sortByAttribute(stream.monthlyDataCFY, 'entered')
});

drawOverlappingColumnChart({
	renderTo:'chart4',
	title:'3 Major Revenue Streams Cumulative Budget vs Actual',
	yAxisTitle: 'Total Cumulative Revenue (AUD)',
	categories: $FY_MONTH_LIST_NAME,
	stacking: null,
	data: sortByAttribute(stream.monthlyDataCumsumCFY, 'entered')
});

drawOverlappingColumnChart({
	renderTo: 'chart6',
	title: '3 Major Revenue Streams Month on Month Actual FULL LFY vs CFY',
	yAxisTitle: 'Total Monthly Revenue (AUD)',
	categories: $FY_MONTH_LIST_NAME,
	stacking: null,
	data: stream.monthlyDataLFY
});

drawOverlappingColumnChart({
	renderTo: 'chart7',
	title: '3 Major Revenue Streams Cumulative Actual FULL LFY vs CFY',
	yAxisTitle: 'Total Cumulative Revenue (AUD)',
	categories: $FY_MONTH_LIST_NAME,
	stacking: null,
	data: stream.monthlyDataCumsumLFY
});




function drawVariablePie(obj){
	Highcharts.chart(obj.renderTo, {
	chart: {
	type: 'variablepie'
	},
	title: {
	text: obj.title
	},
	subtitle: {
	text: stamp
	},
	tooltip: {
	headerFormat: '',
	pointFormat: '<span style="color:{point.color}">\u25CF</span><b> {point.name}</b><br/>' +
		'Total Revenue: $<b>{point.y}</b>	(<span style="color:blue">{point.percentage:.1f}%</span>)<br/>' +
		'Number of Related Transactions: <b>{point.z:,0f}</b><br/>'
	},
	plotOptions: {
	variablepie: {
	allowPointSelect: true,
	cursor: 'pointer',
	innerSize: 50,
	depth: 35,
	dataLabels: {
		enabled: true,
		distance: 10,
		color: 'black',
		format: '{point.name}:<br><span style="font-size:0.6rem; color:{point.color}">${point.y:,f}</span><br><span style="font-size:0.6rem;}">({point.percentage:.1f}%)</span>'
	},
	showInLegend: false,
	}
	},
	series: [{
	minPointSize: 10,
	innerSize: '20%',
	zMin: 0,
	name: obj.seriesName,
	data: obj.data
	}]
	});
}

drawVariablePie({
	renderTo: 'chart5',
	title: '3 Major Revenue Streams CFY Total Nightingale Chart (Area: Total, Radius: No.Transactions)',
	seriesName: '3 Major Revenue Streams',
	data: stream.streamDataCFY
});

drawVariablePie({
	renderTo: 'chart8',
	title: '3 Major Revenue Streams FULL LFY Total Nightingale Chart (Area: Total, Radius: No.Transactions)',
	seriesName: '3 Major Revenue Streams',
	data: stream.streamDataLFY
});
