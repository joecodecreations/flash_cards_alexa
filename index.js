var alexa = require("alexa-app");
var app = new alexa.app("flash-card-quiz");
var requestURL = require("request");
var Promise = require('bluebird');
var Flashcard = require("./flashcard");
var newFlashcard = new Flashcard();
var instructions = '';
var readyForPhrase = false;
var sessionable = false;
var globalData;
var applicationTitle = "Flash Card Quiz";
var cancel = false;
//var about = '<break time="500ms" /> Flash Card Quiz was developed by Joseph Sanchez. <break time="300ms" />You can visit us online at flash card quiz dot com. <break time="400ms" />With flash card quiz, you can create your own flash cards to help you study and use Amazon Alexa to help you practice while you do other things <break time="300ms" /> like cook or clean. This is a free application and we thank you for using it. <break time="500ms" />Please rate this app if you appreciate the work put into it.';
//var mainMenu = '<break time="500ms" />You can access help at any time by saying help. To learn more about this application you can say <break time="300ms" /> ABOUT. <break time="400ms" />To start your flash card session tell me your unique <break time="200ms" />alexa phrase. Now, tell me what your custom phrase is? Or select help or about.';
app.launch((request, response) => {
    var intro = 'Welcome to the Flash Card Quiz skill. This skill allows you to test your knowledge with flash cards. You can build your own set of cards at flash card quiz dot com.';
    var message = 'Each flash card deck can be accessed through Alexa through a custom phrase. <break time="500ms"/> If you need help, simply say <break time="200ms"/> help. Otherwise, say your custom phrase and your cards will be loaded.';

    instructions = '<break time="900ms"/> What is your custom phrase?';

    response.say(intro);
    response.say(message);

    response.say(instructions).reprompt(instructions).shouldEndSession(false);
    response.card('Welcome to Flash Card Quiz', 'Start using Flash Card Quiz by saying your custom alexa phrase to load your cards. If you do not already have a set of cards and would like to create some, please visit <a href="http://flashcardquiz.com">FlashCardQuiz.com</a> ');
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
        response.clear();
        if (userinput.includes("about")) {
            response.say(about);
            response.say(mainMenu);
        } else {
            var verify = 'I heard, ' + userinput + '<break time="300ms"/> Is this correct?';
            response.say(verify).reprompt(verify).shouldEndSession(false);
            confirmationIntent(userinput);
        }
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
            response.clear();
            if (confirmation.includes("yes") || confirmation.includes("yeah") || confirmation.includes("yup")) {

                return newFlashcard.getCards(userinput, response).then((data) => {
                    if (data) {
                        message = data.message;
                        if (message == "carderror" || message == "deckerror") {
                            response.say("We couldn't find any cards associated with that alexa phrase <break time='500ms'/> please try again");
                            var instructions = "<break time='900ms'/> What is your custom phrase?";
                            response.say(instructions).reprompt(instructions).shouldEndSession(false);
                        } else {
                            deckTitle = data.title;
                            response.say("Starting Flash Cards For <break time='900ms'/>" + deckTitle + "<break time='800ms'/>");
                            var i = 0;
                            var dataSize = data.cards.length;
                            while (i < dataSize) {
                                var questionCount = i + 1;
                                var question = data.cards[i].question;
                                var answer = data.cards[i].answer;
                                var category = data.cards[i].category;
                                response.say("Question " + questionCount + "<break time='600ms'/>");
                                if (category) {
                                    response.say("The category is " + category + "<break time='800ms'/> ");
                                }
                                response.say(question + "<break time='5000ms'/> ");
                                response.say("Answer, " + answer + "<break time='2000ms'/> ");
                                i++;
                            }
                            response.say("<break time='2000ms' /> that was the last question. Would you like to go over these cards again? ").shouldEndSession(false);
                        }
                    } else {
                        response.say("the servers seem to be offline. Please check back later");
                    }
                });
            } else {
                response.say('Sorry, lets try this again. What is your alexa phrase?').shouldEndSession(false);
            }
        });
    }
}
app.error = function (exception, request, response) {
    if (!cancel) {
        response.say("I am sorry, I didn't quite understand that. Please try again ").shouldEndSession(false);
    }
};
/* Required Intents */
app.intent("AMAZON.CancelIntent", {}, function (request, response) {
    cancel = true;
    response.say("We are sorry to see you go. I hope you learned a lot. Please take a moment to rate this free app.").shouldEndSession(true);
});

app.intent("AMAZON.StopIntent", {}, function (request, response) {
    response.say("Closing Application").shouldEndSession(true);
});

app.intent("AMAZON.HelpIntent", {}, function (request, response) {
    response.say("To interact with this skill, you should have an alexa phrase to load in your flash cards. ");
    response.say("<break time='900ms'/>This phrase was either provided from someone else like a teacher <break time='300ms'/> or you have created your own deck at flash card quiz dot com");
    response.say("<break time='900ms'/> If you want to create your own flash cards, you can do so by visiting flash card quiz dot com");
    response.say("<break time='900ms'/>When using this application, you will be prompted with the question category, the question and then after a set duration of time you will hear the answer. For additional questions please contact us at <break time='400ms'/> help at flash card quiz dot com.").shouldEndSession(false);
    response.say(instructions);
});

app.sessionEnded(function (request, response) {
    logout(request.userId);
});

exports.handler = app.lambda();
