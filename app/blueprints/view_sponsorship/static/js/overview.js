console.log(thisFY);
console.log(data);
const rows = data.rows;


// const cs = crossfilter(rows);
//
// console.log(cs.groupAll().reduceCount().value());
//
// let dimStatus = cs.dimension(d => d['PLEDGESTATUS']);
// let dimFyCreated = cs.dimension(d => d['CREATED_FY'])
// dimStatus.filter('Active')
// console.log(cs.groupAll().reduceCount().value())


Highcharts.chart('chart1', {
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
});

let chart2 = Highcharts.chart('chart2', {
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
});


new Highcharts.chart({
	responsive: {
		rules: [{
			condition: {
				minWidth: 320
			},
		}]
	},
	chart: {
		renderTo: 'flow1',
		events: {
			load: function () {
				// Draw the flow chart
				let ren = this.renderer;
				let arrowRight = (len=100, arrowProjectX=5, arrowProjectY=5) => ['M', 0, 0, 'L', len, 0, 'L', len-arrowProjectX, 0+arrowProjectY, 'M', len, 0, 'L', len-arrowProjectX, 0-arrowProjectY];
				let arrowLeft = (len=100, arrowProjectX=5, arrowProjectY=5) => ['M', len, 0, 'L', 0, 0, 'L', arrowProjectX, 0 + arrowProjectY, 'M', 0, 0, 'L', arrowProjectX, 0 - arrowProjectY];
				let verticalSeparator = (offsetX, offsetY=40, length=290, color='#d7d7d8') => ren.path(['M', offsetX, offsetY, 'L', offsetX, offsetY+length])
					.attr({
						'stroke-width': 2,
						stroke: color,
						dashstyle: 'dash'
					}).add();
				let verticalHeader = (text, x, y) => ren.label(text, x, y).css({fontWeight: 'bold'}).add();

				verticalSeparator(135);
				verticalSeparator(340);
				verticalSeparator(550);

				verticalHeader('Before Create', 20, 40);
				verticalHeader('Active', 210, 40);
				verticalHeader('On Hold', 420, 40);
				verticalHeader('Exit', 600, 40);

				// Active Status
				ren.label('Processed<br/>at least ONE<br/>Instalment', 10, 150, 'circle')
						.attr({
								fill: '#279b37',
								stroke: 'white',
								'stroke-width': 2,
								padding: 5,
								r: 0,
						})
						.css({
								color: 'white'
						})
						.add()
						.shadow(true);
				ren.path(arrowRight(75))
						.attr({
								'stroke-width': 2,
								stroke: '#279b37'
						})
						.translate(98, 175)
						.add();
				ren.label('Create Pledge', 98, 155)
						.css({
								fontSize: '10px',
								color: '#279b37'
						})
						.add();

				ren.label('Pledge (New)<br/>Instalments added<br/>Start Date<br/>End Date', 180, 145)
						.attr({
								fill: '#84bd00',
								r: 1,
						})
						.css({
								textAlign: 'center',
								color: '#002663',
						})
						.add()
						.shadow(true);

				// On Hold Status
				ren.label('Pledge (On Hold)<br>Only Keep Recent<br>On Holde Date<br>On Hold Reason', 400, 95)
						.attr({
								fill: '#fb8a2e',
								stroke: 'white',
								'stroke-width': 2,
								padding: 5,
								r: 5
						})
						.css({
								color: 'white',
								width: '110px'
						})
						.add()
						.shadow(true);
				// Arrow from Script to PhantomJS
				ren.path(arrowLeft(100))
						.attr({
							rotation: -35,
							'stroke-width': 2,
							stroke: '#bfca02'
						})
						.translate(310, 180)
						.add();
				ren.label('Resume Payment', 300, 160)
					.attr({
						rotation: -35,
					})
					.css({
							color: '#bfca02',
							fontSize: '10px'
					})
					.add();
				// Arrow from PhantomJS to Script
				ren.path(arrowRight(100))
						.attr({
							rotation: -35,
							'stroke-width': 2,
							stroke: '#fb8a2e'
						})
						.translate(310, 200)
						.add();
				ren.label('Become Delinquent', 310, 200)
					.attr({
						rotation: -35,
					})
					.css({
						color: '#fb8a2e',
						fontSize: '10px'
					})
					.add();

				// Cancel Status
				ren.label('Pledge (Canceled)<br>WRITTENDOWN Date<br>WRITTENDOWN Reason', 600, 110)
						.attr({
								fill: '#a5a9ab',
								stroke: 'white',
								'stroke-width': 2,
								padding: 5,
								r: 5
						})
						.css({
								color: 'white',
								width: '110px'
						})
						.add()
						.shadow(true);

			}
		}
	},
	title: {
		text: 'Continuous (Infinte) Pledge Lifecycle',
		style: {
			color: '#003366'
		}
	}
});


