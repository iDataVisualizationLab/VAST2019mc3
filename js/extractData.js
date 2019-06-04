const disasterKeywords = [
    ["rumble"],
    ["emergency", "urgent"],
    ["earthquake", "seismic"],
    ["quake", "quaking"],
    ["shake", "shaking"],
    ["move", "moving"],
    ["wobble", "wobbling"],
    ["quiver", "quivering"],
];
const keywordsFlat = disasterKeywords.flat();
const startDate = Date.parse("2020-04-06 00:00:00");
const endDate = Date.parse("2020-04-10 11:59:00");
const step = 60*60*1000; // one hour
let messageFiltered = [];
let binnedMessage = [];

const margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

let xScale = d3.scaleTime()
    .range([0, width]);

let yScale = d3.scaleLinear()
    .range([height, 0]);

let valueline = d3.line();

let svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


d3.csv("../data/YInt.csv", function (error, data) {
    if (error) throw error;
    else {
        console.log(data);
        data.forEach(d => {
            for (let i = 0; i < keywordsFlat.length; i++){
                if (d.message.toLowerCase().indexOf(keywordsFlat[i]) >= 0){
                    messageFiltered.push(d);
                    // console.log(d);
                    break;
                }
            }
        });
        console.log(messageFiltered.length);
        for (let i = startDate; i < endDate; i += step){
            binnedMessage.push({
                timestamp: i,
                count: messageFiltered.filter(d => {
                    let time = Date.parse(d.time);
                    return time >= i && time < i+step;
                })
            })
        }
        // xScale
        xScale.domain([startDate, endDate]);

        // yScale
        yScale.domain([0, d3.max(binnedMessage, d => d.count.length)]);

        // define the line
        valueline
            .x(function(d) { return xScale(d.timestamp); })
            .y(function(d) { return yScale(d.count.length); });

        svg.selectAll("path")
            .data([binnedMessage])
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("d", valueline);

        // x-axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale));

        // Add the Y Axis
        svg.append("g")
            .call(d3.axisLeft(yScale));
    }
});
