var express = require('express');
var router = express.Router();

var api = require('./api');

var rootPath = '/ladavis/rest-api/';

router.get('/', function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
	res.setHeader('Access-Control-Allow-Credentials', true); // If needed

	res.send('cors problem fixed:)');
});
router.get(rootPath + 'all-patients', api.getAllPatients);
router.get(rootPath + 'patient/:id?', api.getPatient);

module.exports = router;