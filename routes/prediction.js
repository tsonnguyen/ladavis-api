var fs = require('fs');

var ml = require('machine_learning');
var HiddenLayer = require('machine_learning/lib/HiddenLayer');
var knnClassifier;
var mlpClassifier;

var bayes = require('bayes');
var bayesClassifier = bayes({
	tokenizer: function (data) { return data; }
});

var csv = require('fast-csv');
var dataArray = [];
var labelArray = [];

var right = 0;
var wrong = 0;

csv.fromPath('data/pima-diabetes.csv')
	.on('data', function (csvRow) {
		if (isNaN(Number(csvRow[0]))) return;

		var label = csvRow[csvRow.length - 1];
		csvRow.splice(-1, 1);

		var traningData;
		traningData = csvRow;
		// traningData = [csvRow[0], csvRow[1], csvRow[4], csvRow[5], csvRow[6]];

		dataArray.push(csvRow);
		//labelArray.push(label);
		if (Number(label) === 1) {
			labelArray.push([1, 0]);
		} else {
			labelArray.push([0, 1]);
		}

		// Bayesian Network
		// if (Number(dataArray.length) < 500) {
		// 	bayesClassifier.learn(traningData, label);
		// } else {
		// 	if (Number(bayesClassifier.categorize(traningData)) === Number(label)) {
		// 		right++;
		// 	} else {
		// 		wrong++;
		// 	}
		// }

		// K-Nearest Neighbor
		// if (Number(dataArray.length) === 500) {
		// 	knnClassifier = new ml.KNN({
		// 		data : dataArray,
		// 		result : labelArray
		// 	}) ;
		// } else if (Number(dataArray.length) > 500) {
		// 	var y = knnClassifier.predict({
		// 		x : traningData,
		// 		k : 3,
		// 		weightf : {type : 'gaussian', sigma : 10.0},
		// 		distance : {type : 'euclidean'}
		// 	});
		// 	if (Number(y) === Number(label)) {
		// 		right++;
		// 	} else {
		// 		wrong++;
		// 	}
		// }
	})
	.on('end', function () {
		mlpClassifier = new ml.MLP({
			input: dataArray.slice(0, 10),
			label: labelArray.slice(0, 10),
			n_ins: 8,
			n_outs: 2,
			hidden_layer_sizes: [4, 4, 5]
		});
		mlpClassifier.set('log level', 1); // 0 : nothing, 1 : info, 2 : warning.

		// mlpClassifier.train({
		// 	lr : 0.6,
		// 	epochs : 20000
		// });

		// fs.writeFile('/test', JSON.stringify(mlpClassifier), function(err) {
		// 	if(err) {
		// 		return console.log(err);
		// 	}
		// 	console.log("The file was saved!");
		// }); 

		fs.readFile('/test', 'utf8', function (err, data) {
			if (err) {
				return console.log(err);
			}
			var detector = new ml.MLP({
				'input': [[1, 0], [0, 1]],
				'label': [[0, 1], [1, 0]],
				'n_ins': 2,
				'n_outs': 2,
				'hidden_layer_sizes': [5]
			});

			data = JSON.parse(data);
			// Then overwrite all properties with what is saved in data variable    
			detector.x = data.x; // comment out if you won't train
			detector.y = data.y; // comment out if you won't train
			detector.nLayers = data.nLayers;
			detector.settings = data.settings;
			detector.sigmoidLayers = new Array(data.sigmoidLayers.length);
			for (var i in data.sigmoidLayers) {
				// Here you cannot lie, use same values than in detector.settings
				// Create a HiddenLayer use its constructor to ensure we end with the correct type
				detector.sigmoidLayers[i] = new HiddenLayer({
					'n_ins': detector.settings['n_ins'],
					'n_outs': detector.settings['n_outs']
				});

				// restore all properties of each HiddenLayer
				for (var p in data.sigmoidLayers[i]) {
					detector.sigmoidLayers[i][p] = data.sigmoidLayers[i][p];
				}
			}
			console.log(detector.predict([dataArray[2]]))
			console.log(([labelArray[2]]))
		});

		//console.log(JSON.stringify(mlpClassifier))

		// for (var i in dataArray) {
		// 	if (Number(i) > 500) {
		// 		var y = mlpClassifier.predict([dataArray[i]]);
		// 		// console.log('s')
		// 		// console.log(y[0][0] > y[0][1]);
		// 		// console.log(y[0][0]);
		// 		// console.log(y[0][1]);
		// 		// console.log(labelArray[i])
		// 		// console.log('e')

		// 		if ((Number(labelArray[i][0]) === 1 && y[0][0] > y[0][1]) || (Number(labelArray[i][0]) === 0 && y[0][0] < y[0][1])) {
		// 			right++;
		// 		} else {
		// 			wrong++;
		// 		}
		// 	}
		// }

		console.log(right);
		console.log(wrong);
	});

module.exports = {
	bayesClassifier: bayesClassifier
};
