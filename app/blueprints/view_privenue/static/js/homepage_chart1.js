const cfy = today.getMonth()+1 < 7 ? today.getFullYear() : today.getFullYear()+1;

let valueChart1 =
  Highcharts.chart('fyTotal', {
    chart: {
        type: 'line',
	    scrollablePlotArea: {
            minWidth: 320
        }
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


// Fetching Data from API and draw charts
fetchJSON(endpoint('/api/cash/fys'), function(json){
  let chart = valueChart1;
  chart.addSeries({
    name: 'Full FY',
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
});

fetchJSON(endpoint('/api/cash/fysltd'), function(json){
  let chart = valueChart1;
  chart.addSeries({
    name: 'TLD',
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
});


