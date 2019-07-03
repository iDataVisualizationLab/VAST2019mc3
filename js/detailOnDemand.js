function tooltipInfo(d, wsRawData){
    if (d.topic === "location"){
        let limited = wsRawData
            .slice(
                bisect(wsRawData, +d.time),
                bisect(wsRawData, +d.time + hourToMS));
        return limited
            .filter(e => e.location === d.text);
    }
    else {
        // message
        let limited = wsRawData
            .slice(
                bisect(wsRawData, +d.time),
                bisect(wsRawData, +d.time + hourToMS));
        return limited
            .filter(e => {
                return e.message.toLowerCase().indexOf(d.text) >= 0;
            });
    }
}

function createTableTooltip(wsTooltipDiv, info, text, prevColor, topic){
    wsTooltipDiv.selectAll("*").remove();
    // process info text

    if (topic === "location"){
        let rows = createTable();
        let cells = rows.selectAll("td")
            .data(function (row) {
                return columns.map(function (column) {
                    return {column: column, value: row[column]}
                })
            })
            .enter()
            .append("td")
            .text(d => d.column === "time"? formatTimeDetailBox(d.value):d.value)
            .style("color", d => d.column === "location"? topicColor[1] : "#000");
    }
    else {
        info.forEach(d => {
            d.messageArr = d.message.toLowerCase().split(text);
            d.messageArr.splice(1,0,text);
        });

        let rows = createTable();

        // create a cell in each row, for each column
        let cells = rows.selectAll("td")
            .data(function (row) {
                return columns.map(function (column) {
                    return column === "message" ?
                        {column: column, value: row[column], array: row["messageArr"]} :
                        {column: column, value: row[column]}
                })
            })
            .enter()
            .append("td")
            .attr("class", cell => "cell" + cell.column)
            .text(d => {
                if (d.column === "time"){
                    return formatTimeDetailBox(d.value)
                }
                else if (d.column === "message"){
                    return ""
                }
                else return d.value;
            });

        rows.selectAll(".cellmessage")
            .selectAll("span")
            .data(function (d) {
                console.log(d);
                return d.array;
            })
            .enter()
            .append("span")
            .text(d => d)
            .style("color", d => d.trim() === text ? prevColor : "#000");
    }

    function createTable(){
        let table = wsTooltipDiv.append("table")
                .attr("class", "tableTooltip")
                .attr("id", "tableTooltip")
                .style("width", "100%"),
            thead = table.append("thead"),
            tbody = table.append("tbody");

        // header row
        thead.append("tr")
            .selectAll("th")
            .data(columns)
            .enter()
            .append("th")
            .attr("class", column => "column-" + column)
            .text(column => capitalize(column));

        // create a row for each record
        let rows = tbody.selectAll("tr")
            .data(info)
            .enter()
            .append("tr");

        return rows
    }
}

function highlight(info, wsData, timestep) {
    let messageInfo, wordDisplayed,
        locationInfo, locationDisplayed;

    // get text from info
    let wordObj = {}, locationObj = {};
    let allKeywords = [], allLocation = [];

    info.forEach(d => {
        allKeywords = allKeywords.concat(splitText(d.message));
        allLocation = allLocation.concat(d.location);
    });

    allKeywords.forEach(d => wordObj[d] = true);
    allLocation.forEach(d => locationObj[d] = true);

    messageInfo = d3.keys(wordObj);
    locationInfo = d3.keys(locationObj);

    // get text from what has been displayed
    let thisColumn = wsData.find(d => d.time == timestep);

    topics.forEach(topic => {
        thisColumn.words[topic]
            .filter(d => {
            return ((d.placed) && (eval(topic + "Info").indexOf(d.text) >= 0))
        })
            .forEach(d => {
                d3.select("#" + removeChar(d.text) + timestep)
                    .classed("highlightText", true);
            })
    })
}