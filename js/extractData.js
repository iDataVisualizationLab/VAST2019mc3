const disasterKeywords = [
    ["rumble"],
    ["emergency", "urgent"],
    ["earthquake", "seismic"],
    ["quake", "quaking"],
    ["shake", "shaking"],
    ["wobble", "wobbling"],
    ["quiver", "quivering"],
];
const keywordsFlat = disasterKeywords.flat();
const startDate = Date.parse("2020-04-06 00:00:00");
const endDate = Date.parse("2020-04-10 11:59:00");
const step = 60*60*1000; // one hour
let streamData00 = {};
for (let i = 0; i < disasterKeywords.length; i++){
    streamData00[disasterKeywords[i]] = [];
}
let streamData11 = {};
let streamData = [];
let keyList;
const margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

let xScale = d3.scaleTime()
    .range([0, width]);

let yScale = d3.scaleLinear()
    .range([height, 0]);

let svg = d3.select(".main")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let vertical = d3.select(".main")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "19")
    .style("width", "1px")
    .style("height", height)
    .style("top", "10px")
    .style("bottom", "30px")
    .style("left", "0px")
    .style("background", "#000000");

let tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("top", height + margin.top + margin.bottom);

d3.csv("data/YInt.csv", function (error, data) {
    if (error) throw error;
    else {
        console.log(data);
        data.some(d => {
            let flag = false;
            for (let i = 0; i < disasterKeywords.length; i++){
                for (let j = 0; j < disasterKeywords[i].length; j++){
                    if (d.message.toLowerCase().indexOf(disasterKeywords[i][j]) >= 0){
                        streamData00[disasterKeywords[i]].push(d);
                        flag = true;
                        break;
                    }
                }
                if (flag === true) break;
            }
        });

        keyList = d3.keys(streamData00);

        keyList.forEach(d => {
            streamData11[d] = [];
            for (let i = startDate; i < endDate; i += step){
                streamData11[d].push({
                    timestamp: i,
                    count: streamData00[d].filter(d => {
                        let time = Date.parse(d.time);
                        return time >= i && time < i+step;
                    })
                })
            }
        });

        for (let i = 0; i < streamData11[keyList[0]].length; i++){
            let obj = {};
                obj.time = streamData11[keyList[0]][i].timestamp;
                keyList.forEach(key => {
                    obj[key] = streamData11[key][i].count.length;
                });
                streamData.push(obj);
        }

//Create the stack layout for the data
        const stack = d3.stack().keys(keyList)
            .offset(d3.stackOffsetNone)
        ;
        const stacks = stack(streamData);
        console.log(stacks);
        //The scales
        xScale.domain([startDate, endDate]);

        yScale.domain(d3.extent(stacks.flat().flat()));

        //The x axis
        const xAxisGroup = svg.append("g").attr("transform", "translate(0," + height + ")");
        const xAxis = d3.axisBottom(xScale)
        xAxisGroup.call(xAxis);

        //The y Axis
        const yAxisGroup = svg.append('g');
        const yAxis = d3.axisLeft(yScale);
        yAxisGroup.call(yAxis);
        //The area function used to generate path data for the area.
        const areaGen = d3.area()
            .x(d=>{
                console.log(d);
                return xScale(d.data.time)
            })
            .y0(d=>yScale(d[0]))
            .y1(d=>yScale(d[1]))
            .curve(d3.curveBasis)
        ;

        svg.append("svg")
            .attr("id", "streamG")
            .selectAll(".stream")
            .data(stacks).enter()
            .append("path").attr("d", areaGen)
            .attr("fill", (d, i)=> d3.schemeCategory10[i]) ;

        let legend = svg
            .append("g")
            .attr("transform", "translate(80, 80)");

        legend.selectAll("circle")
            .data(keyList)
            .enter()
            .append("circle")
            .attr("r", 5)
            .attr("cx", 10)
            .attr("cy", (d,i) => 65 - 20*i)
            .attr("fill", (d, i)=> d3.schemeCategory10[i]);

        legend.selectAll("text")
            .data(keyList)
            .enter()
            .append("text")
            .text(d => d)
            .attr("x", 20)
            .attr("y", (d,i) => 70 - 20*i);
            // .attr("fill", (d, i)=> d3.schemeCategory10[i]);

        d3.select(".main")
            .on("mousemove", function(){
                mousex = d3.mouse(this);
                mousex = mousex[0] + 5;
                vertical.style("left", mousex + "px" );

                tooltip.transition()
                    .duration(100)
                    .style("opacity", 1);

                tooltip.html(
                    '<text class = "bold">' + xScale.invert(mousex-margin.left-8)+ "</text>"
                )
                    .style("left", ((d3.event.pageX)) + "px")
                    .style("pointer-events", "none")

            })
            .on("mouseover", function(){
                mousex = d3.mouse(this);
                mousex = mousex[0] + 5;
                vertical.style("left", mousex + "px")
                tooltip.transition()
                    .duration(100)
                    .style("opacity", 0);
            });


    }
});
