// ******************************************************************************
let vueRow = Vue.component('vue-row', {
	props: ['row', 'sublist'],
	data: function(){
		return {
			linkTrack: '/merchandise/track_order/',
			toggleColor: false,
			welcomepackRecords: null,
			show: true,
		}
	},
	computed: {
		trToggleClassObject: function(){
			return {
				'table-danger': this.toggleColor,
				'table-success': this.welcomepackRecords !==null && this.welcomepackRecords.length > 0
			}
		},
		welcomepackResult: function(){
			if ( this.welcomepackRecords === null ){
				return '<span class="text-muted">&#128269; searching for welcome pack in all pciking slips</span>'
			}else if (this.welcomepackRecords.length === 0) {
				return '<span class="text-danger">&#128560; No Welcome Pack Found</span>'
			}else{
				// let result = this.welcomepackRecords.reduce((acc, cur) => acc += ' | ' cur.workbook , '')
				let msg = ''
				this.welcomepackRecords.forEach(r => {
					msg += '<span class="text-success">&#128294; Found WP <span class="badge badge-light">' +  r.workbook + '</span></span><br>'
				});
				return msg
			}
		}
	},
	created(){
		this.$eventBus.$on('startProcessCustomer', (slipData) => {
			let res = slipData.filter(d => d.OrderNumber === this.row.FIRSTORDER && d.Manufacturer_Code === 'WP')
			this.welcomepackRecords = [];
			this.welcomepackRecords = this.welcomepackRecords.concat(res);
			this.$eventBus.$emit('processedOneCustomer', 1);
		});

		this.$eventBus.$on('toggleNotFoundResults', toggle => {
			if (this.welcomepackRecords.length === 0 ||  this.welcomepackRecords === null){
				this.show = toggle
				this.$eventBus.$emit('addShowItem', toggle ? 1 : -1, this.sublist);

			}
		});
		this.$eventBus.$on('toggleFoundResults', toggle => {
			if (this.welcomepackRecords.length !== 0 &&  this.welcomepackRecords !== null){
				this.show = toggle
				this.$eventBus.$emit('addShowItem',toggle ? 1 : -1, this.sublist);
			}
		});
	},
	mounted() {
		this.$eventBus.$emit('addShowItem', 1, this.sublist);
	},
	template: `<tr v-if="show" v-on:dblclick="toggleColor=!toggleColor" v-bind:class="trToggleClassObject" >
		<td scope="row" style="width: 26%" class="align-middle">
			<mark class="text-dark"><< row.FULLNAME >> <small class="text-primary" v-if="row.SORTKEYREF1">(is << row.SORTKEYREFREL2 >>)</small> <small>(<span class="text-success"><< row.SOURCE >></span>)</small></mark>
			<br>
			<span class="badge badge-secondary"><< row.SERIALNUMBER >></span>
			<span class="badge badge-secondary" v-if="row.LAST_REXID "><< row.LAST_REXID >></span>
			<span class="badge badge-danger" v-if=" row.CONTACTTYPE === 'Organisation' "><< row.PRIMARYCATEGORY >></span>
			<span class="badge badge-danger" v-if="row.DECD === -1">DECEASED</span>
			<span class="badge badge-danger" v-if="row.ESTATE === -1">ESTATE</span>
			<span class="badge badge-warning" v-if="row.PLEDGES > 0">[<< row.PLEDGES >>SP] << row.FIRST_PLEDGEID >></span>
		</td>

		<td style="width: 24%" class="align-middle">
			<span class="text-muted"><span class="text-danger ">ThankQ</span> 1st Order : <a target="blank" class="text-muted" v-bind:href="linkTrack + row.FIRSTORDER"><< row.FIRSTORDER >></a> <small>(<< row.FIRSTDATE|dAU >>)</small> <small class="text-success" v-if="row.FIRSTORDERS>1"> + << row.FIRSTORDERS-1 >> more</small></span>
			<br>
			<span v-html="welcomepackResult"></span>
		</td>

		<td style="width: 20%" class="align-middle">
			<span v-if=" row.WELCOMEPACK_BY !== null ">
				<mark>&#9924; << row.WELCOMEPACK_BY >></mark><span class="text-success"><small> updated <span class="badge badge-success">Welcome pack communication</span></small></span>
				<p class="lead"><small><< row.WELCOMEPACK_SUBJECT >></small></p>
			</span>
		</td>

		<td style="width: 25%" class="align-middle text-left">
			<span v-if=" row.JOURNEY_BY !== null ">
				<span class="text-secondary" v-if=" row.JOURNEY_CANCALLED === 0 ">
					<mark class="text-success">&#128526; << row.JOURNEY_BY >> Created Journey Profile</mark>
				</span>
				<span class="text-secondary" v-else-if="row.JOURNEY_CANCALLED === -1 ">
					<mark class="text-danger">&#129300; << row.JOURNEY_BY >> Cancelled Journey</mark>
					<p class="lead"><small><< row.JOURNEY_NOTE >></small></p>
				</span>
			</span>
		</td>
	</tr>`,
});

