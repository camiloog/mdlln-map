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
    var p = new Number(percent.replace('%','')) / 100 + 1;
    // center of the bounds
    var center = bounds.getCenter();
    var points = ['_northEast','_southWest'];
    var values = ['lat','lng'];
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
    +-----------------+
    | Popups behavior |
    +-----------------+
  */

    /* support maps */

    var sMapMouseover = function (layer) {
      if (layer.popupOpened != true) {
        layer.openPopup();
      }
    }

    var sMapMouseout = function (layer) {
      if (layer.popupOpened != true)
        layer.closePopup();
    }

    var sMapClick = function (layer) {
      layer.popupOpened = true;
      if (layer._icon != undefined) // is a marker
        layer.openPopup();
      // console.log(layer);
    }

    var sMapDblclick = function (layer) {
      // If we are zoomed in on a main layer
      if (gsnComCorr.lZoomed != undefined) {
        map.fitBounds(gsnComCorr.gsn.getBounds()); // zoome out
        info.update(); // Clear Info box
        gsnComCorr.gsn.resetStyle(gsnComCorr.lZoomed); // Remove highlight from previously zoomeC layer.
        if (gsnComCorr.lZoomed.isPopupOpen()) {
          // console.log('closing popup.');
          gsnComCorr.lZoomed.closePopup();
        }
        gsnComCorr.lZoomed = undefined; // clear zoomed layer
      }
      // remove extra data
      extraData_update();
    }

    /* main layers */

    var mainMouseover = function (layer) {
      // Change the style on hover only if zoomed out
      if (gsnComCorr.lZoomed == undefined) {
        gsnComCorr.hStyle(layer);
        // gsnComCorr.gsn.bringToBack();
      }
      if (layer.popupOpened != true)
        layer.openPopup();
    }

    var mainMouseout = function (layer) {
      // Change the style when zoomed out
      if (gsnComCorr.lZoomed == undefined) {
        gsnComCorr.gsn.resetStyle(layer);
        // gsnComCorr.gsn.bringToBack();
      }
      if (layer.popupOpened != true)
        layer.closePopup();
    }

    var mainClick = function (layer) {
      // console.log('clicked');
      // click on a layer when zoomed out
      if (gsnComCorr.lZoomed == undefined) {
        layer.popupOpened = true; // the popup opens
      }
      // click on a layer when zoomed in
      else {
        // if the layer is the zoomed layer
        if (gsnComCorr.lZoomed == layer) {
        }
        // if the layer is not the zoomed layer
        else {
          layer.popupOpened = true; // the popup opens
        }
        // if (layer.isPopupOpen()){
        //   layer.closePopup();
        // }
      }
      // console.log(layer);
    }

    var mainDblclick = function (layer) {
      // console.log('dblclicked');
      // dblclick on a layer when zoomed out
      if (gsnComCorr.lZoomed == undefined) {
        gsnComCorr.lZoomed = layer; // save the layer
        map.fitBounds(layer.getBounds()); // adjust zoom
        info.update(layer); // Set info box
        gsnComCorr.hStyle(layer); // highlight the layer.
      }
      // dblclick on a layer when zoomed in
      else {
        if (gsnComCorr.lZoomed.popupOpened){
          gsnComCorr.lZoomed.closePopup();
        }
        // the layer is not the zoomed layer
        if (gsnComCorr.lZoomed != layer) {
          if (layer.popupOpened){
            layer.closePopup();
          }
        }
        map.fitBounds(gsnComCorr.gsn.getBounds()); // zoome out
        info.update(); // Clear Info box
        gsnComCorr.gsn.resetStyle(gsnComCorr.lZoomed); // Remove highlight from previously zoomed layer.
        gsnComCorr.lZoomed = undefined; // clear zoomed layer
      }
      // Add extra info to the side-bar
      extraData_update(layer.feature.properties);
      // sMaps.bringToFront();
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
    doubleClickZoom: false,
    attributionControl: false,
    maxBoundsViscosity: 0.1, // how hard bounce in bounds
    // crs: L.CRS.EPSG4326
    crs: L.CRS.Simple
  });
  map.setMinZoom(10); // min zoom, able to fit the map on min 270px width
  map.doubleClickZoom.disable(); // to allow other double clicks callbacks

  // add north image
  var north = L.control({position: 'topleft'});
  north.onAdd = function(map) {
      var div = L.DomUtil.create('div','north');
      div.innerHTML = '<img src="./styles/images/north.png">';
      return div;
  }
  north.addTo(map);

  /*
    +-------------------------------------+
    | Objects to handle resources options |
    +-------------------------------------+
  */

  /* res : Resource constructor
   * label - label of the resources
   * color - color assigned to the resource
   */
  function res(label, color, className, nombre, glyphicon){
      this.label = label;
      this.color = color;
      this.className = className;
      this.nombre = nombre;
      this.glyphicon = glyphicon;
  }

  // Object literal to conein all the resources information
  var resources = {
    REC_AGUA : new res('REC_AGUA' ,'#3b87c8','dblue','Agua','glyphicon-tint'),
    REC_SUELO: new res('REC_SUELO','#bf864a','lgreen','Suelo','glyphicon-globe'),
    REC_AIRE : new res('REC_AIRE' ,'#5bc0de','lblue','Aire','glyphicon-cloud'),
    FAUNA_DOM: new res('FAUNA_DOM','#f0ad4e','lyellow','Fauna Doméstica','glyphicon-home'),
    SOCIOCULT: new res('SOCIOCULT','#de6764','lred','Sociocultural','glyphicon-user'),
    REC_FLORA: new res('REC_FLORA','#5cb85c','dpurple','Flora','glyphicon-tree-deciduous'),
    NONE     : new res('NONE'     ,'#f8f8f8','','','')
  };
  // console.log(resources);

  /* Object to handle the current resource,
   * initialized with NONE.
   * modifi with: c_res.label = new_label;
   * get with: c_res.color();
   */
  var c_res = new res(
    'NONE',
    function () {return resources[this.label].color},
    function () {return resources[this.label].className},
    function () {return resources[this.label].nombre},
    function () {return resources[this.label].glyphicon}
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
    +--------------+
    | Support maps |
    +--------------+
  */
  var sMaps = function () {

    // Layer gorup to hold the geoJson objects ready for map
    var lGroup = L.layerGroup([]);

    // function to get geoJson files
    function getGeoJson(address, obj) {
      return $.ajax({
          'global': false,
          'url': address,
          // 'timeout': 5000,
          'dataType': 'json',
          'success': function (data) {
            // console.log('generating gsn for:' +obj.name);
            if (obj.type == 'Point'){
              obj.gsn = L.geoJson(data,{
                pointToLayer: function (feature, latlng) {
                  var myIcon = L.divIcon({
                    className: obj.dStyle.class,
                    popupAnchor:  [5,0],
                    html: '<span class="glyphicon glyphicon-map-marker icon-marker" aria-hidden="true"></span>'
                  });
                  return L.marker(latlng, {icon: myIcon});
                },
                onEachFeature: obj.onEach
              });
            } else {
              obj.gsn = L.geoJson(data,{
                style: obj.dStyle,
                onEachFeature: obj.onEach,
              });
            }
            // console.log('Success on getting :' + address);
            update();
          },
          'error': function (XMLHttpRequest, textStatus, errorThrown) {
            console.log('Error on HttpRequest!');
          }
      });
    }

    function getPopupMsg (properties) {
      var msg = '';
      if (properties.NOMBRE != undefined && properties.NOMBRE != 'Sin Información')
        msg = msg + properties.NOMBRE;
      if (properties.ELEMENTO != undefined)
        msg = msg + properties.ELEMENTO;
      if (properties.CATEGORIA != undefined)
        if (properties.NOMBRE != 'Sin Información'){
          msg = msg + ',<br>' + properties.CATEGORIA;
        }
        else {
          msg = msg + properties.CATEGORIA;
        }
      if (properties.ADMINISTRA != undefined)
        msg = msg + ',<br>' + properties.ADMINISTRA;
      if (properties.TIPO != undefined)
        msg = msg + ',<br>' + properties.TIPO;
      if (msg != '')
        return msg;
      else
        return undefined;
    }

    // Function to add callbacks to each path of sMap
    function toEach (feature, layer) {

      // flag to indicate user popup opened
      layer.popupOpened = false;

      var msg = getPopupMsg(feature.properties);
      if (msg != undefined) {
        layer.bindPopup(
          msg,{
            autoPan: false,
            autoClose:false,
            closeOnClick:false//,
            // closeButton:false
          }
        )
      }

      layer.on({
        mouseover: function (e) {
          sMapMouseover(e.target);
        },
        mouseout: function (e) {
          sMapMouseout(e.target);
        },
        click: function (e) {
          sMapClick(e.target);
        },
        dblclick: function (e) {
          sMapDblclick(e.target);
        },
        popupclose: function (e) {
          e.target.popupOpened = false;
        }
      });
    }

    // Support map constructor
    function sMap (name,type,address, dStyle) {
      this.get = function () {
        // Request for the data
        return getGeoJson(address,this);
      };
      this.name = name;
      this.type = type;
      this.requested = false;
      this.address = address;
      this.dStyle = dStyle;
      this.onEach = toEach;
    }

    // layers of support maps
    var layers = {
      rio : new sMap('Rio Medellín','Polygon','./support_maps/rio.geojson',{fillColor: '#003A70', fillOpacity: 1, weight: 1.2, color: '#003A70', opacity: 1}),
      quebradas_z0 : new sMap('Quebradas','Line','./support_maps/quebradas_z0.geojson',{fillColor: '#003A70', fillOpacity: 1, weight: 2, color: '#003A70', opacity: 1}),
      quebradas_z2 : new sMap('Quebradas','Line','./support_maps/quebradas_z2.geojson',{fillColor: '#003A70', fillOpacity: 1, weight: 2, color: '#003A70', opacity: 1}),
      retiros : new sMap('Retiros a quebradas','Polygon','./support_maps/retiros.geojson',{fillColor: '#003A70', fillOpacity: 0.2, weight: 1, color: '#003A70', opacity: 1}),
      barrio : new sMap('Limite barrios y veredas','Polygon','./support_maps/barrio.geojson',{fillColor: 'transparent',fillOpacity: 0, weight: 1, dashArray: '2', color: '#777777', opacity: 1}),
      ciclorutas : new sMap('Ciclorutas','Line','./support_maps/ciclorutas.geojson',{fillOpacity: 0, weight: 2, color: '#AB3431', opacity: 1}),
      metro : new sMap('Sitema Metro','Line','./support_maps/metro.geojson',{fillOpacity: 0, weight: 2, color: '#106C10', opacity: 1}),
      esp_publico : new sMap('Espacio público','Polygon','./support_maps/esp_publico.geojson',{fillColor: '#D37E06', fillOpacity: 0.2, weight: 1, color: '#D37E06', opacity: 1}),
      plantas_potab : new sMap('Plantas de potabilización','Point','./support_maps/plantas_potab.geojson',{class: 'icon_plantas_potab'}),
      humedales : new sMap('Humedales','Polygon','./support_maps/humedales.geojson',{fillColor: '#003A70', fillOpacity: 0.5, weight: 1, color: '#003A70', opacity: 1}),
      c_acopio : new sMap('Centros de acopio de residuos','Point','./support_maps/c_acopio.geojson',{class: 'icon_c_acopio'}),
      s_orografico : new sMap('Sistema orográfico','Polygon','./support_maps/s_orografico.geojson',{fillColor: '#733A00', fillOpacity: 0.2, weight: 1, color: '#733A00', opacity: 1}),
      cv_residuos : new sMap('Compraventas de residuos','Point','./support_maps/cv_residuos.geojson',{class: 'icon_cv_residuos'}),
      proteg : new sMap('Areas protegidas','Polygon','./support_maps/proteg.geojson',{fillColor: '#CC0000', fillOpacity: 0.2, weight: 1, color: '#CC0000', opacity: 1}),
      conect_eco : new sMap('Conectividad ecólogica','Polygon','./support_maps/conect_eco.geojson',{fillColor: '#00E600', fillOpacity: 0.2, weight: 1, color: '#00E600', opacity: 1}),
      equip_z0 : new sMap('Equipamientos','Polygon','./support_maps/equip_z0.geojson',{fillOpacity: 0, weight: 0.9, color: '#777777', opacity: 1}),
      equip_z1 : new sMap('Equipamientos','Polygon','./support_maps/equip_z1.geojson',{fillOpacity: 0, weight: 0.9, color: '#777777', opacity: 1}),
      equip_z2 : new sMap('Equipamientos','Polygon','./support_maps/equip_z2.geojson',{fillOpacity: 0, weight: 0.9, color: '#777777', opacity: 1}),
      int_cultural : new sMap('Interés cultural','Polygon','./support_maps/int_cultural.geojson',{fillOpacity: 0, weight: 0.9, color: '#B96400', opacity: 1})
    }

    // layers to separate support maps for resource and zoom level
    var res_ = {
      REC_AGUA : {
        z0: ['rio','quebradas_z0','equip_z0'],
        z1: ['barrio','ciclorutas','metro','plantas_potab','humedales'],
        z2: ['quebradas_z2','retiros']
      },
      REC_SUELO : {
        z0: ['rio','equip_z0'],
        z1: ['barrio','ciclorutas','metro','c_acopio','s_orografico','cv_residuos','equip_z1'],
        z2: ['equip_z1']
      },
      REC_AIRE : {
        z0: ['rio','equip_z0'],
        z1: ['barrio','ciclorutas','metro','esp_publico','s_orografico'],
        z2: ['conect_eco']
      },
      FAUNA_DOM : {
        z0: ['rio','equip_z0'],
        z1: ['barrio','ciclorutas','metro','esp_publico','equip_z1'],
        z2: ['equip_z2']
      },
      SOCIOCULT : {
        z0: ['rio','equip_z0'],
        z1: ['barrio','ciclorutas','metro','esp_publico','equip_z1'],
        z2: ['equip_z2','int_cultural']
      },
      REC_FLORA : {
        z0: ['rio','equip_z0'],
        z1: ['barrio','ciclorutas','metro','s_orografico','proteg'],
        z2: ['conect_eco']
      },
      NONE : {
        z0: ['rio'],
        z1: ['barrio','metro'],
        z2: []
      }
    };

    // Zoom levels
    var z = {
      z0 : 10,
      z1 : 12,
      z2 : 14
    };

    var order = [
      'barrio',
      'retiros',
      'proteg',
      'conect_eco',
      's_orografico',
      'esp_publico',
      'ciclorutas',
      'metro',
      'plantas_potab',
      'c_acopio',
      'cv_residuos',
      'equip_z0',
      'equip_z1',
      'equip_z2',
      'int_cultural',
      'humedales',
      'quebradas_z2',
      'quebradas_z0',
      'rio'
    ];

    function order_sMaps () {
      // console.log('ordering:');
      $.each(order,function (i,v){
        if (layers[v].gsn != undefined) {
          if (lGroup.hasLayer(layers[v].gsn)) {
            // console.log(v);
            layers[v].gsn.bringToFront();
          }
        }
      });
    }

    // function to add the group of support layers to map
    // this should be called just once
    function init () {
      return lGroup.addTo(map);
    }

    // Bring to front the layers on lGroup
    function bringToFront () {
      lGroup.eachLayer(function(l){
        l.bringToFront();
      });
    }

    function clean () {
      lGroup.clearLayers();
      legends.clear();
      $('#support-maps :checkbox').prop('checked', false);
    }

    // To update the layers on the support-maps
    function update () {
      // console.log('updating sMaps');
      // clear layers on group
      // lGroup.clearLayers();
      // uncheck all
      // $('#support-maps :checkbox').prop('checked', false);
      // zoom Handling
      $.each(z, function (cZ) {
        // console.log('evaluating: ' + cZ + ':' + z[cZ]);
        if (map.getZoom() >= z[cZ]){
          $.each(res_[c_res.label][cZ],function(i,v){
            // console.log('adding: ' + v);
            if (layers[v].gsn == undefined) {
              if (layers[v].requested == false) {
                layers[v].requested = true;
                layers[v].get();
              }
            } else {
              if (lGroup.hasLayer(layers[v].gsn) == false) { // Check if the layer is already on group
                lGroup.addLayer(layers[v].gsn);
                // console.log('Addig '+v+' type: '+layers[v].type);
                legends.addLayerLegend(v);
                $('#support-maps :checkbox[value=' + v + ']').prop('checked', true);
              }
            }
          });
        } else {
          $.each(res_[c_res.label][cZ],function(i,v){
            // console.log('removing: ' + v);
            if (layers[v].gsn == undefined) {
              if (layers[v].requested == false) {
                layers[v].requested = true;
                layers[v].get();
              }
            } else {
              if (lGroup.hasLayer(layers[v].gsn) == true) { // Check if the layer is already on group
                lGroup.removeLayer(layers[v].gsn);
                legends.removeLayerLegend(v);
                $('#support-maps :checkbox[value=' + v + ']').prop('checked', false);
              }
            }
          });
        }
      });
      order_sMaps();
    }

    // Add callback function for zoom event
    map.on('zoomend', function(e) {
      update();
    });


    /*
      +--------------------------+
      | Legends for support-maps |
      +--------------------------+
    */

    var legends = L.control({position: 'bottomleft'});
    legends.onAdd = function(map) {
        var div = L.DomUtil.create('div','legendsConteiner');
        $(div).html('<div class="legends"></div>');
        return div;
    }
    legends.clear = function () {
      $('.legends').html('');
    }
    legends.addLayerLegend = function (layerIndex) {// layer index
      var l = layerIndex;
      if (l == 'quebradas_z0' || l == 'quebradas_z2')
        l = 'quebradas';
      if (l == 'equip_z0' || l == 'equip_z1' || l == 'equip_z2')
        l = 'equip';

      if ($('.legends .'+l).length == 0) {

        $('.legends').append(
          '<div class="legendItem ' + l + '">' +
          ' <span class="legendText">' + layers[layerIndex].name + '</span>' +
          '</div>'
        );
        if (layers[layerIndex].type == 'Polygon') {
          $('.' + l).prepend('<svg width="20" height="10"></svg>');
          $('.' + l + ' svg').html(
            '<rect width="20" height="10"'+
            'fill="' + layers[layerIndex].dStyle.fillColor + '"'+
            'fill-opacity="' + layers[layerIndex].dStyle.fillOpacity + '"'+
            'stroke="' + layers[layerIndex].dStyle.color + '"'+
            'stroke-width="' + layers[layerIndex].dStyle.weight + '"'+
            'stroke-dasharray="' + layers[layerIndex].dStyle.dashArray + '"'+
            '>'
          );
        }
        if (layers[layerIndex].type == 'Point') {
          $('.' + l).prepend(
            '<span class="glyphicon glyphicon-map-marker icon-marker ' +
            layers[layerIndex].dStyle.class +
            '" aria-hidden="true"></span>'
          );
        }
        if (layers[layerIndex].type == 'Line') {
          $('.' + l).prepend('<svg width="20" height="10"></svg>');
          $('.' + l + ' svg').html(
            '<line x1="0" x2="20" y1="10" y2="0" width="20" height="10"'+
            'stroke="' + layers[layerIndex].dStyle.color + '"'+
            'stroke-width="' + layers[layerIndex].dStyle.weight + '"'+
            'stroke-dasharray="' + layers[layerIndex].dStyle.dashArray + '"'+
            '>'
          );
        }

      }
    }
    legends.removeLayerLegend = function (layerIndex) {
      var l = layerIndex;
      if (l == 'quebradas_z0' || l == 'quebradas_z2')
        l = 'quebradas';
      if (l == 'equip_z0' || l == 'equip_z1' || l == 'equip_z2')
        l = 'equip';
      $('.legends .'+l).remove();
    }
    legends.updateSupportLegends = function (cres) {
      $('.legends .comcorr').remove();
      $('.legends .cres').remove();
      $('.legends').append(
        '<div class="legendItem comcorr">' +
        '  <svg width="20" height="10">' +
        '    <rect width="20" height="10"' +
        '    fill="transparent"' +
        '    fill-opacity="1"' +
        '    stroke="#2F2F2F"' +
        '    stroke-width="1.2">' +
        '    </rect>' +
        '  </svg>' +
        '  <span class="legendText">Limite comunas y corregimientos</span>' +
        '</div>');
        // console.log('adding legend for '+resources[cres].nombre);
      if (cres != 'NONE') {
        $('.legends').append(
          '<div class="legendItem cres">' +
          '  <svg width="20" height="10">' +
          '    <rect width="20" height="10"' +
          '    fill="' + resources[cres].color + '"' +
          '    fill-opacity="1"' +
          '    stroke="#2F2F2F"' +
          '    stroke-width="1.2">' +
          '    </rect>' +
          '  </svg>' +
          '  <span class="legendText">Problemáticas con recurso ' +
          resources[cres].nombre +
          '</span>' +
          '</div>'
        );
      }
    }
    legends.toggle = function () {
      if ($('#legendsHidden').length == 0) {
        $('.legends').hide();
        $('.legendsConteiner').append(
          '<span id="legendsHidden" class="glyphicon glyphicon-list" aria-hidden="true" style="font-size:20px;"></span>'
        );
      }
      else {
        $('#legendsHidden').remove();
        $('.legends').show();
      }
    }
    legends.addTo(map);
    $('.legendsConteiner').click(function(e){
      legends.toggle();
    });

    /* Return public objects */
    return {
      layers,
      lGroup,
      init,
      update,
      clean,
      bringToFront,
      res,
      order_sMaps,
      legends
    };
  }();



  /*
    +------------------------+
    | Main Map GeoJson layer |
    +------------------------+
  */

  /* gsn : GeoJson layer constructor
   * data   - geoJson data
   * dStyle - function, return style for the features
   * onEach - function to apply on each feature
   * fit    - boolean to auto zoom or not
   */

   // function to add extra info to the sidebar according to layer
   function extraData_update (properties) {
     if (properties == undefined) {
      //  console.log('properties undefined');
       $('.extraData').remove();
     } else {
       // Add extra info to side-bar
       if (properties.EXTRADATA != undefined) {
         if (properties.EXTRADATA[c_res.label] != undefined){
          //  console.log('EXTRA:' + properties.EXTRADATA[c_res.label]);
           $('#di-row').append(
             '<div class="row extraData"><div class="sep sep-' + c_res.className() + '"></div>' +
             '  <div class="desc col-xs-12">' + properties.EXTRADATA[c_res.label] + '</div>' +
             '</div>'
           );
         }
       }
     }
   }

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
      } else {
        this.fit = true;
      }
      sMaps.update();
      sMaps.bringToFront();
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
      sMaps.bringToFront();
    }
  }

  // Add event listeners for each layer of main geoJson layer
  gsnComCorr.onEach = function (feature, layer) {

    layer.popupOpened = false;
    if (feature.properties.NOMBRE != undefined) {
      layer.bindPopup(
        feature.properties.IDENTIFICA + '<br>' +
        feature.properties.NOMBRE,{
          autoPan: false,
          autoClose:false,
          closeOnClick:false//,
          // closeButton:false
        }
      )
    }

    layer.on({
      mouseover: function (e) {
        mainMouseover(e.target);
      },
      mouseout: function (e) {
        mainMouseout(e.target);
      },
      click: function (e) {
        mainClick(e.target);
      },
      dblclick: function (e) {
        mainDblclick(e.target);
      },
      popupclose: function (e) {
        e.target.popupOpened = false;
      }
    });
  }

  // open all popups of layers from gsnComCorr related width c_res
  function open_c_res_popups () {
    $.each(gsnComCorr.gsn._layers, function(i,v){
      if (v.feature.properties[c_res.label] == 1){
        v.popupOpened = true;
        v.openPopup();
        // console.log(v);
      }
    });
  }

  /*
    +------------------------------------+
    | Custom information box for the map |
    +------------------------------------+
  */

  function getLayer (gsnobj, code) {
    var layer = undefined;
    $.each(gsnobj._layers, function(i,v){
      // console.log('looking for:'+code+' on:'+v.feature.properties.CODIGO);
      if (v.feature.properties.CODIGO == code) {
        // console.log('found');
        layer = v;
      }
    });
    return layer;
  }

  var info = L.control(); // default topright
  info.update = function (target) {
    if (target == undefined) {
      this._div.innerHTML = '';
      this._div.style.visibility = 'hidden';
    } else {
      var p = target.feature.properties;
      this._div.innerHTML = '<h4>' + p.NOMBRE + '</h4>' +
                            '<h5>'+ p.IDENTIFICA + '</h5>';
      this._div.style.visibility = 'visible';
      // Add glyphicons
      $.each(resources,function(index){
        if (p[index] == 1) {
          $('div.info-conteiner.leaflet-control').append(
            '&nbsp<span class="iconRes glyphicon ' +
            resources[index].glyphicon +
            ' color-' + resources[index].className +
            ' icon-' + resources[index].label +
            '" aria-hidden="true"' +
            ' title="' + resources[index].nombre + '"' +
            '></span>'
          );
        }
      });
      // add gliphicons active style
      $('.iconRes').removeClass('active');
      if (c_res.label != 'NONE') {
        $('.icon-' + c_res.label).addClass('active');
      }
      // Add glyphicons click callbacks
      $('.iconRes').click(function(){
        // get res label from glyphicon
        $('#rec_selector button').removeClass('active');
        var res = 'NONE';
        var classes = ($(this).attr('class')).split(' ');
        $.each(classes, function(i, c) {
            if (c.indexOf('icon-') == 0) {
                res = c.slice(+5);
            }
        });
        c_res.label = res;
        // simulate click on resource button
        $('#' + c_res.label).addClass('active');
        sMaps.clean();
        gsnComCorr.fit = false;
        gsnComCorr.draw();
        dInfo.update(c_res);
        mapApp.sMaps.legends.updateSupportLegends(mapApp.c_res.label);
        // reset target comcorr, get layer from new gsn object
        var code = target.feature.properties.CODIGO;
        target = getLayer(gsnComCorr.gsn, code);
        // console.log('restored layer:');
        // console.log(target);
        // simulate click on layer click on comcorr
        gsnComCorr.lZoomed = target;
        info.update(target);
        gsnComCorr.hStyle(target);
        extraData_update(target.feature.properties);
        // Reopen popup
        target.openPopup();
        target.popupOpened = true;
        // console.log('clicked:'+res);
      });
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
    gsnComCorr,  // main geoJson handler
    resources,
    sMaps,
    open_c_res_popups
  };

}(); // End mapApp

