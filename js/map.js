let mapData;
let locationList;
let colorMapData = {}
let opacityMap = d3.scaleSqrt()
    .domain([0, 200])
    .range([0.2,1])
function drawMap() {
    const width = 500,
        height = 400;
    // float box in general
    let selectionPanel = d3.select(main)
        .append("div")
        .attr("class", "box floating")
        .style("left", (1200) + "px")
        .style("top", (620) + "px");

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

        locationList = geojson.features.map(d => d.properties.Nbrhood);
        let map = svg.selectAll("path")
            .data(geojson.features);

        map
            .enter().append("path")
            .attr("class", "mapPath norm")
            .attr("d", geoGenerator)
            .attr("id", d => "map" + removeChar(d.properties.Nbrhood))
            // .on("click", mouseclickMap)
            .on("mouseover", mouseoverMap)
            .on("mouseout", mouseoutMap)
          ;

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
        updateMap();
    });


}
function mouseoverMap(d){
    let text = d.properties.Nbrhood;
    let prevColor = topicColor[1];
    let prevOpacity = 0.9
    let allTexts = mainGroup.selectAll('.textData').filter(t => {
        return t && t.text === text && t.topic === "location";
    });
    // append close button

    d3.select("#map" + removeChar(text))
        .style("fill", prevColor)
        .style("opacity", prevOpacity);

    allTexts
        .attr("stroke", prevColor)
        .attr("stroke-width", 1);
}
function mouseoutMap(d) {
    let text = d.properties.Nbrhood;
    let allTexts = mainGroup.selectAll('.textData')
        .filter(t => {
            return t.topic === "location";
        });
    allTexts
        .attr("stroke", "none")
        .attr("stroke-width", 0)
    ;

    d3.selectAll(".textData")
        .classed("highlightText", false)

    d3.select("#map" + removeChar(text))
        .style("fill", "#dfdfdf")
        .style("opacity", 1)
}
function mouseclickMap(d) {
    let text = d.properties.Nbrhood;
    let topic = "location";
    let allTexts = mainGroup.selectAll('.textData')
        .filter(t => {
            return t && t.text === text && t.topic === topic;
        })._groups;
    //Select the data for the stream layers
    let streamLayer = d3.select("path[topic='" + topic + "']").data()[0];
    //Push all points
    let points = Array();
    //Initialize all points
    streamLayer.forEach((elm, i) => {
        let item = [];
        item[0] = elm[1];
        item[1] = elm[1];
        item.data = elm.data;
        points.push(item);
    });
    allTexts[0].forEach(t => {
        let data = t.__data__;
        let fontSize = data.fontSize;
        //The point
        let thePoint = points[data.timeStep + 1];
        //+1 since we added 1 to the first point and 1 to the last point.
        thePoint[1] = thePoint[0] - data.streamHeight;
        //Set it to visible.
        //Clone the nodes.
        let clonedNode = t.cloneNode(true);
        d3.select(clonedNode)
            .attr("visibility", "visible")
            .attr("stroke", 'none')
            .attr("stroke-size", 0);

        let clonedParentNode = t.parentNode.cloneNode(false);
        clonedParentNode.appendChild(clonedNode);

        t.parentNode.parentNode.appendChild(clonedParentNode);
        d3.select(clonedParentNode)
            .attr("cloned", true)
            .attr("topic", topic)
            .transition().duration(300)
            .attr("transform", function (d, i) {
                return 'translate(' + thePoint.data.x + ',' + (thePoint[1] - fontSize / 2) + ')';
            });
    });
    //Add the first and the last points
    points[0][1] = points[1][1];//First point
    points[points.length - 1][1] = points[points.length - 2][1];//Last point
    //Append stream
    wordstreamG.append('path')
        .datum(points)
        .attr('d', area)
        .style('fill', topicColor[1])
        .attr("fill-opacity", 1)
        .attr("stroke", 'black')
        .attr('stroke-width', 0.3)
        .attr("topic", topic)
        .attr("wordstream", true);
    //Hide all other texts
    let allOtherTexts = mainGroup.selectAll('.textData').filter(t => {
        return t && !t.cloned && t.topic === topic;
    });
    allOtherTexts.attr('visibility', 'hidden');

    wsTooltipDiv.transition()
        .duration(100)
        .style("opacity", 1);

    xButton.style("opacity", 0.9);

    d3.select("#map" + removeChar(text))
        .style("fill", topicColor[1])
        .style("opacity", 1);
}
function colorMap(d){

}
function updateMap(){
    colorMapData = {};
    locationList.forEach(d => {
        colorMapData[removeChar(d)] = 0;
    });

    wsData.forEach(d => {
        d.words.location.forEach(location => {
            colorMapData[removeChar(location.text)] += location.frequency;
        })
    });

    d3.selectAll(".mapPath")
        .style("opacity", function (d) {
            return opacityMap(colorMapData[removeChar(d.properties.Nbrhood)])
        })
}