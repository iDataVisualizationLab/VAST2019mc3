let hashtags = {}, hashtagCount, hashtagArray = [];
let prefix = {}, postfix = {};
const prefixTags = ["ftw", "great", "hate", "makesit", "wins"];
const postfixTags = ["can", "waste", "wonder"];

for (let i = 0; i < prefixTags.length; i++){
    prefix[prefixTags[i]] = {
        tags: [],
        count: 0,
        occurrences: 0,
    }
}

for (let i = 0; i < postfixTags.length; i++){
    postfix[postfixTags[i]] = {
        tags: [],
        count: 0,
        occurrences: 0,
    }

    if (error){
        throw error;
    }
    else {
        console.log(data);
        const regGetHashtag = /(#[a-z\d-]+)/gi;
        data.forEach(d => {
            let matchResult = d.message.toLowerCase().match(regGetHashtag);
            if (!!matchResult){
                matchResult.forEach(tag => {
                    if (!hashtags[tag]){
                        hashtags[tag] = 1;
                    }
                    else {
                        hashtags[tag]++;
                    }
                })
            }
        });

        hashtagCount = d3.keys(hashtags).length;

        d3.keys(hashtags).forEach(tag => {
            hashtagArray.push({
                tag: tag,
                count: hashtags[tag]
            });

            for (let i = 0; i < prefixTags.length; i++){
                if (tag.indexOf("#" + prefixTags[i]) === 0){
                    prefix[prefixTags[i]].tags.push({
                        [tag]: hashtags[tag]
                    });
                    prefix[prefixTags[i]].count += 1;
                    prefix[prefixTags[i]].occurrences += hashtags[tag];
                    break;
                }
            }

            for (let i = 0; i < postfixTags.length; i++){
                if (tag.endsWith(postfixTags[i])){
                    postfix[postfixTags[i]].count += 1;
                    postfix[postfixTags[i]].occurrences += hashtags[tag];
                    break;
                }
            }
        });

        hashtagArray.sort((a,b) => {
            return b.count - a.count;
        });
        d3.keys(prefix).forEach(pre => {
            prefix[pre].percent = (prefix[pre].count/hashtagCount*100).toFixed(1) + "%";
            prefix[pre].tags.sort((a,b) => {
                return b[d3.keys(b)[0]] - a[d3.keys(a)[0]];
            })
        });
        d3.keys(postfix).forEach(post => {
            postfix[post].percent = (postfix[post].count/hashtagCount*100).toFixed(1) + "%";
            postfix[post].tags.sort((a,b) => {
                return b[d3.keys(b)[0]] - a[d3.keys(a)[0]];
            })
        })
    }
});