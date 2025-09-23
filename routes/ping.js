
var express = require('express');

var router = express.Router();

router.get('/', function(req, res) {
  res.json({ ok: true, message: 'pong', time: new Date().toISOString() });
});

module.exports = router;
