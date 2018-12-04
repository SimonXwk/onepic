// ******************************************************************************
let vueRow = Vue.component('vue-row', {
	props: ['row', 'sublist'],
	data: function(){
		return {
			show: true,
		}
	},

	created(){
	},
	methods: {

	},
	template: `<tr v-if="show">
	<td style="width: 25%" class="align-middle">
		<mark class="font-weight-bold"><< row.FULLNAME >></mark>
		<small class="text-success font-italic" v-if="row.SOURCE">(<< row.SOURCE >>)</small>
		<small class=d-block>
			<span class="badge badge-dark"><< row.SERIALNUMBER >></span>
			<span class="badge badge-info" v-if="row.SORTKEYREF1">[is << row.SORTKEYREFREL2 >>]</span>
			<span class="badge badge-success" v-if="row.IS_ACQUISITION===-1">[ACQ]</span>
			<span class="badge badge-secondary" v-if="row.FIRSTFY===row.CFY">[NEW]</span>
			<span class="badge badge-secondary" v-if="row.CAMPAIGN_MIN>=300||row.CAMPAIGN_MAX>=300">[$300]</span>
			<span class="badge badge-danger" v-if="row.CONTACTTYPE==='Organisation'">[ORG]</span>
			<span class="badge badge-danger" v-if="row.PRIMARYCATEGORY==='ESTATE'">[ESTATE]</span>
			<span class="badge badge-danger" v-if="row.DECD===-1">[DECD]</span>
			<span class="badge badge-danger" v-if="row.ANONYMOUS===-1">[ANON]</span>
			<span class="badge badge-danger" v-if="row.DONOTCALL===-1">[DNC]</span>
			<span class="badge badge-danger text-warning" v-if="!row.MOBILENUMBER && !row.DAYTELEPHONE && !row.EVENINGTELEPHONE">[!PHONE]</span>
			<span class="badge badge-warning" v-if="row.DONOTMAIL===-1">[DNM]</span>
		<small>
	</td>

	<td style="width: 5%" class="align-middle">
		<< row.STATE >>
	</td>

	<td style="width: 35%" class="align-middle">
		Engaging Period : <span class="text-success"><< row.CAMPAIGN_FIRSTDATE|dAU >><span class="text-primary" v-if="row.CAMPAIGN_FIRSTDATE!==row.CAMPAIGN_LASTDATE"> - << row.CAMPAIGN_LASTDATE|dAU >></span></span>
		<small class="d-block">
			<span class="badge badge-light" v-if="row.CAMPAIGN_PAYMENTS===1">1 Gift</span><span class="badge badge-primary" v-else><< row.CAMPAIGN_PAYMENTS >> Gifts</span>
			<span class="badge badge-light">All Gifts Total: << row.CAMPAIGN_TOAL|currency >></span>
			<span class="badge badge-light" v-if="row.CAMPAIGN_MIN<300">Min Gift: << row.CAMPAIGN_MIN|currency >></span><span class="badge badge-primary" v-else>Min Gift: << row.CAMPAIGN_MIN|currency >></span>
			<span class="badge badge-light" v-if="row.CAMPAIGN_MAX<300">Max Gift: << row.CAMPAIGN_MAX|currency >></span><span class="badge badge-primary" v-else>Max Gift: << row.CAMPAIGN_MAX|currency >></span>
		<small>
	</td>


	<td style="width: 15%" class="align-middle">
		<small class="d-block">
			<span class="badge badge-success" v-if="row.MOBILENUMBER">MOB.</span><span class="badge badge-light" v-else>MOB,</span>
			<span class="badge badge-success" v-if="row.DAYTELEPHONE">DAY.</span><span class="badge badge-light" v-else>DAY,</span>
			<span class="badge badge-success" v-if="row.EVENINGTELEPHONE">EVE.</span><span class="badge badge-light" v-else>EVE,</span>
			<span class="badge badge-success" v-if="row.EMAILADDRESS">EMAIL.</span><span class="badge badge-light" v-else>EMAIL,</span>
		</small>
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
	computed:{
		tableID: function(){
			return this.sublist + '-donor-list'
		},
	},
	mounted(){
		applyDataTable(this.tableID, "sit");
	},
	components:{
		'result-row': vueRow
	},
	template: '<div class="table-responsive-lg">' +
	`<table class="table table-sm table-hover table-bordered" v-bind:id="tableID">
		<thead>
			<tr class="table-bordered bg-primary text-light">
				 <th scope="col" style="width: 20%">DONOR</th>
				 <th scope="col" style="width: 5%">STATE</th>
				 <th scope="col" style="width: 20%">FINANCIAL ENGAGEMENT</th>
				 <th scope="col" style="width: 15%">CONTACT METHODS</th>
				 <th scope="col" style="width: 25%">THANK YOU CALL</th>
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
		csvContentHeader: "data:text/csv;charset=utf-8,",
		xlsContentHeader: "data:application/vnd.ms-excel;base64,"
	},
	computed:{
		fullData: function(){
			if (!this.rawData) {
				return null
			} else {
				let dt = new Date();
				return {
					header: ['SERIALNUMBER'
						, 'TYPE', 'CATEGORY', 'SUBJECT', 'DATEOFCOMMUNICATION', 'COMMUNICATION_BY','COMMENTS'
						,'GENDER','STATE','TITLE','FIRSTNAME','OTHERINITIAL','LASTNAME'
						,'GIFTS','TOTAL'
						,'MOBILENUMBER','DAYTELEPHONE','EVENINGTELEPHONE'
						],
					data: this.rawData.rows
								.map(d => ["=\"" + d.SERIALNUMBER + "\"" ,
								'Phone Call', 'Thank You', 'Dec 2018 Thank you (TF)',
								dt.getDate() +'/'+(dt.getMonth()+1)+'/'+dt.getFullYear(),
								d.THANKYOUCALL_BY,d.THANKYOUCALL_NOTES,
								d.GENDER,d.STATE,d.TITLE,d.FIRSTNAME,d.OTHERINITIAL,d.KEYNAME,
								d.CAMPAIGN_PAYMENTS,d.CAMPAIGN_TOAL,
								d.MOBILENUMBER,d.DAYTELEPHONE,d.EVENINGTELEPHONE
							])
				}
			}
		},
		todoData: function(){
			if (!this.rawData) {
				return null
			} else {
				let dt = new Date();
				return {
					header: ['SERIALNUMBER'
						, 'TYPE', 'CATEGORY', 'SUBJECT', 'DATEOFCOMMUNICATION', 'COMMENTS'
						,'GENDER','STATE','TITLE','FIRST_NAME','OTHER_INITIAL','LAST_NAME'
						,'GIFTS','TOTAL'
						,'MOBILENUMBER','DAYTELEPHONE','EVENINGTELEPHONE'
						],
					data: this.rawData.rows
								.filter(row => this.calcSubListType(row) === 'todo')
								.map(d => ["=\"" + d.SERIALNUMBER + "\"" ,
								'Phone Call', 'Thank You', 'Dec 2018 Thank you (TF)',
								dt.getDate() +'/'+(dt.getMonth()+1)+'/'+dt.getFullYear(),
								null,
								d.GENDER,d.STATE,d.TITLE,d.FIRSTNAME,d.OTHERINITIAL,d.KEYNAME,
								d.CAMPAIGN_PAYMENTS,d.CAMPAIGN_TOAL,
								d.MOBILENUMBER,d.DAYTELEPHONE,d.EVENINGTELEPHONE
							])

				}
			}
		},
	},
	methods: {
		calcSubListType: function(row){
			if (  (row['CONTACTTYPE'] === 'Organisation')
					|| (row['DECD'] === -1)
					|| (row['DONOTCALL'] === -1)
					|| (row['ANONYMOUS'] === -1)
					|| (row['PRIMARYCATEGORY'] === 'ESTATE')
					|| (row['CAMPAIGN_MIN'] >= 300)
					|| (row['CAMPAIGN_MAX'] >= 300)
					|| (!row['MOBILENUMBER']&&!row['DAYTELEPHONE']&&!row['EVENINGTELEPHONE'])
					|| (row.FIRSTFY===row.CFY)
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
			});
		},
		convertToCsvEncodedURI: function(dataSet) {
			if (!dataSet) {
				return null
			} else {
				let csvArr = [this.csvContentHeader + dataSet.header.join(",")];
				dataSet.data.forEach(r => csvArr.push(r.join(",")));
				return encodeURI(csvArr.join("\n"))
			}
		},
		convertToExcelEncodedURI: function(dataSet) {
			if (!dataSet) {
				return null
			} else {
				tableTemplate = '<table><tr>';
				dataSet.header.forEach(col => {
					tableTemplate += '<th>' + col + '</th>'
				});
				tableTemplate += '</tr>'
				dataSet.data.forEach(r => {
						tableTemplate += '<tr>';
						r.forEach(col => {
							tableTemplate += '<td>' + (col ? col : '') + '</td>';
						});
						tableTemplate += '</tr>';
					});
					tableTemplate += '</table>'
				return this.xlsContentHeader + window.btoa(unescape(encodeURIComponent(this.createXMLTemplate(tableTemplate))))
			}
		},
		createXMLTemplate: function(tableHTML){
			return `
			<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
				<head><!--[if gte mso 9]>
					<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
						<x:ExcelWorkbook>
							<x:ExcelWorksheets>
								<x:ExcelWorksheet>
									<x:Name></x:Name>
									<x:WorksheetOptions>
										<x:DisplayGridlines/>
									</x:WorksheetOptions>
								</x:ExcelWorksheet>
							</x:ExcelWorksheets>
						</x:ExcelWorkbook>
					</xml><![endif]-->
				</head>
					<body>
					` + tableHTML +
				`
					</body>
				</html>`
		},
	},
	created(){
		this.getData();
	},
	components:{
		'vue-loader': vueLoader,
		'vue-table': vueTable,
	},
	template: '<vue-loader msg="Finding Christmas Donors in ThankQ ..." v-if="rawData===null"></vue-loader>' + '<div class="container-fluid" v-else>' +
	`
	<div class="row mb-1 mt-0">

		<div class="col-md-6 align-middle">
			<p class="lead my-0"><span class="text-primary font-weight-bold"><< rawData.rows.length | number >></span> Donors Responded to Christmas Campaign Financially</p>
			<p class="lead my-0"><small>(<span class="text-danger">19DV.Christmas Appeal</span>, <span class="text-danger">19DV.Christmas Chaser</span>, <span class="text-danger">19DEC2A, 19DEC3A</span> and <span class="text-danger">19ACTIONUB</span>)<small></p>
			<small class="d-block text-muted font-italic mt-1">Data from thankQ : << rawData.timestamp | dtAU >></small>
		</div>

		<div class="col-md-6">
			<div class="card-group m-0">
				<div class="card">
					<div class="card-body">
						<h5 class="card-title d-inline-block">Exporting Full Data : </h5>
						<a class="btn btn-outline-success btn-sm d-inline-block" role="button" aria-pressed="true" v-bind:class="{'disabled': fullData===null}" v-bind:href="convertToCsvEncodedURI(fullData)" download="christmas_appeal_full_data.csv">CSV</a>
					</div>
				</div>
				<div class="card">
					<div class="card-body">
						<h5 class="card-title d-inline-block">Exporting Todo Data : </h5>
						<a class="btn btn-outline-success btn-sm d-inline-block" role="button" aria-pressed="true" v-bind:class="{'disabled': todoData===null}" v-bind:href="convertToCsvEncodedURI(todoData)" download="christmas_appeal_thank_you_call.csv">CSV</a>
						<a class="btn btn-outline-success btn-sm d-inline-block" role="button" aria-pressed="true" v-bind:class="{'disabled': todoData===null}" v-bind:href="convertToExcelEncodedURI(todoData)" download="christmas_appeal_thank_you_call.xls">XLS</a>
					</div>
				</div>
			</div>
		</div>

	</div>

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
