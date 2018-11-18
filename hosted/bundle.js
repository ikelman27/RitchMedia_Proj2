"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//class to hold the quiz maker
var MakerComponent = function (_React$Component) {
    _inherits(MakerComponent, _React$Component);

    function MakerComponent(props) {
        _classCallCheck(this, MakerComponent);

        var _this = _possibleConstructorReturn(this, (MakerComponent.__proto__ || Object.getPrototypeOf(MakerComponent)).call(this, props));

        _this.csrf = props.csrf;
        _this.state = {
            numChildren: props.childCount
        };
        _this.data = props.data;
        _this.edit = false;

        if (props.edit === undefined) {
            _this.edit = false;
        } else {
            _this.edit = true;
            _this.title = props.data.name;
        }

        //whenever a child is added set the state to children +1
        _this.onAddChild = function () {

            _this.setState({
                numChildren: _this.state.numChildren + 1
            });
        };

        //delete the last child
        _this.removeChild = function (loc) {

            _this.setState({
                numChildren: _this.state.numChildren - 1
            });
        };
        return _this;
    }

    //function to render the maker component


    _createClass(MakerComponent, [{
        key: "render",
        value: function render() {
            var children = [];
            //add number of children to the form
            //if it isnt an edit use question otherwise use done question
            if (!this.edit) {
                for (var i = 0; i < this.state.numChildren; i++) {
                    children.push(React.createElement(Question, { key: i, number: i, className: "test" }));
                };
                return React.createElement(
                    Maker,
                    { addChild: this.onAddChild, csrf: this.csrf, count: this.state.numChildren, edit: false, deleteQuestion: this.removeChild },
                    children
                );
            } else {
                for (var i = 0; i < this.state.numChildren; i++) {
                    children.push(React.createElement(DoneQuestion, { key: i, number: i, data: this.data.rounds[i] }));
                };
                return React.createElement(
                    Maker,
                    { addChild: this.onAddChild, csrf: this.csrf, count: this.state.numChildren, title: this.title, edit: true, id: this.data._id, deleteQuestion: this.removeChild },
                    children
                );
            }
        }
    }]);

    return MakerComponent;
}(React.Component);

//adds a new game to the server


var addGame = function addGame(e) {
    e.preventDefault();
    console.log($("#makerForm").serialize());
    sendAjax('POST', '/createGame', $("#makerForm").serialize(), function (param) {
        console.log("created game");
        //display data so users dont spam click the button
        ReactDOM.render(React.createElement(
            "div",
            null,
            React.createElement(
                "h2",
                null,
                " Created a new game "
            )
        ), document.querySelector("#domos"));
    });
};

//updates an existing game
var updateGame = function updateGame(e) {
    e.preventDefault();
    //console.log($("#makerForm").serialize());
    sendAjax('POST', '/updateGame', $("#makerForm").serialize(), function (param) {
        console.log("updated game");
        ReactDOM.render(React.createElement(
            "div",
            null,
            React.createElement(
                "h2",
                null,
                " Updated a game "
            )
        ), document.querySelector("#domos"));
    });
};

//clicking the button brings you to the make game form
function showMaker(csrf) {

    ReactDOM.render(React.createElement(MakerComponent, { csrf: csrf, childCount: 1 }), document.querySelector("#domos"));
};

//views all the games that were created
function showViewer(csrf) {
    sendAjax('GET', '/listGames', null, function (gameData) {
        var games = gameData.game;

        ReactDOM.render(React.createElement(ViewList, { csrf: csrf, games: games }), document.querySelector("#domos"));
    });
}

//display a single game
function showQuiz(gameData, csrf) {

    ReactDOM.render(React.createElement(Quiz, { gameData: gameData, csrf: csrf }), document.querySelector("#domos"));
}

