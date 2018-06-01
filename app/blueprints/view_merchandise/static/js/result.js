console.log('/api/rfm/' + fileName);


$.getJSON('/api/rfm/' + fileName).done(function (data) {

  var count = data.value;
  var segment = data.name;

  var output =[];
  console.log(fileName);
  for (var i = 0; i < count.length; i++) {
          output.push({
                  y: count[i],
                  name: segment[i]
          });
  }

Highcharts.chart('chart1', {
  chart: {
    plotBackgroundColor: null,
    plotBorderWidth: null,
    plotShadow: false,
    type: 'pie'
  },
  title: {
    text: 'REF Segments'
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
        }
      }
    }
  },
  series: [{
    name: 'Brands',
    colorByPoint: true,
    data: output
  }]
});


});

