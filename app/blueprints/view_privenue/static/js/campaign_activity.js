// ##########################################################################################################################################################
// ##########################################################################################################################################################
const store = new Vuex.Store({
	state: {
		// Raw Data
		payments: null,
		budget: null,
		marketingCycle: null,
		// Specical Filters
		focalFY: $CFY,
		focalMarketingActivity: null,
		// Global Filters
		// focalTypeMarketingActivity: null,
		// focalMarketingCycle: null,
		calcDimensionSum: 'PAYMENTAMOUNTNETT',
		focalPlatform: ['Merchandise_Platform', 'Non-Merchandise_Platform'],
	},
	mutations: {
		SET_PAYMENTS:  (state, payload) => state.payments = payload,
		SET_BUDGET:  (state, payload) => state.budget = payload,
		SET_MARKET_CYCLE:  (state, payload) => state.marketingCycle = payload,

		SET_FOCALFY: (state, payload) => state.focalFY = payload,
		SET_FOCAL_MARKETING_ACTIVITY:  (state, payload) => state.focalMarketingActivity = payload,
		// SET_FOCAL_TYPE_MARKETING_ACTIVITY:  (state, payload) => state.focalTypeMarketingActivity = payload,
		// SET_FOCAL_MARKETING_CYCLE:  (state, payload) => state.focalMarketingCycle = payload,
		SET_CALC_DIMENSION_SUM: (state, payload) => state.calcDimensionSum = payload,
		SET_FOCAL_PLATFORM: (state, payload) => state.focalPlatform = payload,
		ADD_FOCAL_PLATFORM: (state, payload) => state.focalPlatform.push(payload),
		REMOVE_FOCAL_PLATFORM: (state, payload) => state.focalPlatform.splice(state.focalPlatform.indexOf(payload), 1),
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
		paymentRows: (state, getters) => {
			if (state.payments.rows) {
				// Apply Global Filters Here
				return state.payments.rows.filter(r => {
					return (state.focalPlatform.indexOf(r.PLATFORM) !== -1)
				})
			} else {
				return []
			}
		},
		marketingCycleRows: (state, getters) => (state.marketingCycle.rows ? state.marketingCycle.rows : []),
		focalPaymentRows:  (state, getters) => (state.payments.rows.map(r => r.MARKETING_ACTIVITY === state.focalMarketingActivity)),
		allCampaignActivities: (state, getters) => [...new Set(getters.paymentRows.map(v => v.MARKETING_ACTIVITY))],
		campaignActivityCount:  (state, getters) => getters.allCampaignActivities.length,
		ongoingCampaigns: (state, getters) => [...new Set(getters.paymentRows.filter(r => r.IS_MARKETING_ACTIVITY_ONGOING === -1).map(v => v.MARKETING_ACTIVITY))],
		periodicalCampaigns: (state, getters) => [...new Set(getters.paymentRows.filter(r => r.IS_MARKETING_ACTIVITY_ONGOING !== -1).map(v => v.MARKETING_ACTIVITY))],
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
			<card-counter theme="success" icon="&#128181;" :num="calc(calcDimensionSum, 'sum')|currency" msg="Revenue"></card-counter>
		</div>
		<div class="col-xs-12 col-md-6 col-lg-4">
			<card-counter theme="info" icon="&#129309;" :num="calc('TRXID', 'unique', {ISTRX: -1})|number" msg="Transaction(s)"></card-counter>
		</div>
		<div class="col-xs-12 col-md-6 col-lg-4">
			<card-counter theme="info" icon="&#128522;" :num="calc('SERIALNUMBER', 'unique')|number" msg="Active Donor(s)"></card-counter>
		</div>
	</div>

	<div class="row">
		<div class="col-xs-12 col-md-6 col-lg-4">
			<card-counter theme="danger" icon="&#128512;" :num="calc('SERIALNUMBER', 'unique', {LINE_FY_DONTYPE1: 'NEW'})|number" msg="1st Year New"></card-counter>
		</div>
		<div class="col-xs-12 col-md-6 col-lg-4">
			<card-counter theme="danger" icon="&#128512;" :num="calc('SERIALNUMBER', 'unique', {LINE_FY_DONTYPE1: 'CON'})|number" msg="Continuing"></card-counter>
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
			<card-counter theme="success" icon="&#128536;" :num="calc('SERIALNUMBER', 'unique', {IS_ACQUISITION: -1})|number" msg="Donor Acqusition"></card-counter>
		</div>
		<div class="col-xs-12 col-md-6 col-lg-4">
			<card-counter theme="success" icon="&#128140;" :num="calc('PLEDGEID', 'unique', {IS_FIRST_INSTALMENT: -1})|number" msg="1st Instalments Paid Pledge(s)"></card-counter>
		</div>
		<div class="col-xs-12 col-md-6 col-lg-4">
			<card-counter theme="success" icon="&#128178;" :num="calc(calcDimensionSum, 'sum', {ISPLEDGE: -1})|number" msg="Pledge 1st Instalments"></card-counter>
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
		...Vuex.mapState(['focalFY', 'payments', 'focalMarketingActivity']),
		...Vuex.mapGetters(['campaignActivityCount']),
		calcDimensionSum: {
			get: function() {
				return this.$store.state.calcDimensionSum
			},
			set: function(newVal) {
				this.$store.commit('SET_CALC_DIMENSION_SUM',newVal);
			}
		},
		focalPlatform: {
			get: function() {
				return this.$store.state.focalPlatform
			},
			set: function(newVal) {
				this.$store.commit('SET_FOCAL_PLATFORM',newVal);
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
				<p class="my-0"><small class="text-muted">Data Captured : << payments.timestamp|dtAU >> << payments.bytes|number >> bytes<small></p>
				<div>
					<span>Revenue Calculation : </span>
					<input type="radio" id="one" value="PAYMENTAMOUNTNETT" v-model="calcDimensionSum">
					<label for="one">NET</label>
					<input type="radio" id="two" value="PAYMENTAMOUNT" v-model="calcDimensionSum">
					<label for="two">TOTAL</label>
					<input type="radio" id="three" value="GSTAMOUNT" v-model="calcDimensionSum">
					<label for="three">GST</label>
				</div>

				<div>
					<span>Platform : </span>
					<input type="checkbox" id="15" value="Merchandise_Platform" v-model="focalPlatform">
					<label for="15" class="text-dark">Merchandise</label>
					<input type="checkbox" id="20" value="Non-Merchandise_Platform" v-model="focalPlatform">
					<label for="20" class="text-dark">Non-Merchandise</label>
				</div>

				<tree></tree>
			</div>

			<div class="col-xs-12 col-sm-6 col-md-7 col-lg-8 col-xl-9">

				<template  v-if="focalMarketingActivity">
					<transition name="slide-fade">
					<h3 class="lead mt-0 mb-1" v-if="focalMarketingActivity"><span class="text-primary">FY<< focalFY >></span> : <mark class="font-weight-bold text-danger"><< focalMarketingActivity >></mark></p>
					</transition>
					<summaries></summaries>
					<focal-source-table></focal-source-table>
				</template>

				<template v-else>
					<transition name="slide-fade">
					<h4 class="lead mt-0 mb-2 text-center"><span class="text-primary font-weight-bold"><< campaignActivityCount >></span> TLMA Marketing Activities Generated Revenue in <span class="text-primary font-weight-bold">FY<< focalFY >></span></h4>
					</transition>
					<summaries></summaries>
				</template>

			</div>
		</div>



	</div>
	`
});
