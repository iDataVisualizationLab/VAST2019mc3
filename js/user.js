
function getUserData(data){
    return d3.nest()
        .key(d => d.account)
        .entries(data)
        .map(d => {
            return {
                account: d.key,
                messages: d.values,
                quantity: d.values.length
            }
        })
        .sort((a,b) => b.quantity - a.quantity);
}

function drawUserList() {

    xU.domain([0, d3.max(userData, function(d){ return d.quantity; })]);
    yU.domain(userData.map(function(d) { return d.account; }));

    // float box in general
    let selectionPanel = d3.select(main)
        .append("div")
        .attr("class", "floatingBox")
        .style("left", (1200) + "px")
        .style("top", (10) + "px");

    let panelContent = selectionPanel.append("div")
        .attr("class", "floatingBoxContent");

    let svg = panelContent.append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("id", "userG")
        .attr("transform",
            "translate(" + marginU.left + "," + marginU.top + ")");

    let inputDiv = panelContent.append("div")
        .attr("class", "markerOverlay")
        .style("top", (10) + "px")
        .style("left", (10) + "px");
    inputDiv.append("text")
        .html("<span style='font-family: sans-serif; font-size: 12px'>Select range</span><br>");

    inputDiv
        .append("input")
        .attr("id", "userRangeValue")
        .attr("type", "number")
        .attr("value", accountRange)
        .attr("step", "1")
        .on("change", function () {
            console.log(this.value);
            accountRange = this.value;
            let thisNearestHour = nearestHour(current);
            let rangedData = getRangedData(wsRawData, thisNearestHour, thisNearestHour + numHourAfter*hourToMS);
            userData = getUserData(rangedData).slice(0, accountRange);
            updateUser();
        });

    updateUser();

    // add the x Axis
    svg.append("g")
        .attr('id','xAxisU')
        .attr("transform", "translate(0," + heightU + ")")
        .call(d3.axisBottom(xU));

    // add the y Axis
    svg.append("g")
        .attr('id','yAxisU')
        .call(d3.axisLeft(yU));
}
function updateUser(){
    const t = 600;
    xU.domain([0, d3.max(userData, function(d){ return d.quantity; })]);
    yU.domain(userData.map(function(d) { return d.account; }));

    let newSelection = d3.select("#userG")
        .selectAll(".bar")
        .data(userData);

    newSelection.exit()
        // .attr("opacity", 1)
        // .transition().duration(t)
        // .attr("opacity", 0)
        .remove();

    newSelection
        // .transition()
        // .duration(t)
        .attr("width", d => xU(d.quantity))
        .attr("y", d => yU(d.account))
        .attr("height", yU.bandwidth());

    newSelection
        .enter()
        .append("rect")
        .attr("y", heightU)
        // .attr("opacity", 0)
        // .transition()
        // .duration(t)
        // .attr("opacity", 1)
        .attr("class", "bar")
        .attr("fill", "darkslateblue")
        .attr("width", d => xU(d.quantity))
        .attr("y", d => yU(d.account))
        .attr("height", yU.bandwidth());

    let newTextU = d3.select("#userG").selectAll(".indexText")
        .data(userData);

    newTextU.exit()
        // .attr("opacity", 1)
        // .transition().duration(t)
        // .attr("opacity", 0)
        .remove();

    newTextU
        // .transition()
        // .duration(t)
        .text(d => d.quantity)
        .attr("x", d => xU(d.quantity) + 4)
        .attr("y", d => yU(d.account)+ yU.bandwidth()/2)
        .attr("alignment-baseline", "middle");

    newTextU
        .enter()
        .append("text")
        .attr("y", heightU)
        // .attr("opacity", 0)
        // .transition()
        // .duration(t)
        // .attr("opacity", 1)
        .attr("class", "indexText")
        .text(d => d.quantity)
        .attr("x", d => xU(d.quantity) + 4)
        .attr("y", d => yU(d.account)+ yU.bandwidth()/2)
        .attr("alignment-baseline", "middle")
        .attr("font-size", 14);


    // add the y Axis
    d3.select('#yAxisU')
        // .transition().duration(t)
        .call(d3.axisLeft(yU));

    d3.select("#xAxisU")
        .call(d3.axisBottom(xU));
}