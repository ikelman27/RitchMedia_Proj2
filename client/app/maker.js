var Session_csrf;
//class to hold the quiz maker
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

        //whenever a child is added set the state to children +1
        this.onAddChild = () => {

            this.setState({
                numChildren: this.state.numChildren + 1
            });

        }

        //delete the last child
        this.removeChild = (loc) => {

            this.setState({
                numChildren: this.state.numChildren - 1,
            });
        }
    }

    //function to render the maker component
    render() {
        const children = [];
        //add number of children to the form
        //if it isnt an edit use question otherwise use done question
        if (!this.edit) {
            for (var i = 0; i < this.state.numChildren; i++) {
                children.push(<Question key={i} number={i} className="test" />);
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

//adds a new game to the server
const addGame = (e) => {
    e.preventDefault();
    console.log($("#makerForm").serialize());
    sendAjax('POST', '/createGame', $("#makerForm").serialize(), function (param) {
        console.log("created game");
        //display data so users dont spam click the button
        ReactDOM.render(
            <div>
                <h2> Created a new game </h2>
            </div>, document.querySelector("#domos")
        );
    });
};

//updates an existing game
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

//clicking the button brings you to the make game form
function showMaker(csrf) {

    sendAjax('GET', '/getGames', null, (data) => {
        sendAjax('GET', '/premium', null, (premium) =>{
            if(premium == false  && data.games.length >= 10){
                ReactDOM.render(
                    <div>
                        <h3> You have created the maximum number of games </h3>
                        <p> If you would like to create more games you can delete old games,
                            or you can create a premium account. Click the link below or go premium
                            at the top of the page to make a premium account
                        </p>
                        <button id='paymentButton' onClick={showPaymentPage}> Go Premium </button>
                    </div>, document.querySelector("#domos")
                );
                
            }
            else{
                ReactDOM.render(
                    <MakerComponent csrf={csrf} childCount={1} />, document.querySelector("#domos")
                );
            }
        });
    });

};

//views all the games that were created Only gets the first 20 items for now
function showViewer(csrf) {
    sendAjax('GET', '/listGames', `startIndex=${20}`, (gameData) => {
        var games = gameData.game;
        
        ReactDOM.render(
            <div>
            <SearchMenu csrf={csrf} />
            <ViewList id='gameViews' csrf={csrf} games={games} />
            </div>, document.querySelector("#domos")
        );

    });
}

//loads another 20 items to the viewer from the server
function loadMore(csrf){
    //get the current number of quizes and increase it by 20
    var elementsLoaded = document.getElementById('viewerList').childElementCount;
    elementsLoaded += 20;
    //get all the games from the server from the new index
    sendAjax('GET', '/listGames', `startIndex=${elementsLoaded}`, (gameData) => {
        var games = gameData.game;
        ReactDOM.render(
            <div>
            <SearchMenu csrf={csrf} />
            <ViewList id='gameViews' csrf={csrf} games={games} />
            </div>, document.querySelector("#domos")
        );
    });
}


//display a single game
function showQuiz(gameData, csrf) {

    ReactDOM.render(
        <Quiz gameData={gameData} csrf={csrf} />, document.querySelector("#domos")
    );
}

//sends a request to the server to get a specific game
function startGame(gameID, csrf) {
    var queryData = {
        csrf: csrf,
        _id: gameID
    }


    sendAjax('GET', '/getQuiz', queryData, (gameData) => {
        //console.log(gameData);
        //if the data is valid display the quiz
        if (gameData.valid) {
            showQuiz(gameData.games, csrf);
        }
        //if the game isn't valid the user has attempted the game to many times
        else {
            ReactDOM.render(
                <div id="scoreDIV">
                    <h2> Sorry you have attempted this quiz too many times</h2>
                </div>, document.querySelector("#domos")
            );
        }

    });
}

//request for a specific game then calls maker on that game to view it in the editor mode
function editGame(gameID, csrf) {
    var queryData = {
        csrf: csrf,
        _id: gameID
    }
    sendAjax('GET', '/getQuiz', queryData, (gameData) => {
        //console.log(gameData.games);
        ReactDOM.render(
            <MakerComponent csrf={csrf} childCount={gameData.games.rounds.length} edit={true} data={gameData.games} />, document.querySelector("#domos")
        );

    });
}

//uploads user answers to the server then gets thier score and updades that
const submitQuiz = (e) => {
    e.preventDefault();
    
    //get the score and then send an update to post that score to the server
    sendAjax('GET', '/checkAnswers', $("#quizForm").serialize(), (result) => {
        var score = { score: result.score, maxScore: result.maxScore };
        var request = $("#quizForm [type=hidden]").serialize() + "&" + $.param(score);

        sendAjax('POST', '/updateScore', request, (scores) => {
            ReactDOM.render(
                <div id="scoreDIV">
                    <h2> Your Scored a {result.score}/{result.maxScore}</h2>
                </div>, document.querySelector("#domos")
            );
        });



    });
}

//the data to be displayed when the user starts a quiz
const Quiz = (props) => {

    if (props.gameData.rounds.length === 0) {
        return (
            <div className="gameList">
                <h3 className="emptyDomo"> The Quiz is empty </h3>
            </div>
        );
    }

    //loop through each question and display the data
    var i = 0;
    const questionNode = props.gameData.rounds.map(function (round) {
        i++;
        return (

            <div className='question'>

                <h3 className="questionName"> Question {i} </h3>
                <h3 className="questionRound"> {round.question} </h3>
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

    //return the full quiz
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


//when given a list of items creats the html to display them similar to quiz
const ViewList = (props) => {
    if (props.games.length === 0) {
        return (
            <div className="gameList">
                <h3 className="emptyDomo"> No Quizes yet </h3>
            </div>
        );
    }

    const gameNodes = props.games.map(function (game) {
        //if the max attempts are -1 there are infinite attempts avalible
        var maxAttempts = game.maxAttempts;
        if(maxAttempts == -1){
            maxAttempts = 'infinite'
        };

        return (
            <div key={game._id} className='domo' >

                <h3 className="gameName" onClick={() => startGame(game._id, props.csrf)}> Name: {game.name} </h3>
                <h3 className="gameAge"> Questions: {game.length} </h3>
                <h3 className="gameCreator"> Creator: {game.creatorUsername} </h3>
                <h3 classname="gameAge"> Max attempts: {maxAttempts} </h3>
                <button id="startQuiz" type="button" onClick={() => startGame(game._id, props.csrf)}> Play Game </button>

            </div>
        );
    });


    
    //if there are more quizes to load display the load more button
    if(props.games.length %20 === 0){
        return (
            <div id='viewDiv'>
                <div className="domoList"  id="viewerList" >
                    {gameNodes}                    
                </div>
                <button id="loadMore" onClick={() => loadMore(props.csrf)}> Load more quizes </button>
            </div>
        );
    }
    //oterwise just return the list
    return (
        <div id ='viewDiv'>
        <div className="domoList" id='viewerList'>
            {gameNodes}
        </div> 
        </div>
    );
}

//displays all of the quizes that a user created similar to quiz
const User = (props) => {
    if (props.games.length === 0) {
        return (
            <div className="gameList">
                <h3 className="emptyDomo"> No Quizes yet </h3>
            </div>
        );
    }

    const gameNodes = props.games.map(function (game) {

        //calculate the average score total attempts and number of users who attempted the quiz
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

        return (
            <div key={game._id} className='domo'>

                <h3 className="gameName" onClick={() => editGame(game._id, props.csrf)}> Name: {game.name} </h3>
                <h3 className="gameAge"> Questions: {game.rounds.length} </h3>
                <h4 className="gameAge" > Average Score: {avereageScore} </h4>
                <h4 className="gameAge" > Users attempted: {usersAttempted} </h4>
                <h4 className="gameAge" > Total Attempts: {totalAttempts} </h4>
                <button className="statsButton" id="viewStats" type="button" onClick={() => viewStats(game, avereageScore, maxScore)}> View total reports </button>
                <button id="startQuiz" type="button" onClick={() => editGame(game._id, props.csrf)}> Edit Quiz </button>

            </div>
        );
    });

    return (
        <div className="domoList">
            {gameNodes}
        </div>
    );
}

//create the stats for each user who have attempted a quiz
const Attempt = (props) => {
    if (props.attempts.length === 0) {
        return (
            <div className="gameList">
                <h3 className="emptyDomo"> No Users have attempted the quiz yet </h3>
            </div>
        );
    }

    const gameNodes = props.attempts.map(function (attempt) {

        //calculate the sats for each user
        var userAve = 0;
        var totalScores = "";
        for (var i = 0; i < attempt.scores.length; i++) {
            userAve += attempt.scores[i];
            totalScores += "  " + String(attempt.scores[i] / props.max);
        }
        userAve = userAve / (attempt.scores.length * props.max);
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

//renders the user stats
const viewStats = (game, avereageScore, maxScore) => {

    ReactDOM.render(
        <Attempt attempts={game.attempts} average={avereageScore} max={maxScore} />, document.querySelector("#domos")

    )
}

//creates a question in maker that is used for updating a quiz (info pre filled in)
const DoneQuestion = (props) => {
  
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
        <div className="makerQuestion">
            <br />
            <label htmlFor={"q" + props.number + "name"}> Question {props.number + 1}: </label>
            <input type="textarea" name={"q" + props.number + "name"} className="QuestionTitles" defaultValue={values.question} />
            <br />
            <p> Enter your answers </p>
            <label htmlFor={"q" + props.number + "Ans1"}> Answer 1: </label>
            <input type="textarea" name={"q" + props.number + "Ans1"} className="questionAns" defaultValue={values.answers[0]} />
            <br />
            <label htmlFor={"q" + props.number + "Ans2"}> Answer 2: </label>
            <input type="textarea" name={"q" + props.number + "Ans2"} className="questionAns" defaultValue={values.answers[1]} />
            <br />
            <label htmlFor={"q" + props.number + "Ans3"}> Answer 3: </label>
            <input type="textarea" name={"q" + props.number + "Ans3"} className="questionAns" defaultValue={values.answers[2]} />
            <br />
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

//same as done question except info isn't pre filled in
const Question = (props) => {

    return (
        <div className="makerQuestion">
            <br />

            <label htmlFor={"q" + props.number + "name"}> Question {props.number + 1}: </label>
            <input type="textarea" name={"q" + props.number + "name"} className="QuestionTitles" placeholder="Enter your Question" />
            <br />
            <p> Enter your answers </p>
            <label htmlFor={"q" + props.number + "Ans1"}> Answer 1: </label>
            <input type="textarea" name={"q" + props.number + "Ans1"} className="questionAns" placeholder="Enter your Question" />
            <br />
            <label htmlFor={"q" + props.number + "Ans2"}> Answer 2: </label>
            <input type="textarea" name={"q" + props.number + "Ans2"} className="questionAns" placeholder="Enter your Question" />
            <br />
            <label htmlFor={"q" + props.number + "Ans3"}> Answer 3: </label>
            <input type="textarea" name={"q" + props.number + "Ans3"} className="questionAns" placeholder="Enter your Question" />
            <br />
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

//creates a quiz constructor 
const Maker = (props) => {

    //if this is false then its a new quiz 
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
                    <button id="deleteQuestion" type="button" onClick={() => props.deleteQuestion(props.number)}> Delete Last Question </button>

                    <button id="makeQuestion" type="button" onClick={props.addChild}> Add question </button>
                    <br />
                    <input className="makeDomoSubmit" type="submit" value="Create Quiz" />

                </form>


            </div>
        );
    }
    //otherwise your updating an old quiz so you need to put data in the scene
    else {
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
                    <button id="MakeClass" type="button" onClick={props.addChild}> Add question </button>
                    <br />
                    <button id="deleteClass" type="button" onClick={() => props.deleteQuestion(props.number)}> Delete Last Question </button>
                    <br />
                    <input className="makeDomoSubmit" type="submit" value="Update Quiz" />

                </form>


            </div>
        );
    }
}

//displays the two tabs at the top  
const MenuUI = (props) => {
    return (
        <div id="headerUI">
            <button className="viewer" id="MakeClass" onClick={() => showMaker(props.csrf)}> Make Game </button>
            <button className="viewer" id="makeViews" onClick={() => showViewer(props.csrf)}> View Games </button>

        </div>
    );
};

//gets a users page and displays it 
const showUserPage = function (_id, csrf) {
    sendAjax('GET', '/getGames', null, (data) => {
        
        ReactDOM.render(
            <User csrf={csrf} games={data.games} />, document.querySelector("#domos")
        );
    });
};

//shows the page where a user can become a premium user When they click on the link set them to premium status
const showPaymentPage = function(){
    ReactDOM.render(
        <div>
        <h2> Become a premium user</h2>
        <p> Becoming a premium user provides a number of benafits that enhance your experence. Right now the main
            benafit is unlimmeted access to creating quizes, but in the future we plan to add more benifits to the premium experence.
        </p>
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" class="donate" target="_blank" id='PaymentButton'>
            <input type="hidden" name="cmd" value="_donations" />
            <input type="hidden" name="business" value="X7VSXQ32CJLK2" />
            <input type="hidden" name="currency_code" value="USD" />
            <input type="image" id='donateButton' src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!"
        alt="Donate with PayPal button" />
        </form>
    </div>, document.querySelector("#domos"), ()=>{
        document.getElementById('PaymentButton').onclick = () =>{
            
            getToken(setPremiumUser);
        };
    });
    
};

//sets a user as a premium user
const setPremiumUser = (csrf) => {
    
    
    sendAjax('POST', '/premium', `_csrf=${csrf}`, (newData) =>{
        console.log(newData);
    });
}

//
const showDonationPage = function(){
    ReactDOM.render(
        <div>
        <h2> Thanks you for supporting us</h2>
        <p> You have already supported us by becoming a premium user. If you would like to support this website more you can donate to help improve the website.
        </p>
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" class="donate" target="_blank" id='PaymentButton'>
        <input type="hidden" name="cmd" value="_donations" />
        <input type="hidden" name="business" value="X7VSXQ32CJLK2" />
        <input type="hidden" name="currency_code" value="USD" />
        <input type="image" id='donateButton' src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!"
        alt="Donate with PayPal button" />
    </form>
    </div>, document.querySelector("#domos")

    );

   
};

//searches through created games with several queries
const searchForGames =(e) =>{
    e.preventDefault();
    
    //If the min questions is more than the max questions print an error and return
    if(document.getElementById("minQuestions").value > document.getElementById("maxQuestions").value && document.getElementById("maxQuestions").value > -1){
        alert("Min questions must be less than max questions");
    }
    //otherwise search for games with the specified chriteria
    else{
    sendAjax('GET', '/searchGames', $("#searchForm").serialize(), (data) => {
        if(document.querySelector('#loadMore') !== null){
            document.querySelector('#loadMore').style.display = "none";
        }
        
        

        ReactDOM.render(
            <div>
            
            <SearchMenu csrf={Session_csrf} />
            <h3> {data.game.length} Quizes Found </h3>
            <ViewList id='gameViews' csrf={Session_csrf} games={data.game} />
            </div>, document.querySelector("#domos")
        );
    });
}
};


//creates the form to search for questions
const SearchMenu = (props) => {
    
    return  (
        <div id='searchDiv'>
            <h2> Quiz Search </h2>
        <form id="searchForm"
        onSubmit={searchForGames}
        >

            <label htmlFor='quizName'> Quiz Name: </label>
            <input type="textarea" name='quizName'/>
            <br/>
            <label htmlFor='userName'> User name: </label>
            <input type="textarea" name='userName'/>
            <br/>
            <label htmlFor='maxAttempts'> max number of attemps: </label>
            <input  type="number" id="maxAttempts" name="maxAttempts" min="-1" max="10" defaultValue="-1" />
            <br/>
            <label htmlFor='maxQuestions'> max number of Questions: </label>
            <input  type="number" id="maxQuestions" name="maxQuestions" min="-1" defaultValue="-1" />
            <br/>
            <label htmlFor='minQuestions'> min number of Questions: </label>
            <input  type="number" id="minQuestions" name="minQuestions" min="1" defaultValue="1" />
            <br/>
            <input type="submit"/> 
        </form>
        </div>
    );
}

//renders the maker link in the header
const MakerNav = (props) => {
    return (
            <a  id="makerNav" onClick={() => showMaker(props.csrf)}> Make a new Quiz </a>
    );
};

//run on init
const setup = function (csrf) {
    
   
    ReactDOM.render(
        <MakerNav csrf={csrf} />, document.querySelector("#makerLink")
    )
    


    //get all quizes and display them
    sendAjax('GET', '/getUsername', null, (data) => {
        console.log(data);
        ReactDOM.render(
            <h3 id="profile" onClick={() => showUserPage(data._id, csrf)}>{data.username}</h3>, document.querySelector("#userProfile")
        );

        sendAjax('GET', '/premium', null, (data) =>{
            console.log(data);
            if(data == true){
                
                document.getElementById('paymentLink').innerHTML = 'premium user';
                document.getElementById('paymentLink').onclick = showDonationPage;
                
            }
            else{
                document.getElementById('paymentLink').innerHTML = 'Go Premium';
                document.getElementById('paymentLink').onclick = showPaymentPage;
            }
           
        });

    });

    showViewer(csrf);
};

//gets the csrf token and runs a callback function with csrf
const getToken = (callback) => {
    sendAjax('GET', '/getToken', null, (result) => {
        Session_csrf = result.csrfToken;
        return callback( result.csrfToken);
    });
};


$(document).ready(function () {
    var csrf = getToken(setup);
    
});
