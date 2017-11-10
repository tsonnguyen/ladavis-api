var fs = require('fs');
var csv = require('fast-csv');
var ml = require('machine_learning');

var stratifiyData =  require('../lib/dataTransfrom').stratifiyData;

var posDataArray = [];
var negDataArray = [];
var posLabelArray = [];
var negLabelArray = [];
var numOfFeatures = Number(process.argv[2]);
var numOfDataSet = Number(process.argv[3]);
var numOfTraining = Number(process.argv[4]);
var numOfK = Number(process.argv[5]);

console.log('TRAINING KNN\n');

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

		if (Number(label) === 0) {
			negDataArray.push(csvRow.slice());
			negLabelArray.push(-1);
		} else {
			posDataArray.push(csvRow.slice());
			posLabelArray.push(1);
		}
	})
	.on('end', function () {
		if (numOfFeatures !== 4 && numOfFeatures !== 5 && numOfFeatures !== 8) {
			console.log('Invalid number of features (4, 5 or 8)');
			console.log('\n');
			return;
		}

		var finalClusters;
		var best1 = 0, best2 = 0;
		var TP = 0, FN = 0, FP = 0, TN = 0;

		for (var l = 0; l < numOfDataSet; l++) {
			var preProcessDataLabel = stratifiyData(posDataArray, negDataArray, posLabelArray, negLabelArray, 1);
			var dataArray = preProcessDataLabel.dataArray;
			var labelArray = preProcessDataLabel.labelArray;

			if (l % 100 === 0) {
				console.log('Data no. ' + l);
				console.log('\tData length: ' + dataArray.length);
				console.log('\tFirst Data: ' + dataArray[0]);
				console.log('\tFirst Label: ' + labelArray[0]);
			}

			for (var j = 0; j < numOfTraining; j++) {
				// if (l % 10 === 0 && j % 100 === 0) console.log('\tTraining no. ' + j);

				var knn = new ml.KNN({
					data : dataArray.slice(0, 768 - 230),
					result : labelArray.slice(0, 768 - 230)
				});
				var count = 0, tempTP = 0, tempFN = 0, tempFP = 0, tempTN = 0;

				for (let i = 768 - 230; i < 768; i++) {
					var result = knn.predict({
						x : dataArray[i],
						k : numOfK,
				
						weightf : {type : 'gaussian', sigma : 10.0},
						// default : {type : 'gaussian', sigma : 10.0}
						// {type : 'none'}. weight == 1
						// Or you can use your own weight f
						// weightf : function(distance) {return 1./distance}
				
						distance : {type : 'euclidean'}
						// default : {type : 'euclidean'}
						// {type : 'pearson'}
						// Or you can use your own distance function
						// distance : function(vecx, vecy) {return Math.abs(dot(vecx,vecy));}
					});
					if (Number(labelArray[i]) === -1) {
						if (Number(result) < 0) {
							count++;
							tempTN++;
						} else {
							tempFP++;
						}
					} else {
						if (Number(result) > 0) {
							count++;
							tempTP++;
						} else {
							tempFN++;
						}
					}
				}


				var print = false;
				if (count < (230 / 2)) {
					if (tempTP === 0 || (tempTP > tempFN && tempTN > tempFP)) {
						if ((best1 === 0 && best2 === 0) || (count < best1 && count < 230 - best2)) {
							best1 = count;
							best2 = 230 - count;
							print = true;
							TN = tempTN;
							FN = tempFN;
							TP = tempTP;
							FP = tempFP;
						}
					}
				} else if (count >= (230 / 2)) {
					if (tempTP === 0 || (tempTP > tempFN && tempTN > tempFP)) {
						if ((best1 === 0 && best2 === 0) || (count > best2 && count > 230 - best1)) {
							best2 = count;
							best1 = 230 - count;
							print = true;
							TN = tempTN;
							FN = tempFN;
							TP = tempTP;
							FP = tempFP;
						}
					}
				}

				if (print) { finalClusters = knn; }
			}
		}

		fs.writeFile('/knn', JSON.stringify(finalClusters), function(err) {
			if(err) { return console.log(err); }
		}); 

		var precision = TP / (TP + FP);
		var recall = TP / (TP + FN);
		var f1 = 2 * precision * recall / (precision + recall);
		console.log('-----------------------------');
		console.log('done');
		console.log('TP: ' + TP);
		console.log('FN: ' + FN);
		console.log('FP: ' + FP);
		console.log('TN: ' + TN);
		console.log('precision: ' + precision.toFixed(4));
		console.log('recall: ' + recall.toFixed(4));
		console.log('f1-measure: ' + f1.toFixed(4));
		console.log('accuracy: ' + (best1 / 230).toFixed(4) + ' or ' + (best2 / 230).toFixed(4));
	});