//sends a request to the server to get a specific game
function startGame(gameID, csrf) {
    var queryData = {
        csrf: csrf,
        _id: gameID
    };

    sendAjax('GET', '/getQuiz', queryData, function (gameData) {
        //console.log(gameData);
        //if the data is valid display the quiz
        if (gameData.valid) {
            showQuiz(gameData.games, csrf);
        }
        //if the game isn't valid the user has attempted the game to many times
        else {
                ReactDOM.render(React.createElement(
                    "div",
                    { id: "scoreDIV" },
                    React.createElement(
                        "h2",
                        null,
                        " Sorry you have attempted this quiz too many times"
                    )
                ), document.querySelector("#domos"));
            }
    });
}

//request for a specific game then calls maker on that game to view it in the editor mode
function editGame(gameID, csrf) {
    var queryData = {
        csrf: csrf,
        _id: gameID
    };
    sendAjax('GET', '/getQuiz', queryData, function (gameData) {
        //console.log(gameData.games);
        ReactDOM.render(React.createElement(MakerComponent, { csrf: csrf, childCount: gameData.games.rounds.length, edit: true, data: gameData.games }), document.querySelector("#domos"));
    });
}

//uploads user answers to the server then gets thier score and updades that
var submitQuiz = function submitQuiz(e) {
    e.preventDefault();

    sendAjax('GET', '/checkAnswers', $("#quizForm").serialize(), function (result) {
        var score = { score: result.score, maxScore: result.maxScore };
        var request = $("#quizForm [type=hidden]").serialize() + "&" + $.param(score);

        sendAjax('POST', '/updateScore', request, function (scores) {
            ReactDOM.render(React.createElement(
                "div",
                { id: "scoreDIV" },
                React.createElement(
                    "h2",
                    null,
                    " Your Scored a ",
                    result.score,
                    "/",
                    result.maxScore
                )
            ), document.querySelector("#domos"));
        });
    });
};

//the data to be displayed when the user starts a quiz
var Quiz = function Quiz(props) {

    if (props.gameData.rounds.length === 0) {
        return React.createElement(
            "div",
            { className: "gameList" },
            React.createElement(
                "h3",
                { className: "emptyDomo" },
                " The Quiz is empty "
            )
        );
    }

    //loop through each question and display the data
    var i = 0;
    var questionNode = props.gameData.rounds.map(function (round) {
        i++;
        return React.createElement(
            "div",
            { className: "question" },
            React.createElement(
                "h3",
                { className: "questionName" },
                " Question ",
                i,
                " "
            ),
            React.createElement(
                "h3",
                { className: "questionRound" },
                " ",
                round.question,
                " "
            ),
            React.createElement(
                "div",
                { id: "question", name: "quest" },
                React.createElement("input", { type: "radio", className: "answer", id: "q" + i + "a1", name: "q" + i, value: "1" }),
                React.createElement(
                    "label",
                    { htmlFor: "q" + i + "a1" },
                    " ",
                    round.answer1,
                    " "
                ),
                React.createElement("br", null),
                React.createElement("input", { id: "q" + i + "a2", type: "radio", className: "answer", name: "q" + i, value: "2" }),
                React.createElement(
                    "label",
                    { htmlFor: "q" + i + "a2" },
                    " ",
                    round.answer2,
                    " "
                ),
                React.createElement("br", null),
                React.createElement("input", { id: "q" + i + "a3", type: "radio", className: "answer", name: "q" + i, value: "3" }),
                React.createElement(
                    "label",
                    { htmlFor: "q" + i + "a3" },
                    " ",
                    round.answer3,
                    " "
                ),
                React.createElement("br", null),
                React.createElement("input", { id: "q" + i + "a4", type: "radio", className: "answer", name: "q" + i, value: "4" }),
                React.createElement(
                    "label",
                    { htmlFor: "q" + i + "a4" },
                    " ",
                    round.answer4
                )
            )
        );
    });

    //return the full quiz
    return React.createElement(
        "form",
        { id: "quizForm",
            onSubmit: submitQuiz,
            action: "/checkAnswers",
            method: "GET",
            className: "quizForm"
        },
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { type: "hidden", name: "_id", value: props.gameData._id }),
        questionNode,
        React.createElement("input", { className: "makeDomoSubmit", type: "submit", value: "Submit Quiz" })
    );
};

