let ol = require('ol');
let TileLayer = require('ol/layer').Tile;
let OSM = require('ol/source').OSM;
let defaultControls = require('ol/control').defaults;
let ScaleLine = require('ol/control').ScaleLine;

function init() {
  let raster = new TileLayer({
    source: new OSM()
  });

  const scaleLineControl = new ScaleLine();
  scaleLineControl.setUnits('metric');

  const map = new ol.Map({
    controls: defaultControls().extend([
      scaleLineControl
    ]),
    layers: [raster],
    target: 'map',
    view: new ol.View({
      center: [3314687, 8379464],
      zoom: 14,
      projection: 'EPSG:3857'
    }),
    renderer: "canvas"

  });
  return map;
}

module.exports = init;