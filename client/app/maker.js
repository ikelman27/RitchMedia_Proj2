





class MakerComponent extends React.Component {
    constructor(props) {
        super(props)
        this.csrf = props.csrf;
        this.state = {
            numChildren: props.childCount,
        };
        this.data = props.data;
        this.edit = false;

        if (props.edit === undefined) {
            this.edit = false;
        }
        else {
            this.edit = true;
            this.title = props.data.name;
        }

        //this.deleteIndex = -1;

        this.onAddChild = () => {
            //console.log( $("#makerForm").serialize());
            this.setState({
                numChildren: this.state.numChildren + 1
            });
            //this.deleteIndex = -1;
        }

        this.removeChild = (loc) => {
            //this.deleteIndex = loc;
            this.setState({
                numChildren: this.state.numChildren - 1,
            });
        }
    }

    render() {
        const children = [];
        const devChild = [];
        if (!this.edit) {
            for (var i = 0; i < this.state.numChildren; i++) {
                children.push(<Question key={i} number={i}  />);
            };
            return (
                <Maker addChild={this.onAddChild} csrf={this.csrf} count={this.state.numChildren} edit={false} deleteQuestion={this.removeChild}>
                    {children}
                </Maker>
            );
        }
        else {
            for (var i = 0; i < this.state.numChildren; i++) {
                children.push(<DoneQuestion key={i} number={i} data={this.data.rounds[i]} />);
            };
            return (
                <Maker addChild={this.onAddChild} csrf={this.csrf} count={this.state.numChildren} title={this.title} edit={true} id={this.data._id} deleteQuestion={this.removeChild}>
                    {children}
                </Maker>
            );
        }


    };



}




const handleDomo = (e) => {
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
}
/*
const DomoForm = (props) => {
    return (
        <form id="domoForm"
            onSubmit={handleDomo}
            action="/maker"
            method="POST"
            className="domoForm"
        >
            <label htmlFor="name"> Namear: </label>
            <input id="domoName" type="text" name="name" placeholder="Domo Name" />
            <label htmlFor="age"> Age: </label>
            <input id="domoAge" type="text" name="age" placeholder="domo age" />
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input className="makeDomoSubmit" type="submit" value="Make Domo" />

        </form>
    );
};
*/

const addGame = (e) => {
    e.preventDefault();
    console.log($("#makerForm").serialize());
    sendAjax('POST', '/createGame', $("#makerForm").serialize(), function (param) {
        console.log("created game");
        ReactDOM.render(
            <div>
                <h2> Created a new game </h2>
            </div>, document.querySelector("#domos")
        );
    });
};

const updateGame = (e) => {
    e.preventDefault();
    //console.log($("#makerForm").serialize());
    sendAjax('POST', '/updateGame', $("#makerForm").serialize(), function (param) {
        console.log("updated game");
        ReactDOM.render(
            <div>
                <h2> Updated a game </h2>
            </div>, document.querySelector("#domos")
        );
    });
};

function showMaker(csrf) {

    ReactDOM.render(
        <MakerComponent csrf={csrf} childCount={1} />, document.querySelector("#domos")
    );
};


function showViewer(csrf) {
    sendAjax('GET', '/listGames', null, (gameData) => {
        var games = gameData.game;

        ReactDOM.render(
            <ViewList csrf={csrf} games={games} />, document.querySelector("#domos")
        );
    });
}

function showQuiz(gameData, csrf) {

    ReactDOM.render(
        <Quiz gameData={gameData} csrf={csrf} />, document.querySelector("#domos")
    );
}


function startGame(gameID, csrf) {
    var queryData = {
        csrf: csrf,
        _id: gameID
    }


    sendAjax('GET', '/getQuiz', queryData, (gameData) => {
        console.log(gameData);
        if (gameData.valid) {
            showQuiz(gameData.games, csrf);
        }
        else {
            ReactDOM.render(
                <div id="scoreDIV">
                    <h2> Sorry you have attempted this quiz too many times</h2>
                </div>, document.querySelector("#domos")
            );
        }

    });
}

function editGame(gameID, csrf) {
    var queryData = {
        csrf: csrf,
        _id: gameID
    }
    sendAjax('GET', '/getQuiz', queryData, (gameData) => {
        console.log(gameData.games);
        ReactDOM.render(
            <MakerComponent csrf={csrf} childCount={gameData.games.rounds.length} edit={true} data={gameData.games} />, document.querySelector("#domos")
        );

    });
}


