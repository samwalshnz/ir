import IRToy from './src/lib/IRToy';

import HandanParser from './src/lib/HandanParser';
import NecParser from './src/lib/NecParser';
import PanasonicParser from './src/lib/PanasonicParser';

const toy = new IRToy(() => {
  let code = findCodeByKey('KEY_POWER', remoteCodes);
  let cmd = 224;
  console.log(code);
  console.log(parseInt(code,16));
  console.log(parseInt(code,16).toString(2));
  const bin = parseInt(code,16).toString(2);
  code = bin.substring(bin.length - 16);
  console.log(code);
  let hex = binaryToHex(code).result;
  console.log(hex);
  code = parseInt(hex, 16);
  console.log(code);
  // console.log(cmd.toString(2));
  // console.log(parseInt(code,16));
  // console.log(code);
  // console.log(code.toString(32));
  setTimeout(() => {
    toy.transmit({
      type: 'panasonic',
      address: 16388,
      code: parseInt(code,16),
      // code: findCodeByKey('KEY_POWER', remoteCodes),
    })
  },2000)
});

const nec = new NecParser();
const handan = new HandanParser();
const panasonic = new PanasonicParser();

// toy.registerParser(nec);
// toy.registerParser(handan);
toy.registerParser(panasonic);

const remoteCodes = [
  { 'key':'KEY_0', 'hex': '0x400401009899', },
  { 'key':'KEY_1', 'hex': '0x400401000809', },
  { 'key':'KEY_2', 'hex': '0x400401008889', },
  { 'key':'KEY_3', 'hex': '0x400401004849', },
  { 'key':'KEY_4', 'hex': '0x40040100C8C9', },
  { 'key':'KEY_5', 'hex': '0x400401002829', },
  { 'key':'KEY_6', 'hex': '0x40040100A8A9', },
  { 'key':'KEY_7', 'hex': '0x400401006869', },
  { 'key':'KEY_8', 'hex': '0x40040100E8E9', },
  { 'key':'KEY_9', 'hex': '0x400401001819', },
  { 'key':'KEY_POWER', 'hex': '0x40040100BCBD', },
  { 'key':'KEY_RIGHT', 'hex': '0x40040100F2F3', },
  { 'key':'KEY_LEFT', 'hex': '0x400401007273', },
  { 'key':'KEY_UP', 'hex': '0x400401005253', },
  { 'key':'KEY_DOWN', 'hex': '0x40040100D2D3', },
  { 'key':'KEY_BLUE', 'hex': '0x40040100CECF', },
  { 'key':'KEY_RED', 'hex': '0x400401000E0F', },
  { 'key':'KEY_GREEN', 'hex': '0x400401008E8F', },
  { 'key':'KEY_YELLOW', 'hex': '0x400401004E4F', },
  { 'key':'KEY_TV', 'hex': '0x400401400C4D', },
  { 'key':'KEY_BACK', 'hex': '0x400401002B2A', },
  { 'key':'KEY_SCREEN', 'hex': '0x40040100C6C7', },
  { 'key':'KEY_OPTION', 'hex': '0x40040190E574', },
  { 'key':'KEY_INFO', 'hex': '0x400401009C9D', },
  { 'key':'KEY_EXIT', 'hex': '0x40040100CBCA', },
  { 'key':'KEY_EPG', 'hex': '0x40040190E170', },
  { 'key':'KEY_MENU', 'hex': '0x400401004A4B', },
  { 'key':'KEY_MEDIA', 'hex': '0x40040190D544', },
  { 'key':'KEY_VOLUMEUP', 'hex': '0x400401000405', },
  { 'key':'KEY_VOLUMEDOWN', 'hex': '0x400401008485', },
  { 'key':'KEY_CHANNELUP', 'hex': '0x400401002C2D', },
  { 'key':'KEY_CHANNELDOWN', 'hex': '0x40040100ACAD', },
  { 'key':'KEY_ZOOM', 'hex': '0x400401207B5A', },
  { 'key':'KEY_OK', 'hex': '0x400401009293', },
  { 'key':'KEY_TEXT', 'hex': '0x40040180C041', },
  { 'key':'KEY_SUBTITLE', 'hex': '0x40040180A021', },
  { 'key':'KEY_MUTE', 'hex': '0x400401004C4D', },
  { 'key':'KEY_LAST', 'hex': '0x40040100ECED', },
  { 'key':'KEY_SWITCHVIDEOMODE', 'hex': '0x40040100A0A1', },
];

function findKeyByCode(code, remoteCodes) {
  const hexCode = code.replace('0x','');

  for (let i in remoteCodes) {
    let remoteCode = remoteCodes[i];
    if (remoteCode.hex.replace('0x','')  === hexCode) {
      return remoteCode.key;
    }
  }
}

