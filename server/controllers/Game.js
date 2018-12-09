const models = require('../models');
const Game = models.Game;

// displays the page with all the games after login
const makerPage = (req, res) => {
  Game.GameModel.getIntros(20, (err, docs) => {
    if (err) {
      return res.status(400).json({
        error: 'an error occoured',
      });
    }
    return res.render('app', {
      csrfToken: req.csrfToken(),
      games: docs,
    });
  });
};

// create a new game on the server
const createGame = (req, res) => {
  if (!req.body.name || req.body.count <= 0) {
    return res.status(400).json({
      error: 'A title and questions are requiored',
    });
  }


  const keys = Object.keys(req.body);

  const roundData = [];
  // for each question add the data
  for (let i = 0; i < req.body.count; i++) {
    roundData.push({
      question: req.body[keys[i * 6 + 4]],
      answer1: req.body[keys[i * 6 + 5]],
      answer2: req.body[keys[i * 6 + 6]],
      answer3: req.body[keys[i * 6 + 7]],
      answer4: req.body[keys[i * 6 + 8]],
      result: req.body[keys[i * 6 + 9]],

    });
  }
  // create the game
  const game = {
    name: req.body.name,
    rounds: roundData,
    creator: req.session.account._id,
    creatorUsername: req.session.account.username,
    maxAttempts: req.body.maxAttempts,
  };


  const newGame = new Game.GameModel(game);
  // simple promis for errors
  const gamePromise = newGame.save();
  gamePromise.then(() => res.json({
    redirect: '/maker',
  }));

  gamePromise.catch((err) => {
    console.log(err.errors);


    return res.status(400).json({
      error: 'An error occurred',
    });
  });


  return gamePromise;
};

// updaates a pre existing game
const updateGame = (req, res) => {
  if (!req.body.name || req.body.count === 0) {
    return res.status(400).json({
      error: 'A title and questions are requiored',
    });
  }

  // get all the data ase as make game
  const id = req.body._id;

  const keys = Object.keys(req.body);

  const roundData = [];

  for (let i = 0; i < req.body.count; i++) {
    roundData.push({
      question: req.body[keys[i * 6 + 5]],
      answer1: req.body[keys[i * 6 + 6]],
      answer2: req.body[keys[i * 6 + 7]],
      answer3: req.body[keys[i * 6 + 8]],
      answer4: req.body[keys[i * 6 + 9]],
      result: req.body[keys[i * 6 + 10]],

    });
  }


  const game = {
    name: req.body.name,
    rounds: roundData,
    creator: req.session.account._id,
    creatorUsername: req.session.account.username,
    maxAttempts: req.body.maxAttempts,
    attempts: [],
  };


  // find the game to update
  Game.GameModel.findById(id, (err, docs) => {
    // set it to the new game
    docs.set(game);

    docs.save((newErr, updatedGame) => {
      console.log(updatedGame);
    });
  });
  // note if the user immediately clicks the game it may not have time to update
  // return the game
  return res.json(game);
};

// gets the index of attemts that a user has made with a certian quiz
const findAttempt = (quiz, userID) => {
  for (let i = 0; i < quiz.attempts.length; i++) {
    if (String(userID) === String(quiz.attempts[i].player)) {
      return i;
    }
  }

  return -1;
};

// gets a specific quiz
const getQuiz = (req, res) => Game.GameModel.getQuiz(req.query._id, (err, docs) => {
  if (err) {
    console.log(err);
    return res.status(400).json({
      error: 'An error occured',
    });
  }


  // if the user is not the creater and has already done the quiz the max number
  // of times dont let them view the quiz
  if (String(docs.creator) !== String(req.session.account._id)) {
    if (docs.maxAttempts !== undefined) {
      if (docs.maxAttempts !== -1) {
        const attemptIndex = findAttempt(docs, req.session.account._id);

        if (attemptIndex !== -1) {
          if (docs.attempts[attemptIndex].scores.length >= docs.maxAttempts) {
            return res.json({
              valid: false,
            });
          }
        }
      }
    }
  }

  // if they can view it return true
  return res.json({
    valid: true,
    games: docs,
  });
});

// adds an attempt to the users page
const addAttempt = (userID, userName, gameID, game, score, callback) => {
  let index = -1;
  const newGame = game;
  // looks for a users index of attempst in a agame
  index = findAttempt(game, userID);

  // if they aren't in the attmpts add them
  if (index === -1) {
    console.log('new player');
    const attempt = {
      game: gameID,
      player: userID,
      attemptsTaken: 1,
      scores: [score],
      playerName: userName,

    };

    // if there are no attepmts set the first one otherwise add it to the end
    if (game.attempts.length === 0) {
      newGame.attempts = [attempt];
    } else {
      newGame.attempts = game.attempts.concat([attempt]);
    }
  } else {
    // otherwise add there new score to the back of there scores
    newGame.attempts[index].scores = game.attempts[index].scores.concat([score]);

    newGame.attempts[index].attemptsTaken = game.attempts[index].scores.length;
  }


  // save the attempts
  newGame.save((err, updatedGame) => {
    if (err) return callback(err, updatedGame);

    return callback(err, updatedGame);
  });
};

// updates a users score
const updateScore = (req, res) => {
  // find the game
  Game.GameModel.findById(req.body._id, (err, game) => {
    // add the attempt to the game
    addAttempt(req.session.account._id, req.session.account.username,
      req.body._id, game, req.body.score, (newErr, updatedGame) =>

      res.json(updatedGame));
  });
};

// checks the users answers for a quiz
const checkAnswers = (req, res) => {
  Game.GameModel.getAnswers(req.query._id, (err, docs) => {
    const totalPoints = docs.rounds.length;
    let score = 0;

    // loop through and get each answer
    for (let i = 1; i <= totalPoints; i++) {
      const ans = `q${i}`;

      // if the answer is correct increase there score
      if (req.query[ans] !== undefined) {
        if (String(req.query[ans]) === String(docs.rounds[i - 1].result)) {
          score++;
        }
      }
    }


    return res.json({
      score,
      maxScore: totalPoints,
    });
  });
};

// searches for a game and returns one
const searchGames = (req, res) => {
  Game.GameModel.getIntrosBySearch(req.query, (err, docs) => {
    const game = docs;
    return res.json({
      game,
    });
  });
};

// display all games by their intro aka name question length and title
const listGames = (req, res) => {
  const index = parseInt(req.query.startIndex, 10);

  Game.GameModel.getIntros(index, (err, docs) => {
    const game = docs;
    return res.json({
      game,
    });
  });
};

// gets all the data for a users games
const getGame = (req, res) => Game.GameModel.findByOwner(req.session.account._id, (err, docs) => {
  if (err) {
    return res.status(400).json({
      error: 'An error occured',
    });
  }

  return res.json({
    games: docs,
  });
});

module.exports.searchGames = searchGames;
module.exports.makerPage = makerPage;
module.exports.updateScore = updateScore;
module.exports.updateGame = updateGame;
module.exports.checkAnswers = checkAnswers;
module.exports.listGames = listGames;
module.exports.getQuiz = getQuiz;
module.exports.createGame = createGame;
module.exports.getGame = getGame;
