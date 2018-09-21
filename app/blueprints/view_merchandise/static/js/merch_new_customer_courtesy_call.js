// ******************************************************************************
let vueRow = Vue.component('vue-row', {
	props: ['row', 'ask'],
	data: function(){
		return {
			fetch1: '/api/ssi/orders/search/',
			fetch2: '/api/ssi/track/',
			fetch3: '/api/ssi/order/',
			linkTrack: '/merchandise/track_order/',
			linkAusPost: 'https://auspost.com.au/mypost/track/#/details/',
			trackingNumber: null,
			called1: false,
			orders: 0,
			called2: false,
			status: null,
			statusDate: null,
			statusDetail: null,
			toggleColor: false,
			show: false
		}
	},
	computed: {
		trClassObject: function(){
			return {
				'table-success': this.toggleColor
			}
		},
		statusTextClassObject: function(){
			return {
				'text-success': this.showType === 'success',
				'text-info': this.showType === 'waiting',
				'text-danger': this.showType === 'missing',
			}
		},
		ausLink: function(){
			return this.linkAusPost + this.trackingNumber
		},
		hasOrderNumber: function(){
			return this.row['FIRSTORDER'] !== null
		},
		isDonor: function(){
			return (this.row['FIRSTDATE_MERCHANDISE_TOTAL'] - this.row['FIRSTDATE_MERCHANDISE_DONATION'] - this.row['FIRSTDATE_MERCHANDISE_GOL']) === 0
		},
		isDelivered:function(){
			return this.status !== null && this.status.toUpperCase().indexOf('DELIVERED') !== -1
		},
		show: {
			get: function () {
				return this.isDonor || !this.ask || this.isDelivered;
			},
			set: function (newVal) {
				return newVal
			}
		},
		showType: function(){
			if ( this.isDonor || !this.ask || (this.ask && this.isDelivered)){
				return 'success'
			}else {
				if( this.trackingNumber === null || !this.hasOrderNumber ) {
					return 'missing'
				}else{
					return 'waiting'
				}
			}
		},
		resultDisplay : function () {
			if(this.isDonor) {
				return '💗' + ' ' + 'Pure Donation/GOL'
			}else if (!this.ask){
				return '👌' + ' ' + 'No Further Checking Needed'
			}else if ( !this.hasOrderNumber ) {
				return '❌' + ' Order Number Not In ThankQ '
			}else if ( this.called1 === false ) {
				return '☕' + ' searching(1) ... '
			}else if ( this.trackingNumber === null ) {
				return '😭' + ' No Response From Starshipit'
			}else if ( this.called2 === false ) {
				return '☕' + ' searching(2) ... '
			}else if ( this.status !== null && this.status.toUpperCase().indexOf('DELIVERED') !== -1 ) {
				return '✔️' + ' ['+ this.orders + '] ' + this.status + ' ➠ ' + new Date(this.statusDate).toLocaleDateString("en-AU", { year: 'numeric', month: 'long', day: 'numeric' , hour:'numeric', minute:'numeric' }) + ''
			}else {
				return '❌' + ' ['+ this.orders + '] ' + this.status
			}
		}
	},

	created(){
		// Toggle Buttons
		this.$eventBus.$on('toggleSuccessResults', (data) => this.toggleSuccessResults(data));
		this.$eventBus.$on('toggleWaitingResults', (data) => this.toggleWaitingResults(data));
		this.$eventBus.$on('toggleMissingResults', (data) => this.toggleMissingResults(data));

		let vCol = this;
		if (this.ask && !this.isDonor && this.hasOrderNumber && !this.isDelivered) {
			fetchJSON(endpoint(vCol.fetch1 + vCol.row['FIRSTORDER']), function (json1) {
				vCol.called1 = true;
				let orders = json1.orders;
				if (orders.length > 0) {
					vCol.orders = orders.length;
					vCol.trackingNumber = orders[0]['tracking_number'];
					orders.forEach(order => {
						fetchJSON(endpoint(vCol.fetch2 + vCol.trackingNumber), function (json2) {
							vCol.called2 = true;
							if (json2.success === true ) {
								let events = json2['results']['tracking_events'];

								if( !events ){
									vCol.status = json2['results']['tracking_status'];
									vCol.statusDate = json2['results']['last_updated_date'];
									vCol.statusDetail = json2['results']['order_status'];
								} else {
									let lastEvent = events[events.length - 1];
									vCol.status = lastEvent['status'];
									vCol.statusDate = lastEvent['event_datetime'];
									vCol.statusDetail = lastEvent['details'];
								}
								vCol.show = vCol.isDelivered;
								vCol.$eventBus.$emit('processedCustomer', vCol.row['SERIALNUMBER'], vCol.showType);
							} else {
								vCol.$eventBus.$emit('processedCustomer', vCol.row['SERIALNUMBER'], vCol.showType);
							}
						}, true);
					});
				} else {
					vCol.$eventBus.$emit('processedCustomer', vCol.row['SERIALNUMBER'], vCol.showType);
				}
			}, true);
		} else {
			vCol.show = this.isDonor || !this.ask;
			vCol.$eventBus.$emit('processedCustomer', vCol.row['SERIALNUMBER'], vCol.showType);
		}

	},
	methods:{
		toggleSuccessResults: function (data) {
			if ( this.showType === 'success' ){
				this.show = data;
			}
		},
		toggleWaitingResults: function (data) {
			if ( this.showType === 'waiting' ){
				this.show = data;
			}
		},
		toggleMissingResults: function (data) {
			if ( this.showType === 'missing' ){
				this.show = data;
			}
		}
	},
	template:`

	<tr v-if="show" v-on:dblclick="toggleColor=!toggleColor" v-bind:class="trClassObject" >

		<td scope="row" style="width: 30%">
			<strong><< row.FULLNAME >></strong> <small class="text-primary" v-if="row.SORTKEYREF1">(is << row.SORTKEYREFREL2 >>)</small>
			<hr class="my-1">
			<small class="text-secondary"><< row.SERIALNUMBER >><span class="text-danger" v-if=" row.CONTACTTYPE === 'Organisation' ">, ORG</span>, << row.PRIMARYCATEGORY >>, <span class="text-success"> from << row.SOURCE >></span></small>
			<small class="text-danger" v-if="row.DECD === -1">, Deceased</small>
			<small class="text-danger" v-if="row.ESTATE === -1">, Estate</small>
			<small class="text-danger" v-if="row.PLEDGES > 0">, [<< row.PLEDGES >>SP] << row.FIRST_PLEDGEID >></small>
		</td>

		<td style="width: 35%">
			 <span class="text-muted"><< row.FIRSTORDER >><small> payment: << row.FIRSTDATE|dAY >></small> <a target="blank" class="text-muted" v-bind:href="linkTrack + row.FIRSTORDER"> &#128230;<small>starshipit</small></a></span>
			 <hr class="my-1">
			 <span v-bind:class="statusTextClassObject"><< resultDisplay >></span>
			 <span v-if="statusDetail!==status" calss="text-danger"><small>, << statusDetail >></small></span>
			 <a v-if="isDelivered" target="blank" class="text-secondary" v-bind:href="ausLink"> &#128238; <small>AusPost</small></a>
		</td>

		<td style="width: 15%">
			<span v-if="row.DONOTCALL == -1 || row.DONOTMAIL == -1">
				<span v-if="row.DONOTCALL == -1" class="text-danger">&#128263;  Do not Call </span>
				<span v-if="row.DONOTMAIL == -1" class="text-danger">&#128075;  Do not Mail </span>
				<br>
			</span>

			<span v-if="(row.DONOTCALL != -1 && row.MOBILENUMBER !== null && row.MOBILENUMBER.trim() !== '')" class="text-info">
				<small>&#128241;</small> Mobile : << row.MOBILENUMBER >><br>
			</span>

			<span v-if="(row.DONOTCALL != -1 && row.DAYTELEPHONE !== null && row.DAYTELEPHONE.trim() !== '')" class="text-info">
				<small>&#128222;</small> Day : << row.DAYTELEPHONE >><br>
			</span>

			<span v-if="(row.DONOTCALL != -1 && row.EVENINGTELEPHONE !== null && row.EVENINGTELEPHONE.trim() !== '')" class="text-info">
				<small>&#128222;</small> Evening : << row.EVENINGTELEPHONE >>
			</span>

			<span v-if="(row.DONOTCALL != -1 && row.FAXNUMBER !== null && row.FAXNUMBER.trim() !== '')" class="text-info">
				<small>&#128224;</small> Fax : << row.FAXNUMBER >><br>
			</span>

			<span class="text-muted"
				v-if=" (row.EMAILADDRESS !== null && row.EMAILADDRESS.trim() !== '')
					&& ((
					row.DONOTCALL != -1
					&& !(row.MOBILENUMBER !== null && row.MOBILENUMBER.trim() !== '')
					&& !(row.DAYTELEPHONE !== null && row.DAYTELEPHONE.trim() !== '')
					&& !(row.EVENINGTELEPHONE !== null && row.EVENINGTELEPHONE.trim() !== '')
					&& !(row.FAXNUMBER !== null && row.FAXNUMBER.trim() !== '')
					) || (row.DONOTCALL == -1) )
				">
				&#128231; << row.EMAILADDRESS >><br>
			</span>

			<span class="text-muted"
				v-if="!(row.MOBILENUMBER !== null && row.MOBILENUMBER.trim() !== '')
				&& !(row.DAYTELEPHONE !== null && row.DAYTELEPHONE.trim() !== '')
				&& !(row.EVENINGTELEPHONE !== null && row.EVENINGTELEPHONE.trim() !== '')
				&& !(row.FAXNUMBER !== null && row.FAXNUMBER.trim() !== '')
			 	&& !(row.EMAILADDRESS !== null && row.EMAILADDRESS.trim() !== '')
				">
				<em ><s>Phone & Email Not Found</s></em>
			</span>

		</td>

		<td style="width: 20%" class="text-left">
			<span v-if=" row.BOARDEDBY !== null ">
				<mark>&#9924; << row.BOARDEDBY >></mark>
				<span class="text-success" v-if=" row.BOARDEDCANCALLED === 0 ">
					<small> created <span class="badge badge-success">Merch Onboarding Profile</span></small>
				</span>
				<span class="text-secondary" v-else-if="row.BOARDEDCANCALLED === -1 ">
					<small> cancelled <span class="badge badge-secondary">Merch Onboarding Profile</span></small>
				</span>
				<br>
			</span>
			<span v-if=" row.COURTESYCALL1_BY !== null ">
				<mark>&#9924; << row.COURTESYCALL1_BY >></mark><span class="text-success"><small> made <span class="badge badge-success">Courtesy Call 1</span></small></span>
				<br>
			</span>
		</td>

	</tr>

	`,
});

