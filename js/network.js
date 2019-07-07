function processNetworkData(rangedData) {
    // let accounts = data.map(d => d.account);
    // let specialAcc = accounts.filter(d => d.search(/\W/g) >= 0);

    let nodes, links;
    let nodesObj = {}, linksObj = {};
    let rawLinks;
    
    // get list of nodes
    rangedData.forEach(d => {
        let source = d.account.toLowerCase().split(" ").join("");
        nodesObj[source] = true;     // source
        let accounts = [];
        let message = d.message;
        if (message.indexOf("@") >= 0) {
            // get all occurences of @, push in indices
            let regex = /@\w/gi, result, indices = [];
            while (result = regex.exec(message)) {
                indices.push(result.index);
            }

            // get account names
            indices.forEach(index => {
                let fromNowOn = message.slice(index + 1);
                if (fromNowOn.indexOf(mrs) >=0){
                    updateNodeLink(source, mrs, message);
                }
                else {
                    let nonwordIndex = fromNowOn.search(/\W/);
                    if (nonwordIndex >= 0) {
                        // found
                        let target = message.slice(index+1, index + nonwordIndex + 1);
                        updateNodeLink(source, target, message);
                    }
                    else {
                        // reach the end of message
                        let target = message.slice(index+1, message.length);
                        updateNodeLink(source, target, message)
                    }
                }
            });
        }
    });
    
    nodes = d3.keys(nodesObj).map(d => {
        return {name: d}
    });

    let iArray = [];
    rawLinks = d3.keys(linksObj).map(d => {
        let names = d.split("|");
        return {
            source: names[0],
            target: names[1],
            value: linksObj[d]
        }
    });

    // check duplicates
    for (let i = 0; i < rawLinks.length; i++){
        for (let j = i+1; j < rawLinks.length; j++){
            if ((rawLinks[i].source === rawLinks[j].target) &&
                (rawLinks[i].target === rawLinks[j].source)){
                rawLinks[i].value += rawLinks[j].value; // add up

                iArray.push(rawLinks[i]);
                rawLinks[i].dup = true;
                rawLinks[j].dup = true;
            }
        }
    }

    // for (let i = 0; i < links.length; i++){
    //     for (let j = i+1; j < links.length; j++){
    //         if ((links[i].source === links[j].target) &&
    //             (links[i].target === links[j].source)){
    //             console.log(links[i], links[j]);
    //
    //         }
    //     }
    // }

    // get all single calls
    links = rawLinks.filter(d => {
        return !d.dup;
    });
    
    links = links.concat(iArray);

    function updateNodeLink(source, targetNode, message){
        let target = targetNode.toLowerCase().split(" ").join("");
        nodesObj[target] = true;
        if (!linksObj[source + "|" + target]){
            linksObj[source + "|" + target] = 1;
        }
        else linksObj[source + "|" + target] += 1;
    }
    
    return {
        nodes: nodes,
        links: links
    }
}
function drawNetwork() {
    let nodes_data = networkData.nodes, links_data = networkData.links;
    console.log(nodes_data, links_data);
    let width = 600, height = 525;
    // float box in general
    let selectionPanel = d3.select(main)
        .append("div")
        .attr("class", "box")
        .style("left", (1750) + "px")
        .style("top", (10) + "px");

    let panelContent = selectionPanel.append("div")
        .attr("class", "floatingBoxContent");

    let svg = panelContent.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("id", "networkG");
        // .attr("transform",
        //     "translate(" + marginU.left + "," + marginU.top + ")");

    // define simulation
    let simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.name; })
            .distance(50).strength(0.4))
        .force("charge", d3.forceManyBody().strength(-5))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", tick);

    // no location
    let links = svg.append("g")
        .attr("class", "link")
        .selectAll("line")
        .data(links_data)
        .enter()
        .append("line")
        .attr("stroke-width", d => {
            console.log(d);
            return d.value
        })
        .attr("stroke", "gray");

    // no location
    let nodes = svg.append("g")
        .attr("class", "node")
        .selectAll("g")
        .data(nodes_data)
        .enter()
        .append("g")
        .attr("id", d => {
            return "g"+d.name
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    let circles = nodes
        .append("circle")
        .attr("fill", "maroon")
        .attr("r", 3);

    let text = nodes.append("text")
        .attr("x", 10)
        .attr("y", 10)
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .text(d => d.name);

    simulation.nodes(nodes_data);

    simulation.force("link")
        .links(links_data);

    let radius = width/3;
    let x0 = width/2;
    let y0 = height/2;

    function tick(){
        // at this moment nodes_data already has x and y for each point
        links.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        nodes
            .attr("transform", bound);

        text
            .attr("x", d => {
                let thisTransform = d3.select("#g" + d.name).attr("transform");
                let thisX = +thisTransform.split(",")[0].split("(")[1];
                return thisX > (width/2) ? 10 : (-10 - d.name.length*5)
            })
            .attr("y", d => {
                let thisTransform = d3.select("#g" + d.name).attr("transform");
                let thisY = +thisTransform.split(",")[1].split(")")[0];
                return thisY > (height/2) ? 10 : -10
            });

        function bound(d){
            if (distance(x0, y0, d.x, d.y) > radius){
                [d.x, d.y] = (newPosition(d.x, d.y))
            }
            return "translate(" + d.x + "," + d.y + ")";
        }
    }


    function solve(a, b, c) {
        var result = (-1 * b + Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
        var result2 = (-1 * b - Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);

        return [result, result2];
    }

    function newPosition(x,y){
        // line y = ax + b
        let a = (y-y0)/(x-x0);
        let b = y0 -a*x0;

        let c1 = a*a + 1;
        let c2 = 2*(a*(b-y0) - x0);
        let c3 = x0*x0 + (b-y0)*(b-y0) - radius*radius;
        let [x1, x2] = solve(c1, c2, c3);

        let y1 = a*x1 + b;
        let y2 = a*x2 + b;

        if (distance(x, y, x1, y1) < distance(x, y, x2, y2)){
            return [x1,y1]
        }
        else return [x2, y2]
    }

    function distance(x1, y1, x2, y2){
        let vecX = x1 -x2, vecY = y1 - y2;
        return Math.sqrt(vecX * vecX + vecY * vecY);
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.9).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

function updateNetwork() {

}
function getSpecialAccMention(data){
    data.forEach((d,i) => {
        let message = d.message;
        specialAcc.forEach(e => {
            if (message.indexOf(e) >= 0){
                console.log(i, e, message);
            }
        })
    })
}

