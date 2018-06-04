const endpoint = '/api/cash/fys';
let valueChart;
chart =
  Highcharts.chart('fyTotal', {
    chart: {
        type: 'line'
    },
    title: {
        text: 'FY Total'
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
//       let don1  = json.data.donation.value.CashCheque;
//       let don2  = json.data.donation.value.CreditCard;
//       let merch1  = json.data.merchandise.value.CashCheque;
//       let merch2  = json.data.merchandise.value.CreditCard;
//       let list1  = json.data.list.value.CashCheque;
//       let other1  = json.data.other.value.CashCheque;
//
//       let minLength = Math.min(don1.length, don2.length, merch1.length, merch2.length, list1.length, other1.length,);
//       let values =[];
//       for(let i=0; i<minLength; i++){
//         values.push(don1[i]+don2[i]+merch1[i]+merch2[i]+list1[i]+other1[i])
//       }
//
      this.chart.addSeries({
        name: 'FY total',
        data: json.total
      });
//
      this.chart.update({
		 xAxis: {
		        categories: json.fy
	        },
        plotOptions: {
	        line: {
	            dataLabels: {
	                enabled: true
	            },
	            enableMouseTracking: false
         }
    },
      });

    })
  });
}

updateChart(valueChart, endpoint);














