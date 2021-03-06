var fs = require('fs');
var parse = require('csv-parse');
var leftPad = require('left-pad')

const args = process.argv;
console.log(args);

var srcFile;
// check parameter
if (args[2] == null) {
  console.log('$>node busan_csv_convert.js csvfilename!!!!');
  console.log('ex) $>node busan_csv_convert.js ../source/busan_tb_node_raw_1215.csv');
  process.exit(1);
}
srcFile = args[2];

// check if file exists
if (fs.existsSync(srcFile)) {
  console.log('Found file ' + srcFile);
} else {
  console.log('Not Found file ' + srcFile);
  process.exit(1);
}

var tb_node_raw = fs.readFileSync(srcFile, 'utf8');
parse(tb_node_raw, {comment:"#"}, function(csv_err, csv_data){
  if (csv_err) {
    return console.log(csv_err);
  }
  var geo_meta = {};
  // console.log(c_meta);
  console.log(csv_data.length);
  // console.log("%j",csv_data[0]);
  // console.log("%j",csv_data[1]);
  // console.log("%j",csv_data[2]);

  // 1. Node에 대한 geo meta 정보를 node_geo.json 파일로 생성한다.
  for(var cd=1; cd< csv_data.length ; cd+=1) {
    var dataIn = csv_data[cd];
    // Node의 Unigue GEO 정보를 node_geo.json에서 읽는다.
    if (dataIn[22] !== "") {
      geo_meta[dataIn[0]] = {GEO_LON : dataIn[21], GEO_LAT : dataIn[22]};
    }

  }
  // 2. Node의 GEO 정보를 파일로 저장한다.
  geo_meta = JSON.stringify(geo_meta,null,'\t');
  fs.writeFileSync('./node_geo.json', geo_meta);
  console.log('Completed to generate node_geo.json File!!!');
  // process.exit(1);

  // 3. Node별 geo meta 정보 파일을 읽는다.
  var c_meta = require('./node_geo.json');

  // 4.corecode log 파일을 일자별로 생성한다.
  for(var cd=1; cd< csv_data.length ; cd+=1) {
  // for(var cd=1; cd< 1000 ; cd++){
    var dataIn = csv_data[cd];

    // console.log("datain : %j", dataIn);
    // console.log("data[0] : %j, %j", dataIn[0], dataIn[1]);
    // console.log(dataIn[0]==dataIn[1]);

    var node_id = dataIn[0];
    var ldateTemp = dataIn[2].substring(0,10).split('-');
    var ldate = new Date(dataIn[3]);
    // console.log(dataIn[0] + ", " + dataIn[3]);

    if (dataIn[22] === "") {
      try {
        dataIn[22] = c_meta[dataIn[0]].GEO_LAT;
      } catch(e) {
        console.log("Not found geo data => data[0] : %j, %j", dataIn[0], dataIn[1]);
      }
    }
    if (dataIn[21] === "") {
      try {
        dataIn[21] = c_meta[dataIn[0]].GEO_LON;
      } catch(e) {
        ;
      }
    }
    console.log("%s, %s, %s, %s", dataIn[0], dataIn[3], dataIn[22], dataIn[21]);

    // console.log("node_id : " + node_id);
    var s_logs = {
      "event_time" : ldate,
      "node_id" : node_id,
      "event_type" : dataIn[1],
      "measure_time" : dataIn[2],
      "voltage" : dataIn[4],
      "ampere" : dataIn[5],
      "power_factor" : dataIn[6],
      "active_power" : dataIn[7],
      "reactive_power" : dataIn[8],
      "apparent_power" : dataIn[9],
      "amount_of_active_power" : dataIn[10],
      "als_level" : dataIn[11],
      "dimming_level" : dataIn[12],
      "vibration_x" : dataIn[13],
      "vibration_y" : dataIn[14],
      "vibration_z" : dataIn[15],
      "vibration_max" : dataIn[16],
      "noise_origin_decibel" : dataIn[17],
      "noise_origin_frequency" : dataIn[18],
      "noise_decibel" : dataIn[19],
      "noise_frequency" : dataIn[20],
      "gps_longitude" : dataIn[21],
      "gps_latitude" : dataIn[22],
      "gps_altitude" : dataIn[23],
      "gps_satellite_count" : dataIn[24],
      "status_als" : dataIn[25],
      "status_gps" : dataIn[26],
      "status_noise" : dataIn[27],
      "status_vibration" : dataIn[28],
      "status_power_meter" : dataIn[29],
      "status_emergency_led_active" : dataIn[30],
      "status_self_diagnostics_led_active" : dataIn[31],
      "status_active_mode" : dataIn[32],
      "status_led_on_off_type" : dataIn[33],
      "reboot_time" : dataIn[34],
      "event_remain" : dataIn[35],
      "failfirmwareupdate" : dataIn[36],
      "node_geo" : {
        "lat" : dataIn[22],
        "lon" : dataIn[21],
      }
    }

    //console.log("%j",s_logs);
    //console.log(ldate.toISOString().slice(0,10).replace(/-/g,""));
    var fileName = "corecode_"+ldateTemp[0]+leftPad(ldateTemp[1], 2, '0')+leftPad(ldateTemp[2], 2, '0')+".log";
    //var fileName = "1to4_"+ldate.toISOString().slice(0,10).replace(/-/g,"")+".log";
    var path_file = "../data/"+fileName;

    // for test, truncate file
    if (cd == 1 && fs.existsSync(path_file)) {
      fs.truncateSync(path_file, 0);
    }
    var logdata = JSON.stringify(s_logs)+"\n";
    fs.appendFileSync(path_file, logdata);
  }
  console.log('Completed to generate log file by day (totalcount : ' + csv_data.length + ')!!!');
});
