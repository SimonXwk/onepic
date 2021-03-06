let renderFlow1Cht1 = () => { new Highcharts.chart({
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

				verticalHeader('Before Create', 10, 40);
				verticalHeader('Active', 210, 40);
				verticalHeader('On Hold', 420, 40);
				verticalHeader('Exit', 640, 40);

				// Active Status
				ren.label('Processed<br/>at least ONE<br/>Instalment', 10, 155, 'rect')
						.attr({
								fill: '#279b37',
								stroke: '#b3dcff',
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
						.translate(98, 185)
						.add();
				ren.label('Create Pledge', 98, 160)
						.css({
								fontSize: '10px',
								color: '#279b37'
						})
						.add();

				ren.label('Pledge (New)<br/>Instalment calculate<br/>Sourcecode (1)<br/>Destination1 (1)<br/>Destination2 (1)<br/>Start Date<br/>End Date', 180, 130)
						.attr({
								fill: '#84bd00',
								stroke: 'white',
								'stroke-width': 1,
								r: 5,
						})
						.css({
								textAlign: 'center',
								color: '#002663',
						})
						.add()
						.shadow(true);

				// On Hold Status
				ren.label('Pledge (On Hold)<br>Only Keep Recent<br>On Hold Date<br>On Hold Reason', 400, 95)
						.attr({
								fill: '#fb8a2e',
								stroke: 'white',
								'stroke-width': 1,
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
				ren.label('Pledge (Cancelled)<br><s>Writtendown Date</s><br>Writtendown Reason', 600, 180)
					.attr({
							fill: '#a5a9ab',
							stroke: 'white',
							'stroke-width': 1,
							padding: 5,
							r: 5,
							useHTML: true
					})
					.css({
							color: 'white',
					})
					.add()
					.shadow(true);
					ren.path(arrowRight(100))
						.attr({
							rotation: 45,
							'stroke-width': 2,
							stroke: '#d40000'
						})
						.translate(520, 135)
						.add();
					ren.label('Writtendown', 540, 130)
						.attr({
							rotation: 45,
						})
						.css({
								color: '#d40000',
								fontSize: '10px'
						})
						.add();

					ren.path(arrowRight(280))
						.attr({
							rotation: 0,
							'stroke-width': 2,
							stroke: '#d40000'
						})
						.translate(310, 220)
						.add();
					ren.label('Writtendown', 420, 200)
						.attr({
							rotation: 0,
						})
						.css({
								color: '#d40000',
								fontSize: '10px'
						})
						.add();
			}
		}
	},
	title: {
		text: 'Continuous (Infinite) Pledge Lifecycle',
		style: {
			color: '#003366'
		}
	}
})}


let renderFlow1Cht2 = () => new Highcharts.chart({
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

				verticalHeader('Before Create', 10, 40);
				verticalHeader('Active', 210, 40);
				verticalHeader('On Hold', 420, 40);
				verticalHeader('Exit', 640, 40);

				// Active Status
				ren.label('Processed<br/>at least ONE<br/>Instalment', 10, 155, 'rect')
						.attr({
								fill: '#279b37',
								stroke: '#b3dcff',
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
						.translate(98, 185)
						.add();
				ren.label('Create Pledge', 98, 160)
						.css({
								fontSize: '10px',
								color: '#279b37'
						})
						.add();

				ren.label('Pledge (New)<br/>Instalments added<br/>Sourcecode(1)<br/>Destination1(1)<br/>Destination2(1)<br/>Start Date<br/>End Date', 180, 130)
						.attr({
								fill: '#84bd00',
								stroke: 'white',
								'stroke-width': 1,
								r: 5,
						})
						.css({
								textAlign: 'center',
								color: '#002663',
						})
						.add()
						.shadow(true);

				// On Hold Status
				ren.label('Pledge (On Hold)<br>Only Keep Recent<br>On Hold Date<br>On Hold Reason', 400, 120)
						.attr({
								fill: '#fb8a2e',
								stroke: 'white',
								'stroke-width': 1,
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
				ren.path(arrowLeft(95))
						.attr({
							rotation: 0,
							'stroke-width': 2,
							stroke: '#bfca02'
						})
						.translate(300, 150)
						.add();
				ren.label('(Manual) Catchup or<br>Writedown Instalment', 300, 115)
					.attr({
						rotation: 0,
					})
					.css({
							color: '#bfca02',
							fontSize: '9px'
					})
					.add();
				// Arrow from PhantomJS to Script
				ren.path(arrowRight(95))
						.attr({
							rotation: 0,
							'stroke-width': 2,
							stroke: '#fb8a2e'
						})
						.translate(300, 170)
						.add();
				ren.label('(Manual) Delinquent', 295, 175)
					.attr({
						rotation: 0,
					})
					.css({
						color: '#fb8a2e',
						fontSize: '10px'
					})
					.add();

				// Cancel Status
				ren.label('Pledge (Cancelled)<br><s>Writtendown Date</s><br>Writtendown Reason', 600, 65)
					.attr({
							fill: '#a5a9ab',
							stroke: 'white',
							'stroke-width': 1,
							padding: 5,
							r: 5,
							useHTML: true
					})
					.css({
							color: 'white',
					})
					.add()
					.shadow(true);
					ren.path(arrowRight(75))
						.attr({
							rotation: -20,
							'stroke-width': 2,
							stroke: '#d40000'
						})
						.translate(520, 150)
						.add();
					ren.label('(Manual) Writtendown', 510, 155)
						.attr({
							rotation: -20,
						})
						.css({
								color: '#d40000',
								fontSize: '9px'
						})
						.add();

					ren.path([
							'M', 0, 40,
							'L', 0, 5,
							'C', 0, 5, 0, 0, 5, 0,
							'L', 355, 0,
							'L', 355-5, -5,
							'M', 355, 0,
							'L', 355-5, 5
            ])
						.attr({
							rotation: 0,
							'stroke-width': 2,
							stroke: '#d40000'
						})
						.translate(240, 90)
						.add();
					ren.label('(Manual) Writtendown', 300, 70)
						.attr({
							rotation: 0,
						})
						.css({
								color: '#d40000',
								fontSize: '11px'
						})
						.add();

					// Closed Status Perfect
					ren.label('Pledge (Perfectly Closed)<br>all instalments paid<br>EndDate', 600, 200)
						.attr({
								fill: '#00aee6',
								stroke: 'white',
								'stroke-width': 1,
								padding: 5,
								r: 5,
								useHTML: true
						})
						.css({
								color: 'white',
						})
						.add()
						.shadow(true);

					ren.path(arrowRight(75))
						.attr({
							rotation: 20,
							'stroke-width': 2,
							stroke: '#00aee6'
						})
						.translate(520, 180)
						.add();
					ren.label('(Auto) Catch Up', 520, 180)
						.attr({
							rotation: 20,
						})
						.css({
								color: '#00aee6',
								fontSize: '10px'
						})
						.add();

					ren.path([
							'M', 0, 0,
							'L', 0, 20,
							'C', 0, 20, 0, 20+5, 5, 20+5,
							'L', 400, 20+5,
							'C', 400, 20+5, 400+5, 20+5, 400+5, 20+5-5,
							'L', 400+5, 15,
							'L', 400+5-5, 15+5,
							'M', 400+5, 15,
							'L', 400+5+5, 15+5
            ])
						.attr({
							rotation: 0,
							'stroke-width': 2,
							stroke: '#00aee6'
						})
						.translate(240, 250)
						.add();
					ren.label('(Auto) Paid All Instalments', 300, 255)
						.attr({
							rotation: 0,
						})
						.css({
								color: '#00aee6',
								fontSize: '10px'
						})
						.add();


					// Closed Status
					ren.label('Pledge (Imperfectly Closed)<br>some instalments paid<br>EndDate', 620, 130)
						.attr({
								fill: '#6a9c84',
								stroke: 'white',
								'stroke-width': 1,
								padding: 5,
								r: 5,
								useHTML: true
						})
						.css({
								color: 'white',
						})
						.add()
						.shadow(true);
					ren.path(arrowRight(95))
						.attr({
							rotation: 0,
							'stroke-width': 2,
							stroke: '#6a9c84'
						})
						.translate(520, 175)
						.add();
					ren.label('(Auto) Writedown', 520, 160)
						.attr({
							rotation: 0,
						})
						.css({
								color: '#6a9c84',
								fontSize: '10px'
						})
						.add();


					// Finished Status
					ren.label('Pledge (Finished)<br>Reached Conceptual End<br>NextCallDate', 600, 300)
						.attr({
								fill: '#a560e8',
								stroke: 'white',
								'stroke-width': 1,
								padding: 5,
								r: 5,
								useHTML: true
						})
						.css({
								color: 'white',
						})
						.add()
						.shadow(true);
					ren.path([
							'M', 0, 0,
							'L', 0, 30,
							'L', -5, 30-5,
							'M', 0, 30,
							'L', 5, 30-5
            ])
						.attr({
							rotation: 0,
							'stroke-width': 2,
							stroke: '#a560e8'
						})
						.translate(680, 265)
						.add();
					ren.label('(Conceptual) Fill NextCallDate', 520, 280)
						.attr({
							rotation: 0,
						})
						.css({
								color: '#a560e8',
								fontSize: '10px'
						})
						.add();

						ren.path([
								'M', 0, 0,
								'L', 0, 120,
								'C', 0, 120, 0, 120+5, 0-5, 120+5,
								'L', -20, 120+5,
								'L', -20+5, 120+5-5,
								'M', -20, 120+5,
								'L', -20+5, 120+5+5,
	            ])
							.attr({
								rotation: 0,
								'stroke-width': 2,
								stroke: '#a560e8'
							})
							.translate(780, 195)
							.add();
						ren.label('(Conceptual) Fill NextCallDate', 800, 200)
							.attr({
								rotation: 90,
							})
							.css({
									color: '#a560e8',
									fontSize: '10px'
							})
							.add();
			}
		}
	},
	title: {
		text: 'Fixed (Finite) Pledge Lifecycle',
		style: {
			color: '#166a8f'
		}
	}
});

renderFlow1Cht1();
renderFlow1Cht2();