const submitQuiz = (e) => {
    e.preventDefault();
    //console.log($("#quizForm").serialize());

    sendAjax('GET', '/checkAnswers', $("#quizForm").serialize(), (result) => {


        var score = { score: result.score, maxScore: result.maxScore };
        var request = $("#quizForm [type=hidden]").serialize() + "&" + $.param(score);

        console.log(request);
        //var score =  JSON.parse( $("#quizForm [type=hidden]").serialize());
        //console.log($("#quizForm [type=hidden]").serialize());

        sendAjax('POST', '/updateScore', request, (scores) => {


            //console.log(scores);

            ReactDOM.render(
                <div id="scoreDIV">
                    <h2> Your Scored a {result.score}/{result.maxScore}</h2>
                </div>, document.querySelector("#domos")
            );
        });



    });
}

const Quiz = (props) => {

    if (props.gameData.rounds.length === 0) {
        return (
            <div className="gameList">
                <h3 className="emptyDomo"> The Quiz is empty </h3>
            </div>
        );
    }

    //console.log(props.gameData);
    var i = 0;
    const questionNode = props.gameData.rounds.map(function (round) {
        i++;
        return (

            <div className='domo'>

                <h3 className="gameName"> Question {i} </h3>
                <h3 className="gameName"> {round.question} </h3>
                <div id="question" name="quest">

                    <input type="radio" className="answer" id={"q" + i + "a1"} name={"q" + i} value='1' />
                    <label htmlFor={"q" + i + "a1"}> {round.answer1} </label>
                    <br />

                    <input id={"q" + i + "a2"} type="radio" className="answer" name={"q" + i} value='2' />
                    <label htmlFor={"q" + i + "a2"}> {round.answer2} </label>
                    <br />

                    <input id={"q" + i + "a3"} type="radio" className="answer" name={"q" + i} value='3' />
                    <label htmlFor={"q" + i + "a3"}> {round.answer3} </label>
                    <br />

                    <input id={"q" + i + "a4"} type="radio" className="answer" name={"q" + i} value='4' />
                    <label htmlFor={"q" + i + "a4"}> {round.answer4}</label>
                </div>


            </div>

        );
    });


    return (
        <form id="quizForm"
            onSubmit={submitQuiz}
            action="/checkAnswers"
            method="GET"
            className="quizForm"
        >
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input type="hidden" name="_id" value={props.gameData._id} />

            {questionNode}




            <input className="makeDomoSubmit" type="submit" value="Submit Quiz" />
        </form>
    );
}

const ViewList = (props) => {

    if (props.games.length === 0) {
        return (
            <div className="gameList">
                <h3 className="emptyDomo"> No Quizes yet </h3>
            </div>
        );
    }



    const gameNodes = props.games.map(function (game) {
        return (
            <div key={game._id} className='domo'>

                <h3 className="gameName" onClick={() => startGame(game._id, props.csrf)}> Name: {game.name} </h3>
                <h3 className="gameAge"> Questions: {game.length} </h3>
                <h3 className="gameCreator"> Creator: {game.creatorUsername} </h3>
                <button className="viewer" id="startQuiz" type="button" onClick={() => startGame(game._id, props.csrf)}> Play Game </button>

            </div>
        );
    });

    return (
        <div className="domoList">
            {gameNodes}
        </div>
    );
}

const User = (props) => {
    if (props.games.length === 0) {
        return (
            <div className="gameList">
                <h3 className="emptyDomo"> No Quizes yet </h3>
            </div>
        );
    }





    const gameNodes = props.games.map(function (game) {

        const maxScore = game.rounds.length;
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


        //console.log(avereageScore);

        return (
            <div key={game._id} className='domo'>

                <h3 className="gameName" onClick={() => editGame(game._id, props.csrf)}> Name: {game.name} </h3>
                <h3 className="gameAge"> Questions: {game.rounds.length} </h3>
                <h4 className="gameAge" > Average Score: {avereageScore} </h4>
                <h4 className="gameAge" > Users attempted: {usersAttempted} </h4>
                <h4 className="gameAge" > Total Attempts: {totalAttempts} </h4>
                <button className="statsButton" id="viewStats" type="button" onClick={() => viewStats(game, avereageScore, maxScore)}> View total reports </button>
                <button className="viewer" id="startQuiz" type="button" onClick={() => editGame(game._id, props.csrf)}> Edit Quiz </button>

            </div>
        );
    });

    return (
        <div className="domoList">
            {gameNodes}
        </div>
    );
}

