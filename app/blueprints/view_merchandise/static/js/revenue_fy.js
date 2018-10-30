let chart1, chart2;

function setOptionCompareBarChart(config) {
	return {
		chart: {
			renderTo: config.renderTo,
			type: 'column'
		},
		credits: {
			enabled: false,
		},
		title: {
			text: config.title
		},
		xAxis: {
			categories: $FY_MONTH_LIST.short
		},
		yAxis: {
			title: {
				text: null
			}
		},
		legend: {
			shadow: false
		},
		tooltip: {
			headerFormat: '<span style="font-size:16px">{point.key}</span><table>',
			pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
					'<td style="padding:0;text-align: right;"><b>{point.y:,.2f}</b></td></tr>',
			footerFormat: '</table>',
			shared: true,
			useHTML: true
	 },
		plotOptions: {
			column: {
				grouping: false,
				stacking: 'normal',
				shadow: false,
				borderWidth: 0
			}
		},
		series: [
			{
				name: 'Budget GST',
				stack: 'Budget',
				color: 'rgba(248,161,63,0.9)',
				pointPadding: 0.1,
				pointPlacement: 0,
				data: []
			}	,{
				name: 'Budget Net',
				stack: 'Budget',
				color: 'rgba(165,170,217,0.9)',
				pointPadding: 0.1,
				pointPlacement: 0,
				data: []
			}, {
				name: 'Actual GST',
				stack: 'Actual',
				color: 'rgba(186,60,61,1)',
				pointPadding: 0.3,
				pointPlacement: 0,
				data: []
			}, {
				name: 'Actual Net',
				stack: 'Actual',
				color: 'rgba(126,86,134,1)',
				pointPadding: 0.3,
				pointPlacement: 0,
				data: []
			}
		]
	}
}


