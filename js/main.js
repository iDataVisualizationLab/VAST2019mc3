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
    "0","1","2","3","4","5","6","7","8","9","brazo","we're","it's","can't","we’re","thk","it’","chk","you're","you'll","us","thx","the","a","an","republicans","republican","democrats","democratic","and","democrat","americans","american","america","hey","ok","wanna","lmao","lot","ur","im","thank","you?","&amp;","dm","just","dont","lol","lil","gonna","rt","...","..","--","about","above","according","accordingly","across","actually","adj","adv","after","afterwards","again","against","ago","ah","aint","al","albeit","all","almost","alone","along","already","also","alt","although","always","am","among","amongst","another","any","anybody","anyhow","anyone","anything","anyway","anyways","anywhere","apparently","appear","apply","are","area","areas","arent","around","as","aside","ask","asked","asking","asks","at","available","ave","away","aye","ba","back","backed","backing","backs","basic","basis","be","became","because","become","becomes","becoming","been","before","beforehand","began","begin","behind","being","beings","below","beside","besides","best","better","between","beyond","bi","big","both","brief","but","by","call","called","came","can","cannot","cant","certain","certainly","cf","clear","clearly","cm","co","come","comes","concerning","consequently","considering","contain","containing","contains","contrariwise","corresponding","could","couldnt","course","currently","date","dc","de","definitely","describe","described","describes","despite","determine","determined","di","did","didnt","differ","different","differently","do","does","doesnt","doing","done","double","down","downed","downing","downs","downwards","dr","dual","during","each","early","ed","eg","eight","either","eleven","else","elsewhere","empty","end","ended","ending","ends","enough","entirely","especially","est","et","etc","even","evenly","ever","every","everybody","everyone","everything","everywhere","exactly","example","except","excepted","excepting","exception","exclude","excluding","exclusive","face","faces","fact","facts","far","felt","few","fifteen","fifth","find","finds","first","five","for","forth","forty","forward","found","four","fr","free","from","front","ft","full","fully","further","furthered","furthering","furthermore","furthers","furthest","gave","general","generally","get","gets","getting","give","given","gives","go","goes","going","gone","good","goods","got","gotten","great","greater","greatest","group","grouped","grouping","groups","had","hadnt","half","halves","happens","hardly","has","hasnt","hast","hath","have","having","he","hear","heard","hed","hello","help","hence","henceforth","her","here","hereabouts","hereafter","hereby","herein","hereto","hereupon","hers","herself","hes","high","higher","highest","him","himself","hindmost","his","hither","hitherto","hopefully","how","howbeit","however","howsoever","hr","hundred","hyper","id","ie","if","ii","iii","immediate","important","in","inasmuch","inc","including","indeed","indicate","indicated","indicates","insofar","insomuch","instead","int","interest","interested","interesting","interests","into","intra","intro","inward","inwards","is","isnt","it","itd","item","itll","its","itself","iv","ive","ix","keep","keeps","kept","kg","km","knew","know","known","knows","large","largely","last","lat","lately","later","latest","latter","latterly","least","left","less","lest","let","lets","like","likely","little","ll","lon","long","longer","longest","look","looks","ltd","lt","made","mainly","make","making","man","many","may","maybe","md","me","mean","means","meant","meantime","meanwhile","merely","micro","might","mine","mm","more","moreover","morning","most","mostly","move","mph","mr","mrs","ms","mt","much","multi","must","mustnt","my","myself","name","namely","near","nearly","necessary","need","needed","needing","neednt","needs","neither","never","nevertheless","new","newer","newest","news","next","nine","no","nobody","non","none","nonetheless","noone","nope","nor","normally","not","nothing","notwithstanding","novel","now","nowadays","nowhere","nt","number","obs","obviously","of","off","often","oh","okay","old","older","oldest","on","once","one","ones","only","onto","op","open","opened","opening","opens","or","other","others","otherwise","ought","our","ours","ourselves","out","outside","over","overall","own","oz","page","part","parted","particular","particularly","parting","parts","per","perhaps","phr","pl","please","plus","pm","possible","pre","presumably","pro","probably","provided","pt","put","puts","quite","rather","re","really","reasonably","regarding","regardless","regards","related","relatively","required","respectively","results","right","said","saith","same","saw","say","saying","says","sec","second","secondly","seconds","see","seeing","seem","seemed","seeming","seems","seen","sees","seldom","self","selves","semi","seven","several","shall","shalt","she","shes","should","shouldnt","show","showed","showing","shown","shows","side","sides","since","sir","sixty","so","some","somebody","somehow","someone","something","sometime","sometimes","somewhat","somewhere","st","still","such","supposing","sure","take","tell","tends","th","than","thanks","thanx","that","thatd","thatll","thats","thee","their","theirs","them","themselves","then","thence","thenceforth","there","thereabout","thereabouts","thereafter","thereby","thered","therefore","therein","thereof","thereon","theres","thereto","thereupon","therll","these","they","theyve","thine","thing","things","think","thinks","third","this","thorough","thoroughly","those","thou","though","three","thrice","through","throughout","thru","thus","thy","thyself","till","time","tm","to","today","together","told","too","took","toward","towards","trans","tried","tries","truly","trying","turn","turned","turning","turns","twelve","twenty","twice","two","under","unless","unlike","unlikely","until","unto","up","upon","upward","upwards","use","used","useful","uses","using","usually","various","ve","very","vi","vii","viii","via","viz","vs","was","wasnt","way","ways","we","well","wells","went","were","werent","weve","what","whatever","whatsoever","when","whence","whenever","whensoever","where","whereabouts","whereafter","whereas","whereat","whereby","wherefore","wherefrom","wherein","whereinto","whereof","whereon","wheresoever","whereto","whereunto","whereupon","wherever","wherewith","whether","whew","which","whichever","whichsoever","while","whilst","whither","who","whoa","whoever","whole","whom","whomever","whomsoever","whose","whosoever","why","will","willing","wilt","wish","with","within","without","wonder","wont","work","worked","working","works","worse","worst","would","wouldnt","wt","xi","xii","xiii","xiv","xv","xvi","xvii","xviii","xix","xx","yd","ye","year","years","yes","yet","yippee","you","youd","youll","young","younger","youngest","your","youre","yours","yourself","yourselves","youve","yup","zero","Lymphatic","province","and/or","district","reported","jan","feb","mar","apr","june","july","aug","sept","oct","nov","dec","wa","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","ha","bu","jk","hi","united states","u.s.","�?�",":)",":-)",";-)","; )",":(",":d","&amp","ya","w/","(expand)","don","whereís","youu","guys","","don't","didn't","i'm"];

