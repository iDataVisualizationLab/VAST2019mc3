let nodeHasLink;
let linkSelection, nodeSelection, textSelection, simulation;
let netWidth = 600, netHeight = 525;
let allUsers;
let radius = netWidth / 3;
let x0 = netWidth / 2;
let y0 = netHeight / 2;
let colorNode = {
    linked: "#444",
    none: "#aaa"
};
let radiusNode = function (quantity) {
    let thisRadius = d3.scaleSqrt()
        .domain([1, 90])
        .range([3, 15])(quantity);
    return thisRadius ? thisRadius : 3;
};
const v = "visible", h = "hidden";

function processNetworkData(rangedData) {
    // let accounts = data.map(d => d.account);
    // let specialAcc = accounts.filter(d => d.search(/\W/g) >= 0);

    let nodes, links;
    let nodesObj = {}, linksObj = {};
    let rawLinks;

    // get list of nodes
    rangedData.forEach(d => {
        let source = idize(d.account);
        nodesObj[source] = true;     // source
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
                if (fromNowOn.indexOf(mrs) >= 0) {
                    updateNodeLink(source, mrs);
                }
                else {
                    let nonwordIndex = fromNowOn.search(/\W/);
                    if (nonwordIndex >= 0) {
                        // found
                        let target = message.slice(index + 1, index + nonwordIndex + 1);
                        updateNodeLink(source, target);
                    }
                    else {
                        // reach the end of message
                        let target = message.slice(index + 1, message.length);
                        updateNodeLink(source, target)
                    }
                }
            });
        }
    });
    getSpecialAccMention();
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
    for (let i = 0; i < rawLinks.length; i++) {
        for (let j = i + 2; j < rawLinks.length; j++) {
            if ((rawLinks[i].source === rawLinks[j].target) &&
                (rawLinks[i].target === rawLinks[j].source)) {
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

    // add more links
    // for (let i = 0; i < nodeHasLink.length; i++){
    //     for (let j = i + 5; j < nodeHasLink.length; j++){
    //         // dummy link
    //         iArray.push({
    //             source: nodeHasLink[i],
    //             target: nodeHasLink[j],
    //             value: 0,
    //             dummy: true
    //         })
    //     }
    // }

    links = links.concat(iArray);

    function getSpecialAccMention() {
        rangedData.forEach((d, i) => {
            let message = d.message;
            specialAcc.forEach(e => {
                if (message.indexOf(e) >= 0) {
                    let source = idize(e);
                    nodesObj[source] = true;     // source
                    if (message.indexOf("@") >= 0) {
                        // get all occurences of @, push in indices
                        let regex = /@\w/gi, result, indices = [];
                        while (result = regex.exec(message)) {
                            indices.push(result.index);
                        }

                        // get account names
                        indices.forEach(index => {
                            let fromNowOn = message.slice(index + 1);
                            let nonwordIndex = fromNowOn.search(/\W/);
                            if (nonwordIndex >= 0) {
                                // found
                                let target = message.slice(index + 1, index + nonwordIndex + 1);
                                updateNodeLink(source, target);
                            }
                            else {
                                // reach the end of message
                                let target = message.slice(index + 1, message.length);
                                updateNodeLink(source, target)
                            }

                        });
                    }
                }
            })
        })
    }

    function updateNodeLink(source, targetNode) {
        let target = idize(targetNode);
        nodesObj[target] = true;
        if (!linksObj[source + "|" + target]) {
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
    console.log(nodes_data, links_data);

    // float box in general
    let selectionPanel = d3.select(main)
        .append("div")
        .attr("class", "box")
        .style("left", (1200) + "px")
        .style("top", (10) + "px");

    let panelContent = selectionPanel.append("div");

    let svg = panelContent.append("svg")
        .attr("width", netWidth)
        .attr("height", netHeight)
        .append("g")
        .attr("id", "networkG");

    let title = panelContent.append("div")
        .attr("class", "markerOverlay")
        .style("top", (10) + "px")
        .style("left", (10) + "px")
        .html("<span style='font-family: sans-serif; font-size: 15px;'>User Interaction Network</span><br>");

    // define simulation
    simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {
            return d.name;
        })
            .distance(d => {
                if (d.dummy) return 120;
                else return 50
            })
            .strength(d => {
                if (d.dummy) return 0.05;
                else return 0.9
            }))
        .force("charge", d3.forceManyBody().strength(d => {
            return linked(d) ? -400 : -200
        }))
        // .alphaMin(0.2)
        .velocityDecay(0.7)
        // .force("collide", d3.forceCollide()
        //     .radius(d => {
        //         return nodeHasLink.indexOf(d.name) >= 0 ? 25 : 3
        //     })
        //     .strength(1)
        // )
        .force("center", d3.forceCenter(netWidth / 2, netHeight / 2))
        .force("xAxis",d3.forceX(netWidth/2).strength(d => linked(d)? 0.9 : 0.1))
        .force("yAxis",d3.forceY(netHeight/2).strength(d => linked(d)? 0.9 : 0.1));

    // let strength = simulation.force('collide').strength(),
    //     endTime = 3000;
    // let transitionTimer = d3.timer(elapsed => {
    //     let dt = elapsed / endTime;
    //     simulation.force('collide').strength(Math.pow(dt, 3) * strength);
    //     if (dt >= 1.0) transitionTimer.stop();
    // });

    d3.select("#networkG").append("g").attr("id", "linkG");
    d3.select("#networkG").append("g").attr("id", "nodeG").attr("cursor", "pointer");

    updateNetwork();
}

function tick() {
    // at this moment nodes_data already has x and y for each point
    nodeSelection
        .attr("transform", bound);
    linkSelection.attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    textSelection
        .attr("x", d => {
            let selection = d3.select("#g" + d.name);
            if (selection._groups[0][0] !== null) {
                let thisTransform = selection.attr("transform");
                let thisX = +thisTransform.split(",")[0].split("(")[1];
                return thisX > (netWidth / 2) ? 10 : (-10 - d.name.length * 5)
            }
            else return 10;

        })
        .attr("y", d => {
            let selection = d3.select("#g" + d.name);
            if (selection._groups[0][0] !== null) {
                let thisTransform = selection.attr("transform");
                let thisY = +thisTransform.split(",")[1].split(")")[0];
                return thisY > (netHeight / 2) ? 5 : -5
            }
            else return 5
        });


    function bound(d) {
        if (distance(x0, y0, d.x, d.y) > radius) {
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

function newPosition(x, y) {
    // line y = ax + b
    let a = (y - y0) / (x - x0);
    let b = y0 - a * x0;

    let c1 = a * a + 1;
    let c2 = 2 * (a * (b - y0) - x0);
    let c3 = x0 * x0 + (b - y0) * (b - y0) - radius * radius;
    let [x1, x2] = solve(c1, c2, c3);

    let y1 = a * x1 + b;
    let y2 = a * x2 + b;

    if (distance(x, y, x1, y1) < distance(x, y, x2, y2)) {
        return [x1, y1]
    }
    else return [x2, y2]
}

function distance(x1, y1, x2, y2) {
    let vecX = x1 - x2, vecY = y1 - y2;
    return Math.sqrt(vecX * vecX + vecY * vecY);
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
    let username = userData.map(d => d.account.toLowerCase());
    allUsers = {};
    getUserData(rangedData)
        .forEach(d => {
            allUsers[idize(d.account)] = d.quantity
        });
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
        .data(nodes_data, d => d.name);

    let groupEnter = nodeSelection.enter()
        .append("g")
        .attr("class", "groupContent")
        .attr("id", d => "g" + d.name)
        .on("mouseover", function (d) {
            // tooltip
            let info = usertooltipInfo(d, rangedData);
            createUserTooltip(userTooltipDiv, info, d);

            userTooltipDiv.transition()
                .duration(100)
                .style("opacity", 1);

            userTooltipDiv.style("left", (d3.event.pageX) + 20 + "px")
                .style("top", (d3.event.pageY + 20) + "px")
                .style("pointer-events", "none");
        })
        .on("mouseout", function (d) {
            //     disable tooltip
            userTooltipDiv.transition()
                .duration(100)
                .style("opacity", 0);
        }); // each g is for one node

    // update
    nodeSelection.select("circle")
        .classed("linked", d => !!linked(d))
        .attr("r", d => radiusNode(allUsers[d.name]))
        .attr("fill", d => linked(d) ? colorNode.linked : colorNode.none);

    textSelection = nodeSelection.select("text")
        .attr("x", 10)
        .attr("y", 10)
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .text(d => d.name)
        .attr("visibility", d => {
            return username.indexOf(d.name) >= 0 ? "visible" : "hidden"
        });

    let prev;
    // enter
    groupEnter
        .append("circle")
        .classed("linked", d => !!linked(d))
        .attr("fill", d => linked(d) ? colorNode.linked : colorNode.none)
        .attr("r", d => {
            return radiusNode(allUsers[d.name])
        })
        .on("mouseover", function (d) {
            prev = d3.select("#text" + d.name).attr("visibility");
            // view name
            d3.select("#text" + d.name)
                .attr("visibility", "visible")
        })
        .on("mouseout", function (d) {
            d3.select("#text" + d.name).attr("visibility", prev)
        });

    textSelection = groupEnter.append("text")
        .attr("class", "nodeText")
        .attr("id", d => "text" + d.name)
        .attr("x", 10)
        .attr("y", 10)
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .text(d => d.name)
        .attr("visibility", d => {
            return username.indexOf(d.name) >= 0 ? "visible" : "hidden"
        })
        .merge(textSelection);

    nodeSelection.exit().remove();

    // re-select all so tick function can update
    nodeSelection = d3.select("#nodeG")
        .selectAll("g.groupContent");

    nodeSelection
        .call(d3.drag()
            .on("start", forcedragstarted)
            .on("drag", forcedragged)
            .on("end", forcedragended));


//    restart
    simulation.nodes(nodes_data);
    simulation.force("link")
        .links(links_data);

    simulation.on("tick", tick).alphaTarget(0.3).restart();

    setTimeout(function () {
        simulation.alphaTarget(0);
        nodeHasLink.forEach(d => {
            d3.select("#g" + d).raise();
        })
    }, 8000);
}


function linked(d) {
    return nodeHasLink.indexOf(d.name) >= 0
}

function linkedAcc(d) {
    return nodeHasLink.indexOf(d) >= 0
}


function idize(str){
    return str.toLowerCase().split(" ").join("");
}