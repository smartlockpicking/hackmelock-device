var util = require('util');
var bleno = require('bleno');
var crypto = require('crypto');
var async = require('async');

var statusAuthenticated = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
var statusConfigMode = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";


function HackmelockStatusCharacteristic(hackmelock) {
  bleno.Characteristic.call(this, {
    uuid: '6834636b-6d33-4c30-634b-436852537434',
    properties: ['read','indicate','notify'],
    descriptors: [
      new bleno.Descriptor({
        uuid: '2901',
        value: 'Hackmelock status'
      })
    ]
  });

  this.hackmelock = hackmelock;
}

util.inherits(HackmelockStatusCharacteristic, bleno.Characteristic);

HackmelockStatusCharacteristic.prototype.onReadRequest = function(offset, callback) {
  if (offset) {
    callback(this.RESULT_ATTR_NOT_LONG, null);
  }
  else {
    console.log('Status read request: ')
    if (!this.hackmelock.initialized) {
      console.log(' Initialization mode!')
      callback(this.RESULT_SUCCESS, new Buffer(statusConfigMode, 'hex'));

    } else if (this.hackmelock.authenticated) {
      console.log(' Returning authenticated status : ' + statusAuthenticated);
      callback(this.RESULT_SUCCESS, new Buffer(statusAuthenticated, 'hex'));

    } else {
      //generate random challenge  
      //this.hackmelock.randomChallenge=crypto.randomBytes(16);

      this.hackmelock.randomChallenge=this.hackmelock.generatePseudoRandom();

      console.log(' AUTH INIT: returning random challenge : ' + this.hackmelock.randomChallenge.toString('hex'));      
      callback(this.RESULT_SUCCESS, this.hackmelock.randomChallenge);
    }
  }
};

module.exports = HackmelockStatusCharacteristic;