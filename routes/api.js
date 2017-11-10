var database = require('./dbSetting');
var db = database.db ;
var predict = require('./predict');
var constant = require('./defines.js');

console.log('RUNNING LADAVIS SERVER...\n');

function getAllPatients(req, res, next) {
	db.task('get-everything', t => {
		return t.batch([
			t.any('select p.subject_id as id, p.gender, p.dob, da.diagnosis '
				+ 'from patients p join diabete_admissions da on p.subject_id = da.subject_id'),
			t.any('select subject_id as id, itemid, value, charttime from labevents '
				+ 'where subject_id in (select subject_id from diabete_admissions) '
				+ 'and itemid in ($1, $2, $3, $4, $5, $6, $7) '
				+ 'order by subject_id, charttime asc'
				, [constant.glucoseBlood, constant.glucoseUrine
				, constant.creatinine, constant.albumin, constant.hemoA1c
				, constant.choles, constant.trigly]),
			t.any('select subject_id as id, itemid, value, charttime ' 
				+ 'from chartevents '
				+ 'where subject_id in (select subject_id from diabete_admissions) ' 
				+ 'and itemid in ($1, $2) '
				+ 'order by subject_id, charttime asc'
				, [constant.NBPsystolic, constant.NBPdiastolic]),
		]);
	}).then(data => {
		var listPatients = data[0];
		var listLabitems = data[1];
		var listChartitems = data[2];

		var shiftYear = 87;

		for (let i = 0; i < listPatients.length; i++) {
			listPatients[i].dob = (new Date()).getFullYear() - (new Date(listPatients[i].dob)).getFullYear() + shiftYear;

			if (listPatients[i].dob > 100) {
				listPatients[i].dob = listPatients[i].dob - 30;
			} else if (listPatients[i].dob > 70) {
				listPatients[i].dob = listPatients[i].dob - 20;
			} else if (listPatients[i].dob < 10) {
				listPatients[i].dob = listPatients[i].dob + 30;
			}
			
			listPatients[i].glucoseBlood = [];
			listPatients[i].glucoseUrine = [];
			listPatients[i].creatinine = [];
			listPatients[i].albumin = [];
			listPatients[i].hemoA1c = [];
			listPatients[i].choles = [];
			listPatients[i].trigly = [];

			for (let j = 0; j < listLabitems.length; j++) {
				if (listPatients[i].id < listLabitems[j].id) break;
				else if (listPatients[i].id === listLabitems[j].id) {
					switch (listLabitems[j].itemid) {
					case (constant.glucoseBlood):
						listPatients[i].glucoseBlood.push({time: listLabitems[j].charttime, value: listLabitems[j].value});
						break;
					case (constant.glucoseUrine):
						listPatients[i].glucoseUrine.push({time: listLabitems[j].charttime, value: listLabitems[j].value});
						break;
					case (constant.creatinine):
						listPatients[i].creatinine.push({time: listLabitems[j].charttime, value: listLabitems[j].value});
						break;
					case (constant.albumin):
						listPatients[i].albumin.push({time: listLabitems[j].charttime, value: listLabitems[j].value});
						break;
					case (constant.hemoA1c):
						listPatients[i].hemoA1c.push({time: listLabitems[j].charttime, value: listLabitems[j].value});
						break;
					case (constant.choles):
						listPatients[i].choles.push({time: listLabitems[j].charttime, value: listLabitems[j].value});
						break;
					case (constant.trigly):
						listPatients[i].trigly.push({time: listLabitems[j].charttime, value: listLabitems[j].value});
						break;
					}
				}
			}

			listPatients[i].systolic = [];
			listPatients[i].diastolic = [];

			for (let j = 0; j < listChartitems.length; j++) {
				if (listPatients[i].id < listChartitems[j].id) break;
				else if (listPatients[i].id === listChartitems[j].id) {
					switch (listChartitems[j].itemid) {
					case (constant.NBPsystolic):
						listPatients[i].systolic.push({time: listChartitems[j].charttime, value: listChartitems[j].value});
						break;
					case (constant.glucoseUrine):
						listPatients[i].diastolic.push({time: listChartitems[j].charttime, value: listChartitems[j].value});
						break;
					}
				}
			}
		}
		

		res.status(200)
			.json({
				status: 1,
				message: 'Retrieved ALL diabete patients',
				length: listPatients.length,
				data: listPatients
			});
	}).catch(error => {
		return next(error);
	});
}

