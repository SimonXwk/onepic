


// Radialize the colors
Highcharts.setOptions({
	lang: {
        thousandsSep: ','
    },
    colors: Highcharts.map(Highcharts.getOptions().colors, function (color) {
        return {
            radialGradient: {
                cx: 0.5,
                cy: 0.3,
                r: 0.7
            },
            stops: [
                [0, color],
                [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
            ]
        };
    })
});

// Create options object
function renderTodayMailOption(id) {
	return {
		chart: {
			renderTo: id,
			type: 'pie'
		},
		credits: {
			text: 'ⒸTLMA',
			href: '#',
			enabled: true
		},
		title: {
			text: 'Mail Opening'
		},
		subtitle: {
			text: ''
		},
		legend: {
	        layout: 'vertical',
	        align: 'right',
	        verticalAlign: 'middle'
        },
		"series": [{}],
		"drilldown": {
			"series": []
		}
	};
}



function updateChart(chart, endpoint){
  fetch(endpoint).then(function(response){
    // console.log(response);
    response.json().then(function (json) {
        // console.log(json);
		chart.update({
			title: {
				text:  (json.Recorder == null ? ' : No Mail Opened' : '' +  currency(json.Total) + ' opened by ' + json.Recorder + ' on ' + dAU(new Date(json.Date)))
			},
			subtitle: {
				text: (json.Cash == null ? 'No Cash Record' :'Cash Received: $' + json.Cash)
			},
			tooltip: {
				headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
				pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
			},
			plotOptions: {
				series: {
					dataLabels: {
						enabled: true,
						format: '{point.name} Total: {point.y:,.2f} ( {point.percentage:.1f}% )',
                        connectorColor: 'silver'
					}
				}
			},
			"series": [{
				"name": "Daily Cash",
				"colorByPoint": true,
				"data": [
					{
						"name": "Donation",
						"y": json.TotalDCaCh + json.TotalDCC,
						"drilldown": "Donation"
					},
					{
						"name": "Merchandise",
						"y": json.TotalMCaCh + json.TotalMCC,
						"drilldown": "Merchandise"
					},
					{
						"name": "Other",
						"y": json.TotalOther == 0 ? null : json.TotalOther,
						"drilldown": null
					},
					{
						"name": "List",
						"y": json.TotalList == 0 ? null : json.TotalList,
						"drilldown": null
					}
					],
				showInLegend: true
			}
			],
			"drilldown": {
				"series": [
				{
					"name": "Donation Payment Type",
					"id": "Donation",
					"data": [
						[
							"Cash and Cheque",
							json.TotalDCaCh
						],
						[
							"Credit Card",
							json.TotalDCC
						]
					]
				},
				{
					"name": "Merchandise Payment Type",
					"id": "Merchandise",
					"data": [
						[
							"Cash and Cheque",
							json.TotalMCaCh
						],
						[
							"Credit Card",
							json.TotalMCC
						]
					]
				},

				]
			}
		}); // End of Update
    })
  });
}

let cht1 = Highcharts.chart(renderTodayMailOption('today0'));
let cht2 = Highcharts.chart(renderTodayMailOption('today1'));
let cht3 = Highcharts.chart(renderTodayMailOption('today3'));

updateChart(cht1, endpoint('/api/mailbox/today/','0'));
updateChart(cht2, endpoint('/api/mailbox/today/','1'));
updateChart(cht3, endpoint('/api/mailbox/today/','2'));