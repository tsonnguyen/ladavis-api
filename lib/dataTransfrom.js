function shuffleData(a, b = null) {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
		if (b !== null) [b[i], b[j]] = [b[j], b[i]];
	}
}

function stratifiyData(posDataArray, negDataArray, posLabelArray, negLabelArray, k) {
	var dataArray = [];
	var labelArray = [];
	var numPos = posDataArray.length;
	var numNev = negDataArray.length;
	for (var i = 0; i < k ; i++) {
		var data = [];
		var label = [];
		data = data.concat(posDataArray.slice(i * numPos / k, (i + 1) * numPos / k));
		data = data.concat(negDataArray.slice(i * numNev / k, (i + 1) * numNev / k));
		label = label.concat(posLabelArray.slice(i * numPos / k, (i + 1) * numPos / k));
		label = label.concat(negLabelArray.slice(i * numNev / k, (i + 1) * numNev / k));
		shuffleData(data, label);
		dataArray = dataArray.concat(data);
		labelArray = labelArray.concat(label);
	}
  
	return {dataArray: dataArray, labelArray: labelArray};
}

function douToSingleLabel(labels) {
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

module.exports = {
	shuffleData: shuffleData,
	stratifiyData: stratifiyData,
	douToSingleLabel: douToSingleLabel
};
