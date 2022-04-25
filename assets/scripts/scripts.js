
  var map = L.map('map', {
      center: [32,0],
      zoom: 1.5,
      maxZoom: 18,
      minZoom: 1,
      detectRetina: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  var Refugee_hosting = null;
  var colors = chroma.scale('OrRd').mode('hcl').colors(5);
  for (i = 1; i < 5; i++) {
      $('head').append($("<style> .marker-color-" + (i + 1).toString() + " { color: " + colors[i] + "; font-size: 15px; text-shadow: 0 0 3px #ffffff;} </style>"));
  }
  Refugee_hosting = L.geoJson.ajax("assets/refdata.geojson",{
    onEachFeature: function (feature, layer) {
         layer.bindPopup( "<h3>" +
                feature.properties.name +
                "</h3><p>" +
                "Total Population: " +
                feature.properties.HostPopulation +
                "</p>",
                //"<img src='" +
              //  feature.properties.img +
              {
                maxWidth: "auto",
              }
            );
       },
  pointToLayer: function(feature, latlng) {
      var id = 0;
      if (feature.properties.rclass == 1) { id = 0; }
      else if (feature.properties.rclass == 2)  { id = 1; }
      else if (feature.properties.rclass == 3)  { id = 2; }
      else if (feature.properties.rclass == 4)  { id = 3; }
      else { id = null;}
      return L.marker(latlng, {icon: L.divIcon({className: 'fab fa-solid fa-people-pulling marker-color-' + (id + 2).toString() })
    })

    ;
    },
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <a href="https://thematicmapping.org">Bjorn Sandvik</a> Shapefile | <a href="https://www.unhcr.org/data.html">UNHCR Data</a> &copy; | <a href="https://data.worldbank.org">World Bank Data</a> &copy; | Map Author: Jason Ehlenberger'
  });

  Refugee_hosting.addTo(map);

  colors = chroma.scale('greens').colors(5);

  function setColor(GDP) {
      var id = 0;
      if (GDP > 71742) { id = 4; }
      else if (GDP > 44491 && GDP <= 71742) { id = 3; }
      else if (GDP > 22793 && GDP <= 44491) { id = 2; }
      else if (GDP > 9506 && GDP <= 22793) { id = 1; }
      else  { id = 0; }
      return colors[id];
  }
  function style(feature) {
      return {
          fillColor: setColor(feature.properties.GDP),
          fillOpacity: 0.8,
          weight: 0.2,
          opacity: 1,
          color: 'black'
      };
  }
  var geojson = null;

  var info = L.control();

  info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;

  };

  info.update = function (properties) {
      this._div.innerHTML = '<h3>Refugee Hosting vs GDP</h3>' +  (properties ?
          '<b>' + properties.NAME + '</b><br />' + properties.Refugees + ' refugees'
          + '<br />'
          + ' GK$' + properties.GDP + ' GDP(PPP)'
          : 'Hover over a country');
  };

  info.addTo(map);

function highlightFeature(e) {

  var layer = e.target;

      layer.setStyle({
          weight: 2,
          opacity: 0.8,
          color: 'black',
  });

  layer.bringToFront();


  info.update(layer.feature.properties);

  }


function zoomToFeature(e) {

  map.fitBounds(e.target.getBounds());

  }


function resetHighlight(e) {

  geojson.resetStyle(e.target);

  info.update();

  }

function onEachFeature(feature, layer) {

  layer.on({
    mouseover: highlightFeature,
    click: zoomToFeature,
    mouseout: resetHighlight

  });

  }

  geojson = L.geoJson.ajax("assets/gdpdata.geojson", {
      style: style,
      onEachFeature: onEachFeature

  }).addTo(map);
  var legend = L.control({position: 'bottomleft'});

  legend.onAdd = function () {

      var div = L.DomUtil.create('div', 'legend');
      div.innerHTML += '<b>GDP/PPP(GK$)</b><br />';
      div.innerHTML += '<i style="background: ' + colors[4] + '; opacity: 0.8"></i><p>71,742+</p>';
      div.innerHTML += '<i style="background: ' + colors[3] + '; opacity: 0.8"></i><p>44,491-71,741</p>';
      div.innerHTML += '<i style="background: ' + colors[2] + '; opacity: 0.8"></i><p>22,793-44,490</p>';
      div.innerHTML += '<i style="background: ' + colors[1] + '; opacity: 0.8"></i><p>9,506-22,792</p>';
      div.innerHTML += '<i style="background: ' + colors[0] + '; opacity: 0.8"></i><p> 0-9,505</p>';
      div.innerHTML += '<hr><b>Refugees per capita<b><br />';
      div.innerHTML += '<i class="fa-solid fa-people-pulling marker-color-5"></i><p>Very High</p>';
      div.innerHTML += '<i class="fa-solid fa-people-pulling marker-color-4"></i><p>High</p>';
      div.innerHTML += '<i class="fa-solid fa-people-pulling marker-color-3"></i><p>Medium</p>';
      div.innerHTML += '<i class="fa-solid fa-people-pulling marker-color-2"></i><p>Low</p>';
      return div;
  };

  legend.addTo(map);

  L.control.scale({position: 'bottomright'}).addTo(map);

  var popup = L.popup();
