let nodeHasLink;
let linkSelection, nodeSelection, textSelection, simulation;
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
        for (let j = i+2; j < rawLinks.length; j++){
            if ((rawLinks[i].source === rawLinks[j].target) &&
                (rawLinks[i].target === rawLinks[j].source)){
                rawLinks[i].value += rawLinks[j].value; // add up

                iArray.push(rawLinks[i]);
                rawLinks[i].dup = true;
                rawLinks[j].dup = true;
            }
        }
    }

    // get all single calls
    links = rawLinks.filter(d => {
        return !d.dup;
    });
    let nodeHasLinkObj = {};

    links.forEach(link => {
        nodeHasLinkObj[link.source] = true;
        nodeHasLinkObj[link.target] = true;
    });

    nodeHasLink = d3.keys(nodeHasLinkObj);

    for (let i = 0; i < nodeHasLink.length; i++){
        for (let j = i + 5; j < nodeHasLink.length; j++){
            // dummy link
            iArray.push({
                source: nodeHasLink[i],
                target: nodeHasLink[j],
                value: 0,
                dummy: true
            })
        }
    }
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
    let width = 600, height = 525;
    let radius = width/3;
    let x0 = width/2;
    let y0 = height/2;

    console.log(nodes_data, links_data);

    // float box in general
    let selectionPanel = d3.select(main)
        .append("div")
        .attr("class", "box")
        .style("left", (1740) + "px")
        .style("top", (10) + "px");

    let panelContent = selectionPanel.append("div");

    let svg = panelContent.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("id", "networkG");

    // define simulation
    simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.name; })
            .distance(d => {
                if (d.dummy) return 120;
                else return 50
            })
            .strength(d => {
                if (d.dummy) return 0.05;
                else return 4.5
            }))
        .force("charge", d3.forceManyBody().strength(d => {
            return nodeHasLink.indexOf(d.name) >= 0 ? -40:-20
        }))
        .alphaTarget(0.01)
        .velocityDecay(0.7)
        .force("collision", d3.forceCollide()
            .radius(d => {
                return nodeHasLink.indexOf(d.name) >= 0 ?25:3
            })
            .strength(1)
        )
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", tick);

    d3.select("#networkG").append("g").attr("id", "linkG");
    d3.select("#networkG").append("g").attr("id", "nodeG").attr("cursor", "pointer");

    updateNetwork();

    function tick(){
        // at this moment nodes_data already has x and y for each point
        linkSelection.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        nodeSelection
            .attr("transform", bound);

        // textSelection
        //     .attr("x", d => {
        //         let thisTransform = d3.select("#g" + d.name).attr("transform");
        //         let thisX = +thisTransform.split(",")[0].split("(")[1];
        //         return thisX > (width/2) ? 5 : (-5 - d.name.length*5)
        //     })
        //     .attr("y", d => {
        //         let thisTransform = d3.select("#g" + d.name).attr("transform");
        //         let thisY = +thisTransform.split(",")[1].split(")")[0];
        //         return thisY > (height/2) ? 5 : -5
        //     });
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

}
function forcedragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.2).restart();
    d.fx = d.x;
    d.fy = d.y;
}
function forcedragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}
function forcedragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
function updateNetwork() {
    console.log("network run")
    // ::::: LINK :::::
    linkSelection = d3.select("#linkG")
        .selectAll("line")
        .data(links_data);

    linkSelection.exit().remove();

    linkSelection.attr("stroke-width", d => d.value)
        .attr("stroke", "gray");

    linkSelection = linkSelection.enter()
        .append("line")
        .attr("stroke-width", d => d.value)
        .attr("stroke", "gray")
        .merge(linkSelection);  // merge with above selection

    // ::::: NODE :::::
    nodeSelection = d3.select("#nodeG")
        .selectAll("g.groupContent")
        .data(nodes_data);

    let groupEnter = nodeSelection.enter()
        .append("g")
        .attr("class", "groupContent"); // each g is for one node

    // enter
    groupEnter
        .append("circle")
        .attr("fill", d => nodeHasLink.indexOf(d.name) >= 0 ? "maroon":"chocolate")
        .attr("r", 4);

    groupEnter.append("text")
        .attr("class", "nodeText")
        .attr("x", 10)
        .attr("y", 10)
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .text(d => d.name);

    // update
    nodeSelection.select("circle")
        .attr("fill", d => nodeHasLink.indexOf(d.name) >= 0 ? "maroon":"chocolate")
        .attr("r", 4);

    nodeSelection.select("text")
        .attr("x", 10)
        .attr("y", 10)
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .text(d => d.name);

    nodeSelection.exit().remove();

    // re-select all so tick function can update
    nodeSelection = d3.select("#nodeG")
        .selectAll("g.groupContent");

    nodeSelection
        .call(d3.drag()
            .on("start", forcedragstarted)
            .on("drag", forcedragged)
            .on("end", forcedragended));

    // nodeSelection = d3.select("#nodeG")
    //     .selectAll(".g-node")
    //     .data(nodes_data);
    //
    // nodeSelection.exit().remove();
    //
    // // update - circle
    // nodeSelection.select("circle")
    //     .attr("fill", d => nodeHasLink.indexOf(d.name) >= 0 ? "maroon":"chocolate")
    //     .attr("r", 4);
    //
    // // update - text
    // nodeSelection.select("text")
    //     .attr("x", 10)
    //     .attr("y", 10)
    //     .attr("font-family", "sans-serif")
    //     .attr("font-size", 10)
    //     .text(d => d.name);
    //
    // // enter
    // // enter g
    // nodeSelection = nodeSelection.enter()
    //     .append("g")
    //     .attr("class", "g-node")
    //     .attr("id", d => {
    //         return "g"+d.name
    //     })
    //     .merge(nodeSelection)
    //     .call(d3.drag()
    //         .on("start", forcedragstarted)
    //         .on("drag", forcedragged)
    //         .on("end", forcedragended));
    //
    // // enter circle
    // nodeSelection
    //     .append("circle")
    //     .attr("fill", d => nodeHasLink.indexOf(d.name) >= 0 ? "maroon":"chocolate")
    //     .attr("r", 4);
    //
    // // enter text
    // nodeSelection.append("text")
    //     .attr("class", "nodeText")
    //     .attr("x", 10)
    //     .attr("y", 10)
    //     .attr("font-family", "sans-serif")
    //     .attr("font-size", 10)
    //     .text(d => d.name);

//    restart
    simulation.nodes(nodes_data);
    simulation.force("link")
        .links(links_data);

    simulation.alphaTarget(0.2).restart();
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

