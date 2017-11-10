var fs = require('fs');
var path = require('path');
var csv = require('fast-csv');
var bayes = require('bayes');

var dataArray = [];
var labelArray = [];
var numOfFeatures = Number(process.argv[2]);

console.log('BAYES MIMIC TESTING\n');

csv.fromPath('data/new-mimic-test.csv')
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

		fs.readFile(path.resolve('./predict_models/' + folderName + '/bayes.model'), 'utf8', function (err, data) {
			if (err) { return console.log(err); }
			
			var clusters = JSON.parse(data);
			var bayesClassifier = bayes.fromJson(clusters);
			bayesClassifier.tokenizer = function (data) { return data; };
			// bayesClassifier.options = clusters.options;
			// bayesClassifier.vocabulary = clusters.vocabulary;
			// bayesClassifier.docCount = clusters.docCount;
			// bayesClassifier.wordCount = clusters.wordCount;
			// bayesClassifier.wordFrequencyCount = clusters.wordFrequencyCount;
			// bayesClassifier.categories = clusters.categories;

			var TP = 0, FN = 0, FP = 0, TN = 0, count = 0;
			for (let i in dataArray) {
				if (isNaN(Number(labelArray[i]))) continue;
				
				var result = bayesClassifier.categorize(dataArray[i]);
				if (Number(labelArray[i]) === 0) {
					if (Number(result) < 0) {
						count++;
						TN++;
					} else {
						FP++;
					}
				} else {
					if (Number(result) > 0) {
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
			console.log('precision:' + 100 * precision.toFixed(4));
			console.log('recall:' + 100 * recall.toFixed(4));
			console.log('f1-measure:' + 100 * f1.toFixed(4));
			console.log('accuracy ' + (count / dataArray.length).toFixed(4));
			console.log('\n');
		});
	});