var csv = require('fast-csv');
var figue = require('./figue').figue;

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
		console.log(dataArray.length);
		console.log(labelArray.length);

		// 78
		// var clusters = [
		// 	[4.221236040659266,115.5884220435345,68.61537591582632,16.29457143622101,21.418373083333794,31.594499164871422,0.41575146702640886,34.11902897349382],
		// 	[3.6636131926426887,138.58242365349568,73.12347394807227,31.153006487851453,212.63016803284097,34.47514964618804,0.5180101756942731,33.02143221443888]
		// ];

		// 77
		var clusters = [
			[3.987402142759051,109.70390896913742,69.960979973077,27.27385122003339,97.3953404099581,32.18137983859903,0.4430880258516074,31.162277423368003],
			[4.808627530103715,138.79602553665958,76.01792613128553,28.718514777331723,96.36833447092266,33.44926332718501,0.4565071483840058,36.60405722754729]
		];

		// 76
		// var clusters = [
		// 	[4.193454990817042,115.93593451798453,68.6667385675591,16.770869733393425,25.36144093488156,31.627878697871886,0.41866878940558394,34.07765326801489],
		// 	[3.6398442618650257,139.6507280126583,73.3550849834637,31.317826847480188,221.4855578077749,34.66265943994887,0.5214480138314352,32.92000927249754]
		// ];

		var TP = 0, FN = 0, FP = 0, TN = 0, count = 0;
		for (let i in dataArray) {
			if (isNaN(Number(labelArray[i]))) continue;

			var dis1 = figue.euclidianDistance(clusters[0], dataArray[i]);
			var dis2 = figue.euclidianDistance(clusters[1], dataArray[i]);

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

		console.log('done')
		console.log('TP:' + TP)
		console.log('FN:' + FN)
		console.log('FP:' + FP)
		console.log('TN:' + TN)
		console.log(count / 222)
		// console.log(figue.euclidianDistance(clusters[0], dataArray[0]))
	});