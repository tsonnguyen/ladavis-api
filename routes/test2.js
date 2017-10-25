var fs = require('fs');
var csv = require('fast-csv');
var ml = require('machine_learning');
var HiddenLayer = require('machine_learning/lib/HiddenLayer');

var dataArray = [];
var labelArray = [];

csv.fromPath('data/mimic-test.csv')
	.on('data', function (csvRow) {
		if (isNaN(Number(csvRow[0]))) return;

		for (var i in csvRow) {
			csvRow[i] = Number(csvRow[i]);
		}

		var label = csvRow[csvRow.length - 1];
		csvRow.splice(-1, 1);

		dataArray.push(csvRow.slice());
		labelArray.push(label);
	})
	.on('end', function () {
		fs.readFile('/mlpnewest', 'utf8', function (err, data) {
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
      
			var TP = 0, FN = 0, FP = 0, TN = 0, count = 0;
			for (let i in dataArray) {
				if (isNaN(Number(labelArray[i]))) continue;
        
				var predict = detector.predict([dataArray[i]])[0];
				var dis1 = predict[0];
				var dis2 = predict[1];
  
				if (Number(labelArray[i]) === 1) {
					if (dis1 > dis2) {
						count++;
						TN++;
					} else {
						FP++;
					}
				} else {
					if (dis1 < dis2) {
						count++;
						TP++;
					} else {
						FN++;
					}
				}
			}
			console.log('done');
			console.log('TP:' + TP);
			console.log('FN:' + FN);
			console.log('FP:' + FP);
			console.log('TN:' + TN);
			console.log(count / 222);
		});
	});