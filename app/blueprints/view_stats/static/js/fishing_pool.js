// ##########################################################################################################################################################
// ##########################################################################################################################################################
const store = new Vuex.Store({
	state: {
		focalDate1: new Date(Date.UTC(new Date().getMonth()<6?new Date().getFullYear()-2:new Date().getFullYear()-1, 5, 30, 0 , 0 , 0 ,0)),
		focalDate2: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0 , 0 , 0 ,0)),
		rawData: null,
		rawDataReady: false,
		rawDataStatus: '',
		rawSanketData: null,
		rawSnakeyDataReady: false,
		countDim: 'COUNT',
		// Global filters
		fDecd: [-1, 0],
		fDNM: [-1, 0],
		fEstate: [-1, 0],
		fMajDon: [-1, 0],
		fAnon: [-1, 0],
		fHasEmail: [-1, 0],
		fContactType: [-1, 0],
		fGender: [-2, -1, 0, 1],
		trackingAnchor: null,
		trackingType: null,
		trackingSoft: null,
	},
	mutations: {
		SET_FOCA_LDATE1: (state, payload) => state.focalDate1 = payload,
		SET_FOCAL_DATE2: (state, payload) => state.focalDate2 = payload,
		SET_RAWDATA:  (state, payload) => state.rawData = payload,
		SET_RAWDATA_READY_STATUS: (state, payload) => state.rawDataReady = payload,
		SET_RAWDATA_MESSAGE_STATUS: (state, payload) => state.rawDataStatus = payload,
		SET_RAWSANKEYDATA:  (state, payload) => state.rawSanketData = payload,
		SET_RAWSANKEYDATA_READY_STATUS: (state, payload) => state.rawSnakeyDataReady = payload,
		SET_FOCAL_DECD: (state, payload) => state.fDecd = payload,
		SET_FOCAL_DNM: (state, payload) => state.fDNM = payload,
		SET_FOCAL_ESTATE: (state, payload) => state.fEstate = payload,
		SET_FOCAL_MAJORDON: (state, payload) => state.fMajDon = payload,
		SET_FOCAL_ANONYMOUS: (state, payload) => state.fAnon = payload,
		SET_FOCAL_HASEMAIL: (state, payload) => state.fHasEmail = payload,
		SET_FOCAL_CONTACTTYPE: (state, payload) => state.fContactType = payload,
		SET_FOCAL_CGENDER: (state, payload) => state.fGender = payload,

		SET_TRACKING_ANCHOR: (state, payload) => state.trackingAnchor = payload,
		SET_TRACKING_TYPE: (state, payload) => state.trackingType = payload,
		SET_TRACKING_SOFT: (state, payload) => state.trackingSoft = payload,
	},
	actions: {
		fetchRawData(ctx, fy){
			fy = fy ? fy : ctx.state.focalFY;
			return new Promise((resolve, reject) => {
				ctx.commit('SET_RAWDATA_MESSAGE_STATUS', 'Fetching data from thankQ ...');
				fetch(endpoint('/api/tq/fishing_pool'))
					.then(resp => {
						if (resp.status >= 200 && resp.status < 300) {
							ctx.commit('SET_RAWDATA_MESSAGE_STATUS', '✓ Response received successfully');
							return Promise.resolve(resp)
						} else {
							ctx.commit('SET_RAWDATA_MESSAGE_STATUS', '✘ Response Status Failed');
							return Promise.reject(new Error(resp.statusText))
						}
					})
					.then(resp => {
						ctx.commit('SET_RAWDATA_MESSAGE_STATUS', 'Convering data to JSON format');
						return resp.json()
					})
					.then(json => {
						ctx.commit('SET_RAWDATA_MESSAGE_STATUS', '✓ Storing JSON data to context');
						ctx.commit('SET_RAWDATA', json);
						ctx.commit('SET_RAWDATA_MESSAGE_STATUS', '✓ Data stored, preparing Page Views');
						ctx.commit('SET_RAWDATA_READY_STATUS', true);
						resolve()
					});
			});
		},
		fetchSankeyData(ctx, fy){
			fy = fy ? fy : ctx.state.focalFY;
			return new Promise((resolve, reject) => {
				fetch(endpoint('/api/tq/fishing_pool_sankey'))
					.then(resp => {
						if (resp.status >= 200 && resp.status < 300) {
							return Promise.resolve(resp)
						} else {
							return Promise.reject(new Error(resp.statusText))
						}
					})
					.then(resp => {
						return resp.json()
					})
					.then(json => {
						ctx.commit('SET_RAWSANKEYDATA', json);
						ctx.commit('SET_RAWSANKEYDATA_READY_STATUS', true);
						resolve()
					});
			});
		},
	},
	getters: {
		timestamp:  (state, getters) => !state.rawDataReady ? null : state.rawData.timestamp,
		totalCount: (state, getters) => !state.rawDataReady ? 0 : state.rawData.rows.reduce((acc, cur) => acc + cur[state.countDim]  ,0),
		errCount:  (state, getters) => !state.rawDataReady ? 0 : state.rawData.rows.filter(r => r.CONTACT_CREATED === null).reduce((acc, cur) => acc + cur[state.countDim]  ,0),
		applyGolbalFilters:  (state, getters) => (r) => {
			return (state.fDecd.indexOf(r.FILTER_DECEASED) !== -1)
				&& (state.fDNM.indexOf(r.FILTER_DONOTMAIL) !== -1 )
				&& (state.fEstate.indexOf(r.FILTER_ESTATE) !== -1 )
				&& (state.fMajDon.indexOf(r.FILTER_MAJDONOR) !== -1 )
				&& (state.fAnon.indexOf(r.FILTER_ANONYMOUS) !== -1 )
				&& (state.fHasEmail.indexOf(r.FILTER_EMAIL) !== -1 )
				&& (state.fContactType.indexOf(r.FILTER_ORGANISATION) !== -1 )
				&& (state.fGender.indexOf(r.FILTER_GENDER) !== -1 )
		},
		getTypeDim:  (state, getters) => (anchor) => (anchor === 1 ? 'FILTER_ANCHOR1_GIVER' :  'FILTER_ANCHOR2_GIVER'),
		getSoftDim:  (state, getters) => (anchor) => (anchor === 1 ? 'FILTER_ANCHOR1_SOFT' :  'FILTER_ANCHOR2_SOFT'),
		trackingFilter: (state, getters) => {
			let f = {};
			if (state.trackingAnchor===null || state.trackingAnchor===undefined || state.trackingType===null || state.trackingType===undefined) {
				return f
			} else {
				if (state.trackingType!==undefined && state.trackingType!==null) {
					f[getters.getTypeDim(state.trackingAnchor)] = state.trackingType;
				}
				if (state.trackingSoft!==undefined && state.trackingSoft!==null) {
					f[getters.getSoftDim(state.trackingAnchor)] = state.trackingSoft;
				}
				return f
			}
		},
		filteredRows: (state, getters) => {
			return !state.rawDataReady ? [] : state.rawData.rows.filter(r => getters.applyGolbalFilters(r))
		},
		filteredCount: (state, getters) => getters.filteredRows.reduce((acc, cur) => acc + cur[state.countDim]  ,0),
		count: (state, getters) => (filters) => {
			console.log(filters);
			return ( (filters==={} || filters===undefined || filters===null) ? getters.filteredRows : getters.filteredRows.filter(r => {
				return Object.keys(filters).reduce((acc, key) =>	acc && (r[key] === filters[key]), true);
			})).reduce((acc, cur) => acc + cur[state.countDim]  ,0)
		}
	}
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
Vue.component('highchart-sankey', {
	data: function(){
		return {
			chart: null,
		}
	},
	computed: {
		...Vuex.mapState(['rawSnakeyDataReady', 'rawSanketData']),
	},
	methods: {
		...Vuex.mapActions(['fetchSankeyData']),
	},
	watch: {
		rawSnakeyDataReady: function(newVal, oldVal) {
			if (newVal === true) {
				this.chart = Highcharts.chart({
					chart: { renderTo: this.$el },
					title: { text: null },
					tooltip: {
						pointFormat: '{series.name}: ' + (this.isYCurrency ? '${point.y:,.2f}' : '{point.y:,.0f}') + ' <b>{point.percentage:.1f}%</b>',
						useHTML: true
					},

					series: [{
						keys: ['from', 'to', 'weight'],
						data: this.rawSanketData.rows,
						// nodes: chart.nodes,
						type: 'sankey',
						name: 'Movement'
		 			}]
				});
			}
		}
	},
	created(){
		this.fetchSankeyData().then(() => {});
	},
	mounted() {

	},
	template:`<div class="chart" style="height: 750px;"><div class="row justify-content-center"><loader-ellipsis></loader-ellipsis></div></div>`
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
Vue.component('anchor-summary', {
	props: ['anchor'],
	data: function() {
		return {
		}
	},
	computed: {
		...Vuex.mapState(['rawDataReady', 'trackingAnchor', 'trackingType', 'trackingSoft']),
		...Vuex.mapGetters(['count', 'trackingFilter', 'getTypeDim', 'getSoftDim']),
		type: function() {
			return this.getTypeDim(this.anchor)
		},
		soft: function() {
			return this.getSoftDim(this.anchor)
		}
	},
	methods: {
		filter: function(type, soft, other) {
			let f = {};
			if (type!==undefined && type!==null) {
				f[this.type] = type;
			}
			if (soft!==undefined && soft!==null) {
				f[this.soft] = soft;
			}
			if (this.trackingAnchor === this.anchor) {
				return Object.assign(f, other)
			}else {
				return  Object.assign(Object.assign(f, this.trackingFilter), other)
			}
		},
		isTrackingTarget: function(type, soft) {
			return (this.trackingAnchor === this.anchor && (this.trackingType === type || (this.trackingType ==null && type === undefined)) && (this.trackingSoft === soft || (this.trackingSoft ==null && soft === undefined)))
		},
		setTracking: function(type, soft) {
			console.log("before: ", type, soft, this.trackingFilter);
			if (this.isTrackingTarget(type, soft)) {
				this.$store.commit('SET_TRACKING_ANCHOR',null);
				this.$store.commit('SET_TRACKING_TYPE',null);
				this.$store.commit('SET_TRACKING_SOFT',null);
			}else {
				this.$store.commit('SET_TRACKING_ANCHOR',this.anchor);
				this.$store.commit('SET_TRACKING_TYPE',type===undefined?null:type);
				this.$store.commit('SET_TRACKING_SOFT',soft===undefined?null:soft);
			}
			console.log("after: ", type, soft, this.trackingFilter);
		},

	},
	template: `
	<div class="card shadow-sm mt-3">
		<div class="card-body">
			<h4 class="card-title text-center"><mark>Fishing Pool using Anchor << anchor >> &#9875;</mark></h4>
			<div class="row my-3 justify-content-center" v-if="anchor === 2">
				<div class="col-xs-12 col-sm-6">
					<card-counter theme="primary" icon="&#127907;" :num="count(filter(210, null, {'FILTER_DECEASED': 0}))+count(filter(220, null, {'FILTER_DECEASED': 0}))+count(filter(230, null, {'FILTER_DECEASED': 0}))
						+count(filter(-110, null, {'FILTER_DECEASED': 0}))+count(filter(-121, null, {'FILTER_DECEASED': 0}))+count(filter(-122, null, {'FILTER_DECEASED': 0}))+count(filter(-123, null, {'FILTER_DECEASED': 0}))+count(filter(-130, null, {'FILTER_DECEASED': 0}))
						+count(filter(-210, null, {'FILTER_DECEASED': 0}))+count(filter(-220, null, {'FILTER_DECEASED': 0}))+count(filter(-230, null, {'FILTER_DECEASED': 0}))|number"
						:msg="'Fishing Pool'">
					</card-counter>
				</div>
			</div>

			<div class="row my-3 justify-content-center" v-if="anchor === 2">
				<div class="col-xs-12 col-sm-6 col-md-4">
					<card-counter theme="merch" icon="&#9904;" :num="count() - count(filter(0))|number" msg="Exist (contact or payment)"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-4">
					<card-counter theme="info" icon="&#127887;" :num="count(filter(210, null, {'FILTER_DECEASED': 0}))+count(filter(220, null, {'FILTER_DECEASED': 0}))+count(filter(230, null, {'FILTER_DECEASED': 0}))|number" msg="No Gift (pool)"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-4">
					<card-counter theme="success" icon="&#128032;" :num="count(filter(-110, null, {'FILTER_DECEASED': 0}))+count(filter(-121, null, {'FILTER_DECEASED': 0}))+count(filter(-122, null, {'FILTER_DECEASED': 0}))+count(filter(-123, null, {'FILTER_DECEASED': 0}))+count(filter(-130, null, {'FILTER_DECEASED': 0}))|number" msg="Active (pool)"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-4">
					<card-counter theme="monitor" icon="&#128031;" :num="count(filter(-210, null, {'FILTER_DECEASED': 0}))+count(filter(-220, null, {'FILTER_DECEASED': 0}))+count(filter(-230, null, {'FILTER_DECEASED': 0}))|number" msg="Lapsed (pool)"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-4">
					<card-counter theme="warning" icon="&#128033;" :num="count(filter(-240, null, {'FILTER_DECEASED': 0}))+count(filter(240, null, {'FILTER_DECEASED': 0}))|number" msg="Lost"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-4">
					<card-counter theme="dark" icon="&#9904;" :num="count({'FILTER_DECEASED': -1})- count(filter(0, null, {'FILTER_DECEASED': -1}))|number" msg="Deceased"></card-counter>
				</div>
			</div>

			<h5 class="text-center text-success">Active</h5>
			<div class="row mb-2 justify-content-center">
				<div class="col-xs-12 col-sm-6 col-md-2" v-on:click="setTracking(-110)">
					<card-counter theme="success" icon="&#127793;" :num="count(filter(-110))|number" msg="1ST NEW" :class="{'bg-danger': isTrackingTarget(-110)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-2" v-on:click="setTracking(-121)">
					<card-counter theme="success" icon="&#127807;" :num="count(filter(-121))|number" msg="2ND NEW" :class="{'bg-danger': isTrackingTarget(-121)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-2" v-on:click="setTracking(-122)">
					<card-counter theme="success" icon="&#127794;" :num="count(filter(-122))|number" msg="MULTI" :class="{'bg-danger': isTrackingTarget(-122)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-2" v-on:click="setTracking(-123)">
					<card-counter theme="success" icon="&#127796;" :num="count(filter(-123))|number" msg="2ND REC" :class="{'bg-danger': isTrackingTarget(-123)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-2" v-on:click="setTracking(-130)">
					<card-counter theme="success" icon="&#127811;" :num="count(filter(-130))|number" msg="1ST REC" :class="{'bg-danger': isTrackingTarget(-130)}" style="cursor: pointer;"></card-counter>
				</div>
			</div>

			<h5 class="text-center text-warning">Lapsed (months)</h5>
			<div class="row mb-2 justify-content-center">
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-210)">
					<card-counter theme="warning" icon="&#127806;" :num="count(filter(-210))|number" msg="LPSD1 [0, 12]" :class="{'bg-danger': isTrackingTarget(-210)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-220)">
					<card-counter theme="warning" icon="&#127810;" :num="count(filter(-220))|number" msg="LPSD2 (12, 24]" :class="{'bg-danger': isTrackingTarget(-220)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-230)">
					<card-counter theme="warning" icon="&#127809;" :num="count(filter(-230))|number" msg="LPSD3 (24, 60)" :class="{'bg-danger': isTrackingTarget(-230)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-240)">
					<card-counter theme="warning" icon="&#129344;" :num="count(filter(-240))|number" msg="LPSD4 [60, inf)" :class="{'bg-danger': isTrackingTarget(-240)}" style="cursor: pointer;"></card-counter>
				</div>
			</div>

			<div class="row mb-2 justify-content-center">
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-210, -1)">
					<card-counter theme="monitor" icon="&#127806;" :num="count(filter(-210, -1))|number" msg="S-LPSD1 [0, 12]" :class="{'bg-danger': isTrackingTarget(-210, -1)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-220, -1)">
					<card-counter theme="monitor" icon="&#127810;" :num="count(filter(-220, -1))|number" msg="S-LPSD2 (12, 24]" :class="{'bg-danger': isTrackingTarget(-220, -1)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-230, -1)">
					<card-counter theme="monitor" icon="&#127809;" :num="count(filter(-230, -1))|number" msg="S-LPSD3 (24, 60)" :class="{'bg-danger': isTrackingTarget(-230, -1)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-240, -1)">
					<card-counter theme="monitor" icon="&#129344;" :num="count(filter(-240, -1))|number" msg="S-LPSD4 [60, inf)" :class="{'bg-danger': isTrackingTarget(-240, -1)}" style="cursor: pointer;"></card-counter>
				</div>
			</div>

			<div class="row mb-2 justify-content-center">
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-210, 0)">
					<card-counter theme="monitor" icon="&#127806;" :num="count(filter(-210, 0))|number" msg="H-LPSD1 [0, 12]" :class="{'bg-danger': isTrackingTarget(-210, 0)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-220, 0)">
					<card-counter theme="monitor" icon="&#127810;" :num="count(filter(-220, 0))|number" msg="H-LPSD2 (12, 24]" :class="{'bg-danger': isTrackingTarget(-220, 0)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-230, 0)">
					<card-counter theme="monitor" icon="&#127809;" :num="count(filter(-230, 0))|number" msg="H-LPSD3 (24, 60)" :class="{'bg-danger': isTrackingTarget(-230, 0)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-240, 0)">
					<card-counter theme="monitor" icon="&#129344;" :num="count(filter(-240, 0))|number" msg="H-LPSD4 [60, inf)" :class="{'bg-danger': isTrackingTarget(-240, 0)}" style="cursor: pointer;"></card-counter>
				</div>
			</div>

			<hr class="my-3 shadow-sm" />

			<h5 class="text-center text-primary">Never Given (months)</h5>
			<div class="row mb-2 justify-content-center">
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(210)">
					<card-counter theme="primary" icon="&#9732;" :num="count(filter(210))|number" msg="NG1 [0, 12]" :class="{'bg-danger': isTrackingTarget(210)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(220)">
					<card-counter theme="primary" icon="&#128167;" :num="count(filter(220))|number" msg="NG2 (12, 24]" :class="{'bg-danger': isTrackingTarget(220)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(230)">
					<card-counter theme="primary" icon="&#127754;" :num="count(filter(230))|number" msg="NG3 (24, 60)" :class="{'bg-danger': isTrackingTarget(230)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(240)">
					<card-counter theme="primary" icon="&#10052;" :num="count(filter(240))|number" msg="NG4 [60, inf)" :class="{'bg-danger': isTrackingTarget(240)}" style="cursor: pointer;"></card-counter>
				</div>
			</div>

			<div class="row mb-2 justify-content-center">
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(210, -1)">
					<card-counter theme="info" icon="&#9732;" :num="count(filter(210, -1))|number" msg="S-NG1 [0, 12]" :class="{'bg-danger': isTrackingTarget(210, -1)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(220, -1)">
					<card-counter theme="info" icon="&#128167;" :num="count(filter(220, -1))|number" msg="S-NG2 (12, 24]" :class="{'bg-danger': isTrackingTarget(220, -1)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(230, -1)">
					<card-counter theme="info" icon="&#127754;" :num="count(filter(230, -1))|number" msg="S-NG3 (24, 60)" :class="{'bg-danger': isTrackingTarget(230, -1)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(240, -1)">
					<card-counter theme="info" icon="&#10052;" :num="count(filter(240, -1))|number" msg="S-NG4 [60, inf)" :class="{'bg-danger': isTrackingTarget(240, -1)}" style="cursor: pointer;"></card-counter>
				</div>
			</div>

			<div class="row mb-2 justify-content-center">
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(210, 0)">
					<card-counter theme="info" icon="&#9732;" :num="count(filter(210, 0))|number" msg="H-NG1 [0, 12]" :class="{'bg-danger': isTrackingTarget(210, 0)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(220, 0)">
					<card-counter theme="info" icon="&#128167;" :num="count(filter(220, 0))|number" msg="H-NG2 (12, 24]" :class="{'bg-danger': isTrackingTarget(220, 0)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(230, 0)">
					<card-counter theme="info" icon="&#127754;" :num="count(filter(230, 0))|number" msg="H-NG3 (24, 60)" :class="{'bg-danger': isTrackingTarget(230, 0)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(240, 0)">
					<card-counter theme="info" icon="&#10052;" :num="count(filter(240, 0))|number" msg="H-NG4 [60, inf)" :class="{'bg-danger': isTrackingTarget(240, 0)}" style="cursor: pointer;"></card-counter>
				</div>
			</div>


			<h5 class="text-center text-dark">Not Exist (Prospect Created in Future)</h5>
			<div class="row mb-2 justify-content-center">
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(0)">
					<card-counter theme="dark" icon="&#127787;" :num="count(filter(0))|number" msg="Not Exist" :class="{'bg-danger': isTrackingTarget(0)}" style="cursor: pointer;"></card-counter>
				</div>
			</div>

		</div>
	</div>`
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
Vue.component('global-filters', {
	computed: {
		...Vuex.mapState([]),
		fDecd: {
			get: function() {
				return this.$store.state.fDecd
			},
			set: function(newVal) {
				this.$store.commit('SET_FOCAL_DECD',newVal);
			}
		},
		fDNM: {
			get: function() {
				return this.$store.state.fDNM
			},
			set: function(newVal) {
				this.$store.commit('SET_FOCAL_DNM',newVal);
			}
		},
		fEstate: {
			get: function() {
				return this.$store.state.fEstate
			},
			set: function(newVal) {
				this.$store.commit('SET_FOCAL_ESTATE',newVal);
			}
		},
		fMajDon: {
			get: function() {
				return this.$store.state.fMajDon
			},
			set: function(newVal) {
				this.$store.commit('SET_FOCAL_MAJORDON',newVal);
			}
		},
		fAnon: {
			get: function() {
				return this.$store.state.fAnon
			},
			set: function(newVal) {
				this.$store.commit('SET_FOCAL_ANONYMOUS',newVal);
			}
		},
		fHasEmail: {
			get: function() {
				return this.$store.state.fHasEmail
			},
			set: function(newVal) {
				this.$store.commit('SET_FOCAL_HASEMAIL',newVal);
			}
		},
		fContactType: {
			get: function() {
				return this.$store.state.fContactType
			},
			set: function(newVal) {
				this.$store.commit('SET_FOCAL_CONTACTTYPE',newVal);
			}
		},
		fGender: {
			get: function() {
				return this.$store.state.fGender
			},
			set: function(newVal) {
				this.$store.commit('SET_FOCAL_CGENDER',newVal);
			}
		},

	},
	template: `<div class="container">

	<div class="card bg-light my-1 mx-0 px-1 py-0 d-inline-block" :class="{'border-secondary':fDecd.length===0, 'border-success':fDecd.length!==0}">
		<div class="fat-switch">
			<label class="label" for="fDecd1" :class="{'on': fDecd.indexOf(-1)!==-1, 'off': fDecd.indexOf(-1)===-1}">DECD</label>
			<label class="switch">
				<input type="checkbox" id="fDecd1" v-bind:value="-1" v-model="fDecd">
				<span class="slider"></span>
			</label>
		</div>
		<div class="fat-switch">
			<label class="label" for="fDecd2" :class="{'on': fDecd.indexOf(0)!==-1, 'off': fDecd.indexOf(0)===-1}">ALIVE</label>
			<label class="switch">
				<input type="checkbox" id="fDecd2" v-bind:value="0" v-model="fDecd">
				<span class="slider"></span>
			</label>
		</div>
	</div>

	<div class="card bg-light my-1 mx-0 px-1 py-0 d-inline-block" :class="{'border-secondary':fEstate.length===0, 'border-success':fEstate.length!==0}">
		<div class="fat-switch">
			<label class="label" for="fEstate1" :class="{'on': fEstate.indexOf(-1)!==-1, 'off': fEstate.indexOf(-1)===-1}">Estate</label>
			<label class="switch">
				<input type="checkbox" id="fEstate1" v-bind:value="-1" v-model="fEstate">
				<span class="slider"></span>
			</label>
		</div>
		<div class="fat-switch">
			<label class="label" for="fEstate2" :class="{'on': fEstate.indexOf(0)!==-1, 'off': fEstate.indexOf(0)===-1}">Non-Estate</label>
			<label class="switch">
				<input type="checkbox" id="fEstate2" v-bind:value="0" v-model="fEstate">
				<span class="slider"></span>
			</label>
		</div>
	</div>

	<div class="card bg-light my-1 mx-0 px-1 py-0 d-inline-block" :class="{'border-secondary':fMajDon.length===0, 'border-success':fMajDon.length!==0}">
		<div class="fat-switch">
			<label class="label" for="fMajDon1" :class="{'on': fMajDon.indexOf(-1)!==-1, 'off': fMajDon.indexOf(-1)===-1}">MajDon</label>
			<label class="switch">
				<input type="checkbox" id="fMajDon1" v-bind:value="-1" v-model="fMajDon">
				<span class="slider"></span>
			</label>
		</div>
		<div class="fat-switch">
			<label class="label" for="fMajDon2" :class="{'on': fMajDon.indexOf(0)!==-1, 'off': fMajDon.indexOf(0)===-1}">Non-Major</label>
			<label class="switch">
				<input type="checkbox" id="fMajDon2" v-bind:value="0" v-model="fMajDon">
				<span class="slider"></span>
			</label>
		</div>
	</div>

	<div class="card bg-light my-1 mx-0 px-1 py-0 d-inline-block" :class="{'border-secondary':fDNM.length===0, 'border-success':fDNM.length!==0}">
		<div class="fat-switch">
			<label class="label" for="fDNM1" :class="{'on': fDNM.indexOf(-1)!==-1, 'off': fDNM.indexOf(-1)===-1}">DNM</label>
			<label class="switch">
				<input type="checkbox" id="fDNM1" v-bind:value="-1" v-model="fDNM">
				<span class="slider"></span>
			</label>
		</div>
		<div class="fat-switch">
			<label class="label" for="fDNM2" :class="{'on': fDNM.indexOf(0)!==-1, 'off': fDNM.indexOf(0)===-1}">Mailable</label>
			<label class="switch">
				<input type="checkbox" id="fDNM2" v-bind:value="0" v-model="fDNM">
				<span class="slider"></span>
			</label>
		</div>
	</div>

	<div class="card bg-light my-1 mx-0 px-1 py-0 d-inline-block" :class="{'border-secondary':fAnon.length===0, 'border-success':fAnon.length!==0}">
		<div class="fat-switch">
			<label class="label" for="fAnon1" :class="{'on': fAnon.indexOf(-1)!==-1, 'off': fAnon.indexOf(-1)===-1}">Anon</label>
			<label class="switch">
				<input type="checkbox" id="fAnon1" v-bind:value="-1" v-model="fAnon">
				<span class="slider"></span>
			</label>
		</div>
		<div class="fat-switch">
			<label class="label" for="fAnon2" :class="{'on': fAnon.indexOf(0)!==-1, 'off': fAnon.indexOf(0)===-1}">Known</label>
			<label class="switch">
				<input type="checkbox" id="fAnon2" v-bind:value="0" v-model="fAnon">
				<span class="slider"></span>
			</label>
		</div>
	</div>

	<div class="card bg-light my-1 mx-0 px-1 py-0 d-inline-block" :class="{'border-secondary':fHasEmail.length===0, 'border-success':fHasEmail.length!==0}">
		<div class="fat-switch">
			<label class="label" for="fHasEmail1" :class="{'on': fHasEmail.indexOf(-1)!==-1, 'off': fHasEmail.indexOf(-1)===-1}">Email</label>
			<label class="switch">
				<input type="checkbox" id="fHasEmail1" v-bind:value="-1" v-model="fHasEmail">
				<span class="slider"></span>
			</label>
		</div>
		<div class="fat-switch">
			<label class="label" for="fHasEmail2" :class="{'on': fHasEmail.indexOf(0)!==-1, 'off': fHasEmail.indexOf(0)===-1}">NoEmail</label>
			<label class="switch">
				<input type="checkbox" id="fHasEmail2" v-bind:value="0" v-model="fHasEmail">
				<span class="slider"></span>
			</label>
		</div>
	</div>

	<div class="card bg-light my-1 mx-0 px-1 py-0 d-inline-block" :class="{'border-secondary':fContactType.length===0, 'border-success':fContactType.length!==0}">
		<div class="fat-switch">
			<label class="label" for="fContactType1" :class="{'on': fContactType.indexOf(-1)!==-1, 'off': fContactType.indexOf(-1)===-1}">ORG</label>
			<label class="switch">
				<input type="checkbox" id="fContactType1" v-bind:value="-1" v-model="fContactType">
				<span class="slider"></span>
			</label>
		</div>
		<div class="fat-switch">
			<label class="label" for="fContactType2" :class="{'on': fContactType.indexOf(0)!==-1, 'off': fContactType.indexOf(0)===-1}">IND</label>
			<label class="switch">
				<input type="checkbox" id="fContactType2" v-bind:value="0" v-model="fContactType">
				<span class="slider"></span>
			</label>
		</div>
	</div>

	<div class="card bg-light my-1 mx-0 px-1 py-0 d-inline-block" :class="{'border-secondary':fGender.length===0, 'border-success':fGender.length!==0}">
		<div class="fat-switch">
			<label class="label" for="fGender1" :class="{'on': fGender.indexOf(-1)!==-1, 'off': fGender.indexOf(-1)===-1}">Male</label>
			<label class="switch">
				<input type="checkbox" id="fGender1" v-bind:value="-1" v-model="fGender">
				<span class="slider"></span>
			</label>
		</div>
		<div class="fat-switch">
			<label class="label" for="fGender2" :class="{'on': fGender.indexOf(-2)!==-1, 'off': fGender.indexOf(-2)===-1}">Female</label>
			<label class="switch">
				<input type="checkbox" id="fGender2" v-bind:value="-2" v-model="fGender">
				<span class="slider"></span>
			</label>
		</div>
		<div class="fat-switch">
			<label class="label" for="fGender3" :class="{'on': fGender.indexOf(0)!==-1, 'off': fGender.indexOf(0)===-1}">MIS</label>
			<label class="switch">
				<input type="checkbox" id="fGender3" v-bind:value="0" v-model="fGender">
				<span class="slider"></span>
			</label>
		</div>
		<div class="fat-switch">
			<label class="label" for="fGender4" :class="{'on': fGender.indexOf(1)!==-1, 'off': fGender.indexOf(1)===-1}">N/A</label>
			<label class="switch">
				<input type="checkbox" id="fGender4" v-bind:value="1" v-model="fGender">
				<span class="slider"></span>
			</label>
		</div>
	</div>

	<hr class="my-2">

	<div>`
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
let rootVue = new Vue({
	el: '#root',
	data: {
	},
	store,
	computed: {
		...Vuex.mapState(['focalDate1', 'focalDate2', 'rawDataReady', 'rawDataStatus', 'rawSnakeyDataReady']),
		...Vuex.mapGetters(['timestamp', 'totalCount', 'errCount', 'filteredCount', 'filteredTypeCount']),
	},

	methods: {
		...Vuex.mapActions(['fetchRawData']),
	},
	created(){
		this.fetchRawData().then(() => {});
	},
	template:`<div class="container-fluid">
		<h5 class="text-primary text-center">Fishing Pool with Anchor1 <span class="text-danger"><< focalDate1|dAU >></span> and Anchor2 <span class="text-danger"><< focalDate2|dAU >></span></h5>

		<template v-if="rawDataReady">
			<p class="text-center text-muted font-italic m-0" v-if="rawDataReady"><small>Data from thankQ : << timestamp|dtAU >></small></p>
			<transition name="bounce">
				<p class="lead text-center" v-if="rawDataReady"><small><span class="text-info"><< filteredCount|number >> (<< filteredCount/totalCount|pct(2) >>)</small></span> / <span class="text-dark font-weight-bold"><< totalCount|number >></span> Contacts Exist in Database <small class="text-danger" v-if="errCount!==0">(<< errCount >> no creation date)</small></p>
			</transition>
		</template>

		<global-filters></global-filters>

		<p class="lead text-center"><small>Click on the card to track movement, re-click the same card to cancel tracking</small><p>

		<template v-if="rawDataReady">
			<anchor-summary :anchor="2"></anchor-summary>
			<anchor-summary :anchor="1"></anchor-summary>
		</template>
		<template v-else>
			<p class="text-center text-muted"><< rawDataStatus >></p>
		</template>

		<highchart-sankey></highchart-sankey>

	</div>`
});
