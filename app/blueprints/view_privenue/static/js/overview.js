let basciOptions = {
	chart: {
		type: 'spline',
	},
	xAxis: {
		gridLineWidth: 0.8,
		categories: []
	},
	yAxis: [{
		title: {
			text: null,  // 'Full Financial Year Total (AUD)'
			style: {
				color: '#003399'
			}
		},
		visible: true
	},{
		title: {
			text: 'Life to Date Total (AUD)',
			style: {
				color: '#456ACF'
			}
		},
		visible: false,
		opposite: true
	}],
	tooltip: {
		headerFormat: '<span style="font-size:16px">FY{point.key}</span><table>',
		footerFormat: '</table>',
		shared: true,
		useHTML: true
 },
	series: []
};


let cht1 = Highcharts.chart(Object.assign(basciOptions, {
	chart: {
		renderTo: 'fyValues',
	},
	title: {
		text: 'Total Private Revenue by Financial Years'
	},
	tooltip: {
		pointFormat: '<tr><td style="color:{series.color};padding:0;font-weight: bold">{series.name}: </td>' +
			'<td style="padding:0;text-align: right;"><b>{point.y:,.2f}</b></td></tr>',
 },
}));

let cht2 = Highcharts.chart(Object.assign(basciOptions, {
	chart: {
		renderTo: 'fyTrxs',
	},
	title: {
		text: 'Total Number of Transactions by Financial Years'
	},
	tooltip: {
		pointFormat: '<tr><td style="color:{series.color};padding:0;font-weight: bold">{series.name}: </td>' +
			'<td style="padding:0;text-align: right;"><b>{point.y:,.0f}</b></td></tr>',
 },
}));




// Fetching Data from API and draw charts
fetchJSON(endpoint('/api/tq/fys_total_full'), function(json){
	let fys = json.rows.map(r => r.FY);
	let fyTotals = json.rows.map(r => r.TOTAL);
	let hisTotalAvg =  Number((fyTotals.slice(0, -1).reduce((a,c) => a+=c) / fyTotals.length).toFixed(2));
	let l5TotalAvg =  Number((fyTotals.slice(-6, -1).reduce((a,c) => a+=c) / 5).toFixed(2));
	let l10TotalAvg =  Number((fyTotals.slice(-11, -1).reduce((a,c) => a+=c) / 10).toFixed(2));

	let fyTrxs = json.rows.map(r => r.TRXS);
	let hisTrxAvg =  Number((fyTrxs.slice(0, -1).reduce((a,c) => a+=c) / fyTrxs.length).toFixed(0));
	let l5TrxAvg =  Number((fyTrxs.slice(-6, -1).reduce((a,c) => a+=c) / 5).toFixed(0));
	let l10TrxAvg =  Number((fyTrxs.slice(-11, -1).reduce((a,c) => a+=c) / 10).toFixed(0));

	cht1.addSeries({
		name: 'Full FY',
		color: '#003399',
		yAxis: 0,
		data: fyTotals
	});
	cht1.addSeries({
		name: 'HistFY Avg',
		color: 'rgb(122,184,0,0.6)',
		yAxis: 0,
		lineWidth: 1,
		data: fyTotals.map(d => ({y:hisTotalAvg, marker:{enabled: false}}))
	});
	cht1.addSeries({
		name: 'L10FY Avg',
		color: 'rgb(174,99,228,0.6)',
		yAxis: 0,
		lineWidth: 1,
		data: fyTotals.map(d => ({y:l10TotalAvg, marker:{enabled: false}}))
	});
	cht1.addSeries({
		name: 'L5FY Avg',
		color: 'rgb(113,198,193,0.6)',
		yAxis: 0,
		lineWidth: 1,
		data: fyTotals.map(d => ({y:l5TotalAvg, marker:{enabled: false}}))
	});
	cht1.update({
		subtitle: {
			text: 'Data Captured : ' +  new Date(json.timestamp).toLocaleDateString("en-AU", {year: 'numeric', month: 'long', day: 'numeric', hour:'numeric', minute:'numeric', second:'numeric'})
		},
		xAxis: {
			categories: fys
		}
	});


	cht2.addSeries({
		name: 'Full FY',
		color: '#003399',
		yAxis: 0,
		data: fyTrxs
	});
	cht2.addSeries({
		name: 'HistFY Avg',
		color: 'rgb(122,184,0,0.6)',
		yAxis: 0,
		lineWidth: 1,
		data: fyTrxs.map(d => ({y:hisTrxAvg, marker:{enabled: false}}))
	});
	cht2.addSeries({
		name: 'L10FY Avg',
		color: 'rgb(174,99,228,0.6)',
		yAxis: 0,
		lineWidth: 1,
		data: fyTrxs.map(d => ({y:l10TrxAvg, marker:{enabled: false}}))
	});
	cht2.addSeries({
		name: 'L5FY Avg',
		color: 'rgb(113,198,193,0.6)',
		yAxis: 0,
		lineWidth: 1,
		data: fyTrxs.map(d => ({y:l5TrxAvg, marker:{enabled: false}}))
	});
	cht2.update({
		subtitle: {
			text: 'Data Captured : ' +  new Date(json.timestamp).toLocaleDateString("en-AU", {year: 'numeric', month: 'long', day: 'numeric', hour:'numeric', minute:'numeric', second:'numeric'})
		},
		xAxis: {
			categories: fys
		}
	});
});

