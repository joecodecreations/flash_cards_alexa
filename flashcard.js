var requestURL = require("request");
var Promise = require('bluebird');

class Flashcard {

    constructor() {}

    getCards(phrase) {
        return new Promise((resolve, reject) => {
            requestURL('http://flashcardquiz.com/api/alexa/' + phrase, (err, response, body) => {
                body = JSON.parse(response.body);
                //  var response = body['title'];
                resolve(body);
            });
        });
    }


}
module.exports = Flashcard;
