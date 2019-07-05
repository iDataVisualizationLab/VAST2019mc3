function loadUserData(data){
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
    let accountRange = 20;
    const svgWidth = 800, svgHeight = 525;
    const marginU = {top: 20, right: 50, bottom: 30, left: 155},
        widthU = svgWidth - marginU.left - marginU.right,
        heightU = svgHeight - marginU.top - marginU.bottom;

    let userData = loadUserData(data).slice(0, accountRange);

    // set the ranges
    let yU = d3.scaleBand()
        .range([0, heightU])
        .padding(0.2);

    let xU = d3.scaleLinear()
        .range([0, widthU]);

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

    svg.selectAll(".bar")
        .data(userData, d => d.account)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("fill", "steelblue")
        .attr("width", d => xU(d.quantity))
        .attr("y", d => yU(d.account))
        .attr("height", yU.bandwidth());

    svg.selectAll(".indexText")
        .data(userData, d => d.account)
        .enter()
        .append("text")
        .attr("class", "indexText")
        .text(d => d.quantity)
        .attr("x", d => xU(d.quantity) + 4)
        .attr("y", d => yU(d.account)+ 15)
        .attr("font-size", 14);

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
        .on("change", updateUser);

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + heightU + ")")
        .call(d3.axisBottom(xU));

    // add the y Axis
    svg.append("g")
        .attr('id','yAxisU')
        .call(d3.axisLeft(yU));

    function updateUser(){
        const t = 600
        accountRange = this.value;
        let userData = loadUserData(data).slice(0, accountRange);

        xU.domain([0, d3.max(userData, function(d){ return d.quantity; })]);
        yU
            .domain(userData.map(function(d) { return d.account; }));

        let newSelection = d3.select("#userG")
            .selectAll(".bar")
            .data(userData, d => d.account);

        newSelection.exit()
            .attr("opacity", 1)
            .transition().duration(t)
            .attr("opacity", 0)
            .remove();

        newSelection.transition()
            .duration(t)
            .attr("width", d => xU(d.quantity))
            .attr("y", d => yU(d.account))
            .attr("height", yU.bandwidth());

        newSelection
            .enter()
            .append("rect")
            .attr("y", heightU)
            .attr("opacity", 0)
            .transition()
            .duration(t)
            .attr("opacity", 1)
            .attr("class", "bar")
            .attr("fill", "steelblue")
            .attr("width", d => xU(d.quantity))
            .attr("y", d => yU(d.account))
            .attr("height", yU.bandwidth());

        let newTextU = svg.selectAll(".indexText")
            .data(userData, d => d.account);

        newTextU.exit()
            .attr("opacity", 1)
            .transition().duration(t)
            .attr("opacity", 0)
            .remove();

        newTextU.transition()
            .duration(t)
            .attr("x", d => xU(d.quantity) + 4)
            .attr("y", d => yU(d.account)+ 15);

        newTextU
            .enter()
            .append("text")
            .attr("y", heightU)
            .attr("opacity", 0)
            .transition()
            .duration(t)
            .attr("opacity", 1)
            .attr("class", "indexText")
            .text(d => d.quantity)
            .attr("x", d => xU(d.quantity) + 4)
            .attr("y", d => yU(d.account)+ 15)
            .attr("font-size", 14);


        // add the y Axis
        d3.select('#yAxisU')
            .transition().duration(t)
            .call(d3.axisLeft(yU));
    }

}