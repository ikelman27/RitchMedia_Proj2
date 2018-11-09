const models = require('../models');
const Game = models.Game;
// const account = models.Account;

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
      question: req.body[keys[i * 6 + 3]],
      answer1: req.body[keys[i * 6 + 4]],
      answer2: req.body[keys[i * 6 + 5]],
      answer3: req.body[keys[i * 6 + 6]],
      answer4: req.body[keys[i * 6 + 7]],
      result: req.body[keys[i * 6 + 8]],

    });
  }
  console.log(roundData);


  const game = {
    name: req.body.name,
    rounds: roundData,
    creator: req.session.account._id,
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
      question: req.body[keys[i * 6 + 4]],
      answer1: req.body[keys[i * 6 + 5]],
      answer2: req.body[keys[i * 6 + 6]],
      answer3: req.body[keys[i * 6 + 7]],
      answer4: req.body[keys[i * 6 + 8]],
      result: req.body[keys[i * 6 + 9]],

    });
  }
  // console.log(roundData);


  const game = {
    name: req.body.name,
    rounds: roundData,
    creator: req.session.account._id,
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

const getQuiz = (req, res) => Game.GameModel.getQuiz(req.query._id, (err, docs) => {
  if (err) {
    console.log(err);
    return res.status(400).json({
      error: 'An error occured',
    });
  }


  return res.json({
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
          console.log('test');
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


module.exports.updateGame = updateGame;
module.exports.checkAnswers = checkAnswers;
module.exports.listGames = listGames;
module.exports.getQuiz = getQuiz;
module.exports.createGame = createGame;
module.exports.getGame = getGame;
