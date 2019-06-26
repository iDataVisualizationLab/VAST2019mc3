let xOffset = 0;
let yOffset = 0;

function boxDragStarted() {
    let obj = d3.select(this);
    xOffset = d3.event.x - obj.node().getBoundingClientRect().x;
    yOffset = d3.event.y - obj.node().getBoundingClientRect().y;

}

function boxDragged() {
    d3.event.sourceEvent.stopPropagation();
    let obj = d3.select(this);
    let xCoord = d3.event.x - xOffset;
    let yCoord = d3.event.y - yOffset;
    obj.style("left", xCoord + "px");
    obj.style("top", yCoord + "px");

}

function boxDragEnded() {
    d3.event.sourceEvent.stopPropagation();
}

let selectionPanel = d3.select("body")
    .append("div")
    .attr("id", "configurationContainer")
    .attr("class", "floatingBox");

selectionPanel.append("div")
    .attr("id", "configurationContainerHeader")
    .attr("class", "floatingBoxHeader")
    .text("Selection Panel");

selectionPanel.append("div")
    .attr("class", "floatingBoxContent");

d3.selectAll(".floatingBox").call(d3.drag().on("start", boxDragStarted).on("drag", boxDragged).on("end", boxDragEnded));

d3.select("#configurationContainer")
    .style("left", (margin.left + margin.right + 120) + "px")
    .style("top", 50 + "px");

d3.select("#btnConfiguration")
    .style("top", 0 + "px").style("opacity", "1");