function getPatient(req, res, next) {
	db.task('get-everything', t => {
		return t.batch([
			t.any('select itemid, value, charttime as time ' 
				+ 'from chartevents '
				+ 'where subject_id = $1 ' 
				+ 'and (itemid = $2 or itemid = $3 or itemid = $4 or itemid = $5 or itemid = $6) '
				+ 'order by charttime asc'
				, [req.query.id, constant.NBPsystolic, constant.NBPdiastolic, constant.weight, constant.height, constant.pregnant]),
			t.any('select itemid, value, charttime as time ' 
				+ 'from labevents '
				+ 'where subject_id = $1 ' 
				+ 'and itemid in ($2, $3, $4, $5, $6, $7, $8) '
				+ 'order by charttime asc'
				, [req.query.id, constant.glucoseBlood, constant.glucoseUrine
				, constant.creatinine, constant.albumin, constant.hemoA1c
				, constant.choles, constant.trigly]),
			t.any('select startdate, enddate, drug, drug_name_generic, prod_strength, ' 
				+ 'dose_val_rx, dose_unit_rx, form_val_disp, form_unit_disp ' 
				+ 'from prescriptions '
				+ 'where subject_id = $1 '
				+ 'and (drug like \'%$2#%\' or drug like \'%$3#%\' '
				+ 'or drug like \'%$4#%\' or drug like \'%$5#%\' '
				+ 'or drug like \'%$6#%\' or drug like \'%$7#%\' '
				+ 'or drug like \'%$8#%\' or drug like \'%$9#%\') '
				+ 'order by startdate asc'
				, [req.query.id, constant.simva, constant.lisin, constant.RR, constant.acar
				, constant.met, constant.Glit, constant.DPP4, constant.SH]),
			t.any('select chartdate as time, category, description, text ' 
				+ 'from noteevents '
				+ 'where subject_id = $1 '
				+ 'order by chartdate asc'
				, req.query.id),
			t.any('select * ' 
				+ 'from admissions '
				+ 'where subject_id = $1 '
				, req.query.id),
			t.any('select * ' 
				+ 'from patients '
				+ 'where subject_id = $1 '
				, req.query.id)		
		]);
	}).then(data => {
		var listItems = data[0];
		var listLabitems = data[1];
		var listDrugItems = data[2];
		var listNoteItems = data[3];
		var listAdminssionItems = data[4];
		var listInfoItems = data[5];

		var shiftYear = 87;

		String.prototype.capitalize = function() {
			return this.charAt(0).toUpperCase() + this.slice(1);
		};

		if (typeof listInfoItems[0] !== 'undefined') {
			var result = {
				info: {
					id: req.query.id,
					age: (new Date()).getFullYear() - (new Date(listInfoItems[0].dob)).getFullYear() + shiftYear,
					gender: (listInfoItems[0].gender === 'M') ? 'Male' : 'Female',
					admittime: (listAdminssionItems[0].admittime),
					dischtime: (listAdminssionItems[listAdminssionItems.length-1].dischtime),
					deathtime: (listAdminssionItems[0].deathtime),
					diagnosis: listAdminssionItems[0].diagnosis.toLowerCase().capitalize(),
					religion: listAdminssionItems[0].religion.toLowerCase().capitalize()
				},
				predict: [],
				height: [],
				weight: [],
				systolic: [],
				diastolic: [],
				hemoA1c: [],
				glucoseBlood: [],
				glucoseUrine: [],
				creatinine: [],
				albumin: [],
				choles: [],
				trigly: [],
				simva: [],
				lisin: [],
				RR: [],
				acar: [],
				met: [],
				Glit: [],
				DPP4: [],
				SH: [],
				notes: listNoteItems
			};

			if (result.info.age >= 100) {
				result.info.age = result.info.age - 30;
			} else if (result.info.age >= 70) {
				result.info.age = result.info.age - 20;
			} else if (result.info.age <= 20) {
				result.info.age = result.info.age + 20;
			} else if (result.info.age <= 10) {
				result.info.age = result.info.age + 30;
			}

			for (var i in listItems){
				if (new Date(listItems[i].time) > new Date(result.info.dischtime)) {
					result.info.dischtime = listItems[i].time;
				}
				if (listItems[i].itemid == constant.NBPsystolic) {
					result.systolic.push({
						time: listItems[i].time, 
						value: listItems[i].value
					});
				} else if (listItems[i].itemid == constant.NBPdiastolic) {
					result.diastolic.push({
						time: listItems[i].time, 
						value: listItems[i].value
					});
				} else if (listItems[i].itemid == constant.weight) {
					result.weight.push({
						time: listItems[i].time, 
						value: listItems[i].value
					});
				} else if (listItems[i].itemid == constant.height) {
					result.height.push({
						time: listItems[i].time, 
						value: listItems[i].value
					});
				} 
			}  

			if (result.height.length === 0) {
				if (result.info.gender === 'Female') {
					result.height.push({
						time: result.info.admittime, 
						value: 166
					});
				} else {
					result.height.push({
						time: result.info.admittime, 
						value: 177
					});
				}
			}

			if (result.weight.length === 0) {
				result.weight.push({
					time: result.info.admittime, 
					value: 57.5
				});
			}

			for (let i in listLabitems){
				if (new Date(listLabitems[i].time) > new Date(result.info.dischtime)) {
					result.info.dischtime = listLabitems[i].time;
				}
				switch (listLabitems[i].itemid) {
				case (constant.glucoseBlood):
					result.glucoseBlood.push({time: listLabitems[i].time, value: listLabitems[i].value});
					break;
				case (constant.glucoseUrine):
					result.glucoseUrine.push({time: listLabitems[i].time, value: listLabitems[i].value});
					break;
				case (constant.creatinine):
					result.creatinine.push({time: listLabitems[i].time, value: listLabitems[i].value});
					break;
				case (constant.albumin):
					result.albumin.push({time: listLabitems[i].time, value: listLabitems[i].value});
					break;
				case (constant.hemoA1c):
					result.hemoA1c.push({time: listLabitems[i].time, value: listLabitems[i].value});
					break;
				case (constant.choles):
					result.choles.push({time: listLabitems[i].time, value: listLabitems[i].value});
					break;
				case (constant.trigly):
					result.trigly.push({time: listLabitems[i].time, value: listLabitems[i].value});
					break;
				}
			}

			for (let i in listDrugItems){
				if (new Date(listDrugItems[i].time) > new Date(result.info.dischtime)) {
					result.info.dischtime = listDrugItems[i].time;
				}
				switch (listDrugItems[i].drug) {
				case (constant.simva):
					result.simva.push(listDrugItems[i]);
					break;
				case (constant.lisin):
					result.lisin.push(listDrugItems[i]);
					break;
				case (constant.RR):
					result.RR.push(listDrugItems[i]);
					break;
				case (constant.acar):
					result.acar.push(listDrugItems[i]);
					break;
				case (constant.met):
					result.met.push(listDrugItems[i]);
					break;
				case (constant.Glit):
					result.Glit.push(listDrugItems[i]);
					break;
				case (constant.DPP4):
					result.DPP4.push(listDrugItems[i]);
					break;
				case (constant.SH):
					result.SH.push(listDrugItems[i]);
					break;
				}
			}  

			var timeStemp = [];
			for (let i in result.height) {
				if (isNaN(Number(i))) continue;
				timeStemp.push({
					time: result.height[i].time
				});
			}

			var varArray = [result.weight, result.diastolic, result.glucoseBlood];
			for (let run in varArray) {
				for (let i in varArray[run]) {
					if (isNaN(Number(i))) continue;
					let tempTime = new Date(varArray[run][i].time);
					for (let j in timeStemp) {
						let temp = new Date(timeStemp[j].time);
						if (tempTime > temp) {
							timeStemp.splice(Number(j), 0, {
								time: varArray[run][i].time
							});
							break;
						}
					}
				}
			}

			timeStemp = timeStemp.reverse();			

			for (let run in timeStemp) {
				timeStemp[run].age = Number(result.info.age);
				timeStemp[run].skin = 21;
				timeStemp[run].predigree = 0.373;
				timeStemp[run].insulin = 80;
				timeStemp[run].pregnant = 0;

				if (result.height.length === 1) {
					timeStemp[run].height = result.height[0].value;
				} else {
					for (let i in result.height) {
						var temp1 = new Date(result.height[i].time);
						var temp2 = new Date(timeStemp[run].time);
						if (temp1 == temp2) {
							timeStemp[run].height = Number(result.height[i].value);
							break;
						} else if (temp1 > temp2) {
							if (Number(i) === 0) {
								timeStemp[run].height = Number(result.height[i].value);
							}	else if (Number(i) !== (result.height.length - 1)) {
								let temp3 = new Date(result.height[Number(i) - 1].time);
								let a = (Number(result.height[Number(i) - 1].value) - Number(result.height[i].value)) / (temp3.getTime() - temp1.getTime());
								let b = Number(result.height[i].value) - a *  temp1.getTime();
								timeStemp[run].height = Math.round(a * temp2.getTime() + b);
							}
							break;
						}
					}
					if (!timeStemp[run].height) timeStemp[run].height = Number(result.height[result.height.length - 1].value);
				}
			
				if (result.weight.length === 1) {
					timeStemp[run].weight = result.weight[0].value;
				} else {
					for (let i in result.weight) {
						let temp1 = new Date(result.weight[i].time);
						let temp2 = new Date(timeStemp[run].time);
						if (temp1 == temp2) {
							timeStemp[run].weight = Number(result.weight[i].value);
							break;
						} else if (temp1 > temp2) {
							if (Number(i) === 0) {
								timeStemp[run].weight = Number(result.weight[i].value);
							}	else if (Number(i) !== (result.weight.length - 1)) {
								let temp3 = new Date(result.weight[Number(i) - 1].time);
								let a = (Number(result.weight[Number(i) - 1].value) - Number(result.weight[i].value)) / (temp3.getTime() - temp1.getTime());
								let b = Number(result.weight[i].value) - a *  temp1.getTime();
								timeStemp[run].weight = Math.round(a * temp2.getTime() + b);
							}
							break;
						}
					}
					if (!timeStemp[run].weight) timeStemp[run].weight = Number(result.weight[result.weight.length - 1].value);
				}

				if (result.diastolic.length === 1) {
					timeStemp[run].diastolic = result.diastolic[0].value;
				} else {
					for (let i in result.diastolic) {
						let temp1 = new Date(result.diastolic[i].time);
						let temp2 = new Date(timeStemp[run].time);
						if (temp1 == temp2) {
							timeStemp[run].diastolic = Number(result.diastolic[i].value);
							break;
						} else if (temp1 > temp2) {
							if (Number(i) === 0) {
								timeStemp[run].diastolic = Number(result.diastolic[i].value);
							}	else if (Number(i) !== (result.diastolic.length - 1)) {
								let temp3 = new Date(result.diastolic[Number(i) - 1].time);
								let a = (Number(result.diastolic[Number(i) - 1].value) - Number(result.diastolic[i].value)) / (temp3.getTime() - temp1.getTime());
								let b = Number(result.diastolic[i].value) - a *  temp1.getTime();
								timeStemp[run].diastolic = Math.round(a * temp2.getTime() + b);
							}
							break;
						}
					}
					if (!timeStemp[run].diastolic) timeStemp[run].diastolic = Number(result.diastolic[result.diastolic.length - 1].value);
				}

				if (result.glucoseBlood.length === 1) {
					timeStemp[run].glucoseBlood = result.glucoseBlood[0].value;
				} else {
					for (let i in result.glucoseBlood) {
						let temp1 = new Date(result.glucoseBlood[i].time);
						let temp2 = new Date(timeStemp[run].time);
						if (temp1 == temp2) {
							timeStemp[run].glucose = Number(result.glucoseBlood[i].value);
							break;
						} else if (temp1 > temp2) {
							if (Number(i) === 0) {
								timeStemp[run].glucose = Number(result.glucoseBlood[i].value);
							}	else if (Number(i) !== (result.glucoseBlood.length - 1)) {
								let temp3 = new Date(result.glucoseBlood[Number(i) - 1].time);
								let a = (Number(result.glucoseBlood[Number(i) - 1].value) - Number(result.glucoseBlood[i].value)) / (temp3.getTime() - temp1.getTime());
								let b = Number(result.glucoseBlood[i].value) - a *  temp1.getTime();
								timeStemp[run].glucose = Math.round(a * temp2.getTime() + b);
							}
							break;
						}
					}
					if (!timeStemp[run].glucose) timeStemp[run].glucose = Number(result.glucoseBlood[result.glucoseBlood.length - 1].value);
				}
			}
			
			result.predict = predict.predictFCM(timeStemp, 5);
			result.bmi = [];
			for (let i in timeStemp) {
				if (timeStemp[i].time) {
					result.bmi.push({
						time: timeStemp[i].time,
						value: (timeStemp[i].weight / (timeStemp[i].height * timeStemp[i].height / 10000)).toFixed(2),
					});
				}
			}

			delete result.weight;
			delete result.height;

			res.status(200)
				.json({
					status: 'success',
					message: 'Retrieved diabete patient id = ' + req.query.id,
					data: result
				});
		} else {
			res.status(200)
				.json({
					status: 'fail',
					message: 'Patient not exist'
				});
		}
	}).catch(error => {
		return next(error);
	});
}

