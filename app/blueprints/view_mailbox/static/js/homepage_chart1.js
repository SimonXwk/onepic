var endpoint = '/api/mail';
var chart;

// Radialize the colors
Highcharts.setOptions({
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

// Build the chart
chart = Highcharts.chart(chart1, {
  credits: {
    enabled: false
  },
  chart: {
    plotBackgroundColor: null,
    plotBorderWidth: null,
    plotShadow: false,
    type: 'pie'
  },
  title: {
    text: 'Daily Mail Opening'
  },
  tooltip: {
    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
  },
  plotOptions: {
    pie: {
      allowPointSelect: true,
      cursor: 'pointer',
      dataLabels: {
        enabled: true,
        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
        style: {
          color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
        },
        connectorColor: 'silver'
      }
    }
  }
  // series: [{
  //   name: 'Share',
  //   data: [
  //     { name: 'Donation', y: 61.41 },
  //     { name: 'Merchandise', y: 11.84 },
  //     { name: 'List', y: 10.85 },
  //     { name: 'Other', y: 4.67 }
  //   ]
  // }]
});




// var fetchedData = [];
function requestData(){
  fetch(endpoint).then(function(response){
    response.json().then(function (data) {
      console.log(data);
      chart.addSeries({
          name: "Share",
          data: data
      });
      // for(var i=0; i<data.length; i++ ){
      //     fetchedData.push(data[i])
      // }
      // fetchedData=data;
    })
  });
}

requestData();
// console.log(fetchedData);

