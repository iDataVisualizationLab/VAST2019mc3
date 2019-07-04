let wsRawData = [];
let wsTooltipDiv;
let wsTooltipContainer;
let xButton;
let mainGroup;
let wordstreamG;
const initOption = "event";
const allID = "all";
const otherPostID = "otherPosts";
const otherID = "other";
const rainbow = ["#17becf", "#1f77b4", "#5bb641", "#2ca02c", "#ffe709", "#ff7f0e", "#d62728", "#9f78ef", "#676767"];

const taxonomy = [
    {id: allID, subTopic: false},
    {id: "event", subTopic: false},

    {id: "earthquake", subTopic: true, color: "#d62728", parent: "event",
        content:  [
            "earthquake", "seismic", "quake", "quaking", "shake", "shaking", "wobble", "wobbling", "quiver", "epicenter" ]},

    {id: "groundDamage", subTopic: true, color: "#2ca02c", parent: "event",
        content: ["mudslide",
            "landslides", "liquefaction", "rupture", "liquifactjheion"]},

    {id: "flooding", subTopic: true, color: "#1f77b4", parent: "event",
        content: [
            "tsunami", "flood"]},

    {id: "aftershock", subTopic: true, color: "#e4d421", parent: "event",
        content: ["aftershock"]},

    {id: "fire", subTopic: true, color: "#ff7f0e", parent: "event",
        content: ["fire", "smoke"]},

    // --------------------------------------

    {id: "resource", subTopic: false},
    {id: "water", subTopic: true, color: "#17becf", parent: "resource",
        content: [
            "sewage", "water", "discharge", "drain", "irrigation", "sewer", "reservoir"]},

    {id: "energy", subTopic: true, color: "#b3c535", parent: "resource",
        content: [
            "blackout", "candle", "electric", "energy", "flashlight", "fuel", "gas", "generator", "nuclear", "power", "radiant", "radiation", "radio rays", "valve"]},

    {id: "medical", subTopic: true, color: "#f02e99", parent: "resource",
        content:  [
            "ambulance", "blood", "bruise", "dead", "death", "dehydrate", "emergency", "escape", "evacuate", "evacuating", "evacuation", "fatal", "first aid", "fracture", "help", "hurt", "illness", "infection", "injure", "kill", "lump", "medic", "red cross", "rescue", "rescuing", "respiratory", "suffering", "swollen", "urgent", "victim", "wound"]},

    {id: "shelter", subTopic: true, color: "#03a37e", parent: "resource",
        content: [
            "shelter", "housing", "building", "collapse", "construction", "house"]},

    {id: "transportation", subTopic: true, color: "#594337", parent: "resource",
        content: [
            "bridge", "congestion", "avalanche", "highway", "lane", "logistic", "metro", "jammed", "route", "street", "traffic", "transportation"]},
    {id: "food", subTopic: true, color: "#9f78ef", parent: "resource",
        content: ["food"]},
    {id: otherID, subTopic: false},
    {id: "rumble", subTopic: true, color: "#375d87",parent: "other", content:["rumble"]},
    {id: otherPostID, subTopic: true, color: "#919191", parent: "other", content:[]},

];
let src;
if (taxonomy.find(d => d.id === initOption).subTopic){
    src = taxonomy.find(d => d.id === initOption).parent
}
else src = initOption;
d3.select("#loadingImage")
    .attr("src", "images/spinner-"+ src + ".gif");