let rootVue = new Vue({
	el: '#root',
	data: {
		paymentAPI: '/api/tq/payments',
		budgetAPI: '/api/budget',
		focalFY: $CFY,
		paymentDataReady: false,
		budgetDataReady: false,
		payments: null,
		budget: null,
		spinner: '<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>'
	},
	computed: {
		merchRows: function(){
			if (this.paymentDataReady) {
				let mr = this.payments.rows.filter(p => p.SOURCETYPE.indexOf('Merch') !== -1 );
				return mr
			} else {
				return []
			}
		},
		nonMerchRows: function(){
			if (this.paymentDataReady) {
				let mr = this.payments.rows.filter(p => p.SOURCETYPE.indexOf('Merch') === -1 );
				return mr
			} else {
				return []
			}
		},
		budgetObj: function(){
			if (this.budgetDataReady) {
				return this.budget.FY[this.focalFY]
			} else {
				return null
			}
		},
	},
	watch: {
	},
	methods: {
		sumTotal: function (dim){
			if (this.merchRows.length > 0) {
				return this.merchRows.reduce((acc, cur) => acc + cur[dim] , 0)
			} else {
				return 'calculating ...'
			}
		},
		countUnique: function (dim){
			if (this.merchRows.length > 0) {
				return new Set(this.merchRows.map(r => r[dim])).size
			} else {
				return 'calculating ...'
			}
		},
		countMixedMerchCustomer: function (){
			if (this.nonMerchRows.length > 0) {
				let merchCustomers = this.merchRows.map(r => r.SERIALNUMBER).filter((v, i, self) => self.indexOf(v) === i );
				let interset = this.nonMerchRows
					.map(r => r.SERIALNUMBER)
					.filter((v, i, self) => self.indexOf(v) === i )
					.reduce((acc, cur) => acc + (merchCustomers.indexOf(cur) === -1 ? 0 : 1), 0)
				return interset
			} else {
				return 'calculating ...'
			}
		},
		calcLTDBudget: function (){
			if ( this.budgetObj === null ) {
				return 'calculating ...'
			} else {
				let currentFYMotnh = new Date().getMonth() + 1 + (new Date().getMonth() < 6 ? 6 : -6);
				let bgt = this.budgetObj['PRIVATE']['Merchandise'].reduce( (acc, cur, i) => {
					if ( i + 1 <= currentFYMotnh ) {
						return (acc + cur) - this.budgetObj['PRIVATE']['MerchandiseGST'][i]
					}else {
						return acc
					}
				}, 0);
				return bgt
			}
		},
		calcMonthlyTotal: function(dim, isCulmulative=false) {
			return  [this.merchRows.filter(r => isCulmulative ? r.PAYMENT_FYMTH <= 1 : r.PAYMENT_FYMTH === 1 ).reduce((acc, cur) => acc + cur[dim], 0),
          this.merchRows.filter(r => isCulmulative ? r.PAYMENT_FYMTH <= 2 : r.PAYMENT_FYMTH === 2 ).reduce((acc, cur) => acc + cur[dim], 0),
          this.merchRows.filter(r => isCulmulative ? r.PAYMENT_FYMTH <= 3 : r.PAYMENT_FYMTH === 3 ).reduce((acc, cur) => acc + cur[dim], 0),
          this.merchRows.filter(r => isCulmulative ? r.PAYMENT_FYMTH <= 4 : r.PAYMENT_FYMTH === 4 ).reduce((acc, cur) => acc + cur[dim], 0),
          this.merchRows.filter(r => isCulmulative ? r.PAYMENT_FYMTH <= 5 : r.PAYMENT_FYMTH === 5 ).reduce((acc, cur) => acc + cur[dim], 0),
          this.merchRows.filter(r => isCulmulative ? r.PAYMENT_FYMTH <= 6 : r.PAYMENT_FYMTH === 6 ).reduce((acc, cur) => acc + cur[dim], 0),
          this.merchRows.filter(r => isCulmulative ? r.PAYMENT_FYMTH <= 7 : r.PAYMENT_FYMTH === 7 ).reduce((acc, cur) => acc + cur[dim], 0),
          this.merchRows.filter(r => isCulmulative ? r.PAYMENT_FYMTH <= 8 : r.PAYMENT_FYMTH === 8 ).reduce((acc, cur) => acc + cur[dim], 0),
          this.merchRows.filter(r => isCulmulative ? r.PAYMENT_FYMTH <= 9 : r.PAYMENT_FYMTH === 9 ).reduce((acc, cur) => acc + cur[dim], 0),
          this.merchRows.filter(r => isCulmulative ? r.PAYMENT_FYMTH <= 10 : r.PAYMENT_FYMTH === 10 ).reduce((acc, cur) => acc + cur[dim], 0),
          this.merchRows.filter(r => isCulmulative ? r.PAYMENT_FYMTH <= 11 : r.PAYMENT_FYMTH === 11 ).reduce((acc, cur) => acc + cur[dim], 0),
          this.merchRows.filter(r => isCulmulative ? r.PAYMENT_FYMTH <= 12 : r.PAYMENT_FYMTH === 12 ).reduce((acc, cur) => acc + cur[dim], 0),
        ]
		},
	},
	created() {
		fetchJSON(endpoint(this.paymentAPI + '?fy=' + this.focalFY), (pmtJSON) => {
			this.payments = pmtJSON;
			this.paymentDataReady = true;
		});
		fetchJSON(endpoint(this.budgetAPI), (bgtJSON) => {
			this.budget = bgtJSON;
			this.budgetDataReady = true;
		});
	},
	mounted() {
		chart1 =  new Highcharts.chart(setOptionCompareBarChart({renderTo: 'chart1', title:'Fetching ... '}));
		chart2 =  new Highcharts.chart(setOptionCompareBarChart({renderTo: 'chart2', title:'Fetching ... '}));
	},
	beforeUpdate(){
		if (this.budgetDataReady){
			chart1.series[0].update({
				data: this.budgetObj['PRIVATE']['MerchandiseGST']
			});
			chart1.series[1].update({
				data: this.budgetObj['PRIVATE']['Merchandise'].map((v, i) => v - this.budgetObj['PRIVATE']['MerchandiseGST'][i])
			});
			chart2.series[0].update({
				data: this.budgetObj['PRIVATE']['MerchandiseGST']
					.map((v, i1, self) => i1===0 ? v : self.filter((v, i2) => i2 <= i1).reduce((acc, cur) => acc + cur ,0))
			});
			chart2.series[1].update({
				data: this.budgetObj['PRIVATE']['Merchandise']
					.map((v, i) => v - this.budgetObj['PRIVATE']['MerchandiseGST'][i])
					.map((v, i1, self) => i1===0 ? v : self.filter((v, i2) => i2 <= i1).reduce((acc, cur) => acc + cur ,0))
			});
		}

		if (this.paymentDataReady){
			chart1.update({
				credits: {
					enabled: true,
				},
				title: {
					text:'Merchandise Monthly Revenue'
				},
				subtitle: {
					text: 'Data fetched : ' + new Date(this.payments.timestamp)
				}
			});
			chart2.update({
				credits: {
					enabled: true,
				},
				title: {
						text:'Merchandise Monthly Revenue Culmulative'
				},
				subtitle: {
					text: 'Data fetched : ' + new Date(this.payments.timestamp)
				}
			});

			chart1.series[2].update({
				data: this.calcMonthlyTotal('GSTAMOUNT')
			});
			chart1.series[3].update({
				data: this.calcMonthlyTotal('PAYMENTAMOUNTNETT')
			});

			chart2.series[2].update({
				data: this.calcMonthlyTotal('GSTAMOUNT', true)
			});
			chart2.series[3].update({
				data: this.calcMonthlyTotal('PAYMENTAMOUNTNETT', true)
			});
		}

	},
	components:{
		'vue-loader': vueLoader
	},
	template:`<div class="container-fluid">
	<p class="lead font-weight-bold">Merchandise Performance in current financial year</p>
	<div class="row">
		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter success">
				<span class="count-icon">&#128181;</span>
				<span class="count-numbers"><< sumTotal("PAYMENTAMOUNT")|currency >></span>
				<span class="count-name">Total Cash Inflow</span>
			</div>
		</div>
		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter success">
				<span class="count-icon">&#128176;</span>
				<span class="count-numbers"><< sumTotal("GSTAMOUNT")|currency >></span>
				<span class="count-name">GST Collected</span>
			</div>
		</div>
		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter success">
				<span class="count-icon">&#127974;</span>
				<span class="count-numbers"><< sumTotal("PAYMENTAMOUNTNETT")|currency >></span>
				<span class="count-name">Net Revenue</span>
			</div>
		</div>
		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter success">
				<span class="count-icon">&#128184;</span>
				<span class="count-numbers"><< (sumTotal("PAYMENTAMOUNTNETT")/calcLTDBudget())|pct(2) >></span>
				<span class="count-name">As of YTM Budget(exc GST)</span>
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter danger">
				<span class="count-icon">&#128522;</span>
				<span class="count-numbers"><< countUnique("SERIALNUMBER")|number >></span>
				<span class="count-name">Financially Engaged Contacts</span>
			</div>
		</div>

		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter warning">
				<span class="count-icon">&#128526;</span>
				<span class="count-numbers"><< (countUnique("SERIALNUMBER") - countMixedMerchCustomer())|number >></span>
				<span class="count-name">Pure Merchandise Platformer</span>
			</div>
		</div>

		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter info">
				<span class="count-icon">&#128140;</span>
				<span class="count-numbers"><< countUnique("PLEDGEID")|number >></span>
				<span class="count-name">Sponsorships that Generated Revenue</span>
			</div>
		</div>

		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter info">
				<span class="count-icon">&#128230;</span>
				<span class="count-numbers"><< countUnique("REXORDERID")|number >></span>
				<span class="count-name">REX Orders</span>
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-lg-6">
			<div class="chart" id="chart1" v-html="spinner"></div>
		</div>
		<div class="col-lg-6">
			<div class="chart" id="chart2" v-html="spinner"></div>
		</div>
	</div>

	</div>`
});
