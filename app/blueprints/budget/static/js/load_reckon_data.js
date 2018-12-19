// ##########################################################################################################################################################
// ##########################################################################################################################################################
const store = new Vuex.Store({
	state: {
		focalFY: $CFY+1,
	},
	mutations: {
		SET_FOCALFY: (state, payload) => state.focalFY = payload,
		SET_MERCHPAYMENTS:  (state, payload) => state.merchPayments = payload,
	},
	actions: {
		fetchPayments(ctx, fy){
			fy = fy ? fy : ctx.state.focalFY;
			return new Promise((resolve, reject) => {
				fetchJSON(endpoint('/api/tq/merch_activities' + '?fy=' + fy), (pmtJSON) => {
					ctx.commit('SET_MERCHPAYMENTS', pmtJSON);
					resolve()
				});
			});
		},

	},
	getters: {
		merchRows: (state, getters) => (state.merchPayments.rows ? state.merchPayments.rows : []),
	}
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
let rootVue = new Vue({
	el: '#root',
	data: {
		paymentDataReady: false,
	},
	store,
	computed: {
		...Vuex.mapState([]),
		...Vuex.mapGetters([]),
		// Using Getter and Setter for two-way data binding (v-modal)
		focalFY: {
			get: function() {
				return this.$store.state.focalFY
			},
			set: function(newVal) {
				this.$store.commit('SET_FOCALFY',newVal);
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

			// Fetch Data
			this.fetchPayments().then(() => {
				this.paymentDataReady = true;
			});
		},
	},
	template:`<div class="container-fluid">
		<p class="lead">Reackon Data Loader</p>

	</div>`
});
