const fs = require('fs');

const print = require('../config/tt_config_1981b1ae-3b5a-11e9-a220-005056bb60f0.json');

const features = print.geojsonObject.features;


let countFeatures = features.length;

let minX = 99999999;
let minY = 99999999;
let maxX = 0;
let maxY = 0;
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

const dX = maxX - minX;
const dY = maxY - minY;


let styles = ``;

const dict = {
  Point: Point,
  LineString: LineString,
  Polygon: Polygon,
  GeometryCollection: GeometryCollection,
}

function Point(geometry) {
  const point = geometry.coordinates;
  const [x, y] = point;
  return '<circle cx="' + x + '" cy="' + y + '" r="1" fill="black"/>\n'
}

function LineString(geometry) {
  const coordinates = geometry.coordinates;
  const length = coordinates.length;
  let changedGeometries = ``;
  for (let i = 0; i < length; i++) {
    const point = coordinates[i];
    const [x, y] = point;
    changedGeometries = changedGeometries + `${x},${y} `
  }
  //return `<path stroke="black" stroke-width="5" fill="none" d="M `${changedGeometries}`"/>`
  return '<path stroke="black" stroke-width="1" fill="none" d="M ' + `${changedGeometries}` + '"/>\n'
}

function Polygon(geometry) {
  const coordinates = geometry.coordinates;
  const length = coordinates.length;
  let changedGeometries = ``;
  for (let i = 0; i < length; i++) {
    const line = coordinates[i];
    const changedLine = LineString(
      {
        "type": "LineString",
        "coordinates": line
      }
    );
    changedGeometries = changedGeometries + changedLine
  }
  return changedGeometries
}

function GeometryCollection(geometry) {
  const geometries = geometry.geometries;
  const length = geometries.length;

  let changedGeometries = ``;

  for (let i = 0; i < length; i++) {
    const geometryInCollection = geometries[i];
    const type = geometryInCollection.type;
    const changeGeometry = dict[type];
    changedGeometries = changedGeometries + changeGeometry(geometryInCollection)
  }

  return changedGeometries;
}

function Text(feature) {
  const { properties } = feature;
  const { textLabel, font, textLabelOffsetX, textLabelOffsetY, extentF, rotation } = properties;
  let returnedText = '';
  let styleText = '';
  if (properties.name==='textLabel'){
    const Cx = feature.geometry.coordinates[0];
    const Cy = feature.geometry.coordinates[1];
    const angle = rotation ? rotation / Math.PI * 180 : 0;
    let arrayString = textLabel.split('\n');
    let font_ = font ? font : 28;
    const fontSize = parseInt(font_) / (Math.LOG2E);
    returnedText = arrayString.map((item, index) => {
      let coordY = Cy + index * parseInt(font_);
      return '<text x="' + Cx + '" y="' + coordY + '" font-size="' + fontSize + 'px" font-family="sans-serif" text-anchor="middle" fill="black" transform="rotate(' + `${angle} ${Cx},${coordY}` + ')" >'
        + item +
        '</text>\n'
    })
  }

  if (textLabel && textLabelOffsetX && textLabelOffsetY && textLabel.length > 1) {
    const [minX, minY, maxX, maxY] = extentF;
    const Cx = (maxX - minX) / 2 + minX;
    const Cy = (maxY - minY) / 2 + minY;
    const x = Cx + textLabelOffsetX;
    const y = Cy + textLabelOffsetY;
    const angle = rotation ? rotation / Math.PI * 180 : 0;
    let arrayString = textLabel.split('\n');
    let font_ = font ? font : 28;
    const fontSize = parseInt(font_) / (Math.LOG2E);

    returnedText = arrayString.map((item, index) => {
      let coordY = y + index * parseInt(font_);
      return '<text x="' + x + '" y="' + coordY + '" font-size="' + fontSize + 'px" font-family="sans-serif" text-anchor="middle" fill="black" transform="rotate(' + `${angle} ${x},${coordY}` + ')" >'
        + item +
        '</text>\n'
    })
  }
  return returnedText
}

function run() {
  let box = ``;
  let styles = ``;
  for (let i = 0; i < countFeatures; i++) {
    const feature = features[i];
    const geometry = feature.geometry;
    const type = geometry.type;
    const changeGeometry = dict[type];
    const text = Text(feature);
    box = box + changeGeometry(geometry) + text;
  }

  const generalStyle = `<defs>
    <style type="text/css">
      ${styles}
    </style>
  </defs>
`;


  const width = 297 * 300 / 25.4;
  const height = 210 * 300 / 25.4;


  const svg = '<svg width="'+width+'" height="'+height+'" viewBox="0 0 ' + `${dX} ${dY}` + '">' + generalStyle + `${box}` + '</svg>';

  const html = `<!DOCTYPE html>
                  <html lang="en">
                    <head>
                      <meta charset="UTF-8">
                      <title>SVG</title>
                    </head>
                    <body>
                      ${svg}
                    </body>
                  </html>`;
  return html
}

const svg = run();
fs.writeFileSync(__dirname + '/../public/' + 'config_1981b1ae-3b5a-11e9-a220-005056bb60f0' + '.html', svg);