// console.log('/api/rfm/' + fileName);
//
//
// $.getJSON('/api/rfm/' + fileName).done(function (data) {
//
//   var count = data.value;
//   var segment = data.name;
//
//   var output =[];
//   console.log(fileName);
//   for (var i = 0; i < count.length; i++) {
//           output.push({
//                   y: count[i],
//                   name: segment[i]
//           });
//   }
//
// Highcharts.chart('chart1', {chart1
//   chart: {
//     plotBackgroundColor: null,
//     // plotBorderWidth: null,
//     plotShadow: false,
//     type: 'pie'
//   },
//   title: {
//     text: 'REF Segments'
//   },
//   tooltip: {
//     pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
//   },
//   plotOptions: {
//     pie: {
//       allowPointSelect: true,
//       cursor: 'pointer',
//       dataLabels: {
//         enabled: true,
//         format: '<b>{point.name}</b>: {point.percentage:.1f} %',
//         style: {
//           color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
//         }
//       }
//     }
//   },
//   series: [{
//     name: 'Brands',
//     colorByPoint: true,
//     data: output
//   }]
// });
//
//
// });
//
//
// $.getJSON('/api/rfm/' + fileName).done(function (data) {
//
//   var count = data.value;
//   var segment = data.name;
//
//   var output =[];
//   console.log(fileName);
//   for (var i = 0; i < count.length; i++) {
//           output.push({
//                   y: count[i],
//                   name: segment[i]
//           });
// }


console.log(filename);

// Give the points a 3D feel by adding a radial gradient
Highcharts.setOptions({
    colors: $.map(Highcharts.getOptions().colors, function (color) {
        return {
            radialGradient: {
                cx: 0.4,
                cy: 0.3,
                r: 0.5
            },
            stops: [
                [0, color],
                [1, Highcharts.Color(color).brighten(-0.2).get('rgb')]
            ]
        };
    })
});

function ThreeDChart(containerID, data) {
	// Set up the chart
	let chart = new Highcharts.Chart({
	    chart: {
	        renderTo: containerID,
	        margin: 100,
	        type: 'scatter3d',
	        animation: false,
	        options3d: {
	            enabled: true,
	            alpha: 10,
	            beta: 30,
	            depth: 250,
	            viewDistance: 5,
	            fitToPlot: false,
	            frame: {
	                bottom: { size: 1, color: 'rgba(0,0,0,0.02)' },
	                back: { size: 1, color: 'rgba(0,0,0,0.04)' },
	                side: { size: 1, color: 'rgba(0,0,0,0.06)' }
	            }
	        }
	    },
	    title: {
	        text: 'Merchandise Customer Recency Frequency and Monetary Amount'
	    },
	    subtitle: {
	        text: ''
	    },
	    credits: {
	        text: 'ⒸTLMA',
	        href: '#',
	        enabled: true
	    },
	    plotOptions: {
	        scatter: {
	            width: 10,
	            height: 10,
	            depth: 10
	        }
	    },
	    yAxis: {
	        min: 0,
	        max: 10,
	        title: 'Frequency'
	    },
	    xAxis: {
	        min: 0,
	        max: 10,
	        title: 'Recency',
	        gridLineWidth: 1
	    },
	    zAxis: {
	        min: 0,
	        max: 10,
	        title: 'Monetary Amount',
	        showFirstLabel: false
	    },
	    legend: {
	        enabled: false
	    },
	    series: [{
	        name: 'Customers',
	        colorByPoint: true,
	        data:data
	    }]
	});
	// Add mouse and touch events for rotation
	(function (H) {
	    function dragStart(eStart) {
	        eStart = chart.pointer.normalize(eStart);

	        var posX = eStart.chartX,
	            posY = eStart.chartY,
	            alpha = chart.options.chart.options3d.alpha,
	            beta = chart.options.chart.options3d.beta,
	            sensitivity = 5; // lower is more sensitive

	        function drag(e) {
	            // Get e.chartX and e.chartY
	            e = chart.pointer.normalize(e);

	            chart.update({
	                chart: {
	                    options3d: {
	                        alpha: alpha + (e.chartY - posY) / sensitivity,
	                        beta: beta + (posX - e.chartX) / sensitivity
	                    }
	                }
	            }, undefined, undefined, false);
	        }

	        chart.unbindDragMouse = H.addEvent(document, 'mousemove', drag);
	        chart.unbindDragTouch = H.addEvent(document, 'touchmove', drag);

	        H.addEvent(document, 'mouseup', chart.unbindDragMouse);
	        H.addEvent(document, 'touchend', chart.unbindDragTouch);
	    }
	    H.addEvent(chart.container, 'mousedown', dragStart);
	    H.addEvent(chart.container, 'touchstart', dragStart);
	}(Highcharts));
}

const data1 = [
    [1, 6, 5], [8, 7, 9], [1, 3, 4], [4, 6, 8], [5, 7, 7], [6, 9, 6],
    [7, 0, 5], [2, 3, 3], [3, 9, 8], [3, 6, 5], [4, 9, 4], [2, 3, 3],
    [6, 9, 9], [0, 7, 0], [7, 7, 9], [7, 2, 9], [0, 6, 2], [4, 6, 7],
    [3, 7, 7], [0, 1, 7], [2, 8, 6], [2, 3, 7], [6, 4, 8], [3, 5, 9],
    [7, 9, 5], [3, 1, 7], [4, 4, 2], [3, 6, 2], [3, 1, 6], [6, 8, 5],
    [6, 6, 7], [4, 1, 1], [7, 2, 7], [7, 7, 0], [8, 8, 9], [9, 4, 1],
    [8, 3, 4], [9, 8, 9], [3, 5, 3], [0, 2, 4], [6, 0, 2], [2, 1, 3],
    [5, 8, 9], [2, 1, 1], [9, 7, 6], [3, 0, 2], [9, 9, 0], [3, 4, 8],
    [2, 6, 1], [8, 9, 2], [7, 6, 5], [6, 3, 1], [9, 3, 1], [8, 9, 3],
    [9, 1, 0], [3, 8, 7], [8, 0, 0], [4, 9, 7], [8, 6, 2], [4, 3, 0],
    [2, 3, 5], [9, 1, 4], [1, 1, 4], [6, 0, 2], [6, 1, 6], [3, 8, 8],
    [8, 8, 7], [5, 5, 0], [3, 9, 6], [5, 4, 3], [6, 8, 3], [0, 1, 5],
    [6, 7, 3], [8, 3, 2], [3, 8, 3], [2, 1, 6], [4, 6, 7], [8, 9, 9],
    [5, 4, 2], [6, 1, 3], [6, 9, 5], [4, 8, 2], [9, 7, 4], [5, 4, 2],
    [9, 6, 1], [2, 7, 3], [4, 5, 4], [6, 8, 1], [3, 4, 0], [2, 2, 6],
    [5, 1, 2], [9, 9, 7], [6, 9, 9], [8, 4, 3], [4, 1, 7], [6, 2, 5],
    [0, 4, 9], [3, 5, 9], [6, 9, 1], [1, 9, 2]];


ThreeDChart('chart1', data1);
ThreeDChart('chart2', data1);