const Attempt = (props) => {
    console.log(props);
    if (props.attempts.length === 0) {
        return (
            <div className="gameList">
                <h3 className="emptyDomo"> No Users have attempted the quiz yet </h3>
            </div>
        );
    }





    const gameNodes = props.attempts.map(function (attempt) {


        var userAve = 0;
        var totalScores = "";



        for (var i = 0; i < attempt.scores.length; i++) {
            userAve += attempt.scores[i];
            totalScores += "  " + String(attempt.scores[i] / props.max);
        }
        userAve = userAve / (attempt.scores.length * props.max);

        //console.log(attempt);

        return (

            <div className='domo'>
                <h3> User: {attempt.playerName} </h3>
                <h3> avereageScore: {userAve} </h3>
                <h3> Scores: {totalScores} </h3>

            </div>
        );
    });

    return (
        <div className="domoList">
            <h3> Average Score: {props.average} </h3>
            <h3> Total Questions: {props.max} </h3>
            {gameNodes}
        </div>
    );
}

const viewStats = (game, avereageScore, maxScore) => {

    ReactDOM.render(
        <Attempt attempts={game.attempts} average={avereageScore} max={maxScore} />, document.querySelector("#domos")

    )
}

const DoneQuestion = (props) => {
    //console.log(props.data);
    let values = {};
    if (props.data !== undefined) {
        values = {
            question: props.data.question,
            answers: [props.data.answer1, props.data.answer2, props.data.answer3, props.data.answer4]
        }
    }
    else {
        values = {
            question: "",
            answers: ["", "", "", ""],
        }
    }
    return (
        <div>
            <br />
            <label htmlFor={"q" + props.number + "name"}> Question {props.number + 1}: </label>
            <input type="textarea" name={"q" + props.number + "name"} className="QuestionTitles" defaultValue={values.question} />
            <br />
            <p> Enter your answers </p>
            <label htmlFor={"q" + props.number + "Ans1"}> Answer 1: </label>
            <input type="textarea" name={"q" + props.number + "Ans1"} className="questionAns" defaultValue={values.answers[0]} />
            <label htmlFor={"q" + props.number + "Ans2"}> Answer 2: </label>
            <input type="textarea" name={"q" + props.number + "Ans2"} className="questionAns" defaultValue={values.answers[1]} />
            <label htmlFor={"q" + props.number + "Ans3"}> Answer 3: </label>
            <input type="textarea" name={"q" + props.number + "Ans3"} className="questionAns" defaultValue={values.answers[2]} />
            <label htmlFor={"q" + props.number + "Ans4"}> Answer 4: </label>
            <input type="textarea" name={"q" + props.number + "Ans4"} className="questionAns" defaultValue={values.answers[3]} />
            <br />
            <label htmlFor={"q" + props.number + "AnsCor"}> Correct Answer: </label>
            <select name={"q" + props.number + "AnsCor"}>
                <option value="1">Answer 1</option>
                <option value="2">Answer 2</option>
                <option value="3">Answer 3</option>
                <option value="4">Answer 4</option>
            </select>



        </div>

    );

};

const Question = (props) => {

    return (
        <div>
            <br />
           
            <label htmlFor={"q" + props.number + "name"}> Question {props.number + 1}: </label>
            <input type="textarea" name={"q" + props.number + "name"} className="QuestionTitles" placeholder="Enter your Question" />
            <br />
            <p> Enter your answers </p>
            <label htmlFor={"q" + props.number + "Ans1"}> Answer 1: </label>
            <input type="textarea" name={"q" + props.number + "Ans1"} className="questionAns" placeholder="Enter your Question" />
            <label htmlFor={"q" + props.number + "Ans2"}> Answer 2: </label>
            <input type="textarea" name={"q" + props.number + "Ans2"} className="questionAns" placeholder="Enter your Question" />
            <label htmlFor={"q" + props.number + "Ans3"}> Answer 3: </label>
            <input type="textarea" name={"q" + props.number + "Ans3"} className="questionAns" placeholder="Enter your Question" />
            <label htmlFor={"q" + props.number + "Ans4"}> Answer 4: </label>
            <input type="textarea" name={"q" + props.number + "Ans4"} className="questionAns" placeholder="Enter your Question" />
            <br />
            <label htmlFor={"q" + props.number + "AnsCor"}> Correct Answer: </label>
            <select name={"q" + props.number + "AnsCor"}>
                <option value="1">Answer 1</option>
                <option value="2">Answer 2</option>
                <option value="3">Answer 3</option>
                <option value="4">Answer 4</option>
            </select>




        </div>

    );

};

