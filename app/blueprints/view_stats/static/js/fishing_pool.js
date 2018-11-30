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
		fStateCountry: [],
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
		SET_FOCAL_STATECOUNTRY: (state, payload) => state.fStateCountry = payload,

		SET_TRACKING_ANCHOR: (state, payload) => state.trackingAnchor = payload,
		SET_TRACKING_TYPE: (state, payload) => state.trackingType = payload,
		SET_TRACKING_SOFT: (state, payload) => state.trackingSoft = payload,
	},
	actions: {
		removeTracking(ctx) {
			ctx.commit('SET_TRACKING_ANCHOR',null);
			ctx.commit('SET_TRACKING_TYPE',null);
			ctx.commit('SET_TRACKING_SOFT',null);
		},
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
		states: (state, getters) => !state.rawDataReady ? [] : [...new Set(state.rawData.rows.map(r => r.STATECOUNTRY))],
		applyGolbalFilters:  (state, getters) => (r) => {
			return (state.fDecd.indexOf(r.FILTER_DECEASED) !== -1)
				&& (state.fDNM.indexOf(r.FILTER_DONOTMAIL) !== -1 )
				&& (state.fEstate.indexOf(r.FILTER_ESTATE) !== -1 )
				&& (state.fMajDon.indexOf(r.FILTER_MAJDONOR) !== -1 )
				&& (state.fAnon.indexOf(r.FILTER_ANONYMOUS) !== -1 )
				&& (state.fHasEmail.indexOf(r.FILTER_EMAIL) !== -1 )
				&& (state.fContactType.indexOf(r.FILTER_ORGANISATION) !== -1 )
				&& (state.fGender.indexOf(r.FILTER_GENDER) !== -1 )
				&& (state.fStateCountry.indexOf(r.STATECOUNTRY) !== -1 )

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
			// console.log(filters);
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
		linksHover: function(point, state) {
			if (point.isNode) {
				point.linksFrom.forEach((l) => l.setState(state));
			}
		}
	},
	watch: {
		rawSnakeyDataReady: function(newVal, oldVal) {
			if (newVal === true) {
				this.chart = Highcharts.chart({
					chart: { renderTo: this.$el },
					title: { text: null },
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
	template:`<div class="chart" style="height:800px;"><div class="row justify-content-center"><loader-ellipsis></loader-ellipsis></div></div>`
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
Vue.component('anchor-summary', {
	props: ['anchor'],
	computed: {
		...Vuex.mapState(['rawDataReady', 'trackingAnchor', 'trackingType', 'trackingSoft']),
		...Vuex.mapGetters(['count', 'trackingFilter', 'getTypeDim', 'getSoftDim']),
		cntExist: function() {
			return this.count() - this.count(this.filter(0))
		},
		cntNoGift: function() {
			return this.count(this.filter(210, null, {'FILTER_DECEASED': 0}))+this.count(this.filter(220, null, {'FILTER_DECEASED': 0}))+this.count(this.filter(230, null, {'FILTER_DECEASED': 0}))
		},
		cntActive: function() {
			return this.count(this.filter(-110, null, {'FILTER_DECEASED': 0}))+this.count(this.filter(-121, null, {'FILTER_DECEASED': 0}))+this.count(this.filter(-122, null, {'FILTER_DECEASED': 0}))+this.count(this.filter(-123, null, {'FILTER_DECEASED': 0}))+this.count(this.filter(-130, null, {'FILTER_DECEASED': 0}))
		},
		cntLapsed: function() {
			return this.count(this.filter(-210, null, {'FILTER_DECEASED': 0}))+this.count(this.filter(-220, null, {'FILTER_DECEASED': 0}))+this.count(this.filter(-230, null, {'FILTER_DECEASED': 0}))
		},
		cntLost: function() {
			return this.count(this.filter(-240, null, {'FILTER_DECEASED': 0}))+this.count(this.filter(240, null, {'FILTER_DECEASED': 0}))
		},
		cntDECD: function() {
			return this.count(this.filter(null, null, {'FILTER_DECEASED': -1}))- this.count(this.filter(0, null, {'FILTER_DECEASED': -1}))
		},
		cntPoolSize: function() {
			return this.cntNoGift + this.cntActive + this.cntLapsed
		},
	},
	methods: {
		...Vuex.mapActions(['removeTracking']),
		filter: function(type, soft, other) {
			let f = {};
			if (type!==undefined && type!==null) {
				f[this.getTypeDim(this.anchor)] = type;
			}
			if (soft!==undefined && soft!==null) {
				f[this.getSoftDim(this.anchor)] = soft;
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
			// console.log("before: ", type, soft, this.trackingFilter);
			if (this.isTrackingTarget(type, soft)) {
				this.removeTracking()
			}else {
				this.$store.commit('SET_TRACKING_ANCHOR',this.anchor);
				this.$store.commit('SET_TRACKING_TYPE',type===undefined?null:type);
				this.$store.commit('SET_TRACKING_SOFT',soft===undefined?null:soft);
			}
			// console.log("after: ", type, soft, this.trackingFilter);
		},

	},
	template: `
	<div class="card shadow-sm mt-3">
		<div class="card-body">
			<h4 class="card-title text-center">
				<mark class="text-muted">&#127907; Fishing Pool using Anchor << anchor >> :
					<span class="text-primary font-weight-bold" v-if="anchor === 2">
						<< cntPoolSize|number >> (<< cntPoolSize/cntExist|pct(2) >>)
						&#127907;
					</span>
					<span v-else>&#9875;</span>
				</mark>
			</h4>

			<div class="row my-3 justify-content-center" v-if="anchor === 2">
				<div class="col-xs-12 col-sm-6 col-md-4">
					<card-counter theme="merch" icon="&#128150;" :num="cntExist|number" msg="Exist (contact or payment)"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-4">
					<card-counter theme="info" icon="&#128033;" :num="cntNoGift|number" :msg="'🎣 No Gift ' + ((cntNoGift/cntExist)*100).toFixed(2) + '%'"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-4">
					<card-counter theme="success" icon="&#128032;" :num="cntActive|number" :msg="'🎣 Active ' + ((cntActive/cntExist)*100).toFixed(2) + '%'""></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-4">
					<card-counter theme="monitor" icon="&#128031;" :num="cntLapsed|number" :msg="'🎣 Lapsed ' + ((cntLapsed/cntExist)*100).toFixed(2) + '%'""></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-4">
					<card-counter theme="warning" icon="&#129416;" :num="cntLost|number" :msg="'Lost ' + ((cntLost/cntExist)*100).toFixed(2) + '%'""></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-4">
					<card-counter theme="dark" icon="&#9904;" :num="cntDECD|number" :msg="'Deceased ' + ((cntDECD/cntExist)*100).toFixed(2) + '%'""></card-counter>
				</div>
			</div>

			<h5 class="text-center text-success">Active</h5>
			<div class="row mb-1 justify-content-center">
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-2" v-on:click="setTracking(-110)">
					<card-counter theme="success" icon="&#127793;" :num="count(filter(-110))|number" msg="🎣 1ST NEW" :class="{'bg-danger': isTrackingTarget(-110)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-2" v-on:click="setTracking(-121)">
					<card-counter theme="success" icon="&#127807;" :num="count(filter(-121))|number" msg="🎣 2ND NEW" :class="{'bg-danger': isTrackingTarget(-121)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-2" v-on:click="setTracking(-122)">
					<card-counter theme="success" icon="&#127794;" :num="count(filter(-122))|number" msg="🎣 MULTI" :class="{'bg-danger': isTrackingTarget(-122)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-2" v-on:click="setTracking(-123)">
					<card-counter theme="success" icon="&#127796;" :num="count(filter(-123))|number" msg="🎣 2ND REC" :class="{'bg-danger': isTrackingTarget(-123)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-2" v-on:click="setTracking(-130)">
					<card-counter theme="success" icon="&#127811;" :num="count(filter(-130))|number" msg="🎣 1ST REC" :class="{'bg-danger': isTrackingTarget(-130)}" style="cursor: pointer;"></card-counter>
				</div>
			</div>

			<h5 class="text-center text-warning">Lapsed (months)</h5>
			<div class="row mb-1 justify-content-center">
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-210)">
					<card-counter theme="warning" icon="&#127806;" :num="count(filter(-210))|number" msg="🎣 LPSD1 [0, 12]" :class="{'bg-danger': isTrackingTarget(-210)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-220)">
					<card-counter theme="warning" icon="&#127810;" :num="count(filter(-220))|number" msg="🎣 LPSD2 (12, 24]" :class="{'bg-danger': isTrackingTarget(-220)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-230)">
					<card-counter theme="warning" icon="&#127809;" :num="count(filter(-230))|number" msg="🎣 LPSD3 (24, 60)" :class="{'bg-danger': isTrackingTarget(-230)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-240)">
					<card-counter theme="warning" icon="&#129344;" :num="count(filter(-240))|number" msg="LPSD4 [60, inf)" :class="{'bg-danger': isTrackingTarget(-240)}" style="cursor: pointer;"></card-counter>
				</div>
			</div>

			<div class="row mb-1 justify-content-center">
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-210, -1)">
					<card-counter theme="monitor" icon="&#127806;" :num="count(filter(-210, -1))|number" msg="🎣 Soft [0, 12]" :class="{'bg-danger': isTrackingTarget(-210, -1)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-220, -1)">
					<card-counter theme="monitor" icon="&#127810;" :num="count(filter(-220, -1))|number" msg="🎣 Soft (12, 24]" :class="{'bg-danger': isTrackingTarget(-220, -1)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-230, -1)">
					<card-counter theme="monitor" icon="&#127809;" :num="count(filter(-230, -1))|number" msg="🎣 Soft (24, 60)" :class="{'bg-danger': isTrackingTarget(-230, -1)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-240, -1)">
					<card-counter theme="monitor" icon="&#129344;" :num="count(filter(-240, -1))|number" msg="Soft [60, inf)" :class="{'bg-danger': isTrackingTarget(-240, -1)}" style="cursor: pointer;"></card-counter>
				</div>
			</div>

			<div class="row mb-1 justify-content-center">
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-210, 0)">
					<card-counter theme="monitor" icon="&#127806;" :num="count(filter(-210, 0))|number" msg="🎣 Hard [0, 12]" :class="{'bg-danger': isTrackingTarget(-210, 0)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-220, 0)">
					<card-counter theme="monitor" icon="&#127810;" :num="count(filter(-220, 0))|number" msg="🎣 Hard (12, 24]" :class="{'bg-danger': isTrackingTarget(-220, 0)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-230, 0)">
					<card-counter theme="monitor" icon="&#127809;" :num="count(filter(-230, 0))|number" msg="🎣 Hard (24, 60)" :class="{'bg-danger': isTrackingTarget(-230, 0)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(-240, 0)">
					<card-counter theme="monitor" icon="&#129344;" :num="count(filter(-240, 0))|number" msg="Hard [60, inf)" :class="{'bg-danger': isTrackingTarget(-240, 0)}" style="cursor: pointer;"></card-counter>
				</div>
			</div>

			<hr class="my-3 shadow-sm" />

			<h5 class="text-center text-primary">Never Given (months)</h5>
			<div class="row mb-1 justify-content-center">
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(210)">
					<card-counter theme="primary" icon="&#9732;" :num="count(filter(210))|number" msg="🎣 NG1 [0, 12)" :class="{'bg-danger': isTrackingTarget(210)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(220)">
					<card-counter theme="primary" icon="&#128167;" :num="count(filter(220))|number" msg="🎣 NG2 [12, 24)" :class="{'bg-danger': isTrackingTarget(220)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(230)">
					<card-counter theme="primary" icon="&#127754;" :num="count(filter(230))|number" msg="🎣 NG3 [24, 60)" :class="{'bg-danger': isTrackingTarget(230)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(240)">
					<card-counter theme="primary" icon="&#10052;" :num="count(filter(240))|number" msg="NG4 [60, inf)" :class="{'bg-danger': isTrackingTarget(240)}" style="cursor: pointer;"></card-counter>
				</div>
			</div>

			<div class="row mb-1 justify-content-center">
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(210, -1)">
					<card-counter theme="info" icon="&#9732;" :num="count(filter(210, -1))|number" msg="🎣 Soft [0, 12)" :class="{'bg-danger': isTrackingTarget(210, -1)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(220, -1)">
					<card-counter theme="info" icon="&#128167;" :num="count(filter(220, -1))|number" msg="🎣 Soft [12, 24)" :class="{'bg-danger': isTrackingTarget(220, -1)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(230, -1)">
					<card-counter theme="info" icon="&#127754;" :num="count(filter(230, -1))|number" msg="🎣 Soft [24, 60)" :class="{'bg-danger': isTrackingTarget(230, -1)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(240, -1)">
					<card-counter theme="info" icon="&#10052;" :num="count(filter(240, -1))|number" msg="Soft [60, inf)" :class="{'bg-danger': isTrackingTarget(240, -1)}" style="cursor: pointer;"></card-counter>
				</div>
			</div>

			<div class="row mb-1 justify-content-center">
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(210, 0)">
					<card-counter theme="info" icon="&#9732;" :num="count(filter(210, 0))|number" msg="🎣 Hard [0, 12)" :class="{'bg-danger': isTrackingTarget(210, 0)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(220, 0)">
					<card-counter theme="info" icon="&#128167;" :num="count(filter(220, 0))|number" msg="🎣 Hard [12, 24)" :class="{'bg-danger': isTrackingTarget(220, 0)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(230, 0)">
					<card-counter theme="info" icon="&#127754;" :num="count(filter(230, 0))|number" msg="🎣 Hard [24, 60)" :class="{'bg-danger': isTrackingTarget(230, 0)}" style="cursor: pointer;"></card-counter>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" v-on:click="setTracking(240, 0)">
					<card-counter theme="info" icon="&#10052;" :num="count(filter(240, 0))|number" msg="Hard [60, inf)" :class="{'bg-danger': isTrackingTarget(240, 0)}" style="cursor: pointer;"></card-counter>
				</div>
			</div>


			<h5 class="text-center text-dark">Not Exist (Prospect Created in Future)</h5>
			<div class="row mb-1 justify-content-center">
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
		...Vuex.mapGetters(['states']),
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
		fStateCountry: {
			get: function() {
				return this.$store.state.fStateCountry
			},
			set: function(newVal) {
				this.$store.commit('SET_FOCAL_STATECOUNTRY',newVal);
			}
		},
	},
	template: `<div class="container-fluid"><div class="row justify-content-center" ><div class="col">
	<div class="card bg-light my-1 mx-0 px-1 py-0 d-inline-block" :class="{'border-secondary':fContactType.length===0, 'border-success':fContactType.length!==0}">
		<div class="fat-switch" v-for="(val, key, idx) in {'ORG': -1 , 'IND': 0}">
			<label class="label" :for="'fContactType'+idx" :class="{'on': fContactType.indexOf(val)!==-1, 'off': fContactType.indexOf(-1)===-1}"><< key >></label>
			<label class="switch">
				<input type="checkbox" :id="'fContactType'+idx" v-bind:value="val" v-model="fContactType">
				<span class="slider"></span>
			</label>
		</div>
	</div>

	<div class="card bg-light my-1 mx-0 px-1 py-0 d-inline-block" :class="{'border-secondary':fDecd.length===0, 'border-success':fDecd.length!==0}">
		<div class="fat-switch" v-for="(val, key, idx) in {'DECD': -1 , 'ALIVE': 0}">
			<label class="label" :for="'fDecd'+idx" :class="{'on': fDecd.indexOf(val)!==-1, 'off': fDecd.indexOf(-1)===-1}"><< key >></label>
			<label class="switch">
				<input type="checkbox" :id="'fDecd'+idx" v-bind:value="val" v-model="fDecd">
				<span class="slider"></span>
			</label>
		</div>
	</div>

	<div class="card bg-light my-1 mx-0 px-1 py-0 d-inline-block" :class="{'border-secondary':fEstate.length===0, 'border-success':fEstate.length!==0}">
		<div class="fat-switch" v-for="(val, key, idx) in {'EATATE': -1 , '!ESTATE': 0}">
			<label class="label" :for="'fEstate'+idx" :class="{'on': fEstate.indexOf(val)!==-1, 'off': fEstate.indexOf(-1)===-1}"><< key >></label>
			<label class="switch">
				<input type="checkbox" :id="'fEstate'+idx" v-bind:value="val" v-model="fEstate">
				<span class="slider"></span>
			</label>
		</div>
	</div>



	<div class="card bg-light my-1 mx-0 px-1 py-0 d-inline-block" :class="{'border-secondary':fDNM.length===0, 'border-success':fDNM.length!==0}">
		<div class="fat-switch" v-for="(val, key, idx) in {'DNM': -1 , 'MAILABLE': 0}">
			<label class="label" :for="'fDNM'+idx" :class="{'on': fDNM.indexOf(val)!==-1, 'off': fDNM.indexOf(-1)===-1}"><< key >></label>
			<label class="switch">
				<input type="checkbox" :id="'fDNM'+idx" v-bind:value="val" v-model="fDNM">
				<span class="slider"></span>
			</label>
		</div>
	</div>

	<div class="card bg-light my-1 mx-0 px-1 py-0 d-inline-block" :class="{'border-secondary':fAnon.length===0, 'border-success':fAnon.length!==0}">
		<div class="fat-switch" v-for="(val, key, idx) in {'ANON': -1 , 'KNOWN': 0}">
			<label class="label" :for="'fAnon'+idx" :class="{'on': fAnon.indexOf(val)!==-1, 'off': fAnon.indexOf(-1)===-1}"><< key >></label>
			<label class="switch">
				<input type="checkbox" :id="'fAnon'+idx" v-bind:value="val" v-model="fAnon">
				<span class="slider"></span>
			</label>
		</div>
	</div>

	<div class="card bg-light my-1 mx-0 px-1 py-0 d-inline-block" :class="{'border-secondary':fHasEmail.length===0, 'border-success':fHasEmail.length!==0}">
		<div class="fat-switch" v-for="(val, key, idx) in {'EMAIL': -1 , 'NO EMAIL': 0}">
			<label class="label" :for="'fHasEmail'+idx" :class="{'on': fHasEmail.indexOf(val)!==-1, 'off': fHasEmail.indexOf(-1)===-1}"><< key >></label>
			<label class="switch">
				<input type="checkbox" :id="'fHasEmail'+idx" v-bind:value="val" v-model="fHasEmail">
				<span class="slider"></span>
			</label>
		</div>
	</div>

	<div class="card bg-light my-1 mx-0 px-1 py-0 d-inline-block" :class="{'border-secondary':fMajDon.length===0, 'border-success':fMajDon.length!==0}">
		<div class="fat-switch" v-for="(val, key, idx) in {'MAJDON': -1 , '!MAJDON': 0}">
			<label class="label" :for="'fMajDon'+idx" :class="{'on': fMajDon.indexOf(val)!==-1, 'off': fMajDon.indexOf(-1)===-1}"><< key >></label>
			<label class="switch">
				<input type="checkbox" :id="'fMajDon'+idx" v-bind:value="val" v-model="fMajDon">
				<span class="slider"></span>
			</label>
		</div>
	</div>

	<div class="card bg-light my-1 mx-0 px-1 py-0 d-inline-block" :class="{'border-secondary':fGender.length===0, 'border-success':fGender.length!==0}">
		<div class="fat-switch" v-for="(val, key, idx) in {'MALE': -1 , 'FEMALE': -2, 'MIS': 0, 'N/A': 1}">
			<label class="label" :for="'fGender'+idx" :class="{'on': fGender.indexOf(val)!==-1, 'off': fGender.indexOf(-1)===-1}"><< key >></label>
			<label class="switch">
				<input type="checkbox" :id="'fGender'+idx" v-bind:value="val" v-model="fGender">
				<span class="slider"></span>
			</label>
		</div>
	</div>

	<div class="card bg-light my-1 mx-0 px-1 py-0 d-inline-block" :class="{'border-secondary':fStateCountry.length===0, 'border-success':fStateCountry.length!==0}" v-if="states.length!==0">
		<div class="fat-switch" v-for="(val, idx) in states">
			<label class="label" :for="'fStateCountry'+idx" :class="{'on': fStateCountry.indexOf(val)!==-1, 'off': fStateCountry.indexOf(-1)===-1}"><< val >></label>
			<label class="switch">
				<input type="checkbox" :id="'fStateCountry'+idx" v-bind:value="val" v-model="fStateCountry">
				<span class="slider"></span>
			</label>
		</div>
	</div>

	</div></div></div>`
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
let rootVue = new Vue({
	el: '#root',
	data: {
	},
	store,
	computed: {
		...Vuex.mapState(['focalDate1', 'focalDate2', 'rawDataReady', 'rawDataStatus', 'rawSnakeyDataReady', 'trackingAnchor', 'trackingType', 'trackingSoft']),
		...Vuex.mapGetters(['timestamp', 'totalCount', 'errCount', 'filteredCount', 'states' ]),
	},

	methods: {
		...Vuex.mapActions(['fetchRawData', 'removeTracking']),
	},
	created(){
		this.fetchRawData().then(() => {
			this.$store.commit('SET_FOCAL_STATECOUNTRY', this.states);
		});
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

		<p class="lead text-center text-secondary" v-if="trackingAnchor==null && trackingType==null && trackingSoft==null"><small>Click on the card to track movement, re-click the same card to cancel tracking</small></p>
		<p class="lead text-center text-danger bg-light mt-2" v-else><button type="button" class="btn btn-warning align-middle" @click="removeTracking">Tracking Mode (anchor<< trackingAnchor >>) , Click to Exit</button></p>

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
