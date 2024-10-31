var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();

// Sqlite3 database
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/mydatabase.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the mydatabase database.');
});

app.set('db', db);

// create a table if it does not exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS links 
        (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        url TEXT, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // if the table is empty, insert a row
    db.get('SELECT COUNT(*) as count FROM links', (err, row) => {
        if (row.count === 0) {
            db.run('INSERT INTO links (url) VALUES (?)', ['https://www.google.com']);
        } else {
            db.get('SELECT * FROM links ORDER BY id DESC LIMIT 1', (err, row) => {
                app.set('currentLink', row.url);
            });
        }
    });

});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler for invalid routes
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// close the database connection when the app is terminated
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the database connection.');
        process.exit(0);
    });
});

module.exports = app;