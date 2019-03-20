const fs = require('fs');

const print = require('../../config/tt_print.json');

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

function Point(geometry, valueClass) {
  const point = geometry.coordinates;
  const [x, y] = point;
  return `<circle cx="${x}" cy="${y}" r="1" class="${valueClass}"/>\n`
}

function LineString(geometry, valueClass) {
  const coordinates = geometry.coordinates;
  const length = coordinates.length;
  let changedGeometries = ``;
  for (let i = 0; i < length; i++) {
    const point = coordinates[i];
    const [x, y] = point;
    changedGeometries = changedGeometries + `${x},${y} `
  }

  return `<path class="${valueClass}" d="M ${changedGeometries}"/>\n`
}

function Polygon(geometry, valueClass) {
  const coordinates = geometry.coordinates;
  const length = coordinates.length;
  let changedGeometries = ``;
  console.log('length', length)
  for (let i = 0; i < length; i++) {
    const line = coordinates[i];
    const changedLine = LineString(
      {
        "type": "LineString",
        "coordinates": line
      },
      valueClass
    );
    let polygon = i === 0 ? changedLine.replace(valueClass, `${valueClass}_polygon`) :
      changedLine.replace(valueClass, `class_white`);
    changedGeometries = changedGeometries + polygon

  }
  return changedGeometries
}

function GeometryCollection(geometry, valueClass) {
  const geometries = geometry.geometries;
  const length = geometries.length;

  let changedGeometries = ``;

  for (let i = 0; i < length; i++) {
    const geometryInCollection = geometries[i];
    const type = geometryInCollection.type;
    const changeGeometry = dict[type];
    changedGeometries = changedGeometries + changeGeometry(geometryInCollection, valueClass)
  }

  return changedGeometries;
}

