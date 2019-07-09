function tooltipInfo(d, wsRawData) {
    if (d.topic === "location") {
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

function createTableTooltip(wsTooltipDiv, info, text, prevColor, topic, d) {
    wsTooltipDiv.selectAll("*").remove();
    // process info text

    wsTooltipDiv.append("div")
        .html(text + " - Number of post" +
            (d.frequency === 1? ": " : "s: ") + d.frequency)
        .style("height", "20px")
        .style("padding", "5px")
        .style("font-size", "14px")
        .style("text-align", "middle")
        .style("background", "white");
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

    let cells = rows.selectAll("td")
        .data(function (row) {
            return columns.map(function (column) {
                return {column: column, value: row[column]}
            })
        })
        .enter()
        .append("td")
        .style("color", d => ((d.column === "location") && (topic === "location")) ? topicColor[1] : "#000")
        .html(function (d) {
            if (d.column === "time") {
                return formatTimeDetailBox(d.value)
            }
            else if (d.column === "message") {
                let sentence = d.value;
                for (let i = 0; i < dataOption.length; i++) {
                    for (let j = 0; j < dataOption[i].content.length; j++) {
                        let index = sentence.toLowerCase().indexOf(dataOption[i].content[j]);
                        if (index >= 0) {
                            let word = sentence.slice(index).split(/\W/)[0];
                            let replaceWord =
                                `<span class="highlightTextDetail" style="color: ${dataOption[i].color};"` + ">" + word + "</span>";
                            sentence = name(sentence, word, replaceWord);
                        }
                    }
                }
                return sentence;
            }
            else return d.value;
        })
    ;
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

function name(str, replaceWhat, replaceTo) {
    var re = new RegExp(replaceWhat, 'g');
    return str.replace(re, replaceTo);
}