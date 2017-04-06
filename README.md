
Bluetooth Smart Hackmelock Device
==================================

Deliberately vulnerable Bluetooth Low Energy smart lock device emulator, written using Node.js [Bleno package ](https://github.com/sandeepmistry/bleno).
For more information:
https://smartlockpicking.com/hackmelock/

The code is tested to run on Linux (including Debian, Kali), and on Raspberry Pi.

Pre-requisites
--------------

See: https://github.com/sandeepmistry/bleno#prerequisites

You will need a Bluetooth 4 adapter, e.g. CSR-8510-based (most popular) USB dongle, or a built-in one. 

You will also need accompanying Android application:

https://play.google.com/store/apps/details?id=com.smartlockpicking.hackmelock


Installation
-------------

```
git clone https://github.com/smartlockpicking/hackmelock-device/
```

Running
--------

In order to run emulated device, first stop `bluetoothd` service in your system, as it may interfere with bleno library (See also: https://github.com/sandeepmistry/bleno#prerequisites), next power up the Bluetooth interface by hand:

```
sudo systemctl stop bluetooth
sudo hciconfig hci0 up
```

Running the device emulator:


```
$ cd node_modules/hackmelock
$ node peripheral
advertising...
```

Next, follow mobile installation pairing as described [here](https://smartlockpicking.com/hackmelock).


Support
-------

Please file an issue:
https://github.com/smartlockpicking/hackmelock-device

Patches encouraged.


License
--------

Copyright (c) 2017 Slawomir Jasek <hackmelock@smartlockpicking.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
