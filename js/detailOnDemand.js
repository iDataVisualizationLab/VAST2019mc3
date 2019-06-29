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

function createTableTooltip(wsTooltipDiv, info){
    wsTooltipDiv.selectAll("*").remove();
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

    // create a cell in each row, for each column
    let cells = rows.selectAll("td")
        .data(function (row) {
            return columns.map(function (column) {
                return {column: column, value: row[column]}
            })
        })
        .enter()
        .append("td")
        .text(d => d.column === "time"? formatTimeLegend(d.value):d.value);

}