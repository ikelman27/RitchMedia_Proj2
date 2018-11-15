const models = require('../models');
const Game = models.Game;
// const account = models.Account;

const makerPage = (req, res) => {
  Game.GameModel.getIntros(null, (err, docs) => {
    if (err) {
      console.log(err);
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


const createGame = (req, res) => {
  if (!req.body.name || req.body.count === 0) {
    return res.status(400).json({
      error: 'A title and questions are requiored',
    });
  }
  // console.log("<____________________________________________________________>");
  const keys = Object.keys(req.body);
  // console.dir("#Questions " + req.body.count);
  const roundData = [];

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
  // console.log(roundData);

  console.log();

  const game = {
    name: req.body.name,
    rounds: roundData,
    creator: req.session.account._id,
    creatorUsername: req.session.account.username,
    maxAttempts: req.body.maxAttempts,
  };


  const newGame = new Game.GameModel(game);

  const gamePromise = newGame.save();
  gamePromise.then(() => res.json({
    redirect: '/maker',
  }));

  gamePromise.catch((err) => {
    console.log(err);

    if (err.code === 11000) {
      return res.status(400).json({
        error: 'Username already in use',
      });
    }

    return res.status(400).json({
      error: 'An error occurred',
    });
  });


  return gamePromise;
};

const updateGame = (req, res) => {
  if (!req.body.name || req.body.count === 0) {
    return res.status(400).json({
      error: 'A title and questions are requiored',
    });
  }

  const id = req.body._id;

  const keys = Object.keys(req.body);
  // console.dir("#Questions " + req.body.count);
  const roundData = [];
  // console.log(req.body);
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
  // console.log(roundData);


  const game = {
    name: req.body.name,
    rounds: roundData,
    creator: req.session.account._id,
    creatorUsername: req.session.account.username,
    maxAttempts: req.body.maxAttempts,
    attempts: [],
  };


  Game.GameModel.findById(id, (err, docs) => {
    // const update = new GameModel(newGame);

    docs.set(game);

    docs.save((newErr, updatedGame) => {
      console.log(updatedGame);
    });
  });


  return res.json(game);
};

const findAttempt = (quiz, userID) => {
  // console.log(quiz);
  console.log(quiz.attempts);
  for (let i = 0; i < quiz.attempts.length; i++) {
    console.log(`${quiz.attempts[i].player}   ${userID}`);
    if (String(userID) === String(quiz.attempts[i].player)) {
      return i;
    }
  }

  return -1;
};


const getQuiz = (req, res) => Game.GameModel.getQuiz(req.query._id, (err, docs) => {
  if (err) {
    console.log(err);
    return res.status(400).json({
      error: 'An error occured',
    });
  }

  // console.log(docs.maxAttempts);

  if (String(docs.creator) !== String(req.session.account._id)) {
    if (docs.maxAttempts !== undefined) {
      if (docs.maxAttempts !== -1) {
        const attemptIndex = findAttempt(docs, req.session.account._id);
        // console.log(attemptIndex);
        console.log(attemptIndex);
        if (attemptIndex !== -1) {
          if (docs.attempts[attemptIndex].scores.length >= docs.maxAttempts) {
            return res.json({
              valid: false,
            });
          }
          // todo prevent users from going above max attempts
        }
      }
    }
  }


  return res.json({
    valid: true,
    games: docs,
  });

  /*
  game = docs;

  const username = account.AccountModel.findUsername(docs.creator, (err, docs) => {

      return res.json({
        game: game,
        username: docs.username,
      });
    }

  );
  */
});


const addAttempt = (userID, userName, gameID, game, score, callback) => {
  let index = -1;
  const newGame = game;
  index = findAttempt(game, userID);

  if (index === -1) {
    console.log('new player');
    const attempt = {
      game: gameID,
      player: userID,
      attemptsTaken: 1,
      scores: [score],
      playerName: userName,

    };

    if (game.attempts.length === 0) {
      newGame.attempts = [attempt];
    } else {
      newGame.attempts = game.attempts.concat([attempt]);
    }
    // console.log(game);
  } else {
    // console.log(game.attempts[index]);

    newGame.attempts[index].scores = game.attempts[index].scores.concat([score]);
    // console.log(game.attempts[index]);
    newGame.attempts[index].attemptsTaken = game.attempts[index].scores.length;
  }

  // console.log('new game created');


  newGame.save((err, updatedGame) => {
    if (err) return callback(err, updatedGame);

    return callback(err, updatedGame);
  });
};

const updateScore = (req, res) => {
  // console.log(req.body);
  Game.GameModel.findById(req.body._id, (err, game) => {
    // console.log(game);
    addAttempt(req.session.account._id, req.session.account.username,
      req.body._id, game, req.body.score, (newErr, updatedGame) =>
      // console.log(err);
      res.json(updatedGame));
  });
};

const checkAnswers = (req, res) => {
  Game.GameModel.getAnswers(req.query._id, (err, docs) => {
    const totalPoints = docs.rounds.length;
    let score = 0;

    for (let i = 1; i <= totalPoints; i++) {
      const ans = `q${i}`;

      console.log(req.query[ans]);
      console.log(docs.rounds[i - 1].result);
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


const listGames = (req, res) => Game.GameModel.getIntros(null, (err, docs) => {
  const game = docs;
  return res.json({
    game,
  });
  /* console.log(docs[0]);
  const username = account.AccountModel.findUsername(docs, (err, docs) => {
    console.log("usernames " + docs);


  });*/
});


const getGame = (req, res) => Game.GameModel.findByOwner(req.session.account._id, (err, docs) => {
  if (err) {
    console.log(err);
    return res.status(400).json({
      error: 'An error occured',
    });
  }
  // console.log(docs);
  return res.json({
    games: docs,
  });
});

module.exports.makerPage = makerPage;
module.exports.updateScore = updateScore;
module.exports.updateGame = updateGame;
module.exports.checkAnswers = checkAnswers;
module.exports.listGames = listGames;
module.exports.getQuiz = getQuiz;
module.exports.createGame = createGame;
module.exports.getGame = getGame;
