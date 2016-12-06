/**
 * Main scripts for the interactive map
 * application.
 *    author: Camilo Ocampo
 *    info: github.com/camiloog/mdlln-map
 * All rights reserved.
 */


/*
  +------------------------------------+
  | Object to hold the MAP application |
  | namespace.                         |
  +------------------------------------+
*/
var mapApp = function () {

  // Generate map object from leaflet
  var map = L.map('map',{
    // scrollWheelZoom: false,
    // touchZoom: false,
    zoomControl: false,
    attributionControl: false,
    // crs: L.CRS.EPSG4326
    crs: L.CRS.Simple
  });

  /*
    +-------------------------------------+
    | Objects to handle resources options |
    +-------------------------------------+
  */

  /* res : Resource constructor
   * label - label of the resources
   * color - color assigned to the resource
   */
  function res(label, color){
      this.label = label;
      this.color = color;
  }

  // Object literal to conein all the resources information
  var resources = {
    REC_AGUA : new res('REC_AGUA' ,'#3b87c8'),
    REC_SUELO: new res('REC_SUELO','#5cb85c'),
    REC_AIRE : new res('REC_AIRE' ,'#5bc0de'),
    FAUNA_DOM: new res('FAUNA_DOM','#f0ad4e'),
    SOCIOCULT: new res('SOCIOCULT','#de6764'),
    REC_FLORA: new res('REC_FLORA','#be6aba'),
    NONE     : new res('NONE'     ,'#f8f8f8')
  }

  /* Object to handle the current resource,
   * initialized with NONE.
   * modifi with: c_res.label = new_label;
   * get with: c_res.color();
   */
  var c_res = new res(
    'NONE',
    function () {return resources[this.label].color}
  );

  /* getResProIf: Function to get a propertie from the current
   * resource if a feature belongs to it. The propertie from
   * the default resource (NONE) in other case.
   * belong    - boolean, belongs to the current resource?
   * propertie - the propertie to return
   */
  function getResProIf (belong, propertie) {
    if (belong) {
      return c_res[propertie]();
    } else {
      return resources.NONE[propertie];
    }
  }

  /*
    +------------------------------------+
    | Objects to handle GeoJson layers   |
    +------------------------------------+
  */

  /* gsn : GeoJson layer constructor
   * data   - geoJson data
   * dStyle - function, return style for the features
   * onEach - function to apply on each feature
   * fit    - boolean to auto zoom or not
   */
  function gsn(data, dStyle, onEach, fit) {
    this.gsn = {};
    this.data = data;
    this.dStyle = dStyle;
    this.onEach = onEach;
    this.fit = fit;
    // this.gsn = L.geoJson(this.data,{
    //   style: dStyle(),
    //   onEachFeature: onEach()
    // });
    this.draw = function () {
      if (map.hasLayer(this.gsn))
        map.removeLayer(this.gsn);
      this.gsn = L.geoJson(this.data,{
        style: this.dStyle(),
        onEachFeature: this.onEach()
      }).addTo(map);
      if (this.fit) {
        map.fitBounds(this.gsn.getBounds());
      }
    };
  }

  // Main geoJson layer
  var gsnComCorr = new gsn(
    comcorr,
    function (feature) {
      return {
        // fillColor: getResProIf(
        //   feature.properties[c_res.label],
        //   'color'
        // ),
        fillColor: c_res.color(),
        fillOpacity: 1,
        weight: 1.5,
        dashArray: '3',
        color: '#222',
        opacity: 1
      };
    },
    function(feature, layer){},
    true
  );

  /*
    +-----------------------------------+
    | return public objects from mapApp |
    +-----------------------------------+
  */
  return {
    c_res,
    gsnComCorr
  };

}(); // End mapApp


//
// var map, gsn_comcorr;
// var zoomed = false;
// var i_res = {
// // ! match this colors with the ones in the
// // color sheme from main css
//   REC_AGUA :{color:'#3b87c8'},
//   REC_SUELO:{color:'#5cb85c'},
//   REC_AIRE:{color:'#5bc0de'},
//   FAUNA_DOM:{color:'#f0ad4e'},
//   SOCIOCULT:{color:'#de6764'},
//   REC_FLORA:{color:'#be6aba'},
//   NONE:{color:'#f8f8f8'}
// };
// var res = i_res.NONE;
//
// // init
// $(document).ready(function(){
//   // init_map();
//   // draw_gsn_comcorr();
// });
//
// // init map
// function init_map () {
//   map = L.map('map',{
//     // scrollWheelZoom: false,
//     // touchZoom: false,
//     zoomControl: false,
//     attributionControl: false,
//     // crs: L.CRS.EPSG4326
//     crs: L.CRS.Simple
//   })
// }
//
// // Draw comcorr
// function draw_gsn_comcorr () {
//   if (map.hasLayer(gsn_comcorr))
//     map.removeLayer(gsn_comcorr);
//   gsn_comcorr = L.geoJson(comcorr,{
//     style: style,
//     onEachFeature: onEachFeature
//   }).addTo(map);
//   map.fitBounds(gsn_comcorr.getBounds());
// }
//
// function style (feature){
//   return {
//     fillColor: getColor(feature.properties[res]),
//     fillOpacity: 1,
//     weight: 1.5,
//     dashArray: '3',
//     color: '#222',
//     opacity: 1
//   };
// }
//
// // get color according to properties
// function getColor (p) {
//   return p > 0 ? i_res[res].color:
//                  i_res.NONE.color;
// }
//
// function onEachFeature (feature, layer) {
//   layer.on({
//     mouseover: highlightFeature,
//     mouseout: resetHighlight,
//     click: zoomToFeature
//   });
// }
//
// function highlightFeature (e) {
//   var layer = e.target;
//   layer.setStyle({
//     weight: 2.5,
//     dashArray: null,
//     color: '#000',
//     opacity: 1
//   });
//   if ( !L.Browser.ie
//     && !L.Browser.opera
//     && !L.Browser.edge) {
//     layer.bringToFront();
//   }
// }
//
// function resetHighlight (e) {
//   gsn_comcorr.resetStyle(e.target);
// }
//
// function zoomToFeature(e) {
//   if (zoomed == true) {
//     map.fitBounds(gsn_comcorr.getBounds());
//   }
//   else {
//     map.fitBounds(e.target.getBounds());
//   }
//   zoomed = !zoomed;
// }

mapApp.gsnComCorr.draw();

// handle click on res menu
$('button.res').click(function(){
    mapApp.c_res.label = $(this).attr('id');
    mapApp.gsnComCorr.draw();
});
