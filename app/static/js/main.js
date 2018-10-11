// Add Sum on Property Function to Array prototype
Array.prototype.sum = function (prop) {
	let total = 0;
	if (prop === null || prop === undefined) {
		for ( let i = 0, _len = this.length; i < _len; i++ ) {
			total += +this[i];
		}
	} else{
		for ( let i = 0, _len = this.length; i < _len; i++ ) {
			total += +this[i][prop];
		}
	}
	return total;
};
