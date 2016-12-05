/**
 * Main scripts for the interactive map
 * application.
 */

var map, gsn_comcorr;
var zoomed = false;
var i_res = {
// ! match this colors with the ones in the
// color sheme from main css
  REC_AGUA :{color:'#3b87c8'},
  REC_SUELO:{color:'#5cb85c'},
  REC_AIRE:{color:'#5bc0de'},
  FAUNA_DOM:{color:'#f0ad4e'},
  SOCIOCULT:{color:'#de6764'},
  REC_FLORA:{color:'#be6aba'},
  NONE:{color:'#f8f8f8'}
};
var res = i_res.NONE;

// init
$(document).ready(function(){
  init_map();
  draw_gsn_comcorr();
});

// init map
function init_map () {
  map = L.map('map',{
    // scrollWheelZoom: false,
    // touchZoom: false,
    zoomControl: false,
    attributionControl: false,
    // crs: L.CRS.EPSG4326
    crs: L.CRS.Simple
  })
}

// Draw comcorr
function draw_gsn_comcorr () {
  if (map.hasLayer(gsn_comcorr))
    map.removeLayer(gsn_comcorr);
  gsn_comcorr = L.geoJson(comcorr,{
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);
  map.fitBounds(gsn_comcorr.getBounds());
}

function style (feature){
  return {
    fillColor: getColor(feature.properties[res]),
    fillOpacity: 1,
    weight: 1.5,
    dashArray: '3',
    color: '#222',
    opacity: 1
  };
}

// get color according to properties
function getColor (p) {
  return p > 0 ? i_res[res].color:
                 i_res.NONE.color;
}

function onEachFeature (feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
}

function highlightFeature (e) {
  var layer = e.target;
  layer.setStyle({
    weight: 2.5,
    dashArray: null,
    color: '#000',
    opacity: 1
  });
  if ( !L.Browser.ie
    && !L.Browser.opera
    && !L.Browser.edge) {
    layer.bringToFront();
  }
}

function resetHighlight (e) {
  gsn_comcorr.resetStyle(e.target);
}

function zoomToFeature(e) {
  if (zoomed == true) {
    map.fitBounds(gsn_comcorr.getBounds());
  }
  else {
    map.fitBounds(e.target.getBounds());
  }
  zoomed = !zoomed;
}

// handle click on res menu
$('button.res').click(function(){
    res = $(this).attr('id');
    // update_gsn_comcorr();
    draw_gsn_comcorr();
});
