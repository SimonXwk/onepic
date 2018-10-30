// ******************************************************************************
let vueRow = Vue.component('vue-row', {
	props: ['row', 'sublist'],
	data: function(){
		return {
			show: true,
		}
	},
	computed: {
	},
	created(){
	},
	methods: {

	},
	template: `<tr v-if="show">
		<td style="width: 25%" class="align-middle">
			<span class="text-primary"><< row.SERIALNUMBER >></span> << row.FULLNAME >>
			<small class="text-success" v-if="row.SOURCE">(<< row.SOURCE >>)</small>
			<small class="text-dark" v-if="row.STATE"><< row.STATE >></small>
		</td>

		<td style="width: 20%" class="align-middle">
			<< row.CAMPAIGN_FIRSTDATE|dAU >>
		</td>

		<td style="width: 20%" class="align-middle">
			<span class="badge badge-success" v-if="row.IS_ACQUISITION===-1">ACQ</span>
			<span class="badge badge-success" v-if="row.CAMPAIGN_LIFESPAN>0">COMBO</span>
			<span class="badge badge-info" v-if="row.SORTKEYREF1">is << row.SORTKEYREFREL2 >></span>
			<span class="badge badge-danger" v-if="row.CONTACTTYPE==='Organisation'">ORG</span>
			<span class="badge badge-danger" v-if="row.PRIMARYCATEGORY==='ESTATE'">ESTATE</span>
			<span class="badge badge-danger" v-if="row.DECD===-1">DECD</span>
			<span class="badge badge-danger" v-if="row.ANONYMOUS===-1">ANON</span>
			<span class="badge badge-danger" v-if="row.DONOTCALL===-1">DNC</span>
		</td>

		<td style="width: 10%" class="align-middle">
			<span class="text-secondary" v-if="row.EMAILADDRESS"><small><< row.EMAILADDRESS >></small></span>
		</td>

		<td style="width: 25%" class="align-middle">
			<small v-if="row.THANKYOUCALL_BY !== null"><mark>&#10004; << row.THANKYOUCALL_BY >>: <span class="text-success"><< row.THANKYOUCALL_SUBJECT >></span></mark></small>
			<small v-else>&#9201; <span class="font-italic text-danger">waiting to be thanked</span></small>
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
				 <th scope="col" style="width: 25%">DONOR</th>
				 <th scope="col" style="width: 20%">FIRST DATE ENGAGEMENT</th>
				 <th scope="col" style="width: 20%">TAGS</th>
				 <th scope="col" style="width: 10%">EMAIL</th>
				 <th scope="col" style="width: 25%">THANKQ COMMUNICATION</th>
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
		rawAPI: '/api/campaign/christmas_appeal',
		rawData: null,
		todoCsvEncodedURI: null,
	},
	methods: {
		calcSubListType: function(row){
			if (  (row['CONTACTTYPE'] === 'Organisation')
					|| (row['DECD'] === -1)
					|| (row['DONOTCALL'] === -1)
					|| (row['ANONYMOUS'] === -1)
					|| (row['PRIMARYCATEGORY'] === 'ESTATE')
				) {
				return 'skip'
			}else {
				if ( !(row['THANKYOUCALL_BY'] === null || row['THANKYOUCALL_BY'].trim() === '') ) {
					return 'done'
				}else {
					return 'todo'
				}
			}
		},
		getSubList: function(subListType){
			return this.rawData.rows.filter(row => this.calcSubListType(row) === subListType)
		},
		getData: function(){
			this.rawData = null;
			fetchJSON(endpoint(this.rawAPI), (json) => {
				this.rawData = json;

				let csvArr = [];
				let csvContent;
				csvArr.push(("data:text/csv;charset=utf-8," + ['SERIALNUMBER', 'STATE'
					, 'MOBILENUMBER', 'DAYTELEPHONE', 'EVENINGTELEPHONE', 'FAXNUMBER', 'EMAILADDRESS'
					, 'COMMENTS'
				].join(",")));
				json.rows
					.filter(row => this.calcSubListType(row) === 'todo')
					.map(d => ["=\"" + d.SERIALNUMBER + "\"" ,
						d.STATE,
						d.MOBILENUMBER,
						d.DAYTELEPHONE,
						d.EVENINGTELEPHONE,
						d.FAXNUMBER,
						d.EMAILADDRESS,
						null])
					.forEach(arr => {
						csvArr.push(arr.join(","));
					});
				csvContent = csvArr.join("\n");
				this.todoCsvEncodedURI = encodeURI(csvContent);

			});
		}
	},
	created(){
		this.getData();
	},
	components:{
		'vue-loader': vueLoader,
		'vue-table': vueTable,
	},
	template: '<vue-loader msg="Finding Christmas Appeal Donor in ThankQ ..." v-if="rawData===null"></vue-loader>' + '<div class="container-fluid" v-else>' +
	`
	<div class="row mb-1">
		<div class="col text-center">
			<p class="lead mb-0"><span class="text-primary font-weight-bold"><< rawData.rows.length | number >></span> Donors Responded to Christmas Campaign (Appeal, Chaser and 19ACTIONUB)</p>
			<small class="text-muted font-italic">Data from thankQ : << rawData.timestamp | dtAU >></small>
		</div>
	</div>

	<a v-bind:href="todoCsvEncodedURI" v-bind:class="{'disabled': todoCsvEncodedURI===null}" class="btn btn-outline-success btn-sm btn-block" role="button" aria-pressed="true" download="christmas_appeal_thank_you_call.csv">TODO CSV</a>

	<div class="row mb-2">
		<div class="col">

			<ul class="nav nav-pills nav-fill nav-justified mb-1 shadow" role="tablist" id="pills-tab">
				<li class="nav-item ">
					<a class="nav-link active" id="todo-tab" data-toggle="pill" href="#todo" aria-controls="todo" role="tab" aria-selected="true">
					 &#128222; ToCall  <span class="badge badge-pill badge-light"><< getSubList('todo').length >></span>
					</a>
				</li>
				<li class="nav-item ">
					<a class="nav-link" id="done-tab" data-toggle="pill" href="#done" aria-controls="done" role="tab" aria-selected="false">
					 &#9742; Called <span class="badge badge-pill badge-light"><< getSubList('done').length >></span>
					</a>
				</li>
				<li class="nav-item ">
					<a class="nav-link" id="skip-tab" data-toggle="pill" href="#skip" aria-controls="skip" role="tab" aria-selected="false">
					 &#9975; Skipped <span class="badge badge-pill badge-light"><< getSubList('skip').length >></span>
					</a>
				</li>
			</ul>

			<div class="tab-content" id="pills-tabContent">
				<div class="tab-pane fade show active" role="tabpanel" id="todo" aria-labelledby="todo-tab">
					<vue-table v-bind:rows="getSubList('todo')" sublist="todo"></vue-table>
				</div>
				<div class="tab-pane fade" role="tabpanel" id="done" aria-labelledby="done-tab">
					<vue-table v-bind:rows="getSubList('done')" sublist="done"></vue-table>
				</div>
				<div class="tab-pane fade" role="tabpanel" id="skip" aria-labelledby="skip-tab">
					<vue-table v-bind:rows="getSubList('skip')" sublist="skip"></vue-table>
				</div>
			</div>

		</div>
	</div>

	` + '</div>'
});
