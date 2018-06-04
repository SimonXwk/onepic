const endpointPrefix = '/api/mailbox/ymd/';
let endpoint;
const today = new Date();
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



Highcharts.chart('monthly_item', {

    chart: {
        type: 'column'
    },

    title: {
        text: 'Daily Mail Opening : '+today.toLocaleString('en-au', { month: "long" })
    },

    xAxis: {
        categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
    },

    yAxis: {
        allowDecimals: false,
        min: 0,
        title: {
            text: 'Number of fruits'
        }
    },

    tooltip: {
        formatter: function () {
            return '<b>' + this.x + '</b><br/>' +
                this.series.name + ': ' + this.y + '<br/>' +
                'Total: ' + this.point.stackTotal;
        }
    },

    plotOptions: {
        column: {
            stacking: 'normal'
        }
    },

    series: [{
        name: 'John',
        data: [5, 3, 4, 7, 2],
        stack: 'male'
    }, {
        name: 'Joe',
        data: [3, 4, 4, 2, 5],
        stack: 'male'
    }, {
        name: 'Jane',
        data: [2, 5, 6, 2, 1],
        stack: 'female'
    }, {
        name: 'Janet',
        data: [3, 0, 4, 4, 3],
        stack: 'female'
    }]
});


function updateChart(chart, endpointVariable){
  endpoint = endpointPrefix + endpointVariable;
  let yearStr = endpointVariable.substring(0, 4);
  fetch(endpoint).then(function(response){
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
          crosshairs: true,
          animation: true,
          shared: true,
          formatter: function() {
              return this.x + '<br>'
                  + this.points[0].series.name + ': ' + this.points[0].y + '<br>'
                  + this.points[1].series.name + ': ' + this.points[1].y;
              }
}
      });

    })
  });
}

updateChart(valueChart, '20180501');
updateChart(valueChart, '20170501');
// requestData(chart, '20160601');













