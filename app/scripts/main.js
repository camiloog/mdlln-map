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

  /*
    +-------------------+
    | Custome functions |
    +-------------------+
  */

  /* edBounds: Encrease or decrease bounds on certein percent.
   *  bounds - The bounds to modify
   *  percent - the amount of encrease or decrease. i.e '10%', '-5%'
   * return the new bounds.
   */
  var edBounds = function (bounds, percent) {
    // percent
    var p = new Number(percent.replace("%","")) / 100 + 1;
    // center of the bounds
    var center = bounds.getCenter();
    var points = ["_northEast","_southWest"];
    var values = ["lat","lng"];
    points.forEach(function (point) {
      values.forEach(function (value) {
        // console.log("before :" + point + " " + value + ": " + bounds[point][value]);
        bounds[point][value] =  (bounds[point][value] - center[value]) * p + center[value];
        // console.log("after :" + point + " " + value + ": " + bounds[point][value]);
      });
    });
    return bounds;
  }

  /*
    +-------------------------+
    | Map object from leaflet |
    +-------------------------+
  */

  var map = L.map('map',{
    // scrollWheelZoom: false,
    // touchZoom: false,
    zoomControl: false,
    attributionControl: false,
    maxBoundsViscosity: 0.1, // how hard bounce in bounds
    // crs: L.CRS.EPSG4326
    crs: L.CRS.Simple
  });
  map.setMinZoom(10); // min zoom, able to fit the map on min 270px width

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
    this.lZoomed = undefined; // Layer zoomed
    this.draw = function () {
      if (map.hasLayer(this.gsn)) {
        map.removeLayer(this.gsn);
        this.lZoomed = undefined;
        info.update(); // clear any info
      }
      this.gsn = L.geoJson(this.data,{
        style: this.dStyle,
        onEachFeature: this.onEach
      }).addTo(map);
      map.setMaxBounds(
        edBounds(this.gsn.getBounds(),'60%')
      );
      if (this.fit) {
        map.fitBounds(this.gsn.getBounds());
      }
    };
    // this.update = function () {
    //   function to update the layers based on c_res without
    //   removing and adding new gsn.
    // };
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
      weight: 1.2, //1.5,
      // dashArray: '3',
      color: '#2F2F2F', //'#3C3C3C', //#222,
      opacity: 1
    };
  }

  // Highlighted style
  gsnComCorr.hStyle = function (layer) {//(e) {
    // var layer = e.target;
    layer.setStyle({
      weight: 3, //2.5,
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
        // Change the style on hover only if zoomed out
        if (gsnComCorr.lZoomed == undefined) {
          gsnComCorr.hStyle(e.target);
        }
      },
      mouseout: function (e) {
        // Change the style when zoomed out
        if (gsnComCorr.lZoomed == undefined) {
          gsnComCorr.gsn.resetStyle(e.target);
        }
      },
      click: function (e) {
        // click on a layer when zoomed out
        if (gsnComCorr.lZoomed == undefined) {
          gsnComCorr.lZoomed = e.target; // save the layer
          map.fitBounds(e.target.getBounds()); // adjust zoom
          info.update(e.target.feature.properties); // Set info box
          gsnComCorr.hStyle(e.target); // highlight the layer.
        }
        // click on the same or a new layer
        else {
          map.fitBounds(gsnComCorr.gsn.getBounds()); // zoome out
          info.update(); // Clear Info box
          gsnComCorr.gsn.resetStyle(gsnComCorr.lZoomed); // Remove highlight from previously zoomed layer.
          gsnComCorr.lZoomed = undefined; // clear zoomed layer
        }
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
      this._div.style.visibility = 'hidden';
    } else {
      this._div.innerHTML = '<h4>' + properties.NOMBRE + '</h4>' +
                            '<h5>'+ properties.IDENTIFICA + '</h5>';
      this._div.style.visibility = 'visible';
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
    map,        // map handler
    info,       // handler to control the info box
    c_res,      // current resource
    gsnComCorr  // main geoJson handler
  };

}(); // End mapApp

/*
  +------------------------------------+
  | Start and execute application      |
  +------------------------------------+
*/
$(document).ready(function(){
  mapApp.gsnComCorr.draw();

  // Buttons behaviors
  $('#rec_selector label').click(function(){
      mapApp.c_res.label = $(this).attr('id');
      mapApp.gsnComCorr.draw();
  });

});
