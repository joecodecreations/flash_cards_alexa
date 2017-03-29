var alexa = require("alexa-app");
var app = new alexa.app("flash-card-quiz");
var requestURL = require("request");
var Promise = require('bluebird');

var Flashcard = require("./flashcard");
var newFlashcard = new Flashcard;
var instructions = '';
var readyForPhrase = false;
var sessionable = false;
var globalData;

app.launch((request, response) => {
    var intro = 'Welcome to the Flash Card Quiz skill. This skill allows you to test your knowledge with flash cards. You can build your own set of cards at flash card quiz dot com.';
    var message = 'Each flash card deck can be accessed through Alexa through a custom phrase. <break time="500ms"/>';
    // if (request.hasSession()) {
    //     sessionable = true;
    //     // instructions = "it appears your last phrase used was " + session.get(lastusedphrase) + " , is this correct?";
    // }
    // var session = request.getSession();
    // if (session.get(lastusedphrase) != null || session.get(lastusedphrase) != undefined) {
    //     instructions = "it appears your last phrase used was " + session.get(lastusedphrase) + " , is this correct?";
    // } else {
    instructions = '<break time="400ms"/> What is your custom phrase?';
    // }
    //response.say(intro);
    //response.say(message);

    response.say(instructions).reprompt(instructions).shouldEndSession(false);
    response.card("Welcome to Flash Card Quiz", "test here");
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
        var verify = 'I heard, ' + userinput + '<break time="300ms"/> Is this correct?';
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


                // if (sessionable) {
                //     session.set(lastusedphrase, userinput);
                // }
                return newFlashcard.getCards(userinput).then((data) => {

                    deckTitle = data.title;
                    response.say("Starting Flash Cards For " + deckTitle);
                    //  var response = "Starting Flash Cards for " + data.title;
                    var i = 0;
                    var dataSize = data.cards.length;
                    while (i < dataSize) {
                        var question = data.cards[i].question;
                        var answer = data.cards[i].answer;
                        response.say("Question, " + question + "<break time='3000ms'/> ");
                        response.say("answer, " + answer + "<break time='2000ms'/> ");
                        i++;
                    }
                    //  response.say('Answer, ' + data.cards[i].answer + ' <break time="300ms"/>');
                });


            } else {
                response.say('not confirmed');
            }

        });
    }
}

app.sessionEnded(function (request, response) {
    logout(request.userId);
});


// connect the alexa-app to AWS Lambda
exports.handler = app.lambda();
