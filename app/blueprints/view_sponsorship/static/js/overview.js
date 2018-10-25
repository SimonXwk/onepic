let renderCht1 = (thisFY, rows) => { Highcharts.chart('chart1', {
	chart: {
		type: 'waterfall'
	},
	title: {
		text: 'FY' + thisFY + ' Continuous Pledge Number Net Growth Waterfall Diagram'
	},
	xAxis: {
		type: 'category'
	},
	yAxis: {
		title: {
			text: 'Number of pledges'
		}
	},
	legend: {
		enabled: false
	},
	tooltip: {
		pointFormat: '<b>{point.y:,.0f}</b> Pledges'
	},
	series: [{
		name: 'FY' + thisFY + ' Pledges',
		upColor: '#c2ff00',
		color: '#f65a5b',
		data: [
		{
			name: 'FY' + thisFY + ' New',
			y: rows.filter(d => d['PLEDGEPLAN'] === 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] === thisFY ).length
		}, {
			name: 'New Cancelled',
			color: '#f65a5b',
			y: rows.filter(d => d['PLEDGEPLAN'] === 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] === thisFY && d['PLEDGESTATUS'] === 'Written Down' && d['WRITTENDOWN_FY'] === thisFY ).length * (-1)
			},{
			name: 'New On Hold',
			color: '#FFEB3B',
			y: rows.filter(d => d['PLEDGEPLAN'] === 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] === thisFY && d['PLEDGESTATUS'] === 'On Hold' && d['ONHOLD_FY'] === thisFY ).length * (-1)
		}, {
			name: 'Previous Cancelled',
			color: '#f65a5b',
			y: rows.filter(d => d['PLEDGEPLAN'] === 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] < thisFY && d['PLEDGESTATUS'] === 'Written Down' && d['WRITTENDOWN_FY'] === thisFY ).length * (-1)
			},{
			name: 'Previous On Hold',
			color: '#FFEB3B',
			y: rows.filter(d => d['PLEDGEPLAN'] === 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] < thisFY && d['PLEDGESTATUS'] === 'On Hold' && d['ONHOLD_FY'] === thisFY ).length * (-1)
		},{
			name: 'Net Growth',
			isSum: true,
			color: '#d0e6da'
		}],
		dataLabels: {
			enabled: true,
			verticalAlign: 'top',
			useHTML: true,
			formatter: function () {
				return '<span style="color:' + (this.y > 0 ? '#000000' : (this.y === 0 ? '#94938f' : '#ce1126')) + '">' + Highcharts.numberFormat(this.y, 0, ',') + '</span>';
			},
			style: {
				fontWeight: 'bold'
			}
		},
		pointPadding: 0
	}]
});}

let renderCht2 = (thisFY) => { Highcharts.chart('chart2', {
	chart: {
		type: 'waterfall'
	},
	title: {
		text: 'FY' + thisFY + ' Fixed Terms Pledge Number Net Growth Waterfall Diagram'
	},
	xAxis: {
		type: 'category'
	},
	yAxis: {
		title: {
			text: 'Number of pledges'
		}
	},
	legend: {
		enabled: false
	},
	tooltip: {
		pointFormat: '<b>{point.y:,.0f}</b> Pledges',
	},
	series: [{
		name: 'FY' + thisFY + ' Pledges',
		upColor: '#c2ff00',
		color: '#f65a5b',
		data: [
		{
			name: 'FY' + thisFY + ' New',
			y: rows.filter(d => d['PLEDGEPLAN'] !== 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] === thisFY ).length
		}, {
			name: 'New Cancelled',
			color: '#f65a5b',
			y: rows.filter(d => d['PLEDGEPLAN'] !== 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] === thisFY && d['PLEDGESTATUS'] === 'Written Down' && d['WRITTENDOWN_FY'] === thisFY ).length * (-1)
		}, {
			name: 'New Finished',
			color: '#FF9800',
			y: rows.filter(d => d['PLEDGEPLAN'] !== 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] === thisFY && d['PLEDGESTATUS'] === 'Closed' && d['CLOSED_FY'] === thisFY ).length * (-1)
		}, {
			name: 'New On Hold',
			color: '#FFEB3B',
			y: rows.filter(d => d['PLEDGEPLAN'] !== 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] === thisFY && d['PLEDGESTATUS'] === 'On Hold' && d['ONHOLD_FY'] === thisFY ).length * (-1)
		}, {
			name: 'Previous Cancelled',
			color: '#f65a5b',
			y: rows.filter(d => d['PLEDGEPLAN'] !== 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] < thisFY && d['PLEDGESTATUS'] === 'Written Down' && d['WRITTENDOWN_FY'] === thisFY ).length * (-1)
		}, {
			name: 'Previous Finished',
			color: '#FF9800',
			y: rows.filter(d => d['PLEDGEPLAN'] !== 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] < thisFY && d['PLEDGESTATUS'] === 'Closed' && d['CLOSED_FY'] === thisFY ).length * (-1)
		}, {
			name: 'Previous On Hold',
			color: '#FFEB3B',
			y: rows.filter(d => d['PLEDGEPLAN'] !== 'Continuous' && d['CREATED_FY'] <= thisFY && d['START_FY'] < thisFY && d['PLEDGESTATUS'] === 'On Hold' && d['ONHOLD_FY'] === thisFY ).length * (-1)
		},{
			name: 'Net Growth',
			isSum: true,
			color:'#d0e6da'
		}],
		dataLabels: {
			enabled: true,
			verticalAlign: 'top',
			useHTML: true,
			formatter: function () {
				return '<span style="color:' + (this.y > 0 ? '#000000' : (this.y === 0 ? '#94938f' : '#ce1126')) + '">' + Highcharts.numberFormat(this.y, 0, ',') + '</span>';
			},
			style: {
				fontWeight: 'bold'
			}
		},
		pointPadding: 0
	}]
});}


// console.log(thisFY, data);

// const rows = data.rows;
// const cs = crossfilter(rows);
//
// console.log(cs.groupAll().reduceCount().value());
//
// let dimStatus = cs.dimension(d => d['PLEDGESTATUS']);
// let dimFyCreated = cs.dimension(d => d['CREATED_FY'])
// dimStatus.filter('Active')
// console.log(cs.groupAll().reduceCount().value())


let rootVue = new Vue({
	el: '#root',
	data: {
		rawData: null,
		defaultAPI: '/api/tq/pledges',
		thisFY: $CFY,
	},
	computed: {
		dataAPI: function() {
			return endpoint(this.defaultAPI) + '?fy=' + (this.thisFY)
		},
		dataRows: function() {
			if (this.thisFY) {
				return this.rawData.rows.filter(d => d.CREATED_FY <= this.thisFY)
			}else {
				return this.rawData.rows
			}
		},
	},
	methods: {
		getPledgeHeaderData: function(){
			let rootVue = this;
			fetchJSON(this.dataAPI, (json) => {
				rootVue.rawData = json;
				// renderCht1(rootVue.thisFY, json.rows);
				// renderCht2(rootVue.thisFY, json.rows);
			});
		},
	},
	created() {
		// this.rawData = data;
		// this.thisFY = thisFY;
		this.getPledgeHeaderData();
	},
	mounted() {

	},
	components:{
		'vue-loader': vueLoader
	},
	template: `<vue-loader msg="Retrieving Pledge Information from ThankQ ..." v-if="rawData === null"></vue-loader>
	<div class="container-fluid" v-else>
		<div class="row">
			<div class="col-12">

			</div>
		</div>

		<div class="chart " id="chart1" ></div>
		<div class="chart " id="chart2" ></div>



	</div>`
});
