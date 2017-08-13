var promise = require('bluebird');

var pgp = require('pg-promise')({
	// Initialization Options
	promiseLib: promise
});

var dbInfo = {
	username: 'postgres',
	password: '1234',
	dbname: 'mimic'
};
var connectionString = 'postgres://' + dbInfo.username + ':' + dbInfo.password 
											+ '@localhost:5432/' + dbInfo.dbname;
var db = pgp(connectionString);

module.exports = {
	db: db
};

