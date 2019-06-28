let wsRawData = [];
let wsTooltip;

const taxonomy = [
    {id: "all", subTopic: false},
    {id: "event", subTopic: false},

    {id: "earthquake", subTopic: true, color: "#4daf4a", parent: "event",
        content:  [
            "earthquake", "seismic", "quake", "quaking", "shake", "shaking", "wobble", "wobbling", "quiver", "epicenter" ]},
    {id: "groundDamage", subTopic: true, color: "#a65628", parent: "event",
        content: [
            "landslides", "liquefaction", "rupture", "liquifactjheion"]},
    {id: "flooding", subTopic: true, color: "#6a3d9a", parent: "event",
        content: [
            "tsunami", "flood"]},

    {id: "aftershock", subTopic: true, color: "#dfe300", parent: "event",
        content: ["aftershock"]},

    {id: "resource", subTopic: false},
    {id: "water", subTopic: true, color: "#1f78b4", parent: "resource",
        content: [
            "discharged", "discharge", "drain", "drainage", "flood", "hygiene", "irrigation", "pipes", "pump", "river", "sanitary", "sewage", "sewer", "stream", "underground", "wash", "waste", "water"]},

    {id: "power", subTopic: true, color: "#ff7f00", parent: "resource",
        content: [
            "battery", "black out", "blackout", "candle", "dark", "electric", "energy", "flashlight", "fuel", "gas", "generator", "heat", "nuclear", "power", "radiant", "radiation", "radio rays", "valve"]},

    {id: "road", subTopic: true, color: "#f781bf", parent: "resource",
        content: [
            "airport", "avenue", "bridge", "bus", "congestion", "drive", "flight", "highway", "jam", "lane", "logistic", "metro", "mta", "road", "route", "street", "subway", "traffic", "train", "transit", "transportation"]},

    {id: "medical", subTopic: true, color: "#e41a1c", parent: "resource",
        content:  [
            "ambulance", "blood", "bruise", "dead", "death", "dehydrate", "emergency", "escape", "evacuate", "evacuating", "evacuation", "explode", "exploding", "explosion", "fatal", "fatalities", "first aid", "food", "fracture", "help", "hurt", "illness", "infection", "injure", "kill", "lump", "medical", "numb", "pain", "protection", "rash", "red cross", "rescue", "rescuing", "respiratory", "suffering", "swollen", "urgent", "victim", "volunteer", "volunteering", "wound"]},

    {id: "building", subTopic: true, color: "#a6cee3", parent: "resource",
        content: [
            "apartment", "architecture", "building", "cabin", "church", "clinic", "collapse", "commercial", "construction", "construction", "coop", "hall", "hall", "house", "housing", "lease", "maintenance", "mall", "mansion", "market", "motel", "museum", "rent", "rental", "residential", "restaurant", "shelter", "space", "stable", "stair", "store", "synagogue", "villa"]},

    {id: "other", subTopic: false},
    {id: "rumble", subTopic: true, color: "#f0027f",parent: "other", content:["rumble"]},
    {id: "otherPosts", subTopic: true, color: "#919191", parent: "other"},

];
const stopwords = [
    "0","1","2","3","4","5","6","7","8","9", "10", "brazo","we're","it's","can't","we’re","thk","it’","chk","you're","you'll","us","thx","the","a","an","republicans","republican","democrats","democratic","and","democrat","americans","american","america","hey","ok","wanna","lmao","lot","ur","im","thank","you?","&amp;","dm","just","dont","lol","lil","gonna","rt","...","..","--","about","above","according","accordingly","across","actually","adj","adv","after","afterwards","again","against","ago","ah","aint","al","albeit","all","almost","alone","along","already","also","alt","although","always","am","among","amongst","another","any","anybody","anyhow","anyone","anything","anyway","anyways","anywhere","apparently","appear","apply","are","area","areas","arent","around","as","aside","ask","asked","asking","asks","at","available","ave","away","aye","ba","back","backed","backing","backs","basic","basis","be","became","because","become","becomes","becoming","been","before","beforehand","began","begin","behind","being","beings","below","beside","besides","best","better","between","beyond","bi","big","both","brief","but","by","call","called","came","can","cannot","cant","certain","certainly","cf","clear","clearly","cm","co","come","comes","concerning","consequently","considering","contain","containing","contains","contrariwise","corresponding","could","couldnt","course","currently","date","dc","de","definitely","describe","described","describes","despite","determine","determined","di","did","didnt","differ","different","differently","do","does","doesnt","doing","done","double","down","downed","downing","downs","downwards","dr","dual","during","each","early","ed","eg","eight","either","eleven","else","elsewhere","empty","end","ended","ending","ends","enough","entirely","especially","est","et","etc","even","evenly","ever","every","everybody","everyone","everything","everywhere","exactly","example","except","excepted","excepting","exception","exclude","excluding","exclusive","face","faces","fact","facts","far","felt","few","fifteen","fifth","find","finds","first","five","for","forth","forty","forward","found","four","fr","free","from","front","ft","full","fully","further","furthered","furthering","furthermore","furthers","furthest","gave","general","generally","get","gets","getting","give","given","gives","go","goes","going","gone","good","goods","got","gotten","great","greater","greatest","group","grouped","grouping","groups","had","hadnt","half","halves","happens","hardly","has","hasnt","hast","hath","have","having","he","hear","heard","hed","hello","help","hence","henceforth","her","here","hereabouts","hereafter","hereby","herein","hereto","hereupon","hers","herself","hes","high","higher","highest","him","himself","hindmost","his","hither","hitherto","hopefully","how","howbeit","however","howsoever","hr","hundred","hyper","id","ie","if","ii","iii","immediate","important","in","inasmuch","inc","including","indeed","indicate","indicated","indicates","insofar","insomuch","instead","int","interest","interested","interesting","interests","into","intra","intro","inward","inwards","is","isnt","it","itd","item","itll","its","itself","iv","ive","ix","keep","keeps","kept","kg","km","knew","know","known","knows","large","largely","last","lat","lately","later","latest","latter","latterly","least","left","less","lest","let","lets","like","likely","little","ll","lon","long","longer","longest","look","looks","ltd","lt","made","mainly","make","making","man","many","may","maybe","md","me","mean","means","meant","meantime","meanwhile","merely","micro","might","mine","mm","more","moreover","morning","most","mostly","move","mph","mr","mrs","ms","mt","much","multi","must","mustnt","my","myself","name","namely","near","nearly","necessary","need","needed","needing","neednt","needs","neither","never","nevertheless","new","newer","newest","news","next","nine","no","nobody","non","none","nonetheless","noone","nope","nor","normally","not","nothing","notwithstanding","novel","now","nowadays","nowhere","nt","number","obs","obviously","of","off","often","oh","okay","old","older","oldest","on","once","one","ones","only","onto","op","open","opened","opening","opens","or","other","others","otherwise","ought","our","ours","ourselves","out","outside","over","overall","own","oz","page","part","parted","particular","particularly","parting","parts","per","perhaps","phr","pl","please","plus","pm","possible","pre","presumably","pro","probably","provided","pt","put","puts","quite","rather","re","really","reasonably","regarding","regardless","regards","related","relatively","required","respectively","results","right","said","saith","same","saw","say","saying","says","sec","second","secondly","seconds","see","seeing","seem","seemed","seeming","seems","seen","sees","seldom","self","selves","semi","seven","several","shall","shalt","she","shes","should","shouldnt","show","showed","showing","shown","shows","side","sides","since","sir","sixty","so","some","somebody","somehow","someone","something","sometime","sometimes","somewhat","somewhere","st","still","such","supposing","sure","take","tell","tends","th","than","thanks","thanx","that","thatd","thatll","thats","thee","their","theirs","them","themselves","then","thence","thenceforth","there","thereabout","thereabouts","thereafter","thereby","thered","therefore","therein","thereof","thereon","theres","thereto","thereupon","therll","these","they","theyve","thine","thing","things","think","thinks","third","this","thorough","thoroughly","those","thou","though","three","thrice","through","throughout","thru","thus","thy","thyself","till","time","tm","to","today","together","told","too","took","toward","towards","trans","tried","tries","truly","trying","turn","turned","turning","turns","twelve","twenty","twice","two","under","unless","unlike","unlikely","until","unto","up","upon","upward","upwards","use","used","useful","uses","using","usually","various","ve","very","vi","vii","viii","via","viz","vs","was","wasnt","way","ways","we","well","wells","went","were","werent","weve","what","whatever","whatsoever","when","whence","whenever","whensoever","where","whereabouts","whereafter","whereas","whereat","whereby","wherefore","wherefrom","wherein","whereinto","whereof","whereon","wheresoever","whereto","whereunto","whereupon","wherever","wherewith","whether","whew","which","whichever","whichsoever","while","whilst","whither","who","whoa","whoever","whole","whom","whomever","whomsoever","whose","whosoever","why","will","willing","wilt","wish","with","within","without","wonder","wont","work","worked","working","works","worse","worst","would","wouldnt","wt","xi","xii","xiii","xiv","xv","xvi","xvii","xviii","xix","xx","yd","ye","year","years","yes","yet","yippee","you","youd","youll","young","younger","youngest","your","youre","yours","yourself","yourselves","youve","yup","zero","Lymphatic","province","and/or","district","reported","jan","feb","mar","apr","june","july","aug","sept","oct","nov","dec","wa","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","ha","bu","jk","hi","united states","u.s.","�?�",":)",":-)",";-)","; )",":(", "-", ":d","&amp","ya","w/","(expand)","don","whereís","youu","guys","","don't","didn't","i'm"];