//when given a list of items creats the html to display them similar to quiz
var ViewList = function ViewList(props) {
    if (props.games.length === 0) {
        return React.createElement(
            "div",
            { className: "gameList" },
            React.createElement(
                "h3",
                { className: "emptyDomo" },
                " No Quizes yet "
            )
        );
    }

    var gameNodes = props.games.map(function (game) {
        return React.createElement(
            "div",
            { key: game._id, className: "domo" },
            React.createElement(
                "h3",
                { className: "gameName", onClick: function onClick() {
                        return startGame(game._id, props.csrf);
                    } },
                " Name: ",
                game.name,
                " "
            ),
            React.createElement(
                "h3",
                { className: "gameAge" },
                " Questions: ",
                game.length,
                " "
            ),
            React.createElement(
                "h3",
                { className: "gameCreator" },
                " Creator: ",
                game.creatorUsername,
                " "
            ),
            React.createElement(
                "button",
                { id: "startQuiz", type: "button", onClick: function onClick() {
                        return startGame(game._id, props.csrf);
                    } },
                " Play Game "
            )
        );
    });

    return React.createElement(
        "div",
        { className: "domoList" },
        gameNodes
    );
};

//displays all of the quizes that a user created similar to quiz
var User = function User(props) {
    if (props.games.length === 0) {
        return React.createElement(
            "div",
            { className: "gameList" },
            React.createElement(
                "h3",
                { className: "emptyDomo" },
                " No Quizes yet "
            )
        );
    }

    var gameNodes = props.games.map(function (game) {

        //calculate the average score total attempts and number of users who attempted the quiz
        var maxScore = game.rounds.length;
        var totalScores = 0;
        var totalAttempts = 0;
        var usersAttempted = 0;
        var avereageScore = 0;
        for (var i = 0; i < game.attempts.length; i++) {
            for (var j = 0; j < game.attempts[i].scores.length; j++) {
                totalScores += game.attempts[i].scores[j];
                totalAttempts++;
            }
            usersAttempted++;
        }

        if (totalAttempts > 0) {
            var avereageScore = totalScores / (maxScore * totalAttempts);
        }

        return React.createElement(
            "div",
            { key: game._id, className: "domo" },
            React.createElement(
                "h3",
                { className: "gameName", onClick: function onClick() {
                        return editGame(game._id, props.csrf);
                    } },
                " Name: ",
                game.name,
                " "
            ),
            React.createElement(
                "h3",
                { className: "gameAge" },
                " Questions: ",
                game.rounds.length,
                " "
            ),
            React.createElement(
                "h4",
                { className: "gameAge" },
                " Average Score: ",
                avereageScore,
                " "
            ),
            React.createElement(
                "h4",
                { className: "gameAge" },
                " Users attempted: ",
                usersAttempted,
                " "
            ),
            React.createElement(
                "h4",
                { className: "gameAge" },
                " Total Attempts: ",
                totalAttempts,
                " "
            ),
            React.createElement(
                "button",
                { className: "statsButton", id: "viewStats", type: "button", onClick: function onClick() {
                        return viewStats(game, avereageScore, maxScore);
                    } },
                " View total reports "
            ),
            React.createElement(
                "button",
                { id: "startQuiz", type: "button", onClick: function onClick() {
                        return editGame(game._id, props.csrf);
                    } },
                " Edit Quiz "
            )
        );
    });

    return React.createElement(
        "div",
        { className: "domoList" },
        gameNodes
    );
};

