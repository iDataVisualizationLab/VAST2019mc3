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

    let svgPanel = panelContent.append("svg")
        .attr("width", 330)
        .attr("height", 340);

}
