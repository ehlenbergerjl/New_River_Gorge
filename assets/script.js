// https://observablehq.com/@d3/bivariate-choropleth@422
function _1(md){return(
md`# Bivariate Choropleth

Diabetes and obesity prevalence by county, 2013. Colors: [Joshua Stevens](http://www.joshuastevens.net/cartography/make-a-bivariate-choropleth-map/) Data: [CDC](https://www.cdc.gov/diabetes/data/countydata/countydataindicators.html)`
)}

function _colors(Inputs,schemes){return(
Inputs.select(new Map(schemes.map(s => [s.name, s.colors])), {key: "BuPu", label: "Color scheme"})
)}

function _chart(d3,legend,topojson,us,color,data,path,states,format)
{
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, 975, 610]);

  svg.append(legend)
      .attr("transform", "translate(870,450)");

  svg.append("g")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .join("path")
      .attr("fill", d => color(data.get(d.id)))
      .attr("d", path)
    .append("title")
      .text(d => `${d.properties.name}, ${states.get(d.id.slice(0, 2)).name}
${format(data.get(d.id))}`);

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", path);

  return svg.node();
}


function _legend(DOM,svg,n,d3,colors,data,labels){return(
() => {
  const k = 24;
  const arrow = DOM.uid();
  return svg`<g font-family=sans-serif font-size=10>
  <g transform="translate(-${k * n / 2},-${k * n / 2}) rotate(-45 ${k * n / 2},${k * n / 2})">
    <marker id="${arrow.id}" markerHeight=10 markerWidth=10 refX=6 refY=3 orient=auto>
      <path d="M0,0L9,3L0,6Z" />
    </marker>
    ${d3.cross(d3.range(n), d3.range(n)).map(([i, j]) => svg`<rect width=${k} height=${k} x=${i * k} y=${(n - 1 - j) * k} fill=${colors[j * n + i]}>
      <title>${data.title[0]}${labels[j] && ` (${labels[j]})`}
${data.title[1]}${labels[i] && ` (${labels[i]})`}</title>
    </rect>`)}
    <line marker-end="${arrow}" x1=0 x2=${n * k} y1=${n * k} y2=${n * k} stroke=black stroke-width=1.5 />
    <line marker-end="${arrow}" y2=0 y1=${n * k} stroke=black stroke-width=1.5 />
    <text font-weight="bold" dy="0.71em" transform="rotate(90) translate(${n / 2 * k},6)" text-anchor="middle">${data.title[0]}</text>
    <text font-weight="bold" dy="0.71em" transform="translate(${n / 2 * k},${n * k + 6})" text-anchor="middle">${data.title[1]}</text>
  </g>
</g>`;
}
)}

async function _data(d3,FileAttachment){return(
Object.assign(new Map(d3.csvParse(await FileAttachment("cdc-diabetes-obesity.csv").text(), ({county, diabetes, obesity}) => [county, [+diabetes, +obesity]])), {title: ["Diabetes", "Obesity"]})
)}

function _schemes(){return(
[
  {
    name: "RdBu", 
    colors: [
      "#e8e8e8", "#e4acac", "#c85a5a",
      "#b0d5df", "#ad9ea5", "#985356",
      "#64acbe", "#627f8c", "#574249"
    ]
  },
  {
    name: "BuPu", 
    colors: [
      "#e8e8e8", "#ace4e4", "#5ac8c8",
      "#dfb0d6", "#a5add3", "#5698b9", 
      "#be64ac", "#8c62aa", "#3b4994"
    ]
  },
  {
    name: "GnBu", 
    colors: [
      "#e8e8e8", "#b5c0da", "#6c83b5",
      "#b8d6be", "#90b2b3", "#567994",
      "#73ae80", "#5a9178", "#2a5a5b"
    ]
  },
  {
    name: "PuOr", 
    colors: [
      "#e8e8e8", "#e4d9ac", "#c8b35a",
      "#cbb8d7", "#c8ada0", "#af8e53",
      "#9972af", "#976b82", "#804d36"
    ]
  }
]
)}

function _labels(){return(
["low", "", "high"]
)}

function _n(colors){return(
Math.floor(Math.sqrt(colors.length))
)}

function _x(d3,data,n){return(
d3.scaleQuantile(Array.from(data.values(), d => d[0]), d3.range(n))
)}

function _y(d3,data,n){return(
d3.scaleQuantile(Array.from(data.values(), d => d[1]), d3.range(n))
)}

function _path(d3){return(
d3.geoPath()
)}

function _color(colors,y,x,n)
{
  return value => {
    if (!value) return "#ccc";
    let [a, b] = value;
    return colors[y(b) + x(a) * n];
  };
}


function _format(data,labels,x,y){return(
(value) => {
  if (!value) return "N/A";
  let [a, b] = value;
  return `${a}% ${data.title[0]}${labels[x(a)] && ` (${labels[x(a)]})`}
${b}% ${data.title[1]}${labels[y(b)] && ` (${labels[y(b)]})`}`;
}
)}

function _states(us){return(
new Map(us.objects.states.geometries.map(d => [d.id, d.properties]))
)}

function _us(FileAttachment){return(
FileAttachment("counties-albers-10m.json").json()
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["counties-albers-10m.json",new URL("./files/6b1776f5a0a0e76e6428805c0074a8f262e3f34b1b50944da27903e014b409958dc29b03a1c9cc331949d6a2a404c19dfd0d9d36d9c32274e6ffbc07c11350ee",import.meta.url)],["cdc-diabetes-obesity.csv",new URL("./files/a532a3a211eb0a93bc9f24f5a1915f4689b36e46a99a8c3df3692cd9a26670a9b7c05aaee62ce583f4237797a1d489cc0f0c46549200744a0a5996417093a05c",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("viewof colors")).define("viewof colors", ["Inputs","schemes"], _colors);
  main.variable(observer("colors")).define("colors", ["Generators", "viewof colors"], (G, _) => G.input(_));
  main.variable(observer("chart")).define("chart", ["d3","legend","topojson","us","color","data","path","states","format"], _chart);
  main.variable(observer("legend")).define("legend", ["DOM","svg","n","d3","colors","data","labels"], _legend);
  main.variable(observer("data")).define("data", ["d3","FileAttachment"], _data);
  main.variable(observer("schemes")).define("schemes", _schemes);
  main.variable(observer("labels")).define("labels", _labels);
  main.variable(observer("n")).define("n", ["colors"], _n);
  main.variable(observer("x")).define("x", ["d3","data","n"], _x);
  main.variable(observer("y")).define("y", ["d3","data","n"], _y);
  main.variable(observer("path")).define("path", ["d3"], _path);
  main.variable(observer("color")).define("color", ["colors","y","x","n"], _color);
  main.variable(observer("format")).define("format", ["data","labels","x","y"], _format);
  main.variable(observer("states")).define("states", ["us"], _states);
  main.variable(observer("us")).define("us", ["FileAttachment"], _us);
  return main;
}
