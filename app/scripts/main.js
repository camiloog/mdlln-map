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
   * condition - boolean, condition to evaluate
   * propertie - the propertie to return
   */
  function getResProIf (condition, propertie) {
    if (condition) {
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
    this.lZoomed = false; // A layer is zoomed
    this.draw = function () {
      if (map.hasLayer(this.gsn))
        map.removeLayer(this.gsn);
      this.gsn = L.geoJson(this.data,{
        style: this.dStyle,
        onEachFeature: this.onEach
      }).addTo(map);
      if (this.fit) {
        map.fitBounds(this.gsn.getBounds());
      }
    };
  }

  // Main geoJson layer
  var gsnComCorr = new gsn(comcorr, undefined, undefined, true);

  // Default style of main geoJson layer
  gsnComCorr.dStyle = function (feature) {
    return {
      fillColor: getResProIf(
        feature.properties[c_res.label] == 1,
        'color'
      ),
      // fillColor: c_res.color(),
      fillOpacity: 1,
      weight: 1.5,
      dashArray: '3',
      color: '#222',
      opacity: 1
    };
  }

  // to highlight the style
  gsnComCorr.hStyle = function (e) {
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

  // Add event listeners for each layer of main geoJson layer
  gsnComCorr.onEach = function (feature, layer) {
    layer.on({
      mouseover: function (e) {
        if (gsnComCorr.lZoomed != true) { // hold the style when zoomed
          gsnComCorr.hStyle(e);
        }
      },
      mouseout: function (e) {
        if (gsnComCorr.lZoomed != true) { // hold the style when zoomed
          gsnComCorr.gsn.resetStyle(e.target);
        }
      },
      click: function (e) {
        if (gsnComCorr.lZoomed != true) {
          map.fitBounds(e.target.getBounds());
          info.update(layer.feature.properties);
          gsnComCorr.hStyle(e); // highlight the layer again. (needed on mobile because hover doesnt change the style)
        }
        else {
          map.fitBounds(gsnComCorr.gsn.getBounds());
          info.update();
          gsnComCorr.gsn.resetStyle(e.target); // Remove highlight. (needed on mobile)
        }
        gsnComCorr.lZoomed = !gsnComCorr.lZoomed;
      }
    });
  }



  /*
    +------------------------------------+
    | Custom information box for the map |
    +------------------------------------+
  */

  var info = L.control(); // default topright
  info.update = function (properties) {
    if (properties == undefined) {
      this._div.innerHTML = '';
      this._div.style.visibility = "hidden";
    } else {
      this._div.innerHTML = '<h4>' + properties.NOMBRE + '</h4>' +
                            '<h5>'+ properties.IDENTIFICA + '</h5>';
      this._div.style.visibility = "visible";
    }
  };
  info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info-conteiner'); // create a div with a class "info"
      this.update();
      return this._div;
  };
  info.addTo(map);

  /*
    +-----------------------------------+
    | return public objects from mapApp |
    +-----------------------------------+
  */
  return {
    c_res,      // current resource
    gsnComCorr  // main geoJson handler
  };

}(); // End mapApp

/*
  +------------------------------------+
  | Object to handle buttons behabiors |
  | namespace.                         |
  +------------------------------------+
*/

// handle click on res menu
$('button.res').click(function(){
    mapApp.c_res.label = $(this).attr('id');
    mapApp.gsnComCorr.draw();
});


/*
  +------------------------------------+
  | Start and execute application      |
  +------------------------------------+
*/
$(document).ready(function(){
  mapApp.gsnComCorr.draw();
});
