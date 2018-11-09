// #############################################################################
// #############################################################################
const store = new Vuex.Store({
	state: {
		focalFY: $CFY,
		calcDimensionSum: 'PAYMENTAMOUNTNETT',
		arbitraryMerchPostageCampaignCode: '____.M Postage',
		focalDonorTypes: [],
		focalSourceTypes: [],
		focalCampaign: null,
		campaignActualBudget: [-1]
	},
	mutations: {
		SET_FOCALFY: (state, payload) => state.focalFY = payload,
		SET_CALC_DIMENSION_SUM: (state, payload) => state.calcDimensionSum = payload,
		SET_FOCAL_DONORTYPES: (state, payload) => state.focalDonorTypes = payload,
		SET_FOCAL_CAMPAIGN: (state, payload) => state.focalCampaign = payload,
		ADD_FOCAL_SOURCETYPE: (state, payload) => state.focalSourceTypes.push(payload),
		REMOVE_FOCAL_SOURCETYPE: (state, payload) => state.focalSourceTypes.splice(state.focalSourceTypes.indexOf(payload), 1) ,
		SET_CAMPAIGN_ACTUAL_BUDGET: (state, payload) => state.campaignActualBudget = payload,

	}
});
// #############################################################################
// #############################################################################
let summaryTable = Vue.component('table-summary', {
	props: ['merchRows', 'merchBudgetRows'],
	computed:{
		...Vuex.mapState([
			'focalFY', 'calcDimensionSum', 'merchUnallocatedPostageCampaignCode', 'focalDonorTypes', 'focalSourceTypes', 'focalCampaign', 'campaignActualBudget'
		]),
		actualCampaigns:function(){return new Set(this.merchRows.map(v => v.CAMPAIGNCODE))},
		budgetCampaigns:function(){return new Set(this.merchBudgetRows.map(v => v.CAMPAIGNCODE))},
		merchCampaigns: function(){return [...new Set([...this.actualCampaigns, ...this.budgetCampaigns])].sort()},
		merchRevenueTypes: function(){return Array.from(new Set(this.merchRows.map(v => v.SOURCETYPE))).sort()},
		merchUnallocatedPostageSum: function(){
			return this.merchRows.filter(v => v.CAMPAIGNCODE===this.merchUnallocatedPostageCampaignCode).map(v => v[this.calcDimensionSum]).reduce((acc, cur) => acc+=cur,0)
		},
		merchPostagePerPurchase: function(){
			return this.merchUnallocatedPostageSum/this.merchRows.filter(v => v.SOURCETYPE==='Merchandise Purchase').map(v => v[this.calcDimensionSum]).reduce((acc, cur) => acc+=cur,0)
		},
		filteredRows: function(){
			let row = this.merchRows;
			row = row.filter(r => {
				return !this.focalDonorTypes ? false : this.focalDonorTypes.reduce((acc, cur)=> {
					return acc || r.LINE_FY_DONTYPE === cur
				}, false)
			});
			return row
		},
	},
	methods:{
		setFocalCampaign: function(camp){
			this.$store.commit('SET_FOCAL_CAMPAIGN', this.focalCampaign === camp ? null : camp)
		},
		setFocalSourceTypes: function(srcType){
			if (this.focalSourceTypes.indexOf(srcType) === -1 ){
				this.$store.commit('ADD_FOCAL_SOURCETYPE', srcType)
			} else {
				this.$store.commit('REMOVE_FOCAL_SOURCETYPE', srcType)
			}
		},
		checkCampaignExist: function(camp){
			if (this.actualCampaigns.has(camp) && this.budgetCampaigns.has(camp)) {
				return -1
			}else if (this.actualCampaigns.has(camp) && !this.budgetCampaigns.has(camp) && (camp.slice(0,2) !== String(String(this.focalFY).slice(-2) -1) && camp.slice(-2) !== String(String(this.focalFY).slice(-2) -1) ) ){
				return -2
			}else if (!this.actualCampaigns.has(camp) && this.budgetCampaigns.has(camp)){
				return -3
			}else {
				return 0
			}
		},
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
		sumBudget: function(calcDim, filters) {
			let result = 0;
			let rows;
			if (filters) {
				rows = this.merchBudgetRows.filter(r => (r.CALC === calcDim) && Object.keys(filters).reduce((acc, key) =>	acc && (r[key] === filters[key]), true));
			}else {
				rows = this.merchBudgetRows.filter(r => r.CALC === calcDim);
			}
			if(calcDim = 'REVENUE'){
				if (this.calcDimensionSum === 'GSTAMOUNT' ) {
					result = rows.filter(r => r.SOURCETYPE === 'Merchandise Purchase' || r.SOURCETYPE === 'Merchandise Postage').reduce((acc, cur) => acc + cur.VALUES.reduce((a, b) => a + b,0), 0) * 0.1
				} else if (this.calcDimensionSum === 'PAYMENTAMOUNT') {
					result = rows.reduce((acc, cur) => acc + cur.VALUES.reduce((a, b) => a + b,0), 0) +
						(rows.filter(r => r.SOURCETYPE === 'Merchandise Purchase' || r.SOURCETYPE === 'Merchandise Postage').reduce((acc, cur) => acc + cur.VALUES.reduce((a, b) => a + b,0), 0) * 0.1)
				} else {
					result = rows.reduce((acc, cur) => acc + cur.VALUES.reduce((a, b) => a + b,0), 0)
				}
			} else {
				result = rows.reduce((acc, cur) => acc + cur.VALUES.reduce((a, b) => a + b,0), 0)
			}
			return Number(result.toFixed(2))
		},
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
				<th scope="col" v-for="t in merchRevenueTypes" v-on:dblclick="setFocalSourceTypes(t)" v-bind:class="{'table-success': focalSourceTypes.indexOf(t) !== -1}" style="cursor: pointer;">
					<small class="font-weight-bold"><< t >></small>
				</th>
			</tr>
		</thead>
		<tbody>
			<template v-for="camp in merchCampaigns" v-if="campaignActualBudget.indexOf(checkCampaignExist(camp))!==-1">
				<tr v-on:dblclick="setFocalCampaign(camp)" v-bind:class="{'table-success': focalCampaign===camp}" style="cursor: -webkit-grab; cursor: grab;">
					<th rowspan="2" class="align-middle" v-bind:class="{'text-primary': checkCampaignExist(camp)===-1, 'text-success': checkCampaignExist(camp)===-2, 'text-danger': checkCampaignExist(camp)===-3}" >
						<small class="font-weight-bold"><< camp >></small>
					</th>
					<td class="text-primary"><small>A</small></td>
					<td class="text-success"><small><< calc('SERIALNUMBER', 'unique', {CAMPAIGNCODE:camp, IS_ACQUISITION: -1})|number >></small></td>
					<td class="text-secondary"><small class="font-weight-bold"><< calc('TRXID', 'unique', {CAMPAIGNCODE:camp, ISTRX: -1})|number >></small></td>
					<td class="text-danger" v-if="camp===merchUnallocatedPostageCampaignCode"><small><< (calc(calcDimensionSum, 'sum', {CAMPAIGNCODE:camp})-merchUnallocatedPostageSum)|currency >></small></td>
					<td class="text-dark" v-else><small class="font-weight-bold"><< (allocatePostage(calc(calcDimensionSum, 'sum', {SOURCETYPE:'Merchandise Purchase', CAMPAIGNCODE:camp})) + calc(calcDimensionSum, 'sum', {CAMPAIGNCODE:camp}))|currency >></small></td>
					<td class="text-danger"><small><< allocatePostage(calc(calcDimensionSum, 'sum', {SOURCETYPE:'Merchandise Purchase', CAMPAIGNCODE:camp}))|currency >></small></td>
					<td class="text-info"><small><< calc(calcDimensionSum, 'sum', {CAMPAIGNCODE:camp})|currency >></small></td>
					<td v-for="type in merchRevenueTypes"><small><< calc(calcDimensionSum, 'sum', {SOURCETYPE:type, CAMPAIGNCODE:camp})|currency >></small></td>
				</tr>
				<tr class="font-italic bg-light">
					<td class="text-secondary"><small>B</small></td>
					<td class="text-secondary"><small>-</small></td>
					<td class="text-secondary"><small><< sumBudget('TRANSACTION', {CAMPAIGNCODE: camp})|number >></small></td>
					<td class="text-secondary"><small><< sumBudget('REVENUE', {CAMPAIGNCODE: camp})|currency >></small></td>
					<td class="text-secondary"><small><< sumBudget('REVENUE', {CAMPAIGNCODE: camp, SOURCETYPE: 'Merchandise Postage'})|currency >></small></td>
					<td class="text-secondary"><small><< sumBudget('REVENUE', {CAMPAIGNCODE: camp})|currency >></small></td>
					<td class="text-secondary" v-for="type in merchRevenueTypes"><small><< sumBudget('REVENUE', {CAMPAIGNCODE: camp, SOURCETYPE: type})|currency >></small></td>
				</tr>
			</template>
		</tbody>
		<tfoot>
			<tr class="bg-light text-dark font-weight-bold">
				<th class="text-dark text-right font-italic">STATIC ACTUAL TOTAL</th>
				<td class="text-primary">-</td>
				<td class="text-success"><< calc('SERIALNUMBER', 'unique', {IS_ACQUISITION: -1})|number >></td>
				<td class="text-secondary"><< calc('TRXID', 'unique', {ISTRX: -1})|number >></td>
				<td class="text-dark"><< calc(calcDimensionSum, 'sum', {})|currency >></td>
				<td class="text-danger"><< merchUnallocatedPostageSum|currency >></td>
				<td class="text-info"><< calc(calcDimensionSum, 'sum', {})|currency >></td>
				<td v-for="type in merchRevenueTypes"><< calc(calcDimensionSum, 'sum', {SOURCETYPE:type})|currency >></td>
			</tr>
			<tr class="bg-light text-dark">
				<th class="text-dark text-right font-italic">STATIC BUDGET TOTAL</th>
				<td class="text-primary"></td>
				<td class="text-success">-</td>
				<td class="text-secondary"><< sumBudget('TRANSACTION')|number >></td>
				<td class="text-dark"><< sumBudget('REVENUE')|currency >></td>
				<td class="text-danger"><< sumBudget('REVENUE', {SOURCETYPE: 'Merchandise Postage'})|currency >></td>
				<td class="text-info"><< sumBudget('REVENUE')|currency >></td>
				<td v-for="type in merchRevenueTypes"><< sumBudget('REVENUE', {SOURCETYPE: type})|currency >></td>
			</tr>
		</tfoot>
	</table>
	</div>`
});
// #############################################################################
// #############################################################################
let compareBarChartVue = Vue.component('chart-compare', {
	props: ['merchBudgetRows', 'merchRows', 'meta'],
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
		...Vuex.mapState([
			'focalFY', 'calcDimensionSum', 'focalDonorTypes', 'focalSourceTypes', 'focalCampaign'
		]),
		filteredMerchRows: function(){
			return this.merchRows.filter(r => (this.focalCampaign? r.CAMPAIGNCODE === this.focalCampaign : true)
				&& (!this.focalDonorTypes ? false : this.focalDonorTypes.reduce((acc, cur)=>  acc || r.LINE_FY_DONTYPE === cur, false))
				&& (!this.focalSourceTypes ? false : this.focalSourceTypes.reduce((acc, cur)=>  acc || r.SOURCETYPE === cur, false))
			)
		},
		filteredBudgetRows:function(){
			return this.merchBudgetRows.filter(r => r.CALC==="REVENUE" && (this.focalCampaign? r.CAMPAIGNCODE === this.focalCampaign : true )
				&& (!this.focalSourceTypes ? false : this.focalSourceTypes.reduce((acc, cur)=>  acc || r.SOURCETYPE === cur, false))
			)
		},
		monthlyActual: function(){
			return this.filteredMerchRows.reduce((acc, cur) => {
				if (this.meta.isCumulative) {
					for(let i=cur.PAYMENT_FYMTH-1; i<12; i++){
						acc[i] += cur[this.calcDimensionSum];
					}
				}else{
					acc[cur.PAYMENT_FYMTH-1] += cur[this.calcDimensionSum];
				}
				return acc
			}, [null, null, null, null, null, null, null, null, null, null, null, null]).map(v => this.formatNumberOutput(v))
		},
		monthlyBudgetGST: function(){
			return this.filteredBudgetRows
			.filter(r => r.SOURCETYPE === 'Merchandise Purchase' || r.SOURCETYPE === 'Merchandise Postage')
			.reduce((acc, cur) => {
				if (this.meta.isCumulative) {
					for(let m=0; m<12; m++){
						for (let n=m; n<12; n++){
							acc[n] += cur.VALUES[m]
						}
					}
				}else{
					for(let m=0; m<12; m++){
						acc[m] += cur.VALUES[m]
					}
				}
				return acc
			}, [null, null, null, null, null, null, null, null, null, null, null, null]).map(v => v*0.1)
		},
		monthlyBudgetNet: function(){
			return this.filteredBudgetRows.reduce((acc, cur) => {
				if (this.meta.isCumulative) {
					for(let m=0; m<12; m++){
						for (let n=m; n<12; n++){
							acc[n] += cur.VALUES[m]
						}
					}
				}else{
					for(let m=0; m<12; m++){
						acc[m] += cur.VALUES[m]
					}
				}
				return acc
			}, [null, null, null, null, null, null, null, null, null, null, null, null])
		},
		monthlyBudget: function(){
			let result;
			if (this.calcDimensionSum ==='PAYMENTAMOUNTNETT'){
				result = this.monthlyBudgetNet
			}else if(this.calcDimensionSum ==='GSTAMOUNT'){
				result = this.monthlyBudgetGST
			}else if(this.calcDimensionSum ==='PAYMENTAMOUNT'){
				result = this.monthlyBudgetNet.map((v,i) => v + this.monthlyBudgetGST[i])
			}
			return result.map(v => this.formatNumberOutput(v))
		},
		seriesName: function(){
			if (this.calcDimensionSum === 'PAYMENTAMOUNTNETT') {
				return 'Net'
			}else if (this.calcDimensionSum === 'PAYMENTAMOUNT'){
				return 'Total'
			}else if (this.calcDimensionSum === 'GSTAMOUNT'){
				return 'GST'
			}
		}
	},
	watch:{
		calcDimensionSum: function(newVal, oldVal){ this.reDraw(); },
		focalCampaign: function(newVal, oldVal){ this.reDraw(); },
		focalDonorTypes: function(newVal, oldVal){ this.reDraw(); },
		focalSourceTypes: function(newVal, oldVal){ this.reDraw(); }
	},
	methods: {
		formatNumberOutput: function(val){
			return val ? Number(val.toFixed(2)) : null
		},
		reDraw: function(){
			this.chart.update({
				subtitle: { text:  (this.focalCampaign ? ' [' + this.focalCampaign + ']' : 'All Campaigns') },
			});
			this.chart.series.forEach(s => {
				if (s.stackKey.indexOf('Budget')!==-1) {
					s.update({
						name: 'Budget ' + this.seriesName,
						color: this.calcDimensionSum === 'PAYMENTAMOUNTNETT' ? 'rgba(165,170,217,0.7)' : (this.calcDimensionSum === 'GSTAMOUNT' ?  'rgba(255,186,90,0.7)' : 'rgba(39,142,165,0.7)'),
					});
					s.setData(this.monthlyBudget);
				}else if(s.stackKey.indexOf('Actual')!==-1) {
					s.update({
						name: 'Actual ' + this.seriesNam ,
						color: this.calcDimensionSum === 'PAYMENTAMOUNTNETT' ? 'rgba(126,86,134,0.9)' : (this.calcDimensionSum === 'GSTAMOUNT' ?  'rgba(255,118,87,0.9)' : 'rgba(33,230,193,0.9)'),
					});
					s.setData(this.monthlyActual);
				}
			});
		}
	},
	mounted() {
		// Create Chart
		this.chart = Highcharts.chart(Object.assign(this.baseOption, {
			chart: { renderTo: this.$el, type: 'column' },
			title: { text:  'Merchandise Monthly ' + this.meta.item + (this.meta.isCumulative ? ' Culmulative' : '') },
		}));
		// Add Series Budget Net
		this.chart.addSeries({
			name: 'Budget ' + this.seriesName,
			stack: 'Budget',
			color: 'rgba(165,170,217,0.7)',
			pointPadding: 0.1,
			pointPlacement: 0,
			data: this.monthlyBudget
		});
		// Add Series Actual Net
		this.chart.addSeries({
			name: 'Actual ' + this.seriesName,
			stack: 'Actual',
			color: 'rgba(126,86,134,0.9)',
			pointPadding: 0.3,
			pointPlacement: 0,
			data: this.monthlyActual
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
		campaignActualBudget: {
			get: function() {
				return this.$store.state.campaignActualBudget
			},
			set: function(newVal) {
				this.$store.commit('SET_CAMPAIGN_ACTUAL_BUDGET',newVal);
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
		merchBudgetRows: function(){
			return this.budget.rows.filter(r => r.CLASS1 === 15)
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
		initMerchSrcTypes: function(){
			[...new Set(this.merchRows.map(r => r.SOURCETYPE))].forEach(s => this.$store.commit('ADD_FOCAL_SOURCETYPE', s) );
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
				this.initMerchSrcTypes();
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
			<compare-chart v-bind:merchBudgetRows="merchBudgetRows" v-bind:merchRows="merchRows" v-bind:meta="{isCumulative: false, item: 'Revenue', clacType: 'sum'}"></compare-chart>
		</div>
		<div class="col-lg-6">
			<compare-chart v-bind:merchBudgetRows="merchBudgetRows" v-bind:merchRows="merchRows" v-bind:meta="{isCumulative: true, item: 'Revenue', clacType: 'sum'}"></compare-chart>
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

			<div>
				<span>Campaign Color(not applicable to total row) : </span>
				<input type="checkbox" v-bind:id="-1" v-bind:value="-1" v-model="campaignActualBudget">
				<label v-bind:for="-1" class="text-primary">In Both</label>
				<input type="checkbox" v-bind:id="-2" v-bind:value="-2" v-model="campaignActualBudget">
				<label v-bind:for="-1" class="text-success">Actual Only</label>
				<input type="checkbox" v-bind:id="-3" v-bind:value="-3" v-model="campaignActualBudget">
				<label v-bind:for="-1" class="text-danger">Budget Only</label>
				<input type="checkbox" v-bind:id="0" v-bind:value="0" v-model="campaignActualBudget">
				<label v-bind:for="0">Other</label>
			</div>

		</div>
	</div>

	<div class="row my-1">
		<div class="col">
			<summary-talbe v-bind:merchRows="merchRows" v-bind:merchBudgetRows="merchBudgetRows"></summary-talbe>
		</div>
	</div>

	</div>`
});
