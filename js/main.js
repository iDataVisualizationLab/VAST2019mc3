const startDate = Date.parse("2020-04-06 00:00:00");
const endDate = Date.parse("2020-04-10 11:59:00");
const hourToMS = 60 * 60 * 1000;
const streamStepUnit = 0.5; // half hour
const formatTimeLegend = d3.timeFormat("%B %d, %-I:%M:%S %p");
const formatTimeReadData = d3.timeFormat("%-m/%-d %-I%p");
const topics = ["message", "location"];
const topicColor = ["#919191", "#440000"];
const margin = {top: 30, right: 20, bottom: 50, left: 50},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

const fisrt5hrsRange = [1586201491000, 1586223091000];
const dataSelection = ["All", "Events"];
const bisect = d3.bisector(d => {
    return d.time
}).left;

let data;
let streamStep = streamStepUnit * hourToMS;
let streamRawData;
let wsRawData = [];
let highestStack;
let keyList;
let xScale = d3.scaleTime()
    .range([0, width]);

let yScale = d3.scaleLinear()
    .range([height, 0]);
let config = {
    topWord: 70,
    minFont: 10,
    maxFont: 25,
    tickFont: 12,
    legendFont: 12,
    curve: d3.curveMonotoneX
};
let main = "#mainContent";
let current;
let numHourAfter = 6;
let wsContainer;
let wsContainerWidth = function (numHourAfter) {
    return d3.scaleLinear()
        .domain([0,30])
        .range([800, 2000])(numHourAfter);
};
let slidingGroup;
let slidingWindow;
let slidingWidth = function(numHourAfter){
    return d3.scaleLinear()
        .domain([0,30])
        .range([0, (30/108) * width])(numHourAfter)
};
const stepDash = slidingWidth(30)/30;
let dashedGroup;
let vertical;
loadData();
function loadData(){
    d3.csv("data/YInt.csv", function (error, inputData) {
        if (error) throw error;
        else {
            data = inputData.map(d => {
                return {
                    time: Date.parse(d.time),
                    location: d.location,
                    account: d.account,
                    message: d.message
                }
            });
            console.log(data);
            streamRawData = getStreamEventData(data, eventKeywords);
            drawGraph();

            wsContainer = d3.select("body").append("svg")
                .attr("width", wsContainerWidth(numHourAfter))
                .attr("height", 500);

            current = fisrt5hrsRange[0];
            updateWindow(current);

        }
    });
}

function getStreamEventData(data, dataOption){
    wsRawData = [];
    let streamData = [];
    let streamData00 = {};
    for (let i = 0; i < dataOption.length; i++) {
        streamData00[dataOption[i]] = [];
    }
    let streamData11 = {};
    data.forEach(d => {
        let flag = false;
        for (let i = 0; i < dataOption.length; i++) {
            for (let j = 0; j < dataOption[i].length; j++) {
                if (d.message.toLowerCase().indexOf(dataOption[i][j]) >= 0) {
                    streamData00[dataOption[i]].push(d.time);
                    wsRawData.push(d);
                    flag = true;
                    break;
                }
            }
            if (flag === true) break;
        }
    });

    // streamRawData
    keyList = d3.keys(streamData00);
    keyList.forEach(d => {
        streamData11[d] = [];
        for (let i = startDate; i < endDate; i += streamStep) {
            // get index of that start and end
            streamData11[d].push({
                timestamp: i,
                count: streamData00[d].slice(
                    d3.bisect(streamData00[d], i),
                    d3.bisect(streamData00[d], i+streamStep))
                    .length
            })
        }
    });
    for (let i = 0; i < streamData11[keyList[0]].length; i++) {
        let obj = {};
        obj.time = streamData11[keyList[0]][i].timestamp;
        keyList.forEach(key => {
            obj[key] = streamData11[key][i].count;
        });
        streamData.push(obj);
    }
    return streamData;
}

