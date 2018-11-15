// ##########################################################################################################################################################
// ##########################################################################################################################################################
const store = new Vuex.Store({
	state: {
		focalFY: $CFY,
		payments: null,
		budget: null,
		marketingCycle: null,
		// Filters
		focalMarketingActivity: null,
		focalTypeMarketingActivity: null,
		focalMarketingCycle: null,
		calcDimensionSum: 'PAYMENTAMOUNTNETT',
	},
	mutations: {
		SET_FOCALFY: (state, payload) => state.focalFY = payload,
		SET_PAYMENTS:  (state, payload) => state.payments = payload,
		SET_BUDGET:  (state, payload) => state.budget = payload,
		SET_MARKET_CYCLE:  (state, payload) => state.marketingCycle = payload,
		SET_FOCAL_MARKETING_ACTIVITY:  (state, payload) => state.focalMarketingActivity = payload,
		SET_FOCAL_TYPE_MARKETING_ACTIVITY:  (state, payload) => state.focalTypeMarketingActivity = payload,
		SET_FOCAL_MARKETING_CYCLE:  (state, payload) => state.focalMarketingCycle = payload,
		SET_CALC_DIMENSION_SUM: (state, payload) => state.calcDimensionSum = payload,
	},
	actions: {
		fetchPayments(ctx, fy){
			fy = fy ? fy : ctx.state.focalFY;
			return new Promise((resolve, reject) => {
				fetchJSON(endpoint('/api/tq/payments' + '?fy=' + fy), (json) => {
					ctx.commit('SET_PAYMENTS', json);
					resolve()
				});
			});
		},
		fetchBudget(ctx){
			return new Promise((resolve, reject) => {
				fetchJSON(endpoint('/api/budget'), (json) => {
					ctx.commit('SET_BUDGET', json);
					resolve()
				});
			});
		},
		fetchMarketingCycle(ctx){
			return new Promise((resolve, reject) => {
				fetchJSON(endpoint('/api/marketing_cycle'), (json) => {
					ctx.commit('SET_MARKET_CYCLE', json);
					resolve()
				});
			});
		},
	},
	getters: {
		paymentRows: (state, getters) => (state.payments.rows ? state.payments.rows : []),
		marketingCycleRows: (state, getters) => (state.marketingCycle.rows ? state.marketingCycle.rows : []),
		focalPaymentRows:  (state, getters) => (state.payments.rows.map(r => r.MARKETING_ACTIVITY === state.focalMarketingActivity)),
		allCampaignActivities: (state, getters) => [...new Set(getters.paymentRows.map(v => v.MARKETING_ACTIVITY))],
		campaignActivityCount:  (state, getters) => getters.allCampaignActivities.length,
		ongoingCampaigns: (state, getters) => [...new Set(getters.paymentRows.filter(r => r.IS_MARKETING_ACTIVITY_ONGOING === -1).map(v => v.MARKETING_ACTIVITY))],
		periodicalCampaigns: (state, getters) => [...new Set(getters.paymentRows.filter(r => r.IS_MARKETING_ACTIVITY_ONGOING !== -1).map(v => v.MARKETING_ACTIVITY))],
		isCampaignOngoing: (state, getters) => (camp) => camp.slice(0,2) === '__',
		uniquesFromPaymentRows: (state, getters) => (dim, filters) => {
			let rows = !filters ? getters.paymentRows : getters.paymentRows.filter(r => {
				return Object.keys(filters).reduce((acc, key) =>	acc && (r[key] === filters[key]), true);
			});
			return [...new Set(rows.map(r => r[dim]))]
		},
		uniquesFromFocalPaymentRows: (state, getters) => (dim, filters) => {
			return getters.uniquesFromPaymentRows(dim, {...filters, MARKETING_ACTIVITY: state.focalMarketingActivity})
		},
		calcPayments: (state, getters) => (dim, clacType, filters) => {
			let rows = !filters ? getters.paymentRows : getters.paymentRows.filter(r => {
				return Object.keys(filters).reduce((acc, key) =>	acc && (r[key] === filters[key]), true);
			});
			if(clacType==='sum'){
				return rows.reduce((acc, cur) => acc += cur[dim], 0);
			}else if(clacType==='unique'){
				return new Set(rows.map(r => r[dim])).size
			}
		},
		calcFocalPayments: (state, getters) => (dim, clacType, filters) => {
			return getters.calcPayments(dim, clacType, {...filters, MARKETING_ACTIVITY: state.focalMarketingActivity})
		},
	}
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
Vue.component('focal-source-table', {
	computed: {
		...Vuex.mapState(['focalFY', 'payments', 'budget', 'marketingCycle', 'focalMarketingActivity', 'calcDimensionSum']),
		...Vuex.mapGetters([ 'calcFocalPayments', 'uniquesFromFocalPaymentRows']),
	},
	methods: {
	},
	template:`<div class="table-responsive">
	<table class="table table-sm table-hover shadow-sm">
		<thead>
			<tr class="bg-light text-dark">
				<th scope="col"><small class="font-weight-bold">SourceCodes</small></th>
				<th scope="col"><small class="font-weight-bold">Revenue</small></th>
				<th scope="col"><small class="font-weight-bold">TRX</small></th>
				<th scope="col"><small class="font-weight-bold">ACQ:P</small></th>
				<th scope="col"><small class="font-weight-bold">ACQ:D</small></th>
				<th scope="col"><small class="font-weight-bold">Active</small></th>
				<th scope="col"><small class="font-weight-bold">1New</small></th>
				<th scope="col"><small class="font-weight-bold">2New</small></th>
				<th scope="col"><small class="font-weight-bold">Multi</small></th>
				<th scope="col"><small class="font-weight-bold">2Rec</small></th>
				<th scope="col"><small class="font-weight-bold">1Rec</small></th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="s1 in uniquesFromFocalPaymentRows('SOURCECODE')">
				<td><small><< s1 >></small></td>
				<td><small><< calcFocalPayments(calcDimensionSum, 'sum', {SOURCECODE: s1})|currency >></small></td>
				<td><small><< calcFocalPayments("TRXID", "unique", {SOURCECODE: s1, ISTRX: -1})|number >></small></td>
				<td><small><< calcFocalPayments('PLEDGEID', 'unique', {SOURCECODE: s1, IS_FIRST_INSTALMENT: -1})|number >></small></td>
				<td><small><< calcFocalPayments('SERIALNUMBER', 'unique', {SOURCECODE: s1, IS_ACQUISITION: -1})|number >></small></td>
				<td><small><< calcFocalPayments('SERIALNUMBER', 'unique', {SOURCECODE: s1})|number >></small></td>
				<td><small><< calcFocalPayments('SERIALNUMBER', 'unique', {SOURCECODE: s1, LINE_FY_DONTYPE2: '1NEW'})|number >></small></td>
				<td><small><< calcFocalPayments('SERIALNUMBER', 'unique', {SOURCECODE: s1, LINE_FY_DONTYPE2: '2NEW'})|number >></small></td>
				<td><small><< calcFocalPayments('SERIALNUMBER', 'unique', {SOURCECODE: s1, LINE_FY_DONTYPE2: 'MULTI'})|number >></small></td>
				<td><small><< calcFocalPayments('SERIALNUMBER', 'unique', {SOURCECODE: s1, LINE_FY_DONTYPE2: '2REC'})|number >></small></td>
				<td><small><< calcFocalPayments('SERIALNUMBER', 'unique', {SOURCECODE: s1, LINE_FY_DONTYPE2: '1REC'})|number >></small></td>

			</tr>
		</tbody>
		<tfoot>
			<tr class="bg-light text-dark font-weight-bold">
				<td><small class="font-weight-bold">Total</small></td>
				<td><small class="font-weight-bold"><< calcFocalPayments(calcDimensionSum, 'sum')|currency >></small></td>
				<td><small class="font-weight-bold"><< calcFocalPayments("TRXID", "unique", {ISTRX: -1})|number >></small></td>
				<td><small class="font-weight-bold"><< calcFocalPayments('PLEDGEID', 'unique', {IS_FIRST_INSTALMENT: -1})|number >></small></td>
				<td><small class="font-weight-bold"><< calcFocalPayments('SERIALNUMBER', 'unique', {IS_ACQUISITION: -1})|number >></small></td>
				<td><small class="font-weight-bold"><< calcFocalPayments('SERIALNUMBER', 'unique')|number >></small></td>
				<td><small class="font-weight-bold"><< calcFocalPayments('SERIALNUMBER', 'unique', {LINE_FY_DONTYPE2: '1NEW'})|number >></small></td>
				<td><small class="font-weight-bold"><< calcFocalPayments('SERIALNUMBER', 'unique', {LINE_FY_DONTYPE2: '2NEW'})|number >></small></td>
				<td><small class="font-weight-bold"><< calcFocalPayments('SERIALNUMBER', 'unique', {LINE_FY_DONTYPE2: 'MULTI'})|number >></small></td>
				<td><small class="font-weight-bold"><< calcFocalPayments('SERIALNUMBER', 'unique', {LINE_FY_DONTYPE2: '2REC'})|number >></small></td>
				<td><small class="font-weight-bold"><< calcFocalPayments('SERIALNUMBER', 'unique', {LINE_FY_DONTYPE2: '1REC'})|number >></small></td>


			</tr>
		</tfoot>
	</table>
	</div>`
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
Vue.component('summaries', {
	computed: {
		...Vuex.mapState(['focalFY', 'payments', 'budget', 'marketingCycle', 'focalMarketingActivity', 'calcDimensionSum']),
		...Vuex.mapGetters(['paymentRows', 'marketingCycleRows', 'campaignActivityCount', 'calcPayments', 'calcFocalPayments', 'uniquesFromPaymentRows', 'focalPaymentRows']),
	},
	methods: {
		...Vuex.mapMutations({
			setFocalCampaignActivity: 'SET_FOCAL_MARKETING_ACTIVITY'
		}),
		calc: function(...arguments){
			return this.focalMarketingActivity ?  this.calcFocalPayments(...arguments) : this.calcPayments(...arguments)
		},
	},
	template:`<div>
	<div class="row">
		<div class="col-xs-12 col-md-6 col-lg-4">
			<div class="card-counter success">
				<span class="count-icon">&#128181;</span>
				<span class="count-numbers"><< calc(calcDimensionSum, 'sum')|currency >></span>
				<span class="count-name">Revenue</span>
			</div>
		</div>
		<div class="col-xs-12 col-md-6 col-lg-4">
			<div class="card-counter info">
				<span class="count-icon">&#129309;</span>
				<span class="count-numbers"><< calc("TRXID", "unique", {ISTRX: -1})|number >></span>
				<span class="count-name">Transaction(s)</span>
			</div>
		</div>
		<div class="col-xs-12 col-md-6 col-lg-4">
			<div class="card-counter danger">
				<span class="count-icon">&#128522;</span>
				<span class="count-numbers"><< calc('SERIALNUMBER', 'unique')|number >></span>
				<span class="count-name">Active Donor(s)</span>
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-xs-12 col-md-6 col-lg-4">
			<div class="card-counter danger">
				<span class="count-icon">&#128512;</span>
				<span class="count-numbers"><< calc('SERIALNUMBER', 'unique', {LINE_FY_DONTYPE1: 'NEW'})|number >></span>
				<span class="count-name">New Donor(s)</span>
			</div>
		</div>
		<div class="col-xs-12 col-md-6 col-lg-4">
			<div class="card-counter danger">
				<span class="count-icon">&#128512;</span>
				<span class="count-numbers"><< calc('SERIALNUMBER', 'unique', {LINE_FY_DONTYPE1: 'CON'})|number >></span>
				<span class="count-name">Continuing Donor(s)</span>
			</div>
		</div>
		<div class="col-xs-12 col-md-6 col-lg-4">
			<card-counter theme="danger" icon="&#128512;" :num="calc('SERIALNUMBER', 'unique', {LINE_FY_DONTYPE1: 'REC'})|number" msg="1st Year Reactivated"></card-counter>
		</div>
	</div>

	<div class="row">
		<div class="col-xs-12 col-md-6 col-lg-4">
			<card-counter theme="warning" icon="&#128578;" :num="calc('SERIALNUMBER', 'unique', {LINE_FY_DONTYPE2: '2NEW'})|number" msg="2nd Year New"></card-counter>
		</div>
		<div class="col-xs-12 col-md-6 col-lg-4">
			<card-counter theme="warning" icon="&#128578;" :num="calc('SERIALNUMBER', 'unique', {LINE_FY_DONTYPE2: 'MULTI'})|number" msg="Mutli Year"></card-counter>
		</div>
		<div class="col-xs-12 col-md-6 col-lg-4">
			<card-counter theme="warning" icon="&#128578;" :num="calc('SERIALNUMBER', 'unique', {LINE_FY_DONTYPE2: '2REC'})|number" msg="2nd Year Reactivated"></card-counter>
		</div>
	</div>

	<div class="row">
		<div class="col-xs-12 col-md-6 col-lg-4">
			<div class="card-counter success">
				<span class="count-icon">&#128536;</span>
				<span class="count-numbers"><< calc('SERIALNUMBER', 'unique', {IS_ACQUISITION: -1})|number >></span>
				<span class="count-name">Donor Acqusition</span>
			</div>
		</div>
		<div class="col-xs-12 col-md-6 col-lg-4">
			<div class="card-counter success">
				<span class="count-icon">&#128140;</span>
				<span class="count-numbers"><< calc('PLEDGEID', 'unique', {IS_FIRST_INSTALMENT: -1})|number >></span>
				<span class="count-name">Pledge(S) Have 1st Instalments Paid</span>
			</div>
		</div>
		<div class="col-xs-12 col-md-6 col-lg-4">
			<div class="card-counter success">
				<span class="count-icon">&#128178;</span>
				<span class="count-numbers"><< calc(calcDimensionSum, "sum", {ISPLEDGE: -1})|currency >></span>
				<span class="count-name">Pledge 1st Instalments</span>
			</div>
		</div>
	</div>

	</div>`
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
Vue.component('tree', {
	computed: {
		...Vuex.mapState(['focalFY', 'payments', 'budget', 'marketingCycle', 'focalMarketingActivity']),
		...Vuex.mapGetters(['paymentRows', 'marketingCycleRows', 'campaignActivityCount', 'calcPayments', 'uniquesFromPaymentRows']),
	},
	methods: {
		...Vuex.mapMutations({
			setFocalCampaignActivity: 'SET_FOCAL_MARKETING_ACTIVITY'
		}),
	},
	template: `<div class="tree">
	<ul>
		<li><span  v-bind:class="{'bg-warning': focalMarketingActivity===null}"><a data-toggle="collapse" href="#Root" aria-expanded="true" aria-controls="Root" @click.prevent="setFocalCampaignActivity(null)" >Marketing Activities <span class="text-primary"><< campaignActivityCount >></span></a></span>
		<div id="Root" class="collapse show">
			<ul>
				<li v-for="(ca1, idx1) in uniquesFromPaymentRows('IS_MARKETING_ACTIVITY_ONGOING')">
					<span><a data-toggle="collapse" :href="'#'+(ca1===-1?'Ongoing':'Periodical')" aria-expanded="false" :aria-controls="(ca1===-1?'Ongoing':'Periodical')"> << (ca1===-1?'Ongoing':'Periodical') >> <span class="text-primary"><< uniquesFromPaymentRows('MARKETING_ACTIVITY', {IS_MARKETING_ACTIVITY_ONGOING: ca1}).length >></span></a></span>
					<ul>
						<div :id="(ca1===-1?'Ongoing':'Periodical')" class="collapse">
							<li v-for="mc in marketingCycleRows" v-if="ca1===0||calcPayments('MARKETING_ACTIVITY', 'unique', {IS_MARKETING_ACTIVITY_ONGOING:ca1, MARKETING_CYCLE:mc.NAME})!==0">
								<span><a data-toggle="collapse" :href="'#'+(ca1===-1?'Ongoing':'Periodical')+mc.CODE" aria-expanded="false" :aria-controls="(ca1===-1?'Ongoing':'Periodical')+mc.CODE"><< mc.NAME >> <span class="text-success"><< calcPayments('MARKETING_ACTIVITY', 'unique', {IS_MARKETING_ACTIVITY_ONGOING:ca1, MARKETING_CYCLE:mc.NAME}) >></span></a></span>
								<ul v-if="calcPayments('MARKETING_ACTIVITY', 'unique', {IS_MARKETING_ACTIVITY_ONGOING:ca1, MARKETING_CYCLE:mc.NAME})>0">
									<div :id="(ca1===-1?'Ongoing':'Periodical')+mc.CODE" class="collapse">
										<li v-for="ca2 in uniquesFromPaymentRows('MARKETING_ACTIVITY', {IS_MARKETING_ACTIVITY_ONGOING:ca1, MARKETING_CYCLE:mc.NAME})">
											<span v-bind:class="{'bg-success': ca2===focalMarketingActivity, 'bg-light':ca2!==focalMarketingActivity }"><a href="#!" @click.prevent="setFocalCampaignActivity(ca2)"><< ca2 >></a></span>
										</li>
									</div>
								</ul>
							</li>
						</div>
					</ul>
				</li>
				<!-- <li><span><a href="#!">LEVEL1 SAMPLE</a></span></li> -->
			</ul>
		</div>
		</li>
	</ul>
	</div>`
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
let rootVue = new Vue({
	el: '#root',
	data: {
		paymentDataReady: false,
		budgetDataReady: false,
		marketingCycleDataReady: false,
	},
	store,
	computed: {
		...Vuex.mapState(['focalFY', 'payments', 'budget', 'focalMarketingActivity']),
		...Vuex.mapGetters(['campaignActivityCount']),
		calcDimensionSum: {
			get: function() {
				return this.$store.state.calcDimensionSum
			},
			set: function(newVal) {
				this.$store.commit('SET_CALC_DIMENSION_SUM',newVal);
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
		...Vuex.mapActions(['fetchPayments', 'fetchBudget', 'fetchMarketingCycle']),
		getData: function(){
			this.paymentDataReady = false; // Reset Data
			// Fetch Data
			this.fetchPayments().then(() => {
				this.paymentDataReady = true;
			});
			this.budgetDataReady = false; // Reset Data
			// Fetch Data
			this.fetchBudget().then(() => {
				this.budgetDataReady = true;
			});
			this.marketingCycleDataReady = false; // Reset Data
			// Fetch Data
			this.fetchMarketingCycle().then(() => {
				this.marketingCycleDataReady = true;
			});


		},
	},
	template:`
	<vueLoader msg="Retrieving Payment & Budget Data  ..." v-if="!paymentDataReady&&!budgetDataReady"></vueLoader>
	<vueLoader msg="Retrieving Payment Data in ThankQ ..." v-else-if="!paymentDataReady&&budgetDataReady"></vueLoader>
	<vueLoader msg="Retrieving Budget Information ..." v-else-if="!budgetDataReady&&paymentDataReady"></vueLoader>
	<div class="container-fluid" v-else>
		<div class="row">

			<div class="col-xs-12 col-sm-6 col-md-5 col-lg-4 col-xl-3">
				<p class="my-0"><small class="text-muted">Data Captured : << payments.timestamp|dtAU >><small></p>
				<div>
					<span>Revenue Calculation : </span>
					<input type="radio" id="one" value="PAYMENTAMOUNTNETT" v-model="calcDimensionSum">
					<label for="one">NET</label>
					<input type="radio" id="two" value="PAYMENTAMOUNT" v-model="calcDimensionSum">
					<label for="two">TOTAL</label>
					<input type="radio" id="three" value="GSTAMOUNT" v-model="calcDimensionSum">
					<label for="three">GST</label>
				</div>
				<tree></tree>
			</div>

			<div class="col-xs-12 col-sm-6 col-md-7 col-lg-8 col-xl-9">

				<template  v-if="focalMarketingActivity">
					<transition name="slide-fade">
					<h3 class="lead mt-0 mb-1" v-if="focalMarketingActivity">Focal Campaign (<span class="text-primary">FY<< focalFY >></span>): <mark class="font-weight-bold text-primary"><< focalMarketingActivity >></mark></p>
					</transition>
					<summaries></summaries>
					<focal-source-table></focal-source-table>
				</template>

				<template v-else>
					<transition name="slide-fade">
					<p class="lead my-0"><span class="text-primary font-weight-bold"><< campaignActivityCount >></span> TLMA Marketing Activities Generated Revenue in <span class="text-primary font-weight-bold">FY<< focalFY >></span></p>
					</transition>
					<summaries></summaries>
				</template>


			</div>
		</div>



	</div>
	`
});
