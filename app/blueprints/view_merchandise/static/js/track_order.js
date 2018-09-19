let ssi = new Vue({
	el: '#ssi',
	data: {
		order: {
			number: null,
			regex: /^\d{2}-\d{8}$/g,
		},
		showBanner: true,
		stage1: {
			endpoint: '/api/ssi/orders/search/',
			status: 'wait',
			orderHeaders: []
	  	},
		stage2: {
			endpoint: '/api/ssi/order/',
			status: 'wait',
			orderDetails: []
	  	},
		stage3: {
			endpoint: '/api/ssi/track/',
			status: 'wait',
			results: []
	  	},
		loader1: '<div class="container h-100"><div class="row h-100 justify-content-center align-items-center"><div class="lds-heart"><div></div></div></div></div>',
		loader2: '<div class="container h-100"><div class="row h-100 justify-content-center align-items-center"><div class="lds-facebook"><div></div><div></div><div></div></div></div></div>',
		loader3: `
		<div class="conatiner h-100">
		<div class="row h-100 justify-content-center align-items-center">
			<div class="lds-hourglass"></div>
		</div>
		</div>
		`

	},
	methods:{
		initiateStatus: function(){
			this.showBanner = true;
			this.stage1.status = 'wait';
			this.stage2.status = 'wait';
			this.stage3.status = 'wait';
			this.stage1.orderHeaders = [];
			this.stage2.orderDetails = [];
			this.stage3.results = [];
		},
		validateOrderNumberOnInput: function(){
			this.initiateStatus();
			if (  this.order.number === null || this.order.number.trim() === '' ){
				return false
			} else {
					let orderMatch = this.order.number.match(this.order.regex);
					let ok = (orderMatch !== null && orderMatch.length === 1);
				if (ok){
					this.stage1.status = 'init';
					return true
				}else{
					return false
				}
			}
		},
		clearOrderNumber: function(){
			this.order.number = null;
			this.initiateStatus();
		}
	},
	mounted(){
		this.order.number = deafultOrder;
	},
	components:{
		// Component : Banner
		'ssi-banner':{
		template: `
		<transition name="bounce">
			<div v-if="this.$parent.$data.showBanner ">
			<div class="alert alert-success shadow-type8" role="alert" v-if="this.$parent.validateOrderNumberOnInput() ">&#10004 <span class="text-danger"><strong><< this.$parent.$data.order.number >></strong></span> is a legitimate input</div>
			<div class="alert alert-secondary shadow-type1" role="alert" v-else-if="this.$parent.$data.order.number === '' || this.$parent.$data.order.number === null "><span class="text-muted">waiting for a rex order id as input ... ( eg  18-00004073 )</span></div>
			<div class="alert alert-info shadow-type1" role="alert" v-else>&#10148 Reading Input : <span class="text-primary"><strong><< this.$parent.$data.order.number >></strong></span></div>
			</div>
		</transition>
		`
	  	},

		// Component : Order Header Information
		'ssi-order-header': {
		template: `
			<div v-if=" this.$parent.$data.stage1.status === 'init' ">
				<p  class="lead text-center">Looking for << this.$parent.$data.order.number >> </p>
				<div v-html="this.$parent.$data.loader1"></div>
			</div>

			<div v-else-if=" this.$parent.$data.stage1.status === 'success' ">
				<div class="card" v-for="orderHeader in this.$parent.$data.stage1.orderHeaders">
					<div class="card-header ">
						<h3 class="alert-heading">&#128515 <span class="text-primary"><< orderHeader.name >></span></h3>
					</div>
					<div class="card-body">
						<ul class="list-unstyled">
							<li><p class="lead"> &#128313 Order # : << orderHeader.order_number >></p></li>
							<li><p class="lead">&#128313 Placed on << orderHeader.order_date|dtAU >></p></li>
							<li><p class="lead">&#128313 Tracking # : <strong><< orderHeader.tracking_number >></strong></p></li>
						</ul>
					</div>
					<div class="card-footer text-muted bg-transparent">
						This Order was placed in <span class="text-danger"><< orderHeader.country >></span> via <span class="text-danger"><< orderHeader.carrier_name >></span>
							, and its Starshipit Order ID is <span class="text-info"><< orderHeader.order_id >></span>
					</div>
				</div>
			</div>

			<div v-else-if=" this.$parent.$data.stage1.status === 'failed' ">
				<p class="lead text-center">&#9785 Can not find << this.$parent.$data.order.number >> in starshipit</p>
			</div>

			<div v-else-if = "this.$parent.$data.stage1.status === 'wait'">
				<p class="lead text-muted">Waiting for REX order number input</p>
			</div>
		`,
		data: function () {
			return {
			orderHeaders: []
			}
		},
		updated(){
			if (this.$parent.$data.stage1.status === 'init' ) {
			console.log(this.$parent.$data.stage1.endpoint + this.$parent.$data.order.number);
			fetchJSON(endpoint(this.$parent.$data.stage1.endpoint + this.$parent.$data.order.number), this.fetch);
			}
		},
		methods:{
			fetch: function(json){
				let orders = json.orders;
				if (orders.length > 0 ){
					this.$parent.$data.stage1.orderHeaders = orders;
					this.$parent.$data.stage1.status = 'success';

					this.$parent.$data.showBanner = false;
					this.$parent.$data.stage2.status = 'init';
					this.$parent.$data.stage3.status = 'init';
				}else{
					this.$parent.$data.stage1.status = 'failed';
				}
			}
		}
		},
		// Component : Order Detail Information
		'ssi-order-detail': {
		template: `
			<div v-if=" this.$parent.$data.stage2.status === 'init' ">
				<div v-html="this.$parent.$data.loader2"></div>
			</div>

			<div v-else-if=" this.$parent.$data.stage2.status === 'success' ">
			<hr class="my-1" />
			<div v-for="orderDetail in this.$parent.$data.stage2.orderDetails">
				<div class="card">
					<div class="card-header">
						<h3>&#128666 <span class="text-primary">Destination</span>
							<span class="badge badge-light text-muted"><small>(<< orderDetail.order_id >>)</small></span>
						</h3>
						<span class="text-danger" v-if="orderDetail.destination.delivery_instructions">DELIVERY INSTRUCTION : << orderDetail.destination.delivery_instructions >></span>
					</div>

 					<div class="card-body">
						<table class="table table-hover table-bordered table-sm">
							<tbody>
								<tr v-if="orderDetail.reference">
									<th scope="row">&#128216; Reference</th>
									<td><span class="badge badge-info"><< orderDetail.reference >></span></td>
								</tr>

								<tr v-if="orderDetail.destination.phone">
									<th scope="row">&#128222 Phone</th>
									<td><< orderDetail.destination.phone >></td>
								</tr>

								<tr v-if="orderDetail.destination.email">
								<th scope="row">&#128231 Email</th>
								<td><< orderDetail.destination.email >></td>
								</tr>

								<tr v-if="orderDetail.destination.building">
								<th scope="row">&#127970; Building</th>
								<td><< orderDetail.destination.building >></td>
								</tr>

								<tr v-if="orderDetail.destination.street">
								<th scope="row">&#128172; Street</th>
								<td><< orderDetail.destination.street >></td>
								</tr>

								<tr v-if="orderDetail.destination.suburb">
								<th scope="row">&#128172; Suburb</th>
								<td><< orderDetail.destination.suburb >></td>
								</tr>

								<tr v-if="orderDetail.destination.city">
								<th scope="row">&#128172; City</th>
								<td><< orderDetail.destination.city >></td>
								</tr>

								<tr v-if="orderDetail.destination.state">
								<th scope="row">&#128172; State</th>
								<td><< orderDetail.destination.state >></td>
								</tr>

								<tr v-if="orderDetail.destination.post_code">
								<th scope="row">&#128238; Postcode</th>
								<td><< orderDetail.destination.post_code >></td>
								</tr>

								<tr v-if="orderDetail.destination.country">
								<th scope="row">&#128172; Country</th>
								<td><< orderDetail.destination.country >></td>
								</tr>

							</tbody>
						</table>
					</div>
				</div>




				<div class="card">
				<p class="card-header lead">&#128230; Packages</p>
				<ul class="list-group list-group-flush">
					<li class="list-group-item" v-for="(package, index) in orderDetail.packages">
					<p>
						Package << index+1 >> :
						<a title="Click me to check Aust Post" target="_blank" v-bind:href=package.tracking_url>
						<span class="badge badge-warning text-dark">&#8690 << package.tracking_number >> (click me)</span>
						</a>
					</p>
					<p><small><< package.carrier_service_name >></small></p>
					<p><small>label created : << package.label_created_date|dtAU >></small></p>
					<p>
						<span class="badge badge-secondary">length <span class="text-warning"><< package.length >></span></span>
						<span class="badge badge-secondary">width <span class="text-warning"><< package.width >></span></span>
						<span class="badge badge-secondary">height <span class="text-warning"><< package.height >></span></span>
						<span class="badge badge-secondary">weight <span class="text-warning"><< package.weight >></span></span>
					</p>
					</li>
				</ul>
				</div>

			</div>
			</div>

			<div v-else-if=" this.$parent.$data.stage2.status === 'failed' ">
			<p class="lead text-center">&#9785 Can not find << this.$parent.$data.order.number >> in starshipit</p>
			</div>


			<div v-else-if = "this.$parent.$data.stage2.status === 'wait'">
			</div>
		`,
		data: function () {
			return {
			orderDetails: []
			}
		},
		updated(){
			if (this.$parent.$data.stage2.status === 'init' ) {
			let headers = this.$parent.$data.stage1.orderHeaders;
			headers.forEach(header => {
				fetchJSON(endpoint(this.$parent.$data.stage2.endpoint + header.order_id), this.fetch);
			});
			}
		},
		methods:{
			fetch: function(json){
			if (json.success === true){
				this.$parent.$data.stage2.orderDetails.push(json.order);
				this.$parent.$data.stage2.status = 'success';
			}else{
				this.$parent.$data.stage2.status = 'failed';
			}
			}
		}
		},
		// Component : Order Tracking Information
		'ssi-order-track': {
		template: `
			<div v-if=" this.$parent.$data.stage3.status === 'init' ">
			<div v-html="this.$parent.$data.loader3"></div>
			</div>

			<div v-else-if=" this.$parent.$data.stage3.status === 'success' ">
			<div v-for="result in this.$parent.$data.stage3.results">
				<table class="table table-hover table-bordered table-sm">
				<tbody>
					<tr>
					<th scope="row">Carrier</th>
					<td><< result.carrier_name >> / << result.carrier_service >></td>
					</tr>
					<tr>
					<th scope="row">Last Updated Date</th>
					<td><< result.last_updated_date|dtAU  >></td>
					</tr>

					<tr>
					<th scope="row">Order #</th>
					<td><< result.order_number >></td>
					</tr>
					<tr>
					<th scope="row">Order Status</th>
					<td><< result.order_status >></td>
					</tr>
					<tr>
					<th scope="row">Shipment Date</th>
					<td><< result.shipment_date|dtAU >></td>
					</tr>

					<tr>
					<th scope="row">Tracking #</th>
					<td><< result.tracking_number >></td>
					</tr>
					<tr>
					<th scope="row">&#128270  Tracking Status</th>
					<td v-if="result.tracking_status.trim().slice(0,9)==='Delivered' "><span class="text-success"><strong>&#9989 << result.tracking_status >></strong></span></td>
					<td v-else-if="result.tracking_status==='Exception'"><span class="text-danger"><strong>&#10071 << result.tracking_status >></strong></span></td>
					<td v-else><span class="text-dark"><strong>&#10068 << result.tracking_status >></strong></span></td>
					</tr>
				</tbody>
				</table>


				<ul class="ul-timeline">
				<li v-for="event in result.tracking_events">
					<span class="badge" v-bind:class="[eventStatusClass(event, 'badge')]"><mark><< event.status >></mark></span>
					<span class="badge badge-pill float-right" v-bind:class="[eventStatusClass(event, 'badge')]"><< event.event_datetime >></span >
					<p v-bind:class="[eventStatusClass(event, 'text')]"><< event.details >></p>
				</li>
				</ul>

			<hr class="my-1">

			</div>
			</div>

			<div v-else-if=" this.$parent.$data.stage3.status === 'failed' ">
			<p class="lead text-center">&#9785 Can not find << this.$parent.$data.order.number >> in starshipit</p>
			</div>


			<div v-else-if = "this.$parent.$data.stage3.status === 'wait'">

			</div>
		`,
		data: function () {
			return {
			}
		},
		computed:{

		},
		updated(){
			if (this.$parent.$data.stage3.status === 'init' ) {
			let headers = this.$parent.$data.stage1.orderHeaders;
			headers.forEach(header => {
				fetchJSON(endpoint(this.$parent.$data.stage3.endpoint + header.tracking_number), this.fetch);
			});
			}
		},
		methods:{
			fetch: function(json){
			if (json.success === true){
				this.$parent.$data.stage3.results.push(json.results);
				this.$parent.$data.stage3.status = 'success';

			}else{
				this.$parent.$data.stage3.status = 'failed';
			}
			},
			eventStatusClass: function(event, prefix=''){
			if (event.status === 'Delivered' || event.status === 'Delivered with signature' ){
				return prefix === '' ? 'success' : prefix + '-success'
			}else if(event.status === 'Exception') {
				return prefix === '' ? 'danger' : prefix + '-danger'

			}else if(event.details === 'Shipping information received by Australia Post') {
				return prefix === '' ? 'primary' : prefix + '-primary'
			} else {
				return prefix === '' ? 'info' : prefix + '-info'
			}
			}
		}
		},

	},
});
