// map scripts
var map, gsn, res;

// init
$(document).ready(function(){
  init_map();
  init_gsn();
});

// init map
function init_map () {
  map = L.map('map',{
    zoomControl: false,
    attributionControl: false,
  }).setView([6.2691, -75.5956], 12);
}

// init geoJson
function init_gsn () {
  gsn = L.geoJson(comcorr,{
    style: init_style
  }).addTo(map);
}

// function to style shp
function init_style (feature) {
  return {
    fillColor: '#ffffff',
    fillOpacity: 1,
    weight: 2,
    color: '#373a3c',
    opacity: 1
  };
}

// // function for each feature
// function onEachFeature (feature, layer) {
//   if (feature.REC_AGUA == 1) {
//     layer.setStyle({fillColor: '#0275D8'});
//   }
// }

// update geojson graph according to resource
function update_gsn () {
  map.removeLayer(gsn); // remove actual map
  gsn = L.geoJson(comcorr,{
    style: style
  }).addTo(map);
}

function style (feature){
  console.log(res);
  return {
    fillColor: getColor(feature.properties[res]),
    fillOpacity: 1,
    weight: 2,
    color: '#373a3c',
    opacity: 1
  };
}

// get color according to properties
function getColor (p) {
  return p > 0 ? '#0275D8':
                 '#ffffff';
}

// handle click on res menu
$('a.res').click(function(){
    res = $(this).attr('id');
    update_gsn();
});

// L.geoJson(comcorr,{
//   style: {
//     fillColor: '0275D8',
//     fillOpacity: 1
//     weight: 2,
//     opacity: 1,
//     color: '#373a3c',
//   }
// }).addTo(map);

// function style(feature) {
//     return {
//         fillColor: getColor(feature.properties.REC_AGUA),
//         weight: 2,
//         opacity: 1,
//         color: '#373a3c',
//         fillOpacity: 0.7
//     };
// }
// L.geoJson(comcorr, {style: style}).addTo(map);

// var res = 'FAUNA_DOM';
// function style(feature) {
//     return {
//         console.log(res);
//         fillColor: getColor(feature.properties[res]),
//         weight: 2,
//         opacity: 1,
//         color: '#373a3c',
//         fillOpacity: 1
//     };
// }
// L.geoJson(comcorr, {style: style}).addTo(map);


// function getColor(d) {
//     return d > 1000 ? '#800026' :
//            d > 500  ? '#BD0026' :
//            d > 200  ? '#E31A1C' :
//            d > 100  ? '#FC4E2A' :
//            d > 50   ? '#FD8D3C' :
//            d > 20   ? '#FEB24C' :
//            d > 10   ? '#FED976' :
//                       '#FFEDA0';
// }
// function style(feature) {
//     return {
//         fillColor: getColor(feature.properties.density),
//         weight: 2,
//         opacity: 1,
//         color: 'white',
//         dashArray: '3',
//         fillOpacity: 0.7
//     };
// }
// L.geoJson(statesData, {style: style}).addTo(map);
