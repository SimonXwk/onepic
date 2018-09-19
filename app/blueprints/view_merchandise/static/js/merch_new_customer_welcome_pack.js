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
				return '❤' + ' ' + 'Pure Donation/GOL'
			}else if (!this.ask){
				return '⛲' + ' ' + 'No Further Checking Needed'
			}else if ( !this.hasOrderNumber ) {
				return '❌' + ' Order Number Not In ThankQ '
			}else if ( this.called1 === false ) {
				return '☕' + ' searching(1) ... '
			}else if ( this.trackingNumber === null ) {
				return '☹' + ' No Response From Starshipit'
			}else if ( this.called2 === false ) {
				return '☕' + ' searching(2) ... '
			}else if ( this.status !== null && this.status.toUpperCase().indexOf('DELIVERED') !== -1 ) {
				return '✅' + ' ['+ this.orders + '] ' + this.status + ' ➠ ' + this.formatDateTime(this.statusDate) + ''
			}else {
				return '❌' + ' ['+ this.orders + '] ' + this.status
			}
		}
	},

	created(){
		// Toggle Buttons
		vueBus.$on('toggleSuccessResults', (data) => this.toggleSuccessResults(data));
		vueBus.$on('toggleWaitingResults', (data) => this.toggleWaitingResults(data));
		vueBus.$on('toggleMissingResults', (data) => this.toggleMissingResults(data));

		let vCol = this;
		// if (this.ask && !this.isDonor && this.hasOrderNumber && !this.isDelivered) {
		// 	fetchJSON(endpoint(vCol.fetch1 + vCol.row['FIRSTORDER']), function (json1) {
		// 		vCol.called1 = true;
		// 		let orders = json1.orders;
		// 		if (orders.length > 0) {
		// 			vCol.orders = orders.length;
		// 			vCol.trackingNumber = orders[0]['tracking_number'];
		// 			orders.forEach(order => {
		// 				fetchJSON(endpoint(vCol.fetch2 + vCol.trackingNumber), function (json2) {
		// 					vCol.called2 = true;
		// 					if (json2.success === true) {
		// 						let events = json2['results']['tracking_events'];
		// 						let lastEvent = events[events.length - 1];
		// 						vCol.status = lastEvent['status'];
		// 						vCol.statusDate = lastEvent['event_datetime'];
		// 						vCol.statusDetail = lastEvent['details'];
		// 						vCol.show = vCol.isDelivered;
		// 						vueBus.$emit('processedCustomer', 1);
		// 					}
		// 				}, true);
		// 			});
		// 		} else {
		// 			vueBus.$emit('processedCustomer', 1);
		// 		}
		// 	}, true);
		// } else {
		// 	vCol.show = this.isDonor || !this.ask;
		// 	vueBus.$emit('processedCustomer', 1);
		// }

	},
	methods:{
		formatDate: function (rawDate){
			let d = new Date(rawDate);
			return d.toLocaleDateString("en-AU", { year: 'numeric', month: 'long', day: 'numeric' });
		},
		formatDateTime: function (rawDate){
			let d = new Date(rawDate);
			return d.toLocaleDateString("en-AU", { year: 'numeric', month: 'long', day: 'numeric' , hour:'numeric', minute:'numeric' });
		},
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
	<transition name="bounce">
	<tr v-if="show" v-on:dblclick="toggleColor=!toggleColor" v-bind:class="trClassObject" >

		<td scope="row" style="width: 30%">
			<strong><< row.FULLNAME >></strong> <small class="text-primary" v-if="row.SORTKEYREF1">(is << row.SORTKEYREFREL2 >>)</small>
			<hr class="my-1">
			<small class="text-secondary"><< row.SERIALNUMBER >><span class="text-danger" v-if=" row.CONTACTTYPE === 'Organisation' ">, ORG</span>, << row.PRIMARYCATEGORY >>, <span class="text-success"> from << row.SOURCE >></span></small>
			<small class="text-danger" v-if="row.DECD === -1">, Deceased</small>
			<small class="text-danger" v-if="row.ESTATE === -1">, Estate</small>
			<small class="text-danger" v-if="row.PLEDGES > 0">, [<< row.PLEDGES >>SP] << row.FIRST_PLEDGEID >></small>
		</td>

		<td style="width: 30%">
			 <span class="text-muted"><< row.FIRSTORDER >><small> order date << formatDate(row.FIRSTDATE) >></small> <a target="blank" class="text-muted" v-bind:href="linkTrack + row.FIRSTORDER"> &#9735;<small>starshipit</small></a></span>
			 <hr class="my-1">
			 <span v-bind:class="statusTextClassObject">Rex Info</span>

		</td>

		<td style="width: 20%">
			<span v-if=" row.WELCOMEPACK_BY !== null ">
				<mark>&#9924; << row.WELCOMEPACK_BY >></mark><span class="text-success"><small> updated <span class="badge badge-success">Welcome pack communication</span></small></span>
				<br>
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

		</td>

	</tr>
	</transition>
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
					 <th scope="col" style="width: 30%">CUSTOMER</th>
					 <th scope="col" style="width: 30%">REX REFERENCE</th>
					 <th scope="col" style="width: 20%">WELCOME PACK COMMUNICATION</th>
					 <th scope="col" style="width: 20%">ON BOARD PROFILE</th>
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
			processed:0,
			api: '/api/merch/new_customers'
		},
		fulfilment:{
			rows: null,
			ready: false,
			timestamp: null,
			processed:0,
			api: '/api/merch/fulfilment_excels'
		},
		fy:null,
		showFYSelection: false,
		showFulfilmentFiles: false,

	},

	watch:{
		fy: function(){
			this.raw = {
				rows: null,
				ready: false,
				timestamp: null,
				processed:0
			};
			this.getCustomerData();
		}
	},
	computed: {
		customerDataAPI: function() {
			if (this.fy === null || this.fy === undefined){
				return this.raw.api
			} else {
				if( String(this.fy).length === 4  ){
					return this.raw.api + '?fy=' + this.fy
				}else{
					return this.raw.api
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
		fulfilmentFileNames: function(){
			let files = [];
			if (this.fulfilment.ready){
				files = this.fulfilment.rows.map(d => d['filePath'] + ' , sheet:  ' + d['dataSheet']['title'] + ' , row: ' + d['dataSheet']['minRow'] + ' - ' + d['dataSheet']['maxRow'] + ' , column: '+ d['dataSheet']['minColumn'] + ' - ' + d['dataSheet']['maxColumn'] + '' )
			}
			return files
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
		todoRows: function () {
			return this.raw.rows.filter(row => !this.excludeRow(row) && !this.finishRow(row) )
		},
		finishedRows: function () {
			return this.raw.rows.filter(row => !this.excludeRow(row) && this.finishRow(row) )
		},
		excludedRows: function () {
			return this.raw.rows.filter(row => this.excludeRow(row) )
		},
	},
	created(){
		this.getFulfilmentData();
		this.getCustomerData();
		vueBus.$on('processedCustomer', (data) => this.raw.processed +=data );
	},
	methods:{
		excludeRow: function(row){
			return (row['CONTACTTYPE'] === 'Organisation')
					|| (row['FIRSTDATE_MERCHANDISE_PLEDGE'] !== 0)
					|| (row['DECD'] === -1)
					|| (row['PRIMARYCATEGORY'] === 'ESTATE')
		},
		finishRow: function(row){
			return !((row['WELCOMEPACK_BY'] === null ) || (row['WELCOMEPACK_BY'].trim() === '' ))
		},
		getCustomerData: function(){
			fetchJSON(endpoint(this.customerDataAPI), function(json){
				rootVue.raw.rows = json.rows;
				rootVue.raw.ready = true;
				rootVue.raw.timestamp = new Date(json.timestamp);
			});
		},
		getFulfilmentData: function(){
			fetchJSON(endpoint(this.fulfilment.api), function(json){
				rootVue.fulfilment.rows = json.rows;
				rootVue.fulfilment.ready = true;
				rootVue.fulfilment.timestamp = new Date(json.timestamp);
			});
		},
	},
	template: `
	<div v-if="!raw.ready ">

		<div class="row">
			<div class="col-12">
				<div class="alert alert-light text-center" role="alert">
					<p class="lead">&#128270; Finding New Merchandise Customers in ThankQ ... </p>
					<p><div class="container h-100"><div class="row h-100 justify-content-center align-items-center">
						<div class="lds-hourglass"></div>
					</div></div></p>
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

							<div class="col-lg-6">

								<blockquote class="blockquote">
									<p class="mb-0"><< raw.rows.length|number >> Total New Merchandise Customers Found in <span v-if="fy===null">CFY</span><span v-else>FY<< fy >></span></p>
									<footer class="blockquote-footer" v-on:dblclick="showFYSelection=!showFYSelection"> from thankQ <small><< raw.timestamp|dtAU >>, << raw.processed >>/<< raw.rows.length >> </small></footer>
								</blockquote>

								<div v-if="showFYSelection">
									<select class="custom-select" id="fySelect" v-model="fy" >
										<option v-for="f in fys"  v-bind:value="f" >FY<< f >></option>
									</select>
								</div>
							</div>

							<div class="col-lg-6">

								<blockquote class="blockquote">
									<p class="mb-0"  v-if="fulfilment.ready"><< fulfilment.rows.length|number >> fulfilment exports found</p>
									<footer class="blockquote-footer" v-on:dblclick="showFulfilmentFiles=!showFulfilmentFiles"> from merchandise folder <small>@<< fulfilment.timestamp|dtAU >>, << fulfilment.processed >>/<< fulfilment.rows.length >> </small></footer>
								</blockquote>


								<div v-if="showFulfilmentFiles">
									<select class="custom-select" id="fileSelect" >
										<option v-for="f in fulfilmentFileNames"  v-bind:value="f" ><< f >></option>
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

					<div class="card-header bg-transparent shadow-type8">
						<div v-if="fulfilment.processed>0">

						</div>

						<div v-else>
							<span class="text-secondary">(&#9749;idle) Fulfilment Data Processor</span>
						</div>
					</div>


	                <div class="card-body">

						<ul class="nav nav-tabs mb-3 nav-fill nav-justified" id="pills-tab" role="tablist">

							<li class="nav-item ">
								<a class="nav-link active" id="include-tab" data-toggle="pill" href="#include" role="tab" aria-controls="include" aria-selected="true">
								 &#127873; Welcome Pack  <span class="badge badge-pill badge-info"> << todoRows.length >></span>
								</a>
							</li>

							<li class="nav-item ">
								<a class="nav-link" id="finished-tab" data-toggle="pill" href="#finished" role="tab" aria-controls="finished" aria-selected="false">
								 &#128230; Sent <span class="badge badge-pill badge-success"> << finishedRows.length >></span>
								</a>
							</li>

							<li class="nav-item ">
								<a class="nav-link" id="exclude-tab" data-toggle="pill" href="#exclude" role="tab" aria-controls="exclude" aria-selected="false">
								 &#128683; Excluded <span class="badge badge-pill badge-warning"> << excludedRows.length >></span>
								</a>
							</li>

						</ul>

						<div class="tab-content" id="pills-tabContent">

							<div class="tab-pane fade show active" id="include" role="tabpanel" aria-labelledby="include-tab">
								<vue-table v-bind:rows="todoRows" theme="primary" v-bind:ask="true" ></vue-table>
							</div>

							<div class="tab-pane fade" id="finished" role="tabpanel" aria-labelledby="finished-tab">
								<vue-table v-bind:rows="finishedRows" theme="success" v-bind:ask="false" ></vue-table>
							</div>

							<div class="tab-pane fade" id="exclude" role="tabpanel" aria-labelledby="exclude-tab">
								<vue-table v-bind:rows="excludedRows" theme="warning" v-bind:ask="false" ></vue-table>
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