function getStreamAllData(data, dataOption){
    let streamData = [];
    let streamData00 = {};
    for (let i = 0; i < dataOption.length; i++) {
        streamData00[dataOption[i]] = [];
    }
    streamData00["other"] = [];

    let streamData11 = {};
    data.forEach(d => {
        let flag = false;
        for (let i = 0; i < dataOption.length; i++) {
            for (let j = 0; j < dataOption[i].length; j++) {
                if (d.message.toLowerCase().indexOf(dataOption[i][j]) >= 0) {
                    streamData00[dataOption[i]].push(d.time);
                    wsRawData.push(d);
                    flag = true;
                    break;
                }
            }
            if (flag === true) break;
        }
        if (!flag){
            streamData00["other"].push(d.time);
        }
    });

    // streamRawData
    keyList = d3.keys(streamData00);
    keyList.forEach(d => {
        streamData11[d] = [];
        for (let i = startDate; i < endDate; i += streamStep) {
            // get index of that start and end
            streamData11[d].push({
                timestamp: i,
                count: streamData00[d].slice(
                    d3.bisect(streamData00[d], i),
                    d3.bisect(streamData00[d], i+streamStep))
                    .length
            })
        }
    });
    for (let i = 0; i < streamData11[keyList[0]].length; i++) {
        let obj = {};
        obj.time = streamData11[keyList[0]][i].timestamp;
        keyList.forEach(key => {
            obj[key] = streamData11[key][i].count;
        });
        streamData.push(obj);
    }
    return streamData;
}

