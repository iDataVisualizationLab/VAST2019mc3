const keywordsFlat = disasterKeywords.flat();
const startDate = Date.parse("2020-04-06 00:00:00");
const endDate = Date.parse("2020-04-10 11:59:00");
const hourToMS = 60 * 60 * 1000;
const streamStepUnit = 0.5; // half hour
const formatTimeLegend = d3.timeFormat("%B %d, %-I:%M:%S %p");
const formatTimeReadData = d3.timeFormat("%-m/%-d %-I%p");
const topics = ["message", "location"];
const topicColor = ["#919191", "#161616"];
const margin = {top: 30, right: 20, bottom: 50, left: 50},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

const fisrt5hrsRange = [1586201491000, 1586223091000];

let data;
let streamStep = streamStepUnit * hourToMS;
let streamData;
let highestStack;
let keyList;
let xScale = d3.scaleTime()
    .range([0, width]);

let yScale = d3.scaleLinear()
    .range([height, 0]);
let config = {
    topWord: 40,
    minFont: 10,
    maxFont: 30,
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
        .range([600, 2000])(numHourAfter);
};
let slidingWindow;
let slidingWidth = function(numHourAfter){
    return d3.scaleLinear()
        .domain([0,30])
        .range([0, (30/108) * width])(numHourAfter)
};
loadData();
function loadData(){
    d3.csv("data/YInt.csv", function (error, inputData) {
        if (error) throw error;
        else {
            data = inputData;
            console.log(data);
            streamData = getStreamData(data);

            // first 5 hours
            let first5Data = getRangedData(data, fisrt5hrsRange[0], fisrt5hrsRange[1]);
            let wsData = getWSdata(first5Data);
            drawGraph();

            wsContainer = d3.select("body").append("svg")
                .attr("width", wsContainerWidth(numHourAfter))
                .attr("height", 500);

            wordstream(wsContainer, wsData, config);
        }
    });
}

function getStreamData(data){
    let streamData = [];
    let streamData00 = {};
    for (let i = 0; i < disasterKeywords.length; i++) {
        streamData00[disasterKeywords[i]] = [];
    }

    let streamData11 = {};
    data.forEach(d => {
        let flag = false;
        for (let i = 0; i < disasterKeywords.length; i++) {
            for (let j = 0; j < disasterKeywords[i].length; j++) {
                if (d.message.toLowerCase().indexOf(disasterKeywords[i][j]) >= 0) {
                    streamData00[disasterKeywords[i]].push(d);
                    flag = true;
                    break;
                }
            }
            if (flag === true) break;
        }
    });

    // streamData
    keyList = d3.keys(streamData00);
    keyList.forEach(d => {
        streamData11[d] = [];
        for (let i = startDate; i < endDate; i += streamStep) {
            streamData11[d].push({
                timestamp: i,
                count: streamData00[d].filter(d => {
                    let time = Date.parse(d.time);
                    return time >= i && time < i + streamStep;
                })
            })
        }
    });
    for (let i = 0; i < streamData11[keyList[0]].length; i++) {
        let obj = {};
        obj.time = streamData11[keyList[0]][i].timestamp;
        keyList.forEach(key => {
            obj[key] = streamData11[key][i].count.length;
        });
        streamData.push(obj);
    }
    return streamData;
}

