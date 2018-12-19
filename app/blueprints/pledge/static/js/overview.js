// let renderCht1 = (thisFY, rows) => { Highcharts.chart('chart1', {
// 	chart: {
// 		type: 'waterfall'
// 	},
// 	title: {
// 		text: 'FY' + thisFY + ' Continuous Pledge Number Net Growth Waterfall Diagram'
// 	},
// 	xAxis: {
// 		type: 'category'
// 	},
// 	yAxis: {
// 		title: {
// 			text: 'Number of pledges'
// 		}
// 	},
// 	legend: {
// 		enabled: false
// 	},
// 	tooltip: {
// 		pointFormat: '<b>{point.y:,.0f}</b> Pledges'
// 	},
// 	series: [{
// 		name: 'FY' + thisFY + ' Pledges',
// 		upColor: '#c2ff00',
// 		color: '#f65a5b',
// 		data: [
// 		{
// 			name: 'FY' + thisFY + ' New',
// 			y: rows.filter(d => d['PLEDGEPLAN'] === 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] === thisFY ).length
// 		}, {
// 			name: 'New Cancelled',
// 			color: '#f65a5b',
// 			y: rows.filter(d => d['PLEDGEPLAN'] === 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] === thisFY && d['PLEDGESTATUS'] === 'Written Down' && d['WRITTENDOWN_FY'] === thisFY ).length * (-1)
// 			},{
// 			name: 'New On Hold',
// 			color: '#FFEB3B',
// 			y: rows.filter(d => d['PLEDGEPLAN'] === 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] === thisFY && d['PLEDGESTATUS'] === 'On Hold' && d['ONHOLD_FY'] === thisFY ).length * (-1)
// 		}, {
// 			name: 'Previous Cancelled',
// 			color: '#f65a5b',
// 			y: rows.filter(d => d['PLEDGEPLAN'] === 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] < thisFY && d['PLEDGESTATUS'] === 'Written Down' && d['WRITTENDOWN_FY'] === thisFY ).length * (-1)
// 			},{
// 			name: 'Previous On Hold',
// 			color: '#FFEB3B',
// 			y: rows.filter(d => d['PLEDGEPLAN'] === 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] < thisFY && d['PLEDGESTATUS'] === 'On Hold' && d['ONHOLD_FY'] === thisFY ).length * (-1)
// 		},{
// 			name: 'Net Growth',
// 			isSum: true,
// 			color: '#d0e6da'
// 		}],
// 		dataLabels: {
// 			enabled: true,
// 			verticalAlign: 'top',
// 			useHTML: true,
// 			formatter: function () {
// 				return '<span style="color:' + (this.y > 0 ? '#000000' : (this.y === 0 ? '#94938f' : '#ce1126')) + '">' + Highcharts.numberFormat(this.y, 0, ',') + '</span>';
// 			},
// 			style: {
// 				fontWeight: 'bold'
// 			}
// 		},
// 		pointPadding: 0
// 	}]
// });}
//
// let renderCht2 = (thisFY) => { Highcharts.chart('chart2', {
// 	chart: {
// 		type: 'waterfall'
// 	},
// 	title: {
// 		text: 'FY' + thisFY + ' Fixed Terms Pledge Number Net Growth Waterfall Diagram'
// 	},
// 	xAxis: {
// 		type: 'category'
// 	},
// 	yAxis: {
// 		title: {
// 			text: 'Number of pledges'
// 		}
// 	},
// 	legend: {
// 		enabled: false
// 	},
// 	tooltip: {
// 		pointFormat: '<b>{point.y:,.0f}</b> Pledges',
// 	},
// 	series: [{
// 		name: 'FY' + thisFY + ' Pledges',
// 		upColor: '#c2ff00',
// 		color: '#f65a5b',
// 		data: [
// 		{
// 			name: 'FY' + thisFY + ' New',
// 			y: rows.filter(d => d['PLEDGEPLAN'] !== 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] === thisFY ).length
// 		}, {
// 			name: 'New Cancelled',
// 			color: '#f65a5b',
// 			y: rows.filter(d => d['PLEDGEPLAN'] !== 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] === thisFY && d['PLEDGESTATUS'] === 'Written Down' && d['WRITTENDOWN_FY'] === thisFY ).length * (-1)
// 		}, {
// 			name: 'New Finished',
// 			color: '#FF9800',
// 			y: rows.filter(d => d['PLEDGEPLAN'] !== 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] === thisFY && d['PLEDGESTATUS'] === 'Closed' && d['CLOSED_FY'] === thisFY ).length * (-1)
// 		}, {
// 			name: 'New On Hold',
// 			color: '#FFEB3B',
// 			y: rows.filter(d => d['PLEDGEPLAN'] !== 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] === thisFY && d['PLEDGESTATUS'] === 'On Hold' && d['ONHOLD_FY'] === thisFY ).length * (-1)
// 		}, {
// 			name: 'Previous Cancelled',
// 			color: '#f65a5b',
// 			y: rows.filter(d => d['PLEDGEPLAN'] !== 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] < thisFY && d['PLEDGESTATUS'] === 'Written Down' && d['WRITTENDOWN_FY'] === thisFY ).length * (-1)
// 		}, {
// 			name: 'Previous Finished',
// 			color: '#FF9800',
// 			y: rows.filter(d => d['PLEDGEPLAN'] !== 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] < thisFY && d['PLEDGESTATUS'] === 'Closed' && d['CLOSED_FY'] === thisFY ).length * (-1)
// 		}, {
// 			name: 'Previous On Hold',
// 			color: '#FFEB3B',
// 			y: rows.filter(d => d['PLEDGEPLAN'] !== 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] < thisFY && d['PLEDGESTATUS'] === 'On Hold' && d['ONHOLD_FY'] === thisFY ).length * (-1)
// 		},{
// 			name: 'Net Growth',
// 			isSum: true,
// 			color:'#d0e6da'
// 		}],
// 		dataLabels: {
// 			enabled: true,
// 			verticalAlign: 'top',
// 			useHTML: true,
// 			formatter: function () {
// 				return '<span style="color:' + (this.y > 0 ? '#000000' : (this.y === 0 ? '#94938f' : '#ce1126')) + '">' + Highcharts.numberFormat(this.y, 0, ',') + '</span>';
// 			},
// 			style: {
// 				fontWeight: 'bold'
// 			}
// 		},
// 		pointPadding: 0
// 	}]
// });}
// ##########################################################################################################################################################
// ##########################################################################################################################################################
const store = new Vuex.Store({
	state: {
		fy: $CFY,
		fyMths: $FY_MONTH_LIST,
		focalMth: new Date().getMonth() + 1,
		fetchingStatus: '',
		pledgeData: null,
		pledgeDataReady: false,
		// pledgeTypesDict: null
	},
	mutations: {
		SET_FY: (state, payload) => state.fy = payload,
		SET_FOCAL_MTH: (state, payload) => {state.focalMth = payload; console.log(state.focalMth ) },
		SET_FETCH_STATUS: (state, payload) => state.fetchingStatus = payload,
		SET_PLEDGE_DATA: (state, payload) => state.pledgeData = payload,
		SET_PLEDGE_DATA_READY_STATUS: (state, payload) => state.pledgeDataReady = payload,
		// SET_PLEDGE_TYPE_DATA: (state, payload) => state.pledgeTypesDict = payload,
	},
	actions: {
		// fetchPledgeTypes(ctx){
		// 	return new Promise((resolve, reject) => {
		// 		ctx.commit('SET_FETCH_STATUS', 'Fetching Data (Pledge Types) ...');
		// 		fetch(endpoint('/api/tq/pledge_types'))
		// 			.then(resp => {
		// 				if (resp.status >= 200 && resp.status < 300) {
		// 					ctx.commit('SET_FETCH_STATUS', '✓ Response received successfully (Pledge Types)');
		// 					return Promise.resolve(resp)
		// 				} else {
		// 					ctx.commit('SET_FETCH_STATUS', '✘ Response Status Failed (Pledge Types)');
		// 					return Promise.reject(new Error(resp.statusText))
		// 				}
		// 			})
		// 			.then(resp => {
		// 				ctx.commit('SET_FETCH_STATUS', 'Convering data to JSON format (Pledge Types)');
		// 				return resp.json()
		// 			})
		// 			.then(json => {
		// 				ctx.commit('SET_FETCH_STATUS', '✓ Storing JSON data to context (Pledge Types)');
		// 				ctx.commit('SET_PLEDGE_TYPE_DATA', json);
		// 				ctx.commit('SET_FETCH_STATUS', '✓ Data Stored (Pledge Types)');
		// 				resolve()
		// 			});
		// 	});
		// },
		fetchPledgeData(ctx){
			return new Promise((resolve, reject) => {
				ctx.commit('SET_FETCH_STATUS', 'Fetching Data (Pledge Header) ...');
				fetch(endpoint('/api/tq/pledges' + '?fy='  + ctx.state.fy))
					.then(resp => {
						if (resp.status >= 200 && resp.status < 300) {
							ctx.commit('SET_FETCH_STATUS', '✓ Response received successfully (Pledge Header)');
							return Promise.resolve(resp)
						} else {
							ctx.commit('SET_FETCH_STATUS', '✘ Response Status Failed (Pledge Header)');
							return Promise.reject(new Error(resp.statusText))
						}
					})
					.then(resp => {
						ctx.commit('SET_FETCH_STATUS', 'Convering data to JSON format (Pledge Header)');
						return resp.json()
					})
					.then(json => {
						ctx.commit('SET_FETCH_STATUS', '✓ Storing JSON data to context (Pledge Header)');
						ctx.commit('SET_PLEDGE_DATA', json);
						ctx.commit('SET_FETCH_STATUS', '✓ Data Stored (Pledge Header)');
						ctx.commit('SET_PLEDGE_DATA_READY_STATUS', true);
						resolve()
					});
			});
		},
	},
	getters: {
		pledgeTypes: (state, getters) => {
			return [...new Set(state.pledgeData.rows.map(r => r.SPONSORSHIP1))].sort((a, b) => a.slice(-1) > b.slice(-1))
		},
		focalFyMth: (state, getters) => state.focalMth < 7 ? state.focalMth + 6 : state.focalMth -6,
	}
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
Vue.component('pledge-mth-table', {
	props: ['mth'],
	data: function(){
		return {
			chart: null,
			renderer: null,
			width: 320,
			height: 500,
		}
	},
	computed: {
		...Vuex.mapState(['fy', 'fyMths', 'pledgeData', 'pledgeTypes']),
		...Vuex.mapGetters(['pledgeTypes']),
		fymth: function() {
			return this.mth < 7 ? this.mth + 6 : this.mth -6
		},

	},
	methods: {
		countMTHUnique: function(dimDate, dimFY, type) {
			// console.log(this.pledgeData.rows[0][dimDate], new Date(this.pledgeData.rows[0][dimDate]));

			return new Set(this.pledgeData.rows.filter(r => r[dimFY] == this.fy && new Date(r[dimDate]).getMonth()+1 === this.mth && (type ? r.SPONSORSHIP1 == type : true) ).map(p => p.PLEDGEID)).size
		},
		countYTMUnique: function(dimDate, dimFY, type) {
			return new Set(this.pledgeData.rows.filter(r => r[dimFY] == this.fy && new Date(r[dimDate]).getMonth()+1 <= this.mth && (type ? r.SPONSORSHIP1 == type : true) ).map(p => p.PLEDGEID)).size
		},
		countActive: function(type) {
			let rows = this.pledgeData.rows.filter(r =>  (type ? r.SPONSORSHIP1 == type : true) );
			return new Set(rows.filter(r =>  r.PLEDGESTATUS.trim().toUpperCase() === 'ACTIVE').map(p => p.PLEDGEID)).size
			  + new Set(rows.filter(r => r.PLEDGESTATUS.trim().toUpperCase() === 'CLOSED' &&  r.FINISHED !== null && new Date(r.FINISHED) > new Date() ).map(p => p.PLEDGEID)).size
		}

	},
	template:`<div class="table-responsive">
	<p class="lead font-weight-bold"><< fyMths.long[fymth-1] >>
		<span class="text-info">(YTM: << fyMths.long[0] >> to << fyMths.long[fymth-1] >>, FY<< fy >>)</span>
		<span class="text-success">(Live: as at << pledgeData.timestamp|dtAU >>)</span>
	</p>
	<table class="table table-sm table-hover table-bordered text-right shadow-sm mt-2">
		<thead>
			<tr class="bg-secondary text-light">
				<th scope="col">Pledge Type</th>
				<th scope="col">New Started (MTH)</th>
				<th scope="col">New Started (YTM)</th>
				<th scope="col">Active (Live)</th>
				<th scope="col">Cancelled (MTH)</th>
				<th scope="col">Cancelled (YTM)</th>
				<th scope="col">Finished (MTH)</th>
				<th scope="col">Finished (YTM)</th>
				<th scope="col">Delinquency (MTH)</th>
				<th scope="col">Delinquency (YTM)</th>
			</tr>
		</thead>
		<tbody>
			<tr class="text-dark" v-for="type in pledgeTypes">
				<td><< type >></td>
				<td class="table-light"><< countMTHUnique('STARTDATE', 'START_FY', type)|number(false) >></td>
				<td class="text-primary"><< countYTMUnique('STARTDATE', 'START_FY', type)|number(false) >></td>

				<td class="table-success"><< countActive(type)|number(false) >></td>

				<td class="table-light"><< countMTHUnique('WRITTENDOWN', 'WRITTENDOWN_FY', type)|number(false) >></td>
				<td class="text-primary"><< countYTMUnique('WRITTENDOWN', 'WRITTENDOWN_FY', type)|number(false) >></td>

				<td class="table-light"><< countMTHUnique('WRITTENDOWN', 'WRITTENDOWN_FY', type)|number(false) >></td>
				<td class="text-primary"><< countYTMUnique('WRITTENDOWN', 'WRITTENDOWN_FY', type)|number(false) >></td>

				<td class="table-light"><< countMTHUnique('FINISHED', 'FINISHED_FY', type)|number(false) >></td>
				<td class="text-primary"><< countYTMUnique('FINISHED', 'FINISHED_FY', type)|number(false) >></td>
			</tr>
		</tbody>
		<tfoot>
			<tr class="bg-light text-dark font-weight-bold">
				<td>Total</td>
				<td class="table-light"><< countMTHUnique('STARTDATE', 'START_FY')|number(false) >></td>
				<td class="text-primary"><< countYTMUnique('STARTDATE', 'START_FY')|number(false) >></td>

				<td class="table-success"><< countActive()|number(false) >></td>

				<td class="table-light"><< countMTHUnique('WRITTENDOWN', 'WRITTENDOWN_FY')|number(false) >></td>
				<td class="text-primary"><< countYTMUnique('WRITTENDOWN', 'WRITTENDOWN_FY')|number(false) >></td>

				<td class="table-light"><< countMTHUnique('FINISHED', 'FINISHED_FY')|number(false) >></td>
				<td class="text-primary"><< countYTMUnique('FINISHED', 'FINISHED_FY')|number(false) >></td>

				<td class="table-light"><< countMTHUnique('ONHOLDDATETIME', 'ONHOLD_FY')|number(false) >></td>
				<td class="text-primary"><< countYTMUnique('ONHOLDDATETIME', 'ONHOLD_FY')|number(false) >></td>
			</tr>
		</tfoot>
	</table>
	</div>`
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
let rootVue = new Vue({
	el: '#root',
	data: {
	},
	store,
	computed: {
		...Vuex.mapState(['fy', 'fyMths', 'focalMth', 'fetchingStatus', 'pledgeDataReady', 'pledgeData']),
		...Vuex.mapGetters(['focalFyMth']),
		focalMth: {
			get: function() {
				return this.$store.state.focalMth
			},
			set: function(newVal) {
				this.$store.commit('SET_FOCAL_MTH', newVal < 7 ? newVal + 6 : newVal -6);
			}
		},
	},
	watch: {
		fy: {
			handler: 'getData',
			immediate: true
		},
	},
	methods: {
		...Vuex.mapActions(['fetchPledgeData']),
		getData: function() {
			this.fetchPledgeData()
		}
	},
	created(){
		// this.fetchPledgeData()
	},
	template:`<div class="container-fluid">
	<div v-if="!pledgeDataReady">
		<p class="lead text-center">Fetching Data : << fetchingStatus >></p>
	</div>
	<div v-else>
		<< focalMth >>
		<< focalFyMth >>
		<select v-model="focalMth" >
			<option v-for="m in 12" v-bind:value="m" :g="focalFyMth" :selected="m===focalFyMth"><< fyMths.long[m-1] >></option>
		</select>
		<pledge-mth-table :mth="focalMth"></pledge-mth-table>
	</div>
	</div>`
});