new Highcharts.chart({
	responsive: {
		rules: [{
			condition: {
				minWidth: 320
			},
		}]
	},
	chart: {
		renderTo: 'flow2',
		events: {
			load: function () {
				// Draw the flow chart
				let ren = this.renderer;
				let arrowRight = (len=100, arrowProjectX=5, arrowProjectY=5) => ['M', 0, 0, 'L', len, 0, 'L', len-arrowProjectX, 0+arrowProjectY, 'M', len, 0, 'L', len-arrowProjectX, 0-arrowProjectY];
				let arrowLeft = (len=100, arrowProjectX=5, arrowProjectY=5) => ['M', len, 0, 'L', 0, 0, 'L', arrowProjectX, 0 + arrowProjectY, 'M', 0, 0, 'L', arrowProjectX, 0 - arrowProjectY];
				let verticalSeparator = (offsetX, offsetY=40, length=290, color='#d7d7d8') => ren.path(['M', offsetX, offsetY, 'L', offsetX, offsetY+length])
					.attr({
						'stroke-width': 2,
						stroke: color,
						dashstyle: 'dash'
					}).add();
				let verticalHeader = (text, x, y) => ren.label(text, x, y).css({fontWeight: 'bold'}).add();

				verticalSeparator(135);
				verticalSeparator(340);
				verticalSeparator(550);

				verticalHeader('Before Create', 20, 40);
				verticalHeader('Active', 210, 40);
				verticalHeader('On Hold', 420, 40);
				verticalHeader('Exit', 600, 40);

				// Active Status
				ren.label('Processed<br/>at least ONE<br/>Instalment', 10, 150, 'circle')
						.attr({
								fill: '#279b37',
								stroke: 'white',
								'stroke-width': 2,
								padding: 5,
								r: 0,
						})
						.css({
								color: 'white'
						})
						.add()
						.shadow(true);
				ren.path(arrowRight(75))
						.attr({
								'stroke-width': 2,
								stroke: '#279b37'
						})
						.translate(98, 175)
						.add();
				ren.label('Create Pledge', 98, 155)
						.css({
								fontSize: '10px',
								color: '#279b37'
						})
						.add();

				ren.label('Pledge (New)<br/>Instalments added<br/>Start Date<br/>End Date', 180, 145)
						.attr({
								fill: '#84bd00',
								r: 1,
						})
						.css({
								textAlign: 'center',
								color: '#002663',
						})
						.add()
						.shadow(true);

				// On Hold Status
				ren.label('Pledge (On Hold)<br>Only Keep Recent<br>On Holde Date<br>On Hold Reason', 400, 95)
						.attr({
								fill: '#fb8a2e',
								stroke: 'white',
								'stroke-width': 2,
								padding: 5,
								r: 5
						})
						.css({
								color: 'white',
								width: '110px'
						})
						.add()
						.shadow(true);
				// Arrow from Script to PhantomJS
				ren.path(arrowLeft(100))
						.attr({
							rotation: -35,
							'stroke-width': 2,
							stroke: '#bfca02'
						})
						.translate(310, 180)
						.add();
				ren.label('Resume Payment', 300, 160)
					.attr({
						rotation: -35,
					})
					.css({
							color: '#bfca02',
							fontSize: '10px'
					})
					.add();
				// Arrow from PhantomJS to Script
				ren.path(arrowRight(100))
						.attr({
							rotation: -35,
							'stroke-width': 2,
							stroke: '#fb8a2e'
						})
						.translate(310, 200)
						.add();
				ren.label('Become Delinquent', 310, 200)
					.attr({
						rotation: -35,
					})
					.css({
						color: '#fb8a2e',
						fontSize: '10px'
					})
					.add();

			}
		}
	},
	title: {
		text: 'Fixed (Finte) Pledge Lifecycle',
		style: {
			color: '#003366'
		}
	}
});