function getWSdata(rangedData) {
    let wsData = {};
    rangedData.forEach(d => {
        let date = Date.parse(d.time);
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

    d3.select(main)
        .append("div")
        .attr("id", "slider-simple");

    let sliderSimple = d3
        .sliderBottom()
        .min(0)
        .max(30)
        .width(300)
        .ticks(5)
        .step(1)
        .default(6)
        .on('onchange', val => {
            d3.select('p#value-simple').text((val));
            numHourAfter = val;
            update(current)
        });

    let gSimple = d3
        .select('div#slider-simple')
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gSimple.call(sliderSimple);

    d3.select('p#value-simple').text((sliderSimple.value()));

    let g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Create the stack layout for the data
    const stack = d3.stack().keys(keyList)
        .offset(d3.stackOffsetNone);

    const stacks = stack(streamData);
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
    xAxisGroup.call(xAxis);

    //The y Axis
    const yAxisGroup = g.append('g');
    const yAxis = d3.axisLeft(yScale);
    yAxisGroup.call(yAxis);

    //The area function used to generate path data for the area.
    const areaGen = d3.area()
        .x(d => xScale(d.data.time))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(d3.curveMonotoneX);

    let tooltip = d3.select(main)
        .append("div")
        .attr("class", "tooltip")
        .style("top", (height + margin.top/2 + margin.bottom) + "px")
        .style("font-size", "15px")
        .style("pointer-events", "none");

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

    let vertical = g
        .append("line")
        .attr("id", "vertical")
        .style("stroke", "black")
        .attr("y1", 0)
        .attr("y2", height + margin.top + margin.bottom)
        .attr("x1", xScale(fisrt5hrsRange[0]))
        .attr("x2", xScale(fisrt5hrsRange[0]));

    let windowSize = {
        height: 287,
        width: 52,
    };

    slidingWindow = g.append("rect")
        .attr("x", xScale(fisrt5hrsRange[0]))
        .attr("width", slidingWidth(6))
        .attr("y", height - windowSize.height)
        .attr("width", windowSize.width)
        .attr("height", windowSize.height)
        .attr("fill", "#aaaaaa")
        .attr("fill-opacity", 0.1)
        .attr("stroke", "black");
    console.log(stacks[stacks.length-1]);

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
            let mouseX = d3.mouse(this);
            mouseX = mouseX[0] + 8;

            current = Date.parse(xScale.invert(mouseX - 8));

            // vertical line, sliding window and tooltip
            vertical
                .attr("x1", mouseX - 8)
                .attr("x2", mouseX - 8);

            slidingWindow
                .attr("x", mouseX - 8);

            tooltip.html(
                '<text class = "bold">' + formatTimeLegend(xScale.invert(mouseX - 8)) + "</text>")
                .style("left", (d3.event.pageX + 8) + "px");

            // get data for ws
            update(current);

        });

    let legend = g
        .append("g")
        .attr("transform", "translate("+ margin.left + "," + margin.top + ")");

    legend.selectAll("circle")
        .data(keyList)
        .enter()
        .append("circle")
        .attr("r", 5)
        .attr("cx", 10)
        .attr("cy", (d, i) => 65 - 20 * i)
        .attr("fill", (d, i) => d3.schemeCategory10[i]);

    legend.selectAll("text")
        .data(keyList)
        .enter()
        .append("text")
        .text(d => d)
        .attr("x", 20)
        .attr("y", (d, i) => 70 - 20 * i);
}

function nearestHour(milliseconds) {
    return Date.parse(d3.timeHour.floor(new Date(milliseconds)))
}

function getRangedData(data, start, end) {
    return data.filter(d => {
        return ((start < Date.parse(d.time)) &&
            (Date.parse(d.time) < end))
    });
}

function getRangedDataScratch(data, start, end) {
    return data.filter(d => {
        return ((start < d.time) &&
            (d.time < end))
    });
}

function update(current) {
    // get data for ws
    let thisNearestHour = nearestHour(current);
    let rangedData = getRangedData(data, thisNearestHour, thisNearestHour + numHourAfter*hourToMS);
    let wsData = getWSdata(rangedData);

    let streamRangedData = getRangedDataScratch(highestStack, thisNearestHour,  thisNearestHour + numHourAfter*hourToMS);

    let peak = d3.max(streamRangedData, d=>d.y);
    // console.log(peak);
    slidingWindow
        .attr("y", yScale(peak))
        .attr("height", height - yScale(peak))
        .attr("width", slidingWidth(numHourAfter));
    wsContainer.selectAll("*").remove();
    wsContainer
        .attr("width", wsContainerWidth(numHourAfter));
    wordstream(wsContainer, wsData, config);
}