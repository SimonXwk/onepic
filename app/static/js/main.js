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

// $(document).ready(function () {
//
//     $("#sidebar").mCustomScrollbar({
//         theme: "minimal"
//     });
//
//     // when opening the sidebar
//     $('#sidebarCollapse').on('click', function () {
//         // open sidebar
//         $('#sidebar').addClass('active');
//         // fade in the overlay
//         $('.overlay').fadeIn();
//         $('.collapse.in').toggleClass('in');
//         $('a[aria-expanded=true]').attr('aria-expanded', 'false');
//     });
//
//
//     // if dismiss or overlay was clicked
//     $('#dismiss, .overlay').on('click', function () {
//       // hide the sidebar
//       $('#sidebar').removeClass('active');
//       // fade out the overlay
//       $('.overlay').fadeOut();
//     });
// });