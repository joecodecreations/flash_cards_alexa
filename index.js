var alexa = require("alexa-app");
var app = new alexa.app("flash-card-quiz");
var requestURL = require("request");
var Promise = require('bluebird');

var Flashcard = require("./flashcard");
var newFlashcard = new Flashcard;


var readyForPhrase = false;

app.launch((request, response) => {
    var intro = 'Welcome to Flash Card Quiz. This skill allows you to test your knowledge with flash cards. You can build your own set of cards at flash card quiz dot com.';
    var message = 'Simply state the phrase that is associated with your deck to start your quiz. <break time="500ms"/> Always start your phrase with <break time="200ms"/> My alexa phrase is. For instance if your phrase is <break time="200ms"/> my fun dog likes to play <break time="400ms"/> simply say.';
    var instructions = '<break time="400ms"/> My alexa phrase is my fun dog likes to play. Now, what is your phrase?';
    //response.say(intro);
    //response.say(message);
    response.say(instructions).reprompt(instructions).shouldEndSession(false);
    readyForPhrase = true;
});

app.intent("PhraseIntent", {
        "slots": {
            "USERINPUT": "alexaphrase"
        },
        "utterances": ["{USERINPUT}"]
    },
    function (request, response) {
        var userinput = request.slot("USERINPUT");
        var verify = 'You has selected the following phrase, ' + userinput + '<break time="300ms"/> Is this correct?';
        response.say(verify).reprompt(verify).shouldEndSession(false);
        confirmationIntent(userinput);


    }
);

function confirmationIntent(userinput) {
    if (readyForPhrase) {
        app.intent("ConfirmationIntent", {
            "slots": {
                "CONFIRMATIONINPUT": "confirmation"
            },
            "utterances": ["{CONFIRMATIONINPUT}"]
        }, function (request, response) {
            var confirmation = request.slot("CONFIRMATIONINPUT");

            if (confirmation.includes("yes") || confirmation.includes("yeah") || confirmation.includes("yup")) {

                //  response.say("confirmed, going to process " + userinput).shouldEndSession(false);;

                return newFlashcard.getCards(userinput).then((data) => {
                    deckTitle = data.title;
                    response.say("Starting Flash Cards For " + deckTitle);
                    // response.say("Starting Flash Cards For " + deckTitle);

                    // var i = 0;
                    //
                    // while (i < (data.cards.length - 1)) {
                    //
                    //     //  console.log(response.cards[i]);
                    //     response.say('Question ' + (i + 1) + ', ' + data.cards[i].question + '<break time="800ms"/>');
                    //     response.say("" + data.cards[i].answer + '<break time="300ms"/>');
                    //     i++;
                    // }


                });


            } else {
                response.say('not confirmed');
            }

        });
    }
}

// connect the alexa-app to AWS Lambda
exports.handler = app.lambda();
