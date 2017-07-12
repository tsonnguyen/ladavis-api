var express = require('express');
var router = express.Router();

var api = require('./api');

var rootPath = '/ladavis/rest-api/';

router.get(rootPath + 'all-patients', api.getAllPatients);
router.get(rootPath + 'patient/:id?', api.getPatient);

module.exports = router;