var util = require('util');
var events = require('events');
var crypto = require('crypto');
var fs = require('fs');
var colors = require('colors')

var randomChallenge;
var authenticated;
var initialized;
var status;
var config={}
var iBeaconMajor
var iBeaconMinor
var dataTransferMode;

var statusAuthenticated = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
var statusConfigMode =    "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";
var statusSettingSet =    "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC";

var status;
var subscribe=false;

var dataTransferUpdateValueCallback;


function Hackmelock() {
  events.EventEmitter.call(this);
  this.randomChallenge={};
  this.authenticated=false;
  this.dataTransferMode=false;
  this.configFile = 'config.txt';

  this.initCounter=0;

  //if initialized (file config.txt exists), load config - else initialization mode
  try {
      fs.accessSync(this.configFile, fs.F_OK);
      this.loadConfig(this.configFile);
      this.initialized=true;
  } catch (e) {
      //file does not exist, initialization mode
      this.initialized=false;
      this.status=statusConfigMode;
      this.iBeaconMajor=1;
      this.iBeaconMinor=1;
  }

}

util.inherits(Hackmelock, events.EventEmitter);


Hackmelock.prototype.loadConfig = function(configFile) {
  this.config = fs.readFileSync(configFile).toString().split("\n");
  //pop last empty line
  this.config.pop();

  for (i=this.config.length; i<128; i++) {
    this.config.push('000000000000000000000000')
  }

//  for(i in this.config) {
//    console.log(this.config[i].toString('hex'));
//  }

  //ex. b276484e, maj=b276 (45686) min=484e (18510)
  this.iBeaconMajor = Number('0x' + this.config[0].substring(0,4)).toString(10);
  this.iBeaconMinor = Number('0x' + this.config[0].substring(4,8)).toString(10);

  console.log('Config loaded - iBeaconMajor: ' + this.iBeaconMajor + ' iBeaconMinor: ' + this.iBeaconMinor);
}


Hackmelock.prototype.sendNotification = function() {
  if (!this.dataTransferMode) {
    this.notifyUpdateValueCallback(new Buffer(this.status))  
  }
}


Hackmelock.prototype.dataTransfer = function(callback) {

    if (typeof this.dataTransferUpdateValueCallback != 'function') {
      console.log(' -- not subscribed - exiting!')
      callback();
    }
    else {
      console.log('initializing data transfer... ');
      this.dataTransferMode=true;


      //must be sent with delay
      var interval = 100; // 100 millisec;

      //first 25 lines of config
      var configLinesToTransfer=25;
      for (var i = 0; i < configLinesToTransfer; i++) {
          var _this = this;
          setTimeout( function (i) {
              console.log('DATA TRANSFER : ' + _this.config[i]);
              //_this.notifyUpdateValueCallback(new Buffer(_this.config[i], 'hex'));
              _this.dataTransferUpdateValueCallback(new Buffer(_this.config[i], 'hex'));

              if (i == configLinesToTransfer-1) {
                _this.dataTransferMode=false;
                callback()                      
              }
          }, interval * i, i);
      }
    }
}


Hackmelock.prototype.checkAuthResponse = function(response) {

// debug:

  //last byte = key id
  var key_id=response[16];
  console.log('KEY ID: ' + key_id);
  //first 16 bytes = auth response 
  var authResponse = response.toString('hex').substring(0,32);
  console.log('AUTH RESP: ' + authResponse)


  //calculate tmp enc key = aes(config_key, random_challenge)

  //use indicated key (key_id) from config array 
  //the stored key is 25 bytes long, we fill it with 0s
  var key = Buffer.concat([new Buffer(this.config[1 + key_id],'hex'), new Buffer('00000000','hex')]);

  var login = new Buffer("DDAAFF03040506070809101112131415", 'hex');
  iv = new Buffer(''),

  cipher = crypto.createCipheriv('aes-128-ecb', key, iv);

  if (!this.randomChallenge.length) { console.log('generating new internal random challenge'); this.randomChallenge=generatePseudoRandom(); }
  var key_tmp = Buffer.concat([cipher.update(this.randomChallenge),cipher.final()]);

  //take first 16 bytes
  var key_tmp_16 = new Buffer(16);
  key_tmp.copy(key_tmp_16,0,0,16); 

  console.log('CRYPTED step 1: ' + key_tmp_16.toString('hex'));


  //calculate enc = aes(tmp_key, "login")
  cipher = crypto.createCipheriv('aes-128-ecb', key_tmp_16, iv);
  var fin = Buffer.concat([cipher.update(login),cipher.final()]);
  //take just first 16 bytes
  var fin_16 = new Buffer(16);
  fin.copy(fin_16,0,0,16);

  console.log('CRYPTED final: ' + fin_16.toString('hex'));

  if ( (authResponse === fin_16.toString('hex')) || (authResponse === '4861636b6d654c6f636b4d6173746572')) {
    console.log('AUTHENTICATION OK!'.green);
    this.authenticated = true;
    this.status = statusAuthenticated;
  }
  else {
    this.authenticated=false;
    this.status = '';
    console.log('AUTH PROBLEM!'.red);
  }
//  return (this.authenticated);
//  callback(authenticated);
}



// "Random" number generator based on current temperature indication and serial number
Hackmelock.prototype.generatePseudoRandom = function(){
  var serialNumberLastDigits = parseInt('0b4d',16);

  //the temperature indication in range 20.0 - 25.0 degrees (without "." 200-250)
  var currentTemperature = Math.floor(Math.random() * (250-200) + 200)

  var xored = serialNumberLastDigits^currentTemperature;

  var md5sum=crypto.createHash('md5');
  md5sum.update(xored.toString());
  var pseudoRandomHash = new Buffer(md5sum.digest('hex'),'hex');
  return pseudoRandomHash;
//  console.log(PseudoRandomHash)

}


module.exports.Hackmelock = Hackmelock;