const wotd = require('words-of-the-day');
const schedule = require('node-schedule');
const Twit = require('twit');

let T = new Twit({
    consumer_key:         '11qOqZhqLELjsw9kHD49wSB2h',
    consumer_secret:      't4zDozD3qyduEZ6npJSa17lC6ggeZWSPw19srgRxw0QiZeTOzt',
    access_token:         '1069965908230242306-BxoE4riF5Plv7gPDryIGAl64kGFH5T',
    access_token_secret:  'VXLBjGxD1V0i7bHjNOXFbRNY2e0bbxA5SbvivSVOqI28u',
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





