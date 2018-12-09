

// most of this was pre done in domomaker

const models = require('../models');
const Account = models.Account;

const loginPage = (req, res) => {
  res.render('login', {
    csrfToken: req.csrfToken(),
  });
};

// render the 404 page
const notFound = (req, res) => {
  res.render('404');
};
const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (request, response) => {
  const req = request;
  const res = response;

  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  if (!username || !password) {
    return res.status(400).json({
      error: 'All fields are required',
    });
  }

  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({
        error: 'wrong username or password',
      });
    }

    req.session.account = Account.AccountModel.toAPI(account);
    return res.json({
      redirect: '/maker',
    });
  });
};


const signup = (request, response) => {
  const req = request;
  const res = response;


  req.body.username = `${req.body.username}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;

  if (!req.body.username || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({
      error: 'All fields are required',
    });
  }

  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({
      error: 'Passwords must be the same',
    });
  }


  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    const accountData = {
      username: req.body.username,
      salt,
      password: hash,
    };

    const newAccount = new Account.AccountModel(accountData);
    const savePromise = newAccount.save();

    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(newAccount);
      return res.json({
        redirect: '/maker',
      });
    });

    savePromise.catch((err) => {
      if (err.code === 11000) {
        return res.status(400).json({
          error: 'Username already in use',
        });
      }

      return res.status(400).json({
        error: 'An error occurred',
      });
    });
  });
};


const getPremium = (req, res) => {
  Account.AccountModel.findById(req.session.account, (err, user) => {
    res.json(user.premiumUser);
  });
};

const setPremium = (req, res) => {
  Account.AccountModel.findById(req.session.account, (err, user) => {
    const newUser = user;
    newUser.premiumUser = true;
    newUser.save((error, updatedUser) => {
      res.json(updatedUser.premiumUser);
    });
  });
};

// gets a username
const getUsername = (req, res) => {
  res.json(req.session.account);
};

const getToken = (request, response) => {
  const req = request;
  const res = response;

  const csrfJSON = {
    csrfToken: req.csrfToken(),
  };

  res.json(csrfJSON);
};

module.exports.setPremium = setPremium;
module.exports.getPremium = getPremium;
module.exports.notFound = notFound;
module.exports.getUsername = getUsername;
module.exports.loginPage = loginPage;
module.exports.login = login;
module.exports.logout = logout;
module.exports.getToken = getToken;
module.exports.signup = signup;
