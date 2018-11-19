// ##########################################################################################################################################################
// ##########################################################################################################################################################
const store = new Vuex.Store({
	state: {
		focalFY: $CFY,
		merchPayments: null,
		budget: null,
		// Other Controllers
		calcDimensionSum: 'PAYMENTAMOUNTNETT',
	},
	mutations: {
		SET_MERCHPAYMENTS:  (state, payload) => state.merchPayments = payload,
		SET_BUDGET:  (state, payload) => state.budget = payload,
		SET_FOCALFY: (state, payload) => state.focalFY = payload,
		SET_CALC_DIMENSION_SUM: (state, payload) => state.calcDimensionSum = payload,
	},
	actions: {
		fetchPayments(ctx, fy){
			fy = fy ? fy : ctx.state.focalFY;
			return new Promise((resolve, reject) => {
				fetchJSON(endpoint('/api/tq/payments' + '?fy=' + fy), (pmtJSON) => {
					pmtJSON.rows = pmtJSON.rows.filter(r => r.ISMRECH === -1);
					ctx.commit('SET_MERCHPAYMENTS', pmtJSON);
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
		merchRows: (state, getters) => (state.merchPayments.rows ? state.merchPayments.rows : []),
		merchRevenueTypes: (state, getters) => [...new Set(getters.merchRows.map(r => (r.SOURCETYPE === 'Merchandise Purchase' || r.SOURCETYPE === 'Merchandise Postage') ? 'Merchandise P&P' : r.SOURCETYPE ))],
		merchBudgetRows: (state, getters) => (state.budget.rows ? state.budget.rows.filter(r => r.CLASS1 === 15 && r.FY === state.focalFY) : []),
		filteredMerchRows: (state, getters) => {
			return state.merchPayments.rows.filter(r => {
				return true
			})
		},
		filteredBudgetRows: (state, getters) => {
			return getters.merchBudgetRows.filter(r => {
				return true
			})
		},
		filteredActivites: (state, getters) => [...new Set(getters.filteredMerchRows.map(r => r.ACTIVITY_CODE))].sort(),
		calc:  (state, getters) => (dim, clacType ,filters) => {
			let rows = !filters ? getters.merchRows : getters.merchRows.filter(r => {
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
Vue.component('activity-summary', {
	props: ['activity'],
	computed: {
		...Vuex.mapState(['calcDimensionSum']),
		...Vuex.mapGetters(['merchRows', 'calc', 'merchRevenueTypes']),
	},
	methods: {
	},
	template:`<div>
	<div class="card my-2">
		<div class="card-header">
			<span class="font-weight-bold"><< activity >></span> : << calc(calcDimensionSum, 'sum', {ACTIVITY_CODE:activity})|currency >>
		</div>
		<div class="card-body p-0">
			<div class="table-responsive">
			<table class="table table-sm  table-bordered table-hover shadow-sm">
				<thead>
					<tr class="bg-light text-dark">
						<th scope="col" v-for="t in merchRevenueTypes"><small class="font-weight-bold"><< t >></small></th>
						<th scope="col"><small class="font-weight-bold">Revenue</small></th>
						<th scope="col"><small class="font-weight-bold">TRX</small></th>
						<th scope="col"><small class="font-weight-bold">Contact</small></th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><small></small></td>


					</tr>
				</tbody>
				<tfoot>
					<tr class="bg-light text-dark font-weight-bold">
						<td><small class="font-weight-bold">Total</small></td>

					</tr>
				</tfoot>
			</table>
			</div>
		</div>

	</div>`
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
		...Vuex.mapState(['merchPayments']),
		...Vuex.mapGetters(['filteredActivites', 'calc']),
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
	},
	watch: {
		focalFY: {
			handler: 'getData',
			immediate: true
		},
	},
	methods: {
		...Vuex.mapActions(['fetchPayments', 'fetchBudget']),
		getData: function(){
			// Reset Data
			this.paymentDataReady = false;
			this.budgetDataReady = false;

			// Fetch Data
			this.fetchPayments().then(() => {
				this.paymentDataReady = true;
			});
			this.fetchBudget().then(() => {
				this.budgetDataReady = true;
			});
		},
	},
	template:`
	<vueLoader msg="Retrieving Payment & Budget Data  ..." v-if="!paymentDataReady&&!budgetDataReady"></vueLoader>
	<vueLoader msg="Retrieving Payment Data in ThankQ ..." v-else-if="!paymentDataReady&&budgetDataReady"></vueLoader>
	<vueLoader msg="Retrieving Budget Information ..." v-else-if="!budgetDataReady&&paymentDataReady"></vueLoader>
	<div class="container-fluid" v-else>
		<p class="mt-0 mb-1"><small class="text-muted font-italic">Data Captured : << merchPayments.timestamp|dtAU >><small></p>
		<p class="lead my-0"><span class="text-primary font-weight-bold"><< calc(calcDimensionSum, 'sum')|currency >></span> Revenue Generated from <span class="text-success font-weight-bold"><< calc('ACTIVITY_CODE', 'unique')|number >></span> Merchandise Activitie(s) in FY<< focalFY >></p>
		<activity-summary v-for="a in filteredActivites" :activity="a" ></activity-summary>
	</div>`
});
