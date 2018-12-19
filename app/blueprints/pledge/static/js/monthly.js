// -----------------------------------------------------------------------------
let vueNowStaticTable = Vue.component('vue-table', {
	props: ['fy', 'fyMth', 'rows', 'category', 'calc', 'dim'],
	data: function() {
		return {
			fyMonths: $FY_MONTH_LIST,
		}
	},
	methods: {
		aggregate: function (criteria){
			// Filter
			let rows = this.rows.filter(r => {
				return criteria.reduce((acc, cri) => {
 					if (cri.by === '<=') {
						if (r[cri.dim] === null){
							return acc && false
						} else {
							return acc && ((cri.type === 'date' ?  new Date(r[cri.dim]) : r[cri.dim]) <= cri.value)
						}
					} else if (cri.by === '>') {
						if (r[cri.dim] === null){
							return acc && false
						} else {
							return acc && ((cri.type === 'date' ?  new Date(r[cri.dim]) :r[cri.dim]) > cri.value)
						}
					} else {
						return acc && (r[cri.dim] === cri.value)
					}
				}, true);
			});
			// Aggregate
			if (this.calc==="count") {
				return Array.from(new Set(rows.map(r => r[this.dim]))).length
			} else if(this.calc==="sum") {
				return rows.reduce((acc, cri) => acc + cri[this.dim], 0)
			}
		},
		formatAgg: function(val) {
			if (val===0) {
				return null
			} else {
				if (this.calc==="count") {
					return isNaN(val) ? val : String((val).toFixed(0)).split("").reverse().join("").replace(/(\d{3}\B)/g, "$1,").split("").reverse().join("")
				} else if(this.calc==="sum") {
					return isNaN(val) ? val : '$ ' + String(val.toFixed(2)).split("").reverse().join("").replace(/(\d{3}\B)/g, "$1,").split("").reverse().join("")
				}
			}
		},
	},
	created(){
		this.category.values = this.category.values.sort((a, b) => a < b );
	},
	template: '<div class="table-responsive-lg">' +
	`<table class="table table-sm table-hover table-bordered text-right" >
		<thead>
			<tr class="table-bordered text-light">
				 <th scope="col" style="width: 19%" class="bg-dark"><span class="text-warning text-uppercase"><small class="text-light"><< dim >></small> Static Status</span></th>
				 <th scope="col" style="width: 9%" class="bg-success">ACTIVE</th>
				 <th scope="col" style="width: 9%" class="bg-warning text-dark">ONHOLD</th>
				 <th scope="col" style="width: 9%" class="bg-danger">CANCELLED</th>
				 <th scope="col" style="width: 9%" class="bg-info">CLOSED</th>
				 <th scope="col" style="width: 9%" class="bg-dark">TOTAL</th>
				 <th scope="col" style="width: 9%" class="bg-info">CLOSED: FINISHED</th>
				 <th scope="col" style="width: 9%" class="bg-info">CLOSED: ACTIVE</th>
				 <th scope="col" style="width: 9%" class="bg-info">CLOSED: UNDEFINED</th>
				 <th scope="col" style="width: 9%" class="bg-success">GENERAL ACTIVE</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="tp in category.values">
				<template v-if="aggregate([{dim:category.key, value:tp}]) !==0 ">
				<td><< tp >></td>
				<td><< formatAgg(aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'Active'}])) >></td>
				<td><< formatAgg(aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'On Hold'}])) >></td>
				<td><< formatAgg(aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'Written Down'}])) >></td>
				<td><< formatAgg(aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'Closed'}])) >></td>
				<td class="bg-light text-primary font-weight-bold"><< formatAgg(
					aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'Active'}]) +
					aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'On Hold'}]) +
					aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'Written Down'}]) +
					aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'Closed'}])
				) >></td>
				<td><< formatAgg(aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'Closed'}, {dim:'FINISHED', value:new Date(), by:'<=', type:'date'}])) >></td>
				<td><< formatAgg(aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'Closed'}, {dim:'FINISHED', value:new Date(), by:'>', type:'date'}])) >></td>
				<td><< formatAgg(aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'Closed'}, {dim:'FINISHED', value:null}])) >></td>
				<td><< formatAgg(aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'Active'}])+aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'Closed'}, {dim:'FINISHED', value:new Date(), by:'>', type:'date'}])) >></td>
				</template>
			</tr>
		</tbody>
		<tfoot>
			<tr class="bg-light text-dark font-weight-bold">
				<th class="font-italic">TOTAL</th>
				<td><< formatAgg(aggregate([{dim:'PLEDGESTATUS', value:'Active'}])) >></td>
				<td><< formatAgg(aggregate([{dim:'PLEDGESTATUS', value:'On Hold'}])) >></td>
				<td><< formatAgg(aggregate([{dim:'PLEDGESTATUS', value:'Written Down'}])) >></td>
				<td><< formatAgg(aggregate([{dim:'PLEDGESTATUS', value:'Closed'}])) >></td>
				<td><< formatAgg(
					aggregate([{dim:'PLEDGESTATUS', value:'Active'}]) +
					aggregate([{dim:'PLEDGESTATUS', value:'On Hold'}]) +
					aggregate([{dim:'PLEDGESTATUS', value:'Written Down'}]) +
					aggregate([{dim:'PLEDGESTATUS', value:'Closed'}])
				) >></td>
				<td><< formatAgg(aggregate([{dim:'PLEDGESTATUS', value:'Closed'}, {dim:'FINISHED', value:new Date(), by:'<=', type:'date'}])) >></td>
				<td><< formatAgg(aggregate([{dim:'PLEDGESTATUS', value:'Closed'}, {dim:'FINISHED', value:new Date(), by:'>', type:'date'}])) >></td>
				<td><< formatAgg(aggregate([{dim:'PLEDGESTATUS', value:'Closed'}, {dim:'FINISHED', value:null}])) >></td>
				<td><< formatAgg(aggregate([{dim:'PLEDGESTATUS', value:'Active'}])+aggregate([{dim:'PLEDGESTATUS', value:'Closed'}, {dim:'FINISHED', value:new Date(), by:'>', type:'date'}])) >></td>
		</tfoot>
	</table>
	` + '</div>'
});
// -----------------------------------------------------------------------------
let vueMthMixTable = Vue.component('vue-table', {
	props: ['isLtd', 'fy', 'fyMth', 'rows', 'category'],
	data: function() {
		return {
			fyMonths: $FY_MONTH_LIST
		}
	},
	methods: {
		calcFYMth: function(d) {
			return (d.getMonth() + 1) + (d.getMonth() < 6 ? 6 : -6)
		},
		calcFY: function(d) {
			return (d.getFullYear()) + (d.getMonth() < 6 ? 0 : 1)
		},
		filterRows: function(dateDim, status, cate){
			let rows = this.rows.filter(r =>
				(r[dateDim] !== null)
				&& (status ? (r.PLEDGESTATUS === status) : true)
				&& (cate ? (r[this.category.key] === cate) : true)
				&& (dateDim ? (this.calcFY(new Date(r[dateDim])) === this.fy) : true)
			);
			if (this.isLtd) {
				return rows.filter(r => (dateDim ? this.calcFYMth(new Date(r[dateDim])) <= this.fyMth : true))
			}else {
				return rows.filter(r => (dateDim ? this.calcFYMth(new Date(r[dateDim])) === this.fyMth : true))
			}
		},
	},
	created(){
		this.category.values = this.category.values.sort((a, b) => a < b );
	},
	template: '<div class="table-responsive-lg">' +
	`<table class="table table-sm table-hover table-bordered text-right" >
		<thead>
		<tr class="table-bordered bg-secondary text-light">
			 <th scope="col" style="width: 23%" class="bg-dark"><span class="text-warning text-uppercase"><< fyMonths.short[fyMth-1] >> REPORT</span></th>
			 <th scope="col" style="width: 11%" class="bg-danger">CANCELLED</th>
			 <th scope="col" style="width: 11%" class="bg-warning text-dark">ONHOLDED</th>
			 <th scope="col" style="width: 11%" class="bg-info">CLOSED</th>
			 <th scope="col" style="width: 11%" class="bg-info">FINISHED</th>
			 <th scope="col" style="width: 11%" class="bg-success">PAID</th>
			 <th scope="col" style="width: 11%" class="bg-success">NEW</th>
			 <th scope="col" style="width: 11%" class="bg-success">ACTIVE</th>
		</tr>
		</thead>
		<tbody>
			<tr v-for="cat in category.values">
				<template v-if="filterRows('WRITTENDOWN', 'Written Down', cat).length !==0
				|| filterRows('ONHOLDDATETIME', 'On Hold', cat).length !==0
				|| filterRows('CLOSED', 'Closed', cat).length !==0
				|| filterRows('FINISHED', 'Closed', cat).length !==0
				|| (filterRows(false, 'Active', cat).length -  filterRows('STARTDATE', 'Active', cat).length) !==0
				|| filterRows('STARTDATE', 'Active', cat).length !==0
				|| filterRows(false, 'Active', cat).length !==0
				">
				<td><< cat >></td>
				<td><< filterRows('WRITTENDOWN', 'Written Down', cat).length|number(false) >></td>
				<td><< filterRows('ONHOLDDATETIME', 'On Hold', cat).length|number(false) >></td>
				<td><< filterRows('CLOSED', 'Closed', cat).length|number(false) >></td>
				<td><< filterRows('FINISHED', 'Closed', cat).length|number(false) >></td>
				<td><< (filterRows(false, 'Active', cat).length -  filterRows('STARTDATE', 'Active', cat).length)|number(false) >></td>
				<td><< filterRows('STARTDATE', 'Active', cat).length|number(false) >></td>
				<td><< filterRows(false, 'Active', cat).length|number(false) >></td>
				</template>
			</tr>
		</tbody>
		<tfoot>
			<tr class="bg-light text-dark font-weight-bold">
				<th class="font-italic">TOTAL</th>
				<td><< filterRows('WRITTENDOWN', 'Written Down', false).length|number(false) >></td>
				<td><< filterRows('ONHOLDDATETIME', 'On Hold', false).length|number(false) >></td>
				<td><< filterRows('CLOSED', 'Closed', false).length|number(false) >></td>
				<td><< filterRows('FINISHED', 'Closed', false).length|number(false) >></td>
				<td><< (filterRows(false, 'Active', false).length -  filterRows('STARTDATE', 'Active', false).length)|number(false) >></td>
				<td><< filterRows('STARTDATE', 'Active', false).length|number(false) >></td>
				<td><< filterRows(false, 'Active', false).length|number(false) >></td>
			</tr>
		</tfoot>
	</table>
	` + '</div>'
});
// -----------------------------------------------------------------------------
let vueMthMovementTable = Vue.component('vue-table', {
	props: ['isLtd', 'fy', 'fyMth', 'rows', 'category'],
	data: function() {
		return {
			fyMonths: $FY_MONTH_LIST
		}
	},
	methods: {
		calcFYMth: function(d) {
			return (d.getMonth() + 1) + (d.getMonth() < 6 ? 6 : -6)
		},
		calcFY: function(d) {
			return (d.getFullYear()) + (d.getMonth() < 6 ? 0 : 1)
		},
		filterRows: function(dateDim, status, cate){
			let rows = this.rows.filter(r =>
				(r[dateDim] !== null)
				&& (new Date(r[dateDim]) <= new Date())
				&& (status ? (r.PLEDGESTATUS === status) : true)
				&& (cate ? (r[this.category.key] === cate) : true)
				&& this.calcFY(new Date(r[dateDim])) === this.fy
			);
			if (this.isLtd) {
				return rows.filter(r => this.calcFYMth(new Date(r[dateDim])) <= this.fyMth )
			}else {
				return rows.filter(r => this.calcFYMth(new Date(r[dateDim])) === this.fyMth )
			}
		},
	},
	created(){
		this.category.values = this.category.values.sort((a, b) => a < b );
	},
	template: '<div class="table-responsive-lg">' +
	`<table class="table table-sm table-hover table-bordered text-right" >
		<thead>
			<tr class="table-bordered bg-secondary text-light">
				 <th scope="col" style="width: 28%" class="bg-secondary"><span class="text-warning text-uppercase"><< fyMonths.short[fyMth-1] >> FLOW </span></th>
				 <th scope="col" style="width: 12%" class="bg-success">CREATED</th>
				 <th scope="col" style="width: 12%" class="bg-success">STARTED</th>
				 <th scope="col" style="width: 12%" class="bg-warning text-dark">ONHOLDED</th>
				 <th scope="col" style="width: 12%" class="bg-danger">CANCELLED</th>
				 <th scope="col" style="width: 12%" class="bg-info">CLOSED</th>
				 <th scope="col" style="width: 12%" class="bg-info">FINISHED</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="cat in category.values">
			<template v-if="filterRows('CREATED', false, cat).length !==0
			|| filterRows('STARTDATE', false, cat).length !==0
			|| filterRows('ONHOLDDATETIME', 'On Hold', cat).length !==0
			|| filterRows('WRITTENDOWN', 'Written Down', cat).length !==0
			|| filterRows('CLOSED', 'Closed', cat).length !==0
			|| filterRows('FINISHED', 'Closed', cat).length !==0
			">
				<td><< cat >></td>
				<td><< filterRows('CREATED', false, cat).length|number(false) >></td>
				<td><< filterRows('STARTDATE', false, cat).length|number(false) >></td>
				<td><< filterRows('ONHOLDDATETIME', 'On Hold', cat).length|number(false) >></td>
				<td><< filterRows('WRITTENDOWN', 'Written Down', cat).length|number(false) >></td>
				<td><< filterRows('CLOSED', 'Closed', cat).length|number(false) >></td>
				<td><< filterRows('FINISHED', 'Closed', cat).length|number(false) >></td>
			</template>
			</tr>
		</tbody>
		<tfoot>
			<tr class="bg-light text-dark font-weight-bold">
				<th class="font-italic">TOTAL</th>
				<td><< filterRows('CREATED', false, false).length|number(false) >></td>
				<td><< filterRows('STARTDATE', false, false).length|number(false) >></td>
				<td><< filterRows('ONHOLDDATETIME', 'On Hold', false).length|number(false) >></td>
				<td><< filterRows('WRITTENDOWN', 'Written Down', false).length|number(false) >></td>
				<td><< filterRows('CLOSED', 'Closed', false).length|number(false) >></td>
				<td><< filterRows('FINISHED', 'Closed', false).length|number(false) >></td>
			</tr>
		</tfoot>
	</table>
	` + '</div>'
});
// -----------------------------------------------------------------------------
let rootVue = new Vue({
	el: '#root',
	data: {
		defaultHeaderAPI: '/api/tq/pledges',
		fyMonths: $FY_MONTH_LIST,
		cfy: $CFY,
		thisFY: $CFY,
		rawHeaderData: null,
		now: new Date(),
		reportRowDim: 'SPONSORSHIP1',
		reportRowDims: ['SPONSORSHIP1', 'SPONSORSHIP2', 'PLEDGESTATUS', 'PLEDGETYPE', 'PLEDGEPLAN', 'LIFESPAN',  'PAYMENTFREQUENCY', 'ACQUISITION_CAMPAIGNCODE', 'ACQUISITION_DETAIL', 'FIRST_SOURCECODE1', 'CREATED_FY', 'START_FY', 'ONHOLD_FY', 'WRITTENDOWN_FY', 'CLOSED_FY', 'FINISHED_FY'],
		mthDataLtd: false,
		colFilter1: 'SPONSORSHIP1',
		colFilter1Value: 'All',
		colFilter2: 'SPONSORSHIP2',
		colFilter2Value: 'All',
		colFilter3: 'ACQUISITION_CAMPAIGNCODE',
		colFilter3Value: 'All',
		colFilter4: 'ACQUISITION_DETAIL',
		colFilter4Value: 'All',
	},
	computed: {
		thisFYMth: function() {
			return (this.now.getMonth() + 1)  +  (this.now.getMonth() < 6 ? 6 : -6)
		},
		filteredHeaderDataRows: function() {
			return this.rawHeaderData.rows.filter(r => {
				 return (this.colFilter1Value === 'All' ? true : r[this.colFilter1] === this.colFilter1Value)
				 	&& (this.colFilter2Value === 'All' ? true : r[this.colFilter2] === this.colFilter2Value)
					&& (this.colFilter3Value === 'All' ? true : r[this.colFilter3] === this.colFilter3Value)
			});
		},
		reportDimRows: function(){
			return {key:this.reportRowDim, values:Array.from(new Set(this.rawHeaderData.rows.map(r => r[this.reportRowDim])))}
		},
	},
	watch: {
		thisFY : function(newVal, oldVal) {
			this.getPledgeHeaderData();
		},
	},
	methods: {
		getPledgeHeaderData: function() {
			this.rawHeaderData = null;
			fetchJSON(endpoint(this.defaultHeaderAPI) + '?fy=' + (this.thisFY), (json) => {
				this.rawHeaderData = json;
				this.rawHeaderData.rows = this.rawHeaderData.rows.filter(r => {
					return new Date(r.CREATED) <= this.now
				})
			});
		},
		filterDataByFyMonth: function(fyMonth) {
			return this.filteredHeaderDataRows.filter(r => {
				let d = new Date(r.CREATED);
				let fym = (d.getMonth() + 1) +  (d.getMonth() < 6 ? 6 : -6);
				return (fym <= fyMonth && r.CREATED_FY === this.thisFY) || (r.CREATED_FY < this.thisFY)
			})
		},
		getFilterValueList: function(filterDim) {
			return ['All'].concat(Array.from(new Set(this.rawHeaderData.rows.map(r => r[filterDim]))))
		}
	},
	created() {
		this.getPledgeHeaderData();
	},
	components:{
		'vue-loader': vueLoader,
		'mth-table-flow': vueMthMovementTable,
		'mth-table-mix': vueMthMixTable,
		'ltd-table-static': vueNowStaticTable
	},
	template: `<vue-loader msg="Retrieving Pledge Information from ThankQ ..." v-if="rawHeaderData === null"></vue-loader>
	<div class="container-fluid" v-else>
		<div class="row">
			<div class="col-12">
				<p class="lead mb-0">
					<span class="text-dark font-weight-bold"><< rawHeaderData.rows.length|number >> Pledges<span class="text-info"> created &le; <span v-if="thisFY===cfy"><< now|dtAU >></span><span v-else>FY<< thisFY >></span></span></span>
					<br><small class="text-secondary font-italic">data captured : << rawHeaderData.timestamp|dtAU >>, cached for << rawHeaderData.cached_timeout|number >> seconds</small>
				</p>
				<P class="font-italic mt-0">Current Focal Month is
					<span class="text-danger" v-if="thisFY===cfy"><< fyMonths.long[thisFYMth-1] >>, FY<< thisFY >></span>
					<span class="text-danger" v-else>FY<< thisFY >> (no focal month)</span>
				</P>
			</div>
		</div>

		<div class="row mb-1 mt-1">
			<div class="col-md-1 mr-0">
				<select class="custom-select" v-model="thisFY" >
					<option v-for="y in 6"  v-bind:value="cfy-y+1" >FY<< cfy-y+1 >></option>
				</select>
			</div>
			<div class="col-md-1 mr-0">
				<select class="custom-select" v-model="mthDataLtd" >
					<option v-bind:value="false">MoM</option>
					<option v-bind:value="true">CUMUL</option>
				</select>
			</div>
			<div class="col-md-2 mr-0">
				<select class="custom-select" v-model="reportRowDim" >
					<option v-for="d in reportRowDims"  v-bind:value="d" >Rows: << d >></option>
				</select>
			</div>
			<div class="col-md-2 mr-0">
				<select class="custom-select" v-model="colFilter1Value" >
					<option v-for="f in getFilterValueList(colFilter1)"  v-bind:value="f" >Filter << colFilter1 >>: << f >></option>
				</select>
			</div>
			<div class="col-md-2 mr-0">
				<select class="custom-select" v-model="colFilter2Value" >
					<option v-for="f in getFilterValueList(colFilter2)"  v-bind:value="f" >Filter << colFilter2 >>: << f >></option>
				</select>
			</div>
			<div class="col-md-2 mr-0">
				<select class="custom-select" v-model="colFilter3Value" >
					<option v-for="f in getFilterValueList(colFilter3)"  v-bind:value="f" >Filter << colFilter3 >>: << f >></option>
				</select>
			</div>
			<div class="col-md-2 mr-0">
				<select class="custom-select" v-model="colFilter4Value" >
					<option v-for="f in getFilterValueList(colFilter4)"  v-bind:value="f" >Filter << colFilter4 >>: << f >></option>
				</select>
			</div>
		</div>

		<div class="row">
			<div class="col-xl-12">
				<ltd-table-static v-bind:fy="thisFY" v-bind:fyMth="thisFYMth" v-bind:rows="filteredHeaderDataRows" v-bind:category="reportDimRows" calc="count" dim="PLEDGEID"></ltd-table-static>
			</div>
		</div>

		<!--
		<div class="row">
			<div class="col-xl-10">
				<ltd-table-static v-bind:fy="thisFY" v-bind:fyMth="thisFYMth" v-bind:rows="filteredHeaderDataRows" v-bind:category="reportDimRows" calc="sum" dim="INSTALMENTVALUE_PER_DAY"></ltd-table-static>
			</div>
			<div class="col-xl-2">
			</div>
		</div>
		-->

		<template v-if="thisFY===cfy">
			<div class="row" v-for="fym in thisFYMth">
				<div class="col-xl-6">
					<mth-table-flow v-bind:isLtd="mthDataLtd" v-bind:fy="thisFY" v-bind:fyMth="thisFYMth-fym+1" v-bind:rows="filterDataByFyMonth(thisFYMth-fym+1)" v-bind:category="reportDimRows"></mth-table-flow>
				</div>
				<div class="col-xl-6">
					<mth-table-mix v-bind:isLtd="mthDataLtd" v-bind:fy="thisFY" v-bind:fyMth="thisFYMth-fym+1" v-bind:rows="filterDataByFyMonth(thisFYMth-fym+1)" v-bind:category="reportDimRows"></mth-table-mix>
				</div>
			</div>
		</template>
		<template v-else>
			<div class="row" v-for="fym in 12">
				<div class="col-xl-6">
					<mth-table-flow v-bind:isLtd="mthDataLtd" v-bind:fy="thisFY" v-bind:fyMth="12-fym+1" v-bind:rows="filterDataByFyMonth(12-fym+1)" v-bind:category="reportDimRows"></mth-table-flow>
				</div>
				<div class="col-xl-6">
					<mth-table-mix v-bind:isLtd="mthDataLtd" v-bind:fy="thisFY" v-bind:fyMth="12-fym+1" v-bind:rows="filterDataByFyMonth(12-fym+1)" v-bind:category="reportDimRows"></mth-table-mix>
				</div>
			</div>
		</template>

	</div>`
});
