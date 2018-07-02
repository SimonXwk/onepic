const today = new Date();
const dateFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

function dAU(date) {
	return date.toLocaleDateString("en-AU", dateFormatOptions)
}

function currency(val) {
	return '$' + String(val.toFixed(2)).split("").reverse().join("")
                  .replace(/(\d{3}\B)/g, "$1,")
                  .split("").reverse().join("");
}





