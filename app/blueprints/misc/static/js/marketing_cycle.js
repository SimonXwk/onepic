// ##########################################################################################################################################################
// ##########################################################################################################################################################
const store = new Vuex.Store({
	state: {
		fetchingStatus: '',
		marketingCycles: null,
		marketingCyclesDataReady: false,
	},
	mutations: {
		SET_FETCH_STATUS: (state, payload) => state.fetchingStatus = payload,
		SET_MC: (state, payload) => state.marketingCycles = payload,
		SET_MC_READY_STATUS: (state, payload) => state.marketingCyclesDataReady = payload,
	},
	actions: {
		fetchMC(ctx){
			return new Promise((resolve, reject) => {
				ctx.commit('SET_FETCH_STATUS', 'Fetching Data (Marketing Cycle) ...');
				fetch(endpoint('/api/mongo/marketing_cycles'))
					.then(resp => {
						if (resp.status >= 200 && resp.status < 300) {
							ctx.commit('SET_FETCH_STATUS', '✓ Response received successfully (Marketing Cycle)');
							return Promise.resolve(resp)
						} else {
							ctx.commit('SET_FETCH_STATUS', '✘ Response Status Failed (Marketing Cycle)');
							return Promise.reject(new Error(resp.statusText))
						}
					})
					.then(resp => {
						ctx.commit('SET_FETCH_STATUS', 'Convering data to JSON format (Marketing Cycle)');
						return resp.json()
					})
					.then(json => {
						ctx.commit('SET_FETCH_STATUS', '✓ Storing JSON data to context (Marketing Cycle)');
						ctx.commit('SET_MC', json);
						ctx.commit('SET_FETCH_STATUS', '✓ Data Stored (Marketing Cycle)');
						ctx.commit('SET_MC_READY_STATUS', true);
						resolve()
					});
			});
		},
	},
	getters: {

	}
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
Vue.component('highchart-drawing', {
	data: function(){
		return {
			chart: null,
			renderer: null,
			width: 320,
			height: 500,
		}
	},
	computed: {
		...Vuex.mapState(['marketingCycles']),
	},
	methods: {
	},
	mounted() {
		let vue = this;
		this.renderer = new Highcharts.Renderer(this.$el, this.width, this.height)

		let renderFunc = (ren, width, height) => {
			let paddingY = 20, paddingX=10;
			let innerTop = paddingY, innerLeft = paddingX;
			let innerWidth = width - paddingX * 2;
			let innerHeight = height - paddingY * 2;
			let centerX = width*0.5, centerY = height*0.5, radius = Math.min(innerWidth, innerHeight)*0.5;
			let textOffset = -50;
			centerX = centerX + textOffset;

			let innerNodes = vue.marketingCycles.filter(r => r.type === 'hard');
			let outterNodes = vue.marketingCycles.filter(r => r.type === 'soft');
			let arc = (Math.PI/180)*(360/innerNodes.length);

			let xPos2 = centerX + radius * Math.sin(arc);
			let xPos1 = centerX - radius * Math.sin(arc);

			let yPos1 = centerY + radius * Math.cos(arc);
			let yPos2 = centerY - radius * Math.cos(arc);

			// Calibriation the Big Circle
			ren.circle(centerX, centerY, radius)
			.attr({
				fill: '#EEE',
				stroke: '#888',
				'stroke-width': 1
			})
			.add()

			// Inner Circle
			innerNodes.forEach((mc1, idx) => {
				let x =  centerX + radius * Math.cos(arc*idx);
				let y =  centerY + radius * Math.sin(arc*idx);
				ren.text(mc1.name, x, y)
				.attr({
					rotation: 0
				})
				.css({
					color: mc1.color,
					fontSize: '16px',
				})
				.add()

				// Draw it's supporting Marketing Cycle
				outterNodes.filter(r => r.support !== undefined && r.support.reduce((ac, cr) => ac || (cr.id === mc1._id) ,false)).forEach((mc2, idx) => {
					// console.log(mc1.name, mc2.name,  mc2.support, mc1._id)

					ren.text(mc2.name + ' (' + (mc2.support.find(el => el.id === mc1._id).note || ' ') + ')',  x > centerX ? x + 90 : x - 200 , y > centerY ? y - (idx+1)*40 : y + (idx+1)*40 )
					.attr({
						rotation: 0
					})
					.css({
						color: '#999',
						fontSize: '14px',
					})
					.add()
				})

				// Center text
				ren.text('Marketing Cycle', centerX+textOffset, centerY)
				.attr({
					rotation: 0
				})
				.css({
					color: '#777',
					fontSize: '15px',
				})
				.add()

			});

		}


		this.chart = Highcharts.chart({
			title: { text: null },
			chart: {
				renderTo: this.$el,
				backgroundColor: '#EEE',
				events: {
					load: function(){
						// console.log(this);
						// console.log(this.plotLeft, this.plotTop, this.plotWidth, this.plotHeight, this.plotBox, this.margin, this.containerWidth, this.containerHeight);
						renderFunc(this.renderer, this.containerWidth, this.containerHeight)
					}
				}
			},
		});

			// renderFunc();
		// ren.rect(0, 0, 100, 100, 5)
		//     .attr({
		//         'stroke-width': 2,
		//         stroke: 'red',
		//         fill: 'yellow',
		//         zIndex: 3
		//     })
		//     .add();


	},
	template:`<div class="container chart" style="height:500px;"></div>`
});
// ##########################################################################################################################################################
// ##########################################################################################################################################################
let rootVue = new Vue({
	el: '#root',
	data: {
	},
	store,
	computed: {
		...Vuex.mapState(['fetchingStatus', 'marketingCyclesDataReady', 'marketingCycles']),
	},

	methods: {
		...Vuex.mapActions(['fetchMC']),
	},
	created(){
		this.fetchMC()
	},
	template:`<div class="container-fluid">
	<p class="lead text-center" role="alert" v-if="!marketingCyclesDataReady"><< fetchingStatus >></p>
	<highchart-drawing v-if="marketingCyclesDataReady"></highchart-drawing>

		<p class="lead" v-for="mc in marketingCycles"><< mc >></p>
	</div>`
});