//create the stats for each user who have attempted a quiz
var Attempt = function Attempt(props) {
    if (props.attempts.length === 0) {
        return React.createElement(
            "div",
            { className: "gameList" },
            React.createElement(
                "h3",
                { className: "emptyDomo" },
                " No Users have attempted the quiz yet "
            )
        );
    }

    var gameNodes = props.attempts.map(function (attempt) {

        //calculate the sats for each user
        var userAve = 0;
        var totalScores = "";
        for (var i = 0; i < attempt.scores.length; i++) {
            userAve += attempt.scores[i];
            totalScores += "  " + String(attempt.scores[i] / props.max);
        }
        userAve = userAve / (attempt.scores.length * props.max);
        return React.createElement(
            "div",
            { className: "domo" },
            React.createElement(
                "h3",
                null,
                " User: ",
                attempt.playerName,
                " "
            ),
            React.createElement(
                "h3",
                null,
                " avereageScore: ",
                userAve,
                " "
            ),
            React.createElement(
                "h3",
                null,
                " Scores: ",
                totalScores,
                " "
            )
        );
    });

    return React.createElement(
        "div",
        { className: "domoList" },
        React.createElement(
            "h3",
            null,
            " Average Score: ",
            props.average,
            " "
        ),
        React.createElement(
            "h3",
            null,
            " Total Questions: ",
            props.max,
            " "
        ),
        gameNodes
    );
};

//renders the user stats
var viewStats = function viewStats(game, avereageScore, maxScore) {

    ReactDOM.render(React.createElement(Attempt, { attempts: game.attempts, average: avereageScore, max: maxScore }), document.querySelector("#domos"));
};

//creates a question in maker that is used for updating a quiz (info pre filled in)
var DoneQuestion = function DoneQuestion(props) {

    var values = {};
    if (props.data !== undefined) {
        values = {
            question: props.data.question,
            answers: [props.data.answer1, props.data.answer2, props.data.answer3, props.data.answer4]
        };
    } else {
        values = {
            question: "",
            answers: ["", "", "", ""]
        };
    }
    return React.createElement(
        "div",
        { className: "makerQuestion" },
        React.createElement("br", null),
        React.createElement(
            "label",
            { htmlFor: "q" + props.number + "name" },
            " Question ",
            props.number + 1,
            ": "
        ),
        React.createElement("input", { type: "textarea", name: "q" + props.number + "name", className: "QuestionTitles", defaultValue: values.question }),
        React.createElement("br", null),
        React.createElement(
            "p",
            null,
            " Enter your answers "
        ),
        React.createElement(
            "label",
            { htmlFor: "q" + props.number + "Ans1" },
            " Answer 1: "
        ),
        React.createElement("input", { type: "textarea", name: "q" + props.number + "Ans1", className: "questionAns", defaultValue: values.answers[0] }),
        React.createElement("br", null),
        React.createElement(
            "label",
            { htmlFor: "q" + props.number + "Ans2" },
            " Answer 2: "
        ),
        React.createElement("input", { type: "textarea", name: "q" + props.number + "Ans2", className: "questionAns", defaultValue: values.answers[1] }),
        React.createElement("br", null),
        React.createElement(
            "label",
            { htmlFor: "q" + props.number + "Ans3" },
            " Answer 3: "
        ),
        React.createElement("input", { type: "textarea", name: "q" + props.number + "Ans3", className: "questionAns", defaultValue: values.answers[2] }),
        React.createElement("br", null),
        React.createElement(
            "label",
            { htmlFor: "q" + props.number + "Ans4" },
            " Answer 4: "
        ),
        React.createElement("input", { type: "textarea", name: "q" + props.number + "Ans4", className: "questionAns", defaultValue: values.answers[3] }),
        React.createElement("br", null),
        React.createElement(
            "label",
            { htmlFor: "q" + props.number + "AnsCor" },
            " Correct Answer: "
        ),
        React.createElement(
            "select",
            { name: "q" + props.number + "AnsCor" },
            React.createElement(
                "option",
                { value: "1" },
                "Answer 1"
            ),
            React.createElement(
                "option",
                { value: "2" },
                "Answer 2"
            ),
            React.createElement(
                "option",
                { value: "3" },
                "Answer 3"
            ),
            React.createElement(
                "option",
                { value: "4" },
                "Answer 4"
            )
        )
    );
};