function getFullAllPatients(req, res, next) {
	db.task('get-everything', t => {
		return t.batch([
			t.any('select p.subject_id as id, p.gender, p.dob, da.diagnosis '
				+ 'from patients p join diabete_admissions da on p.subject_id = da.subject_id'),
			t.any('select subject_id as id, itemid, value, charttime as time from chartevents '
				+ 'where subject_id in (select subject_id from diabete_admissions) '
				+ 'and(itemid = $1 or itemid = $2 or itemid = $3 or itemid = $4 or itemid = $5) '
				+ 'order by subject_id, charttime asc', 
			[constant.NBPdiastolic, constant.weight, constant.height, constant.pregnant, constant.newNBPdiastolic]
			),
			t.any('select subject_id as id, itemid, value, charttime as time ' 
				+ 'from labevents '
				+ 'where subject_id in (select subject_id from diabete_admissions) ' 
				+ 'and itemid in ($1) '
				+ 'order by subject_id, charttime asc'
				, [constant.glucoseBlood]),
		]);
	}).then(data => {
		var listPatients = data[0];
		var listLabitems = data[1];
		var listGlucose = data[2];

		for (let i = 0; i < listPatients.length; i++) {
			var chartDate;

			listPatients[i].Pregnancies = 0;
			listPatients[i].Glucose = -1;	
			listPatients[i].BloodPressure = 72;
			listPatients[i].SkinThickness = 21;
			listPatients[i].Insulin = 80;
			listPatients[i].BMI = -1;
			listPatients[i].DiabetesPedigreeFunction = 0.373;
			listPatients[i].Age = -1;
			listPatients[i].Outcome = 1;

			listPatients[i].weight = -1;
			listPatients[i].height = -1;
			listPatients[i].dob = listPatients[i].dob;
	
			for (let j = 0; j < listLabitems.length; j++) {
				if (listPatients[i].id < listLabitems[j].id) break;
				else if (listPatients[i].id === listLabitems[j].id) {
					switch (listLabitems[j].itemid) {
					case (constant.NBPdiastolic):
						listPatients[i].BloodPressure = Number(listLabitems[j].value);
						chartDate = listLabitems[j].time;
						break;
					case (constant.weight):
						listPatients[i].weight = Number(listLabitems[j].value);
						break;
					case (constant.height):
						listPatients[i].height = Number(listLabitems[j].value);
						break;
					case (constant.pregnant):
						listPatients[i].Pregnancies = Number(listLabitems[j].value);
						break;
					case (constant.newNBPdiastolic):
						listPatients[i].BloodPressure = Number(listLabitems[j].value);
						chartDate = listLabitems[j].time;
						break;
					}
					
				}
			}

			for (let j = 0; j < listGlucose.length; j++) {
				if (listPatients[i].id < listGlucose[j].id) break;
				else if (listPatients[i].id === listGlucose[j].id) {
					listPatients[i].Glucose = Number(listGlucose[j].value);
				}
			}

			if (listPatients[i].height === -1) {
				if (listPatients[i].gender === 'M') {
					listPatients[i].height = 177;
				} else {
					listPatients[i].height = 166;
				}
			}

			if (listPatients[i].height <= 100) {
				listPatients[i].height = listPatients[i].height * 2.54;
			}

			if (listPatients[i].weight === -1) {
				listPatients[i].weight = 57.7;
			}

			listPatients[i].BMI = (listPatients[i].weight / (listPatients[i].height * listPatients[i].height / 10000)).toFixed(1);
			listPatients[i].Age = (new Date(chartDate)).getFullYear() - (new Date(listPatients[i].dob)).getFullYear();

			if (listPatients[i].Age > 100) {
				listPatients[i].Age = listPatients[i].Age - 30;
			} else if (listPatients[i].Age > 70) {
				listPatients[i].Age = listPatients[i].Age - 20;
			} else if (listPatients[i].Age < 10) {
				listPatients[i].Age = listPatients[i].Age + 30;
			}

			if (listPatients[i].gender === 'F') {
				if (listPatients[i].Age > 27) {
					listPatients[i].Pregnancies = 1;
				} else if (listPatients[i].Age > 30) {
					listPatients[i].Pregnancies = 2;
				}
			}

			delete listPatients[i].id;
			delete listPatients[i].dob;
			delete listPatients[i].weight;
			delete listPatients[i].height;
			delete listPatients[i].gender;
			delete listPatients[i].diagnosis;
		}

		res.status(200)
			.json({
				status: 1,
				message: 'Retrieved ALL diabete patients',
				length: listPatients.length,
				data: listPatients
			});
	}).catch(error => {
		return next(error);
	});
}

module.exports = {
	getAllPatients: getAllPatients,
	getFullAllPatients: getFullAllPatients,
	getPatient: getPatient,
};