// ******************************************************************************
let vueTable = Vue.component('vue-table', {
	props: {
		'rows': {
		},
		'theme': {
			type: String
		},
		'ask' : {
			type: Boolean
		}
	},
	data: function() {
		return {
		}
	},
	computed:{
		trClassObject: function(){
			return {
				'table-primary': this.theme === 'primary',
				'table-secondary': this.theme === 'secondary',
				'table-success': this.theme === 'success',
				'table-danger': this.theme === 'danger',
				'table-warning': this.theme === 'warning',
				'table-info': this.theme === 'info',
				'table-light': this.theme === 'light',
				'table-dark': this.theme === 'dark'
			}
		},
	},
	components:{
		'result-row': vueRow
	},
	template: `
	<div class="table-responsive-lg">
		<table class="table table-sm table-hover table-bordered table-striped"" >
			<thead>
				<tr class="table-bordered " v-bind:class="trClassObject">
					 <th scope="col" style="width: 30%">CUSTOMER NAME</th>
					 <th scope="col" style="width: 35%">CALL ACTION</th>
					 <th scope="col" style="width: 15%">CONTACT METHOD</th>
					 <th scope="col" style="width: 20%">ON-BOARD PROFILE</th>
				</tr>
			</thead>
			<tbody>
				<result-row v-for="row in rows" v-bind:row="row" v-bind:ask="ask"></result-row>
			</tbody>
		</table>
 	</div>
	`
});
// ******************************************************************************
let rootVue = new Vue({
	el: '#vue',
	data: {
		raw: {
			rows: null,
			ready: false,
			timestamp: null,
			processed:0
		},
		customers: {},
		defaultAPI: '/api/merch/new_customers',
		fy:null,
		showFYSelection: false,
		showSuccess: true,
		showWaiting: false,
		showMissing: false,
	},

	watch:{
		showSuccess: function(val){
			this.$eventBus.$emit('toggleSuccessResults', val);
		 	Object.keys(this.customers).filter(sn => this.customers[sn].displayType === 'success' ).forEach(sn => this.customers[sn].show = val);
		},
		showWaiting: function(val){
			this.$eventBus.$emit('toggleWaitingResults', val);
			Object.keys(this.customers).filter(sn => this.customers[sn].displayType === 'waiting' ).forEach(sn => this.customers[sn].show = val);
		},
		showMissing: function(val){
			this.$eventBus.$emit('toggleMissingResults', val);
			Object.keys(this.customers).filter(sn => this.customers[sn].displayType === 'missing' ).forEach(sn => this.customers[sn].show = val);
		},
		fy: function(){
			this.raw = {
				rows: null,
				ready: false,
				timestamp: null,
				processed:0
			};
			this.customers = {};
			this.getData();
		},
	},
	computed: {
		dataAPI: function() {
			if (this.fy === null || this.fy === undefined){
				return this.defaultAPI
			} else {
				if( String(this.fy).length === 4  ){
					return this.defaultAPI + '?fy=' + this.fy
				}else{
					return this.defaultAPI
				}
			}
		},
		fys: function(){
			let fys = [];
			let nextYear = (new Date()).getFullYear() + 1;
			for(let i=0; i<6; i++){
				fys.push(nextYear-i)
			}
			return fys
		},
		progress: function(){
			if ( this.raw.rows === null || this.raw.rows.length === 0 ) {
				return 0
			} else if ( this.raw.processed === this.raw.rows.length ) {
				return 100
	    } else {
				return ((this.raw.processed / this.raw.rows.length)*100).toFixed(1)
			}
		},
		progressClassObj: function () {
			return {
				'bg-danger': this.progress >= 0 && this.progress <20 ,
				'bg-warning': this.progress >= 20 && this.progress <50 ,
				'bg-info': this.progress >= 50 && this.progress < 90 ,
				'bg-success': this.progress >= 90
			}
		},
		includeRows: function () {
			return this.raw.rows.filter(row => this.calcSubListType(row) === 'todo' )
		},
		skippedRows: function () {
			return this.raw.rows.filter(row => this.calcSubListType(row) === 'skip' )
		},
		finishedRows: function () {
			return this.raw.rows.filter(row => this.calcSubListType(row) === 'finished' )
		},
		excludeRows: function () {
			return this.raw.rows.filter(row => this.calcSubListType(row) === 'exlcude' )
		},
		includeRowsShowCount: function () {
			return Object.keys(this.customers).filter(sn => this.customers[sn].show === true && this.customers[sn].sublist === 'todo' ).length;
		},
		skippedRowsShowCount: function () {
			return Object.keys(this.customers).filter(sn => this.customers[sn].show === true && this.customers[sn].sublist === 'skip' ).length;
		},
		finishedRowsShowCount: function () {
			return Object.keys(this.customers).filter(sn => this.customers[sn].show === true && this.customers[sn].sublist === 'finished' ).length;
		},
		excludeRowsShowCount: function () {
			return Object.keys(this.customers).filter(sn => this.customers[sn].show === true && this.customers[sn].sublist === 'exlcude' ).length;
		},
	},
	created(){
		this.$eventBus.$on('processedCustomer', (sn, type) => {
			this.raw.processed += 1;
			// console.log(this.raw.rows.filter(row => row['SERIALNUMBER']  === sn )[0]['SERIALNUMBER']);
			if (type === 'success'){
				this.customers[sn].processed = true;
				this.customers[sn].displayType = type;
				this.customers[sn].show = this.showSuccess;
			}else if (type === 'waiting') {
				this.customers[sn].processed = true;
				this.customers[sn].displayType = type;
				this.customers[sn].show = this.showWaiting;
			}else if (type === 'missing'){
				this.customers[sn].processed = true;
				this.customers[sn].displayType = type;
				this.customers[sn].show = this.showMissing;
			}
		});
		this.getData();
	},
	methods:{
		calcSubListType: function(row){
			if (  (row['CONTACTTYPE'] === 'Organisation')
					|| (row['FIRSTDATE_MERCHANDISE_PLEDGE'] !== 0)
					|| (row['DECD'] === -1)
					|| (row['PRIMARYCATEGORY'] === 'ESTATE')
				) {
				return 'exlcude'
			}else {
				if ( !((row['COURTESYCALL1_BY'] === null ) || (row['COURTESYCALL1_BY'].trim() === '' )) ) {
				  return 'finished'
				}else {
					if ( new Date(row['FIRSTDATE']) <= new Date(2018, 8, 5) ) {
						return 'skip' // 2019 September the 5th midnight
					}else {
						return 'todo'
					}
				}
			}
		},
		getData: function(){
			fetchJSON(endpoint(this.dataAPI), function(json){
				rootVue.raw.rows = json.rows;
				rootVue.raw.ready = true;
				rootVue.raw.timestamp = new Date(json.timestamp)
				rootVue.customers = json.rows
				.map(row => { return {SERIALNUMBER: row.SERIALNUMBER, SUBLIST: rootVue.calcSubListType(row)}; } )
				.reduce( (acc, cur) => {
					acc[cur.SERIALNUMBER] = acc[cur.SERIALNUMBER] ? acc[cur.SERIALNUMBER] : { sublist: cur.SUBLIST, processed:false, displayType:null, show:false  };
					return acc
				}, {});

			});
		},
	},
	template: `
	<div v-if="!raw.ready">

		<div class="row">
			<div class="col-12">
				<div class="alert alert-light text-center" role="alert">
					<p class="lead">&#128270; Finding New Merchandise Customers in ThankQ ... </p>
					<p><div class="container h-100"><div class="row h-100 justify-content-center align-items-center"><div class="lds-heart"><div></div></div></div></div></p>
				</div>
			</div>
		</div>

	</div>

	<div v-else>

		<div class="row">
			<div class="col-12">

				<div class="card shadow-type7">
					<div class="card-body">

						<div class="row">
							<div class="col-12">
								<div class="progress" v-if=" progress!==100 ">
									<div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar"
										v-bind:aria-valuenow="progress" aria-valuemin="0" v-bind:aria-valuemax="raw.rows.length" v-bind:style="{ width: progress + '%' }"
										v-bind:class="progressClassObj"
									><< progress >> %</div>
								</div>

							</div>
						</div>

						<div class="row">
							<div class="col">
								<blockquote class="blockquote">
									<p class="mb-0"><< raw.rows.length >> Total New Merchandise Customers Found  in <span v-if="fy===null">Current Financial Year</span><span v-else>FY<< fy >></span></p>
									<footer class="blockquote-footer" v-on:dblclick="showFYSelection=!showFYSelection"> from thankQ <small><< raw.timestamp|dtAU >>, << raw.processed >>/<< raw.rows.length >> </small></footer>
								</blockquote>

								<div v-if="showFYSelection">
									<select class="custom-select" id="fySelect" v-model="fy" >
										<option v-for="f in fys"  v-bind:value="f" >FY<< f >></option>
									</select>
								</div>

							</div>
						</div>

					</div>
				</div>

			</div>
		</div>

		<div class="row">
			<div class="col-12">
				<div class="card shadow-type6">

					<transition name="slide-fade">
					<div class="card-header bg-transparent" v-if="progress === 100">
						<span class="lead text-info align-top">&#10024; Views : </span>

						<label class="switch align-middle">
							<input type="checkbox" class="switch-success" v-model="showSuccess" v-bind:disabled="progress !== 100" >
							<span class="switch-slider round"></span>
						</label>

						<label class="switch align-middle">
							<input type="checkbox" class="switch-info" v-model="showWaiting" v-bind:disabled="progress !== 100">
							<span class="switch-slider round"></span>
						</label>

						<label class="switch align-middle">
							<input type="checkbox" class="switch-danger" v-model="showMissing" v-bind:disabled="progress !== 100">
							<span class="switch-slider round"></span>
						</label>

					</div>
					</transition>

  				<div class="card-body">

						<ul class="nav nav-tabs mb-3 nav-fill nav-justified" id="pills-tab" role="tablist">

							<li class="nav-item ">
								<a class="nav-link active" id="include-tab" data-toggle="pill" href="#include" role="tab" aria-controls="include" aria-selected="true">
								 &#128204; To be Called  <span class="badge badge-pill badge-info"> << includeRowsShowCount >>/<< includeRows.length >></span>
								</a>
							</li>

							<li class="nav-item ">
								<a class="nav-link" id="skip-tab" data-toggle="pill" href="#skip" role="tab" aria-controls="skip" aria-selected="false">
								 &#9975; Skipped &#8828; 05/09/18 <span class="badge badge-pill badge-secondary"> << skippedRowsShowCount >>/<< skippedRows.length >></span>
								</a>
							</li>

							<li class="nav-item ">
								<a class="nav-link" id="finished-tab" data-toggle="pill" href="#finished" role="tab" aria-controls="finished" aria-selected="false">
								 &#128515; Called <span class="badge badge-pill badge-success"> << finishedRowsShowCount >>/<< finishedRows.length >></span>
								</a>
							</li>

							<li class="nav-item ">
								<a class="nav-link" id="exclude-tab" data-toggle="pill" href="#exclude" role="tab" aria-controls="exclude" aria-selected="false">
								 &#128683; Excluded <span class="badge badge-pill badge-warning"> << excludeRowsShowCount >>/<< excludeRows.length >></span>
								</a>
							</li>

						</ul>

						<div class="tab-content" id="pills-tabContent">

							<div class="tab-pane fade show active" id="include" role="tabpanel" aria-labelledby="include-tab">
								<vue-table v-bind:rows="includeRows" theme="primary" v-bind:ask="true" ></vue-table>
							</div>

							<div class="tab-pane fade" id="exclude" role="tabpanel" aria-labelledby="exclude-tab">
								<vue-table v-bind:rows="excludeRows" theme="warning" v-bind:ask="false" ></vue-table>
							</div>

							<div class="tab-pane fade" id="skip" role="tabpanel" aria-labelledby="skip-tab">
								<vue-table v-bind:rows="skippedRows" theme="secondary" v-bind:ask="true" ></vue-table>
							</div>

							<div class="tab-pane fade" id="finished" role="tabpanel" aria-labelledby="finished-tab">
								<vue-table v-bind:rows="finishedRows" theme="success" v-bind:ask="false" ></vue-table>
							</div>

						</div>

					</div>
				</div>

			</div>
		</div>

	</div>
	`,
	components:{
		'vue-table': vueTable,
	},

});
