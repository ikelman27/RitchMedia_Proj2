const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.post('/premium', mid.requiresLogin, controllers.Account.setPremium);
  app.get('/premium', mid.requiresLogin, controllers.Account.getPremium);
  app.post('/updateScore', mid.requiresLogin, controllers.Game.updateScore);
  app.post('/updateGame', mid.requiresLogin, controllers.Game.updateGame);
  app.get('/getUsername', mid.requiresLogin, controllers.Account.getUsername);
  app.get('/checkAnswers', mid.requiresLogin, controllers.Game.checkAnswers);
  app.get('/listGames', mid.requiresLogin, controllers.Game.listGames);
  app.get('/getToken', mid.requireSecure, controllers.Account.getToken);
  app.get('/getQuiz', mid.requiresLogin, controllers.Game.getQuiz);
  app.get('/getGames', mid.requiresLogin, controllers.Game.getGame);
  app.post('/createGame', mid.requireSecure, controllers.Game.createGame);
  app.get('/login', mid.requireSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requireSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requireSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/maker', mid.requiresLogin, controllers.Game.makerPage);

  app.get('/', mid.requireSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.get('/*', controllers.Account.notFound);
};

module.exports = router;
