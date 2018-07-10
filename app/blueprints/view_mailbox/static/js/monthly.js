
const mth = today.getMonth()+1;
const mthName = today.toLocaleString('en-au', { month: "long" });

let dateLabel = [];
if(mth == 2){
  dateLabel = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];
} else if(mth==4 | mth==6 | mth==9 | mth==11 ){
  dateLabel = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
} else {
  dateLabel = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31];
}



let valueChart;
chart =
  Highcharts.chart('monthly_value', {
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
      text: 'Daily Mail Opening : ' + mthName
    },
    subtitle: {
      text: 'API : ' + endpointPrefix + '\< yyyymmdd \>'
    },

    xAxis: {
      categories: dateLabel
    },
    yAxis: {
      title: {
        text: 'Total Value (AUD)'
      }
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true
        },
        enableMouseTracking: false
      }
    },
    series: []
  });


// 'monthly_item'

let myChart = echarts.init(document.getElementById('monthly_item'));

let option = {
    title: {
        text: 'Demo'
    },
    tooltip: {},
    legend: {
        data:['Type']
    },
    xAxis: {
        data: ["Cate1","Cate2","Cate3","Cate4","Cate5","Cate6"]
    },
    yAxis: {},
    series: [{
        name: 'Type',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20]
    }]
};


myChart.setOption(option);




function updateChart(chart, endpointVariable){
  let yearStr = endpointVariable.substring(0, 4);
  fetch(endpoint('/api/mailbox/ymd/',endpointVariable)).then(function(response){
    console.log(response);
    response.json().then(function (json) {
      console.log(json);
      let don1  = json.data.donation.value.CashCheque;
      let don2  = json.data.donation.value.CreditCard;
      let merch1  = json.data.merchandise.value.CashCheque;
      let merch2  = json.data.merchandise.value.CreditCard;
      let list1  = json.data.list.value.CashCheque;
      let other1  = json.data.other.value.CashCheque;

      let minLength = Math.min(don1.length, don2.length, merch1.length, merch2.length, list1.length, other1.length,);
      let values =[];
      for(let i=0; i<minLength; i++){
        values.push(don1[i]+don2[i]+merch1[i]+merch2[i]+list1[i]+other1[i])
      }

      this.chart.addSeries({
        name: mthName +'(' + yearStr + ')',
        data: values
      });

      this.chart.update({
		  tooltip: {
			        shared: true,
		            crosshairs: true,
			        headerFormat: '<b>{series.name}</b><br>',
			        pointFormat: '{point.x:%e. %b}: {point.y:.2f} m'
		        }
      });
    })
  });
}

updateChart(valueChart, '20180601');
updateChart(valueChart, '20170601');
updateChart(valueChart, '20160601');













