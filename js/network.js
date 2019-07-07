let mentionedAcc = [];
function processNetworkData(data) {
    // let accounts = data.map(d => d.account);
    // let specialAcc = accounts.filter(d => d.search(/\W/g) >= 0);
    getAccount(rangedData);

}
function getNetworkData(rangedData){
    // let nodesData, linksData;
    // return [nodesData, linksData]

}

function getAccount(data){
    data.forEach(d => {
        let accounts = [];
        let message = d.message;
        if (message.indexOf("@") >= 0) {
            // get all occurences of @, push in indices
            let regex = /@/gi, result, indices = [];
            while (result = regex.exec(message)) {
                indices.push(result.index);
            }

            // get account names
            indices.forEach(index => {
                let fromNowOn = message.slice(index + 1);
                let nonwordIndex = fromNowOn.search(/\W/);
                if (nonwordIndex >= 0) {
                    // found
                    accounts.push(message.slice(index, index + nonwordIndex + 1))
                }
                else {
                    // reach the end of message
                    accounts.push(message.slice(index, message.length))
                }
            });
            console.log(message, accounts)
        }
    })
}

function getSpeicalAccMention(data){
    data.forEach((d,i) => {
        let message = d.message;
        specialAcc.forEach(e => {
            if (message.indexOf(e) >= 0){
                console.log(i, e, message);
            }
        })
    })
}

