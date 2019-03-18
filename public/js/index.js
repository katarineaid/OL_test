const Guid = require('uuid/v4');

let FileSaver = require('file-saver');

let AbstractMap = require('./abstractMap');

let initMap = require('./initMap');

let GeoJSON = require('ol/format').GeoJSON;
let VectorSource = require('ol/source').Vector;
let VectorLayer = require('ol/layer').Vector;
let getLength = require('ol/sphere').getLength;
let LineString = require('ol/geom').LineString;
let Style = require('ol/style').Style;
let Circle = require('ol/style').Circle;
let Fill = require('ol/style').Fill;
let Stroke = require('ol/style').Stroke;

class Map extends AbstractMap {
  constructor(params) {
    super(params);
    this.map = initMap();
    this.print = this.print.bind(this);
    this.addFeature = this.addFeature.bind(this);
    this.extent = this.extent.bind(this);
    this.goRight = this.goRight.bind(this);
    this.goLeft = this.goLeft.bind(this);
    this.goUp = this.goUp.bind(this);
    this.goDown = this.goDown.bind(this);
    this.getStyle = this.getStyle.bind(this);
    this.setStyle = this.setStyle.bind(this);
    this.landscape = this.landscape.bind(this);
    this.vertical = this.vertical.bind(this);
  }

  landscape() {
    const self = this;
    const resolution = 72
    let width = Math.round(297 * resolution / 25.4);
    let height = Math.round(210 * resolution / 25.4);

    const printSize = [width, height];
    const extent = self.map.getView().calculateExtent(printSize);
    self.map.setSize(printSize);
    self.map.getView().fit(extent, { size: printSize });
  }

  vertical() {
    const self = this;
    const resolution = 72
    let width = Math.round(210 * resolution / 25.4);
    let height = Math.round(297 * resolution / 25.4);

    const printSize = [width, height];
    const extent = self.map.getView().calculateExtent(printSize);
    self.map.setSize(printSize);
    self.map.getView().fit(extent, { size: printSize });
  }

  getStyle() {
    const styleFunction = function (feature, resolution) {

      if (feature && resolution) {

        let length = feature.get('speed'); // in pixel
        let pointFrom = feature.getGeometry().getCoordinates();
        let pointTo = [
          pointFrom[0] + length * resolution,
          pointFrom[1] + length * resolution
        ];
        let line = new LineString([
          pointTo,
          pointFrom
        ]);

        return [
          new Style({
            image: new Circle({
              radius: 5,
              fill: new Fill({
                color: 'rgba(255,255,255,0.4)'
              }),
              stroke: new Stroke({
                color: '#3399CC',
                width: 1.25
              })
            })
          }),
          new Style({
            geometry: line,
            stroke: new Stroke({
              color: 'blue',
              width: 3
            })
          }),
        ];

      }


    };
    return styleFunction;
  }


  goRight() {
    const self = this;
    const size = self.map.getSize();
    const extent = self.map.getView().calculateExtent(size);
    const [minX, minY, maxX, maxY] = extent;
    const dX = maxX - minX;
    const dY = maxY - minY;
    const newExtent = [maxX, minY, maxX + dX, maxY]
    self.map.getView().fit(newExtent)
  }

  goLeft() {
    const self = this;
    const size = self.map.getSize();
    const extent = self.map.getView().calculateExtent(size);
    const [minX, minY, maxX, maxY] = extent;
    const dX = maxX - minX;
    const dY = maxY - minY;
    const newExtent = [minX - dX, minY, minX, maxY]
    self.map.getView().fit(newExtent)
  }

  goUp() {
    const self = this;
    const size = self.map.getSize();
    const extent = self.map.getView().calculateExtent(size);
    const [minX, minY, maxX, maxY] = extent;
    const dX = maxX - minX;
    const dY = maxY - minY;
    const newExtent = [minX, maxY, maxX, maxY + dY];
    self.map.getView().fit(newExtent)
  }

  goDown() {
    const self = this;
    const size = self.map.getSize();
    const extent = self.map.getView().calculateExtent(size);
    const [minX, minY, maxX, maxY] = extent;
    const dX = maxX - minX;
    const dY = maxY - minY;
    const newExtent = [minX, minY - dY, maxX, minY];
    self.map.getView().fit(newExtent)
  }

  extent() {
    const self = this;
    this.map.on("moveend", function (event) {
      const extent = self.map.getView().calculateExtent();
      console.log('extent', extent);
      const [minX, minY, maxX, maxY] = extent;
      const dX = maxX - minX;
      const dY = maxY - minY;
      console.log('dX', dX);
      console.log('dY', dY);
      const resolution = self.map.getView().getResolution();
      const zoom = Math.ceil(Math.LOG2E * Math.log(resolution * 256))
      console.log('resolution', resolution);
      console.log('zoom', zoom);
    })
  }

  addFeature() {
    const geojsonObject = {
      'type': 'FeatureCollection',
      'crs': {
        'type': 'name',
        'properties': {
          'name': 'EPSG:3857'
        }
      },
      'features': [{
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [3314687, 8379464]
        },
        'properties': {
          'speed': 50
        }
      }]
    };
    const vectorSource = new VectorSource({
      features: (new GeoJSON()).readFeatures(geojsonObject)
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    this.vectorLayer = vectorLayer;

    console.log(vectorSource.getFeatures());
    const line = vectorSource.getFeatures()[0].getGeometry();
    const length = getLength(line);
    console.log('length', length);
    this.map.addLayer(vectorLayer);
  };

  setStyle() {
    const self = this;
    self.vectorLayer.setStyle(this.getStyle());
  }

  calculateSize() {
    const dims = {
      a0: [1189, 841],
      a1: [841, 594],
      a2: [594, 420],
      a3: [420, 297],
      a4: [267, 180],
      a5: [210, 148]
    };
    let format = document.getElementById('format').value;
    let resolution = document.getElementById('resolution').value;
    let dim = dims[format];
    let width = Math.round(dim[0] * resolution / 25.4);
    let height = Math.round(dim[1] * resolution / 25.4);
    return [width, height]
  }

  /**
   * Печать
   * @param params
   */
  print() {
    const self = this;

    const name = `map`;

    let size = /** @type {module:ol/size~Size} */ (self.map.getSize());
    let extent = self.map.getView().calculateExtent(size);

    console.log('extent', extent);
    console.log('dX', extent[2] - extent[0]);
    console.log('dY', extent[3] - extent[1]);

    self.map.once('rendercomplete', function (event) {
      let canvas = event.context.canvas;
      //let data = canvas.toDataURL('image/jpeg');
      canvas.toBlob(function (blob) {
        saveAs(blob, `${name}.png`);
      });

      // Reset original map size
      self.map.setSize(size);
      self.map.getView().fit(extent, { size: size });
    });

    // Set print size
    let printSize = this.calculateSize();
    self.map.setSize(printSize);
    self.map.getView().fit(extent, { size: printSize });
  }
}

module.exports = Map;
