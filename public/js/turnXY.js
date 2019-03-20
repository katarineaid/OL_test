const fs = require('fs');

const print = require('../../config/print.json');

const features = print.geojsonObject.features;


let minX = 99999999;
let minY = 99999999;
let maxX = 0;
let maxY = 0;

// let minX = 3331255.0245806472;
// let minY = 8426452.112418396;
// let maxX = 3332795.0245806472;
// let maxY = 8426472.148892298;
let countFeatures = features.length;

for (let i = 0; i < countFeatures; i++) {

  let feature = features[i];
  let extent = feature.properties.extentF;

  if (minX > extent[0]) {
    minX = extent[0];
  }
  if (minY > extent[1]) {
    minY = extent[1];
  }
  if (maxX < extent[2]) {
    maxX = extent[2];
  }
  if (maxY < extent[3]) {
    maxY = extent[3];
  }
}

console.log(minX, minY, maxX, maxY);

const dX = maxX - minX;
const dY = maxY - minY;

const dict = {
  Point: Point,
  LineString: LineString,
  Polygon: Polygon,
  GeometryCollection: GeometryCollection,
}

function run() {
  for (let i = 0; i < countFeatures; i++) {
    const feature = features[i];
    const geometry = feature.geometry;
    const type = geometry.type;
    const changeGeometry = dict[type];
    feature.geometry = changeGeometry(geometry);
    const [mnX, mnY, mxX, mxY] = feature.properties.extentF;
    //x - minX, maxY - y
    feature.properties.extentF = [mnX - minX, maxY - mnY, mxX - minX, maxY - mxY]
  }
}


function GeometryCollection(geometry) {
  const geometries = geometry.geometries;
  const length = geometries.length;

  const changedGeometries = [];

  for (let i = 0; i < length; i++) {
    const geometryInCollection = geometries[i];
    const type = geometryInCollection.type;
    const changeGeometry = dict[type];
    changedGeometries.push(changeGeometry(geometryInCollection))
  }

  return {
    "type": "GeometryCollection",
    "geometries": changedGeometries
  }
}

function Polygon(geometry) {
  const coordinates = geometry.coordinates;
  const length = coordinates.length;
  const changedGeometries = [];
  for (let i = 0; i < length; i++) {
    const line = coordinates[i];
    const changedLine = LineString(
      {
        "type": "LineString",
        "coordinates": line
      }
    );
    changedGeometries.push(changedLine.coordinates)
  }
  return {
    "type": "Polygon",
    "coordinates": changedGeometries
  }
}

function LineString(geometry) {
  const coordinates = geometry.coordinates;
  const length = coordinates.length;

  const changedGeometries = [];

  for (let i = 0; i < length; i++) {
    const point = coordinates[i];
    const changedPoint = Point(
      {
        "type": "Point",
        "coordinates": point
      }
    );
    changedGeometries.push(changedPoint.coordinates)
  }

  return {
    "type": "LineString",
    "coordinates": changedGeometries
  }
}

function Point(geometry) {
  const point = geometry.coordinates;
  const [x, y] = point;
  const coordinates = [x - minX, maxY - y];
  return {
    "type": "Point",
    "coordinates": coordinates
  }
}

run();
fs.writeFileSync(__dirname + '/../../config/' + 'tt_print' + '.json', JSON.stringify(print));