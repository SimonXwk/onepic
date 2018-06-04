const endpoint2 = '/api/cash/fysltd';
let valueChart2 =
  Highcharts.chart('fyTotalLtd', {
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


updateChart(valueChart2, endpoint2);














