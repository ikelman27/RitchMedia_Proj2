"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
        _this.onAddChild = function () {
            //console.log( $("#makerForm").serialize());
            _this.setState({
                numChildren: _this.state.numChildren + 1
            });
        };
        return _this;
    }

    _createClass(MakerComponent, [{
        key: "render",
        value: function render() {
            var children = [];
            if (!this.edit) {

                for (var i = 0; i < this.state.numChildren; i++) {
                    children.push(React.createElement(Question, { key: i, number: i }));
                };

                return React.createElement(
                    Maker,
                    { addChild: this.onAddChild, csrf: this.csrf, count: this.state.numChildren, edit: false },
                    children
                );
            } else {
                for (var i = 0; i < this.state.numChildren; i++) {
                    children.push(React.createElement(DoneQuestion, { key: i, number: i, data: this.data.rounds[i] }));
                };

                return React.createElement(
                    Maker,
                    { addChild: this.onAddChild, csrf: this.csrf, count: this.state.numChildren, title: this.title, edit: true, id: this.data._id },
                    children
                );
            }
        }
    }]);

    return MakerComponent;
}(React.Component);

var handleDomo = function handleDomo(e) {
    e.preventDefault();

    $("#domoMessage").animate({
        width: 'hide'
    }, 350);

    if ($("#domoName").val() == '' || $("#domoAge").val == '') {
        handleError('All fields are required');
        return false;
    }

    //sendAjax('POST', '/addGame',  $("#domoForm").serialize(), function(param){
    //   console.log("created game");
    //loadDomosFromServer();
    //});

    //sendAjax('POST', $("#domoForm").attr("action"), $("#domoForm").serialize(), function (param) {
    //   console.log("test");
    //    loadDomosFromServer();
    //});


    return false;
};

var DomoForm = function DomoForm(props) {
    return React.createElement(
        "form",
        { id: "domoForm",
            onSubmit: handleDomo,
            action: "/maker",
            method: "POST",
            className: "domoForm"
        },
        React.createElement(
            "label",
            { htmlFor: "name" },
            " Namear: "
        ),
        React.createElement("input", { id: "domoName", type: "text", name: "name", placeholder: "Domo Name" }),
        React.createElement(
            "label",
            { htmlFor: "age" },
            " Age: "
        ),
        React.createElement("input", { id: "domoAge", type: "text", name: "age", placeholder: "domo age" }),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { className: "makeDomoSubmit", type: "submit", value: "Make Domo" })
    );
};

var addGame = function addGame(e) {
    e.preventDefault();
    //console.log($("#makerForm").serialize());
    sendAjax('POST', '/createGame', $("#makerForm").serialize(), function (param) {
        console.log("created game");
        //loadDomosFromServer();
    });
};

var updateGame = function updateGame(e) {
    e.preventDefault();
    //console.log($("#makerForm").serialize());
    sendAjax('POST', '/updateGame', $("#makerForm").serialize(), function (param) {
        console.log("updated game");
        //loadDomosFromServer();
    });
};

function showMaker(csrf) {

    ReactDOM.render(React.createElement(MakerComponent, { csrf: csrf, childCount: 1 }), document.querySelector("#domos"));
};

function showViewer(csrf) {
    sendAjax('GET', '/listGames', null, function (gameData) {
        var games = gameData.game;

        ReactDOM.render(React.createElement(ViewList, { csrf: csrf, games: games }), document.querySelector("#domos"));
    });
}

function showQuiz(gameData, csrf) {

    ReactDOM.render(React.createElement(Quiz, { gameData: gameData, csrf: csrf }), document.querySelector("#domos"));
}

function startGame(gameID, csrf) {
    var queryData = {
        csrf: csrf,
        _id: gameID
    };

    sendAjax('GET', '/getQuiz', queryData, function (gameData) {
        console.log(gameData);
        showQuiz(gameData.games, csrf);
    });
}

function editGame(gameID, csrf) {
    var queryData = {
        csrf: csrf,
        _id: gameID
    };
    sendAjax('GET', '/getQuiz', queryData, function (gameData) {
        console.log(gameData.games);
        ReactDOM.render(React.createElement(MakerComponent, { csrf: csrf, childCount: gameData.games.rounds.length, edit: true, data: gameData.games }), document.querySelector("#domos"));
    });
}

