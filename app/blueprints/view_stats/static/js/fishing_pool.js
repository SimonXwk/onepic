// ##########################################################################################################################################################
// ##########################################################################################################################################################
const store = new Vuex.Store({
	state: {
		focalDate1: new Date(Date.UTC(new Date().getMonth()<6?new Date().getFullYear()-2:new Date().getFullYear()-1, 5, 30, 0 , 0 , 0 ,0)),
		focalDate2: new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0 , 0 , 0 ,0)),
		// Global filters
		fDecd: [-1, 0],
		fDNM: [-1, 0],
		fEstate: [-1, 0],
		fMajDon: [-1, 0],
		fAnon: [-1, 0],
		fHasEmail: [-1, 0],
		fDonType: ['Individual', 'Organisation'],
		fGender: ['Male', 'Female'],

	},
	mutations: {
		SET_FOCA_LDATE1: (state, payload) => state.focalDate1 = payload,
		SET_FOCAL_DATE2: (state, payload) => state.focalDate2 = payload,
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
		// fetchPayments(ctx, fy){
		// 	fy = fy ? fy : ctx.state.focalFY;
		// 	return new Promise((resolve, reject) => {
		// 		fetchJSON(endpoint('/api/tq/merch_activities' + '?fy=' + fy), (pmtJSON) => {
		// 			ctx.commit('SET_MERCHPAYMENTS', pmtJSON);
		// 			resolve()
		// 		});
		// 	});
		// },

	},
	getters: {
		filterRows:  (state, getters) => (rows) => {
			return rows.filter(r => state.fDecd.indexOf(r.FILTER_DECEASED) !== -1
				&& (state.fDNM.indexOf(r.FILTER_DONOTMAIL) !== -1 )
				&& (state.fEstate.indexOf(r.FILTER_DECEASED) !== -1 )
				&& (state.fMajDon.indexOf(r.FILTER_MAJDONOR) !== -1 )
				&& (state.fAnon.indexOf(r.FILTER_ANONYMOUS) !== -1 )
				&& (state.fHasEmail.indexOf(r.FILTER_EMAIL) !== -1 )
				&& (state.fDonType.indexOf(r.CONTACTTYPE) !== -1 )
				&& (state.fGender.indexOf(r.GENDER) !== -1 )

		)
		}
	}
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
Vue.component('type-prexist', {
	props: ['anchor'],
	data: function() {
		return {
			data: null
		}
	},
	computed: {
		...Vuex.mapGetters(['filterRows']),
		fiteredRows: function() {
			return this.filterRows(this.data.rows)
		}
	},
	created() {
		fetchJSON(endpoint('/api/tq/fishing_pool_prexit' + this.anchor), (json) => {
			this.data = json
		});
	},
	template: `<div v-if="data===null"><loader-ellipsis></loader-ellipsis></div>
	<div v-else>
	<< fiteredRows.length|number >>

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

	<hr class="my-2">

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

	<div class="card bg-light my-1 mx-0 px-1 py-0 d-inline-block" :class="{'border-secondary':fGender.length===0, 'border-success':fGender.length!==0}">
		<div class="fat-switch">
			<label class="label" for="fGender1" :class="{'on': fGender.indexOf('Male')!==-1, 'off': fGender.indexOf('Male')===-1}">Male</label>
			<label class="switch">
				<input type="checkbox" id="fGender1" value="Male" v-model="fGender">
				<span class="slider"></span>
			</label>
		</div>
		<div class="fat-switch">
			<label class="label" for="fGender2" :class="{'on': fGender.indexOf('Female')!==-1, 'off': fGender.indexOf('Female')===-1}">Female</label>
			<label class="switch">
				<input type="checkbox" id="fGender2" value="Female" v-model="fGender">
				<span class="slider"></span>
			</label>
		</div>
	</div>




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
		...Vuex.mapState(['focalDate1', 'focalDate2']),
		// ...Vuex.mapGetters([]),
	},

	methods: {
		// ...Vuex.mapActions(['fetchPayments', 'fetchBudget']),
		getData: function(){
		},
	},
	template:`<div class="container-fluid">
		<h5 class="text-primary text-center">Fishing Pool with Anchors @ <span class="text-danger"><< focalDate1|dAU >></span> and <span class="text-danger"><< focalDate2|dAU >></span></h5>
		<global-filters></global-filters>


		<type-prexist :anchor="2"></type-prexist>

	</div>`
});
