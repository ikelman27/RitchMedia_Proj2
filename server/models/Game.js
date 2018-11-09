const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let GameModel = {};
const _ = require('underscore');
const convertId = mongoose.Types.ObjectId;
const setName = (name) => _.escape(name).trim();

const RoundSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,

  },

  answer1: {
    type: String,
    required: true,
    trim: true,
  },

  answer2: {
    type: String,
    required: true,
    trim: true,
  },

  answer3: {
    type: String,
    required: true,
    trim: true,
  },

  answer4: {
    type: String,
    required: true,
    trim: true,
  },

  result: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
  },
  creator: {
    type: mongoose.Schema.ObjectId,
    // required: true,
    ref: 'Account',
  },

  createdData: {
    type: Date,
    default: Date.now,
  },

});


// commented out for use in project
const GameSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },

  rounds: [RoundSchema],

  creator: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },

  createdData: {
    type: Date,
    default: Date.now,
  },

});

GameSchema.statics.getAnswers = (id, callback) =>
GameModel.findById(id, 'rounds.result').exec(callback);

/*
GameSchema.statics.updateGame = (id, newGame, callback) => {
  GameModel.findById(id, (err, docs) => {
    // const update = new GameModel(newGame);

    docs.set(newGame);

    return newGame;
  });
  // return null;
};
*/
GameSchema.statics.getIntros = (id, callback) => GameModel.aggregate([{
  $project: {
    name: '$name',
    length: {
      $size: '$rounds',
    },
    creator: '$creator',
  },
}]).exec(callback);
// return GameModel.aggregate([{$project:
// { _id: {$match:}, itemCount: {$size: '$rounds'}}}]).exec(callback);

GameSchema.statics.getQuiz = (id, callback) => GameModel.findById(id,
'name rounds.question rounds.answer1 rounds.answer2 rounds.answer3 \n' +
'rounds.answer4 creator').exec(callback);

GameSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    creator: convertId(ownerId),
  };
  return GameModel.find(search).select().exec(callback);
};


GameModel = mongoose.model('Game', GameSchema);

module.exports.GameModel = GameModel;
module.exports.GameSchema = GameSchema;
module.exports.RoundSchema = RoundSchema;
