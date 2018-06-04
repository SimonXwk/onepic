const endpoint = '/api/cash/fys';
let valueChart1 =
  Highcharts.chart('fyTotal', {
    chart: {
        type: 'line',
	    scrollablePlotArea: {
            minWidth: 320
        }
    },
    credits: {
      text: 'ⒸThe Leprosy Mission Australia',
      href: '#',
      enabled: true
    },
    title: {
        text: 'ALL Financial Years\' Full Year Total'
    },
    subtitle: {
        text: 'API :' + endpoint
    },
    // xAxis: {
    //     categories: []
    // },
    yAxis: {
        title: {
            text: 'Total (AUD)'
        }
    },
    series: []
});


function updateChart(chart, endpoint){
  fetch(endpoint).then(function(response){
    response.json().then(function (json) {
      console.log(json);
      this.chart.addSeries({
        name: 'FY total',
        data: json.total
      });
      this.chart.update({
	    xAxis: {
		        categories: json.fy
        },
        tooltip: {
	        headerFormat: '<b>FY + {series.name}</b><br>',
	        pointFormat: '{point.x:%e. %b}: {point.y:.2f} m'
        },
      });

    })
  });
}

updateChart(valueChart1, endpoint);














