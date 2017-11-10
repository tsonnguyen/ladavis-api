var ml = require('machine_learning');
var csv = require('fast-csv');

var stratifiyData =  require('../lib/dataTransfrom').stratifiyData;

var posDataArray = [];
var negDataArray = [];
var posLabelArray = [];
var negLabelArray = [];
var numOfFeatures = Number(process.argv[2]);
var numOfDataSet = Number(process.argv[3]);
var numOfTraining = Number(process.argv[4]);
var numOfFold = Number(process.argv[5]);
var isDisplayLog = (process.argv[6] === 'true') ? true : false;

console.log('KNN CROSS VALIDATING\n');

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

		if (numOfFold !== 5 && numOfFold !== 10 && numOfFold !== 768) {
			console.log('Invalid number of folds (5, 10 or 768)');
			console.log('\n');
			return;
		}

		var finalClusters;
		var TP = 0, FN = 0, FP = 0, TN = 0;

		for (var l = 0; l < numOfDataSet; l++) {
			var preProcessDataLabel = stratifiyData(posDataArray, negDataArray, posLabelArray, negLabelArray, numOfFold);
			var dataArray = preProcessDataLabel.dataArray;
			var labelArray = preProcessDataLabel.labelArray;
			var dataTP = 0, dataFN = 0, dataFP = 0, dataTN = 0;

			if (l % 10 === 0) {
				console.log('Data no. ' + l);
				console.log('\tData length: ' + dataArray.length);
				console.log('\tFirst Data: ' + dataArray[0]);
				console.log('\tFirst Label: ' + labelArray[0]);
			}

			var trainingLength = 0;
			if (numOfFold === 768) {
				trainingLength = 1;
			} else if (numOfFold === 5) {
				trainingLength = 153;
			} else if (numOfFold === 10) {
				trainingLength = 77;
			}

			for (var k = 0; k < numOfFold; k++) {
				if (numOfFold !== 768) console.log('\tFold: ' + (k + 1))

				var newDataArray, newLabelArray;
				var startTest, endTest;
				var best1 = 0, best2 = 0;
				var subTP = 0, subFN = 0, subFP = 0, subTN = 0;

				if (k === 0) {
					newDataArray = dataArray.slice(1 * trainingLength, dataArray.length);
					newLabelArray = labelArray.slice(1 * trainingLength, dataArray.length);
					startTest = 0, endTest = trainingLength;
				} else if (k === numOfFold - 1) {
					newDataArray = dataArray.slice(0, k * trainingLength);
					newLabelArray = labelArray.slice(0, k * trainingLength);
					startTest = k * trainingLength, endTest = dataArray.length;
				} else  {
					newDataArray = [];
					newDataArray = newDataArray.concat(dataArray.slice(0, k * trainingLength));
					newDataArray =newDataArray.concat(dataArray.slice((k + 1) * trainingLength, dataArray.length));
					newLabelArray = [];
					newLabelArray = newLabelArray.concat(labelArray.slice(0, k * trainingLength));
					newLabelArray =newLabelArray.concat(labelArray.slice((k + 1) * trainingLength, dataArray.length));
					startTest = k * trainingLength, endTest = (k + 1) * trainingLength;
				}

				for (var j = 0; j < numOfTraining; j++) {
					var knn = new ml.KNN({
						data : newDataArray,
						result : newLabelArray
					});
					
					var count = 0, tempTP = 0, tempFN = 0, tempFP = 0, tempTN = 0;

					for (let i = startTest; i < endTest; i++) {
						var result = knn.predict({
							x : dataArray[i],
							k : 5,
					
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
							if (Number(result) < 0) { count++; tempTN++;
							} else { tempFP++; }
						} else {
							if (Number(result) > 0) { count++; tempTP++;
							} else { tempFN++; }
						}
					}
			
					if (count < (trainingLength / 2)) {
						if (subTP === 0 || tempTP > tempFN) {
							if ((best1 === 0 && best2 === 0) || (count < best1 && count < trainingLength - best2)) {
								best1 = count;
								best2 = trainingLength - count;
								subTN = tempTN;
								subFN = tempFN;
								subTP = tempTP;
								subFP = tempFP;
								if (isDisplayLog) console.log('\t\tPicked: ' + best2/trainingLength);
							}
						}
					} else if (count >= (trainingLength / 2)) {
						if (subTP === 0 || tempTP > tempFN) {
							if ((best1 === 0 && best2 === 0) || (count > best2 && count > trainingLength - best1)) {
								best2 = count;
								best1 = trainingLength - count;
								subTN = tempTN;
								subFN = tempFN;
								subTP = tempTP;
								subFP = tempFP;
								if (isDisplayLog) console.log('\t\tPicked: ' + best2/trainingLength);
							}
						}
					}

					// After 1 repeat training
				}

				// After 1 fold
				dataTN += subTN;
				dataFP += subFP;
				dataTP += subTP;
				dataFN += subFN;
			}

			// After 1 data
			if (TN === 0) {
				TN = dataTN;
				FP = dataFP;
				TP = dataTP;
				FN = dataFN;
			} else {
				if (dataTP + dataTN > TP + TN) {
					TN = dataTN;
					FP = dataFP;
					TP = dataTP;
					FN = dataFN;
				}
			}
		}

		var dataLength = negDataArray.length + posDataArray.length;
		var precision = TP / (TP + FP);
		var recall = TP / (TP + FN);
		var f1 = 2 * precision * recall / (precision + recall);
		console.log('-----------------------------');
		console.log('done');
		console.log('total: ' + (TP + FN + FP + TN));
		console.log('total positive: ' + (TP + FN));
		console.log('total negative: ' + (FP + TN));
		console.log('TP: ' + TP);
		console.log('FN: ' + FN);
		console.log('FP: ' + FP);
		console.log('TN: ' + TN);
		console.log('precision: ' + precision.toFixed(4));
		console.log('recall: ' + recall.toFixed(4));
		console.log('f1-measure: ' + f1.toFixed(4));
		console.log('accuracy: ' + ((TP + TN) / dataLength).toFixed(4) + ' or ' + ((FN + FP) / dataLength).toFixed(4));
	});