function Text(feature) {
  const { properties } = feature;
  const { textLabel, font, textLabelOffsetX, textLabelOffsetY, extentF, rotation } = properties;
  let returnedText = '';
  if (properties.name === 'textLabel') {
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

function Style(feature, selector) {
  let style = ``;
  const { properties } = feature;
  const {
    fill = `#ff0`,
    stroke = `#000`,
    strokeWidth = `1`,
    name
  } = properties;

  if (name.indexOf(`Bus`) !== -1 || name.indexOf(`step`) !== -1
    || name.indexOf(`Separator`) !== -1 || name.indexOf(`breaker`) !== -1
    || name.indexOf(`arrester`) !== -1
  ) {
    style = `
  .${selector} {
  fill:none;
  stroke:${stroke};
  stroke-width:${strokeWidth};
  }
  .${selector}_polygon {
  fill:${fill};
  stroke:${stroke};
  stroke-width:${strokeWidth};
  }
  `
  } else {
    style = `
  .${selector}{
  fill:none;
  stroke:${stroke};
  stroke-width:${strokeWidth};
  }
  `
  }
  return style
}

function run(nameClass) {
  let box = ``;
  let styles = ``;
  for (let i = 0; i < countFeatures; i++) {
    const feature = features[i];
    const geometry = feature.geometry;
    const type = geometry.type;
    const changeGeometry = dict[type];
    const text = Text(feature);

    const id = feature.id;
    let valueClass = ``;

    if (nameClass === 'userStyle') {
      valueClass = `class_` + id.replace(/-/gi, `_`);
      const style = Style(feature, valueClass);
      styles = styles + style;
    } else if (nameClass === 'ITS') {
      let value = feature.properties[nameClass] || 100;
      value = parseInt(value);
      if (value >= 0 && value < 30) {
        valueClass = `class_critical`;
        break;
      } else if (value >= 30 && value < 50) {
        valueClass = `class_unsatisfactory`;
        break;
      } else if (value >= 50 && value < 70) {
        valueClass = `class_satisfactory`;
        break;
      } else if (value >= 70 && value < 85) {
        valueClass = `class_good`;
        break;
      } else if (value >= 85 && value <= 100) {
        valueClass = `class_very_good`;
        break;
      }
    } else {
      const value = feature.properties[nameClass] || `default`;
      valueClass = `class_` + String(value).replace(/./gi, `_`);
    }

    box = box + changeGeometry(geometry, valueClass) + text;
  }

  const generalStyle = `<defs>
    <style type="text/css">
      ${styles}
    .class_default {
  stroke: #000;
  stroke-width: 1;
  fill: none;
}

.class_1150 {
  stroke: rgba(205, 138, 255, 1);
  stroke-width: 1;
  fill: none;
}

.class_800 {
  stroke: rgba(0, 0, 168, 1);
  stroke-width: 1;
  fill: none;
}

.class_750 {
  stroke: rgba(0, 0, 168, 1);
  stroke-width: 1;
  fill: none;
}

.class_500 {
  stroke: rgba(213, 0, 0, 1);
  stroke-width: 1;
  fill: none;
}

.class_400 {
  stroke: rgba(255, 100, 30, 1);
  stroke-width: 1;
  fill: none;
}

.class_330 {
  stroke: rgba(0, 170, 0, 1);
  stroke-width: 1;
  fill: none;
}

.class_220 {
  stroke: rgba(181, 181, 0, 1);
  stroke-width: 1;
  fill: none;
}

.class_150 {
  stroke: rgba(170, 150, 0, 1);
  stroke-width: 1;
  fill: none;
}

.class_110 {
  stroke: rgba(0, 153, 255, 1);
  stroke-width: 1;
  fill: none;
}

.class_60 {
  stroke: rgba(255, 51, 204, 1);
  stroke-width: 1;
  fill: none;
}

.class_35 {
  stroke: rgba(102, 51, 0, 1);
  stroke-width: 1;
  fill: none;
}

.class_20 {
  stroke: rgba(160, 32, 240, 1);
  stroke-width: 1;
  fill: none;
}

.class_15 {
  stroke: rgba(160, 32, 240, 1);
  stroke-width: 1;
  fill: none;
}

.class_10 {
  stroke: rgba(102, 0, 240, 1);
  stroke-width: 1;
  fill: none;
}

.class_6 {
  stroke: rgba(0, 102, 0, 1);
  stroke-width: 1;
  fill: none;
}

.class_3 {
  stroke: rgba(0, 102, 0, 1);
  stroke-width: 1;
  fill: none;
}

.class_0_4 {
  stroke: rgba(127, 127, 127, 1);
  stroke-width: 1;
  fill: none;
}

.class_0 {
  stroke: #000;
  stroke-width: 1;
  fill: none;
}
.class_default {
  stroke: #000;
  stroke-width: 1;
  fill: none;
}
.class_default_polygon {
  stroke: #000;
  stroke-width: 1;
  fill: #000;
}

.class_1150_polygon {
  stroke: rgba(205, 138, 255, 1);
  stroke-width: 1;
  fill: rgba(205, 138, 255, 1);
}

.class_800_polygon {
  stroke: rgba(0, 0, 168, 1);
  fill: rgba(0, 0, 168, 1);
  stroke-width: 1;
}

.class_750 {
  stroke: rgba(0, 0, 168, 1);
  fill: rgba(0, 0, 168, 1);
  stroke-width: 1;
}

.class_500_polygon {
  stroke: rgba(213, 0, 0, 1);
  fill: rgba(213, 0, 0, 1);
  stroke-width: 1;
}

.class_400_polygon {
  stroke: rgba(255, 100, 30, 1);
  fill: rgba(255, 100, 30, 1);
  stroke-width: 1;
}

.class_330_polygon {
  stroke: rgba(0, 170, 0, 1);
  fill: rgba(0, 170, 0, 1);
  stroke-width: 1;
}

.class_220_polygon {
  stroke: rgba(181, 181, 0, 1);
  fill: rgba(181, 181, 0, 1);
  stroke-width: 1;
}

.class_150_polygon {
  stroke: rgba(170, 150, 0, 1);
  fill: rgba(170, 150, 0, 1);
  stroke-width: 1;
}

.class_110_polygon {
  stroke: rgba(0, 153, 255, 1);
  fill: rgba(0, 153, 255, 1);
  stroke-width: 1;
}

.class_60_polygon {
  stroke: rgba(255, 51, 204, 1);
  fill: rgba(255, 51, 204, 1);
  stroke-width: 1;
}

.class_35_polygon {
  stroke: rgba(102, 51, 0, 1);
  fill: rgba(102, 51, 0, 1);
  stroke-width: 1;
}

.class_20_polygon {
  stroke: rgba(160, 32, 240, 1);
  fill: rgba(160, 32, 240, 1);
  stroke-width: 1;
}

.class_15_polygon {
  stroke: rgba(160, 32, 240, 1);
  fill: rgba(160, 32, 240, 1);
  stroke-width: 1;
}

.class_10_polygon {
  stroke: rgba(102, 0, 240, 1);
  fill: rgba(102, 0, 240, 1);
  stroke-width: 1;
}

.class_6_polygon {
  stroke: rgba(0, 102, 0, 1);
  fill: rgba(0, 102, 0, 1);
  stroke-width: 1;
}

.class_3_polygon {
  stroke: rgba(0, 102, 0, 1);
  fill: rgba(0, 102, 0, 1);
  stroke-width: 1;
}

.class_0_4_polygon {
  stroke: rgba(127, 127, 127, 1);
  fill: rgba(127, 127, 127, 1);
  stroke-width: 1;
}

.class_0_polygon {
  stroke: #000;
  fill: #000;
  stroke-width: 1;
}

.class_white {
  stroke: #fff;
  fill: #fff;
  stroke-width: 1;
}
    </style>
  </defs>
`;


  const width = 297 * 300 / 25.4;
  const height = 210 * 300 / 25.4;


  const svg = '<svg width="' + width + '" height="' + height + '" viewBox="0 0 ' + `${dX} ${dY}` + '">' + generalStyle + `${box}` + '</svg>';

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

const svg = run(`userStyle`);
fs.writeFileSync(__dirname + '/../../public/html/' + 'tt_print' + '.html', svg);