/*
  +---------------------+
  | Dinamic Info update |
  +---------------------+
*/

var dInfo = function () {

  function removeClassWidth (selector, content) {
    var classes = ($(selector).attr('class')).split(' ');
    $.each(classes, function(i, c) {
        if (c.indexOf(content) == 0) {
            $(selector).removeClass(c);
        }
    });
  }

  var update = function (c_res) {

    $('#di-row').empty();

    if (c_res.label == 'NONE') {
      $('#di-row').append(
        '<div class="row">' +
        ' <div id="resName"class="col-xs-12"><h2>Bienvenido</h2></div>' +
        '</div>' +
        '<div class="row headings">' +
        '  <div class="descHeader col-xs-12"><h3>Manual de Usuario</h3></div>' +
        '</div>'
      );

      $.each(r_data[c_res.label], function (i) {
        var u = r_data[c_res.label][i]['USAGE'];
        if (r_data[c_res.label][i]['GIF'] != undefined) {
          var i = r_data[c_res.label][i]['GIF'];
          $('#di-row').append(
            '<div class="row"><div class="sep"></div>' +
            '  <div class="desc col-xs-12">' + u + '</div>' +
            '  <img src="' + i + '">' +
            '</div>'
          );
        } else {
          $('#di-row').append(
            '<div class="row"><div class="sep"></div>' +
            '  <div class="desc col-xs-12">' + u + '</div>' +
            '</div>'
          );
        }
      });

    }
    else {
      $('#di-row').append(
        '<div class="row">' +
        ' <div id="resName"class="col-xs-12"><h2>' + c_res.nombre() + '</h2></div>' +
        '</div>' +
        '<div class="row headings">' +
        '  <div class="descHeader col-xs-12"><h3>Problemáticas</h3></div>' +
        // '  <div class="desc col-xs-6"><h3>Descripción</h3></div>' +
        // '  <div class="fase col-xs-6"><h3>Fase corta</h3></div>' +
        '</div>'
      );

      $.each(r_data[c_res.label], function (i) {
        var d = r_data[c_res.label][i]['DESCRIPCIÓN'];
        // var f = r_data[c_res.label][i]['FRASE_CORTA'];
        $('#di-row').append(
          '<div class="row"><div class="sep"></div>' +
          '  <div class="desc col-xs-12">' + d + '</div>' +
          // '  <div class="desc col-custom">' + d + '</div>' +
          // '  <div class="fase col-custom">' + f + '</div>' +
          '</div>'
        );
      });

      removeClassWidth('#resName','color');
      $('#resName').addClass('color-'+ c_res.className());
      removeClassWidth('.sep','sep-');
      $('.sep').addClass('sep-'+ c_res.className());
    }

  }

  return {
      update
  }

}();

