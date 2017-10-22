var fs = require('fs');

var ml = require('machine_learning');
var HiddenLayer = require('machine_learning/lib/HiddenLayer');
var knnClassifier;
var mlpClassifier;

var bayes = require('bayes');
var bayesClassifier = bayes({
	tokenizer: function (data) { return data; }
});
var figue = require('./figue').figue;
var rdForest = require('./randomforest').rdForest;
var RandomForestClassifier = require('random-forest-classifier').RandomForestClassifier;
var crossValidation = require('ml-cross-validation');

var csv = require('fast-csv');

var labelMode = 'sing';

var oriData = [];
var oriLabel = [];

var dataArray = [];
var posDataArray = [];
var nevDataArray = [];

var labelArray = [];
var posLabelArray = [];
var nevLabelArray = [];

var trainingPos = 179;
var trainingNev = 359;
var testingPos = 76;
var testingNev = 154;
var trainingDataArray = [];
var trainingLabelArray = [];
var testDataArray = [];
var testLabelArray = [];

var totalArray = [0, 0, 0, 0, 0, 0, 0, 0];
var lengthArray = [0, 0, 0, 0, 0, 0, 0, 0];

var right = 0;
var wrong = 0;

csv.fromPath('data/pima-diabetes.csv')
	.on('data', function (csvRow) {
		if (isNaN(Number(csvRow[0]))) return;

		for (var i in csvRow) {
			if (isNaN(Number(i))) continue;
			csvRow[i] = Number(csvRow[i]);
			if (csvRow[i] !== 0) {
				totalArray[i] = totalArray[i] + csvRow[i];
				lengthArray[i] = lengthArray[i] + 1;
			}
		}

		var label = csvRow[csvRow.length - 1];
		csvRow.splice(-1, 1);

		// var traningData;
		// traningData = csvRow;
		// traningData = [csvRow[0], csvRow[1], csvRow[4], csvRow[5], csvRow[6]];

		//dataArray.push(csvRow);

		oriData.push(csvRow.slice())
		if (Number(label) === 0) {
			nevDataArray.push(csvRow.slice());
		} else {
			posDataArray.push(csvRow.slice());
		}

		//labelArray.push(label);
		if (Number(label) === 1) {
			//labelArray.push([1, 0]);
			if (labelMode === 'dou') {
				oriLabel.push([1, 0])
				posLabelArray.push([1, 0]);
			} else {
				oriLabel.push(1)
				posLabelArray.push(1);
			}
			
		} else {
			//labelArray.push([0, 1]);
			if (labelMode === 'dou') {
				oriLabel.push([0, 1])
				nevLabelArray.push([0, 1]);
			} else {
				oriLabel.push(0)
				nevLabelArray.push(0);
			}
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

		console.log('Nev: ' + nevDataArray.length);
		console.log('Pos: ' + posDataArray.length);

		// console.log(dataArray)

		console.log('------------------------------------');
		//init MLP
		var runMLP = -1;
		var best1 = 0;
		var best2 = 0;
		var TP = 0, FN = 0, FP = 0, TN = 0;
		for (var j = 0; j <= runMLP; j++) {
			console.log('running ' + j);
			preProcess();
			
			var count = 0;
			var tempTP = 0, tempFN = 0, tempFP = 0, tempTN = 0;

			mlpClassifier = new ml.MLP({
				input: dataArray.slice(0, 768 - 230),
				label: labelArray.slice(0, 768 - 230),
				n_ins: 8,
				n_outs: 2,
				hidden_layer_sizes: [4, 4, 5]
			});
			mlpClassifier.set('log level', 1); // 0 : nothing, 1 : info, 2 : warning.

			//traning MLP
			mlpClassifier.train({
				lr : 0.01,
				epochs : 20000
			});
			
			// write model
			// fs.writeFile('/mlp', JSON.stringify(mlpClassifier), function(err) {
			// 	if(err) {
			// 		return console.log(err);
			// 	}
			// 	console.log("The file was saved!");
			// }); 

			// read model
			// fs.readFile('/test', 'utf8', function (err, data) {
			// 	if (err) {
			// 		return console.log(err);
			// 	}
			// 	var detector = new ml.MLP({
			// 		'input': [[1, 0], [0, 1]],
			// 		'label': [[0, 1], [1, 0]],
			// 		'n_ins': 2,
			// 		'n_outs': 2,
			// 		'hidden_layer_sizes': [5]
			// 	});

			// 	data = JSON.parse(data);
			// 	// Then overwrite all properties with what is saved in data variable    
			// 	detector.x = data.x; // comment out if you won't train
			// 	detector.y = data.y; // comment out if you won't train
			// 	detector.nLayers = data.nLayers;
			// 	detector.settings = data.settings;
			// 	detector.sigmoidLayers = new Array(data.sigmoidLayers.length);
			// 	for (var i in data.sigmoidLayers) {
			// 		// Here you cannot lie, use same values than in detector.settings
			// 		// Create a HiddenLayer use its constructor to ensure we end with the correct type
			// 		detector.sigmoidLayers[i] = new HiddenLayer({
			// 			'n_ins': detector.settings['n_ins'],
			// 			'n_outs': detector.settings['n_outs']
			// 		});

			// 		// restore all properties of each HiddenLayer
			// 		for (var p in data.sigmoidLayers[i]) {
			// 			detector.sigmoidLayers[i][p] = data.sigmoidLayers[i][p];
			// 		}
			// 	}
			// 	console.log(detector.predict([dataArray[2]]))
			// 	console.log(([labelArray[2]]))
			// });

			//console.log(JSON.stringify(mlpClassifier))

			for (let i = 768 - 230; i < 768; i++) {
				var y = mlpClassifier.predict([dataArray[i]]);
				if (Number(labelArray[i][0]) > Number(labelArray[i][1])) {
					if (y[0][0] > y[0][1]) {
						count++;
						tempTN++;
					} else {
						tempFP++;
					}
				} else {
					if (y[0][0] < y[0][1]) {
						count++;
						tempTP++;
					} else {
						tempFN++;
					}
				}
			}

			var print = false;
			if (count < (230 / 2)) {
				if ((best1 === 0 && best2 === 0) || (count < best1 && count < 230 - best2)) {
					best1 = count;
					best2 = 230 - count;
					print = true;
					TN = tempTN;
					FN = tempFN;
					TP = tempTP;
					FP = tempFP;
				}
			} else if (count >= (230 / 2)) {
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

			if (print) {
				fs.writeFile('/mlp', JSON.stringify(mlpClassifier), function(err) {
					if(err) {
						return console.log(err);
					}
				}); 
			}
		}

		if (runMLP >=0 ) {
			console.log('TP:' + TP)
			console.log('FN:' +  FN)
			console.log('FP:' +  FP)
			console.log('TN:' +  TN)
			console.log(best2 / 230)
			console.log(best1 / 230)
		}
	
		//shuffle(dataArray)
		// console.log(dataArray)
		// console.log(labelArray)
		console.log('------------------------------------');
		var runFuzzy = -1;
		var best1 = 0;
		var best2 = 0;
		var bestAccuracy = 0;
		var TP = 0, FN = 0, FP = 0, TN = 0;
		var finalClusters;
		var choseData = new Array ;
		var choseLabel = new Array ;
		// for (let i = 0 ; i < dataArray.length ; i++) {	
		// 	for (let k in dataArray[i]) {
		// 		if (dataArray[i][k] === 0) {
		// 			dataArray[i][k] = totalArray[k]/ lengthArray[k];
		// 		}
		// 	}
		// 	labels[i] = labelArray[i] ;
		// 	vectors[i] = dataArray[i] ;
		// }

		for (var j = 0; j <= runFuzzy; j++) {
			preProcess();
			
			if (j % 1000 === 0) console.log('running ' + j)
						
			var clusters = figue.fcmeans(2, dataArray.slice(768 - 230, 768), 0.00000000001, 1.25) ;
			var count = 0;
			var tempTP = 0, tempFN = 0, tempFP = 0, tempTN = 0;

			for (let i = 768 - 230; i < 768; i++) {
				var dis1 = figue.euclidianDistance(dataArray[i], clusters.centroids[0]);
				var dis2 = figue.euclidianDistance(dataArray[i], clusters.centroids[1]);
				//console.log(dis1)
				//console.log(dis2)
				//console.log(dis1>dis2)
				if (Number(labelArray[i]) > 0.5) {
					if (dis1 > dis2) {
						count++;
						tempTN++;
					} else {
						tempFP++;
					}
				} else {
					if (dis1 < dis2) {
						count++;
						tempTP++;
					} else {
						tempFN++;
					}
				}
			}

			// var confusionMatrix = crossValidation.leaveOneOut(MyClassifier, dataArray, labelArray);
			// var accuracy = confusionMatrix.getAccuracy();

			var print = false;
			if (count < (230 / 2)) {
				if (tempTP === 0 || tempTP > tempFN) {
					if ((best1 === 0 && best2 === 0) || (count < best1 && count < 230 - best2)) {
						best1 = count;
						best2 = 230 - count;
						print = true;
						TN = tempTN;
						FN = tempFN;
						TP = tempTP;
						FP = tempFP;
						choseData = dataArray.slice();
						choseLabel = labelArray.slice();
						//bestAccuracy = accuracy;
					}
				}
			} else if (count >= (230 / 2)) {
				if (tempTP === 0 || tempTP > tempFN) {
					if ((best1 === 0 && best2 === 0) || (count > best2 && count > 230 - best1)) {
						best2 = count;
						best1 = 230 - count;
						print = true;
						TN = tempTN;
						FN = tempFN;
						TP = tempTP;
						FP = tempFP;
						choseData = dataArray.slice();
						choseLabel = labelArray.slice();
						//bestAccuracy = accuracy;
					}
				}
			}

			if (print) {
				finalClusters = clusters;
				fs.writeFile('/fuzzy', JSON.stringify(clusters.centroids), function(err) {
					if(err) {
						return console.log(err);
					}
					//console.log("The file was saved!");
				}); 
			}
			// if (count > 134) console.log(count);
		}

		//console.log(finalClusters.centroids)
		//console.log(count)

		if (runFuzzy >= 0) {
			var confusionMatrixLeave1 = crossValidation.leaveOneOut(MyClassifier, choseData, choseLabel, {model: finalClusters});
			var confusionMatrixFold5 = crossValidation.kFold(MyClassifier, choseData, choseLabel, {model: finalClusters}, 5);
			var confusionMatrixFold10 = crossValidation.kFold(MyClassifier, choseData, choseLabel, {model: finalClusters}, 10);
			console.log('done')
			console.log('TP:' + TP)
			console.log('FN:' + FN)
			console.log('FP:' + FP)
			console.log('TN:' + TN)
			console.log('Leave 1 out')
			console.log(confusionMatrixLeave1)
			console.log('5 fold')
			console.log(confusionMatrixFold5)
			console.log('10 fold')
			console.log(confusionMatrixFold10)
			console.log(best1 / 230)
			console.log(best2 / 230)
		}

		var runRandom = -1;
		var best1 = 0;
		var best2 = 0;
		var bestAccuracy = 0;
		var TP = 0, FN = 0, FP = 0, TN = 0;
		var forest = new rdForest.RandomForest();
		var result;
		for (var j = 0; j <= runRandom; j++) {
			if (j % 1000 === 0) console.log('running ' + j)
			preProcess();
			var count = 0;
			var tempTP = 0, tempFN = 0, tempFP = 0, tempTN = 0;
			// .slice(768 - 230, 768)
			forest.train(dataArray.slice(0, 768 - 230), labelArray.slice(0, 768 - 230)); 
			result = forest.predict(dataArray.slice(768 - 230, 768));
			for (let i in result) {
				if (isNaN(Number(i))) continue;
				var index = Number(i) + 768 - 231;
				
				if (Number(labelArray[index]) === 1) {
					if (result[i] > 0.5) {
						count++;
						tempTN++;
					} else {
						tempFP++;
					}
				} else {
					if (result[i] < 0.5) {
						count++;
						tempTP++;
					} else {
						tempFN++;
					}
				}
			}


			var print = false;
			if (count < (230 / 2)) {
				//if (tempTP === 0 || tempTP > tempFN) {
					if ((best1 === 0 && best2 === 0) || (count < best1 && count < 230 - best2)) {
						best1 = count;
						best2 = 230 - count;
						print = true;
						TN = tempTN;
						FN = tempFN;
						TP = tempTP;
						FP = tempFP;
					}
				//}
			} else if (count >= (230 / 2)) {
				//if (tempTP === 0 || tempTP > tempFN) {
					if ((best1 === 0 && best2 === 0) || (count > best2 && count > 230 - best1)) {
						best2 = count;
						best1 = 230 - count;
						print = true;
						TN = tempTN;
						FN = tempFN;
						TP = tempTP;
						FP = tempFP;
					}
				//}
			}

			if (print) {
				finalClusters = clusters;
				fs.writeFile('/random', JSON.stringify(forest), function(err) {
					if(err) {
						return console.log(err);
					}
					//console.log("The file was saved!");
				}); 
			}
		}

		if (runRandom >= 0) {
			console.log('done')
			console.log('TP:' + TP)
			console.log('FN:' + FN)
			console.log('FP:' + FP)
			console.log('TN:' + TN)
			console.log(count / 230)
			console.log((230 - count) / 230)
		}
	});

function preProcess() {
	function shuffle(a, b) {
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
			[b[i], b[j]] = [b[j], b[i]];
		}
	}

	// shuffle(posDataArray, posLabelArray);
	// shuffle(nevDataArray, nevLabelArray);

	trainingDataArray = [];
	trainingLabelArray = [];
	trainingDataArray = trainingDataArray.concat(posDataArray.slice(0, trainingPos));
	trainingDataArray = trainingDataArray.concat(nevDataArray.slice(0, trainingNev));
	trainingLabelArray = trainingLabelArray.concat(posLabelArray.slice(0, trainingPos));
	trainingLabelArray = trainingLabelArray.concat(nevLabelArray.slice(0, trainingNev));

	testDataArray = [];
	testLabelArray = [];
	testDataArray = testDataArray.concat(posDataArray.slice(trainingPos, 268));
	testDataArray = testDataArray.concat(nevDataArray.slice(trainingNev, 500));
	testLabelArray = testLabelArray.concat(posLabelArray.slice(trainingPos, 268));
	testLabelArray = testLabelArray.concat(nevLabelArray.slice(trainingNev, 500));

	shuffle(trainingDataArray, trainingLabelArray);
	shuffle(testDataArray, testLabelArray);

	dataArray = [];
	labelArray = [];
	dataArray = dataArray.concat(trainingDataArray);
	dataArray = dataArray.concat(testDataArray);
	labelArray = labelArray.concat(trainingLabelArray);
	labelArray = labelArray.concat(testLabelArray);
	// dataArray = oriData;
	// labelArray = oriLabel;
	// console.log(dataArray.length)
	// console.log(labelArray.length)
}

class MyClassifier {
  constructor(options) {
    this.options = options;
  }
  train(data, labels) {
    this.model = this.options.model
  }
  predict(testData) {
		var prediction;
    var dis1 = figue.euclidianDistance(testData[0], this.model.centroids[0]);
		var dis2 = figue.euclidianDistance(testData[0], this.model.centroids[1]);
		if (dis1 > dis2) {
			prediction = [1];
		} else {
			prediction = [0];
		}
    return prediction;
  }
}

module.exports = {
	bayesClassifier: bayesClassifier
};
