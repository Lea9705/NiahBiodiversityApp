// The page that is shown inside the map. It uses Leaflet, the same map
// library as the website, with the same three map styles (Map, Terrain and
// Satellite), the same teardrop pin and the same zoom settings.
//
// The app sends the pins to this page with window.setPins([...]). When someone
// taps "Open record" in a pin's popup, the page sends { type: 'open', id }
// back to the app.
export const LEAFLET_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; }
  body { background: #e6eee4; font-family: -apple-system, Roboto, Arial, sans-serif; }
  #message {
    display: none; position: absolute; left: 20px; right: 20px; top: 40%;
    z-index: 1000; text-align: center; font-size: 14px; line-height: 20px;
    color: #3d4f41; background: #ffffff; border-radius: 12px; padding: 16px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  }
  .niah-pin { background: transparent; border: 0; }
  .niah-popup { min-width: 150px; }
  .niah-popup-title { font-weight: 700; font-size: 14px; margin: 0 0 2px 0; color: #17261c; }
  .niah-popup-sci { font-style: italic; font-size: 12px; margin: 0 0 8px 0; color: #4b5b4f; }
  .niah-popup-button {
    display: block; width: 100%; border: 0; border-radius: 8px; padding: 8px 10px;
    background: #2a7a45; color: #ffffff; font-size: 13px; font-weight: 700;
  }
</style>
</head>
<body>
<div id="map"></div>
<div id="message"></div>
<script>
(function () {
  var DEFAULT_CENTER = [3.816, 113.784];
  var DEFAULT_ZOOM = 10;
  var FOCUS_ZOOM = 19;
  var MAX_ZOOM = 22;

  var CSS_URLS = [
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
  ];
  var JS_URLS = [
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
  ];

  var map = null;
  var pinLayer = null;

  function post(message) {
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    } catch (e) {}
  }

  function showMessage(text) {
    var box = document.getElementById('message');
    box.textContent = text;
    box.style.display = 'block';
  }

  function loadCss(urls) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = urls[0];
    link.onerror = function () {
      if (urls.length > 1) loadCss(urls.slice(1));
    };
    document.head.appendChild(link);
  }

  function loadScript(urls, done, fail) {
    var script = document.createElement('script');
    script.src = urls[0];
    script.onload = done;
    script.onerror = function () {
      if (urls.length > 1) loadScript(urls.slice(1), done, fail);
      else fail();
    };
    document.head.appendChild(script);
  }

  // The teardrop pin from the website. Only common plants get a pin.
  function pinIcon() {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="38" height="52" viewBox="0 0 44 60" ' +
      'style="display:block;overflow:visible;filter:drop-shadow(0 3px 3px rgba(15,23,42,0.35))">' +
      '<path d="M22 2C10.95 2 2 10.95 2 22C2 37 22 58 22 58C22 58 42 37 42 22C42 10.95 33.05 2 22 2Z" ' +
      'fill="#16a34a" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>' +
      '<circle cx="22" cy="21" r="8" fill="#ffffff"/></svg>';

    return L.divIcon({
      className: 'niah-pin',
      html: svg,
      iconSize: [38, 52],
      iconAnchor: [19, 50],
      popupAnchor: [0, -46]
    });
  }

  // The text is added as plain text, never as HTML, so a plant name can
  // never run code.
  function popupContent(pin) {
    var box = document.createElement('div');
    box.className = 'niah-popup';

    var title = document.createElement('p');
    title.className = 'niah-popup-title';
    title.textContent = pin.common || pin.scientific || 'Plant';
    box.appendChild(title);

    if (pin.common && pin.scientific) {
      var sci = document.createElement('p');
      sci.className = 'niah-popup-sci';
      sci.textContent = pin.scientific;
      box.appendChild(sci);
    }

    var button = document.createElement('button');
    button.className = 'niah-popup-button';
    button.textContent = 'Open record';
    button.addEventListener('click', function () {
      post({ type: 'open', id: pin.id });
    });
    box.appendChild(button);

    L.DomEvent.disableClickPropagation(box);

    return box;
  }

  function setup() {
    map = L.map('map', {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      maxZoom: MAX_ZOOM
    });

    var baseLayers = {
      'Map': L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxNativeZoom: 19,
        maxZoom: MAX_ZOOM
      }),
      'Terrain': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
        maxNativeZoom: 17,
        maxZoom: MAX_ZOOM
      }),
      'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, and the GIS User Community',
        maxNativeZoom: 19,
        maxZoom: MAX_ZOOM
      })
    };

    baseLayers['Map'].addTo(map);
    L.control.layers(baseLayers, null, { position: 'bottomleft', collapsed: true }).addTo(map);

    pinLayer = L.layerGroup().addTo(map);

    window.addEventListener('resize', function () {
      map.invalidateSize();
    });

    post({ type: 'ready' });
  }

  // Replaces all pins, then moves the map to show them (like the website).
  window.setPins = function (pins) {
    if (!map) return;

    pinLayer.clearLayers();

    var points = [];

    (pins || []).forEach(function (pin) {
      if (typeof pin.lat !== 'number' || typeof pin.lng !== 'number') return;

      var marker = L.marker([pin.lat, pin.lng], {
        icon: pinIcon(),
        title: pin.common || pin.scientific || '',
        riseOnHover: true
      });

      marker.bindPopup(popupContent(pin), { closeButton: false });
      marker.addTo(pinLayer);
      points.push([pin.lat, pin.lng]);
    });

    if (points.length === 1) {
      map.setView(points[0], FOCUS_ZOOM);
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: FOCUS_ZOOM });
    } else {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    }
  };

  loadCss(CSS_URLS);

  loadScript(JS_URLS, setup, function () {
    showMessage('The map could not load. Check your internet connection and try again.');
    post({ type: 'error', message: 'The map library could not be loaded.' });
  });
})();
</script>
</body>
</html>`;