function getWSdata(rangedData) {
    let wsData = {};
    rangedData.forEach(d => {
        let date = (d.time);
        date = formatTimeReadData(new Date(date));

        let wordArray = d.message.toLowerCase()
            .replace(/\.|\,|\(|\)|\;|\:|\[|\]|\&|\!|\’|\?|\#|\"\d/gi, '')
            .split(" ")
            .filter(d => {
                return stopwords.indexOf(d) < 0;
            });

        if (!wsData[date]) wsData[date] = {};

        wsData[date]["message"] = wsData[date]["message"] ? (wsData[date]["message"].concat(wordArray)) : (wordArray);
        wsData[date]["location"] = wsData[date]["location"] ? (wsData[date]["location"].concat(d.location)) : [d.location];
    });

    wsData = d3.keys(wsData).map(function (date, i) {
        var words = {};
        topics.forEach(topic => {
            //Count word frequencies
            var counts = wsData[date][topic].reduce(function (obj, word) {
                if (!obj[word]) {
                    obj[word] = 0;
                }
                obj[word]++;
                return obj;
            }, {});
            //Convert to array of objects
            words[topic] = d3.keys(counts).map(function (d) {
                return {
                    text: d,
                    frequency: counts[d],
                    topic: topic,
                    // id: d.replace(/[^a-zA-Z0-9]/g, '_') + "_" + topic + "_" + (i)
                }
            }).sort(function (a, b) {//sort the terms by frequency
                return b.frequency - a.frequency;
            })
            //     .filter(function (d) {
            //     return d.text;
            // })
            ;//filter out empty words
            // words[topic] = words[topic].slice(0, Math.min(words[topic].length, topword));
        });
        return {
            date: date,
            words: words
        }
    });
    return wsData;
}

function drawGraph() {
    let svg = d3.select(main)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    // main svg
    let g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Create the stack layout for the data
    const stack = d3.stack().keys(keyList)
        .offset(d3.stackOffsetNone);

    const stacks = stack(streamRawData);
    highestStack = stacks[stacks.length-1].map(d => {
        return {
            y: d[1],
            time: d.data.time
        }
    });
    //The scales
    xScale.domain([startDate, endDate]);
    yScale.domain(d3.extent(stacks.flat().flat()));

    //The x axis
    const xAxisGroup = g.append("g").attr("transform", "translate(0," + height + ")");
    const xAxis = d3.axisBottom(xScale);
    let xAxisNodes = xAxisGroup.call(xAxis);
    styleAxis(xAxisNodes);

    //The y Axis
    const yAxisGroup = g.append('g').attr('id','yAxis');
    const yAxis = d3.axisLeft(yScale);
    let yAxisNodes = yAxisGroup.call(yAxis);
    styleAxis(yAxisNodes);

    //The area function used to generate path data for the area.
    const areaGen = d3.area()
        .x(d => xScale(d.data.time))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(d3.curveMonotoneX);
    
    // Main stream
    g.append("g")
        .attr("id", "streamG")
        .selectAll(".layer")
        .data(stacks).enter()
        .append("path")
        .attr("class", "layer")
        .attr("d", areaGen)
        .attr("fill", (d, i) => {
            return d3.schemeCategory10[i]
        });
    
    initDataSelection(dataSelection);
    // Running tooltip for date and time
    let tooltip = d3.select(main)
        .append("div")
        .attr("class", "tooltip")
        .style("top", (height + margin.top/2 + margin.bottom) + "px")
        .style("font-size", "15px")
        .style("pointer-events", "none")
        .html(
        '<text class = "bold">' + formatTimeLegend(fisrt5hrsRange[0]) + "</text>")
        .style("left", (margin.left + xScale(fisrt5hrsRange[0]) + 16) + "px");

    // Long vertical index line
    vertical = g
        .append("line")
        .attr("id", "vertical")
        .style("stroke", "black")
        .attr("y1", 0)
        .attr("y2", height + margin.top + margin.bottom)
        .attr("x1", xScale(fisrt5hrsRange[0]))
        .attr("x2", xScale(fisrt5hrsRange[0]));

    // Sliding window
    let windowSize = {
        height: 287,
        width: slidingWidth(numHourAfter),
    };

    slidingGroup = g.append("g").attr("id", 'slidingGroup');
    slidingWindow = slidingGroup.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", slidingWidth(6))
        .attr("height", windowSize.height)
        .attr("fill", "#aaaaaa")
        .attr("fill-opacity", 0.1)
        .attr("stroke", "black");

    let slidingText = slidingGroup.append("text")
        .attr("x", +slidingWindow.attr("width") /2)
        .attr("y", -8)
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .text(numHourAfter + " hours");

    slidingGroup.attr("transform", "translate(" + xScale(fisrt5hrsRange[0]) + "," +
        (height - windowSize.height) + ")");

    // Dashed line for window width adjustment
    dashedGroup = g
        .append("g")
        .attr("id", "dashedGroup");

    // actual dash line
    let dashedGroupWidth = 20;
    let dashedVertical = dashedGroup
        .append("line")
        .attr("id", "dashedVertical")
        .style("stroke-width", 1)
        .style("stroke", "black")
        .style("stroke-dasharray", ("4, 2"))
        .attr("y1", 0)
        .attr("y2", margin.top)
        .attr("x1", 0)
        .attr("x2", 0);

    // overlay RECT to select
    dashedGroup.append("rect")
        .attr("id", "overlayDashedGroup")
        .attr("class", "overlay")
        .attr("width", dashedGroupWidth)
        .attr("height", margin.top)
        .attr("x", +dashedVertical.attr("x1") - dashedGroupWidth/2)
        .attr("cursor", "ew-resize");

    // translate group
    dashedGroup.attr("transform", "translate(" + (xScale(fisrt5hrsRange[0]) + windowSize.width) +
        ","+ height + ")");

    // define drag
    // function dragstarted() {
    //     d3.select(this).classed(activeClassName, true);
    // }
    // function dragended() {
    //     d3.select(this).classed(activeClassName, false);
    // }

    function dragged() {
        let x = d3.event.x;
        let startMark = +vertical.attr("x1");
        // text.text(stepPosition(x));
        let thisGroup = d3.select(this);
        let pos = stepPosition(x, startMark);
        thisGroup.attr("transform", "translate(" + pos[0] + ","+height+")");
        numHourAfter = pos[1];
        updateWindow(current);
    }

    let drag = d3.drag()
        // .on('start', dragstarted)
        .on('drag', dragged)
        // .on('end', dragended);

    dashedGroup.call(drag);

    // highlight layers
    // svg.selectAll(".layer")
    //     .attr("opacity", 1)
    //     .on("mouseover", function (d, i) {
    //         svg.selectAll(".layer").transition()
    //             .duration(250)
    //             .attr("opacity", function (d, j) {
    //                 return j != i ? 0.5 : 1;
    //             })
    //     })
    //     .on("mouseout", function (d, i) {
    //         svg.selectAll(".layer")
    //             .transition()
    //             .duration(250)
    //             .attr("opacity", "1");
    //     })
    // ;

    g.append("rect")
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
        .on("mousemove", function () {
            let mouseX = d3.mouse(this)[0];
            current = Date.parse(xScale.invert(mouseX));
            current = Math.min(Math.max(current, startDate), endDate);

            mouseX =  Math.min(Math.max(mouseX, 0), width);
            // vertical line, sliding window and tooltip
            vertical
                .attr("x1", mouseX)
                .attr("x2", mouseX);

            dashedGroup
                .attr("transform", "translate(" + (+slidingWindow.attr("width") + mouseX ) +
                    ","+ height + ")");

            slidingGroup
                .attr("transform", "translate(" + (mouseX) + "," + (height - (+slidingWindow.attr("height"))) + ")");

            tooltip.html(
                '<text class = "bold">' + formatTimeLegend(xScale.invert(mouseX)) + "</text>")
                .style("left", (mouseX + 16 + margin.left) + "px");

            // get data for ws
            updateWindow(current);

        });


    let legend = g
        .append("g")
        .attr("id", "legendGroup")
        .attr("transform", "translate("+ margin.left + "," + margin.top + ")");

    legend.selectAll("circle")
        .data(keyList)
        .enter()
        .append("circle")
        .attr("class", "legend")
        .attr("r", 5)
        .attr("cx", 10)
        .attr("cy", (d, i) => 65 - 20 * i)
        .attr("fill", (d, i) => d3.schemeCategory10[i]);

    legend.selectAll("text")
        .data(keyList)
        .enter()
        .append("text")
        .attr("class", "legendText")
        .text(d => d)
        .attr("x", 20)
        .attr("y", (d, i) => 70 - 20 * i);

}

function nearestHour(milliseconds) {
    return Date.parse(d3.timeHour.round(new Date(milliseconds)))
}

function getRangedData(data, start, end) {
    return data.filter(d => {
        return ((start < (d.time)) &&
            ((d.time) < end))
    });
}

function getRangedDataScratch(data, start, end) {
    return data.filter(d => {
        return ((start < d.time) &&
            (d.time < end))
    });
}

function updateWindow(current) {
    // get data for ws
    let thisNearestHour = nearestHour(current);
    let rangedData = getRangedData(wsRawData, thisNearestHour, thisNearestHour + numHourAfter*hourToMS);
    let wsData = getWSdata(rangedData);

    let streamRangedData = getRangedDataScratch(highestStack, thisNearestHour,  thisNearestHour + numHourAfter*hourToMS);
    let peak = d3.max(streamRangedData, d=>d.y);
    peak = peak !== undefined ? peak : 0;
    slidingGroup
        .attr("transform", "translate(" + (+vertical.attr("x1")) + "," + yScale(peak) + ")")
        .select("text")
        .attr("x", +slidingWindow.attr("width") /2)
        .attr("text-anchor", "middle")
        .text(numHourAfter + (numHourAfter > 1 ? " hours" : " hour"));

    slidingWindow
        .attr("height", height - yScale(peak))
        .attr("width", slidingWidth(numHourAfter));

    wsContainer.selectAll("*").remove();
    wsContainer
        .attr("width", wsContainerWidth(numHourAfter));
    wordstream(wsContainer, wsData, config);
}

function stepPosition(x, startMark){
    let value = Math.min(Math.max(Math.floor((x-startMark) / stepDash),1), 30);
    return [value * stepDash + startMark, value]
}
function styleAxis(axisNodes) {
   axisNodes.selectAll('.tick text')
       .attr("fill", "#555555");
}
function initDataSelection(dataSelection) {
    var form = d3.select(main).append("form");

    form.selectAll("label")
        .data(dataSelection)
        .enter()
        .append("label")
        .text(function(d) {return d;})
        .insert("input")
        .attr("type", "radio")
        .attr("class", "shape")
        .attr("name", "mode")
        .attr("value", function(d, i) {return i;})
        .property("checked", function(d, i) {return i===1;})
        .on("change", function (d) {
            if (d === "Events"){
                streamRawData = getStreamEventData(data, eventKeywords);
                updateWindow(current);
                updateStream();
            }
            else if (d === "All"){
                streamRawData = getStreamAllData(data, eventKeywords);
                wsRawData = data;
                updateWindow(current);
                updateStream();
            }
        });
}

function updateStream() {
    //Create the stack layout for the data
    const stack = d3.stack().keys(keyList)
        .offset(d3.stackOffsetNone);

    const stacks = stack(streamRawData);
    highestStack = stacks[stacks.length-1].map(d => {
        return {
            y: d[1],
            time: d.data.time
        }
    });
    //The scales
    xScale.domain([startDate, endDate]);
    yScale.domain(d3.extent(stacks.flat().flat()));

    //The y Axis
    const yAxisGroup = d3.select('#yAxis');
    const yAxis = d3.axisLeft(yScale);
    let yAxisNodes = yAxisGroup.transition().duration(1000).call(yAxis);
    styleAxis(yAxisNodes);

    //The area function used to generate path data for the area.
    const areaGen = d3.area()
        .x(d => xScale(d.data.time))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(d3.curveMonotoneX);

    let newchartstack = d3.select("#streamG")
        .selectAll("path").data(stacks,d=>d.key);

    newchartstack.enter().append('path') .attr("class", "layer")
        .attr("opacity", 0)
        .transition().duration(1000)
        .attr("d", areaGen)
        .attr("fill", (d, i) => {
            if (i === 4) {
                return topicColor[0]
            }
            else {
                return d3.schemeCategory10[i]
            }
        })

        .attr("opacity", 1);

    newchartstack.exit()
        .attr("opacity", 1)
        .transition().duration(1000)
        .attr("opacity", 0)
        .remove();

    newchartstack
        .transition().duration(1000).attr("d", areaGen)
        .attr("fill", (d, i) => {
            if (i === 4) {
                return topicColor[0]
            }
            else {
                return d3.schemeCategory10[i]
            }
        });

    let newLegend = d3.select("#legendGroup").selectAll(".legend").data(keyList);

    newLegend.enter()
        .append("circle")
        .attr("class", "legend")
        .attr("cy", (d, i) => 65 - 20 * i)
        .attr("cx", 10)
        .attr("r", 5)
        .attr("opacity", 0)
        .attr("fill", (d, i) => {
            if (i === 4) {
                return topicColor[0]
            }
            else {
                return d3.schemeCategory10[i]
            }
        })
        .transition().duration(1000)
        .attr("opacity", 1);

    newLegend
        .exit()
        .attr("opacity", 1)
        .transition().duration(1000)
        .attr("opacity", 0)
        .remove();

    newLegend
        .attr("r", 5)
        .attr("cx", 10)
        .attr("cy", (d, i) => 65 - 20 * i)
        .attr("fill", (d, i) => {
            if (i === 4) {
                return topicColor[0]
            }
            else {
                return d3.schemeCategory10[i]
            }
        });

    let newLegendText = d3.select("#legendGroup").selectAll(".legendText").data(keyList);
    newLegendText .enter()
        .append("text")
        .attr("class", "legendText")
        .text(d => d)
        .attr("x", 20)
        .attr("y", (d, i) => 70 - 20 * i)
        .attr("opacity", 0)
        .transition().duration(1000)
        .attr("opacity", 1)
    ;

    newLegendText
        .exit()
        .attr("opacity", 1)
        .transition().duration(1000)
        .attr("opacity", 0)
        .remove();

    newLegendText
        .text(d => d)
        .attr("x", 20)
        .attr("y", (d, i) => 70 - 20 * i);
}
