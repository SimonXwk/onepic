// ##########################################################################################################################################################
// ##########################################################################################################################################################
const store = new Vuex.Store({
	state: {
		// Raw Data
		payments: null,
		budget: null,
		marketingCycle: null,
		fyMth: $FY_MONTH_LIST,
		// Specical Filters
		focalFY: $CFY,
		focalActivity: null,
		// Global Filters
		focalIsAnon: [-1, 0],
		focalIsDecd: [-1, 0],
		focalIsEstate: [-1, 0],
		calcDimensionSum: 'PAYMENTAMOUNTNETT',
		focalPlatform: [-1, 0],
		focalEntryPlatform: [-1, 0, 1],
	},
	mutations: {
		SET_PAYMENTS:  (state, payload) => state.payments = payload,
		SET_BUDGET:  (state, payload) => state.budget = payload,
		SET_MARKET_CYCLE:  (state, payload) => state.marketingCycle = payload,

		SET_FOCALFY: (state, payload) => state.focalFY = payload,
		SET_FOCAL_ACTIVITY_CODE:  (state, payload) => state.focalActivity = payload,

		SET_EXC_ANON: (state, payload) => state.focalIsAnon = payload,
		SET_EXC_DECD: (state, payload) => state.focalIsDecd = payload,
		SET_EXC_ESTATE: (state, payload) => state.focalIsEstate = payload,

		SET_CALC_DIMENSION_SUM: (state, payload) => state.calcDimensionSum = payload,
		SET_FOCAL_PLATFORM: (state, payload) => state.focalPlatform = payload,
		SET_FOCAL_ENTRY_PLATFORM : (state, payload) => state.focalEntryPlatform = payload,
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
					return (
						(state.focalPlatform.indexOf(r.ISMRECH) !== -1)
						&& (state.focalEntryPlatform.indexOf(r.PLATFORMER) !== -1)
						&& (state.focalIsAnon.indexOf(r.FILTER_ANONYMOUS) !== -1)
						&& (state.focalIsDecd.indexOf(r.FILTER_DECEASED) !== -1)
						&& (state.focalIsEstate.indexOf(r.FILTER_ESTATE) !== -1)
					)
				})
			} else {
				return []
			}
		},
		marketingCycleRows: (state, getters) => (state.marketingCycle.rows ? state.marketingCycle.rows : []),
		allCampaignActivities: (state, getters) => [...new Set(getters.paymentRows.map(v => v.ACTIVITY_CODE))],
		campaignActivityCount:  (state, getters) => getters.allCampaignActivities.length,
		uniquesFromPaymentRows: (state, getters) => (dim, filters) => {
			let rows = !filters ? getters.paymentRows : getters.paymentRows.filter(r => {
				return Object.keys(filters).reduce((acc, key) =>	acc && (r[key] === filters[key]), true);
			});
			return [...new Set(rows.map(r => r[dim]))]
		},
		uniquesFromFocalPaymentRows: (state, getters) => (dim, filters) => {
			return getters.uniquesFromPaymentRows(dim, {...filters, ACTIVITY_CODE: state.focalActivity})
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
			return getters.calcPayments(dim, clacType, {...filters, ACTIVITY_CODE: state.focalActivity})
		},
	}
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
Vue.component('focal-source-table', {
	computed: {
		...Vuex.mapState(['focalFY', 'payments', 'budget', 'marketingCycle', 'focalActivity', 'calcDimensionSum']),
		...Vuex.mapGetters([ 'calcFocalPayments', 'uniquesFromFocalPaymentRows']),
	},
	methods: {
	},
	template:`<div class="table-responsive">
	<table class="table table-sm  table-bordered table-hover shadow-sm">
		<thead>
			<tr class="bg-light text-dark">
				<th scope="col"><small class="font-weight-bold">SourceCodes</small></th>
				<th scope="col"><small class="font-weight-bold">Revenue</small></th>
				<th scope="col"><small class="font-weight-bold">TRX</small></th>
				<th scope="col"><small class="font-weight-bold">R/T</small></th>
				<th scope="col"><small class="font-weight-bold">1ST.P</small></th>
				<th scope="col"><small class="font-weight-bold">ACQ</small></th>
				<th scope="col"><small class="font-weight-bold">Active</small></th>
				<th scope="col"><small class="font-weight-bold">T/D</small></th>
				<th scope="col"><small class="font-weight-bold">R/D</small></th>
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
				<td><small><< calcFocalPayments(calcDimensionSum, 'sum', {SOURCECODE: s1})/calcFocalPayments("TRXID", "unique", {SOURCECODE: s1, ISTRX: -1})|currency >></small></td>
				<td><small><< calcFocalPayments('PLEDGEID', 'unique', {SOURCECODE: s1, IS_FIRST_INSTALMENT: -1})|number(false) >></small></td>
				<td><small><< calcFocalPayments('SERIALNUMBER', 'unique', {SOURCECODE: s1, IS_ACQUISITION: -1})|number(false) >></small></td>
				<td><small><< calcFocalPayments('SERIALNUMBER', 'unique', {SOURCECODE: s1})|number >></small></td>
				<td><small><< calcFocalPayments("TRXID", "unique", {SOURCECODE: s1, ISTRX: -1})/calcFocalPayments('SERIALNUMBER', 'unique', {SOURCECODE: s1})|number(true,1) >></small></td>
				<td><small><< calcFocalPayments(calcDimensionSum, 'sum', {SOURCECODE: s1})/calcFocalPayments('SERIALNUMBER', 'unique', {SOURCECODE: s1})|currency >></small></td>
				<td><small><< calcFocalPayments('SERIALNUMBER', 'unique', {SOURCECODE: s1, LINE_FY_DONTYPE2: '1NEW'})|number(false) >></small></td>
				<td><small><< calcFocalPayments('SERIALNUMBER', 'unique', {SOURCECODE: s1, LINE_FY_DONTYPE2: '2NEW'})|number(false) >></small></td>
				<td><small><< calcFocalPayments('SERIALNUMBER', 'unique', {SOURCECODE: s1, LINE_FY_DONTYPE2: 'MULTI'})|number(false) >></small></td>
				<td><small><< calcFocalPayments('SERIALNUMBER', 'unique', {SOURCECODE: s1, LINE_FY_DONTYPE2: '2REC'})|number(false) >></small></td>
				<td><small><< calcFocalPayments('SERIALNUMBER', 'unique', {SOURCECODE: s1, LINE_FY_DONTYPE2: '1REC'})|number(false) >></small></td>

			</tr>
		</tbody>
		<tfoot>
			<tr class="bg-light text-dark font-weight-bold">
				<td><small class="font-weight-bold">Total</small></td>
				<td><small class="font-weight-bold"><< calcFocalPayments(calcDimensionSum, 'sum')|currency >></small></td>
				<td><small class="font-weight-bold"><< calcFocalPayments("TRXID", "unique", {ISTRX: -1})|number >></small></td>
				<td><small class="font-weight-bold"><< calcFocalPayments(calcDimensionSum, 'sum')/calcFocalPayments("TRXID", "unique", {ISTRX: -1})|currency >></small></td>
				<td><small class="font-weight-bold"><< calcFocalPayments('PLEDGEID', 'unique', {IS_FIRST_INSTALMENT: -1})|number(false) >></small></td>
				<td><small class="font-weight-bold"><< calcFocalPayments('SERIALNUMBER', 'unique', {IS_ACQUISITION: -1})|number(false) >></small></td>
				<td><small class="font-weight-bold"><< calcFocalPayments('SERIALNUMBER', 'unique')|number >></small></td>
				<td><small><< calcFocalPayments("TRXID", "unique", {ISTRX: -1})/calcFocalPayments('SERIALNUMBER', 'unique')|number(true,1) >></small></td>
				<td><small class="font-weight-bold"><< calcFocalPayments(calcDimensionSum, 'sum')/calcFocalPayments('SERIALNUMBER', 'unique')|currency >></small></td>
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
Vue.component('focal-month-table', {
	data: function(){
		return {
			calculations: ['Revenue', 'Transaction', 'Giver', 'Acqusition', 'Pledge'],
			focalCalculation: 'Revenue',
		}
	},
	computed: {
		...Vuex.mapState(['focalFY', 'payments', 'budget', 'fyMth', 'marketingCycle', 'focalActivity', 'calcDimensionSum']),
		...Vuex.mapGetters([ 'calcFocalPayments', 'uniquesFromFocalPaymentRows']),
	},
	methods: {
	},
	template:`<div>
	<select v-model="focalCalculation" >
		<option v-for="c in calculations" v-bind:value="c" ><< c >></option>
	</select>

	<div class="table-responsive">
		<table class="table table-sm table-bordered table-hover shadow-sm text-right">
			<thead>
				<tr class="bg-light text-dark">
					<th scope="col"><small class="font-weight-bold">SourceCodes</small></th>
					<th scope="col"><small class="font-weight-bold"><< focalCalculation >></small></th>
					<th scope="col" v-for="mth in fyMth.short"><small class="font-weight-bold "><< mth >></small></th>
				</tr>
			</thead>
			<tbody v-if="focalCalculation==='Revenue'">
				<tr v-for="s1 in uniquesFromFocalPaymentRows('SOURCECODE')">
					<td style="width:5%"><small><< s1 >></small></td>
					<td style="width:5%"><small class="text-primary font-weight-bold"><< calcFocalPayments(calcDimensionSum, 'sum', {SOURCECODE: s1})|currency >></small></td>
					<td v-for="(mth, idx) in fyMth.number" style="width:7.5%"><small><<  calcFocalPayments(calcDimensionSum, 'sum', {SOURCECODE: s1, PAYMENT_FYMTH:idx+1})|currency(false) >></small></td>
				</tr>
			</tbody>
			<tbody v-else-if="focalCalculation==='Transaction'">
				<tr v-for="s1 in uniquesFromFocalPaymentRows('SOURCECODE')">
					<td style="width:5%"><small><< s1 >></small></td>
					<td style="width:5%"><small class="text-primary font-weight-bold"><< calcFocalPayments("TRXID", "unique", {ISTRX: -1,  SOURCECODE: s1,})|number >></small></td>
					<td v-for="(mth, idx) in fyMth.number" style="width:7.5%"><small><<  calcFocalPayments("TRXID", "unique", {ISTRX: -1, SOURCECODE: s1, PAYMENT_FYMTH:idx+1} )|number(false) >></small></td>
				</tr>
			</tbody>
			<tbody v-else-if="focalCalculation==='Giver'">
				<tr v-for="s1 in uniquesFromFocalPaymentRows('SOURCECODE')">
					<td style="width:5%"><small><< s1 >></small></td>
					<td style="width:5%"><small class="text-primary font-weight-bold"><< calcFocalPayments("SERIALNUMBER", "unique", {SOURCECODE: s1,})|number >></small></td>
					<td v-for="(mth, idx) in fyMth.number" style="width:7.5%"><small><<  calcFocalPayments("SERIALNUMBER", "unique", { SOURCECODE: s1, PAYMENT_FYMTH:idx+1} )|number(false) >></small></td>
				</tr>
			</tbody>
			<tbody v-else-if="focalCalculation==='Acqusition'">
				<tr v-for="s1 in uniquesFromFocalPaymentRows('SOURCECODE')">
					<td style="width:5%"><small><< s1 >></small></td>
					<td style="width:5%"><small class="text-success font-weight-bold"><< calcFocalPayments("SERIALNUMBER", "unique", {SOURCECODE: s1, IS_ACQUISITION: -1})|number(false) >></small></td>
					<td v-for="(mth, idx) in fyMth.number" style="width:7.5%"><small><<  calcFocalPayments("SERIALNUMBER", "unique", {SOURCECODE: s1, IS_ACQUISITION: -1, PAYMENT_FYMTH:idx+1} )|number(false) >></small></td>
				</tr>
			</tbody>
			<tbody v-else-if="focalCalculation==='Pledge'">
				<tr v-for="s1 in uniquesFromFocalPaymentRows('SPONSORSHIP1')">
					<td style="width:5%"><small><< s1 >></small></td>
					<td style="width:5%"><small class="text-success font-weight-bold"><< calcFocalPayments("PLEDGEID", "unique", {SPONSORSHIP1: s1, IS_FIRST_INSTALMENT: -1})|number(false) >></small></td>
					<td v-for="(mth, idx) in fyMth.number" style="width:7.5%"><small><<  calcFocalPayments("PLEDGEID", "unique", {SPONSORSHIP1: s1, IS_FIRST_INSTALMENT: -1, PAYMENT_FYMTH:idx+1} )|number(false) >></small></td>
				</tr>
			</tbody>
			<tfoot v-if="focalCalculation==='Revenue'">
				<tr class="bg-light text-dark font-weight-bold">
					<td><small class="font-weight-bold">Total</small></td>
					<td><small class="font-weight-bold "><< calcFocalPayments(calcDimensionSum, 'sum')|currency >></small></td>
					<td v-for="(mth, idx) in fyMth.number"><small class="font-weight-bold "><< calcFocalPayments(calcDimensionSum, 'sum', {PAYMENT_FYMTH:idx+1})|currency >></small></td>
				</tr>
			</tfoot>
			<tfoot v-else-if="focalCalculation==='Transaction'">
				<tr class="bg-light text-dark font-weight-bold">
					<td><small class="font-weight-bold">Total</small></td>
					<td><small class="font-weight-bold "><< calcFocalPayments("TRXID", "unique", {ISTRX: -1})|number >></small></td>
					<td v-for="(mth, idx) in fyMth.number"><small class="font-weight-bold "><<  calcFocalPayments("TRXID", "unique", {ISTRX: -1,PAYMENT_FYMTH:idx+1})|number >></small></td>
				</tr>
			</tfoot>
			<tfoot v-else-if="focalCalculation==='Giver'">
				<tr class="bg-light text-dark font-weight-bold">
					<td><small class="font-weight-bold">Total</small></td>
					<td><small class="font-weight-bold "><< calcFocalPayments("SERIALNUMBER", "unique")|number >></small></td>
					<td v-for="(mth, idx) in fyMth.number"><small class="font-weight-bold "><<  calcFocalPayments("SERIALNUMBER", "unique", {PAYMENT_FYMTH:idx+1})|number >></small></td>
				</tr>
			</tfoot>
			<tfoot v-else-if="focalCalculation==='Acqusition'">
				<tr class="bg-light text-dark font-weight-bold">
					<td><small class="font-weight-bold">Total</small></td>
					<td><small class="font-weight-bold "><< calcFocalPayments("SERIALNUMBER", "unique", {IS_ACQUISITION: -1})|number >></small></td>
					<td v-for="(mth, idx) in fyMth.number"><small class="font-weight-bold "><<  calcFocalPayments("SERIALNUMBER", "unique", {IS_ACQUISITION: -1, PAYMENT_FYMTH:idx+1})|number >></small></td>
				</tr>
			</tfoot>
			<tfoot v-else-if="focalCalculation==='Pledge'">
				<tr class="bg-light text-dark font-weight-bold">
					<td><small class="font-weight-bold">Total</small></td>
					<td><small class="font-weight-bold "><< calcFocalPayments("PLEDGEID", "unique", {IS_FIRST_INSTALMENT: -1})|number >></small></td>
					<td v-for="(mth, idx) in fyMth.number"><small class="font-weight-bold "><<  calcFocalPayments("PLEDGEID", "unique", {IS_FIRST_INSTALMENT: -1, PAYMENT_FYMTH:idx+1})|number >></small></td>
				</tr>
			</tfoot>
		</table>
	</div>

	</div>`
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
Vue.component('summary-table', {
	computed: {
		...Vuex.mapState(['focalFY', 'calcDimensionSum', 'focalActivity']),
		...Vuex.mapGetters([ 'calcPayments', 'calcFocalPayments', 'uniquesFromPaymentRows', 'uniquesFromFocalPaymentRows']),
	},
	methods: {
		calc: function(...arguments){
			if(this.focalActivity !== null ){
				return this.calcFocalPayments(...arguments)
			}else{
				return this.calcPayments(...arguments)
			}
		},
		uniques: function(...arguments){
			if(this.focalActivity !== null ){
				return this.uniquesFromFocalPaymentRows(...arguments)
			}else{
				return this.uniquesFromPaymentRows(...arguments)
			}
		},
	},
	template:`<div class="table-responsive">
	<table class="table table-sm table-hover shadow-sm mt-2">
		<thead>
			<tr class="bg-dark text-light">
				<th scope="col"><small class="font-weight-bold">Platform & Type</small></th>
				<th scope="col"><small class="font-weight-bold">Revenue</small></th>
				<th scope="col"><small class="font-weight-bold">Active</small></th>
				<th scope="col"><small class="font-weight-bold">T/D</small></th>
				<th scope="col"><small class="font-weight-bold">R/D</small></th>
				<th scope="col"><small class="font-weight-bold">TRX</small></th>
				<th scope="col"><small class="font-weight-bold">R/T</small></th>
				<th scope="col"><small class="font-weight-bold">1ST.P</small></th>
				<th scope="col"><small class="font-weight-bold">ACQ</small></th>
			</tr>
		</thead>
		<tbody>
			<template v-for="pt in uniques('ISMRECH')">
			<tr class="table-light text-primary">
				<td><small class="font-weight-bold"><< pt===-1?'Merchandise':'Non Merchandise' >></small></td>
				<td><small class="font-weight-bold"><< calc(calcDimensionSum, 'sum', {ISMRECH: pt})|currency >></small></td>
				<td><small class="font-weight-bold"><< calc('SERIALNUMBER', 'unique', {ISMRECH: pt})|number >></small></td>
				<td><small class="font-weight-bold"><< (calc("TRXID", "unique", {ISMRECH: pt, ISTRX: -1})/calc('SERIALNUMBER', 'unique', {ISMRECH: pt}))|number(true,1) >></small></td>
				<td><small class="font-weight-bold"><< (calc(calcDimensionSum, 'sum', {ISMRECH: pt})/calc('SERIALNUMBER', 'unique', {ISMRECH: pt}))|currency >></small></td>
				<td><small class="font-weight-bold"><< calc("TRXID", "unique", {ISMRECH: pt, ISTRX: -1})|number >></small></td>
				<td><small class="font-weight-bold"><< calc(calcDimensionSum, 'sum', {ISMRECH: pt})/calc("TRXID", "unique", {ISMRECH: pt, ISTRX: -1})|currency >></small></td>
				<td><small class="font-weight-bold"><< calc('PLEDGEID', 'unique', {ISMRECH: pt, IS_FIRST_INSTALMENT: -1})|number >></small></td>
				<td><small class="font-weight-bold"><< calc('SERIALNUMBER', 'unique', {ISMRECH: pt, IS_ACQUISITION: -1})|number >></small></td>
			</tr>
			<tr v-for="type2 in uniques('LINE_FY_DONTYPE2')">
				<td><small> - << type2 >></small></td>
				<td><small><< calc(calcDimensionSum, 'sum', {ISMRECH: pt, LINE_FY_DONTYPE2: type2})|currency >></small></td>
				<td><small><< calc('SERIALNUMBER', 'unique', {ISMRECH: pt, LINE_FY_DONTYPE2: type2})|number >></small></td>
				<td><small><< (calc("TRXID", "unique", {ISMRECH: pt, ISTRX: -1, LINE_FY_DONTYPE2: type2})/calc('SERIALNUMBER', 'unique', {ISMRECH: pt, LINE_FY_DONTYPE2: type2}))|number(true,1) >></small></td>
				<td><small><< (calc(calcDimensionSum, 'sum', {ISMRECH: pt, LINE_FY_DONTYPE2: type2})/calc('SERIALNUMBER', 'unique', {ISMRECH: pt, LINE_FY_DONTYPE2: type2}))|currency >></small></td>
				<td><small><< calc("TRXID", "unique", {ISMRECH: pt, ISTRX: -1, LINE_FY_DONTYPE2: type2})|number >></small></td>
				<td><small><< calc(calcDimensionSum, 'sum', {ISMRECH: pt, LINE_FY_DONTYPE2: type2})/calc("TRXID", "unique", {ISMRECH: pt, ISTRX: -1, LINE_FY_DONTYPE2: type2})|currency >></small></td>
				<td><small><< calc('PLEDGEID', 'unique', {ISMRECH: pt, IS_FIRST_INSTALMENT: -1, LINE_FY_DONTYPE2: type2})|number(false) >></small></td>
				<td><small><< calc('SERIALNUMBER', 'unique', {ISMRECH: pt, IS_ACQUISITION: -1, LINE_FY_DONTYPE2: type2})|number(false) >></small></td>
			</tr>
			</template>
		</tbody>
		<tfoot>
			<tr class="bg-light text-dark font-weight-bold">
				<td><small class="font-weight-bold">Total</small></td>
				<td><small class="font-weight-bold"><< calc(calcDimensionSum, 'sum')|currency >></small></td>
				<td><small class="font-weight-bold"><< calc('SERIALNUMBER', 'unique')|number >></small></td>
				<td><small class="font-weight-bold"><< (calc("TRXID", "unique", {ISTRX: -1})/calc('SERIALNUMBER', 'unique'))|number(true,1) >></small></td>
				<td><small class="font-weight-bold"><< calc(calcDimensionSum, 'sum')/calc('SERIALNUMBER', 'unique')|currency >></small></td>
				<td><small class="font-weight-bold"><< calc("TRXID", "unique", {ISTRX: -1})|number >></small></td>
				<td><small class="font-weight-bold"><< calc(calcDimensionSum, 'sum')/calc("TRXID", "unique", {ISTRX: -1})|currency >></small></td>
				<td><small class="font-weight-bold"><< calc('PLEDGEID', 'unique', {IS_FIRST_INSTALMENT: -1})|number(false) >></small></td>
				<td><small class="font-weight-bold"><< calc('SERIALNUMBER', 'unique', {IS_ACQUISITION: -1})|number(false) >></small></td>
			</tr>
		</tfoot>
	</table>
	</div>`
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
Vue.component('summaries', {
	computed: {
		...Vuex.mapState(['focalFY', 'payments', 'budget', 'marketingCycle', 'focalActivity', 'calcDimensionSum']),
		...Vuex.mapGetters(['paymentRows', 'marketingCycleRows', 'calcPayments', 'calcFocalPayments', 'uniquesFromPaymentRows']),
	},
	methods: {
		...Vuex.mapMutations({
			setFocalCampaignActivity: 'SET_FOCAL_ACTIVITY_CODE'
		}),
		calc: function(...arguments){
			if(this.focalActivity !== null ){
				return this.calcFocalPayments(...arguments)
			}else{
				return this.calcPayments(...arguments)
			}
		},
	},
	template:`<div>
	<div class="row">
		<div class="col-xs-12 col-md-12 col-lg-4">
			<card-counter theme="primary" icon="&#128181;" :num="calc(calcDimensionSum, 'sum')|currency" msg="Revenue"></card-counter>
		</div>
		<div class="col-xs-12 col-md-12 col-lg-4">
			<card-counter theme="primary" icon="&#128522;" :num="calc('SERIALNUMBER', 'unique')|number" msg="Active Donor(s)"></card-counter>
		</div>
		<div class="col-xs-12 col-md-12 col-lg-4">
			<card-counter theme="info" icon="&#129309;" :num="calc('TRXID', 'unique', {ISTRX: -1})|number" msg="Transaction(s)"></card-counter>
		</div>
	</div>

	<div class="row">
		<div class="col-xs-12 col-md-12 col-lg-4">
			<card-counter theme="merch" icon="&#127873;" :num="calc('SERIALNUMBER', 'unique', {PLATFORMER: 1})|number" msg="Pure Non-Merch Donor(s)"></card-counter>
		</div>
		<div class="col-xs-12 col-md-12 col-lg-4">
			<card-counter theme="merch" icon="&#127882;" :num="calc('SERIALNUMBER', 'unique', {PLATFORMER: 0})|number" msg="Mixed Donor(s)"></card-counter>
		</div>
		<div class="col-xs-12 col-md-12 col-lg-4">
			<card-counter theme="merch" icon="&#128717;" :num="calc('SERIALNUMBER', 'unique', {PLATFORMER: -1})|number" msg="Pure Merch Customer(s)"></card-counter>
		</div>
	</div>

	<div class="row">
		<div class="col-xs-12 col-md-12 col-lg-4">
			<card-counter theme="danger" icon="&#128512;" :num="calc('SERIALNUMBER', 'unique', {LINE_FY_DONTYPE1: 'NEW'})|number" msg="1st Year New"></card-counter>
		</div>
		<div class="col-xs-12 col-md-12 col-lg-4">
			<card-counter theme="danger" icon="&#128512;" :num="calc('SERIALNUMBER', 'unique', {LINE_FY_DONTYPE1: 'CON'})|number" msg="Continuing"></card-counter>
		</div>
		<div class="col-xs-12 col-md-12 col-lg-4">
			<card-counter theme="danger" icon="&#128512;" :num="calc('SERIALNUMBER', 'unique', {LINE_FY_DONTYPE1: 'REC'})|number" msg="1st Year Reactivated"></card-counter>
		</div>
	</div>

	<div class="row">
		<div class="col-xs-12 col-md-12 col-lg-4">
			<card-counter theme="warning" icon="&#128578;" :num="calc('SERIALNUMBER', 'unique', {LINE_FY_DONTYPE2: '2NEW'})|number" msg="2nd Year New"></card-counter>
		</div>
		<div class="col-xs-12 col-md-12 col-lg-4">
			<card-counter theme="warning" icon="&#128578;" :num="calc('SERIALNUMBER', 'unique', {LINE_FY_DONTYPE2: 'MULTI'})|number" msg="Mutli Year"></card-counter>
		</div>
		<div class="col-xs-12 col-md-12 col-lg-4">
			<card-counter theme="warning" icon="&#128578;" :num="calc('SERIALNUMBER', 'unique', {LINE_FY_DONTYPE2: '2REC'})|number" msg="2nd Year Reactivated"></card-counter>
		</div>
	</div>

	<div class="row">
		<div class="col-xs-12 col-md-12 col-lg-4">
			<card-counter theme="success" icon="&#128536;" :num="calc('SERIALNUMBER', 'unique', {IS_ACQUISITION: -1})|number" msg="Donor Acqusition"></card-counter>
		</div>
		<div class="col-xs-12 col-md-12 col-lg-4">
			<card-counter theme="success" icon="&#128140;" :num="calc('PLEDGEID', 'unique', {IS_FIRST_INSTALMENT: -1})|number" msg="1st Instalments Paid Pledge(s)"></card-counter>
		</div>
		<div class="col-xs-12 col-md-12 col-lg-4">
			<card-counter theme="success" icon="&#128178;" :num="calc(calcDimensionSum, 'sum', {ISPLEDGE: -1})|currency" msg="Pledge 1st Instalments"></card-counter>
		</div>
	</div>

	</div>`
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
Vue.component('tree', {
	computed: {
		...Vuex.mapState(['focalFY', 'focalActivity']),
		...Vuex.mapGetters(['campaignActivityCount', 'marketingCycleRows', 'calcPayments', 'uniquesFromPaymentRows']),
	},
	methods: {
		...Vuex.mapMutations({
			setFocalCampaignActivity: 'SET_FOCAL_ACTIVITY_CODE'
		}),
	},
	template: `<div class="tree">
	<ul>
		<li><span  v-bind:class="{'bg-warning': focalActivity===null}"><a data-toggle="collapse" href="#Root" aria-expanded="true" aria-controls="Root" @click.prevent="setFocalCampaignActivity(null)" >FY<< focalFY >> Activities <span class="text-primary"><< campaignActivityCount >></span></a></span>
		<div id="Root" class="collapse show">
			<ul>
				<li v-for="(ca1, idx1) in uniquesFromPaymentRows('IS_ACTIVITY_ONGOING')">
					<span><a data-toggle="collapse" :href="'#'+(ca1===-1?'Ongoing':'Periodical')" aria-expanded="false" :aria-controls="(ca1===-1?'Ongoing':'Periodical')"> << (ca1===-1?'Ongoing':'Periodical') >> <span class="text-primary"><< uniquesFromPaymentRows('ACTIVITY_CODE', {IS_ACTIVITY_ONGOING: ca1}).length >></span></a></span>
					<ul>
						<div :id="(ca1===-1?'Ongoing':'Periodical')" class="collapse">
							<li v-for="mc in marketingCycleRows" v-if="ca1===0||calcPayments('ACTIVITY_CODE', 'unique', {IS_ACTIVITY_ONGOING:ca1, MARKETING_CYCLE:mc.NAME})!==0">
								<span><a data-toggle="collapse" :href="'#'+(ca1===-1?'Ongoing':'Periodical')+mc.CODE" aria-expanded="false" :aria-controls="(ca1===-1?'Ongoing':'Periodical')+mc.CODE"><< mc.NAME >> <span class="text-success"><< calcPayments('ACTIVITY_CODE', 'unique', {IS_ACTIVITY_ONGOING:ca1, MARKETING_CYCLE:mc.NAME}) >></span></a></span>
								<ul v-if="calcPayments('ACTIVITY_CODE', 'unique', {IS_ACTIVITY_ONGOING:ca1, MARKETING_CYCLE:mc.NAME})>0">
									<div :id="(ca1===-1?'Ongoing':'Periodical')+mc.CODE" class="collapse">
										<li v-for="ca2 in uniquesFromPaymentRows('ACTIVITY_CODE', {IS_ACTIVITY_ONGOING:ca1, MARKETING_CYCLE:mc.NAME})">
											<span v-bind:class="{'bg-success': ca2===focalActivity, 'bg-light':ca2!==focalActivity }"><a href="#!" @click.prevent="setFocalCampaignActivity(ca2)"><< ca2 >></a></span>
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
Vue.component('global-filters', {
	computed: {
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
		focalEntryPlatform: {
			get: function() {
				return this.$store.state.focalEntryPlatform
			},
			set: function(newVal) {
				this.$store.commit('SET_FOCAL_ENTRY_PLATFORM',newVal);
			}
		},
		focalIsAnon: {
			get: function() {
				return this.$store.state.focalIsAnon
			},
			set: function(newVal) {
				this.$store.commit('SET_EXC_ANON',newVal);
			}
		},
		focalIsDecd: {
			get: function() {
				return this.$store.state.focalIsDecd
			},
			set: function(newVal) {
				this.$store.commit('SET_EXC_DECD',newVal);
			}
		},
		focalIsEstate: {
			get: function() {
				return this.$store.state.focalIsEstate
			},
			set: function(newVal) {
				this.$store.commit('SET_EXC_ESTATE',newVal);
			}
		},


	},
	template: `<div>
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
		<input type="checkbox" id="focalIsAnon1" value="-1" v-model.number="focalIsAnon">
		<label for="focalIsAnon1" class="text-dark">Anon</label>
		<input type="checkbox" id="focalIsAnon2" value="0" v-model.number="focalIsAnon">
		<label for="focalIsAnon2" class="text-dark">!Anon</label>
	<div>

	<div>
		<input type="checkbox" id="focalIsDecd1" value="-1" v-model.number="focalIsDecd">
		<label for="focalIsDecd1" class="text-dark">DECD</label>
		<input type="checkbox" id="focalIsDecd2" value="0" v-model.number="focalIsDecd">
		<label for="focalIsDecd2" class="text-dark">!DECD</label>
	<div>
	<div>
		<input type="checkbox" id="focalIsEstate1" value="-1" v-model.number="focalIsEstate">
		<label for="focalIsEstate1" class="text-dark">Estate</label>
		<input type="checkbox" id="focalIsEstate2" value="0" v-model.number="focalIsEstate">
		<label for="focalIsEstate2" class="text-dark">!Estate</label>
	<div>

	<div>
		<span>Revenue Platform : </span>
		<input type="checkbox" id="15" value="-1" v-model.number="focalPlatform">
		<label for="15" class="text-dark">MERCH</label>
		<input type="checkbox" id="20" value="0" v-model.number="focalPlatform">
		<label for="20" class="text-dark">NON-MERCH</label>
	</div>

	<div>
		<span>Donor Platform : </span>
		<input type="checkbox" id="Entry15" value="-1" v-model.number="focalEntryPlatform">
		<label for="Entry15" class="text-dark">MERCH</label>
		<input type="checkbox" id="Entry20" value="1" v-model.number="focalEntryPlatform">
		<label for="Entry20" class="text-dark">NON-MERCH</label>
		<input type="checkbox" id="Entry1520" value="0" v-model.number="focalEntryPlatform">
		<label for="Entry1520" class="text-dark">BOTH</label>
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
		marketingCycleDataReady: false,
	},
	store,
	computed: {
		...Vuex.mapState(['focalFY', 'payments', 'focalActivity']),
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
	template:`
	<vueLoader msg="Retrieving Payment & Budget Data  ..." v-if="!paymentDataReady&&!budgetDataReady"></vueLoader>
	<vueLoader msg="Retrieving Payment Data in ThankQ ..." v-else-if="!paymentDataReady&&budgetDataReady"></vueLoader>
	<vueLoader msg="Retrieving Budget Information ..." v-else-if="!budgetDataReady&&paymentDataReady"></vueLoader>
	<div class="container-fluid" v-else>
		<div class="row">

			<div class="col-xs-12 col-sm-6 col-md-5 col-lg-4 col-xl-3">
				<p class="my-0"><small class="text-muted">Data Captured : << payments.timestamp|dtAU >> << payments.bytes|number >> bytes<small></p>
				<global-filters></global-filters>
				<tree></tree>
			</div>

			<div class="col-xs-12 col-sm-6 col-md-7 col-lg-8 col-xl-9">
				<template  v-if="focalActivity">
					<transition name="slide-fade">
					<h3 class="lead mt-0 mb-1" v-if="focalActivity"><span class="text-primary">FY<< focalFY >></span> : <mark class="font-weight-bold text-danger"><< focalActivity >></mark></p>
					</transition>
					<summaries></summaries>
					<focal-source-table></focal-source-table>
					<focal-month-table></focal-month-table>
				</template>

				<template v-else>
					<transition name="slide-fade">
					<h4 class="lead mt-0 mb-2 text-center"><span class="text-primary font-weight-bold"><< campaignActivityCount >></span> TLMA Activities Generated Revenue in <span class="text-primary font-weight-bold">FY<< focalFY >></span></h4>
					</transition>
					<summaries></summaries>
					<summary-table></summary-table>
				</template>
			</div>

		</div>
	</div>
	`
});