const Maker = (props) => {

    if (!props.edit) {

        return (
            <div>

                <form id="makerForm"
                    onSubmit={addGame}
                    action='/addGame'
                    method="POST"
                    className="makerForm"
                >
                    <label htmlFor="name"> Quiz Title: </label>
                    <input id="quizName" type="text" name="name" placeholder="Title" />
                    <br />
                    <label htmlFor="maxAttempts"> Max attempts(-1 is infinite): </label>
                    <input id="attemptCount" type="number" name="maxAttempts" min="-1" max="10" defaultValue="-1" />
                    <input type="hidden" name="_csrf" value={props.csrf} />
                    <input type="hidden" name="count" value={props.count} />
                    {props.children}
                    <br />
                    <button className="viewer" id="MakeClass" type="button" onClick={props.addChild}> Add question </button>
                    <br />
                    <button className="viewer" id="deleteClass" type="button" onClick={() => props.deleteQuestion(props.number)}> Delete Last Question </button>
                    <br/>
                    <input className="makeDomoSubmit" type="submit" value="Create Quiz" />

                </form>


            </div>
        );
    }
    else {
        //console.log(props.addChild);
        return (
            <div>
                <h2> <b> Note: </b> all answers have been reset</h2>
                <h2> Submitting this will reset all attempts </h2>
                <form id="makerForm"
                    onSubmit={updateGame}
                    action='/updateGame'
                    method="POST"
                    className="makerForm"
                >
                    <label htmlFor="name"> Quiz Title: </label>
                    <input id="quizName" type="text" name="name" defaultValue={props.title} />
                    <br />
                    <label htmlFor="maxAttempts"> Max attempts(-1 is infinite): </label>
                    <input id="attemptCount" type="number" name="maxAttempts" min="-1" max="10" defaultValue="-1" />
                    <input type="hidden" name="_id" value={props.id} />
                    <input type="hidden" name="_csrf" value={props.csrf} />
                    <input type="hidden" name="count" value={props.count} />
                    {props.children}
                    <br />
                    <button className="viewer" id="MakeClass" type="button" onClick={props.addChild}> Add question </button>
                    <br />
                    <button className="viewer" id="deleteClass" type="button" onClick={() => props.deleteQuestion(props.number)}> Delete Last Question </button>
                    <br/>
                    <input className="makeDomoSubmit" type="submit" value="Update Quiz" />

                </form>


            </div>
        );
    }
}

const MenuUI = (props) => {
    return (
        <div id="headerUI">
            <button className="viewer" id="MakeClass" onClick={() => showMaker(props.csrf)}> Make Game </button>
            <button className="viewer" id="makeViews" onClick={() => showViewer(props.csrf)}> View Games </button>

        </div>
    );
};

/*const DomoList = function (props) {
    if (props.domos.length === 0) {
        return (
            <div className="domoList">
                <h3 className="emptyDomo"> No Domos yet </h3>
            </div>
        );
    }


    const domoNodes = props.domos.map(function (domo) {
        return (
            <div key={domo._id} className='domo'>
                <img src="assets/img/domoface.jpeg" alt="domo face" className="domoFace" />
                <h3 className="domoName"> Name: {domo.name} </h3>
                <h3 className="domoAge"> Age: {domo.age} </h3>
            </div>
        );
    });

    return (
        <div className="domoList">
            {domoNodes}
        </div>
    );
};

const loadDomosFromServer = () => {

    //console.log("test");
    //sendAjax('GET', '/getGames', null, (data) => {
    //    console.log(data);

//
        //console.log($.param(game));
    //    sendAjax('GET', '/listGames', null, (gameData) => {
   //         console.log(gameData);
     //   });
    //});




};*/





const showUserPage = function (_id, csrf) {
    sendAjax('GET', '/getGames', null, (data) => {
        console.log(data);
        ReactDOM.render(
            <User csrf={csrf} games={data.games} />, document.querySelector("#domos")
        );
    });
};

const setup = function (csrf) {



    ReactDOM.render(
        <MenuUI csrf={csrf} />, document.querySelector("#DisplayHead")
    );

    sendAjax('GET', '/getUsername', null, (data) => {
        console.log(data);
        ReactDOM.render(
            <h3 id="profile" onClick={() => showUserPage(data._id, csrf)}>{data.username}</h3>, document.querySelector("#userProfile")
        );

    });

    showViewer(csrf);
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};


$(document).ready(function () {
    getToken();
});