const wotd = require('words-of-the-day');
const schedule = require('node-schedule');
const Twit = require('twit');

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
    wotd.wordThink().then(data => {
        let word = data.word;
        tweetMsg = `The word for today is '${word}', ${meaning}`;
        console.log(tweetMsg);

        T.post('statuses/update', { status: tweetMsg }, function(err, data, response) {
            if(err)
                console.log(err);
        });

    });
}

//Tweet every midnight
schedule.scheduleJob('0 0 * * *', tweetIt());





