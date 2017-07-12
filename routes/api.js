var database = require('./dbSetting');
var db = database.db;

var constant = require('./defines.js');

function getAllPatients(req, res, next) {
  db.task('get-everything', t => {
    return t.batch([
      t.any('select p.subject_id as id, p.gender, p.dob, da.diagnosis '
          + 'from patients p join diabete_admissions da on p.subject_id = da.subject_id'),
      t.any('select subject_id as id, itemid, value, charttime from labevents '
          + 'where subject_id in (select subject_id from diabete_admissions) '
          + 'and itemid = $1 '
          + 'order by subject_id, charttime asc', constant.hemoA1c)
    ]);
  })
  .then(data => {
    var listPatients = data[0];
    var listLabitems = data[1];

    for (i = 0; i < listPatients.length; i++) {
      for (j = 0; j < listLabitems.length; j++) {
        if (listPatients[i].id < listLabitems[j].id) break;
        else if (listPatients[i].id === listLabitems[j].id) {
          if (listPatients[i].hemoA1c == null) listPatients[i].hemoA1c = [];
          listPatients[i].hemoA1c.push({
            time: listLabitems[j].charttime,
            value: listLabitems[j].value
          })
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
  })
  .catch(error => {
    return next(error);
  });
};

function getPatient(req, res, next) {
  db.task('get-everything', t => {
    return t.batch([
      t.any('select itemid, value, charttime as time ' 
          + 'from chartevents '
          + 'where subject_id = $1 ' 
          + 'and (itemid = $2 or itemid = $3) '
          + 'order by charttime asc'
          , [req.query.id, constant.NBPsystolic, constant.NBPdiastolic]),
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
      t.any('select chartdate, category, description, text ' 
          + 'from noteevents '
          + 'where subject_id = $1 '
          + 'order by chartdate asc'
          , req.query.id)
    ]);
  })
  .then(data => {
    var listItems = data[0];
    var listLabitems = data[1];

    var result = {
      NBP: {
        time: [],
        systolic: [],
        diastolic: []
      },
      hemoA1c: [],
      glucoseBlood: [],
      glucoseUrine: [],
      creatinine: [],
      albumin: [],
      choles: [],
      trigly: []
    }

    for (var i in listItems){
      if (listItems[i].itemid == constant.NBPsystolic) {
        result.NBP.time.push(listItems[i].time);
        result.NBP.systolic.push(listItems[i].value)
      } else if (listItems[i].itemid = constant.NBPdiastolic) {
        result.NBP.diastolic.push(listItems[i].value);
      }
    }   

    for (var i in listLabitems){
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
    
    res.status(200)
      .json({
        status: 'success',
        message: 'Retrieved diabete patient id = ' + req.query.id,
        data: data[2]
      });
  })
  .catch(error => {
    return next(error);
  });
};

module.exports = {
  getAllPatients: getAllPatients,
  getPatient: getPatient
};