//same as done question except info isn't pre filled in
var Question = function Question(props) {

    return React.createElement(
        "div",
        { className: "makerQuestion" },
        React.createElement("br", null),
        React.createElement(
            "label",
            { htmlFor: "q" + props.number + "name" },
            " Question ",
            props.number + 1,
            ": "
        ),
        React.createElement("input", { type: "textarea", name: "q" + props.number + "name", className: "QuestionTitles", placeholder: "Enter your Question" }),
        React.createElement("br", null),
        React.createElement(
            "p",
            null,
            " Enter your answers "
        ),
        React.createElement(
            "label",
            { htmlFor: "q" + props.number + "Ans1" },
            " Answer 1: "
        ),
        React.createElement("input", { type: "textarea", name: "q" + props.number + "Ans1", className: "questionAns", placeholder: "Enter your Question" }),
        React.createElement("br", null),
        React.createElement(
            "label",
            { htmlFor: "q" + props.number + "Ans2" },
            " Answer 2: "
        ),
        React.createElement("input", { type: "textarea", name: "q" + props.number + "Ans2", className: "questionAns", placeholder: "Enter your Question" }),
        React.createElement("br", null),
        React.createElement(
            "label",
            { htmlFor: "q" + props.number + "Ans3" },
            " Answer 3: "
        ),
        React.createElement("input", { type: "textarea", name: "q" + props.number + "Ans3", className: "questionAns", placeholder: "Enter your Question" }),
        React.createElement("br", null),
        React.createElement(
            "label",
            { htmlFor: "q" + props.number + "Ans4" },
            " Answer 4: "
        ),
        React.createElement("input", { type: "textarea", name: "q" + props.number + "Ans4", className: "questionAns", placeholder: "Enter your Question" }),
        React.createElement("br", null),
        React.createElement(
            "label",
            { htmlFor: "q" + props.number + "AnsCor" },
            " Correct Answer: "
        ),
        React.createElement(
            "select",
            { name: "q" + props.number + "AnsCor" },
            React.createElement(
                "option",
                { value: "1" },
                "Answer 1"
            ),
            React.createElement(
                "option",
                { value: "2" },
                "Answer 2"
            ),
            React.createElement(
                "option",
                { value: "3" },
                "Answer 3"
            ),
            React.createElement(
                "option",
                { value: "4" },
                "Answer 4"
            )
        )
    );
};

