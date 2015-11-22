var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', require('./peticion'));

router.get('/genpet', require('./genpet'));

module.exports = router;