function findCodeByKey(key, remoteCodes) {
  for (let i in remoteCodes) {
    let remoteCode = remoteCodes[i];
    if (remoteCode.key === key) {
      return remoteCode.hex;
    }
  }
}

toy.on('ircodereceived', function(ir_code) {
  console.log("Code received from IR remote", ir_code);
  const hex = binaryToHex(ir_code.codeBinary).result;
  const key = findKeyByCode(hex, remoteCodes);
  console.log(key);
  console.log(ir_code.code);
  console.log(ir_code.address);
  // return toy.transmit({
  //   address: 8403,
  //   code: 224,
  //   type: 'handan'
  // });
});
//
// toy.transmit({
//   type: 'panasonic',
//   address: 16388,
//   code: findCodeByKey('KEY_POWER', remoteCodes),
// })

toy.on('bad-data', function(err,two) {
  console.log(err, two, 'damn');
})

toy.on('receive', function(data) {
  console.log(data);
})

// import IRToy from './steward';

// IRToy.Device

// import SerialPort from 'serialport';
//
// function isIRToy(port) {
//   return port.vendorId === '0x04d8' && port.productId === '0xfd08' && port.manufacturer === 'DangerousPrototypes.com';
// }
//
// let irPort;
//
// let info;
//
// SerialPort.list((err, ports) => {
//   ports.forEach(port => {
//     if (isIRToy(port)) {
//       console.log(port.comName);
//       irPort = new SerialPort(port.comName, {
//         baudRate: 9600,
//         buffersize: 512,
//         autoOpen: false,
//         parser: SerialPort.parsers.raw,
//       })
//
//       irPort.open(err => {
//         if (err) {
//           return console.log('Error opening port: ', err.message);
//         }
//
//         console.log('opening');
//       });
//
//       irPort.on('data', function (data) {
//         // var event, eventID, signal;
//         //
//         // signal = data.toString('hex');
//         //
//         //
//         // // TBD: transform signal as appropriate!
//         //
//         //
//         // self.info.signal = signal;
//         // self.changed();
//         //
//         // for (eventID in self.events) if (self.events.hasOwnProperty(eventID)) {
//         //   event = self.events[eventID];
//         //
//         //   if ((!event.params.signal) || (event.params.signal === signal)) steward.observed(eventID);
//         // }
//       });
//     }
//   })
// })

// converts binary string to a hexadecimal string
// returns an object with key 'valid' to a boolean value, indicating
// if the string is a valid binary string.
// If 'valid' is true, the converted hex string can be obtained by
// the 'result' key of the returned object
function binaryToHex(s) {
    var i, k, part, accum, ret = '';
    for (i = s.length-1; i >= 3; i -= 4) {
        // extract out in substrings of 4 and convert to hex
        part = s.substr(i+1-4, 4);
        accum = 0;
        for (k = 0; k < 4; k += 1) {
            if (part[k] !== '0' && part[k] !== '1') {
                // invalid character
                return { valid: false };
            }
            // compute the length 4 substring
            accum = accum * 2 + parseInt(part[k], 10);
        }
        if (accum >= 10) {
            // 'A' to 'F'
            ret = String.fromCharCode(accum - 10 + 'A'.charCodeAt(0)) + ret;
        } else {
            // '0' to '9'
            ret = String(accum) + ret;
        }
    }
    // remaining characters, i = 0, 1, or 2
    if (i >= 0) {
        accum = 0;
        // convert from front
        for (k = 0; k <= i; k += 1) {
            if (s[k] !== '0' && s[k] !== '1') {
                return { valid: false };
            }
            accum = accum * 2 + parseInt(s[k], 10);
        }
        // 3 bits, value cannot exceed 2^3 - 1 = 7, just convert
        ret = String(accum) + ret;
    }
    return { valid: true, result: ret };
}

// converts hexadecimal string to a binary string
// returns an object with key 'valid' to a boolean value, indicating
// if the string is a valid hexadecimal string.
// If 'valid' is true, the converted binary string can be obtained by
// the 'result' key of the returned object
function hexToBinary(s) {
    var i, k, part, ret = '';
    // lookup table for easier conversion. '0' characters are padded for '1' to '7'
    var lookupTable = {
        '0': '0000', '1': '0001', '2': '0010', '3': '0011', '4': '0100',
        '5': '0101', '6': '0110', '7': '0111', '8': '1000', '9': '1001',
        'a': '1010', 'b': '1011', 'c': '1100', 'd': '1101',
        'e': '1110', 'f': '1111',
        'A': '1010', 'B': '1011', 'C': '1100', 'D': '1101',
        'E': '1110', 'F': '1111'
    };
    for (i = 0; i < s.length; i += 1) {
        if (lookupTable.hasOwnProperty(s[i])) {
            ret += lookupTable[s[i]];
        } else {
            return { valid: false };
        }
    }
    return { valid: true, result: ret };
}
