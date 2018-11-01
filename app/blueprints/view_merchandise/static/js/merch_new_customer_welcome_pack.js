// ******************************************************************************
let vueRow = Vue.component('vue-row', {
	props: ['row', 'sublist'],
	data: function(){
		return {
			toggleColor: false,
			welcomepackRecords: null,
			show: true,
		}
	},
	computed: {
		hasWelcomepack: function() {
			return this.welcomepackRecords !==null && this.welcomepackRecords.length > 0
		},
		welcomepackResult: function(){
			if ( this.welcomepackRecords === null ){
				return '<span class="text-muted">&#128269; searching pcikingslips for welcompack ...</span>'
			}else if (this.welcomepackRecords.length === 0) {
				return '<span class="text-danger">&#128560; No Welcome Pack Found</span>'
			}else{
				// let result = this.welcomepackRecords.reduce((acc, cur) => acc += ' | ' cur.workbook , '')
				let msg = ''
				this.welcomepackRecords.forEach(r => {
					msg += '<small><span class="badge badge-success">' +  r.workbook + '</span></small> <small><span class="badge badge-light">' + this.craftWelcomeMessage(r) + '</span></small><br>'
				});
				return msg
			}
		}
	},
	created(){
		this.$eventBus.$on('startProcessCustomer', (filteredSlipRows) => {
			this.welcomepackRecords = [];
			this.welcomepackRecords = this.welcomepackRecords.concat(filteredSlipRows.filter(d => d.OrderNumber === this.row.FIRSTORDER)).sort((a,b) => new Date(a.created) < new Date(b.created));
			this.show =  this.hasWelcomepack;
			let excelCreated = null;
			let excekNames = [];
			if (this.hasWelcomepack)  {
				excelCreated = this.welcomepackRecords[0].created;
				excekNames = this.welcomepackRecords.map(d => d.workbook)
			}
			this.$eventBus.$emit('checkedWelcomePack', this.sublist, this.row.SERIALNUMBER, this.hasWelcomepack, excelCreated, excekNames);
		});
		this.$eventBus.$on('toggleNotFoundResults', toggle => {
			if (!this.hasWelcomepack){
				this.show = toggle
				this.$eventBus.$emit('addShowItem', toggle ? 1 : -1, this.sublist);
			}
		});
		this.$eventBus.$on('toggleFoundResults', toggle => {
			if (this.hasWelcomepack){
				this.show = toggle
				this.$eventBus.$emit('addShowItem',toggle ? 1 : -1, this.sublist);
			}
		});
	},
	methods: {
		craftWelcomeMessage: function(row){
			return	'Welcome Pack Sent With ' + row.OrderNumber
		}
	},
	template: `<tr v-if="show" v-on:dblclick="toggleColor=!toggleColor" v-bind:class="{'table-danger': this.toggleColor}">
		<td scope="row" style="width: 25%" class="align-middle">
			<mark class="text-dark"><< row.FULLNAME >> <small class="text-primary" v-if="row.SORTKEYREF1">(is << row.SORTKEYREFREL2 >>)</small> <small>(<span class="text-success"><< row.SOURCE >></span>)</small></mark>
			<br>
			<span class="badge badge-secondary"><< row.SERIALNUMBER >></span>
			<span class="badge badge-secondary" v-if="row.LAST_REXID "><< row.LAST_REXID >></span>
			<span class="badge badge-danger" v-if=" row.CONTACTTYPE === 'Organisation' "><< row.PRIMARYCATEGORY >></span>
			<span class="badge badge-danger" v-if="row.DECD === -1">DECEASED</span>
			<span class="badge badge-danger" v-if="row.ESTATE === -1">ESTATE</span>
			<span class="badge badge-warning" v-if="row.PLEDGES > 0">[<< row.PLEDGES >>SP] << row.FIRST_PLEDGEID >></span>
		</td>

		<td style="width: 10%" class="align-middle">
			<span class="text-muted">
			<span v-bind:class="{'text-success': this.row.FIRSTORDERS===1, 'text-primary': this.row.FIRSTORDERS>1, 'text-danger': this.row.FIRSTORDERS<1}">[<< row.FIRSTORDERS >>]<< row.FIRSTORDER >></span>
			<br>
			<small>(payment << row.FIRSTDATE|dAU >>)</small>
			</span>
		</td>

		<td style="width: 20%" class="align-middle" v-html="welcomepackResult"></td>

		<td style="width: 20%" class="align-middle">
			<span v-if=" row.WELCOMEPACK_BY !== null ">
				<mark>&#129303; << row.WELCOMEPACK_BY >><span class="text-success"><small> updated <span class="badge badge-success"><< row.WELCOMEPACK_TYPE >></span> <span class="badge badge-success"><< row.WELCOMEPACK_DATE|dAU >></span></small></span></mark>
				<p class="lead"><small><< row.WELCOMEPACK_SUBJECT >></small></p>
			</span>
		</td>

		<td style="width: 20%" class="align-middle text-left">
			<span v-if=" row.JOURNEY_BY !== null ">
				<span class="text-secondary" v-if=" row.BOARDED === -1 ">
					<mark class="text-success">&#128526; << row.JOURNEY_BY >> Created Journey Profile</mark>
				</span>
				<span class="text-secondary" v-else-if="row.BOARDED === -2 ">
					<mark class="text-danger">&#129300; << row.JOURNEY_BY >> Cancelled Journey</mark>
					<p class="lead"><small><< row.JOURNEY_NOTE >></small></p>
				</span>
			</span>
		</td>
	</tr>`,
});