const keywordsFlat = disasterKeywords.flat();
const startDate = Date.parse("2020-04-06 00:00:00");
const endDate = Date.parse("2020-04-10 11:59:00");
const hourToMS = 60 * 60 * 1000;
const streamStepUnit = 0.5; // half hour
const formatTimeLegend = d3.timeFormat("%B %d, %-I:%M:%S %p");
const formatTimeReadData = d3.timeFormat("%-m/%-d %-I%p");
const topics = ["message", "location"];

const margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

const fisrt5hrsRange = [1586201491000, 1586219491000];

let wsContainer;
const typeHours = [5, 10, 20, 30];
let wsContainerWidth = function (numHourAfter) {
    return d3.scaleOrdinal()
        .domain(typeHours)
        .range([400, 800, 1200, 1500])(numHourAfter);
};
let data;
let numHourAfter = 5;
let streamStep = streamStepUnit * hourToMS;
let streamData;
let keyList;
let xScale = d3.scaleTime()
    .range([0, width]);

let yScale = d3.scaleLinear()
    .range([height, 0]);
let config = {
    topWord: 40,
    minFont: 10,
    maxFont: 30,
    tickFont: 12,
    legendFont: 12,
    curve: d3.curveMonotoneX
};
let main = "#mainContent";
let current;
loadData();
function loadData(){
    d3.csv("data/YInt.csv", function (error, inputData) {
        if (error) throw error;
        else {
            data = inputData;
            console.log(data);
            streamData = getStreamData(data);

            // first 5 hours
            let first5Data = getRangedData(data, fisrt5hrsRange[0], fisrt5hrsRange[1]);
            let wsData = getWSdata(first5Data);
            drawGraph();

            wsContainer = d3.select("body").append("svg")
                .attr("width", 700)
                .attr("height", 500);

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
    let wsData = {};
    rangedData.forEach(d => {
        let date = Date.parse(d.time);
        date = formatTimeReadData(new Date(date));

        let wordArray = d.message.toLowerCase()
            .replace(/\.|\,|\(|\)|\;|\:|\[|\]|\&|\!|\’|\?|\#|\"\d/gi, '')
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
                    text: d,
                    frequency: counts[d],
                    topic: topic,
                    // id: d.replace(/[^a-zA-Z0-9]/g, '_') + "_" + topic + "_" + (i)
                }
            }).sort(function (a, b) {//sort the terms by frequency
                return b.frequency - a.frequency;
            })
            //     .filter(function (d) {
            //     return d.text;
            // })
            ;//filter out empty words
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

    d3.select(main)
        .append("div")
        .attr("class", "customSelect")
        .append("select");

    let g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Create the stack layout for the data
    const stack = d3.stack().keys(keyList)
        .offset(d3.stackOffsetNone);

    const stacks = stack(streamData);
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
    initList();

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

    // let focus = g.append("g").style("display", "none");
    //
    // focus.append("line")
    //     .attr("id", "focusLineX")
    //     .attr("class", "focusLine");
    //
    // focus.append("line")
    //     .attr("id", "focusLineY")
    //     .attr("class", "focusLine");

    g.append("rect")
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
        // .on('mouseover', function() {
        //     indexGroup.style('display', null);
        // })
        // .on('mouseout', function() {
        //     indexGroup.style('display', 'none');})
        .on("mousemove", function () {
            let mouseX = d3.mouse(this);
            mouseX = mouseX[0] + 6;

            current = Date.parse(xScale.invert(mouseX - 8));
            // tooltip and vertical line
            vertical.style("left", (mouseX + margin.left)+ "px");

            tooltip.html(
                '<text class = "bold">' + formatTimeLegend(xScale.invert(mouseX - 8)) + "</text>")
                .style("left", ((d3.event.pageX) + 10) + "px")
                .style("pointer-events", "none");

            // get data for ws
            update(current);

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

function nearestHour(milliseconds) {
    return Date.parse(d3.timeHour.round(new Date(milliseconds)))
}

function getRangedData(data, start, end) {
    return data.filter(d => {
        return ((start < Date.parse(d.time)) &&
            (Date.parse(d.time) < end))
    });
}
function initList() {
    const comboList = d3.select(".customSelect").select("select");
    comboList.selectAll("option")
        .data(typeHours)
        .enter()
        .append("option")
        .property("value", d => d)
        .text(d => d + " hours");

    comboList.on("change", function () {
        numHourAfter = this.value;
        wsContainer
            .attr("width", wsContainerWidth(numHourAfter));
        update(current)
    })
}

function update(current) {
    // get data for ws
    let thisNearestHour = nearestHour(current);
    let rangedData = getRangedData(data, thisNearestHour, thisNearestHour + numHourAfter*hourToMS);
    let wsData = getWSdata(rangedData);

    wsContainer.selectAll("*").remove();
    wsContainer
        .attr("width", wsContainerWidth(numHourAfter));
    wordstream(wsContainer, wsData, config);
}