var d3 = require('d3');
window.d3 = d3;
console.log('d3_demo_1', 'js run...');


function drawSVG() {

    if (runOnceFlag == true) {
        return;
    }

    console.log('d3_demo_1', 'drawSVG');

    var n = 40,
        random = d3.randomNormal(0, .2),
        data = d3.range(n).map(random);
    var svg = d3.select(document.querySelector('#app')._shadowRoot).select('#svg1'),
        margin = { top: 20, right: 20, bottom: 20, left: 40 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var x = d3.scaleLinear()
        .domain([0, n - 1])
        .range([0, width]);
    var y = d3.scaleLinear()
        .domain([-1, 1])
        .range([height, 0]);
    var line = d3.line()
        .x(function(d, i) {
            return x(i);
        })
        .y(function(d, i) {
            return y(d);
        });
    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + y(0) + ")")
        .call(d3.axisBottom(x));
    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y));
    g.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line)
        .transition()
        .duration(500)
        // .ease(d3.easeLinear)
        .on("start", tick);

    function tick() {
        // Push a new data point onto the back.
        data.push(random());
        // Pop the old data point off the front.
        data.shift();
        // Redraw the line (with the wrong interpolation).
        d3.active(this)
            .attr("d", line)
            .transition()
            .on("start", tick);
    }

    runOnceFlag = true;

}

var runOnceFlag = false;

window.addEventListener('load', () => {

    setTimeout(drawSVG, 0);
})

setTimeout(drawSVG, 0);
