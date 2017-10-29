var fs = require('fs');
var path = require('path');
var csv = require('fast-csv');
var figue = require('../lib/figue').figue;

var dataArray = [];
var labelArray = [];
var numOfFeatures = Number(process.argv[2]);

csv.fromPath('data/pima-diabetes.csv')
	.on('data', function (csvRow) {
		if (isNaN(Number(csvRow[0]))) return;

		for (var i in csvRow) {
			csvRow[i] = Number(csvRow[i]);
		}

		var label = csvRow[csvRow.length - 1];
		csvRow.splice(-1, 1);

		if (numOfFeatures === 4) {
			csvRow = [
				csvRow[1],
				csvRow[4],
				csvRow[5],
				csvRow[7]
			];
		} else if (numOfFeatures === 5) {
			csvRow = [
				csvRow[0],
				csvRow[1],
				csvRow[2],
				csvRow[5],
				csvRow[7]
			];
		} 

		dataArray.push(csvRow.slice());
		labelArray.push(label);
	})
	.on('end', function () {
		if (numOfFeatures !== 4 && numOfFeatures !== 5 && numOfFeatures !== 8) {
			console.log('Invalid number of features (4, 5 or 8)');
			console.log('\n');
			return;
		}

		var folderName = numOfFeatures + '-features';

		fs.readFile(path.resolve('./predict_models/' + folderName + '/fuzzycmeans.model'), 'utf8', function (err, data) {
			if (err) { return console.log(err); }
			
			var clusters = JSON.parse(data);
			console.log(clusters)
	
			var TP = 0, FN = 0, FP = 0, TN = 0, count = 0;
			for (let i in dataArray) {
				if (isNaN(Number(labelArray[i]))) continue;
				
	
				var dis1 = figue.euclidianDistance(clusters[0], dataArray[i]);
				var dis2 = figue.euclidianDistance(clusters[1], dataArray[i]);
	
				if (Number(labelArray[i]) === 0) {
					if (dis1 < dis2) {
						count++;
						TN++;
					} else {
						FP++;
					}
				} else {
					if (dis1 > dis2) {
						count++;
						TP++;
					} else {
						FN++;
					}
				}
			}
	
			var precision = TP / (TP + FP);
			var recall = TP / (TP + FN);
			var f1 = 2 * precision * recall / (precision + recall);
			console.log('---------------------');
			console.log('done');
			console.log('TP:' + TP);
			console.log('FN:' + FN);
			console.log('FP:' + FP);
			console.log('TN:' + TN);
			console.log('precision:' + precision.toFixed(2));
			console.log('recall:' + recall.toFixed(2));
			console.log('f1-measure:' + f1.toFixed(2));
			console.log('accuracy ' + (count / dataArray.length).toFixed(2));
			console.log('\n');
		});
	});