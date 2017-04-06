var util = require('util');

/* Set advertisement interval to minimum value (20ms). */
process.env.BLENO_ADVERTISING_INTERVAL = 20;

var iBeaconUuid = '6834636b-6d33-4c30-634b-38454163304e';
var bleno = require('bleno');
var hackmelock = require('./hackmelock');
var HackmelockService = require('./hackmelock-service');


var Hackmelock = new hackmelock.Hackmelock();
var hackmelockService = new HackmelockService(Hackmelock);

bleno.on('stateChange', function(state) {
  if (state === 'poweredOn') {

    var measuredPower = -59; // -128 - 127

  bleno.startAdvertisingIBeacon(iBeaconUuid, Hackmelock.iBeaconMajor, Hackmelock.iBeaconMinor, measuredPower, function(err) {
      if (err) {
        console.log(err);
      }
    });
  }
  else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(err) {
  if (!err) {
    console.log('advertising...');
    //
    // Once we are advertising, it's time to set up our services,
    // along with our characteristics.
    //
    bleno.setServices([
      hackmelockService
    ]);
  }
});

bleno.on('accept', function(clientAddress){ // not available on OS X 10.9
  console.log('Client ' + clientAddress + ' connected!');

  if (this.service) {
    console.log("tutaj jeszcze jest...")    
  }
}); 


bleno.on('disconnect', function(clientAddress){ // Linux only
  console.log('Client ' + clientAddress + ' disconnected!')
  Hackmelock.authenticated=false;
  Hackmelock.status='';
  Hackmelock.subscribed=false;

  clearInterval(Hackmelock.clearNotify);


}); 
