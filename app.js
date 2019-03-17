const wotd = require('words-of-the-day');
const Twit = require('twit');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

let T = new Twit({
    consumer_key: process.env.BOT_CONSUMER_KEY,
    consumer_secret: process.env.BOT_CONSUMER_SECRET,
    access_token: process.env.BOT_ACCESS_TOKEN,
    access_token_secret: process.env.BOT_ACCESS_TOKEN_SECRET,
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL:            true,     // optional - requires SSL certificates to be valid.
});

function tweetIt(){
    let tweetMsg = '';
    var lenTweetMsg;
    wotd.wordThink().then(data => {
        let word = data.word;
        let meaning = data.meaning;
        tweetMsg = `The word for today is '${word}', ${meaning}`;
        lenTweetMsg = tweetMsg.length;
        if(lenTweetMsg > 280)
            tweetMsg = 'Have a good day everyone!';
        console.log(tweetMsg);

        // Search if the tweet has already been tweeted by the account
        T.get('search/tweets', { q: '"' + tweetMsg +'" from:botterMan16', count: 100 }, function(err, data, response) {
            if(typeof data.statuses == 'undefined' || data.statuses.length == 0){
                // Tweet does not exist as of yet
                console.log("Tweet IS NOT a duplicate, going to be tweeted!");
                T.post('statuses/update', { status: tweetMsg }, function(err, data, response) {
                    if(err) console.log(err, tweetMsg);
                });
            }
            else if(data.statuses.length > 0 && (tweetMsg == 'Have a good day everyone!')){
                console.log("Tweet IS a duplicate: " + tweetMsg + ", going to be tweeted!");
                T.post('statuses/update', { status: tweetMsg }, function(err, data, response) {
                    if(err) console.log(err, tweetMsg);
                });
            }
            else{
                // Tweet already exists
                console.log("Tweet IS a duplicate, not going to be tweeted!");
            }
        });
    });
}

app.all('/botterman16', (req, res) => {
    res.status(200).send("This is the response!");
    tweetIt();
});

app.listen(PORT, () => {
    console.log(`Server is now listening to port ${PORT}`);
})






