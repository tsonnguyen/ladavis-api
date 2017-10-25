var fs = require('fs');
var http = require('http');

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
var csvWriter = require('csv-write-stream')
var writer = csvWriter()

var csv = require('fast-csv');

var labelMode = 'sing';

var correctArray = [3, 117, 72, 23, 30.5, 32, 0.3725, 29];
var correctArray2 = [3.845, 120.9, 69.1, 20.54, 79.8, 32, 0.4719, 33.24];

var oriData = [];
var oriLabel = [];

var randomDataArray = new Array;
var randomPosArray = new Array;
var randomNevArray = new Array;

var dataArray = [];
var posDataArray = [];
var nevDataArray = [];

var labelArray = [];
var posLabelArray = [];
var nevLabelArray = [];

var trainingPos = 179;
var trainingNev = 359;
// var testingPos = 76;
// var testingNev = 154;
var trainingDataArray = [];
var trainingLabelArray = [];
var testDataArray = [];
var testLabelArray = [];

var totalArray = [0, 0, 0, 0, 0, 0, 0, 0];
var lengthArray = [0, 0, 0, 0, 0, 0, 0, 0];

// var options = {
// 	host: 'localhost',
// 	port: 4000,
// 	path: '/ladavis/rest-api/all-full-patients',
// 	method: 'GET'
// };

// http.request(options, function(res) {
// 	res.on('data', function (chunk) {
// 		var response = JSON.parse(chunk.toString());
// 		writer.pipe(fs.createWriteStream('out.csv'))
// 		for (let i in response.data) {
// 			writer.write(response.data[i])
// 		}
// 		writer.end();
// 	});
// }).end();

