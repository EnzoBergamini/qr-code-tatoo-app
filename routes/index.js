var express = require('express');
const { route } = require('../app');
var router = express.Router();

router.get('/', function (req, res, next) {
  const db = req.app.get('db');

  db.get('SELECT * FROM links ORDER BY created_at DESC LIMIT 1', function (err, row) {
    if (err) {
      return next(err);
    }

    const url = row.url != undefined ? row.url : "https://caca.com";

    res.render('index', { url: url });
  });
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
