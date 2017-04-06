var util = require('util');
var bleno = require('bleno');


var HackmelockCmdCharacteristic = require('./hackmelock-cmd-characteristic');
var HackmelockDatatransferCharacteristic = require('./hackmelock-datatransfer-characteristic');
var HackmelockStatusCharacteristic = require('./hackmelock-status-characteristic');

function HackmelockService(hackmelock) {
    bleno.PrimaryService.call(this, {
        uuid: '6834636b-6d33-4c30-634b-357276314333',
        characteristics: [

            new HackmelockCmdCharacteristic(hackmelock),
            new HackmelockDatatransferCharacteristic(hackmelock),
            new HackmelockStatusCharacteristic(hackmelock)

        ]
    });
}

util.inherits(HackmelockService, bleno.PrimaryService);

module.exports = HackmelockService;
