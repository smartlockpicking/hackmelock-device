var util = require('util');
var bleno = require('bleno');
var fs = require('fs');
var colors = require('colors')

var cmdOpenLock = "aa010203040506070809101112131415";
var cmdCloseLock = "bb010203040506070809101112131415";
var cmdDataTransfer = "01aa0203040506070809101112131415";
var cmdInitConfigMode = "dd010203040506070809101112131415";
var cmdLogin = "ddaaff03040506070809101112131415";

var statusAuthenticated = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
var statusConfigMode = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";

function HackmelockCmdCharacteristic(hackmelock) {
  bleno.Characteristic.call(this, {
    uuid: '6834636b-6d33-4c30-634b-436852436d44',
    properties: ['write'],
    descriptors: [
      new bleno.Descriptor({
        uuid: '2901',
        value: 'Hackmelock command'
      })
    ]
  });

  this.hackmelock = hackmelock;
}

util.inherits(HackmelockCmdCharacteristic, bleno.Characteristic);

HackmelockCmdCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  if (offset) {
    callback(this.RESULT_ATTR_NOT_LONG);
  }

  //initialization mode - write new config.txt
  else if (!this.hackmelock.initialized) {
    console.log('initializing... ' + this.hackmelock.initCounter + ' ' + data.toString('hex'))
    this.hackmelock.initCounter++;

    //tbd - check if file exists, rename old, overwrite?
    fs.appendFileSync(this.hackmelock.configFile, data.toString('hex') + '\n')    

    //config written (25 lines), now switch to initialized status
    if (this.hackmelock.initCounter == 25) {
      this.hackmelock.initialized=true;
      this.hackmelock.loadConfig(this.hackmelock.configFile);
    }
    callback(this.RESULT_SUCCESS);
  }

  else {

    console.log(' >> received cmd: ' + data.toString('hex'));

  // debug
  // console.log("HL @ CMDCHAR: \n\n" + util.inspect(this.hackmelock, {showHidden: false, depth: null}))

    if (!this.hackmelock.authenticated) {
      if (data.length == 17) {
        this.hackmelock.checkAuthResponse(data);
      }
      else {
      //tbd - invalid command - disconnect?
        console.log('invalid command - not authenticated!'.red);
      }
    } else { //authenticated - process command

      switch (data.toString('hex')) {
        //open lock
        case cmdOpenLock: 
                console.log('    Open lock!'.green);
                break;
        //close lock
        case cmdCloseLock: 
                console.log('    Close lock!'.red);
                break;
        //init config mode
        case cmdInitConfigMode:
                console.log('Init config mode!')
                this.hackmelock.initialized=false;
                this.hackmelock.status=statusConfigMode;
                //mv current cfg file, we'll create new one
                fs.renameSync(this.hackmelock.configFile, 'config.bak')
                break;
        //data transfer
        case cmdDataTransfer:
                console.log('Data transfer call!')
                this.hackmelock.dataTransfer(function() {
                  console.log('Data transfer call finished!')
                });
                break;
      }
    }
    callback(this.RESULT_SUCCESS);
  }
};

module.exports = HackmelockCmdCharacteristic;