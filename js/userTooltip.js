function usertooltipInfo(d, rangedData) {
    return rangedData.filter(rec => {
        return (idize(rec.account) === d.name) || idize(rec.message).indexOf(d.name) >= 0
    })
}

function createUserTooltip(userTooltipDiv, info, d) {
    userTooltipDiv.selectAll("*").remove();
    // process info text

    userTooltipDiv.append("div")
        .html(d.name + " - Number of related post" +
            (info.length === 1? ": " : "s: ") + info.length)
        .style("height", "20px")
        .style("padding", "5px")
        .style("font-size", "14px")
        .style("text-align", "middle")
        .style("background", "white");

    let table = userTooltipDiv.append("table")
            .attr("class", "tableTooltip")
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