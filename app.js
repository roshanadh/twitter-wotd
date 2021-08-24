const Twit = require("twit");
const express = require("express");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.WORDNIK_API_KEY;

const url = `https://api.wordnik.com/v4/words.json/wordOfTheDay?api_key=${API_KEY}`;

const maxLength = 280;

let T = new Twit({
	consumer_key: process.env.BOT_CONSUMER_KEY,
	consumer_secret: process.env.BOT_CONSUMER_SECRET,
	access_token: process.env.BOT_ACCESS_TOKEN,
	access_token_secret: process.env.BOT_ACCESS_TOKEN_SECRET,
	timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
	strictSSL: true, // optional - requires SSL certificates to be valid.
});

const getWordOfTheDay = async () => {
	https
		.get(url, (res) => {
			let data = "";

			res.on("data", (chunk) => {
				data += chunk;
			});

			res.on("end", () => {
				data = JSON.parse(data);
				return data;
			});
		})
		.on("error", (error) => {
			throw new Error(
				"Error occurred while fetching word of the day:",
				error
			);
		});
};

const getFitTweet = () => {
	const response = await getWordOfTheDay();
	const preText = `Word for today is '${word},'`;
	const word = response.word;
	const partOfSpeech = response.definitions[0].partOfSpeech;
	const meaning = response.definitions[0].text;
	const example = response.examples[0].text;
	const hashTags = "#DailyWords #WordOfTheDay";
	const hashTag = "#WordOfTheDay";

	let tweet = "";
	if (
		`${preText} ${partOfSpeech}: ${meaning}. "${example}" ${hashTags}`
			.length <= maxLength
	) {
		tweet = `${preText} ${partOfSpeech}: ${meaning}. "${example}" ${hashTags}`;
	} else if (
		`${preText} ${partOfSpeech}: ${meaning}. "${example}" ${hashTag}`
			.length <= maxLength
	) {
		tweet = `${preText} ${partOfSpeech}: ${meaning}. "${example}" ${hashTag}`;
	} else if (
		`${preText} ${partOfSpeech}: ${meaning}. ${hashTags}`.length <=
		maxLength
	) {
		tweet = `${preText} ${partOfSpeech}: ${meaning}. ${hashTags}`;
	} else if (
		`${preText} ${partOfSpeech}: ${meaning}. ${hashTag}`.length <= maxLength
	) {
		tweet = `${preText} ${partOfSpeech}: ${meaning}. ${hashTag}`;
	} else if (
		`${word}, ${partOfSpeech}: ${meaning}. "${example}" ${hashTags}`
			.length <= maxLength
	) {
		tweet = `${word}, ${partOfSpeech}: ${meaning}. ${hashTags}`;
	} else if (
		`${word}, ${partOfSpeech}: ${meaning}. "${example}" ${hashTag}`
			.length <= maxLength
	) {
		tweet = `${word}, ${partOfSpeech}: ${meaning}. "${example}" ${hashTag}`;
	} else if (
		`${word}, ${partOfSpeech}: ${meaning}. ${hashTag}`.length <= maxLength
	) {
		tweet = `${word}, ${partOfSpeech}: ${meaning}. ${hashTag}`;
	} else {
		tweet = "Have a great day folks!";
	}
	return tweet;
};

const doesTweetExist = (tweet) => {
	// Search if the tweet has already been tweeted by the account
	T.get(
		"search/tweets",
		{ q: '"' + tweet + '" from:daytheofword', count: 100 },
		function (err, data, response) {
			if (
				typeof data.statuses == "undefined" ||
				data.statuses.length == 0
			) {
				// Tweet does not exist as of yet
				return false;
			} else {
				// Tweet already exists
				return true;
			}
		}
	);
};

const tweetIt = async () => {
	const tweet = getFitTweet();

	const hasBeenTweeted = doesTweetExist(tweet);

	if (tweet !== "Have a great day folks!" && hasBeenTweeted) {
		console.log("Tweet ALREADY EXISTS!");
		tweet = "Have a great day folks!";
		console.log(`Going to tweet: ${tweet}`);
	} else {
		console.log("Tweet is original!");
		console.log(`Going to tweet: ${tweet}`);
	}

	T.post(
		"statuses/update",
		{ status: tweet },
		function (err, data, response) {
			if (err) console.log(err, tweet);
		}
	);
};

app.all("/daytheofword", (req, res) => {
	res.status(200).send("This is the response!");
	tweetIt();
});

app.listen(PORT, () => {
	console.log(`Server is now listening to port ${PORT}`);
});
