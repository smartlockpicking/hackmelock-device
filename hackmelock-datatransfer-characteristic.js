var util = require('util');
var bleno = require('bleno');
//var hackmelock = require('./hackmelock');

function HackmelockDatatransferCharacteristic(hackmelock) {
  bleno.Characteristic.call(this, {
    uuid: '6834636b-6d33-4c30-634b-436852443454',
    properties: ['indicate', 'notify'],
    descriptors: [
      new bleno.Descriptor({
        uuid: '2901',
        value: 'Hackmelock data transfer'
      })
    ]
  });

  this._updateValueCallback = null;
  this.hackmelock = hackmelock;
}

util.inherits(HackmelockDatatransferCharacteristic, bleno.Characteristic);


HackmelockDatatransferCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('DataTransfer - onSubscribe');

  this.hackmelock.dataTransferUpdateValueCallback = updateValueCallback;


};
  
HackmelockDatatransferCharacteristic.prototype.onUnsubscribe = function() {
  console.log('Datatransfer - onUnsubscribe');

  this.hackmelock.dataTransferUpdateValueCallback = null;

};

/*
HackmelockDatatransferCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  this._value = data;

  console.log('DTCharacteristic - onWriteRequest: value = ' + this._value.toString('hex'));

  if (this.hackmelock._updateValueCallback) {
    console.log('DTCharacteristic - onWriteRequest: notifying');

    this._updateValueCallback(this._value);
  }
  
  callback(this.RESULT_SUCCESS);
};
*/


module.exports = HackmelockDatatransferCharacteristic;