// const eventKeyword = [
//     // ["rumble"],
//     ["aftershock"],
//     ["tsunami", "flood"],
//     ["landslides", "liquefaction", "rupture", "liquifactjheion"],
//     ["earthquake", "seismic", "quake", "quaking", "shake", "shaking", "wobble", "wobbling", "quiver", "epicenter" ],
// // ];
// const eventKeyword = [
//     {id: "aftershock", content: ["aftershock"]},
//     {id: "flooding", content: ["tsunami", "flood"]},
//     {id: "groundDamage", content: ["landslides", "liquefaction", "rupture", "liquifactjheion"]},
//     {id: "earthquake", content:  ["earthquake", "seismic", "quake", "quaking", "shake", "shaking", "wobble", "wobbling", "quiver", "epicenter" ]}
// ];
// const eventList = [
//     // "rumble",
//     "Aftershock",
//     "Flooding: tsunami, flood",
//     "Ground damage: landslides, liquefaction, rupture, tremors",
//     "Earthquake: epicenter, seismic, quake, shake, wobble, quiver",
//     ];
// // -------------------------------------
// const resourceKeyword = [
//     ["discharged", "discharge", "drain", "drainage", "flood", "hygiene", "irrigation", "pipes", "pump", "river", "sanitary", "sewage", "sewer", "stream", "underground", "wash", "waste", "water"],
//
//     ["battery", "black out", "blackout", "candle", "dark", "electric", "energy", "flashlight", "fuel", "gas", "generator", "heat", "nuclear", "power", "radiant", "radiation", "radio rays", "valve"],
//
//     ["airport", "avenue", "bridge", "bus", "congestion", "drive", "flight", "highway", "jam", "lane", "logistic", "metro", "mta", "road", "route", "street", "subway", "traffic", "train", "transit", "transportation"],
//
//     ["ambulance", "blood", "bruise", "dead", "death", "dehydrate", "emergency", "escape", "evacuate", "evacuating", "evacuation", "explode", "exploding", "explosion", "fatal", "fatalities", "first aid", "food", "fracture", "help", "hurt", "illness", "infection", "injure", "kill", "lump", "medical", "numb", "pain", "protection", "rash", "red cross", "rescue", "rescuing", "respiratory", "suffering", "swollen", "urgent", "victim", "volunteer", "volunteering", "wound"],
//
//     ["apartment", "architecture", "building", "cabin", "church", "clinic", "collapse", "commercial", "construction", "construction", "coop", "hall", "hall", "house", "housing", "lease", "maintenance", "mall", "mansion", "market", "motel", "museum", "rent", "rental", "residential", "restaurant", "shelter", "space", "stable", "stair", "store", "synagogue", "villa"]
// ];
//
// const resourceList = ["sewer_water", "power_energy", "roads_bridges", "medical", "buildings"];
//
// // -------------------------------------
// const colorScale = {
//     event: {
//         earthquake: "#4daf4a",
//         groundDamage: "#a65628",
//         flooding: "#6a3d9a",
//         aftershock: "#ffff99",
//     },
//     resource: {
//         water: "#1f78b4",
//         power: "#ff7f00",
//         road: "#f781bf",
//         medical: "#e41a1c",
//         building: "#a6cee3",
//     },
//     other: {
//         rumble: "#f0027f",
//         others: "#919191",
//     }
// };