// ******************************************************************************
let vueTable = Vue.component('vue-table', {
	props: ['rows', 'sublist'],
	components:{
		'result-row': vueRow
	},
	template: '<div class="table-responsive-lg">' +
	`<table class="table table-sm table-hover table-bordered" >
		<thead>
			<tr class="table-bordered bg-primary text-light">
				 <th scope="col" style="width: 25%">CUSTOMER</th>
				 <th scope="col" style="width: 10%">FIRST ORDER</th>
				 <th scope="col" style="width: 20%">CHECK PICKINGSLIP</th>
				 <th scope="col" style="width: 20%">THANKQ COMMUNICATION</th>
				 <th scope="col" style="width: 20%">ON BOARDING PROFILE</th>
			</tr>
		</thead>
		<tbody>
			<result-row v-for="row in rows" v-bind:row="row" v-bind:sublist="sublist"></result-row>
		</tbody>
	</table>
	` + '</div>'
});
// ******************************************************************************
let rootVue = new Vue({
	el: '#root',
	data: {
		rawAPI: '/api/merch/new_customers',
		slipsAPI: '/api/merch/fulfilment_excels',
		slipAPI: '/api/merch/rex_picking_slip',
		raw: {
			rows: [],
			ready: false,
			timestamp: null,
		},
		fulfilment:{
			rows: [],
			ready: false,
			timestamp: null,
		},
		pickingSlip: {
			rows: [],
		},
		customers: null,
		pickingSlipRead: 0,
		customerWelcomePackChecked: 0,
		fy:null,
		showFYSelection: false,
		showFulfilmentFiles: false,
		showNotFound: false,
		showFound: true,
		todoRowsCount: 0,
		finishedRowsCount: 0,
		excludedRowsCount: 0,
		csvEncodedURIWelcomepack: null
	},
	computed: {
		customerDataAPI: function() {
			if (this.fy === null || this.fy === undefined){
				return this.rawAPI
			} else {
				if( String(this.fy).length === 4  ){
					return this.rawAPI + '?fy=' + this.fy
				}else{
					return this.rawAPI
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
				files = this.fulfilment.rows.map(d => d.creator + '_' + d.workbook + ' [' + d['dataSheet']['title'] + '] , row: ' + d['dataSheet']['minRow'] + ' - ' + d['dataSheet']['maxRow'] + ' , column: '+ d['dataSheet']['minColumn'] + ' - ' + d['dataSheet']['maxColumn'] + '' )
			}
			return files
		},
		todoRows: function () {
			return this.raw.rows.filter(row => this.calcSubListType(row) === 'todo' )
		},
		finishedRows: function () {
			return this.raw.rows.filter(row => this.calcSubListType(row) === 'finished' )
		},
		excludedRows: function () {
			return this.raw.rows.filter(row => this.calcSubListType(row) === 'exlcude' )
		},
		dataReady: function() {
			return this.raw.ready &&  this.fulfilment.ready && this.pickingSlipRead === this.fulfilment.rows.length
		}
	},
	watch: {
		fy: function(){
			this.getData();
		},
		showNotFound: function(newVal, oldVal){
			this.$eventBus.$emit('toggleNotFoundResults', newVal);
		},
		showFound: function(newVal, oldVal){
			this.$eventBus.$emit('toggleFoundResults', newVal);
		},
		customerWelcomePackChecked : function (newVal, oldVal) {
			if (newVal === this.raw.rows.length) {
				let csvArr = [];
				csvArr.push(("data:text/csv;charset=utf-8," + ['SERIALNUMBER', 'TIMEOFCOMMUNICATION', 'DATEOFCOMMUNICATION', 'COMMUNICATIONTYPE', 'CATEGORY', 'SUBJECT', 'NOTE'].join(",")));
				this.raw.rows
					.filter(d => this.customers[d.SERIALNUMBER].foundWelcomePack && this.customers[d.SERIALNUMBER].sublist == 'todo' )  //this.customers[d.SERIALNUMBER].foundWelcomePack && this.customers[d.SERIALNUMBER].sublist == 'todo'
					.map(d => ["=\"" + d.SERIALNUMBER + "\"" ,
						"=\"" +String(new Date(this.customers[d.SERIALNUMBER].pickingSlipCreated).getHours()).padStart(2, '0') + ':' + String(new Date(this.customers[d.SERIALNUMBER].pickingSlipCreated).getMinutes()).padStart(2, '0') + "\"",
						new Date(this.customers[d.SERIALNUMBER].pickingSlipCreated).getDate() + '/' + (new Date(this.customers[d.SERIALNUMBER].pickingSlipCreated).getMonth() + 1) + '/' + new Date(this.customers[d.SERIALNUMBER].pickingSlipCreated).getFullYear(),
						'Note',
						'Merch Onboarding',
						'Welcome Pack sent with ' + d.FIRSTORDER ,
						'Evidenced by PickingSlip : ' + this.customers[d.SERIALNUMBER].excels.toString()]
					)
					.forEach(arr => {
						csvArr.push(arr.join(","));
					});
				let csvContent = csvArr.join("\n");
				this.csvEncodedURIWelcomepack = encodeURI(csvContent);
			}
		}
	},
	methods:{
		calcSubListType: function(row){
			if (  (row['CONTACTTYPE'] === 'Organisation')
					|| (row['FIRSTDATE_MERCHANDISE_PLEDGE'] !== 0)
					|| (row['DECD'] === -1)
					|| (row['PRIMARYCATEGORY'] === 'ESTATE')
					|| (row['BOARDED'] === -2)
				) {
				return 'exlcude'
			}else {
				if ( !((row['WELCOMEPACK_BY'] === null ) || (row['WELCOMEPACK_BY'].trim() === '' )) ) {
					return 'finished'
				}else {
					return 'todo'
				}
			}
		},
		getData: function(){
			this.raw.rows = [];
			this.raw.ready = false;
			this.raw.timestamp = null;

			this.fulfilment.rows = [];
			this.fulfilment.ready = false;
			this.fulfilment.timestamp = null;

			this.pickingSlip.rows = [];
			this.customers = null;
			this.pickingSlipRead = 0;
			this.customerWelcomePackChecked =0;

			this.showFYSelection = false;
			this.showFulfilmentFiles = false;
			this.showNotFound = false;
			this.showFound = true;
			this.todoRowsCount = 0;
			this.finishedRowsCount = 0;
			this.excludedRowsCount = 0;
			this.csvEncodedURIWelcomepack = null;

			fetchJSON(endpoint(this.customerDataAPI), (json) => {
				this.raw.rows = json.rows.sort((a, b) => a.FIRSTORDER <  b.FIRSTORDER);  //Sort by Order Desc
				this.raw.timestamp = new Date(json.timestamp);
				this.raw.ready = true;
				this.customers = this.raw.rows
					.map(row => { return {SERIALNUMBER: row.SERIALNUMBER, SUBLIST: rootVue.calcSubListType(row)}; } )
					.reduce( (acc, cur) => {
						acc[cur.SERIALNUMBER] = acc[cur.SERIALNUMBER] ? acc[cur.SERIALNUMBER] : { sublist: cur.SUBLIST, pickingSlipChecked: false, foundWelcomePack: false, pickingSlipCreated:null, excels:[] };
						return acc
					}, {});
					fetchJSON(endpoint(this.slipsAPI), (listJSON) => {
						this.fulfilment.rows = listJSON.rows.sort((a, b) => new Date(a.created) <  new Date(b.created));
						this.fulfilment.timestamp = new Date(listJSON.timestamp);
						this.fulfilment.ready = true;
						for (let i=0; i<listJSON.rows.length; i++) {
							fetchJSON(endpoint(rootVue.slipAPI + '?filename=' + listJSON.rows[i].workbook + '&tab=' + listJSON.rows[i].dataSheet.title), (slipJSON) => {
								this.pickingSlip.rows = this.pickingSlip.rows.concat(slipJSON.rows.map(obj => Object.assign(obj, {workbook: listJSON.rows[i].workbook, created:listJSON.rows[i].created}) ));
								this.pickingSlipRead += 1;
								if (i===listJSON.rows.length-1){
									this.$eventBus.$emit('startProcessCustomer', this.pickingSlip.rows.filter(d => d.Manufacturer_Code === 'WP'));
									console.log('Start Checking Customers against PickingSlips now ....');
								}
							}, i===listJSON.rows.length -1 ? false : true);
						}
					});
			});
		},
		updateSublistShowCount: function(cnt, sublist) {
			if (sublist === 'todo'){
				this.todoRowsCount += cnt;
			}else if(sublist === 'done'){
				this.finishedRowsCount += cnt;
			}else if(sublist === 'exclude'){
				this.excludedRowsCount += cnt;
			}
		},
	},
	created(){
		this.getData();
		this.$eventBus.$on('checkedWelcomePack', (sublist, sn, found, created, excekNames) => {
			this.customerWelcomePackChecked += 1;
			if (this.customers[sn]){
				this.customers[sn].pickingSlipChecked = true;
				this.customers[sn].foundWelcomePack = found;
				this.customers[sn].pickingSlipCreated = created;
				this.customers[sn].excels = excekNames;
			}

			if (found) {
				this.updateSublistShowCount(1, sublist)
			}
		});
		this.$eventBus.$on('addShowItem', (data, type) => this.updateSublistShowCount(data, type));
	},
	components:{
		'vue-loader': vueLoader,
		'vue-table': vueTable,
	},
	template: '<vue-loader msg="Finding New Merchandise Customers in ThankQ ..." v-if="!raw.ready && !fulfilment.ready"></vue-loader>' + '<div class="container-fluid" v-else>' +
	`
	<div class="row mb-2">
		<div class="col-lg-2">
			<div class="card p-1 align-middle">
				<p class="card-title lead text-center text-secondary">
					<span v-if="csvEncodedURIWelcomepack===null">PROCESSING</span><span v-else>TO DO EXPORT</span>
				</p>
				<a v-bind:href="csvEncodedURIWelcomepack" v-bind:class="{'disabled': csvEncodedURIWelcomepack===null}" class="btn btn-outline-success btn-sm btn-block" role="button" aria-pressed="true" download="welcompack_data.csv">TODO CSV</a>
			</div>
		</div>
		<div class="col-lg-5">
			<div class="card p-1 align-middle">
				<blockquote class="blockquote">
					<p class="mb-0"><< raw.rows.length|number >> New merchandise customers in <span v-if="fy===null">current financial year</span><span v-else>FY<< fy >></span></p>
					<footer class="blockquote-footer" v-on:dblclick="showFYSelection=!showFYSelection"> from thankQ <small><< raw.timestamp|dtAU >>, <span v-if="customerWelcomePackChecked !== raw.rows.length || customerWelcomePackChecked === 0" class="text-danger"><< customerWelcomePackChecked >>/<< raw.rows.length >></span><span v-else class="text-success">&#128079;Checked << raw.rows.length >> customers against << pickingSlipRead >> slips</span></small></footer>
				</blockquote>
				<div v-if="showFYSelection">
					<select class="custom-select" id="fySelect" v-model="fy" >
						<option v-for="f in fys"  v-bind:value="f" >FY<< f >></option>
					</select>
				</div>
			</div>
		</div>

		<div class="col-lg-5">
			<div class="card p-1 align-middle">
				<blockquote class="blockquote">
					<p class="mb-0"  v-if="fulfilment.ready"><< fulfilment.rows.length|number >> fulfilment excel workbooks found</p>
					<footer class="blockquote-footer" v-on:dblclick="showFulfilmentFiles=!showFulfilmentFiles"> from merchandise folder <small>@<< fulfilment.timestamp|dtAU >>, <span v-if="pickingSlipRead !== fulfilment.rows.length || pickingSlipRead === 0" class="text-danger"><< pickingSlipRead >>/<< fulfilment.rows.length >></span><span v-else class="text-success">&#128079;<< fulfilment.rows.length >> All Collected</span></small></footer>
				</blockquote>
				<div v-if="showFulfilmentFiles">
					<select class="custom-select" id="fileSelect" >
						<option v-for="f in fulfilmentFileNames"  v-bind:value="f" ><< f >></option>
					</select>
				</div>
			</div>
		</div>
	</div>

	<div class="row mb-3">
		<div class="col-12">

			<div v-if="pickingSlipRead > 0">
				<div class="progress" v-if="pickingSlipRead !== fulfilment.rows.length">
					<div class="progress-bar bg-warning" role="progressbar"
						v-bind:aria-valuenow="((pickingSlipRead/fulfilment.rows.length)*100)" aria-valuemin="0" v-bind:aria-valuemax="fulfilment.rows.length" v-bind:style="{ width: ((pickingSlipRead/fulfilment.rows.length)*100).toFixed(1) + '%' }"
					><< pickingSlipRead >>/<< fulfilment.rows.length >></div>
				</div>
				<div v-if="raw.rows.length === customerWelcomePackChecked && customerWelcomePackChecked !== 0">
					<label class="switch align-middle">
						<input type="checkbox" class="switch-success" v-model="showFound">
						<span class="switch-slider"></span>
					</label>
					<label class="switch align-middle">
						<input type="checkbox" class="switch-warning" v-model="showNotFound" >
						<span class="switch-slider"></span>
					</label>

				</div>
			</div>

			<div class="text-center" v-else>
				<span class="text-secondary">(&#9749;idle) Fulfilment Data Processor</span>
			</div>

		</div>
	</div>

	<div class="row">
		<div class="col-12">

			<ul class="nav nav-pills nav-fill nav-justified mb-1" role="tablist" id="pills-tab">
				<li class="nav-item ">
					<a class="nav-link active" id="include-tab" data-toggle="pill" href="#include" role="tab" aria-controls="include" aria-selected="true">
					 &#127873; Check  <span class="badge badge-pill badge-light"><< todoRowsCount >>/<< todoRows.length >></span>
					</a>
				</li>
				<li class="nav-item ">
					<a class="nav-link" id="finished-tab" data-toggle="pill" href="#finished" role="tab" aria-controls="finished" aria-selected="false">
					 &#128230; ThankQ <span class="badge badge-pill badge-light"><< finishedRowsCount >>/<< finishedRows.length >></span>
					</a>
				</li>
				<li class="nav-item ">
					<a class="nav-link" id="exclude-tab" data-toggle="pill" href="#exclude" role="tab" aria-controls="exclude" aria-selected="false">
					 &#128683; Excluded <span class="badge badge-pill badge-light"><< excludedRowsCount >>/<< excludedRows.length >></span>
					</a>
				</li>
			</ul>
			<div class="tab-content" id="pills-tabContent">
				<div class="tab-pane fade show active" role="tabpanel" id="include" aria-labelledby="include-tab">
					<vue-table v-bind:rows="todoRows" sublist="todo" ></vue-table>
				</div>
				<div class="tab-pane fade" role="tabpanel" id="finished" aria-labelledby="finished-tab">
					<vue-table v-bind:rows="finishedRows" sublist="done" ></vue-table>
				</div>
				<div class="tab-pane fade" role="tabpanel" id="exclude" aria-labelledby="exclude-tab">
					<vue-table v-bind:rows="excludedRows" sublist="exclude" ></vue-table>
				</div>
			</div>

		</div>
	</div>
	` + '</div>'
});