fetchJSON(endpoint('/api/tq/fys_total_ltd'), function(json){
	let fys = json.rows.map(r => r.FY);
	let fyTotals = json.rows.map(r => r.TOTAL);
	let orderedTotalUniques = Array.from(new Set(fyTotals)).sort((p,n) => - p + n);
	let fyTrxs = json.rows.map(r => r.TRXS);
	let orderedTrxUniques = Array.from(new Set(fyTrxs)).sort((p,n) => - p + n);
	cht1.addSeries({
		name: 'LTD',
		color: 'rgb(69,106,207,0.7)',
		yAxis: 0,
		type: 'column',
		data: fyTotals.map((v, i, self) => {
			if (v === Math.max(...self)) {
				return {y: v, color: 'rgb(201,81,12,0.7)'}
			}else if (v === orderedTotalUniques[1] ){
				return {y: v, color: 'rgb(255,120,0,0.7)'}
			}else if (v === orderedTotalUniques[2] ){
				return {y: v, color: 'rgb(255,205,0,0.7)'}
			}else{
				return v
			}
		})
	});
	cht1.update({
    subtitle: {
        text: 'Data Captured : ' + new Date(json.timestamp).toLocaleDateString("en-AU", {year: 'numeric', month: 'long', day: 'numeric', hour:'numeric', minute:'numeric', second:'numeric'})
    },
    xAxis: {
        categories: fys
    },
  });

	cht2.addSeries({
		name: 'LTD',
		color: 'rgb(69,106,207,0.7)',
		yAxis: 0,
		type: 'column',
		data: fyTrxs.map((v, i, self) => {
			if (v === orderedTrxUniques[0]) {
				return {y: v, color: 'rgb(201,81,12,0.7)'}
			}else if (v === orderedTrxUniques[1]){
				return {y: v, color: 'rgb(255,120,0,0.7)'}
			}else if (v === orderedTrxUniques[2]){
				return {y: v, color: 'rgb(255,205,0,0.7)'}
			}else{
				return v
			}
		})
	});
	cht2.update({
    subtitle: {
        text: 'Data Captured : ' + new Date(json.timestamp).toLocaleDateString("en-AU", {year: 'numeric', month: 'long', day: 'numeric', hour:'numeric', minute:'numeric', second:'numeric'})
    },
    xAxis: {
        categories: fys
    },
  });
});
