const disasterKeywords = [
    ["rumble"],
    ["emergency", "urgent"],
    ["earthquake", "seismic", "quake", "quaking"],
    ["shake", "shaking", "wobble", "wobbling", "quiver", "quivering"],
];

const resources = {
    transportation: ["road", "roadway", "street", "bridge", "drive", "avenue", "bus line reopen/open", "megabusreopen/open", "metro", "subway", "sub", "trains", "train", "transit"],

    utilities: ["power", "water", "gas", "electricity", "emergency power", "emergency generator", "black out", "blackout", "blackoutnyc", "con ed", "con edison", "coned", "dark", "darker", "downed electrical wires", "power down", "power not expected", "power off", "power out", "power outage", "goodbye power", "knock out power", "lose power", "losing power", "lost power", "njpower", "no power", "nopower", "off the grid", "powerless", "shut off power", "taken power", "transformer exploding", "transformer explosion", "w/o power", "wait power return", "without power", "candle"],

    recovery: ["shelter", "snuggled up safely inside", "stay home", "stay inside", " stay safe", "staysafe", "evacuate", "evacuated", "evacuating", "evacuation", "evacuee", "head away from", "leave home", "leaving city", "police ask leave", "seeking refuge", "sleep outside", "stay with friends", "hotel", "housing", "shelter", "ambulance", "emergency response", "escape", "escaped", "escaping", "first aid", "rescue", "rescued", "rescuing"],

    food: ["feed victims", "food trucks", "free lunch", "free meals", "get meals", "refugee meal", "nutri", "nutrition", "food"]

};

const stopwords = [
    "ourselves", "hers", "between", "yourself", "but", "again", "there", "about", "once", "during", "out", "very", "having", "with", "they", "own", "an", "be", "some", "for", "do", "its", "yours", "such", "into", "of", "most", "itself", "other", "off", "is", "s", "am", "or", "who", "as", "from", "him", "each", "the", "themselves", "until", "below", "are", "we", "these", "your", "his", "through", "don", "nor", "me", "were", "her", "more", "himself", "this", "down", "should", "our", "their", "while", "above", "both", "up", "to", "ours", "had", "she", "all", "no", "when", "at", "any", "before", "them", "same", "and", "been", "have", "in", "will", "on", "does", "yourselves", "then", "that", "because", "what", "over", "why", "so", "can", "did", "not", "now", "under", "he", "you", "herself", "has", "just", "where", "too", "only", "myself", "which", "those", "i", "after", "few", "whom", "t", "being", "if", "theirs", "my", "against", "a", "by", "doing", "it", "how", "further", "was", "here", "than", "something", "someone", "anyone", "everything", "whereís", "anything", "youu", "us", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "1", "2", "3", "4", "5", "6", "7", "8", "8", "9", "0", "re", "guys", "", "don't", "didn't", "i'm", "hi"];

const keywordsFlat = disasterKeywords.flat();
const startDate = Date.parse("2020-04-06 00:00:00");
const endDate = Date.parse("2020-04-10 11:59:00");
const hourToMS = 60 * 60 * 1000;
const streamStepUnit = 0.5; // half hour
const formatTimeLegend = d3.timeFormat("%B %d, %-I:%M:%S %p");
const formatTimeReadData = d3.timeFormat("%B %d, %-I %p");
const topics = ["message", "location"];

const margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

const fisrt5hrsRange = [1586201491000, 1586219491000];

let hourAfter = 5;
let streamStep = streamStepUnit * hourToMS;
let streamData;
let keyList;
let xScale = d3.scaleTime()
    .range([0, width]);

let yScale = d3.scaleLinear()
    .range([height, 0]);

let main = "#mainContent";

