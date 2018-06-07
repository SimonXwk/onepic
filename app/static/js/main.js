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



// document.addEventListener("scroll", function () {
//     let siderBarCollapse = document.getElementById("sidebarCollapse");
//     if (window.pageYOffset > siderBarCollapse.offsetTop ) {
// 		siderBarCollapse.classList.add("sticky");
//     } else {
// 		siderBarCollapse.classList.remove("sticky");
//     }
// });


$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

//
//
// $(document).ready(function () {
//     $("#sidebar").mCustomScrollbar({
//         theme: "minimal"
//     });
//
//     $('#dismiss, .overlay').on('click', function () {
//         $('#sidebar').removeClass('active');
//         $('.overlay').fadeOut();
//     });
//
//     $('#sidebarCollapse').on('click', function () {
//         $('#sidebar').addClass('active');
//         $('.overlay').fadeIn();
//         $('.collapse.in').toggleClass('in');
//         $('a[aria-expanded=true]').attr('aria-expanded', 'false');
//     });
// });

