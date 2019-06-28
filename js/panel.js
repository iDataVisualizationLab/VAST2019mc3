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
    let yCoord = d3.event.y - yOffset - 70;
    obj.style("left", xCoord + "px");
    obj.style("top", yCoord + "px");

}

function boxDragEnded() {
    d3.event.sourceEvent.stopPropagation();
}

function drawPanel(){
    // float box in general
    let selectionPanel = d3.select(main)
        .append("div")
        .attr("id", "configurationContainer")
        .attr("class", "floatingBox")
        .style("left", (margin.left + 10) + "px")
        .style("top", 10 + "px");

    d3.selectAll(".floatingBox").call(d3.drag()
        .on("start", boxDragStarted)
        .on("drag", boxDragged)
        .on("end", boxDragEnded));

    // top move/drag icon
    selectionPanel.append("div")
        .attr("id", "configurationContainerHeader")
        .attr("class", "floatingBoxHeader")
        .html("<div class='containerArrow'>" +
            "<div class='firstArrow'>&#x2194;</div>" +
            "<div class='secondArrow'>&#x2195;</div>" +
            "</div>");

    let panelContent = selectionPanel.append("div")
        .attr("class", "floatingBoxContent");

    let svgPanel = panelContent.append("svg")
        .attr("width", 380)
        .attr("height", 300);

    let legend = svgPanel
        .append("g");

    legend
        .attr("id", "legendGroup")
        .attr("transform", "translate(" + (margin.left/2) + "," + (margin.top/2-3) + ")");

    // simple node
    legend.selectAll("circle")
        .data(taxonomy)
        .enter()
        .append("circle")
        .attr("id", d => "button" + d.id)
        .attr("class", "simpleButton legendButton")
        .attr("r", 5)
        .attr("cx", d => d.subTopic ? 20 : 0)
        .attr("cy", (d, i) =>20 * i)
        .attr("fill", d => d.color)
        .on("click", function(d){
            // all
            d3.selectAll(".legendButton")
                .classed("unselected", true)
                .classed("selected", false);

            // this
            d3.select(this)
                .classed("unselected", false)
                .classed("selected", true);

            if (d.id === otherPostID){
                dataOption = [taxonomy.find(record => record.id === otherPostID)];
                streamRawData = getStreamOtherPostData(data);
                updateStream();
                updateWindow(current);
            }
            else {
                dataOption = taxonomy.filter(record => record.id === d.id);
                streamRawData = getStreamData(data, dataOption);
                updateStream();
                updateWindow(current);
            }
        })
        .on("mouseover", function () {
            d3.select(this).classed("hover", true);
        })
        .on("mouseout", function () {
            d3.select(this).classed("hover", false);
        });

    legend.select("#buttonevent").remove();
    legend.select("#buttonresource").remove();
    legend.select("#buttonother").remove();

    const arc = d3.arc()
        .outerRadius(6.5)
        .innerRadius(0);

    const pie = d3.pie()
        .sort(null)
        .value(1);

    // complex node
    taxonomy.filter(d => !d.subTopic)
        .forEach(main => {
            let thisData = taxonomy.filter(d => d.parent === main.id);
            thisData = thisData.length?thisData
                :d3.schemeCategory10.map(d => {return {color: d}});
            let pieGroup = legend
                .append("g")
                .attr("class", "complexButton legendButton")
                .attr("id", "group" + main.id)
                .attr("transform", () => {
                    return "translate(0," + 20 * (+taxonomy.findIndex(d => d.id === main.id)) + ")"}) ;
            let newPie = pieGroup
                .selectAll(".arc")
                .data(pie(thisData))
                .enter().append("g")
                .attr("class", "arc");

            newPie.append("path")
                .attr("d", arc)
                // .style("stroke", "#444444")
                .attr("stroke-width", 0)
                .style("fill", function(d,i) {
                    return thisData[i].color; });

            pieGroup
                .append("circle")
                .attr("id", "circle" + main.id)
                .attr("class", "newButton")
                .attr("r", 6)
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("fill", "transparent")
                .attr("stroke", "#444444")
                .attr("stroke-width", 1.5)
                .on("click", function () {
                    // all
                    d3.selectAll(".legendButton")
                        .classed("unselected", true)
                        .classed("selected", false);

                    // this group
                    d3.select("#group" + main.id)
                        .classed("unselected", false)
                        .classed("selected", true);

                    // subTopic
                    thisData.forEach(rec => {
                        d3.select("#button" + rec.id)
                            .attr("class", "simpleButton legendButton selected");
                    });

                    if (main.id === otherID){
                        dataOption = taxonomy.filter(d => d.parent === main.id);
                        streamRawData = getStreamOtherData(data);
                    }
                    else {
                        dataOption = taxonomy.filter(d => d.parent === main.id);
                        streamRawData = getStreamData(data, dataOption);
                    }
                    updateStream();
                    updateWindow(current);
                })
                .on("mouseover", function(){
                    d3.select("#circle" + main.id)
                        .classed("hover", true);
                    d3.select("#group" + main.id)
                        .classed("hover", true);
                })
                .on("mouseout", function (){
                    d3.select("#circle" + main.id)
                        .classed("hover", false);
                    d3.select("#group" + main.id)
                        .classed("hover", false);
                });
        });

    legend.selectAll("text")
        .data(taxonomy)
        .enter()
        .append("text")
        .attr("class", "legendText")
        .style("cursor", "text")
        .text(d => {
            if (d.content){
                return capitalize(d.id) +
                    (d.content.length? ": " : "") +
                    d.content.slice(0,3).map(e => " "+e) +
                    (d.content.length>3?"...":"");
            }
            else return capitalize(d.id)
        })
        .attr("font-size", 15)
        .attr("x", d => d.subTopic ? 30 : 10)
        .attr("y", (d, i) => 5 + 20 * i);
}

function capitalize(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}
