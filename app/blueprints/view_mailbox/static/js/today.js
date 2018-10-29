function PieChart3D(chartID, json, isTotal, title, subtitle) {
	// Customize Pie Chart Color
	Highcharts.setOptions({
     colors: isTotal ? ['#BA3C3D', '#7E5686', '#3498db ', '#839192'] : [' #F8A13F ', '#A5AAD9', '#00CCFF', '#CCCCFF']
	});

	Highcharts.chart(chartID, {
		chart: {
			type: 'pie',
			plotBackgroundColor: null,
			options3d: {
				enabled: true,
				alpha: 45,
				beta: 0
			},
			animation: false  // Disable chart.animation, while keeping the default drilldown.animation, otherwise drilldown doesn't work properly with 3d chart
		},
		title: {
			text: title
		},
		 subtitle: {
			text: subtitle
    },
		tooltip: {
			headerFormat: '<b>{series.name}</b><br>',
			pointFormat: isTotal? '{point.name}: {point.y:,.2f} ({point.percentage:.1f}%)' : '{point.name}: <b>{point.y:,.0f} ({point.percentage:.1f}%)</b>'
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				innerSize: 50,
				depth: 35,
				dataLabels: {
					enabled: true,
					distance: -35,
					color: 'black',
					format: isTotal? '<span style="font-size:1rem;color:blue">${point.y:,.2f}</span>':'<span style="font-size:1rem">{point.y:,.0f}</span>'
				},
				showInLegend: true,
			}
		},
		series: [{
				name: isTotal ? "Daily Mail Total" : "Daily Mail Count",
				colorByPoint: true,
				data: [
					{
						name: "Donation",
						y: isTotal ? ((json.TotalDCaCh+json.TotalDCC)===0?null:(json.TotalDCaCh+json.TotalDCC)) : ((json.NoDCaCh+json.NoDCC)===0?null:(json.NoDCaCh + json.NoDCC)) ,
						drilldown: "Donation"
					},
					{
						name: "Merchandise",
						y: isTotal ? ((json.TotalMCaCh+json.TotalMCC)===0?null:(json.TotalMCaCh+json.TotalMCC)) : ((json.NoMCaCh+json.NoMCC)===0?null:(json.NoMCaCh+json.NoMCC)),
						drilldown: "Merchandise"
					},
					{
						name: "List",
						y: isTotal ? (json.TotalList === 0 ? null : json.TotalList) : (json.NoList === 0 ? null : json.NoList),
						drilldown: null
					},
					{
						name: "Other",
						y: isTotal ? (json.TotalOther === 0 ? null : json.TotalOther) : (json.NoOther === 0 ? null : json.NoOther),
						drilldown: null
					}
				]
		}],
		drilldown: {
			series: [{
				name: "Payment Type(Donation)",
				id: "Donation",
				colorByPoint: true,
				data: [{
					name: "Cash and Cheque",
					color: '#c1d82f',
					y: isTotal ? json.TotalDCaCh : json.NoDCaCh
				}, {
					name: "Credit Card",
					color: '#30c39e',
					y: isTotal ? json.TotalDCC : json.NoDCC
				}]
			},{
				name: "Payment Type(Merchandise)",
				id: "Merchandise",
				colorByPoint: true,
				data: [{
					name: "Cash and Cheque",
					color: '#c1d82f',
					y: isTotal ? json.TotalMCaCh : json.NoMCaCh
				}, {
					name: "Credit Card",
					color: '#30c39e',
					y: isTotal ? json.TotalMCC : json.NoMCC
				}]
			}]
		}
	});
}

let cht = [{vChtID: 'today11', nChtID: 'today21'}, {vChtID: 'today12', nChtID: 'today22'}, {vChtID: 'today13', nChtID: 'today23'}]
for (let i=0; i<cht.length; i++) {
	fetchJSON(endpoint('/api/mailbox/today/', i+''), function(json){
		let title, subtitle;
		// Today 1 Value and Count
		title = (json.Recorder == null ? 'No Opener found on '+dAU(new Date(json.Date)): '' + currency(json.Total) + ' from ' + dAU(new Date(json.Date)));
		subtitle =  json.Recorder == null ? 'No Opener found' : 'Opened by ' + json.Recorder + (json.Cash == null || json.Cash === 0 ? ', no cash found' :', cash received: ' + currency(json.Cash)) ;
		PieChart3D(cht[i].vChtID, json, true, title, subtitle);

		title = (json.Recorder == null ? 'No Opener found on '+dAU(new Date(json.Date)) : '' + json.No + ' items from ' + dAU(new Date(json.Date)));
		subtitle =  json.Recorder == null ? 'No Opener found' : 'Opened by ' + json.Recorder ;
		PieChart3D(cht[i].nChtID, json, false, title, subtitle);
	});
}