const stopwords = [
    "0","1","2","3","4","5","6","7","8","9", "10", "brazo","we're","it's","can't","we’re","thk","it’","chk","you're","you'll","us","thx","the","a","an","republicans","republican","democrats","democratic","and","democrat","americans","american","america","hey","ok","wanna","lmao","lot","ur","im","thank","you?","&amp;","dm","just","dont","lol","lil","gonna","rt","...","..","--","about","above","according","accordingly","across","actually","adj","adv","after","afterwards","again","against","ago","ah","aint","al","albeit","all","almost","alone","along","already","also","alt","although","always","am","among","amongst","another","any","anybody","anyhow","anyone","anything","anyway","anyways","anywhere","apparently","appear","apply","are","area","areas","arent","around","as","aside","ask","asked","asking","asks","at","available","ave","away","aye","ba","back","backed","backing","backs","basic","basis","be","became","because","become","becomes","becoming","been","before","beforehand","began","begin","behind","being","beings","below","beside","besides","best","better","between","beyond","bi","big","both","brief","but","by","call","called","came","can","cannot","cant","certain","certainly","cf","clear","clearly","cm","co","come","comes","concerning","consequently","considering","contain","containing","contains","contrariwise","corresponding","could","couldnt","course","currently","date","dc","de","definitely","describe","described","describes","despite","determine","determined","di","did","didnt","differ","different","differently","do","does","doesnt","doing","done","double","down","downed","downing","downs","downwards","dr","dual","during","each","early","ed","eg","eight","either","eleven","else","elsewhere","empty","end","ended","ending","ends","enough","entirely","especially","est","et","etc","even","evenly","ever","every","everybody","everyone","everything","everywhere","exactly","example","except","excepted","excepting","exception","exclude","excluding","exclusive","face","faces","fact","facts","far","felt","few","fifteen","fifth","find","finds","first","five","for","forth","forty","forward","found","four","fr","free","from","front","ft","full","fully","further","furthered","furthering","furthermore","furthers","furthest","gave","general","generally","get","gets","getting","give","given","gives","go","goes","going","gone","good","goods","got","gotten","great","greater","greatest","group","grouped","grouping","groups","had","hadnt","half","halves","happens","hardly","has","hasnt","hast","hath","have","having","he","hear","heard","hed","hello","help","hence","henceforth","her","here","hereabouts","hereafter","hereby","herein","hereto","hereupon","hers","herself","hes","high","higher","highest","him","himself","hindmost","his","hither","hitherto","hopefully","how","howbeit","however","howsoever","hr","hundred","hyper","id","ie","if","ii","iii","immediate","important","in","inasmuch","inc","including","indeed","indicate","indicated","indicates","insofar","insomuch","instead","int","interest","interested","interesting","interests","into","intra","intro","inward","inwards","is","isnt","it","itd","item","itll","its","itself","iv","ive","ix","keep","keeps","kept","kg","km","knew","know","known","knows","large","largely","last","lat","lately","later","latest","latter","latterly","least","left","less","lest","let","lets","like","likely","little","ll","lon","long","longer","longest","look","looks","ltd","lt","made","mainly","make","making","man","many","may","maybe","md","me","mean","means","meant","meantime","meanwhile","merely","micro","might","mine","mm","more","moreover","morning","most","mostly","move","mph","mr","mrs","ms","mt","much","multi","must","mustnt","my","myself","name","namely","near","nearly","necessary","need","needed","needing","neednt","needs","neither","never","nevertheless","new","newer","newest","news","next","nine","no","nobody","non","none","nonetheless","noone","nope","nor","normally","not","nothing","notwithstanding","novel","now","nowadays","nowhere","nt","number","obs","obviously","of","off","often","oh","okay","old","older","oldest","on","once","one","ones","only","onto","op","open","opened","opening","opens","or","other","others","otherwise","ought","our","ours","ourselves","out","outside","over","overall","own","oz","page","part","parted","particular","particularly","parting","parts","per","perhaps","phr","pl","please","plus","pm","possible","pre","presumably","pro","probably","provided","pt","put","puts","quite","rather","re","really","reasonably","regarding","regardless","regards","related","relatively","required","respectively","results","right","said","saith","same","saw","say","saying","says","sec","second","secondly","seconds","see","seeing","seem","seemed","seeming","seems","seen","sees","seldom","self","selves","semi","seven","several","shall","shalt","she","shes","should","shouldnt","show","showed","showing","shown","shows","side","sides","since","sir","sixty","so","some","somebody","somehow","someone","something","sometime","sometimes","somewhat","somewhere","st","still","such","supposing","sure","take","tell","tends","th","than","thanks","thanx","that","thatd","thatll","thats","thee","their","theirs","them","themselves","then","thence","thenceforth","there","thereabout","thereabouts","thereafter","thereby","thered","therefore","therein","thereof","thereon","theres","thereto","thereupon","therll","these","they","theyve","thine","thing","things","think","thinks","third","this","thorough","thoroughly","those","thou","though","three","thrice","through","throughout","thru","thus","thy","thyself","till","time","tm","to","today","together","told","too","took","toward","towards","trans","tried","tries","truly","trying","turn","turned","turning","turns","twelve","twenty","twice","two","under","unless","unlike","unlikely","until","unto","up","upon","upward","upwards","use","used","useful","uses","using","usually","various","ve","very","vi","vii","viii","via","viz","vs","was","wasnt","way","ways","we","well","wells","went","were","werent","weve","what","whatever","whatsoever","when","whence","whenever","whensoever","where","whereabouts","whereafter","whereas","whereat","whereby","wherefore","wherefrom","wherein","whereinto","whereof","whereon","wheresoever","whereto","whereunto","whereupon","wherever","wherewith","whether","whew","which","whichever","whichsoever","while","whilst","whither","who","whoa","whoever","whole","whom","whomever","whomsoever","whose","whosoever","why","will","willing","wilt","wish","with","within","without","wonder","wont","work","worked","working","works","worse","worst","would","wouldnt","wt","xi","xii","xiii","xiv","xv","xvi","xvii","xviii","xix","xx","yd","ye","year","years","yes","yet","yippee","you","youd","youll","young","younger","youngest","your","youre","yours","yourself","yourselves","youve","yup","zero","Lymphatic","province","and/or","district","reported","jan","feb","mar","apr","june","july","aug","sept","oct","nov","dec","wa","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","ha","bu","jk","hi","united states","u.s.","�?�",":)",":-)",";-)","; )",":(", "-", ":d","&amp","ya","w/","(expand)","don","whereís","youu","guys","","don't","didn't","i'm", "re", "wasn't"];

// // -------------------------------------
const colorScale = {
    event: {
        earthquake: "#52bbcd",
        groundDamage: "#3675b1",
        flooding: "#4f9e38",
        aftershock: "#bdbd3a",
    },
    resource: {
        water: "#f18527",
        power: "#c7372c",
        road: "#d67cbf",
        medical: "#8d69ba",
        building: "#a6cee3",
    },
    other: {
        rumble: "#f0027f",
        others: "#919191",
    }
};

