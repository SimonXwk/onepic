// ############################################################################
let summaryTable = Vue.component('table-summary', {
	props: ['payments', 'focalFY', 'clacType'],
	data: function(){
		return {
			merchUnallocatedPostageCampaignCode: '____.M Postage'
		}
	},
	computed:{
		merchRows: function(){
			return this.payments.rows.filter(p => p.SOURCETYPE.indexOf('Merch') !== -1 );
		},
		merchCampaigns: function(){
			return Array.from(new Set(this.merchRows.map(v => v.CAMPAIGNCODE))).sort()
		},
		merchRevenueTypes: function(){
			return Array.from(new Set(this.merchRows.map(v => v.SOURCETYPE))).sort()
		},
		merchUnallocatedPostage: function(){
			return this.merchRows.filter(v => v.CAMPAIGNCODE===this.merchUnallocatedPostageCampaignCode).map(v => v.PAYMENTAMOUNT).reduce((acc, cur) => acc+=cur,0)
		},
		merchPurchase: function(){
			return this.merchRows.filter(v => v.SOURCETYPE==='Merchandise Purchase').map(v => v.PAYMENTAMOUNT).reduce((acc, cur) => acc+=cur,0)
		}
	},
	methods:{
		calc: function(filters){
			let result = 0;
			let rows = !filters ? this.merchRows : this.merchRows.filter(r => {
				return Object.keys(filters).reduce((acc, key) =>	acc && (r[key] === filters[key]), true);
			});
			if(this.clacType==='sum'){
				result = rows.reduce((acc, cur) => acc += cur['PAYMENTAMOUNT'], 0);
			}

			return Number(result.toFixed(2))
		},
		allocatePostage: function(purchase){
			return Number(((purchase/this.merchPurchase)*this.merchUnallocatedPostage).toFixed(2))
		}
		// {SOURCETYPE: type, CAMPAIGNCODE: camp }
	},
	template:`
	<table class="table table-sm table-hover">
		<thead>
			<tr>
				<th scope="col">Campaigns</th>
				<th scope="col">Total</th>
				<th scope="col" v-for="t in merchRevenueTypes"><< t >></th>
				<th scope="col">Postage Allocation</th>
				<th scope="col">Adjusted Total</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="camp in merchCampaigns">
				<td><< camp >></td>
				<td class="text-primary"><< calc({CAMPAIGNCODE:camp})|currency >></td>
				<td v-for="type in merchRevenueTypes"><< calc({SOURCETYPE:type, CAMPAIGNCODE:camp})|currency >></td>
				<td class="text-danger"><< allocatePostage(calc({SOURCETYPE:'Merchandise Purchase', CAMPAIGNCODE:camp}))|currency >></td>
				<td class="text-danger" v-if="camp===merchUnallocatedPostageCampaignCode"><< (calc({CAMPAIGNCODE:camp})-merchUnallocatedPostage)|currency >></td>
				<td class="text-primary" v-else><< (allocatePostage(calc({SOURCETYPE:'Merchandise Purchase', CAMPAIGNCODE:camp})) + calc({CAMPAIGNCODE:camp}))|currency >></td>
			</tr>
		</tbody>
		<tfoot>
			<tr class="bg-light text-dark font-weight-bold">
				<th class="text-dark">TOTAL</th>
				<td class="text-primary"><< calc({})|currency >></td>
				<td v-for="type in merchRevenueTypes"><< calc({SOURCETYPE:type})|currency >></td>
				<td class="text-danger"><< merchUnallocatedPostage|currency >></td>
				<td class="text-primary"><< calc({})|currency >></td>
			</tr>
		</tfoot>
	</table>
	`
});
// ############################################################################
let compareBarChartVue = Vue.component('chart-compare', {
	props: ['budget', 'payments', 'focalFY', 'meta'],
	data: function(){
		return {
			baseOption: {
				chart: { renderTo: null, type: 'column' },
				title: { text: null },
				xAxis: { categories: $FY_MONTH_LIST.short },
				yAxis: { title: {	text: null } },
				legend: { shadow: false},
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
				series: []
			},
			chart: null,
		}
	},
	computed: {
		merchRows: function(){
			return this.payments.rows.filter(p => p.SOURCETYPE.indexOf('Merch') !== -1 );
		},
	},
	methods: {
		calcMerchMonthly: function(dim){
			return this.merchRows.reduce((acc, cur) => {
				if (this.meta.isCumulative) {
					for(let i=cur.PAYMENT_FYMTH-1; i<acc.length; i++){
						acc[i] += cur[dim];
					}
				}else{
					acc[cur.PAYMENT_FYMTH-1] += cur[dim];
				}
				return acc
			}, [null, null, null, null, null, null, null, null, null, null, null, null]).map(v => v ? Number(v.toFixed(2)) : null );
		}
	},
	mounted() {
		let el = this.$el;
		let title = 'Merchandise Monthly ' + this.meta.item + (this.meta.isCumulative ? ' Culmulative' : '');
		let merchGstBudget = (this.budget.FY[this.focalFY]['PRIVATE']['MerchandiseGST']);
		let merchTotalBudget = this.budget.FY[this.focalFY]['PRIVATE']['Merchandise'];
		// Create Chart
		this.chart = Highcharts.chart(Object.assign(this.baseOption, {
			chart: { renderTo: el, type: 'column' },
			title: { text: title },
			subtitle: { text: 'Data fetched : ' + new Date(this.payments.timestamp)}
		}));
		// Add Series Budget GST
		this.chart.addSeries({
			name: 'Budget GST',
			stack: 'Budget',
			color: 'rgba(248,161,63,0.9)',
			pointPadding: 0.1,
			pointPlacement: 0,
			data: !this.meta.isCumulative ? merchGstBudget.map(v => Number(v.toFixed(2))) : merchGstBudget.map((v, i1, self) => i1===0 ? v : self.filter((v, i2) => i2 <= i1).reduce((acc, cur) => acc + cur ,0)).map(v => Number(v.toFixed(2)))
		});
		// Add Series Budget Net
		this.chart.addSeries({
			name: 'Budget Net',
			stack: 'Budget',
			color: 'rgba(165,170,217,0.9)',
			pointPadding: 0.1,
			pointPlacement: 0,
			data: !this.meta.isCumulative ? merchTotalBudget.map((v, i) => v - merchGstBudget[i]).map(v => Number(v.toFixed(2))) : merchTotalBudget.map((v, i) => v - merchGstBudget[i]).map((v, i1, self) => i1===0 ? v : self.filter((v, i2) => i2 <= i1).reduce((acc, cur) => acc + cur ,0)).map(v => Number(v.toFixed(2)))
		});
		// Add Series Actual GST
		this.chart.addSeries({
			name: 'Actual GST',
			stack: 'Actual',
			color: 'rgba(186,60,61,1)',
			pointPadding: 0.3,
			pointPlacement: 0,
			data: this.calcMerchMonthly('GSTAMOUNT')
		});
		// Add Series Actual Net
		this.chart.addSeries({
			name: 'Actual Net',
			stack: 'Actual',
			color: 'rgba(126,86,134,1)',
			pointPadding: 0.3,
			pointPlacement: 0,
			data: this.calcMerchMonthly('PAYMENTAMOUNTNETT')
		});
	},
	template:`<div class="chart"></div>`
});
// #############################################################################
// #############################################################################
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
	},
	computed: {
		merchRows: function(){
			return this.paymentDataReady ? this.payments.rows.filter(p => p.SOURCETYPE.indexOf('Merch') !== -1 ) : []
		},
		nonMerchRows: function(){
			return this.paymentDataReady ? this.payments.rows.filter(p => p.SOURCETYPE.indexOf('Merch') === -1 ) : []
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
		getData: function(){
			// Reset Data
			this.payments = null;
			this.paymentDataReady = false;
			// Fetch Data
			fetchJSON(endpoint(this.paymentAPI + '?fy=' + this.focalFY), (pmtJSON) => {
				this.payments = pmtJSON;
				this.paymentDataReady = true;
			});
			// Reset Data
			this.budget = null;
			this.budgetDataReady = false;
			// Fetch Data
			fetchJSON(endpoint(this.budgetAPI), (bgtJSON) => {
				this.budget = bgtJSON;
				this.budgetDataReady = true;
			});
		},
	},
	created() {
		this.getData()
	},
	components:{
		'summary-talbe': summaryTable,
		'compare-chart': compareBarChartVue
	},
	template:`
	<vueLoader msg="Retrieving Payment & Budget Data  ..." v-if="!paymentDataReady&&!budgetDataReady"></vueLoader>
	<vueLoader msg="Retrieving Payment Data in ThankQ ..." v-else-if="!paymentDataReady&&budgetDataReady"></vueLoader>
	<vueLoader msg="Retrieving Budget Information ..." v-else-if="!budgetDataReady&&paymentDataReady"></vueLoader>
	<div class="container-fluid" v-else>
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
			<compare-chart v-bind:budget="budget" v-bind:payments="payments" v-bind:focalFY="focalFY" v-bind:meta="{isCumulative: false, item: 'Revenue', clacType: 'sum'}"></compare-chart>
		</div>
		<div class="col-lg-6">
			<compare-chart v-bind:budget="budget" v-bind:payments="payments" v-bind:focalFY="focalFY" v-bind:meta="{isCumulative: true, item: 'Revenue', clacType: 'sum'}"></compare-chart>
		</div>
	</div>

	<div class="row my-1">
		<div class="col">
			<summary-talbe v-bind:payments="payments" v-bind:focalFY="focalFY" clacType="sum"></summary-talbe>
		</div>
	</div>

	</div>`
});
