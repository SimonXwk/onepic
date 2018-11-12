// ##########################################################################################################################################################
// ##########################################################################################################################################################
const store = new Vuex.Store({
	state: {
		focalFY: $CFY,
		payments: null,
		budget: null,
		// Filters
		focalDonorTypes: [],
		focalSourceTypes: [],
		focalCampaigns: [],
		// Other Controllers
		calcDimensionSum: 'PAYMENTAMOUNTNETT',
		campaignActualBudget: [-1],
		arbitraryMerchPostageCampaignCode: '____.M Postage',
	},
	mutations: {
		SET_PAYMENTS:  (state, payload) => state.payments = payload,
		SET_BUDGET:  (state, payload) => state.budget = payload,
		SET_FOCALFY: (state, payload) => state.focalFY = payload,
		SET_CALC_DIMENSION_SUM: (state, payload) => state.calcDimensionSum = payload,
		SET_FOCAL_DONORTYPES: (state, payload) => state.focalDonorTypes = payload,
		ADD_FOCAL_CAMPAIGN: (state, payload) => state.focalCampaigns.push(payload),
		REMOVE_FOCAL_CAMPAIGN: (state, payload) => state.focalCampaigns.splice(state.focalCampaigns.indexOf(payload), 1) ,
		ADD_FOCAL_SOURCETYPE: (state, payload) => state.focalSourceTypes.push(payload),
		REMOVE_FOCAL_SOURCETYPE: (state, payload) => state.focalSourceTypes.splice(state.focalSourceTypes.indexOf(payload), 1) ,
		SET_CAMPAIGN_ACTUAL_BUDGET: (state, payload) => state.campaignActualBudget = payload,
	},
	actions: {
		fetchPayments(ctx, fy){
			fy = fy ? fy : ctx.state.focalFY;
			return new Promise((resolve, reject) => {
				fetchJSON(endpoint('/api/tq/payments' + '?fy=' + fy), (pmtJSON) => {
					ctx.commit('SET_PAYMENTS', pmtJSON);
					resolve()
				});
			});
		},
		fetchBudget(ctx){
			return new Promise((resolve, reject) => {
				fetchJSON(endpoint('/api/budget'), (bgtJSON) => {
					ctx.commit('SET_BUDGET', bgtJSON);
					resolve()
				});
			});
		}
	},
	getters: {
		merchRows: (state, getters) => (state.payments.rows ? state.payments.rows.filter(p => p.SOURCETYPE.indexOf('Merch') !== -1 ) : []),
		nonMerchRows:  (state, getters) => (state.payments.rows ? state.payments.rows.filter(p => p.SOURCETYPE.indexOf('Merch') === -1 ) : []),
		merchBudgetRows: (state, getters) => (state.budget.rows ? state.budget.rows.filter(r => r.CLASS1 === 15 && r.FY === state.focalFY) : []),
		merchTotalUnallocatedPostage: (state, getters) => (getters.merchRows.filter(v => v.CAMPAIGNCODE===state.arbitraryMerchPostageCampaignCode).reduce((acc, cur) => acc+cur[state.calcDimensionSum],0)),
		filteredMerchRows: (state, getters) => {
			return getters.merchRows.filter(r =>
				( state.focalCampaigns.length!==0 ? state.focalCampaigns.indexOf(r.CAMPAIGNCODE) !==-1 : true)
				&& ( (state.focalSourceTypes.length===0) ? false : state.focalSourceTypes.reduce((acc, cur)=>  acc || r.SOURCETYPE === cur, false))
				&& ( (state.focalDonorTypes.length===0) ? false : state.focalDonorTypes.reduce((acc, cur)=>  acc || r.LINE_FY_DONTYPE2 === cur, false))
			)
		},
		filteredBudgetRows: (state, getters) => {
			return getters.merchBudgetRows.filter(r =>
				( ( state.focalCampaigns.length!==0)  ? state.focalCampaigns.indexOf(r.CAMPAIGNCODE) !==-1 : true ) // Budget Must Have Campaign Code for every row
				&& ( !r.SOURCETYPE ? true :  ( state.focalSourceTypes.length===0 ? false : state.focalSourceTypes.reduce((acc, cur)=>  acc || r.SOURCETYPE  === cur, false)))  // Allow SOURCETYPE to be empty
			)
		},
	}
});
// #############################################################################
// #############################################################################
let summaryTable = Vue.component('table-summary', {
	computed:{
		...Vuex.mapState([
			'focalFY', 'calcDimensionSum', 'arbitraryMerchPostageCampaignCode', 'focalDonorTypes', 'focalSourceTypes', 'focalCampaigns', 'campaignActualBudget'
		]),
		...Vuex.mapGetters(['merchRows', 'merchBudgetRows', 'merchTotalUnallocatedPostage']),
		actualCampaigns:function(){return new Set(this.merchRows.map(v => v.CAMPAIGNCODE))},
		budgetCampaigns:function(){return new Set(this.merchBudgetRows.map(v => v.CAMPAIGNCODE))},
		merchCampaigns: function(){return [...new Set([...this.actualCampaigns, ...this.budgetCampaigns])].sort()},
		merchRevenueTypes: function(){return Array.from(new Set(this.merchRows.map(v => v.SOURCETYPE))).sort()},
		merchPostagePerPurchase: function(){
			return this.merchTotalUnallocatedPostage/this.merchRows.filter(v => v.SOURCETYPE==='Merchandise Purchase').map(v => v[this.calcDimensionSum]).reduce((acc, cur) => acc+=cur,0)
		},
		filteredMerchRows: function(){
			return this.merchRows.filter(r => {
				return !this.focalDonorTypes ? false : this.focalDonorTypes.reduce((acc, cur)=> {
					return acc || r.LINE_FY_DONTYPE2 === cur
				}, false)
			});
		},
	},
	methods:{
		setFocalCampaign: function(camp){
			this.focalCampaigns.indexOf(camp) === -1 ? this.$store.commit('ADD_FOCAL_CAMPAIGN', camp) : this.$store.commit('REMOVE_FOCAL_CAMPAIGN', camp)
		},
		updateFocalSourceTypes: function(srcType){
			this.focalSourceTypes.indexOf(srcType) === -1 ? this.$store.commit('ADD_FOCAL_SOURCETYPE', srcType) : this.$store.commit('REMOVE_FOCAL_SOURCETYPE', srcType)
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
			let rows = !filters ? this.filteredMerchRows : this.filteredMerchRows.filter(r => {
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
	template:`<div class="table-responsive">
	<table class="table table-sm table-hover shadow-sm">
		<thead>
			<tr class="bg-light text-dark">
				<th scope="col"><small class="font-weight-bold">Campaigns</small></th>
				<th scope="col"><small class="font-weight-bold"></small></th>
				<th scope="col"><small class="font-weight-bold">ACQ</small></th>
				<th scope="col"><small class="font-weight-bold">NoC</small></th>
				<th scope="col"><small class="font-weight-bold">TRXS</small></th>
				<th scope="col"><small class="font-weight-bold">Adjusted Total</small></th>
				<th scope="col"><small class="font-weight-bold">Postage Alloc</small></th>
				<th scope="col"><small class="font-weight-bold">Total</small></th>
				<th scope="col" v-for="t in merchRevenueTypes" v-on:click="updateFocalSourceTypes(t)" v-bind:class="{'table-success': focalSourceTypes.indexOf(t) !== -1, 'table-warning': focalSourceTypes.indexOf(t) === -1}" style="cursor: pointer;">
					<small class="font-weight-bold"><< t >></small>
				</th>
			</tr>
		</thead>
		<tbody>
			<template v-for="camp in merchCampaigns" v-if="campaignActualBudget.indexOf(checkCampaignExist(camp))!==-1">
				<tr v-on:dblclick="setFocalCampaign(camp)" v-bind:class="{'table-success': focalCampaigns.indexOf(camp)!==-1}" style="cursor: -webkit-grab; cursor: grab;">
					<th rowspan="2" class="align-middle" v-bind:class="{'text-primary': checkCampaignExist(camp)===-1, 'text-success': checkCampaignExist(camp)===-2, 'text-danger': checkCampaignExist(camp)===-3}" >
						<small class="font-weight-bold"><< camp >></small>
					</th>
					<td class="text-primary"><small>A</small></td>
					<td class="text-success"><small><< calc('SERIALNUMBER', 'unique', {CAMPAIGNCODE:camp, IS_ACQUISITION: -1})|number >></small></td>
					<td class="text-primary"><small><< calc('SERIALNUMBER', 'unique', {CAMPAIGNCODE:camp})|number >></small></td>
					<td class="text-secondary"><small class="font-weight-bold"><< calc('TRXID', 'unique', {CAMPAIGNCODE:camp, ISTRX: -1})|number >></small></td>
					<td class="text-danger" v-if="camp===arbitraryMerchPostageCampaignCode"><small><< (calc(calcDimensionSum, 'sum', {CAMPAIGNCODE:camp})-merchTotalUnallocatedPostage)|currency >></small></td>
					<td class="text-dark" v-else><small class="font-weight-bold"><< (allocatePostage(calc(calcDimensionSum, 'sum', {SOURCETYPE:'Merchandise Purchase', CAMPAIGNCODE:camp})) + calc(calcDimensionSum, 'sum', {CAMPAIGNCODE:camp}))|currency >></small></td>
					<td class="text-danger"><small><< allocatePostage(calc(calcDimensionSum, 'sum', {SOURCETYPE:'Merchandise Purchase', CAMPAIGNCODE:camp}))|currency >></small></td>
					<td class="text-info"><small><< calc(calcDimensionSum, 'sum', {CAMPAIGNCODE:camp})|currency >></small></td>
					<td v-for="type in merchRevenueTypes"><small><< calc(calcDimensionSum, 'sum', {SOURCETYPE:type, CAMPAIGNCODE:camp})|currency >></small></td>
				</tr>
				<tr class="font-italic bg-light">
					<td class="text-secondary"><small>B</small></td>
					<td class="text-secondary"><small>-</small></td>
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
				<th class="text-dark text-right"><small class="font-weight-bold">ACTUAL:</small></th>
				<td class="text-primary"><small class="font-weight-bold"></small></td>
				<td class="text-success"><small class="font-weight-bold"><< calc('SERIALNUMBER', 'unique', {IS_ACQUISITION: -1})|number >></small></td>
				<td class="text-primary"><small class="font-weight-bold"><< calc('SERIALNUMBER', 'unique')|number >></small></td>
				<td class="text-dark"><small class="font-weight-bold"><< calc('TRXID', 'unique', {ISTRX: -1})|number >></small></td>
				<td class="text-dark"><small class="font-weight-bold"><< calc(calcDimensionSum, 'sum', {})|currency >></small></td>
				<td class="text-danger"><small class="font-weight-bold"><< merchTotalUnallocatedPostage|currency >></small></td>
				<td class="text-info"><small class="font-weight-bold"><< calc(calcDimensionSum, 'sum', {})|currency >></small></td>
				<td v-for="type in merchRevenueTypes"><small class="font-weight-bold"><< calc(calcDimensionSum, 'sum', {SOURCETYPE:type})|currency >></small></td>
			</tr>
			<tr class="bg-light text-secondary">
				<th class="text-right"><small class="font-weight-bold">BUDGET:</small></th>
				<td class="text-primary"><small class="font-weight-bold"></small></td>
				<td class="text-success"><small class="font-weight-bold">-</small></td>
				<td><small class="font-weight-bold">-</small></td>
				<td class="text-secondary"><small class="font-weight-bold"><< sumBudget('TRANSACTION')|number >></small></td>
				<td><small class="font-weight-bold"><< sumBudget('REVENUE')|currency >></small></td>
				<td><small class="font-weight-bold"><< sumBudget('REVENUE', {SOURCETYPE: 'Merchandise Postage'})|currency >></small></td>
				<td><small class="font-weight-bold"><< sumBudget('REVENUE')|currency >></small></td>
				<td v-for="type in merchRevenueTypes"><small class="font-weight-bold"><< sumBudget('REVENUE', {SOURCETYPE: type})|currency >></small></td>
			</tr>
		</tfoot>
	</table>
	</div>`
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
let compareBarChartVue = Vue.component('chart-compare', {
	props: ['meta'],
	data: function(){
		return {
			baseOption: {
				chart: { renderTo: null, type: 'column' },
				title: { text: null },
				xAxis: { categories: $FY_MONTH_LIST.short },
				yAxis: { title: {	text: null } },
				legend: { shadow: false},
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
		...Vuex.mapState(['focalFY', 'calcDimensionSum', 'focalDonorTypes', 'focalSourceTypes', 'focalCampaigns']),
		...Vuex.mapGetters(['merchRows', 'merchBudgetRows', 'filteredMerchRows', 'filteredBudgetRows']),
		isRevenue: function(){ return this.meta.item ==='Revenue' },
		calcDim: function(){
			if (this.meta.item ==='Revenue') {
				return this.calcDimensionSum
			} else if (this.meta.item ==='Transaction') {
				return 'TRXID'
			} else if (this.meta.item ==='Contact') {
				return 'SERIALNUMBER'
			}
		},
		budgetDeadultColor: function(){
			 return this.isRevenue ? 'rgba(165,170,217,0.7)' : (this.meta.item ==='Transaction' ? 'rgba(62,67,46,0.7)' : 'rgba(255,223,211,0.7)')
		},
		actualDeafultColor: function(){
			return this.isRevenue ? 'rgba(126,86,134,0.9)' : (this.meta.item ==='Transaction' ? 'rgba(167,209,41,0.9)' : 'rgba(149,125,173,0.9)')
		},
		monthlyActual: function(){
			if(this.isRevenue){
				return this.filteredMerchRows.reduce((acc, cur) => {
					if (this.meta.isCumulative) {
						for(let i=cur.PAYMENT_FYMTH-1; i<12; i++){
							acc[i] += cur[this.calcDim];
						}
					}else{
						acc[cur.PAYMENT_FYMTH-1] += cur[this.calcDim];
					}
					return acc
				}, [null, null, null, null, null, null, null, null, null, null, null, null]).map(v => this.formatNumberOutput(v))
			} else {
				return this.filteredMerchRows.filter(r => r.ISTRX===-1).reduce((acc, cur) => {
						if (this.meta.isCumulative) {
							for(let i=cur.PAYMENT_FYMTH-1; i<12; i++){
								acc[i].add(cur[this.calcDim]);
							}
						}else{
							acc[cur.PAYMENT_FYMTH-1].add(cur[this.calcDim]);
						}
						return acc
					}, [new Set(), new Set(), new Set(), new Set(), new Set(), new Set(), new Set(), new Set(), new Set(), new Set(), new Set(), new Set()]).map(v => this.formatNumberOutput(v.size))
			}
		},
		monthlyBudgetRevenueGST: function(){
			return this.filteredBudgetRows
			.filter(r => r.CALC==="REVENUE" && r.SOURCETYPE === 'Merchandise Purchase' || r.SOURCETYPE === 'Merchandise Postage')
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
		monthlyBudgetRevenueNet: function(){
			return this.filteredBudgetRows
				.filter(r => r.CALC==="REVENUE")
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
			}, [null, null, null, null, null, null, null, null, null, null, null, null])
		},
		monthlyBudget: function(){
			let result;
			if(this.isRevenue){
				if (this.calcDim ==='PAYMENTAMOUNTNETT'){
					result = this.monthlyBudgetRevenueNet
				}else if(this.calcDim ==='GSTAMOUNT'){
					result = this.monthlyBudgetRevenueGST
				}else if(this.calcDim ==='PAYMENTAMOUNT'){
					result = this.monthlyBudgetRevenueNet.map((v,i) => v + this.monthlyBudgetRevenueGST[i])
				}
			} else if (this.meta.item ==='Transaction') {
				result = this.filteredBudgetRows
				.filter(r => r.CALC === "TRANSACTION")
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
				}, [null, null, null, null, null, null, null, null, null, null, null, null])
			} else if (this.meta.item ==='Contact') {
				result = this.filteredBudgetRows
				.filter(r => r.CALC === "CONTACT")
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
				}, [null, null, null, null, null, null, null, null, null, null, null, null])
			}
			return result.map(v => this.formatNumberOutput(v))
		},
		seriesName: function(){
			if (this.calcDim === 'PAYMENTAMOUNTNETT') {
				return 'Net'
			}else if (this.calcDim === 'PAYMENTAMOUNT'){
				return 'Total'
			}else if (this.calcDim === 'GSTAMOUNT'){
				return 'GST'
			}
		}
	},
	watch:{
		calcDim: function(newVal, oldVal){ this.reDraw(); },
		focalCampaigns: function(newVal, oldVal){ this.reDraw(); },
		focalDonorTypes: function(newVal, oldVal){ this.reDraw(); },
		focalSourceTypes: function(newVal, oldVal){ this.reDraw(); }
	},
	methods: {
		formatNumberOutput: function(val){
			return val ? (this.isRevenue ? Number(val.toFixed(2)) :  Number(val.toFixed(0)) ) : null
		},
		reDraw: function(){
			this.chart.update({
				subtitle: { text:  (this.focalCampaigns && this.focalCampaigns.length!==0 ?  this.focalCampaigns : 'All Campaigns') },
			});
			this.chart.series.forEach(s => {
				if (s.stackKey.indexOf('Budget')!==-1) {
					s.update({
						name: 'Budget ' + (this.isRevenue ?  this.seriesName : ''),
						color: this.calcDimensionSum === 'PAYMENTAMOUNTNETT' ? this.budgetDeadultColor : (this.calcDimensionSum === 'GSTAMOUNT' ?  'rgba(255,186,90,0.7)' : 'rgba(39,142,165,0.7)'),
					});
					s.setData(this.monthlyBudget);
				}else if(s.stackKey.indexOf('Actual')!==-1) {
					s.update({
						name: 'Actual ' + (this.isRevenue ?  this.seriesName : ''),
						color: this.calcDimensionSum === 'PAYMENTAMOUNTNETT' ? this.actualDeafultColor : (this.calcDimensionSum === 'GSTAMOUNT' ?  'rgba(255,118,87,0.9)' : 'rgba(33,230,193,0.9)'),
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
			tooltip: {
				headerFormat: '<span style="font-size:16px">{point.key}</span><table>',
				pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name} : </td>' +
						'<td style="padding:0;text-align: right;"><b>' + (this.isRevenue ? '{point.y:,.2f}' : '{point.y:,.0f}') + '</b></td></tr>',
				footerFormat: '</table>',
				shared: true,
				useHTML: true
		 },
		}));
		// Add Series Budget Net
		this.chart.addSeries({
			name: 'Budget ' + (this.isRevenue ?  this.seriesName : ''),
			stack: 'Budget',
			color: this.budgetDeadultColor,
			pointPadding: 0.1,
			pointPlacement: 0,
			data: this.monthlyBudget
		});
		// Add Series Actual Net
		this.chart.addSeries({
			name: 'Actual ' + (this.isRevenue ?  this.seriesName : ''),
			stack: 'Actual',
			color: this.actualDeafultColor,
			pointPadding: 0.3,
			pointPlacement: 0,
			data: this.monthlyActual
		});
	},
	template:'<div class="chart"></div>'
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
let rootVue = new Vue({
	el: '#root',
	data: {
		paymentDataReady: false,
		budgetDataReady: false,
	},
	store,
	computed: {
		...Vuex.mapState(['payments','budget']),
		...Vuex.mapGetters(['merchRows', 'merchBudgetRows', 'nonMerchRows']),
		// Using Getter and Setter for two-way data binding (v-modal)
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
		// Local computed properties
		donorTypes: function(){
			return [...new Set(this.merchRows.map(v => v.LINE_FY_DONTYPE2))].sort()
		},
		merchTotal: function() { return this.merchRows.reduce((acc, cur) => acc + cur.PAYMENTAMOUNT, 0) },
		merchNet: function() { return this.merchRows.reduce((acc, cur) => acc + cur.PAYMENTAMOUNTNETT, 0) },
		merchGST: function() { return this.merchRows.reduce((acc, cur) => acc + cur.GSTAMOUNT, 0) },
		merchYTMBudget: function() {
			if ( this.budgetDataReady ) {
				let budgetObj =  this.budget.FY[this.focalFY];
				let currentFYMotnh = new Date().getMonth() + 1 + (new Date().getMonth() < 6 ? 6 : -6);
				return budgetObj['PRIVATE']['Merchandise'].reduce( (acc, cur, i) => {
					if ( i + 1 <= currentFYMotnh ) {
						return (acc + cur) - budgetObj['PRIVATE']['MerchandiseGST'][i]
					}else {
						return acc
					}
				}, 0);
			} else {
				return 0
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
		...Vuex.mapActions(['fetchPayments', 'fetchBudget']),
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
				return 0
			}
		},
		getData: function(){
			// Reset Data
			this.paymentDataReady = false;
			// Fetch Data
			this.fetchPayments().then(() => {
				this.paymentDataReady = true;
				this.focalDonorTypes = this.donorTypes;
				[...new Set(this.merchRows.map(r => r.SOURCETYPE))].forEach(s => this.$store.commit('ADD_FOCAL_SOURCETYPE', s) );
			});
			// Reset Data
			this.budgetDataReady = false;
			// Fetch Data
			this.fetchBudget().then(() => {
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
				<span class="count-numbers"><< merchTotal|currency >></span>
				<span class="count-name">Merch Total Cash Inflow</span>
			</div>
		</div>
		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter success">
				<span class="count-icon">&#128176;</span>
				<span class="count-numbers"><< merchGST|currency >></span>
				<span class="count-name">Merch GST Collected</span>
			</div>
		</div>
		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter success">
				<span class="count-icon">&#127974;</span>
				<span class="count-numbers"><< merchNet|currency >></span>
				<span class="count-name">Merch Net Revenue</span>
			</div>
		</div>
		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter primary">
				<span class="count-icon">&#128202;</span>
				<span class="count-numbers"><< (merchNet/merchYTMBudget)|pct(2) >></span>
				<span class="count-name">YTM Budget(exc GST)</span>
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
			<div class="card-counter merch">
				<span class="count-icon">&#128536;</span>
				<span class="count-numbers"><< calc("SERIALNUMBER","unique",{IS_ACQUISITION: -1})|number >></span>
				<span class="count-name">Acqusition</span>
			</div>
		</div>
		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter merch">
				<span class="count-icon">&#128512;</span>
				<span class="count-numbers"><< calc("SERIALNUMBER","unique",{LINE_FY_DONTYPE1: 'NEW'})|number >></span>
				<span class="count-name">New</span>
			</div>
		</div>
		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter merch">
				<span class="count-icon">&#128512;</span>
				<span class="count-numbers"><< calc("SERIALNUMBER","unique",{LINE_FY_DONTYPE1: 'CON'})|number >></span>
				<span class="count-name">Continuing</span>
			</div>
		</div>
		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter merch">
				<span class="count-icon">&#128512;</span>
				<span class="count-numbers"><< calc("SERIALNUMBER","unique",{LINE_FY_DONTYPE1: 'REC'})|number >></span>
				<span class="count-name">Reactivated</span>
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter danger">
				<span class="count-icon">&#128522;</span>
				<span class="count-numbers"><span class="text-warning"><< (calc("SERIALNUMBER" , "unique") - countMixedMerchCustomer())|number >></span>/<< calc("SERIALNUMBER", "unique")|number >></span>
				<span class="count-name">Active Merch Contact(s) (Pure/All)</span>
			</div>
		</div>

		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter info">
				<span class="count-icon">&#129309;</span>
				<span class="count-numbers"><<  calc("TRXID", "unique", {ISTRX: -1})|number >></span>
				<span class="count-name">Transaction(s)</span>
			</div>
		</div>

		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter info">
				<span class="count-icon">&#128140;</span>
				<span class="count-numbers"><< calc("PLEDGEID", "unique")|number >></span>
				<span class="count-name">Revenue Generating Pledge(s)</span>
			</div>
		</div>

		<div class="col-xs-12 col-sm-6 col-md-6 col-lg-3">
			<div class="card-counter info">
				<span class="count-icon">&#128230;</span>
				<span class="count-numbers"><< calc("REXORDERID", "unique")|number >></span>
				<span class="count-name">REX Order(s)</span>
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-lg-6">
			<compare-chart v-bind:meta="{isCumulative: false, item: 'Revenue'}"></compare-chart>
		</div>
		<div class="col-lg-6">
			<compare-chart v-bind:meta="{isCumulative: true, item: 'Revenue'}"></compare-chart>
		</div>
	</div>

	<div class="row">
		<div class="col-lg-6">
			<compare-chart v-bind:meta="{isCumulative: false, item: 'Transaction'}"></compare-chart>
		</div>
		<div class="col-lg-6">
			<compare-chart v-bind:meta="{isCumulative: true, item: 'Transaction'}"></compare-chart>
		</div>
	</div>

	<div class="row">
		<div class="col-lg-6">
			<compare-chart v-bind:meta="{isCumulative: false, item: 'Contact'}"></compare-chart>
		</div>
		<div class="col-lg-6">
			<compare-chart v-bind:meta="{isCumulative: true, item: 'Contact'}"></compare-chart>
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
				<span>Donor Type Included (Budget will not react): </span>
				<template v-for="dt in donorTypes">
					<input type="checkbox" v-bind:id="dt" v-bind:value="dt" v-model="focalDonorTypes">
					<label v-bind:for="dt"> << dt +'. ' >></label>
				</template>
			</div>

			<div>
				<span>Campaign Visibility (Total Row will not react) : </span>
				<input type="checkbox" v-bind:id="-1" v-bind:value="-1" v-model="campaignActualBudget">
				<label v-bind:for="-1" class="text-primary">In Both</label>
				<input type="checkbox" v-bind:id="-2" v-bind:value="-2" v-model="campaignActualBudget">
				<label v-bind:for="-2" class="text-success">Actual Only</label>
				<input type="checkbox" v-bind:id="-3" v-bind:value="-3" v-model="campaignActualBudget">
				<label v-bind:for="-3" class="text-danger">Budget Only</label>
				<input type="checkbox" v-bind:id="0" v-bind:value="0" v-model="campaignActualBudget">
				<label v-bind:for="0">Other</label>
			</div>

		</div>
	</div>

	<div class="row my-1">
		<div class="col">
			<summary-talbe></summary-talbe>
		</div>
	</div>

	</div>`
});