//creates a quiz constructor 
var Maker = function Maker(props) {

    //if this is false then its a new quiz 
    if (!props.edit) {

        return React.createElement(
            "div",
            null,
            React.createElement(
                "form",
                { id: "makerForm",
                    onSubmit: addGame,
                    action: "/addGame",
                    method: "POST",
                    className: "makerForm"
                },
                React.createElement(
                    "label",
                    { htmlFor: "name" },
                    " Quiz Title: "
                ),
                React.createElement("input", { id: "quizName", type: "text", name: "name", placeholder: "Title" }),
                React.createElement("br", null),
                React.createElement(
                    "label",
                    { htmlFor: "maxAttempts" },
                    " Max attempts(-1 is infinite): "
                ),
                React.createElement("input", { id: "attemptCount", type: "number", name: "maxAttempts", min: "-1", max: "10", defaultValue: "-1" }),
                React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
                React.createElement("input", { type: "hidden", name: "count", value: props.count }),
                props.children,
                React.createElement("br", null),
                React.createElement(
                    "button",
                    { id: "deleteQuestion", type: "button", onClick: function onClick() {
                            return props.deleteQuestion(props.number);
                        } },
                    " Delete Last Question "
                ),
                React.createElement(
                    "button",
                    { id: "makeQuestion", type: "button", onClick: props.addChild },
                    " Add question "
                ),
                React.createElement("br", null),
                React.createElement("input", { className: "makeDomoSubmit", type: "submit", value: "Create Quiz" })
            )
        );
    }
    //otherwise your updating an old quiz so you need to put data in the scene
    else {
            return React.createElement(
                "div",
                null,
                React.createElement(
                    "h2",
                    null,
                    " ",
                    React.createElement(
                        "b",
                        null,
                        " Note: "
                    ),
                    " all answers have been reset"
                ),
                React.createElement(
                    "h2",
                    null,
                    " Submitting this will reset all attempts "
                ),
                React.createElement(
                    "form",
                    { id: "makerForm",
                        onSubmit: updateGame,
                        action: "/updateGame",
                        method: "POST",
                        className: "makerForm"
                    },
                    React.createElement(
                        "label",
                        { htmlFor: "name" },
                        " Quiz Title: "
                    ),
                    React.createElement("input", { id: "quizName", type: "text", name: "name", defaultValue: props.title }),
                    React.createElement("br", null),
                    React.createElement(
                        "label",
                        { htmlFor: "maxAttempts" },
                        " Max attempts(-1 is infinite): "
                    ),
                    React.createElement("input", { id: "attemptCount", type: "number", name: "maxAttempts", min: "-1", max: "10", defaultValue: "-1" }),
                    React.createElement("input", { type: "hidden", name: "_id", value: props.id }),
                    React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
                    React.createElement("input", { type: "hidden", name: "count", value: props.count }),
                    props.children,
                    React.createElement("br", null),
                    React.createElement(
                        "button",
                        { id: "MakeClass", type: "button", onClick: props.addChild },
                        " Add question "
                    ),
                    React.createElement("br", null),
                    React.createElement(
                        "button",
                        { id: "deleteClass", type: "button", onClick: function onClick() {
                                return props.deleteQuestion(props.number);
                            } },
                        " Delete Last Question "
                    ),
                    React.createElement("br", null),
                    React.createElement("input", { className: "makeDomoSubmit", type: "submit", value: "Update Quiz" })
                )
            );
        }
};

//displays the two tabs at the top  
var MenuUI = function MenuUI(props) {
    return React.createElement(
        "div",
        { id: "headerUI" },
        React.createElement(
            "button",
            { className: "viewer", id: "MakeClass", onClick: function onClick() {
                    return showMaker(props.csrf);
                } },
            " Make Game "
        ),
        React.createElement(
            "button",
            { className: "viewer", id: "makeViews", onClick: function onClick() {
                    return showViewer(props.csrf);
                } },
            " View Games "
        )
    );
};

//gets a users page and displays it 
var showUserPage = function showUserPage(_id, csrf) {
    sendAjax('GET', '/getGames', null, function (data) {

        ReactDOM.render(React.createElement(User, { csrf: csrf, games: data.games }), document.querySelector("#domos"));
    });
};

//run on init
var setup = function setup(csrf) {
    //display the ui
    ReactDOM.render(React.createElement(MenuUI, { csrf: csrf }), document.querySelector("#DisplayHead"));

    //get all quizes and display them
    sendAjax('GET', '/getUsername', null, function (data) {

        ReactDOM.render(React.createElement(
            "h3",
            { id: "profile", onClick: function onClick() {
                    return showUserPage(data._id, csrf);
                } },
            data.username
        ), document.querySelector("#userProfile"));
    });

    showViewer(csrf);
};

var getToken = function getToken() {
    sendAjax('GET', '/getToken', null, function (result) {
        setup(result.csrfToken);
    });
};

$(document).ready(function () {
    getToken();
});
"use strict";

var handleError = function handleError(message) {
    alert(message);
    console.log(message);
};

var redirect = function redirect(response) {
    $("#domoMessage").animate({
        width: 'hide'
    }, 350);
    window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {

    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: "json",
        success: success,
        error: function error(xhr, status, _error) {
            console.log("error");
            var messageObj = JSON.parse(xhr.responseText);
            handleError(messageObj.error);
        }
    });
};