// ******************************************************************************
let vueTable = Vue.component('vue-table', {
	props: {
		'rows': {
		},
		'theme': {
			type: String
		},
		'sublist' : {
			type: String
		}
	},
	data: function() {
		return {
		}
	},
	computed: {
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
	template: `<div class="table-responsive-lg">
		<table class="table table-sm table-hover table-bordered table-striped"" >
			<thead>
				<tr class="table-bordered " v-bind:class="trClassObject">
					 <th scope="col" style="width: 26%">CUSTOMER</th>
					 <th scope="col" style="width: 24%">REX REFERENCE</th>
					 <th scope="col" style="width: 20%">THANKQ COMMUNICATION</th>
					 <th scope="col" style="width: 25%">ON BOARDING PROFILE</th>
				</tr>
			</thead>
			<tbody>
				<result-row v-for="row in rows" v-bind:row="row" v-bind:sublist="sublist"></result-row>
			</tbody>
		</table>
 	</div>`
});
// ******************************************************************************
let rootVue = new Vue({
	el: '#vue',
	data: {
		raw: {
			rows: [],
			ready: false,
			timestamp: null,
			processed:0,
			api: '/api/merch/new_customers'
		},
		fulfilment:{
			rows: [],
			ready: false,
			timestamp: null,
			api: '/api/merch/fulfilment_excels'
		},
		pickingSlip: {
			rows: [],
			api: '/api/merch/rex_picking_slip'
		},
		pickingSlipRead: 0,
		fy:null,
		showFYSelection: false,
		showFulfilmentFiles: false,
		showNotFound: true,
		showFound: true,
		todoRowsCount: 0,
		finishedRowsCount: 0,
		excludedRowsCount: 0,
	},
	watch:{
		fy: function(){

			this.raw.rows = [];
			this.raw.ready = false;
			this.raw.timestamp = null;
			this.raw.processed = 0;

			this.fulfilment.rows = [],;
			this.fulfilment.ready = false;
			this.fulfilment.timestamp = null;
	
			this.pickingSlipRead = 0;
			this.getData();
		},
		showNotFound: function(){
			this.$eventBus.$emit('toggleNotFoundResults', this.showNotFound);
		},
		showFound: function(){
			this.$eventBus.$emit('toggleFoundResults', this.showFound);
		},
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
				files = this.fulfilment.rows.map(d => d['workbook'] + ' [' + d['dataSheet']['title'] + '] , row: ' + d['dataSheet']['minRow'] + ' - ' + d['dataSheet']['maxRow'] + ' , column: '+ d['dataSheet']['minColumn'] + ' - ' + d['dataSheet']['maxColumn'] + '' )
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
		}
	},
	created(){
		this.getData();
		this.$eventBus.$on('processedOneCustomer', (data) => this.raw.processed +=data );
		this.$eventBus.$on('addShowItem', (data, type) => {
			if (type === 'todo'){
				this.todoRowsCount += data;
			}else if(type === 'done'){
				this.finishedRowsCount += data;
			}else if(type === 'exclude'){
				this.excludedRowsCount += data;
			}
		});
	},
	methods:{
		calcSubListType: function(row){
			if (  (row['CONTACTTYPE'] === 'Organisation')
					|| (row['FIRSTDATE_MERCHANDISE_PLEDGE'] !== 0)
					|| (row['DECD'] === -1)
					|| (row['PRIMARYCATEGORY'] === 'ESTATE')
					|| (row['JOURNEY_CANCALLED'] === -1)
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
			fetchJSON(endpoint(this.customerDataAPI), function(json){
				rootVue.raw.rows = json.rows.sort((a, b) => new Date(a.FIRSTDATE) <  new Date(b.FIRSTDATE) );
				rootVue.raw.ready = true;
				rootVue.raw.timestamp = new Date(json.timestamp);
				rootVue.initProcessing();
			});
			fetchJSON(endpoint(this.fulfilment.api), function(json){
				rootVue.fulfilment.rows = json.rows;
				rootVue.fulfilment.ready = true;
				rootVue.fulfilment.timestamp = new Date(json.timestamp);
				rootVue.initProcessing();
				for (let i=0; i<json.rows.length; i++) {
					fetchJSON(endpoint(rootVue.pickingSlip.api + '?filename=' + json.rows[i].workbook + '&tab=' + json.rows[i].dataSheet.title), function(slipJSON){
						rootVue.pickingSlip.rows = rootVue.pickingSlip.rows.concat(slipJSON.rows.map(obj => Object.assign(obj, {workbook: slipJSON.workbook}) ));
						rootVue.pickingSlipRead += 1;
						rootVue.initProcessing();
					}, i===json.rows.length -1 ? false : true);
				}
			});
		},
		initProcessing: function(){
			if (this.raw.ready &&  this.fulfilment.ready && this.pickingSlipRead !== 0 && this.pickingSlipRead === this.fulfilment.rows.length) {
				this.$eventBus.$emit('startProcessCustomer', this.pickingSlip.rows);
			}
		},

	},
	template: `
	<div v-if="!raw.ready && !fulfilment.ready">
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
									<footer class="blockquote-footer" v-on:dblclick="showFYSelection=!showFYSelection"> from thankQ <small><< raw.timestamp|dtAU >>, <span v-if="raw.processed !== raw.rows.length || raw.processed === 0" class="text-danger"><< raw.processed >>/<< raw.rows.length >></span><span v-else class="text-success">&#128079;Checked << raw.rows.length >> customers against << pickingSlipRead >> slips</span></small></footer>
								</blockquote>

								<div v-if="showFYSelection">
									<select class="custom-select" id="fySelect" v-model="fy" >
										<option v-for="f in fys"  v-bind:value="f" >FY<< f >></option>
									</select>
								</div>
							</div>

							<div class="col-lg-6">
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
				</div>

			</div>
		</div>

		<div class="row">
			<div class="col-12">

				<div class="card shadow-type1">

					<div class="card-header bg-transparent shadow-type8">
						<div v-if="pickingSlipRead > 0">
							<div class="progress" v-if="pickingSlipRead !== fulfilment.rows.length">
								<div class="progress-bar bg-warning" role="progressbar"
									v-bind:aria-valuenow="((pickingSlipRead/fulfilment.rows.length)*100)" aria-valuemin="0" v-bind:aria-valuemax="fulfilment.rows.length" v-bind:style="{ width: ((pickingSlipRead/fulfilment.rows.length)*100).toFixed(1) + '%' }"
								><< pickingSlipRead >>/<< fulfilment.rows.length >></div>
							</div>
							<div v-if="raw.rows.length === raw.processed && raw.processed !== 0">
								<label class="switch align-middle">
									<input type="checkbox" class="switch-success" v-model="showFound" v-bind:disabled="raw.rows.length !== raw.processed" >
									<span class="switch-slider "></span>
								</label>
								<label class="switch align-middle">
									<input type="checkbox" class="switch-warning" v-model="showNotFound" v-bind:disabled="raw.rows.length !== raw.processed" >
									<span class="switch-slider "></span>
								</label>
							</div>
						</div>

						<div v-else>
							<span class="text-secondary">(&#9749;idle) Fulfilment Data Processor</span>
						</div>
					</div>

					<div class="card-header bg-transparent">
						<ul class="nav nav-tabs  nav-fill nav-justified" id="pills-tab" role="tablist">
							<li class="nav-item ">
								<a class="nav-link active" id="include-tab" data-toggle="pill" href="#include" role="tab" aria-controls="include" aria-selected="true">
								 &#127873; Welcome Pack  <span class="badge badge-pill badge-info"><< todoRowsCount >>/<< todoRows.length >></span>
								</a>
							</li>
							<li class="nav-item ">
								<a class="nav-link" id="finished-tab" data-toggle="pill" href="#finished" role="tab" aria-controls="finished" aria-selected="false">
								 &#128230; Sent <span class="badge badge-pill badge-success"><< finishedRowsCount >>/<< finishedRows.length >></span>
								</a>
							</li>
							<li class="nav-item ">
								<a class="nav-link" id="exclude-tab" data-toggle="pill" href="#exclude" role="tab" aria-controls="exclude" aria-selected="false">
								 &#128683; Excluded <span class="badge badge-pill badge-warning"><< excludedRowsCount >>/<< excludedRows.length >></span>
								</a>
							</li>
						</ul>
					</div>

					<div class="card-body">
						<div class="tab-content" id="pills-tabContent">
							<div class="tab-pane fade show active" id="include" role="tabpanel" aria-labelledby="include-tab">
								<vue-table v-bind:rows="todoRows" theme="primary" sublist="todo" ></vue-table>
							</div>
							<div class="tab-pane fade" id="finished" role="tabpanel" aria-labelledby="finished-tab">
								<vue-table v-bind:rows="finishedRows" theme="success" sublist="done" ></vue-table>
							</div>
							<div class="tab-pane fade" id="exclude" role="tabpanel" aria-labelledby="exclude-tab">
								<vue-table v-bind:rows="excludedRows" theme="warning" sublist="exclude" ></vue-table>
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
