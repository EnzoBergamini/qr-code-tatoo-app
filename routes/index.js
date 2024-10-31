var express = require('express');
const { route } = require('../app');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/api/link', function (req, res, next) {
  const url = req.body.url;
  const db = req.app.get('db');

  db.run('INSERT INTO links(url) VALUES(?)', [url], function (err) {
    if (err) {
      return next(err);
    }

    res.json({ id: this.lastID, url: url });
  });
});



module.exports = router;