csv.fromPath('data/pima-diabetes.csv')
	.on('data', function (csvRow) {
		if (isNaN(Number(csvRow[0]))) return;

		for (var i in csvRow) {
			if (isNaN(Number(i))) continue;
			csvRow[i] = Number(csvRow[i]);
			if (csvRow[i] === 0 && Number(i) !== 8) {
				csvRow[i] = correctArray[i];
				//csvRow[i] = correctArray2[i];
			}
		}

		// if (randomDataArray.length < 1000) {
		// 	randomDataArray.push({
		// 		preg: Number(csvRow[0]),
		// 		glu: Number(csvRow[1]), 
		// 		bp: Number(csvRow[2]),
		// 		skin: Number(csvRow[3]),
		// 		insulin: Number(csvRow[4]),
		// 		bmi: Number(csvRow[5]),
		// 		deg: Number(csvRow[6]),
		// 		age: Number(csvRow[7]),
		// 		outcome: Number(csvRow[8]) === 1 ? 'yes' : 'no'
		// 	})
		// }

		var label = csvRow[csvRow.length - 1];
		//csvRow.splice(-1, 1);

		// var traningData;
		// traningData = csvRow;
		// traningData = [csvRow[0], csvRow[1], csvRow[4], csvRow[5], csvRow[6]];

		//dataArray.push(csvRow);

		oriData.push(csvRow.slice());
		if (Number(label) === 0) {
			nevDataArray.push(csvRow.slice());
			randomNevArray.push({
				preg: Number(csvRow[0]),
				glu: Number(csvRow[1]), 
				bp: Number(csvRow[2]),
				skin: Number(csvRow[3]),
				insulin: Number(csvRow[4]),
				bmi: Number(csvRow[5]),
				deg: Number(csvRow[6]),
				age: Number(csvRow[7]),
				outcome: 'no'
			})
		} else {
			posDataArray.push(csvRow.slice());
			randomPosArray.push({
				preg: Number(csvRow[0]),
				glu: Number(csvRow[1]), 
				bp: Number(csvRow[2]),
				skin: Number(csvRow[3]),
				insulin: Number(csvRow[4]),
				bmi: Number(csvRow[5]),
				deg: Number(csvRow[6]),
				age: Number(csvRow[7]),
				outcome: 'yes'
			})
		}

		//labelArray.push(label);
		if (Number(label) === 1) {
			//labelArray.push([1, 0]);
			if (labelMode === 'dou') {
				oriLabel.push([1, 0]);
				posLabelArray.push([1, 0]);
			} else {
				oriLabel.push(1);
				posLabelArray.push(1);
			}
			
		} else {
			//labelArray.push([0, 1]);
			if (labelMode === 'dou') {
				oriLabel.push([0, 1]);
				nevLabelArray.push([0, 1]);
			} else {
				oriLabel.push(0);
				nevLabelArray.push(0);
				// oriLabel.push(-1);
				// nevLabelArray.push(-1);
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

		// var arrayPatient = [];
		// for (let kkk = 8000; kkk <= 0; kkk++) {
		// 	if (arrayPatient.length === 200) break;
		// 	var options = {
		// 		host: 'localhost',
		// 		port: 4000,
		// 		path: '/ladavis/rest-api/patient?id=' + kkk,
		// 		method: 'GET'
		// 	};
			
		// 	http.request(options, function(res) {
		// 		res.on('data', function (chunk) {
		// 			var response = JSON.parse(chunk.toString());
		// 			if (response.status !== 'fail') {
		// 				var data = response.data;
		// 				if (data.info.height !== 0 && data.info.weight !== 0 
		// 				&& data.diastolic.length !== 0 && data.glucoseBlood.length !== 0) {
		// 					arrayPatient.push(kkk);
		// 				}
		// 			}
		// 		});
		// 	}).end();
		// }
		
		// setTimeout(function() {
		// 	fs.writeFile('/patient', JSON.stringify(arrayPatient), function(err) {
		// 		if(err) {
		// 			console.log('bugggg')
		// 			return console.log(err);
		// 		}
		// 	}); 
		// }, 10000);
		

		console.log('Nev: ' + nevDataArray.length);
		console.log('Pos: ' + posDataArray.length);

		// console.log(dataArray)

		console.log('------------------------------------');
		//init MLP
		var runMLP = -1;
		var runMLPOneTime = -1;
		var best1 = 0;
		var best2 = 0;
		var TP = 0, FN = 0, FP = 0, TN = 0;
		for (var l = 0; l <= runMLP; l++) {
			preProcess();
			if (l % 1 === 0) console.log('running ' + l)
			for (var j = 0; j <= runMLPOneTime; j++) {
				//if (j % 1 === 0) console.log('running ' + j)
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
						choseData = dataArray.slice();
						choseLabel = labelArray.slice();
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
						choseData = dataArray.slice();
						choseLabel = labelArray.slice();
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
		}

		if (runMLP >=0 ) {
			console.log('alo')
			var confusionMatrixLeave1 = crossValidation.leaveOneOut(MyClassifier2, choseData, douToSingle(choseLabel), {model: mlpClassifier});
			var confusionMatrixFold5 = crossValidation.kFold(MyClassifier2, choseData, douToSingle(choseLabel), {model: mlpClassifier}, 5);
			var confusionMatrixFold10 = crossValidation.kFold(MyClassifier2, choseData, douToSingle(choseLabel), {model: mlpClassifier}, 10);
			var precision = TP / (TP + FP);
			var recall = TP / (TP + FN);
			var f1 = 2 * precision * recall / (precision + recall);
			console.log('done')
			console.log('TP:' + TP)
			console.log('FN:' + FN)
			console.log('FP:' + FP)
			console.log('TN:' + TN)
			console.log('precision:' + precision.toFixed(2))
			console.log('recall:' + recall.toFixed(2))
			console.log('Leave 1 out')
			console.log(confusionMatrixLeave1)
			console.log('5 fold')
			console.log(confusionMatrixFold5)
			console.log('10 fold')
			console.log(confusionMatrixFold10)
			console.log(best1 / 230)
			console.log(best2 / 230)
		}
	
		//shuffle(dataArray)
		// console.log(dataArray)
		// console.log(labelArray)
		// oriLabel =  douToSingle(oriLabel);
		// posLabelArray = douToSingle(posLabelArray);
		// nevDataArray = douToSingle(nevDataArray)
		console.log('------------------------------------');
		var runFuzzy = -1;
		var runFuzzyOneTime = -1;
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

		for (var l = 0; l <= runFuzzy; l++) {
			preProcess();
			labelArray =  douToSingle(labelArray);
			//if (l % 10 === 0) console.log('running ' + l)
			for (var j = 0; j <= runFuzzyOneTime; j++) {
					
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
		}

		//console.log(finalClusters.centroids)
		//console.log(count)

		if (runFuzzy >= 0) {
			var confusionMatrixLeave1 = crossValidation.leaveOneOut(MyClassifier, choseData, choseLabel, {model: finalClusters});
			var confusionMatrixFold5 = crossValidation.kFold(MyClassifier, choseData, choseLabel, {model: finalClusters}, 5);
			var confusionMatrixFold10 = crossValidation.kFold(MyClassifier, choseData, choseLabel, {model: finalClusters}, 10);
			var precision = TP / (TP + FP);
			var recall = TP / (TP + FN);
			var f1 = 2 * precision * recall / (precision + recall);
			console.log('done')
			console.log('TP:' + TP)
			console.log('FN:' + FN)
			console.log('FP:' + FP)
			console.log('TN:' + TN)
			console.log('precision:' + precision.toFixed(2))
			console.log('recall:' + recall.toFixed(2))
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
		var runRandomOneTime = -1;
		var best1 = 0;
		var best2 = 0;
		var bestAccuracy = 0;
		var TP = 0, FN = 0, FP = 0, TN = 0;
		var forest = new rdForest.RandomForest();
		var optionsRandom = {};
		optionsRandom.numTrees = 100; // defaults
		optionsRandom.maxDepth = 8;
		optionsRandom.numTries = 100000;

		for (var l = 0; l <= runRandom; l++) {
			preProcess();
			if (l % 1 === 0) {
				console.log('running ' + l)
			}
			for (var j = 0; j <= runRandomOneTime; j++) {
				var count = 0;
				var count1 = 0;
				var count2 = 0;
				var tempTP = 0, tempFN = 0, tempFP = 0, tempTN = 0;
				// .slice(768 - 230, 768)
				forest.train(dataArray.slice(0, 768 - 230), labelArray.slice(0, 768 - 230), optionsRandom); 

				for (let i = 768 - 230; i < 768; i++) {
					var result = forest.predictOne(dataArray[i]);
					if (result > 0.5) {
						if (Number(labelArray[i]) === 1) {
							count++;
							tempTP++;
						} else {
							tempFP++;
						}
					} else {
						if (Number(labelArray[i]) === 0) {
							count++;
							tempTN++;
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
		}

		if (runRandom >= 0) {
			var precision = TP / (TP + FP);
			var recall = TP / (TP + FN);
			var f1 = 2 * precision * recall / (precision + recall);
			console.log('done')
			console.log('TP:' + TP)
			console.log('FN:' + FN)
			console.log('FP:' + FP)
			console.log('TN:' + TN)
			console.log('precision:' + precision.toFixed(2))
			console.log('recall:' + recall.toFixed(2))
			console.log('f1:' + f1.toFixed(2))
			console.log(count / 230)
			console.log((230 - count) / 230)
		}

		var rf = new RandomForestClassifier({
			n_estimators: 30,
			// criterion: 'gini',
			// max_features: 'auto',
			// min_samples_leaf: 1, 
			// min_samples_split: 2,
			// verbose: 0
		});

		// console.log(randomDataArray[0])
		// console.log(data[0])

		
		// preProcess();
		// rf.fit(randomDataArray.slice(0, 768 - 230), null, "outcome", function(err, trees){
		// 	// console.log(JSON.stringify(trees, null, 4));
		// 	console.log('aaaa')
		// 	var TP = 0, FP = 0, TN = 0, FN = 0, count = 0;
		// 	for (let i = 768 - 230; i < 768; i++) {
		// 		var test = {
		// 			preg: randomDataArray[i].preg,
		// 			glu: randomDataArray[i].glu,
		// 			bp: randomDataArray[i].bp,
		// 			skin: randomDataArray[i].skin,
		// 			insulin: randomDataArray[i].insulin,
		// 			bmi: randomDataArray[i].bmi,
		// 			deg: randomDataArray[i].deg,
		// 			age: randomDataArray[i].age,
		// 		}
		// 		var pred = rf.predict([test], trees);
		// 		if (randomDataArray[i].outcome === 'yes') {
		// 			if (pred[0] === 'yes') {
		// 				TP++;
		// 				count++
		// 			} else {
		// 				FN++;
		// 			}
		// 		} else {
		// 			if (pred[0] === 'no') {
		// 				TN++;
		// 				count++
		// 			} else {
		// 				FP++;
		// 			}
		// 		}
		// 	}
		// 	var precision = TP / (TP + FP);
		// 	var recall = TP / (TP + FN);
		// 	var f1 = 2 * precision * recall / (precision + recall);
		// 	console.log('done')
		// 	console.log('TP:' + TP)
		// 	console.log('FN:' + FN)
		// 	console.log('FP:' + FP)
		// 	console.log('TN:' + TN)
		// 	console.log('precision:' + precision.toFixed(2))
		// 	console.log('recall:' + recall.toFixed(2))
		// 	console.log('f1:' + f1.toFixed(2))
		// 	console.log(count / 230)
	  
		// 	// pred = ["virginica", "setosa"]
		// });
	});

function preProcess() {
	function shuffle(a, b = null) {
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
			if (b !== null) [b[i], b[j]] = [b[j], b[i]];
		}
	}

	// shuffle(posDataArray, posLabelArray);
	// shuffle(nevDataArray, nevLabelArray);

	trainingDataArray = [];
	trainingLabelArray = [];
	trainingRandom = [];
	trainingDataArray = trainingDataArray.concat(posDataArray.slice(0, trainingPos));
	trainingDataArray = trainingDataArray.concat(nevDataArray.slice(0, trainingNev));
	trainingLabelArray = trainingLabelArray.concat(posLabelArray.slice(0, trainingPos));
	trainingLabelArray = trainingLabelArray.concat(nevLabelArray.slice(0, trainingNev));
	trainingRandom = trainingRandom.concat(randomPosArray.slice(0, trainingPos));
	trainingRandom = trainingRandom.concat(randomNevArray.slice(0, trainingNev));

	testDataArray = [];
	testLabelArray = [];
	testRandom = [];
	testDataArray = testDataArray.concat(posDataArray.slice(trainingPos, 268));
	testDataArray = testDataArray.concat(nevDataArray.slice(trainingNev, 500));
	testLabelArray = testLabelArray.concat(posLabelArray.slice(trainingPos, 268));
	testLabelArray = testLabelArray.concat(nevLabelArray.slice(trainingNev, 500));
	testRandom = testRandom.concat(randomPosArray.slice(trainingPos, 268));
	testRandom = testRandom.concat(randomNevArray.slice(trainingNev, 500));

	shuffle(trainingDataArray, trainingLabelArray);
	shuffle(testDataArray, testLabelArray);
	shuffle(trainingRandom, null);
	shuffle(testRandom, null);
	

	dataArray = [];
	labelArray = [];
	randomDataArray = [];
	dataArray = dataArray.concat(trainingDataArray);
	dataArray = dataArray.concat(testDataArray);
	labelArray = labelArray.concat(trainingLabelArray);
	labelArray = labelArray.concat(testLabelArray);
	randomDataArray = randomDataArray.concat(trainingRandom);
	randomDataArray = randomDataArray.concat(testRandom);
	// dataArray = oriData;
	// labelArray = oriLabel;
	// console.log(dataArray.length)
	// console.log(labelArray.length)
}

function douToSingle(labels) {
	var newArray = labels.slice();
	for (let i in newArray) {
		if (newArray[i][0] === 1) {
			newArray[i] = 1;
		} else {
			newArray[i] = 0;
		}
	}
	return newArray;
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

class MyClassifier2 {
  constructor(options) {
    this.options = options;
  }
  train(data, labels) {
    this.model = this.options.model
  }
  predict(testData) {
		var prediction;
		var y = this.model.predict([testData[0]]);

		if (y[0][0] > y[0][1]) {
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
