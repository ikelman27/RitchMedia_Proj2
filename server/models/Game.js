

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let GameModel = {};
const _ = require('underscore');
const convertId = mongoose.Types.ObjectId;
const setName = (name) => _.escape(name).trim();

// stores an attempt
const PlaySchema = new mongoose.Schema({

  game: {
    type: mongoose.Schema.ObjectId,
    ref: 'Game',
  },

  player: {
    type: mongoose.Schema.ObjectId,
    ref: 'Account',
  },

  playerName: {
    type: String,
    trim: true,
    default: 'unknown',
  },

  attemptsTaken: {
    type: Number,
    default: 0,
  },

  attemptDate: {
    type: Date,
    default: Date.now,
  },

  scores: {
    type: [Number],
  },


});

// scores a single question
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


// scores all the data for the game
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

  creatorUsername: {
    type: String,
    trim: true,
    default: 'unknown',
  },

  createdData: {
    type: Date,
    default: Date.now,
  },

  maxAttempts: {
    type: Number,
    default: -1,
  },

  attempts: {
    type: [PlaySchema],
  },


});


GameSchema.statics.getAnswers = (id, callback) =>
GameModel.findById(id, 'rounds.result').exec(callback);


GameSchema.statics.getAllAttemtps = (id, callback) =>
GameModel.findById(id, 'attempts').exec(callback);


// returns the name rounds and creator
GameSchema.statics.getIntros = (id, callback) => GameModel.aggregate([{
  $project: {
    name: '$name',
    length: {
      $size: '$rounds',
    },
    creator: '$creator',
    creatorUsername: '$creatorUsername',
  },
}]).exec(callback);

// gets the data for a single quiz to take
GameSchema.statics.getQuiz = (id, callback) => GameModel.findById(id,
'name creator rounds.question rounds.answer1 rounds.answer2 rounds.answer3 \n' +
'rounds.answer4 creator attempts maxAttempts').exec(callback);

// gets all games from one person
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
