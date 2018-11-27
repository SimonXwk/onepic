// ##########################################################################################################################################################
// ##########################################################################################################################################################
const store = new Vuex.Store({
	state: {
		focalDate1: new Date(Date.UTC(new Date().getMonth()<6?new Date().getFullYear()-2:new Date().getFullYear()-1, 5, 30, 0 , 0 , 0 ,0)),
		focalDate2: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0 , 0 , 0 ,0)),
		rawData: null,
		rawDataReady: false,
		// Global filters
		fDecd: [-1, 0],
		fDNM: [-1, 0],
		fEstate: [-1, 0],
		fMajDon: [-1, 0],
		fAnon: [-1, 0],
		fHasEmail: [-1, 0],
		fGivingType: [-2, -1, 0],
		fDonType: ['Individual', 'Organisation'],
		fGender: ['Male', 'Female'],
	},
	mutations: {
		SET_FOCA_LDATE1: (state, payload) => state.focalDate1 = payload,
		SET_FOCAL_DATE2: (state, payload) => state.focalDate2 = payload,
		SET_RAWDATA:  (state, payload) => state.rawData = payload,
		SET_RAWDATA_READY_STATUS: (state, payload) => state.rawDataReady = payload,
		SET_FOCAL_DECD: (state, payload) => state.fDecd = payload,
		SET_FOCAL_DNM: (state, payload) => state.fDNM = payload,
		SET_FOCAL_ESTATE: (state, payload) => state.fEstate = payload,
		SET_FOCAL_MAJORDON: (state, payload) => state.fMajDon = payload,
		SET_FOCAL_ANONYMOUS: (state, payload) => state.fAnon = payload,
		SET_FOCAL_HASEMAIL: (state, payload) => state.fHasEmail = payload,
		SET_FOCAL_CONTACTTYPE: (state, payload) => state.fDonType = payload,
		SET_FOCAL_CGENDER: (state, payload) => state.fGender = payload,
	},
	actions: {
		fetchRawData(ctx, fy){
			fy = fy ? fy : ctx.state.focalFY;
			return new Promise((resolve, reject) => {
				fetchJSON(endpoint('/api/tq/fishing_pool'), (json) => {
					ctx.commit('SET_RAWDATA', json);
					ctx.commit('SET_RAWDATA_READY_STATUS', true);
					console.log('Raw data added to Vuex', json.rows.length)
					resolve()
				});
			});
		},
	},
	getters: {
		timestamp:  (state, getters) => !state.rawDataReady ? null : state.rawData.timestamp,
		totalCount: (state, getters) => !state.rawDataReady ? 0 : state.rawData.rows.length,
		errCount:  (state, getters) => !state.rawDataReady ? 0 : state.rawData.rows.filter(r => r.CONTACT_CREATED === null || r.CONTACT_CREATED.trim() === '').length,
		applyGolbalFilters:  (state, getters) => (r) => {
			return (state.fDecd.indexOf(r.FILTER_DECEASED) !== -1)
				&& (state.fDNM.indexOf(r.FILTER_DONOTMAIL) !== -1 )
				&& (state.fEstate.indexOf(r.FILTER_ESTATE) !== -1 )
				&& (state.fMajDon.indexOf(r.FILTER_MAJDONOR) !== -1 )
				&& (state.fAnon.indexOf(r.FILTER_ANONYMOUS) !== -1 )
				&& (state.fHasEmail.indexOf(r.FILTER_EMAIL) !== -1 )
				&& (state.fDonType.indexOf(r.CONTACTTYPE) !== -1 )
				// && (state.fGender.indexOf(r.GENDER) !== -1 )
		},
		filterRows:  (state, getters) => (rows) => {
			return rows.filter(r => state.applyGolbalFilters(r))
		},
		filteredRows: (state, getters) => {
			return !state.rawDataReady ? [] : state.rawData.rows.filter(r => getters.applyGolbalFilters(r))
		},
		filteredCount: (state, getters) => getters.filteredRows.length,
		filteredTypeCount: (state, getters) => (anchor, val) => getters.filteredRows.filter(r => (anchor === 1 ? r.FILTER_ANCHOR1_GIVER :  r.FILTER_ANCHOR2_GIVER) === val).length,

	}
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
Vue.component('anchor-summary', {
	props: ['anchor'],
	data: function() {
		return {
			data: null
		}
	},
	computed: {
		...Vuex.mapState(['rawDataReady']),
		...Vuex.mapGetters(['filteredRows', 'filteredTypeCount']),
	},
	template: `<div v-if="!rawDataReady" class="row justify-content-center"><loader-ellipsis></loader-ellipsis></div>
	<div v-else>

	<div class="card border-success mt-3">
		<div class="card-body">
			<h5 class="card-title text-center text-success">Anchor << anchor >>: Active</h5>
			<div class="row justify-content-center">
				<div class="col-xs-12 col-md-2 col">
					<card-counter theme="success" icon="&#127793;" :num="filteredTypeCount(anchor, -11)|number" msg="1ST NEW"></card-counter>
				</div>
				<div class="col-xs-12 col-md-2 col">
					<card-counter theme="success" icon="&#127807;" :num="filteredTypeCount(anchor, -121)|number" msg="2ND NEW"></card-counter>
				</div>
				<div class="col-xs-12 col-md-2 col">
					<card-counter theme="success" icon="&#127794;" :num="filteredTypeCount(anchor, -122)|number" msg="MULTI"></card-counter>
				</div>
				<div class="col-xs-12 col-md-2 col">
					<card-counter theme="success" icon="&#127796;" :num="filteredTypeCount(anchor, -123)|number" msg="2ND REC"></card-counter>
				</div>
				<div class="col-xs-12 col-md-2 col">
					<card-counter theme="success" icon="&#127811;" :num="filteredTypeCount(anchor, -13)|number" msg="1ST REC"></card-counter>
				</div>
			</div>
		</div>
	</div>

	<div class="card border-warning mt-1">
		<div class="card-body">
			<h5 class="card-title text-center text-warning">Anchor << anchor >>: Lapsed(months)</h5>
			<div class="row justify-content-center">
				<div class="col-xs-12 col-md-3 col">
					<card-counter theme="warning" icon="&#127806;" :num="filteredTypeCount(anchor, -21)|number" msg="LPSD1 [0, 12]"></card-counter>
				</div>
				<div class="col-xs-12 col-md-3 col">
					<card-counter theme="warning" icon="&#127810;" :num="filteredTypeCount(anchor, -22)|number" msg="LPSD2 (12, 24]"></card-counter>
				</div>
				<div class="col-xs-12 col-md-3 col">
					<card-counter theme="warning" icon="&#127809;" :num="filteredTypeCount(anchor, -23)|number" msg="LPSD3 (24, 60)"></card-counter>
				</div>
				<div class="col-xs-12 col-md-3 col">
					<card-counter theme="warning" icon="&#129344;" :num="filteredTypeCount(anchor, -24)|number" msg="LPSD4 [60, inf)"></card-counter>
				</div>
			</div>
		</div>
	</div>

	<div class="card border-primary mt-1">
		<div class="card-body">
			<h5 class="card-title text-center text-primary">Anchor << anchor >>: Never Given(months)</h5>
			<div class="row justify-content-center">
				<div class="col-xs-12 col-md-3 col">
					<card-counter theme="primary" icon="&#128167;" :num="filteredTypeCount(anchor, 21)|number" msg="NG1 [0, 12]"></card-counter>
				</div>
				<div class="col-xs-12 col-md-3 col">
					<card-counter theme="primary" icon="&#127754;" :num="filteredTypeCount(anchor, 22)|number" msg="NG2 (12, 24]"></card-counter>
				</div>
				<div class="col-xs-12 col-md-3 col">
					<card-counter theme="primary" icon="&#9732;" :num="filteredTypeCount(anchor, 23)|number" msg="NG3 (24, 60)"></card-counter>
				</div>
				<div class="col-xs-12 col-md-3 col">
					<card-counter theme="primary" icon="&#10052;" :num="filteredTypeCount(anchor, 24)|number" msg="NG4 [60, inf)"></card-counter>
				</div>
			</div>
		</div>
	</div>

	<div class="card border-dark mt-1">
		<div class="card-body">
			<h5 class="card-title text-center text-dark">Anchor << anchor >>: Not Exist</h5>
			<div class="row justify-content-center">
				<div class="col-xs-12 col-md-2 col">
					<card-counter theme="dark" icon="&#128528;" :num="filteredTypeCount(anchor, 0)|number" msg="Not Exist"></card-counter>
				</div>
			</div>
		</div>
	</div>

	<div>`
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
		fDonType: {
			get: function() {
				return this.$store.state.fDonType
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


	<div class="card bg-light my-1 mx-0 px-1 py-0 d-inline-block" :class="{'border-secondary':fDonType.length===0, 'border-success':fDonType.length!==0}">
		<div class="fat-switch">
			<label class="label" for="fDonType1" :class="{'on': fDonType.indexOf('Individual')!==-1, 'off': fDonType.indexOf('Individual')===-1}">IND</label>
			<label class="switch">
				<input type="checkbox" id="fDonType1" value="Individual" v-model="fDonType">
				<span class="slider"></span>
			</label>
		</div>
		<div class="fat-switch">
			<label class="label" for="fDonType2" :class="{'on': fDonType.indexOf('Organisation')!==-1, 'off': fDonType.indexOf('Organisation')===-1}">ORG</label>
			<label class="switch">
				<input type="checkbox" id="fDonType2" value="Organisation" v-model="fDonType">
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
		...Vuex.mapState(['focalDate1', 'focalDate2', 'rawDataReady']),
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
		<transition name="slide-fade">
			<p class="text-center text-muted font-italic m-0" v-if="rawDataReady"><small>Data from thankQ : << timestamp|dtAU >></small></p>
		</transition>
		<transition name="bounce">
			<p class="lead text-center" key=1 v-if="rawDataReady"><small><span class="text-info"><< filteredCount|number >> (<< filteredCount/totalCount|pct(2) >>)</small></span> / <span class="text-dark font-weight-bold"><< totalCount|number >></span> Contacts Exist in Database <small class="text-danger" v-if="errCount!==0">(<< errCount >> no creation date)</small></p>
			<p class="lead text-center" key=2 v-else>&#9201;  Reading Contacts & Preparing Views ... </p>
		</transition>
		<global-filters></global-filters>

		<anchor-summary :anchor="2"></anchor-summary>
		<anchor-summary :anchor="1"></anchor-summary>

	</div>`
});
