const svgWidth = 500, svgHeight = 525;
const marginU = {top: 20, right: 20, bottom: 30, left: 155},
    widthU = svgWidth - marginU.left - marginU.right,
    heightU = svgHeight - marginU.top - marginU.bottom;
// set the ranges
let yU = d3.scaleBand()
    .range([0, heightU])
    .padding(0.2);

let xU = d3.scaleLinear()
    .range([0, widthU]);
let accountRange = 20;

function getUserData(rangedData){
    return d3.nest()
        .key(d => d.account)
        .entries(rangedData)
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
        .attr("class", "box")
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
            accountRange = this.value;
            userData = getUserData(rangedData).slice(0, accountRange);
            updateUserList();
            updateNetwork();
        });

    updateUserList();
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
function updateUserList(){
    const t = 600;
    xU.domain([0, d3.max(userData, function(d){ return d.quantity; })]);
    yU.domain(userData.map(function(d) { return d.account; }));

    // sub
    if (numHourAfter < 10){
        switch (dataOption[0].parent) {
            case "event":
                xU.domain([0,10]);
                break;
            case "resource":
                xU.domain([0,30]);
                break;
            default:
                xU.domain([0, 50]);
        }
    }
    else {
        switch (dataOption[0].parent) {
            case "event":
                xU.domain([0,20]);
                break;
            case "resource":
                xU.domain([0,50]);
                break;
            default:
                xU.domain([0, 70]);
        }
    }


    if (dataOption.length === 13){
        xU.domain([0,100]);
    }

    let newSelection = d3.select("#userG")
        .selectAll(".bar")
        .data(userData);

    newSelection.exit()
        .remove();

    newSelection
        .attr("width", d => xU(d.quantity))
        .attr("y", d => yU(d.account))
        .attr("height", yU.bandwidth());

    newSelection
        .enter()
        .append("rect")
        .attr("y", heightU)
        .attr("class", "bar")
        .attr("fill", "#444")
        .attr("width", d => xU(d.quantity))
        .attr("y", d => yU(d.account))
        .attr("height", yU.bandwidth());

    let newTextU = d3.select("#userG").selectAll(".indexText")
        .data(userData);

    newTextU.exit()
        .remove();

    newTextU
        .text(d => d.quantity)
        .attr("x", d => xU(d.quantity) + 4)
        .attr("y", d => yU(d.account)+ yU.bandwidth()/2)
        .attr("alignment-baseline", "middle");

    newTextU
        .enter()
        .append("text")
        .attr("y", heightU)
        .attr("class", "indexText")
        .text(d => d.quantity)
        .attr("x", d => xU(d.quantity) + 4)
        .attr("y", d => yU(d.account)+ yU.bandwidth()/2)
        .attr("alignment-baseline", "middle")
        .attr("font-size", 14);

    // add the y Axis
    d3.select('#yAxisU')
        .call(d3.axisLeft(yU));

    d3.select("#xAxisU")
        .call(d3.axisBottom(xU));
}