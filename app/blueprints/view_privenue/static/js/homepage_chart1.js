const endpoint1 = '/api/cash/fys';
const endpoint2 = '/api/cash/fysltd';
const endpoint3 = '/api/cash/cfy/stream';
const cfy = today.getMonth()+1 < 7 ? today.getFullYear() : today.getFullYear()+1;

let valueChart1 =
  Highcharts.chart('fyTotal', {
    chart: {
        type: 'line',
	    scrollablePlotArea: {
            minWidth: 320
        }
    },
    credits: {
      text: 'ⒸTLMA',
      href: '',
      enabled: true
    },
    title: {
        text: 'ALL Financial Years\' Total'
    },
    xAxis: {
        categories: []
    },
    yAxis: {
        title: {
            text: 'Total (AUD)'
        }
    },
    series: []
});

let valueChart2 =
  Highcharts.chart('fyTotalLtd', {
    // chart: {
    //     type: 'column',
	 //    scrollablePlotArea: {
    //         minWidth: 320
    //     }
    // },
    credits: {
      text: 'ⒸTLMA',
      href: '',
      enabled: true
    },
    title: {
        text: 'FY' + cfy + ' Cash Revenue Stream Sankey Chart'
    },
     series: [{
        type: 'sankey',
        name: 'TLMA Platform to TQ RevenueType',
        keys: ['from', 'to', 'weight'],
        data: []
    }]
});


function updateLineChart(chart, endpoint, seriesName){
  fetch(endpoint).then(function(response){
    response.json().then(function (json) {
      // console.log(json);
      chart.addSeries({
        name: seriesName,
        data: json.total
      });
      chart.update({
        subtitle: {
            text: 'Data Captured : ' + json.timestamp
        },
	    xAxis: {
		        categories: json.fy
        },
        tooltip: {
	        shared: true,
            crosshairs: true,
	        headerFormat: '<b>{series.name}</b><br>',
	        pointFormat: '{point.x:%e. %b}: {point.y:.2f} m'
        },
      });

    })
  });
}

updateLineChart(valueChart1, endpoint1, 'Full FY');
updateLineChart(valueChart1, endpoint2, 'TLD');



function updateSankeyChart(chart, endpoint){
  fetch(endpoint).then(function(response){
    response.json().then(function (json) {
      // console.log(json);
      chart.update({
        subtitle: {
            text: 'Data Captured :' + json.timestamp
        },
        series: [{
            type: 'sankey',
            name: 'TLMA Revenue Streams',
            keys: ['from', 'to', 'weight'],
            data: json.sankey
        }]
      });
    })
  });
}


updateSankeyChart(valueChart2, endpoint3);









