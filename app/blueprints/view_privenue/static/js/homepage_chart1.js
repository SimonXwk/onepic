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

let valueChart2 =
  Highcharts.chart('fyTotalLtd', {
    // chart: {
    //     type: 'column',
	 //    scrollablePlotArea: {
    //         minWidth: 320
    //     }
    // },
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

fetchJSON(endpoint('/api/cash/cfy/stream'), function(json){
  let chart = valueChart2;
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
});
