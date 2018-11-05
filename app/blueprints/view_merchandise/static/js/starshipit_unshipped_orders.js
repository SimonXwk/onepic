let vueCard = Vue.component('order-card', {
	props: ['row', 'id'],
	data: function() {
		return {
			show: true
		}
	},
	computed:{
		isAddressValid: function(){
			return this.row.metadatas.filter(r => r.metafield_key === 'ADDRESSVALIDATED')[0].value === "True"
		},
	},
	methods:{
		checkShow: function(searchItem, checkItem){
			this.show = this.show && checkItem.toUpperCase().indexOf(searchItem.toUpperCase()) !== -1
		}
	},
	created(){
		this.$eventBus.$on('filter', search => {
			let filters = Object.entries(search).filter(arr => arr[1]);
			if (filters.length === 0){
				this.show = true;
			}else{
				this.show = true;
				filters.forEach(f => {
					if(f[0] === 'order') {
						this.checkShow(f[1], this.row.order_number)
					}else if( f[0] === 'date'){
						this.checkShow(f[1], new Date(this.row.order_date).toLocaleDateString("en-AU", {timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric', hour:'numeric', minute:'numeric', second:'numeric'}))
					}else if( f[0] === 'name'){
						this.checkShow(f[1], this.row.destination.name)
					}else if( f[0] === 'email'){
						this.checkShow(f[1], this.row.destination.email)
					}else if( f[0] === 'instruction'){
						this.checkShow(f[1], this.row.destination.delivery_instructions)
					}else if( f[0] === 'post'){
						this.checkShow(f[1], this.row.destination.post)
					}else if( f[0] === 'phone'){
						this.checkShow(f[1], this.row.destination.phone)
					}else if( f[0] === 'street'){
						this.checkShow(f[1], this.row.destination.street)
					}else if( f[0] === 'state'){
						this.checkShow(f[1], this.row.destination.state)
					}else if( f[0] === 'country'){
						this.checkShow(f[1], this.row.destination.country)
					}
				});
			}
			if(this.show) {
				this.$eventBus.$emit('showResult');
			}
		});
	},
	template:`
	<div class="card shadow" v-show="show">
		<div class="card-header">
			<span class="text-info" v-if="row.destination.delivery_instructions"><small><< row.destination.delivery_instructions >></small></span></span>
			<span class="text-secondary" v-else><small>No Delivery Instructions</small></span>
		</div>

		<div class="card-body">
			<h5 class="card-title text-danger">
				<mark class="shadow-sm"><< row.order_number >></mark>
				<span class="badge badge-light text-muted font-italic shadow-sm"><small><< row.reference >></small></span>
			</h5>
			<table class="table table-sm table-hover">
				<tbody>
				<tr>
					<td colspan="2" class="text-center">
						<small>
							<span class="text-success" v-if="isAddressValid">Valid Address : )</span>
							<span class="text-danger" v-else>This address is invalid</span>
						</small>
					</td>
				</tr>
				<tr>
					<template v-if="row.destination.name==='#NAME?'">
						<td><small class="text-danger">Name</small></td>
						<td><small class="text-danger"><< row.destination.name >></small></td>
					</template>
					<template v-else>
						<td><small class="text-primary">Name</small></td>
						<td><small class="text-dark"><< row.destination.name >></small></td>
					</template>
				</tr>
				<tr>
					<td v-if="row.destination.email" class="text-primary"><small>Email</small></td>
					<td v-else class="text-muted"><small><del>Email</del></small></td>
					<td><small><< row.destination.email >></small></td>
				</tr>
				<tr>
					<td v-if="row.destination.phone" class="text-primary"><small>Phone</small></td>
					<td v-else class="text-muted"><small><del>Phone</del></small></td>
					<td><small><< row.destination.phone >></small></td>
				</tr>
				<tr>
					<td v-if="row.destination.post_code" class="text-primary"><small>Post</small></td>
					<td v-else class="text-muted"><small><del>Post</del></small></td>
					<td><small><< row.destination.post_code >></small></td>
				</tr>
				<tr>
					<td v-if="row.destination.company" class="text-primary"><small>Company</small></td>
					<td v-else class="text-muted"><small><del>Company</del></small></td>
					<td><small><< row.destination.company >></small></td>
				</tr>
				<tr>
					<td v-if="row.destination.building" class="text-primary"><small>Building</small></td>
					<td v-else class="text-muted"><small><del>Building</del></small></td>
					<td><small><< row.destination.building >></small></td>
				</tr>
				<tr>
					<td v-if="row.destination.street" class="text-primary"><small>Street</small></td>
					<td v-else class="text-muted"><small><del>Street</del></small></td>
					<td><small><< row.destination.street >></small></td>
				</tr>
				<tr>
					<td v-if="row.destination.city" class="text-primary"><small>City</small></td>
					<td v-else class="text-muted"><small><del>City</del></small></td>
					<td><small><< row.destination.city >></small></td>
				</tr>
				<tr>
					<td v-if="row.destination.state" class="text-primary"><small>State</small></td>
					<td v-else class="text-muted"><small><del>State</del></small></td>
					<td><small><< row.destination.state >></small></td>
				</tr>
				<tr>
					<td v-if="row.destination.country" class="text-primary"><small>Country</small></td>
					<td v-else class="text-muted"><small><del>Country</del></small></td>
					<td><small><< row.destination.country >></small></td>
				</tr>
				</tbody>
			</table>
		</div>

		<div class="card-footer">
			<small class="text-muted">
				<span class="text-danger">#<< id >></span> |
				<span class="text-info"><< row.order_date|dtAU >></span>
			</small>
		</div>
	</div>
	`
});

// #############################################################################
let rootVue = new Vue({
	el: '#root',
	data: {
		rawData: [],
		rawDataReady: false,
		sinceDate: new Date(Date.UTC(2000, 0, 1)),
		currentPage: 1,
		totalPages: 1,
		search: {
			order: null,
			date: null,
			name: null,
			email: null,
			post: null,
			phone: null,
			street: null,
			state: null,
			country: null,
			instruction: null,
		},
		filtered: null
	},
	computed:{
		unshippedAPI: function(){
			return '/api/ssi/orders/unshipped/' + this.sinceDate.getFullYear() + '-' + String(this.sinceDate.getMonth() + 1).padStart(2, '0') + '-' + String(this.sinceDate.getDate()).padStart(2, '0')
		},
		preLoadMessage: function(){
			return 'Collecting Unshipped Orders in StarShipit ... ( Page ' + this.currentPage + ' / ' + this.totalPages + ' )'
		},
	},
	watch:{
		search: {
			handler: function(newVal, oldVal){
				this.filtered = 0;
				this.$eventBus.$emit('filter', this.search);
			},
			deep: true
		}
	},
	methods:{
		getData: function(){
			this.rawData = [];
			this.rawDataReady = false;
			this.currentPage = 1;
			this.totalPages = 1;
			this.filtered = 0;
			fetchJSON(endpoint(this.unshippedAPI+"?page="+this.currentPage), (json) => {
					if (json.success === true) {
						this.rawData = this.rawData.concat(json.orders);
						this.totalPages = json.total_pages;
						this.filtered += json.orders.length;
						for (let i=0; i< json.total_pages -1 ; i++){
								fetchJSON(endpoint(this.unshippedAPI+"?page="+ (i+2)), (jsonNext) => {
									if (jsonNext.success === true) {
										this.rawData = this.rawData.concat(jsonNext.orders);
										this.filtered += jsonNext.orders.length;
									}
									if (i === jsonNext.total_pages -2) {
										this.rawData.sort((p, n) => p.order_number > n.order_number );
										this.rawDataReady = true
									}
									this.currentPage += 1;
								}, true);
						}
					} else {
						this.rawDataReady = true;
					}
			});
		}
	},
	created(){
		this.$eventBus.$on('showResult', () => {
			this.filtered += 1;
		});

		this.getData();
	},
	components:{
		'vue-loader': vueLoader,
		'order-card': vueCard
	},
	template: `
	<vue-loader v-bind:msg="preLoadMessage" v-if="(!rawDataReady)"></vue-loader>
	<div class="container-fluid" v-else >
		<div class="alert alert-light px-0" role="alert">
		  <h4 class="alert-heading"><span class="text-danger"><strong><< rawData.length|number >></strong> unshipped orders</span> found in StarShipit</h4>
			<hr class="my-1">
			Showing <span class="text-success font-weight-bold"><< filtered|number >> filtered <span v-if="filtered===1">result</span><span v-else>results</span></span>
		</div>

		<div class="card-columns">
			<div class="card border-primary shadow-lg">
				<div class="card-body align-middle">
					<table class="table table-sm table-borderless">
						<tr><td class="align-middle text-primary"><small>ORDER</small></td>
							<td class="align-middle"><input type="text" class="form-control" placeholder="" v-model.trim.lazy="search.order" ></td>
						</tr>
						<tr><td class="align-middle text-primary"><small>DATE</small></td>
							<td class="align-middle"><input type="text" class="form-control" placeholder="" v-model.trim.lazy="search.date" ></td>
						</tr>
						<tr><td class="align-middle text-primary"><small>NAME</small></td>
							<td class="align-middle"><input type="text" class="form-control" placeholder="" v-model.trim.lazy="search.name" ></td>
						</tr>
						<tr><td class="align-middle text-primary"><small>INSTRUCTION</small></td>
							<td class="align-middle"><input type="text" class="form-control" placeholder="" v-model.trim.lazy="search.instruction" ></td>
						</tr>
						<tr><td class="align-middle text-primary"><small>EMAIL</small></td>
							<td class="align-middle"><input type="text" class="form-control" placeholder="" v-model.trim.lazy="search.email" ></td>
						</tr>
						<tr><td class="align-middle text-primary"><small>POST</small></td>
							<td class="align-middle"><input type="text" class="form-control" placeholder="" v-model.trim.lazy="search.post" ></td>
						</tr>
						<tr><td class="align-middle text-primary"><small>PHONE</small></td>
							<td class="align-middle"><input type="text" class="form-control" placeholder="" v-model.trim.lazy="search.phone" ></td>
						</tr>
						<tr><td class="align-middle text-primary"><small>STREET</small></td>
							<td class="align-middle"><input type="text" class="form-control" placeholder="" v-model.trim.lazy="search.street" ></td>
						</tr>
						<tr><td class="align-middle text-primary"><small>STATE</small></td>
							<td class="align-middle"><input type="text" class="form-control" placeholder="" v-model.trim.lazy="search.state" ></td>
						</tr>
						<tr><td class="align-middle text-primary"><small>COUNTRY</small></td>
							<td class="align-middle"><input type="text" class="form-control" placeholder="" v-model.trim.lazy="search.country" ></td>
						</tr>
					</table>
				</div>
			</div>
			<order-card v-for="num in rawData.length" v-bind:row="rawData[num-1]" v-bind:id="num" v-bind:key="num"></order-card>
		</div>
	</div>
	`
});