/*
  +------------------------------------+
  | Start and execute application      |
  +------------------------------------+
*/
$(document).ready(function(){

  // Add glyphicons
  // $.each(mapApp.resources,function(index){
  //   $('#'+index).append(
  //     '&nbsp<span class="glyphicon ' +
  //     mapApp.resources[index].glyphicon +
  //     '" aria-hidden="true"></span>'
  //   );
  // });

  // update dynamic info
  // dInfo.update(mapApp.c_res);

  // Draw main map
  mapApp.gsnComCorr.draw();

  // Resource buttons behavior
  $('#rec_selector button').click(function(){
      $('#rec_selector button').removeClass('active');
      $(this).addClass('active');
      mapApp.c_res.label = $(this).attr('id');
      mapApp.sMaps.clean();
      mapApp.gsnComCorr.draw();
      dInfo.update(mapApp.c_res);
      mapApp.sMaps.legends.updateSupportLegends(mapApp.c_res.label);
      // mapApp.open_c_res_popups(); // Open popups asociated width current ress
  });

  // Add support-legends
  mapApp.sMaps.legends.updateSupportLegends(mapApp.c_res.label);

  // Add checkbox handling
  $('#support-maps :checkbox').change(function() {
    var l = $(this).val();
    if (this.checked) {
      // console.log(l + ' it\'s been checked')
      if (mapApp.sMaps.layers[l].gsn == undefined) {
        if (mapApp.sMaps.layers[l].requested == false) {
          mapApp.sMaps.layers[l].requested = true;
          $.when(mapApp.sMaps.layers[l].get())
           .done(function () {
             mapApp.sMaps.lGroup.addLayer(
              mapApp.sMaps.layers[l].gsn
             );
             mapApp.sMaps.legends.addLayerLegend(l);
             mapApp.sMaps.order_sMaps();
             $('#support-maps :checkbox[value=' + l + ']').prop('checked', true);
           });
        }
      } else {
        mapApp.sMaps.lGroup.addLayer(
          mapApp.sMaps.layers[l].gsn
        );
        mapApp.sMaps.legends.addLayerLegend(l);
        mapApp.sMaps.order_sMaps();
      }
    } else {
      // console.log(l + 'it\'s been unchecked');
      if (mapApp.sMaps.layers[l].gsn != undefined) {
        mapApp.sMaps.lGroup.removeLayer(
          mapApp.sMaps.layers[l].gsn
        );
        mapApp.sMaps.legends.removeLayerLegend(l);
      }
    }
  });

  // init support maps
  mapApp.sMaps.init();

});
