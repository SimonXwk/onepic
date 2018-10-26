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
				 <th scope="col" style="width: 20%" class="bg-dark"><span class="text-warning text-uppercase"><small class="text-light"><< dim >></small> Static Picture</span></th>
				 <th scope="col" style="width: 10%" class="bg-success">STRICT ACTIVE</th>
				 <th scope="col" style="width: 10%" class="bg-warning text-dark">ONHOLD</th>
				 <th scope="col" style="width: 10%" class="bg-danger">CANCELLED</th>
				 <th scope="col" style="width: 10%" class="bg-primary">CLOSED</th>
				 <th scope="col" style="width: 10%" class="bg-secondary">CLOSED: FINISHED</th>
				 <th scope="col" style="width: 10%" class="bg-info">CLOSED: ACTIVE</th>
				 <th scope="col" style="width: 10%" class="bg-secondary">CLOSED: UNDEFINED</th>
				 <th scope="col" style="width: 10%" class="bg-success">GENERAL ACTIVE</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="tp in category.values">
				<td><< tp >></td>
				<td><< formatAgg(aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'Active'}])) >></td>
				<td><< formatAgg(aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'On Hold'}])) >></td>
				<td><< formatAgg(aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'Written Down'}])) >></td>
				<td><< formatAgg(aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'Closed'}])) >></td>
				<td><< formatAgg(aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'Closed'}, {dim:'FINISHED', value:new Date(), by:'<=', type:'date'}])) >></td>
				<td><< formatAgg(aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'Closed'}, {dim:'FINISHED', value:new Date(), by:'>', type:'date'}])) >></td>
				<td><< formatAgg(aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'Closed'}, {dim:'FINISHED', value:null}])) >></td>
				<td><< formatAgg(aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'Active'}])+aggregate([{dim:category.key, value:tp}, {dim:'PLEDGESTATUS', value:'Closed'}, {dim:'FINISHED', value:new Date(), by:'>', type:'date'}])) >></td>
			</tr>
		</tbody>
		<tfoot>
			<tr class="bg-light text-dark font-weight-bold">
				<th>TOTAL</th>
				<td><< formatAgg(aggregate([{dim:'PLEDGESTATUS', value:'Active'}])) >></td>
				<td><< formatAgg(aggregate([{dim:'PLEDGESTATUS', value:'On Hold'}])) >></td>
				<td><< formatAgg(aggregate([{dim:'PLEDGESTATUS', value:'Written Down'}])) >></td>
				<td><< formatAgg(aggregate([{dim:'PLEDGESTATUS', value:'Closed'}])) >></td>
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
			 <th scope="col" style="width: 23%" class="bg-dark"><span class="text-warning text-uppercase"><< fyMonths.short[fyMth-1] >> MIX</span></th>
			 <th scope="col" style="width: 11%" class="bg-danger">CANCELLED</th>
			 <th scope="col" style="width: 11%" class="bg-warning text-dark">ONHOLDED</th>
			 <th scope="col" style="width: 11%" class="bg-info">CLOSED</th>
			 <th scope="col" style="width: 11%" class="bg-info">FINISHED</th>
			 <th scope="col" style="width: 11%" class="bg-success">ACTIVE: PAID</th>
			 <th scope="col" style="width: 11%" class="bg-success">ACTIVE: NEW</th>
			 <th scope="col" style="width: 11%" class="bg-success">ACTIVE</th>
		</tr>
		</thead>
		<tbody>
			<tr v-for="cat in category.values">
				<td><< cat >></td>
				<td><< filterRows('WRITTENDOWN', 'Written Down', cat).length|number(false) >></td>
				<td><< filterRows('ONHOLDDATETIME', 'On Hold', cat).length|number(false) >></td>
				<td><< filterRows('CLOSED', 'Closed', cat).length|number(false) >></td>
				<td><< filterRows('FINISHED', 'Closed', cat).length|number(false) >></td>
				<td><< (filterRows(false, 'Active', cat).length -  filterRows('STARTDATE', 'Active', cat).length)|number(false) >></td>
				<td><< filterRows('STARTDATE', 'Active', cat).length|number(false) >></td>
				<td><< filterRows(false, 'Active', cat).length|number(false) >></td>
			</tr>
		</tbody>
		<tfoot>
			<tr class="bg-light text-dark font-weight-bold">
				<th>TOTAL</th>
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
				 <th scope="col" style="width: 28%" class="bg-secondary"><span class="text-warning text-uppercase"><< fyMonths.short[fyMth-1] >> FLOW &#128197;</span> PLEDGE</th>
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
				<td><< cat >></td>
				<td><< filterRows('CREATED', false, cat).length|number(false) >></td>
				<td><< filterRows('STARTDATE', false, cat).length|number(false) >></td>
				<td><< filterRows('ONHOLDDATETIME', 'On Hold', cat).length|number(false) >></td>
				<td><< filterRows('WRITTENDOWN', 'Written Down', cat).length|number(false) >></td>
				<td><< filterRows('CLOSED', 'Closed', cat).length|number(false) >></td>
				<td><< filterRows('FINISHED', 'Closed', cat).length|number(false) >></td>
			</tr>
		</tbody>
		<tfoot>
			<tr class="bg-light text-dark font-weight-bold">
				<th>TOTAL</th>
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
		thisFY: $CFY,
		rawHeaderData: null,
		now: new Date(),
		reportRowDim: 'SPONSORSHIP1',
		reportRowDims: ['SPONSORSHIP1', 'SPONSORSHIP2', 'PLEDGESTATUS', 'PLEDGETYPE', 'PLEDGEPLAN', 'LIFESPAN',  'PAYMENTFREQUENCY', 'ACQUISITION_CAMPAIGNCODE', 'ACQUISITION_DETAIL', 'FIRST_SOURCECODE1', 'CREATED_FY', 'START_FY', 'ONHOLD_FY', 'WRITTENDOWN_FY', 'CLOSED_FY', 'FINISHED_FY'],
		mthDataLtd: false,
		colFilter1: 'SPONSORSHIP1',
		colFilter1Value: 'All',
	},
	computed: {
		thisFYMth: function() {
			return (this.now.getMonth() + 1)  +  (this.now.getMonth() < 6 ? 6 : -6)
		},
		filteredHeaderDataRows: function() {
			return this.rawHeaderData.rows.filter(r => {
				 return (this.colFilter1Value === 'All' ? true : r[this.colFilter1] === this.colFilter1Value)
			});
		},
		reportDimRows: function(){
			return {key:this.reportRowDim, values:Array.from(new Set(this.rawHeaderData.rows.map(r => r[this.reportRowDim])))}
		},
		reportFilter1: function(){
			return {key:this.colFilter1, values:  ['All'].concat(Array.from(new Set(this.rawHeaderData.rows.map(r => r[this.colFilter1])))) }
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
				this.rawHeaderData.rows = this.rawHeaderData.rows.filter(r => new Date(r.CREATED) <= this.now)
			});
		},
		filterDataByFyMonth: function(fyMonth) {
			return this.filteredHeaderDataRows.filter(r => {
				let d = new Date(r.CREATED);
				let fym = (d.getMonth() + 1) +  (d.getMonth() < 6 ? 6 : -6);
				return (fym <= fyMonth && r.CREATED_FY === this.thisFY) || (r.CREATED_FY < this.thisFY)
			})
		},



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
					<span class="text-dark font-weight-bold"><< rawHeaderData.rows.length|number >> Pledges<span class="text-info"> created &le; << now|dtAU >></span></span>
					<br><small class="text-secondary font-italic">data captured : << rawHeaderData.timestamp|dtAU >>, cached for << rawHeaderData.cached_timeout|number >> seconds</small>
				</p>
				<P class="font-italic mt-0">Current Focal Month is <span class="text-danger"><< fyMonths.long[thisFYMth-1] >>, FY<< thisFY >></span></P>
			</div>
		</div>

		<div class="row mb-1 mt-1">
			<div class="col-md-2 mr-1">
				<select class="custom-select" v-model="reportRowDim" >
					<option v-for="d in reportRowDims"  v-bind:value="d" >Rows: << d >></option>
				</select>
			</div>
			<div class="col-md-2">
				<select class="custom-select" v-model="mthDataLtd" >
					<option v-bind:value="false">Month on Month</option>
					<option v-bind:value="true">Month Cumulative within FY<< thisFY >></option>
				</select>
			</div>
			<div class="col-md-2">
				<select class="custom-select" v-model="colFilter1Value" >
					<option v-for="f in reportFilter1.values"  v-bind:value="f" >Filter1: << f >></option>
				</select>

			</div>
		</div>

		<div class="row">
			<div class="col-xl-8">
				<ltd-table-static v-bind:fy="thisFY" v-bind:fyMth="thisFYMth" v-bind:rows="filteredHeaderDataRows" v-bind:category="reportDimRows" calc="count" dim="PLEDGEID"></ltd-table-static>
			</div>
			<div class="col-xl-4">
			</div>
		</div>

		<div class="row">
			<div class="col-xl-8">
				<ltd-table-static v-bind:fy="thisFY" v-bind:fyMth="thisFYMth" v-bind:rows="filteredHeaderDataRows" v-bind:category="reportDimRows" calc="sum" dim="INSTALMENTVALUE_PER_DAY"></ltd-table-static>
			</div>
			<div class="col-xl-4">
			</div>
		</div>

		<div class="row" v-for="fym in thisFYMth">
			<div class="col-xl-6">
				<mth-table-flow v-bind:isLtd="mthDataLtd" v-bind:fy="thisFY" v-bind:fyMth="thisFYMth-fym+1" v-bind:rows="filterDataByFyMonth(thisFYMth-fym+1)" v-bind:category="reportDimRows"></mth-table-flow>
			</div>
			<div class="col-xl-6">
				<mth-table-mix v-bind:isLtd="mthDataLtd" v-bind:fy="thisFY" v-bind:fyMth="thisFYMth-fym+1" v-bind:rows="filterDataByFyMonth(thisFYMth-fym+1)" v-bind:category="reportDimRows"></mth-table-mix>
			</div>
		</div>

	</div>`
});
