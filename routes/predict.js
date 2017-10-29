var fs = require('fs');
var path = require('path');
var ml = require('machine_learning');
var HiddenLayer = require('machine_learning/lib/HiddenLayer');
var figue = require('../lib/figue').figue;

function transformInput(data, numOfFeatures) {
	if (numOfFeatures === 4) {
		return [
			data.glucose,
			data.insulin,
			data.weight / (data.height * data.height / 10000),
			data.age
		];
	} else if (numOfFeatures === 5) {
		return [
			data.pregnant,
			data.glucose,
			data.diastolic,
			data.weight / (data.height * data.height / 10000),
			data.age
		];
	} else if (numOfFeatures === 8) {
		return [
			data.pregnant,
			data.glucose,
			data.diastolic,
			data.skin,
			data.insulin,
			data.weight / (data.height * data.height / 10000),
			data.predigree,
			data.age
		];
	}
}

function predictFCM(dataArray, numOfFeatures){
	let folderName = numOfFeatures + '-features';

	var data = fs.readFileSync(path.resolve('./predict_models/' + folderName + '/fuzzycmeans.model'), 'utf8');
	var clusters = JSON.parse(data);
	var result = [];

	for (let i in dataArray) {
		var inputData = transformInput(dataArray[i], numOfFeatures);

		var dis1 = figue.euclidianDistance(clusters[0], inputData);
		var dis2 = figue.euclidianDistance(clusters[1], inputData);

		if (dis1 > dis2) {
			result.push(dataArray[i].time);
		}
	}

	return result;
}

function predictNN(dataArray, numOfFeatures){
	let folderName = numOfFeatures + '-features';

	var data = fs.readFileSync(path.resolve('./predict_models/' + folderName + '/mlpnn.model'), 'utf8');
	data = JSON.parse(data);

	var detector = new ml.MLP({
		'input': [[1, 0], [0, 1]],
		'label': [[0, 1], [1, 0]],
		'n_ins': 2,
		'n_outs': 2,
		'hidden_layer_sizes': [5]
	});
	detector.x = data.x; 
	detector.y = data.y;
	detector.nLayers = data.nLayers;
	detector.settings = data.settings;
	detector.sigmoidLayers = new Array(data.sigmoidLayers.length);
	for (var i in data.sigmoidLayers) {
		detector.sigmoidLayers[i] = new HiddenLayer({
			'n_ins': detector.settings['n_ins'],
			'n_outs': detector.settings['n_outs']
		});

		for (var p in data.sigmoidLayers[i]) {
			detector.sigmoidLayers[i][p] = data.sigmoidLayers[i][p];
		}
	}
	var result = [];

	for (let i in dataArray) {
		var inputData = transformInput(dataArray[i], numOfFeatures);

		var predict = detector.predict([inputData])[0];
		var dis1 = predict[0];
		var dis2 = predict[1];

		if (dis1 < dis2) {
			result.push(dataArray[i].time);
		}
	}

	return result;
}

module.exports = {
	predictFCM: predictFCM,
	predictNN: predictNN
};