loadData();
function loadData(){
    d3.csv("data/YInt.csv", function (error, data) {
        if (error) throw error;
        else {
            console.log(data);
            streamData = getStreamData(data);

            // first 5 hours
            let first5Data = data.filter(d => {
                return ((fisrt5hrsRange[0] < Date.parse(d.time)) &&
                    (Date.parse(d.time) < fisrt5hrsRange[1]))
            });

            let wsData = getWSdata(first5Data);
            console.log(wsData);
            drawGraph();

            let wsContainer = d3.select("body").append("svg")
                .attr("width", 800)
                .attr("height", 600);
            let config = {
                topWord: 50,
                minFont: 10,
                maxFont: 30,
                tickFont: 12,
                legendFont: 12,
                curve: d3.curveMonotoneX
            };
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
    console.log(rangedData);
    let wsData = {};
    rangedData.forEach(d => {
        let date = Date.parse(d.time);
        date = formatTimeReadData(new Date(date));

        let wordArray = d.message.toLowerCase()
            .replace(/\.|\,|\(|\)|\;|\:|\[|\]|\&|\!|\’|\?|\#|\"/gi, '')
            .replace(/\d/g, "")
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
                    sudden: 1,
                    text: d,
                    frequency: counts[d],
                    topic: topic,
                    id: d.replace(/[^a-zA-Z0-9]/g, '_') + "_" + topic + "_" + (i)
                }
            }).sort(function (a, b) {//sort the terms by frequency
                return b.frequency - a.frequency;
            }).filter(function (d) {
                return d.text;
            });//filter out empty words
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

    let g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Create the stack layout for the data
    const stack = d3.stack().keys(keyList)
        .offset(d3.stackOffsetNone);

    const stacks = stack(streamData);
    console.log(stacks);
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

    let indexGroup = d3.select(main).append("g");
    let tooltip = indexGroup
        .append("div")
        .attr("class", "tooltip")
        .style("top", (height + margin.top + margin.bottom) + "px");

    let vertical = indexGroup
        .append("div")
        .attr("id", "vertical")
        .style("position", "absolute")
        .style("z-index", "19")
        .style("width", "1px")
        .style("height", height + margin.top + margin.bottom + "px")
        .style("top", margin.top + "px")
        .style("bottom", "30px")
        .style("background", "#000000");

    g.append("g")
        .attr("id", "streamG")
        .selectAll(".layer")
        .data(stacks).enter()
        .append("path")
        .attr("class", "layer")
        .attr("d", areaGen)
        .attr("fill", (d, i) => d3.schemeCategory10[i]);

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

    let focus = g.append("g").style("display", "none");

    focus.append("line")
        .attr("id", "focusLineX")
        .attr("class", "focusLine");

    focus.append("line")
        .attr("id", "focusLineY")
        .attr("class", "focusLine");

    g.append("rect")
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', function() {
            indexGroup.style('display', null);
        })
        .on('mouseout', function() {
            indexGroup.style('display', 'none');})
        .on("mousemove", function () {
            let mousex = d3.mouse(this);
            mousex = mousex[0] + 6;

            // tooltip and vertical line
            vertical.style("left", (mousex + margin.left)+ "px");

            tooltip.html(
                '<text class = "bold">' + formatTimeLegend(xScale.invert(mousex - 8)) + "</text>")
                .style("left", ((d3.event.pageX) + 10) + "px")
                .style("pointer-events", "none");

            // get data for ws
            console.log(Date.parse(xScale.invert(mousex - 8)));
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
    // .attr("fill", (d, i)=> d3.schemeCategory10[i]);

    // d3.select(main)
    //     .on("mousemove", function () {
    //         mousex = d3.mouse(this);
    //         mousex = mousex[0] + 5;
    //         vertical.style("left", mousex + "px");
    //
    //         tooltip.transition()
    //             .duration(100)
    //             .style("opacity", 1);
    //
    //         tooltip.html(
    //             '<text class = "bold">' + formatTimeLegend(xScale.invert(mousex - margin.left - 8)) + "</text>")
    //             .style("left", ((d3.event.pageX)) + "px")
    //             .style("pointer-events", "none");
    //     })
    //     .on("mouseover", function () {
    //         mousex = d3.mouse(this);
    //         mousex = mousex[0] + 5;
    //
    //         // console.log(mousex);
    //     })
    // ;
}

