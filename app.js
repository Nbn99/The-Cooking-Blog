const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const methodOverride = require('method-override'); //sprawdzić co to robi
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const multer = require('multer');


const errorController = require('./controllers/error');
const User = require('./models/users');

const port = process.env.PORT || 3030;
const MONGODB_URI = 'mongodb+srv://Ja:JaJa@cluster0.kihplyg.mongodb.net/blog_1?retryWrites=true&w=majority'


const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

const articleRouter = require('./routes/articles');
const usersRouter = require('./routes/users')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use(flash());

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});



app.use('/articles', articleRouter);
app.use('/users', usersRouter);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(app.listen(port, () => {
    console.log(`listening on port ${port}`);
    console.log('connected');
  }));

