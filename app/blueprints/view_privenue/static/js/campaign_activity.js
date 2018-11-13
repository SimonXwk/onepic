// ##########################################################################################################################################################
// ##########################################################################################################################################################
const store = new Vuex.Store({
	state: {
		focalFY: $CFY,
		payments: null,
		budget: null,
		marketingCycle: null,
		// Filters
		focalCampaign: null,

	},
	mutations: {
		SET_FOCALFY: (state, payload) => state.focalFY = payload,
		SET_PAYMENTS:  (state, payload) => state.payments = payload,
		SET_BUDGET:  (state, payload) => state.budget = payload,
		SET_MARKET_CYCLE:  (state, payload) => state.marketingCycle = payload,
		SET_FOCAL_CAMPAIGN:  (state, payload) => state.focalCampaign = payload,
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
		allCampaigns: (state, getters) => [...new Set(getters.paymentRows.map(v => v.CAMPAIGN_ACTIVITY))],
		ongoingCampaigns: (state, getters) => [...new Set(getters.paymentRows.filter(r => r.IS_CAMPAIGN_ACTIVITY_ONGOING === -1).map(v => v.CAMPAIGN_ACTIVITY))],
		periodicalCampaigns: (state, getters) => [...new Set(getters.paymentRows.filter(r => r.IS_CAMPAIGN_ACTIVITY_ONGOING !== -1).map(v => v.CAMPAIGN_ACTIVITY))],
		isCampaignOngoing: (state, getters) => (camp) => camp.slice(0,2) === '__',
		uniquesFromPaymentRows: (state, getters) => (dim, filters) => {
			let rows = !filters ? getters.paymentRows : getters.paymentRows.filter(r => {
				return Object.keys(filters).reduce((acc, key) =>	acc && (r[key] === filters[key]), true);
			});
			return [...new Set(rows.map(r => r[dim]))]
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
	}
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
Vue.component('tree', {
	computed: {
		...Vuex.mapState(['focalFY', 'payments', 'budget', 'marketingCycle', 'focalCampaign']),
		...Vuex.mapGetters(['paymentRows', 'marketingCycleRows', 'allCampaigns', 'ongoingCampaigns', 'periodicalCampaigns', 'calcPayments', 'uniquesFromPaymentRows']),
	},
	methods: {
	},
	template: `<div class="tree ">
	<ul>
		<li><span><a data-toggle="collapse" href="#Root" aria-expanded="true" aria-controls="Root">Campaign Activities <span class="text-primary"><< allCampaigns.length >></span></a></span>
		<div id="Root" class="collapse show">
			<ul>

				<li v-for="ca1 in uniquesFromPaymentRows('IS_CAMPAIGN_ACTIVITY_ONGOING')">
					<span><a data-toggle="collapse" :href="'#L'+ca1" aria-expanded="false" :aria-controls="'L'+ca1"> Ongoing <span class="text-primary"><< ongoingCampaigns.length >></span></a></span>
					<ul>
						<div :id="'L'+ca1" class="collapse">
							<li v-for="mc in marketingCycleRows"><span><a data-toggle="collapse" :href="'#'+ca1+mc.CODE" aria-expanded="false" :aria-controls="ca1+mc.CODE"><< mc.MARKETING_CYCLE >> << calcPayments('CAMPAIGN_ACTIVITY', 'unique', {IS_CAMPAIGN_ACTIVITY_ONGOING:-1, MARKETING_CYCLE:mc.MARKETING_CYCLE}) >></a></span>
								<ul v-if="calcPayments('CAMPAIGN_ACTIVITY', 'unique', {IS_CAMPAIGN_ACTIVITY_ONGOING:-1, MARKETING_CYCLE:mc.MARKETING_CYCLE})>0">
									<div :id="ca1+mc.CODE" class="collapse">
										<li v-for="ca2 in uniquesFromPaymentRows('CAMPAIGN_ACTIVITY', {IS_CAMPAIGN_ACTIVITY_ONGOING:-1, MARKETING_CYCLE:mc.MARKETING_CYCLE})"><span><a href="#!"><< ca2 >></a></span></li>
									</div>
								</ul>
							</li>
						</div>
					</ul>
				</li>

				<li><span><a data-toggle="collapse" href="#level2-2" aria-expanded="false" aria-controls="level2-2">Periodical <span class="text-primary"><< periodicalCampaigns.length >></span></a></span>
					<ul>
						<div id="level2-2" class="collapse">
							<li v-for="mc in marketingCycleRows"><span><a data-toggle="collapse" :href="'#'+mc.CODE" aria-expanded="false" :aria-controls="mc.CODE"><< mc.MARKETING_CYCLE >> << calcPayments('CAMPAIGN_ACTIVITY', 'unique', {IS_CAMPAIGN_ACTIVITY_ONGOING:0, MARKETING_CYCLE:mc.MARKETING_CYCLE}) >></a></span>
		 						<ul v-if="calcPayments('CAMPAIGN_ACTIVITY', 'unique', {IS_CAMPAIGN_ACTIVITY_ONGOING:0, MARKETING_CYCLE:mc.MARKETING_CYCLE})>0">
									<div :id="mc.CODE" class="collapse">
										<li v-for="ca in uniquesFromPaymentRows('CAMPAIGN_ACTIVITY', {IS_CAMPAIGN_ACTIVITY_ONGOING:0, MARKETING_CYCLE:mc.MARKETING_CYCLE})"><span><a href="#!"><< ca >></a></span></li>
									</div>
	 							</ul>
							</li>
 						</div>
					</ul>
				</li>

				<li><span><a href="#!">TEST</a></span></li>
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
		...Vuex.mapState(['focalFY', 'payments', 'budget', 'focalCampaign']),
		...Vuex.mapGetters(['paymentRows', 'allCampaigns', 'ongoingCampaigns', 'periodicalCampaigns']),
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
	created	(){

	},
	template:`
	<vueLoader msg="Retrieving Payment & Budget Data  ..." v-if="!paymentDataReady&&!budgetDataReady"></vueLoader>
	<vueLoader msg="Retrieving Payment Data in ThankQ ..." v-else-if="!paymentDataReady&&budgetDataReady"></vueLoader>
	<vueLoader msg="Retrieving Budget Information ..." v-else-if="!budgetDataReady&&paymentDataReady"></vueLoader>
	<div class="container-fluid" v-else>
		<div class="row">
			<div class="col text-center">
				<p class="lead my-0">FY<< focalFY >> Campaign Activities</p>
				<p class="mt-0 mb-1"><small class="text-muted font-italic">Data Captured : << payments.timestamp|dtAU >><small></p>
				<span class="badge badge-pill badge-primary"><< focalCampaign >></span>
			</div>
		</div>


		<tree></tree>


	</div>
	`
});
