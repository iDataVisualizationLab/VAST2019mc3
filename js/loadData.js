d3.csv("../data/YInt.csv", function (error, data) {
    if (error){
        throw error;
    }
    else {
        console.log(data);
        const regGetHashtag = /(^|\s)(#[a-z\d-]+)/gi;
        let hashtags = {};
        data.forEach(d => {

        })
    }
});