var mongoose = require('mongoose'),
  flash = require('connect-flash'),
  session = require('express-session'),
  methodOverride = require('method-override'),
  express = require('express'),
  passport = require('passport'),
  exphbs = require('express-handlebars'),
  bodyParser = require('body-parser'),
  bcrypt = require('bcryptjs');

const app = express();
const port = process.env.port || 3000;
const { ensureAuthenticated } = require('./helpers/aoth')

// Cartelle per la gestione delle risorse statiche (css, immagini, js, ecc..)
app.use('/css', express.static(__dirname + '/assets/css'));
app.use('/images', express.static(__dirname + '/assets/images'));

// Config passport
require('./config/passport')(passport);

// Config database
const db = require('./config/database');

mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI)
  .then(() => console.log('DataBase connesso!'))
  .catch(err => console.log(err));

require('./models/user');
var Users = mongoose.model('Users');

// Handlebars middleware
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// BodyParser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Override middleware
app.use(methodOverride('_method'));

// Session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash middleware
app.use(flash());

// Flash message global variables
app.use((req, res, next) => {
  res.locals.msg_successo = req.flash('success_msg');
  res.locals.msg_errore = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user;
  next();
});

app.get('/', function (req, res) {
  let title = "Welcome";
  res.render('index', { title: title });
});

app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));
app.get('/note', ensureAuthenticated, (req, res) => res.render('note'));

// Gestione form di registrazione
app.post('/register', (req, res) => {
  let errors = [];

  if (!req.body.nome) {
    errors.push({ text: "Manca il nome!" })
  }
  if (!req.body.email) {
    errors.push({ text: "Manca la mail!" })
  }
  if (req.body.password != req.body.confirm_password) {
    errors.push({ text: "Le password non coincidono!" })
  }
  if (req.body.password.length < 6) {
    errors.push({ text: 'La password deve avere almeno 6 caratteri' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors: errors,
      nome: req.body.nome,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.confirm_password
    })
  } else {

    Users.findOne({ email: req.body.email })
      .then(user => {
        if (user) {
          req.flash('error_msg', 'Questa mail è già registrata!');
          req.render('register');
        } else {
          var newUser = new Users({
            nome: req.body.nome,
            email: req.body.email,
            password: req.body.password
          });

          bcrypt.genSalt(12, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser.save()
                .then(user => {
                  req.flash('success_msg', 'La registrazione è andata a buon fine!');
                  res.redirect('login');
                })
                .catch(err => {
                  console.log(err);
                  return;
                })
            })
          });

        }
      })
  }
});

// Gestione form Login
app.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

// Gestione logout
app.get('logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'Ti sei appena disconnesso! Alla prossima');
  res.redirect('/');
})

app.listen(port, () => {
  console.log("Server ok sulla porta:" + port);
});