var submitQuiz = function submitQuiz(e) {
    e.preventDefault();
    //console.log($("#quizForm").serialize());

    sendAjax('GET', '/checkAnswers', $("#quizForm").serialize(), function (result) {
        console.log(result);
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
};

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

    //console.log(props.gameData);
    var i = 0;
    var questionNode = props.gameData.rounds.map(function (round) {
        i++;
        return React.createElement(
            "div",
            { className: "domo" },
            React.createElement(
                "h3",
                { className: "gameName" },
                " Question ",
                i,
                " "
            ),
            React.createElement(
                "h3",
                { className: "gameName" },
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
                game.creator,
                " "
            ),
            React.createElement(
                "button",
                { className: "viewer", id: "startQuiz", type: "button", onClick: function onClick() {
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
                "button",
                { className: "viewer", id: "startQuiz", type: "button", onClick: function onClick() {
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

var DoneQuestion = function DoneQuestion(props) {
    //console.log(props.data);
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
        null,
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
        React.createElement(
            "label",
            { htmlFor: "q" + props.number + "Ans2" },
            " Answer 2: "
        ),
        React.createElement("input", { type: "textarea", name: "q" + props.number + "Ans2", className: "questionAns", defaultValue: values.answers[1] }),
        React.createElement(
            "label",
            { htmlFor: "q" + props.number + "Ans3" },
            " Answer 3: "
        ),
        React.createElement("input", { type: "textarea", name: "q" + props.number + "Ans3", className: "questionAns", defaultValue: values.answers[2] }),
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

var Question = function Question(props) {
    //console.log(props);
    return React.createElement(
        "div",
        null,
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
        React.createElement(
            "label",
            { htmlFor: "q" + props.number + "Ans2" },
            " Answer 2: "
        ),
        React.createElement("input", { type: "textarea", name: "q" + props.number + "Ans2", className: "questionAns", placeholder: "Enter your Question" }),
        React.createElement(
            "label",
            { htmlFor: "q" + props.number + "Ans3" },
            " Answer 3: "
        ),
        React.createElement("input", { type: "textarea", name: "q" + props.number + "Ans3", className: "questionAns", placeholder: "Enter your Question" }),
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

var Maker = function Maker(props) {

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
                React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
                React.createElement("input", { type: "hidden", name: "count", value: props.count }),
                props.children,
                React.createElement("br", null),
                React.createElement(
                    "button",
                    { className: "viewer", id: "MakeClass", type: "button", onClick: props.addChild },
                    " Add question "
                ),
                React.createElement("br", null),
                React.createElement("input", { className: "makeDomoSubmit", type: "submit", value: "Create Quiz" })
            )
        );
    } else {
        console.log(props.addChild);
        return React.createElement(
            "div",
            null,
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
                React.createElement("input", { type: "hidden", name: "_id", value: props.id }),
                React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
                React.createElement("input", { type: "hidden", name: "count", value: props.count }),
                props.children,
                React.createElement("br", null),
                React.createElement(
                    "button",
                    { className: "viewer", id: "MakeClass", type: "button", onClick: props.addChild },
                    " Add question "
                ),
                React.createElement("br", null),
                React.createElement("input", { className: "makeDomoSubmit", type: "submit", value: "Update Quiz" })
            )
        );
    }
};

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

var DomoList = function DomoList(props) {
    if (props.domos.length === 0) {
        return React.createElement(
            "div",
            { className: "domoList" },
            React.createElement(
                "h3",
                { className: "emptyDomo" },
                " No Domos yet "
            )
        );
    }

    var domoNodes = props.domos.map(function (domo) {
        return React.createElement(
            "div",
            { key: domo._id, className: "domo" },
            React.createElement("img", { src: "assets/img/domoface.jpeg", alt: "domo face", className: "domoFace" }),
            React.createElement(
                "h3",
                { className: "domoName" },
                " Name: ",
                domo.name,
                " "
            ),
            React.createElement(
                "h3",
                { className: "domoAge" },
                " Age: ",
                domo.age,
                " "
            )
        );
    });

    return React.createElement(
        "div",
        { className: "domoList" },
        domoNodes
    );
};

var loadDomosFromServer = function loadDomosFromServer() {

    //console.log("test");
    sendAjax('GET', '/getGames', null, function (data) {
        console.log(data);

        //console.log($.param(game));
        sendAjax('GET', '/listGames', null, function (gameData) {
            console.log(gameData);
        });
    });
};

var showUserPage = function showUserPage(_id, csrf) {
    sendAjax('GET', '/getGames', null, function (data) {
        ReactDOM.render(React.createElement(User, { csrf: csrf, games: data.games }), document.querySelector("#domos"));
    });
};

var setup = function setup(csrf) {

    ReactDOM.render(React.createElement(MenuUI, { csrf: csrf }), document.querySelector("#DisplayHead"));

    sendAjax('GET', '/getUsername', null, function (data) {
        console.log(data);
        ReactDOM.render(React.createElement(
            "h3",
            { id: "profile", onClick: function onClick() {
                    return showUserPage(data._id, csrf);
                } },
            data.username
        ), document.querySelector("#userProfile"));
    });

    showViewer(csrf);

    //ReactDOM.render(
    //    <DomoList domos={[]} />, document.querySelector("#domos")
    //);
    loadDomosFromServer();
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
    $("#errorMessage").text(message);
    $("#domoMessage").animate({
        width: 'toggle'
    }, 350);
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
