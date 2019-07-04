function boxDragStarted() {
    let obj = d3.select(this);
    xOffset = d3.event.x - obj.node().getBoundingClientRect().x;
    yOffset = d3.event.y - obj.node().getBoundingClientRect().y;

}

function boxDragged() {
    d3.event.sourceEvent.stopPropagation();
    let obj = d3.select(this);
    let xCoord = d3.event.x - xOffset - 8;
    let yCoord = d3.event.y - yOffset - 78;
    obj.style("left", xCoord + "px");
    obj.style("top", yCoord + "px");

}

function boxDragEnded() {
    d3.event.sourceEvent.stopPropagation();
}

function drawMap() {
    const width = 500,
        height = 400;
    // float box in general
    let selectionPanel = d3.select(main)
        .append("div")
        .attr("class", "floatingBox")
        .style("left", (1200) + "px")
        .style("top", (600) + "px");

    d3.selectAll(".floatingBox").call(d3.drag()
        .on("start", boxDragStarted)
        .on("drag", boxDragged)
        .on("end", boxDragEnded));

    // top move/drag icon
    selectionPanel.append("div")
        .attr("class", "floatingBoxHeader")
        .html("<div class='containerArrow'>" +
            "<div class='firstArrow'>&#x2194;</div>" +
            "<div class='secondArrow'>&#x2195;</div>" +
            "St. Himark Map" +
            "</div>");

    let panelContent = selectionPanel.append("div")
        .attr("class", "floatingBoxContent")
        .attr("id", "mapContent");

    let svg = panelContent.append("svg")
        .attr("width", width)
        .attr("height", height);

    let projection = d3.geoMercator()
        .scale(1)
        .translate([0, 0]);

    let geoGenerator = d3.geoPath()
        .projection(projection);

    var url = "https://raw.githubusercontent.com/iDataVisualizationLab/VAST19_mc1/master/Dataset/StHimark.geojson";
    d3.json(url, function(error, geojson) {
        if (error) throw error;

        var b = geoGenerator.bounds(geojson),
            s = .85 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
            t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        projection
            .scale(s)
            .translate(t);

        let map = svg.selectAll("path")
            .data(geojson.features);

        map
            .enter().append("path")
            .attr("class", "mapPath norm")
            .attr("d", geoGenerator)
            .attr("id", d => "map" + removeChar(d.properties.Nbrhood))
            .attr("fill", "#636363")
            .on("mouseover", mouseoverMap)
            .on("mouseout", mouseoutMap)
            // .on("click", mouseclickMap);

        map.enter()
            .append("svg:text")
            .text(function(d) {
                return d.properties.Nbrhood;
            })
            .attr("x", function(d) {
                return geoGenerator.centroid(d)[0];
            })
            .attr("y", function(d) {
                return geoGenerator.centroid(d)[1];
            })
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr("font-family", "sans-serif")
            .attr('font-size', '6pt');
    });

}
