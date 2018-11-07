// #############################################################################
// #############################################################################
const store = new Vuex.Store({
	state: {
		focalFY: $CFY,
		calcDimensionSum: 'PAYMENTAMOUNTNETT',
		arbitraryMerchPostageCampaignCode: '____.M Postage',
		focalDonorTypes: [],
	},
	mutations: {
		SET_FOCALFY: (state, payload) => state.focalFY = payload,
		SET_CALC_DIMENSION_SUM: (state, payload) => state.calcDimensionSum = payload,
		SET_FOCAL_DONORTYPES: (state, payload) => state.focalDonorTypes = payload,
	}
});
// #############################################################################
// #############################################################################
let summaryTable = Vue.component('table-summary', {
	props: ['merchRows', 'budget'],
	computed:{
		focalFY: function(){return this.$store.state.focalFY},
		sumDimension: function(){return this.$store.state.calcDimensionSum },
		merchUnallocatedPostageCampaignCode: function(){return this.$store.state.arbitraryMerchPostageCampaignCode},
		focalDonorTypes:function(){return this.$store.state.focalDonorTypes},
		merchCampaigns: function(){return Array.from(new Set(this.merchRows.map(v => v.CAMPAIGNCODE))).sort()},
		merchRevenueTypes: function(){return [...new Set(this.merchRows.map(v => v.SOURCETYPE))].sort()},
		merchUnallocatedPostageSum: function(){
			return this.merchRows.filter(v => v.CAMPAIGNCODE===this.merchUnallocatedPostageCampaignCode).map(v => v[this.sumDimension]).reduce((acc, cur) => acc+=cur,0)
		},
		merchPostagePerPurchase: function(){
			return this.merchUnallocatedPostageSum/this.merchRows.filter(v => v.SOURCETYPE==='Merchandise Purchase').map(v => v[this.sumDimension]).reduce((acc, cur) => acc+=cur,0)
		},
		filteredRows: function(){
			let row = this.merchRows;
			row = row.filter(r => {
				return !this.focalDonorTypes ? false : this.focalDonorTypes.reduce((acc, cur)=> {
					return acc || r.LINE_FY_DONTYPE === cur
				}, false)
			});
			return row
		}
	},
	methods:{
		calc: function(dim, clacType ,filters){
			let result = 0;
			let rows = !filters ? this.filteredRows : this.filteredRows.filter(r => {
				return Object.keys(filters).reduce((acc, key) =>	acc && (r[key] === filters[key]), true);
			});
			if(clacType==='sum'){
				result = rows.reduce((acc, cur) => acc += cur[dim], 0);
			}else if(clacType==='unique'){
				result = new Set(rows.map(r => r[dim])).size
			}
			return Number(result.toFixed(2))
		},
		allocatePostage: function(purchase){
			return Number((purchase*this.merchPostagePerPurchase).toFixed(2))
		},
		campaignSourceTypeBudget: function(camp, srcType){
			if (this.budget.CAMPAIGN[camp]) {
				if (srcType && this.budget.CAMPAIGN[camp][srcType]) {
					return this.budget.CAMPAIGN[camp][srcType].reduce((acc, cur) => acc+cur ,0)
				} else if (!srcType) {
					let types = this.budget.CAMPAIGN[camp];
					return Object.keys(types).reduce((acc, type) => acc + types[type].reduce((a, b) => a+b, 0) ,0)
				}
			}
			return 0
		}
	},
	created(){
	},
	template:`<div class="table-responsive-md">
	<table class="table table-sm table-hover shadow-sm">
		<thead>
			<tr class="bg-light text-dark">
				<th scope="col"><small class="font-weight-bold">Campaigns</small></th>
				<th scope="col"><small class="font-weight-bold"></small></th>
				<th scope="col"><small class="font-weight-bold">ACQ</small></th>
				<th scope="col"><small class="font-weight-bold">TRXS</small></th>
				<th scope="col"><small class="font-weight-bold">Adjusted Total</small></th>
				<th scope="col"><small class="font-weight-bold">Postage Alloc</small></th>
				<th scope="col"><small class="font-weight-bold">Total</small></th>
				<th scope="col" v-for="t in merchRevenueTypes"><small class="font-weight-bold"><< t >></small></th>
			</tr>
		</thead>
		<tbody>
			<template v-for="camp in merchCampaigns">
				<tr>
					<th rowspan="2" class="align-middle" ><small class="font-weight-bold"><< camp >></small></th>
					<td class="text-primary"><small>A</small></td>
					<td class="text-success"><small><< calc('SERIALNUMBER', 'unique', {CAMPAIGNCODE:camp, IS_ACQUISITION: -1})|number >></small></td>
					<td class="text-secondary"><small><< calc('TRXID', 'unique', {CAMPAIGNCODE:camp, ISTRX: -1})|number >></small></td>
					<td class="text-danger" v-if="camp===merchUnallocatedPostageCampaignCode"><small><< (calc(sumDimension, 'sum', {CAMPAIGNCODE:camp})-merchUnallocatedPostageSum)|currency >></small></td>
					<td class="text-dark" v-else><small class="font-weight-bold"><< (allocatePostage(calc(sumDimension, 'sum', {SOURCETYPE:'Merchandise Purchase', CAMPAIGNCODE:camp})) + calc(sumDimension, 'sum', {CAMPAIGNCODE:camp}))|currency >></small></td>
					<td class="text-danger"><small><< allocatePostage(calc(sumDimension, 'sum', {SOURCETYPE:'Merchandise Purchase', CAMPAIGNCODE:camp}))|currency >></small></td>
					<td class="text-info"><small><< calc(sumDimension, 'sum', {CAMPAIGNCODE:camp})|currency >></small></td>
					<td v-for="type in merchRevenueTypes"><small><< calc(sumDimension, 'sum', {SOURCETYPE:type, CAMPAIGNCODE:camp})|currency >></small></td>
				</tr>
				<tr class="font-italic">
					<td class="text-secondary"><small>B</small></td>
					<td class="text-secondary"><small>_</small></td>
					<td class="text-secondary"><small>_</small></td>
					<td class="text-secondary"><small><< campaignSourceTypeBudget(camp)|currency >></small></td>
					<td class="text-secondary"><small></small></td>
					<td class="text-secondary"><small><< campaignSourceTypeBudget(camp)|currency >></small></td>
					<td class="text-secondary" v-for="type in merchRevenueTypes"><small><< campaignSourceTypeBudget(camp, type)|currency >></small></td>
				</tr>
			</template>
		</tbody>
		<tfoot>
			<tr class="bg-light text-dark font-weight-bold">
				<th class="text-dark">TOTAL</th>
				<td class="text-primary">A</td>
				<td class="text-success"><< calc('SERIALNUMBER', 'unique', {IS_ACQUISITION: -1})|number >></td>
				<td class="text-secondary"><< calc('TRXID', 'unique', {ISTRX: -1})|number >></td>
				<td class="text-dark"><< calc(sumDimension, 'sum', {})|currency >></td>
				<td class="text-danger"><< merchUnallocatedPostageSum|currency >></td>
				<td class="text-info"><< calc(sumDimension, 'sum', {})|currency >></td>
				<td v-for="type in merchRevenueTypes"><< calc(sumDimension, 'sum', {SOURCETYPE:type})|currency >></td>
			</tr>
		</tfoot>
	</table>
	</div>`
});
// #############################################################################
// #############################################################################
let compareBarChartVue = Vue.component('chart-compare', {
	props: ['budget', 'merchRows', 'meta'],
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
		focalFY: function(){return this.$store.state.focalFY},
	},
	methods: {
		calcMerchMonthlyActual: function(dim){
			return this.merchRows.reduce((acc, cur) => {
				if (this.meta.isCumulative) {
					for(let i=cur.PAYMENT_FYMTH-1; i<acc.length; i++){
						acc[i] += cur[dim];
					}
				}else{
					acc[cur.PAYMENT_FYMTH-1] += cur[dim];
				}
				return acc
			}, [null, null, null, null, null, null, null, null, null, null, null, null]).map(v => this.formatNumberOutput(v));
		},
		formatNumberOutput: function(val){
			return val ? Number(val.toFixed(2)) : null
		}
	},
	mounted() {
		let merchGstBudget = (this.budget.FY[this.focalFY]['PRIVATE']['MerchandiseGST']);
		let merchTotalBudget = this.budget.FY[this.focalFY]['PRIVATE']['Merchandise'];
		// Create Chart
		this.chart = Highcharts.chart(Object.assign(this.baseOption, {
			chart: { renderTo: this.$el, type: 'column' },
			title: { text:  'Merchandise Monthly ' + this.meta.item + (this.meta.isCumulative ? ' Culmulative' : '') },
		}));
		// Add Series Budget GST
		this.chart.addSeries({
			name: 'Budget GST',
			stack: 'Budget',
			color: 'rgba(248,161,63,0.9)',
			pointPadding: 0.1,
			pointPlacement: 0,
			data: !this.meta.isCumulative ? merchGstBudget.map(v => this.formatNumberOutput(v)) : merchGstBudget.map((v, i1, self) => i1===0 ? v : self.filter((v, i2) => i2 <= i1).reduce((acc, cur) => acc + cur ,0)).map(v => this.formatNumberOutput(v))
		});
		// Add Series Budget Net
		this.chart.addSeries({
			name: 'Budget Net',
			stack: 'Budget',
			color: 'rgba(165,170,217,0.9)',
			pointPadding: 0.1,
			pointPlacement: 0,
			data: !this.meta.isCumulative ? merchTotalBudget.map((v, i) => this.formatNumberOutput(v - merchGstBudget[i])) : merchTotalBudget.map((v, i) => v - merchGstBudget[i]).map((v, i1, self) => i1===0 ? v : self.filter((v, i2) => i2 <= i1).reduce((acc, cur) => acc + cur ,0)).map(v => this.formatNumberOutput(v))
		});
		// Add Series Actual GST
		this.chart.addSeries({
			name: 'Actual GST',
			stack: 'Actual',
			color: 'rgba(186,60,61,1)',
			pointPadding: 0.3,
			pointPlacement: 0,
			data: this.calcMerchMonthlyActual('GSTAMOUNT')
		});
		// Add Series Actual Net
		this.chart.addSeries({
			name: 'Actual Net',
			stack: 'Actual',
			color: 'rgba(126,86,134,1)',
			pointPadding: 0.3,
			pointPlacement: 0,
			data: this.calcMerchMonthlyActual('PAYMENTAMOUNTNETT')
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
		paymentDataReady: false,
		budgetDataReady: false,
		payments: null,
		budget: null,
	},
	store,
	computed: {
		focalFY: {
			get: function() {
				return this.$store.state.focalFY
			},
			set: function(newVal) {
				this.$store.commit('SET_FOCALFY',newVal);
			}
		},
		calcDimensionSum: {
			get: function() {
				return this.$store.state.calcDimensionSum
			},
			set: function(newVal) {
				this.$store.commit('SET_CALC_DIMENSION_SUM',newVal);
			}
		},
		focalDonorTypes: {
			get: function() {
				return this.$store.state.focalDonorTypes
			},
			set: function(newVal) {
				this.$store.commit('SET_FOCAL_DONORTYPES',newVal);
			}
		},
		donorTypes: function(){
			return [...new Set(this.merchRows.map(v => v.LINE_FY_DONTYPE))].sort()
		},
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
		focalFY: {
			handler: 'getData',
			immediate: true
		},
	},
	methods: {
		sumTotal: function (dim){
			return this.merchRows.reduce((acc, cur) => acc + cur[dim] , 0)
		},
		countUnique: function (dim){
			return new Set(this.merchRows.map(r => r[dim])).size
		},
		calc: function(dim, clacType ,filters){
			let result = 0;
			let rows = !filters ? this.merchRows : this.merchRows.filter(r => {
				return Object.keys(filters).reduce((acc, key) =>	acc && (r[key] === filters[key]), true);
			});
			if(clacType==='sum'){
				result = rows.reduce((acc, cur) => acc += cur[dim], 0);
			}else if(clacType==='unique'){
				result = new Set(rows.map(r => r[dim])).size
			}
			return Number(result.toFixed(2))
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
				this.focalDonorTypes = this.donorTypes;
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
	<p class="lead my-0">Merchandise Platform Performance FY<< focalFY >></p>
	<p class="mt-0 mb-1"><small class="text-muted font-italic">Data Captured : << payments.timestamp|dtAU >><small></p>
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
			<div class="card-counter primary">
				<span class="count-icon">&#128202;</span>
				<span class="count-numbers"><< (sumTotal("PAYMENTAMOUNTNETT")/calcLTDBudget())|pct(2) >></span>
				<span class="count-name">As of YTM Budget(exc GST)</span>
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter success">
				<span class="count-icon">&#128178;</span>
				<span class="count-numbers"><< (calc("PAYMENTAMOUNTNETT","sum",{SOURCETYPE: 'Merchandise Purchase'}) + calc("PAYMENTAMOUNTNETT","sum",{SOURCETYPE: 'Merchandise Postage'}) )|currency >></span>
				<span class="count-name">Purchase+Postage(exc GST)</span>
			</div>
		</div>
		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter success">
				<span class="count-icon">&#128178;</span>
				<span class="count-numbers"><< calc("PAYMENTAMOUNT","sum",{SOURCETYPE: 'Merchandise Donation'})|currency >></span>
				<span class="count-name">Donation</span>
			</div>
		</div>
		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter success">
				<span class="count-icon">&#128178;</span>
				<span class="count-numbers"><< calc("PAYMENTAMOUNT","sum",{SOURCETYPE: 'Merchandise Gift of Love'})|currency >></span>
				<span class="count-name">GOL</span>
			</div>
		</div>
		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter success">
				<span class="count-icon">&#128178;</span>
				<span class="count-numbers"><< calc("PAYMENTAMOUNT","sum",{SOURCETYPE: 'Merchandise Sponsorship'})|currency >></span>
				<span class="count-name">Sponsorship</span>
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
			<compare-chart v-bind:budget="budget" v-bind:merchRows="merchRows" v-bind:meta="{isCumulative: false, item: 'Revenue', clacType: 'sum'}"></compare-chart>
		</div>
		<div class="col-lg-6">
			<compare-chart v-bind:budget="budget" v-bind:merchRows="merchRows" v-bind:meta="{isCumulative: true, item: 'Revenue', clacType: 'sum'}"></compare-chart>
		</div>
	</div>

	<div class="row my-1">
		<div class="col">
			<div>
				<span>Revenue Calc : </span>
				<input type="radio" id="one" value="PAYMENTAMOUNTNETT" v-model="calcDimensionSum">
				<label for="one">Net</label>

				<input type="radio" id="two" value="PAYMENTAMOUNT" v-model="calcDimensionSum">
				<label for="two">Total</label>

				<input type="radio" id="three" value="GSTAMOUNT" v-model="calcDimensionSum">
				<label for="three">GST</label>
			</div>

			<div>
				<span>Donor Type Included : </span>
				<template v-for="dt in donorTypes">
					<input type="checkbox" v-bind:id="dt" v-bind:value="dt" v-model="focalDonorTypes">
					<label v-bind:for="dt"> << dt +'. ' >></label>
				</template>

			</div>

		</div>
	</div>

	<div class="row my-1">
		<div class="col">
			<summary-talbe v-bind:merchRows="merchRows" v-bind:budget="budgetObj"></summary-talbe>
		</div>
	</div>

	</div>`
});
