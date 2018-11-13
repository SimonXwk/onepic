// ##########################################################################################################################################################
// ##########################################################################################################################################################
const store = new Vuex.Store({
	state: {
		focalFY: $CFY,
		payments: null,
		budget: null,
		marketingCycle: null,
		// Filters
		focalCampaignActivity: null,

	},
	mutations: {
		SET_FOCALFY: (state, payload) => state.focalFY = payload,
		SET_PAYMENTS:  (state, payload) => state.payments = payload,
		SET_BUDGET:  (state, payload) => state.budget = payload,
		SET_MARKET_CYCLE:  (state, payload) => state.marketingCycle = payload,
		SET_FOCAL_CAMPAIGN_ACTIVITY:  (state, payload) => state.focalCampaignActivity = payload,
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
		allCampaignActivities: (state, getters) => [...new Set(getters.paymentRows.map(v => v.CAMPAIGN_ACTIVITY))],
		campaignActivityCount:  (state, getters) => getters.allCampaignActivities.length,
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
		...Vuex.mapState(['focalFY', 'payments', 'budget', 'marketingCycle', 'focalCampaignActivity']),
		...Vuex.mapGetters(['paymentRows', 'marketingCycleRows', 'campaignActivityCount', 'calcPayments', 'uniquesFromPaymentRows']),
	},
	methods: {
		...Vuex.mapMutations({
			setFocalCampaignActivity: 'SET_FOCAL_CAMPAIGN_ACTIVITY'
		}),

	},
	template: `<div class="tree">
	<ul>
		<li><span><a data-toggle="collapse" href="#Root" aria-expanded="true" aria-controls="Root">Campaign Activities <span class="text-primary"><< campaignActivityCount >></span></a></span>
		<div id="Root" class="collapse show">
			<ul>
				<li v-for="(ca1, idx1) in uniquesFromPaymentRows('IS_CAMPAIGN_ACTIVITY_ONGOING')">
					<span><a data-toggle="collapse" :href="'#'+(ca1===-1?'Ongoing':'Periodical')" aria-expanded="false" :aria-controls="(ca1===-1?'Ongoing':'Periodical')"> << (ca1===-1?'Ongoing':'Periodical') >> <span class="text-primary"><< uniquesFromPaymentRows('CAMPAIGN_ACTIVITY', {IS_CAMPAIGN_ACTIVITY_ONGOING: ca1}).length >></span></a></span>
					<ul>
						<div :id="(ca1===-1?'Ongoing':'Periodical')" class="collapse">
							<li v-for="mc in marketingCycleRows">
								<span><a data-toggle="collapse" :href="'#'+(ca1===-1?'Ongoing':'Periodical')+mc.CODE" aria-expanded="false" :aria-controls="(ca1===-1?'Ongoing':'Periodical')+mc.CODE"><< mc.NAME >> <span class="text-success"><< calcPayments('CAMPAIGN_ACTIVITY', 'unique', {IS_CAMPAIGN_ACTIVITY_ONGOING:ca1, MARKETING_CYCLE:mc.NAME}) >></span></a></span>
								<ul v-if="calcPayments('CAMPAIGN_ACTIVITY', 'unique', {IS_CAMPAIGN_ACTIVITY_ONGOING:ca1, MARKETING_CYCLE:mc.NAME})>0">
									<div :id="(ca1===-1?'Ongoing':'Periodical')+mc.CODE" class="collapse">
										<li v-for="ca2 in uniquesFromPaymentRows('CAMPAIGN_ACTIVITY', {IS_CAMPAIGN_ACTIVITY_ONGOING:ca1, MARKETING_CYCLE:mc.NAME})">
											<span v-bind:class="{'bg-success': ca2===focalCampaignActivity, 'bg-light':ca2!==focalCampaignActivity }"><a href="#!" @click.prevent="setFocalCampaignActivity(ca2)"><< ca2 >></a></span>
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
		...Vuex.mapState(['focalFY', 'payments', 'budget', 'focalCampaignActivity']),
		...Vuex.mapGetters(['campaignActivityCount']),
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
				<p class="lead my-0"><span class="text-primary"><< campaignActivityCount >></span> Campaign Activities Generated Revenue in <span class="text-primary">FY<< focalFY >></span></p>
				<p class="mt-0 mb-1"><small class="text-muted font-italic">Data Captured : << payments.timestamp|dtAU >><small></p>
				<p class="mt-0 mb-1 text-primary" v-if="focalCampaignActivity"><mark>Focal Campaign : << focalCampaignActivity >></mark></p>
			</div>
		</div>


		<tree></tree>


	</div>
	`
});
