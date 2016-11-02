var fs = require('fs');
var parse = require('csv-parse');
var leftPad = require('left-pad')
var s_meta = require('./corecode_meta');

var tb_node_raw = fs.readFileSync('source/tb_node_raw.csv', 'utf8');
parse(tb_node_raw, {comment:"#"}, function(csv_err, csv_data){
  if (csv_err) {
    return console.log(csv_err);
  }
  console.log(csv_data.length);
  console.log("%j",csv_data[0]);
  console.log("%j",csv_data[1]);
  console.log("%j",csv_data[2]);

  for(var cd=1; cd< csv_data.length ; cd+=1){
  // for(var cd=1; cd< 1000 ; cd++){
    var dataIn = csv_data[cd];

    // console.log("datain : %j", dataIn);
    // console.log("data[0] : %j, %j", dataIn[0], dataIn[1]);
    // console.log(dataIn[0]==dataIn[1]);

    var node_id = dataIn[0];
    var ldateTemp = dataIn[2].split('.');
    var ldate = new Date(dataIn[3]);
    console.log(dataIn[0] + ", " + dataIn[3]);

    // for test log,lat
    if (dataIn[22] == "") {
      if (node_id == "0001.00000001") {
        dataIn[22] = "37.5166";
      } else {
        dataIn[22] = "35.17944";
      }
    }
    if (dataIn[21] == "") {
      if (node_id == "0001.00000001") {
        dataIn[21] = "127.029";
      } else {
        dataIn[21] = "129.07556";
      }
    }
    console.log(dataIn[22] + ", " + dataIn[21]);

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
    var path_file = "data/"+fileName;

    // for test, truncate file
    if (cd == 1 && fs.existsSync(path_file)) {
      fs.truncateSync(path_file, 0);
    }
    var logdata = JSON.stringify(s_logs)+"\n";
    fs.appendFileSync(path_file, logdata);

  }

});
