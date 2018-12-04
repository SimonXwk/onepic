let vueRow = Vue.component('vue-row', {
	props: ['row', 'sublist'],
	data: function(){
		return {
			weekdays: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
			toggleColor: false,
			nextCodes: null,
		}
	},
	computed:{
		conversionCallDueDate: function(){
			// let date1 = new Date(this.row['CAMPAIGN_FIRSTDATE']);
			// let date2 = new Date(date1.setDate(date1.getDate() + 7*5));
			// if ( date2.getDay() === 0 ) {
			// 	return new Date(date1.setDate(date1.getDate() + 7*5 + 1 ));
			// } else if ( date2.getDay() === 6 ) {
			// 	return new Date(date1.setDate(date1.getDate() + 7*5 + 2 ));
			// }else {
			// 	return date2
			// }
			return new Date(Date.UTC(2018, 10, 30, 0, 0, 0))
		}
	},
	methods:{
	},
	created() {
		if (this.row.CONVERSIONCALL_BY !== null ){
			let v = this;
			let sn = this.row.SERIALNUMBER;
			let since = new Date(this.row.CONVERSIONCALL_DATE);
			api = '/api/tq/get_first_date_source1_by_contacts_since' + '?sn=' + sn + '&since=' + since.getFullYear() + '/' + (since.getMonth() + 1) + '/' + since.getDate();
			fetchJSON(endpoint(api), json => v.nextCodes = json.rows[0]['FIRSTDATE_SOURCECODES']);
		}
	},
	mounted(){
		this.$eventBus.$emit('mountOneRow', this.sublist)
	},
	template: `
	<tr class="text-left"  v-on:dblclick="toggleColor=!toggleColor" v-bind:class="{'table-warning': toggleColor}">

		<td scope="row"  class="align-middle">
			<mark class="text-dark"><< row.FULLNAME >> <small class="text-primary" v-if="row.SORTKEYREF1">(is << row.SORTKEYREFREL2 >>)</small> <small>(<span class="text-success"><< row.SOURCE >></span>, <span class="text-primary"><< row.STATE >></span>)</small></mark>
			<span v-if=" row.JOURNEY_BY !== null ">
				<br>
				<mark><small><span class="badge " :class="{'badge-primary': row.BOARDED === -1, 'badge-warning': row.BOARDED === -2}">Journey Profile by << row.JOURNEY_BY >></span></small></mark>
			</span>
			<span v-else>
				<br>
				<mark><small><span class="badge badge-danger">!Journey Profile</span></small></mark>
			</span>

			<br>
			<span v-if="row.IS_ACQUISITION===-1" class="badge badge-success">ACQ</span><span v-else-if="row.FIRSTFY===row.CFY" class="badge badge-info">NEW</span><span v-else class="badge badge-warning">OLD</span>
			<span class="badge badge-secondary"><< row.SERIALNUMBER >></span>
			<span class="badge badge-success"><< row.STATE >></span>
			<span class="badge badge-danger" v-if=" row.CONTACTTYPE === 'Organisation' "><< row.PRIMARYCATEGORY >></span>
			<span class="badge badge-danger" v-if="row.DECD === -1">DECEASED</span>
			<span class="badge badge-danger" v-if="row.ESTATE === -1">ESTATE</span>
			<span class="badge badge-warning" v-if="row.PLEDGES > 0">[<< row.PLEDGES >>SP] << row.FIRST_PLEDGEID >></span>
		</td>

		<td  class="text-muted align-middle">
			<span class="badge badge-success shadow-lg" v-if="row.ACTION_B_UPDATE===1">mUpdateB.</span><span class="badge badge-light text-muted" v-else>mUpdateB,</span>
			<span class="badge badge-success shadow-lg" v-if="row.ACTION_A_UPDATE===1">mUpdateA.</span><span class="badge badge-light text-muted" v-else>mUpdateA,</span>
			<span class="badge badge-success shadow-lg" v-if="row.ACTION_A===1">mActionA.</span><span class="badge badge-light text-muted" v-else>mActionA,</span>
			<span class="badge badge-success shadow-lg" v-if="row.ACTION_B===1">mActionB.</span><span class="badge badge-light text-muted" v-else>mActionB</span>
			<br />
			<span class="badge badge-success shadow-lg" v-if="row.EACTION_B_UPDATE===1">eUpdateB.</span><span class="badge badge-light text-muted" v-else>eUpdateB,</span>
			<span class="badge badge-success shadow-lg" v-if="row.EACTION_A_UPDATE===1">eUpdateA.</span><span class="badge badge-light text-muted" v-else>eUpdateA,</span>
			<span class="badge badge-success shadow-lg" v-if="row.EACTION_A===1">eActionA.</span><span class="badge badge-light text-muted" v-else>eActionA,</span>
			<span class="badge badge-success shadow-lg" v-if="row.EACTION_B===1">eActionB.</span><span class="badge badge-light text-muted" v-else>eActionB,</span>
			<br />
			<span class="badge badge-danger shadow-lg" v-if="row.NO_EXTRA_MAIL===1">!ExMail.</span><span class="badge badge-light text-muted" v-else>!ExMail,</span>
			<span class="badge badge-danger shadow-lg" v-if="row.NO_APPEALS===1">!Appeal.</span><span class="badge badge-light text-muted" v-else>!Appeal,</span>
			<span class="badge badge-danger shadow-lg" v-if="row.NO_EXTRA_APPEALS===1">!ExAppeal.</span><span class="badge badge-light text-muted" v-else>!ExAppeal,</span>
			<span class="badge badge-danger shadow-lg" v-if="row.NO_CATALOGUE===1">!Cat.</span><span class="badge badge-light text-muted" v-else>!Cat,</span>
		</td>

		<td  class="text-muted align-middle">
			First gift towards campaign on <span class="text-success font-weight-bold"><< row.CAMPAIGN_FIRSTDATE|dAU >></span>
			<br />
			Gave <span class="text-primary font-weight-bold"><< row.CAMPAIGN_TOAL|currency >></span> to campaign cumulatively
			<br />
			<div v-if="row.CONVERSIONCALL_BY === null">
				<small class="text-info">New Since << row.FIRSTDATE|dAU >>, gave TLMA << row.LTD_TOTAL|currency >> in total<br></small>
				<small class="text-danger" v-if=" row.LTD_FISET_MERCHANDISE_DATE !== null ">Started Merchandise since << row.LTD_FISET_MERCHANDISE_DATE|dAU >></small>
			</div>
			<div v-else>
				<small class="font-weight-bold text-primary" v-if="nextCodes">Responded SourceCodes: << nextCodes >></small>
				<small class="font-weight-bold text-danger" v-else>No Response Yet</small>
			</div>
		</td>

		<td  class="align-middle">
			<span v-if="row.DONOTCALL == -1 || row.DONOTMAIL == -1">
				<span v-if="row.DONOTCALL == -1" class="text-danger">&#128263;  Do not Call <br></span>
				<span v-if="row.DONOTMAIL == -1" class="text-danger">&#128075;  Do not Mail <br></span>
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

		<td class="align-middle">
			<span v-if=" row.JOURNEY_BY !== null && sublist === 'excluded' && row.BOARDED === -2 ">
				<mark class="text-danger">&#129300; << row.JOURNEY_MODIFIED_BY >> Cancelled Journey</mark>
				<br><small><p class="text-danger"><< row.JOURNEY_NOTE >></p></small>
				<br>
			</span>

			<span v-if="row.CONVERSIONCALL_BY !== null">
				<mark>&#128521;
				<span class="font-weight-bold"><< row.CONVERSIONCALL_TYPE >></span> by <span class="font-weight-bold"><< row.CONVERSIONCALL_BY >></span> <small class="text-success"> << row.CONVERSIONCALL_DATE|dAU >></small>
				</mark>
				<small class="text-muted"><< row.CONVERSIONCALL_NOTES >></small>
			</span>
			<span v-else-if="sublist==='excluded'" class="text-muted"></span>
			<span v-else>
				<br>
				<span v-if="conversionCallDueDate <= new Date()" class="text-danger"><mark>&#128562;
					Overdue : <span class="text-muted"><< conversionCallDueDate|dAU >>, << weekdays[conversionCallDueDate.getDay()] >></span>
					</mark>
				</span>
				<span v-else><mark>&#128560;
			 	 Due Date : <span class="text-info"><< conversionCallDueDate|dAU >>, << weekdays[conversionCallDueDate.getDay()] >></span>
				 </mark>
			 	</span>
			</span>

		</td>


		<td v-if="sublist === 'called'">
			<span v-if="row.FOLLOWUP1_BY !== null">
				<mark>&#129488;
				<span class="font-weight-bold"><< row.FOLLOWUP1_TYPE >></span> by <span class="font-weight-bold"><< row.FOLLOWUP1_BY >></span> <small class="text-success"> << row.FOLLOWUP1_DATE|dAU >></small>
				</mark>
				<small class="text-info d-block"><< row.FOLLOWUP1_SUBJECT >></small>
				<small class="text-muted"><< row.FOLLOWUP1_NOTES >></small>
			</span>
		</td>

		<td v-if="sublist === 'called'">
			<span v-if="row.FOLLOWUP2_BY !== null">
				<mark>&#129299;
				<span class="font-weight-bold"><< row.FOLLOWUP2_TYPE >></span> by <span class="font-weight-bold"><< row.FOLLOWUP2_BY >></span> <small class="text-success"> << row.FOLLOWUP2_DATE|dAU >></small>
				</mark>
				<small class="text-info d-block"><< row.FOLLOWUP2_SUBJECT >></small>
				<small class="text-muted"><< row.FOLLOWUP2_NOTES >></small>
			</span>
		</td>

	</tr>
	`,
});
// ******************************************************************************
let vueTable = Vue.component('vue-table', {
	props: ['rows', 'sublist'],
	data: function(){
		return {
			mountedRows: 0
		}
	},
	computed:{
		tableID: function(){
			return this.sublist + '-donor-list'
		},
		trClassObject: function(){
			return {
				'table-success': this.sublist === 'called',
				'table-info': this.sublist === 'todo',
				'table-danger': this.sublist === 'excluded'
			}
		},
	},
	created(){
		this.$eventBus.$on('mountOneRow', sublist => {
			if (this.sublist === sublist){
				this.mountedRows += 1;
				if (this.mountedRows === this.rows.length){
						applyDataTable(this.tableID, "sit");
				}
			}
		})
	},
	template: `
	<div class="table-responsive-lg">
		<table class="table table-sm table-hover table-bordered table-striped" v-bind:id="tableID" >
			<thead>
				<tr class=" text-left" v-bind:class="trClassObject">
					<th scope="col" >DONOR</th>
					<th scope="col" >MAIL PROFILE</th>
					<th scope="col" >INFOMATION</th>
					<th scope="col" >CONTACT METHOD</th>
					<th scope="col" >CONVERSION PACK</th>
					<th scope="col" v-if="sublist === 'called'">FOLLOWUP1</th>
					<th scope="col" v-if="sublist === 'called'">FOLLOWUP2</th>
				</tr>
			</thead>
			<tbody>
				<result-row v-for="row in rows" v-bind:row="row" v-bind:sublist="sublist"></result-row>
			</tbody>
		</table>
 	</div>
	`,
	components:{
		'result-row': vueRow
	},
});
// ******************************************************************************
let rootVue = new Vue({
	el: '#vue',
	data: {
		raw: {
			rows: null,
			ready: false,
			timestamp: null,
		},
		acqusitionCost: 24610.308,
		acqusitionMailout: 17000,
		lybuntCost: 3234.9975,
		lybuntCostMailout: 3000,
		lybuntCode: '19SEPAQ',
		lybuntNewContacts: 0,
		campaignCode: '19AC.Cure One Acquisition'

	},
	computed:{
		defaultAPI: function(){
			return '/api/campaign/journey_cureone_acquisition' + '?camapgincode=' + this.campaignCode
		},
		totalCampaignValue: function(){
			return new Array(this.raw.rows).reduce((acc, val) => { return acc + val['CAMPAIGN_TOAL'] })
		},
		callingRows: function () {
			return this.raw.rows.filter(row => this.calcSubLists(row) === 'todo')
		},
		calledRows: function () {
			return this.raw.rows.filter(row => this.calcSubLists(row) === 'called')
		},
		excludedRows: function () {
			return this.raw.rows.filter(row => this.calcSubLists(row) === 'excluded')
		},
		doNotMailCount:function(){
			return this.raw.rows.reduce((acc, cur) => {
				acc += cur.DONOTMAIL === -1 ? 1 : 0;
				return acc
			}, 0)
		},
		cfyNewCount:function(){
			return this.raw.rows.reduce((acc, cur) => {
				acc += (cur.IS_ACQUISITION === -1 ) ? 1 : 0;
				return acc
			}, 0)
		},
		totalValue: function(){
			return this.raw.rows.reduce((acc, cur) => {
				acc += cur.CAMPAIGN_TOAL;
				return acc
			}, 0)
		}
	},
	created(){
		this.getData();
	},
	methods:{
		getData: function(){
			fetchJSON(endpoint('/api/tq/source_code1_summary' + '?s1=' + this.lybuntCode), function(json2){
				rootVue.lybuntNewContacts = json2.rows[0].NEW_CONTACTS;
			});
			fetchJSON(endpoint(this.defaultAPI), function(json){
				rootVue.raw.rows = json.rows;
				rootVue.raw.ready = true;
				rootVue.raw.timestamp = new Date(json.timestamp);
			});

		},
		calcSubLists: function(row){
			if (row.ANONYMOUS === -1 || row.DECD === -1 || row.PRIMARYCATEGORY === 'Estate' || row.PLEDGES > 0 || row.DONOTCALL === -1 || row.BOARDED === -2){
				return 'excluded'
			}else if (row['CONVERSIONCALL_BY'] === null || row['CONVERSIONCALL_BY'].trim() === '') {
				return 'todo'
			}else {
				return 'called'
			}
		},
	},
	components:{
		'vue-loader': vueLoader,
		'vue-table': vueTable,
	},
	template:`<vue-loader msg="Finding Donors Responded to Cure One Acqusition Campaign in ThankQ ..." v-if="!raw.ready"></vue-loader><div class="container-fluid" v-else>

	<div class="card shadow-type7">
		<div class="card-header bg-transparent text-center shadow-type8">
			<p class="text-danger font-weight-bold mb-0"><span class="text-primary"><< totalValue|currency >></span> from <span class="text-primary"><< raw.rows.length|number >></span> Cure One Acquisition (campaign) Donors
				<span class="badge badge-success">
				  ACQ <span class="badge badge-light"><< cfyNewCount >></span>
				  <span class="sr-only">new in current financial year</span>
				</span>
				<span class="badge badge-warning">
				  DNM <span class="badge badge-light"><< doNotMailCount >></span>
				  <span class="sr-only">do not mails</span>
				</span>
				<small class="text-muted">as at << raw.timestamp|dtAU >> from thankQ</small>
			</p>

			<p class="mb-0">
				<span class="text-danger"><< acqusitionCost|currency >></span> was spent on <span class="text-danger"><< acqusitionMailout|number >></span> names to acquire <span class="text-success"><< cfyNewCount|number >> New Donors</span>.
				cost per name : <mark><span class="text-danger font-weight-bold"><< (acqusitionCost/cfyNewCount)|currency >></span></mark>, response rate : <mark><span class="text-danger font-weight-bold"><< (cfyNewCount/acqusitionMailout)|pct(2) >></span></mark>
			</p>
			<p>
				<span class="text-danger"><< lybuntCost|currency >></span> was spent on <span class="text-danger"><< lybuntCostMailout|number >></span> names to acquire <span class="text-success"><< lybuntNewContacts|number >> New Donors</span>.
				cost per name : <mark><span class="text-danger font-weight-bold"><< (lybuntCost/lybuntNewContacts)|currency >></span></mark>, response rate : <mark><span class="text-danger font-weight-bold"><< (lybuntNewContacts/lybuntCostMailout)|pct(2) >></span></mark>
			</p>

		</div>

		<div class="card-body">

			<ul class="nav nav-tabs mb-3 nav-fill nav-justified" id="pills-tab" role="tablist">
				<li class="nav-item ">
					<a class="nav-link active" id="todo-tab" data-toggle="pill" href="#todo" role="tab" aria-controls="todo" aria-selected="true">
					 &#9742; Todo <span class="badge badge-pill badge-info"> << callingRows.length >></span>
					</a>
				</li>
				<li class="nav-item ">
					<a class="nav-link" id="called-tab" data-toggle="pill" href="#called" role="tab" aria-controls="called" aria-selected="false">
					 &#128515; Sent <span class="badge badge-pill badge-success"> << calledRows.length >></span>
					</a>
				</li>
				<li class="nav-item ">
					<a class="nav-link" id="excluded-tab" data-toggle="pill" href="#excluded" role="tab" aria-controls="excluded" aria-selected="false">
					 &#128164; Skipped <span class="badge badge-pill badge-warning"> << excludedRows.length >></span>
					</a>
				</li>
			</ul>

			<div class="tab-content" id="pills-tabContent">
				<div class="tab-pane fade show active" id="todo" role="tabpanel" aria-labelledby="todo-tab">
					<vue-table v-bind:rows="callingRows" sublist="todo"></vue-table>
				</div>
				<div class="tab-pane fade" id="called" role="tabpanel" aria-labelledby="called-tab">
					<vue-table v-bind:rows="calledRows" sublist="called"></vue-table>
				</div>
				<div class="tab-pane fade" id="excluded" role="tabpanel" aria-labelledby="excluded-tab">
					<vue-table v-bind:rows="excludedRows" sublist="excluded"></vue-table>
				</div>
			</div>

		</div>

	</div>

	` + '</div>'
});
