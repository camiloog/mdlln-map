// Togle function for sidebar
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});
$("#wrapper").toggleClass("toggled");

var L = require('leaflet');
