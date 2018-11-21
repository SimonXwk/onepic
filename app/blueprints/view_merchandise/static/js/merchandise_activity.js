// ##########################################################################################################################################################
// ##########################################################################################################################################################
const store = new Vuex.Store({
	state: {
		focalFY: $CFY,
		merchPayments: null,
		budget: null,
		merchRevenueTypes: ['MP&P','MDON','MGOL','MSPN'],
		// Other Controllers
		calcDimensionSum: 'PAYMENTAMOUNTNETT',
		activityTypes: [-2, -1]
	},
	mutations: {
		SET_MERCHPAYMENTS:  (state, payload) => state.merchPayments = payload,
		SET_BUDGET:  (state, payload) => state.budget = payload,
		SET_FOCALFY: (state, payload) => state.focalFY = payload,
		SET_CALC_DIMENSION_SUM: (state, payload) => state.calcDimensionSum = payload,
		SET_CALC_ACTIVITY_TYPE: (state, payload) => state.activityTypes = payload,
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

		actualActivities: (state, getters) => {return new Set(getters.merchRows.map(v => v.ACTIVITY_CODE))},
		budgetActivities: (state, getters) => {return new Set(getters.merchBudgetRows.map(v => v.ACTIVITY_CODE))},
		allActivities: (state, getters) => { return [...new Set([...getters.actualActivities, ...getters.budgetActivities])].sort() },
		filteredAllActivites: (state, getters) => getters.allActivities.filter(v => state.activityTypes.indexOf(getters.checkCampaignType(v)) !==-1 ).sort(),

		checkCampaignType: (state, getters) => (camp) => {
			if (getters.actualActivities.has(camp) && getters.budgetActivities.has(camp)) {
				return -1
			}else if (getters.actualActivities.has(camp) && !getters.budgetActivities.has(camp) && (camp.slice(0,2) !== String(String(state.focalFY).slice(-2) -1) && camp.slice(-2) !== String(String(state.focalFY).slice(-2) -1) ) ){
				return -2
			}else if (!getters.actualActivities.has(camp) && getters.budgetActivities.has(camp)){
				return -3
			}else {
				return 0
			}
		},

		calc:  (state, getters) => (dim, clacType ,filters) => {
			let rows = !filters ? getters.merchRows : getters.merchRows.filter(r => {
				return Object.keys(filters).reduce((acc, key) =>	acc && (r[key] === filters[key]), true);
			});
			if(clacType==='sum'){
				return rows.reduce((acc, cur) => acc += cur[dim], 0);
			}else if(clacType==='unique'){
				return new Set(rows.map(r => r[dim])).size
			}else if(clacType==='uniques'){
				return [...new Set(rows.map(r => r[dim]))]
			}
		},

		sumBudget: (state, getters) =>  (calcDim, filters)  => {
			let result = 0;
			let rows;
			if (filters) {
				rows = getters.merchBudgetRows.filter(r => (r.CALC === calcDim) && Object.keys(filters).reduce((acc, key) =>	acc && (r[key] === filters[key]), true));
			} else {
				rows = getters.merchBudgetRows.filter(r => r.CALC === calcDim);
			}
			if(calcDim = 'REVENUE'){
				if (state.calcDimensionSum === 'GSTAMOUNT' ) {
					return rows.filter(r => r.SOURCETYPE === 'Merchandise Purchase' || r.SOURCETYPE === 'Merchandise Postage').reduce((acc, cur) => acc + cur.VALUES.reduce((a, b) => a + b,0), 0) * 0.1
				} else if (state.calcDimensionSum === 'PAYMENTAMOUNT') {
					return rows.reduce((acc, cur) => acc + cur.VALUES.reduce((a, b) => a + b,0), 0) +
						(rows.filter(r => r.SOURCETYPE === 'Merchandise Purchase' || r.SOURCETYPE === 'Merchandise Postage').reduce((acc, cur) => acc + cur.VALUES.reduce((a, b) => a + b,0), 0) * 0.1)
				} else {
					return rows.reduce((acc, cur) => acc + cur.VALUES.reduce((a, b) => a + b,0), 0)
				}
			} else {
				return rows.reduce((acc, cur) => acc + cur.VALUES.reduce((a, b) => a + b,0), 0)
			}
		},

	}
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
Vue.component('highchart-3dpie', {
	props: ['name', 'isYCurrency', 'yName',  'data'],
	data: function(){
		return {
			chart: null,
		}
	},
	mounted() {
		this.chart = Highcharts.chart({
			chart: { renderTo: this.$el, type: 'pie', options3d: { enabled: true, alpha: 45, beta: 0} },
			title: { text: this.yName + ' by ' + this.name },
			tooltip: {
		 		pointFormat: '{series.name}: ' + (this.isYCurrency ? '${point.y:,.2f}' : '{point.y:,.0f}') + ' <b>{point.percentage:.1f}%</b>',
				useHTML: true
		 },
		 plotOptions: {
			pie: {
				showInLegend: true,
				allowPointSelect: true,
				cursor: 'pointer',
				depth: 35,
				dataLabels: {
					enabled: true,
					formatter: function () {
						return this.y > 0 ?'<b>'+ this.point.percentage.toFixed(1) +' %</b>' : null
					}

				}
			}
		},
		 series: [{
			 	type: 'pie',
				name: this.name,
				minPointSize: 10,
				innerSize: '15%',
				zMin: 0,
				name: this.names,
			 	data: this.data
	 }]
		});
	},
	template:'<div class="chart"></div>'
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
Vue.component('activity-summary', {
	props: ['activity'],
	computed: {
		...Vuex.mapState(['calcDimensionSum' , 'merchRevenueTypes']),
		...Vuex.mapGetters(['merchRows','combinations', 'calc', 'checkCampaignType', 'sumBudget']),
	},
	methods: {
		calcColor: function(type){
			if (type === 'MP&P') {
				return '#8a8acb'
			} else if(type === 'MDON') {
				return '#f7d417'
			}else if(type === 'MGOL') {
				return '#f65a5b'
			}else if(type === 'MSPN') {
				return '#90cef1'
			}else {
				return '#cdcdcd'
			}
		},
		chartData: function() {
			return this.merchRevenueTypes.reduce((acc, cur) => {
				acc.push({
					name: cur,
					color: this.calcColor(cur),
					y: this.calc(cur, 'sum', {ACTIVITY_CODE: this.activity }),
					z: this.calc('SERIALNUMBER', 'unique', {ACTIVITY_CODE: this.activity, cur: 10 })
				})
				return acc
			}, [])
		}
	},
	template:`<div>
	<div class="card shadow my-2">
		<div class="card-header bg-dark text-light py-1">
			<span class="font-weight-bold text-warning"><< activity >></span> : << calc(calcDimensionSum, 'sum', {ACTIVITY_CODE:activity})|currency >>
		</div>
		<div class="card-body p-0">
			<div class="row">
				<div class="col-lg-8">
					<div class="table-responsive">
					<table class="table table-sm table-bordered table-hover text-right  m-0">
						<thead>
							<tr class="bg-light text-dark">
								<th scope="col" style="width:2%"><small class="font-weight-bold">Combination</small></th>
								<th scope="col" style="width:14%" v-for="t in merchRevenueTypes"><small class="font-weight-bold text-primary"><< t >></small></th>
								<th scope="col" style="width:14%"><small class="font-weight-bold text-danger">Revenue</small></th>
								<th scope="col" style="width:14%"><small class="font-weight-bold text-primary">Customer</small></th>
								<th scope="col" style="width:14%"><small class="font-weight-bold text-info">Revenue/Customer</small></th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="cb in calc('MCOMBINE', 'uniques', {ACTIVITY_CODE:activity}).sort((a, b) => a.length - b.length) ">
								<td><small><< cb >></small></td>
								<td v-for="t in merchRevenueTypes"><small class="text-primary"><< calc(t, 'sum', {ACTIVITY_CODE:activity,MCOMBINE:cb })|currency(false) >></small></td>
								<td><small class="text-danger"><< calc(calcDimensionSum, 'sum', {ACTIVITY_CODE:activity,MCOMBINE:cb })|currency(false) >></small></td>
								<td><small class="text-primary"><< calc('SERIALNUMBER', 'unique', {ACTIVITY_CODE:activity,MCOMBINE:cb })|number(false) >></small></td>
								<td><small class="text-info"><< calc(calcDimensionSum, 'sum', {ACTIVITY_CODE:activity,MCOMBINE:cb })/calc('SERIALNUMBER', 'unique', {ACTIVITY_CODE:activity,MCOMBINE:cb })|currency(false) >></small></td>
							</tr>
						</tbody>
						<tfoot>
							<tr class="table-success text-dark font-weight-bold">
								<td><small class="font-weight-bold">Total</small></td>
								<td v-for="t in merchRevenueTypes"><small class="font-weight-bold text-primary"><< calc(t, 'sum', {ACTIVITY_CODE:activity })|currency(false) >></small></td>
								<td><small class="font-weight-bold text-danger"><< calc(calcDimensionSum, 'sum', {ACTIVITY_CODE:activity })|currency(false) >></small></td>
								<td><small class="font-weight-bold text-primary"><< calc('SERIALNUMBER', 'unique', {ACTIVITY_CODE:activity })|number(false) >></small></td>
								<td><small class="font-weight-bold text-info"><< calc(calcDimensionSum, 'sum', {ACTIVITY_CODE:activity})/calc('SERIALNUMBER', 'unique', {ACTIVITY_CODE:activity})|currency(false) >></small></td>
							</tr>
							<tr class="table-warning text-dark font-weight-bold">
								<td><small class="font-weight-bold">Budget</small></td>
								<td v-for="t in merchRevenueTypes">
									<small class="font-weight-bold text-primary" v-if="t === 'MP&P'"><< sumBudget('REVENUE', {ACTIVITY_CODE:activity,SOURCETYPE:'Merchandise Purchase'})+sumBudget('REVENUE', {ACTIVITY_CODE:activity,SOURCETYPE:'Merchandise Postage'})|currency(false) >></small>
									<small class="font-weight-bold text-primary" v-else-if="t === 'MDON'"><< sumBudget('REVENUE', {ACTIVITY_CODE:activity,SOURCETYPE:'Merchandise Donation'})|currency(false) >></small>
									<small class="font-weight-bold text-primary" v-else-if="t === 'MGOL'"><< sumBudget('REVENUE', {ACTIVITY_CODE:activity,SOURCETYPE:'Merchandise Gift of Love'})|currency(false) >></small>
									<small class="font-weight-bold text-primary" v-else-if="t === 'MSPN'"><< sumBudget('REVENUE', {ACTIVITY_CODE:activity,SOURCETYPE:'Merchandise Sponsorship'})|currency(false) >></small>
								</td>
								<td><small class="font-weight-bold text-danger"><< sumBudget('REVENUE', {ACTIVITY_CODE:activity})|currency(false) >></small></td>
								<td><small class="font-weight-bold text-primary"></small></td>
								<td><small class="font-weight-bold text-info"></small></td>
							</tr>
						</tfoot>

					</table>
					</div>
				</div>
				<div class="col-lg-4">
					<highchart-3dpie name="Merchandise Source Types" :isYCurrency="true"  yName="Revenue" :data="chartData()"></highchart-3dpie>
				</div>
			</div>

		</div>

	</div>`
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
Vue.component('global-filters', {
	computed: {
		...Vuex.mapState(['activityTypes']),
		calcDimensionSum: {
			get: function() {
				return this.$store.state.calcDimensionSum
			},
			set: function(newVal) {
				this.$store.commit('SET_CALC_DIMENSION_SUM',newVal);
			}
		},
		activityTypes: {
			get: function() {
				return this.$store.state.activityTypes
			},
			set: function(newVal) {
				this.$store.commit('SET_CALC_ACTIVITY_TYPE',newVal);
			}
		},
	},
	template: `<div>

			<div class="fat-switch">
				<label class="label" for="activityTypes1" :class="{'on': activityTypes.indexOf(-1)!==-1, 'off': activityTypes.indexOf(-1)===-1}">BOTH</label>
				<label class="switch">
					<input type="checkbox" id="activityTypes1" v-bind:value="-1" v-model="activityTypes">
					<span class="slider"></span>
				</label>
			</div>

			<div class="fat-switch">
				<label class="label" for="activityTypes2" :class="{'on': activityTypes.indexOf(-2)!==-1, 'off': activityTypes.indexOf(-2)===-1}">ACTUAL ONLY</label>
				<label class="switch">
					<input type="checkbox" id="activityTypes2" v-bind:value="-2" v-model="activityTypes">
					<span class="slider"></span>
				</label>
			</div>

			<div class="fat-switch">
				<label class="label" for="activityTypes3" :class="{'on': activityTypes.indexOf(-3)!==-1, 'off': activityTypes.indexOf(-3)===-1}">BUDGET ONLY</label>
				<label class="switch">
					<input type="checkbox" id="activityTypes3" v-bind:value="-3" v-model="activityTypes">
					<span class="slider"></span>
				</label>
			</div>

			<div class="fat-switch">
				<label class="label" for="activityTypes4" :class="{'on': activityTypes.indexOf(0)!==-1, 'off': activityTypes.indexOf(0)===-1}">OTHER</label>
				<label class="switch">
					<input type="checkbox" id="activityTypes4" v-bind:value="0" v-model="activityTypes">
					<span class="slider"></span>
				</label>
			</div>


	<div>`
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
		...Vuex.mapGetters(['filteredAllActivites', 'calc']),
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
		<p class="lead my-0"><span class="text-primary font-weight-bold"><< calc(calcDimensionSum, 'sum')|currency >></span> Revenue (Net) Generated from <span class="text-success font-weight-bold"><< calc('ACTIVITY_CODE', 'unique')|number >></span> Merchandise Activitie(s) in FY<< focalFY >></p>
		<global-filters class="mt-1"></global-filters>
		<activity-summary v-for="a in filteredAllActivites" :activity="a" :key="a"></activity-summary>
	</div>`
});
