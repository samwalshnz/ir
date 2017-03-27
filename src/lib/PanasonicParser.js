// Generated by CoffeeScript 1.6.3
var EventEmitter, PanasonicParser, util,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

util = require('util');

EventEmitter = require('events').EventEmitter;

const USECPERTICK = 21.333;
const TOLERANCE = 25;
const LTOL = (1.0 - (TOLERANCE/100))
const UTOL = (1.0 + (TOLERANCE/100))
// const TOLERANCE = 1.171876831;


// const PANASONIC_BITS = 56;
const PANASONIC_BITS = 48;
const PANASONIC_HDR_MARK = 3502;
const PANASONIC_HDR_SPACE = 1750;
const PANASONIC_BIT_MARK = 502;
const PANASONIC_ONE_SPACE = 1244;
const PANASONIC_ZERO_SPACE = 400;
const MARK_EXCESS = 100;

PanasonicParser = (function(_super) {
  __extends(PanasonicParser, _super);

  function PanasonicParser(type) {
    this.type = type != null ? type : 'panasonic';
    this.generate = __bind(this.generate, this);
    this.parse = __bind(this.parse, this);
  }

  function matchMark(measuredTicks, desiredUs) {
    let text = '';
  	text += (("Testing mark (actual vs desired): "));
  	text += (measuredTicks);
  	text += (("us vs "));
  	text += (desiredUs);
  	text += ("us");
  	text += (": ");
  	text += (ticksLow(desiredUs));
  	text += ((" <= "));
  	text += (measuredTicks);
  	text += ((" <= "));
  	text += (ticksHigh(desiredUs));

    // console.log(text);


    const isMatch = ((measuredTicks >= ticksLow(desiredUs)) && (measuredTicks <= ticksHigh(desiredUs)));

    // console.log(isMatch);

    return isMatch;
  }

  function matchSpace(measuredTicks, desiredUs) {
    let text = '';
  	text += (("Testing space (actual vs desired): "));
  	text += (measuredTicks);
  	text += (("us vs "));
  	text += (desiredUs);
  	text += ("us");
  	text += (": ");
  	text += (ticksLow(desiredUs));
  	text += ((" <= "));
  	text += (measuredTicks);
  	text += ((" <= "));
  	text += (ticksHigh(desiredUs));

    // console.log(text);


    const isMatch = ((measuredTicks >= ticksLow(desiredUs)) && (measuredTicks <= ticksHigh(desiredUs)));

    // console.log(isMatch);

    return isMatch;
  }

  function ticksLow(desiredUs) {
    return desiredUs * LTOL;
  }

  function ticksHigh(desiredUs) {
    return desiredUs * UTOL;
  }

  PanasonicParser.prototype.parse = function(buffer) {
    var address, codeBin, hi, i, ircode, ircodeInv, j, lo, _i, _j, _ref, _ref1, _ref2, _ref3, _ref4;
    codeBin = '';

    if (buffer.length < 198) {
      return false;
    }

    let index = -2;
    let foundMark = false;

    for (let i = 0;  i < buffer.length;  i++) {
      index+=2;
      foundMark = matchMark(this._getPulseLength(buffer, index), PANASONIC_HDR_MARK );
      if (foundMark){
        break;
      }
    }

    if (foundMark) {
      index+=2;
    }

    let foundSpace = matchSpace(this._getPulseLength(buffer, index), PANASONIC_HDR_SPACE);
    if (!foundSpace) {
      // console.log('hdr space', this._getPulseLength(buffer, index));
      return false ;
    }

    // decode address
    for (let i = 0;  i < PANASONIC_BITS;  i++) {
      index+=4;

      if      (matchSpace(this._getPulseLength(buffer, index),PANASONIC_ONE_SPACE ))  codeBin += '1' ;
      else if (matchSpace(this._getPulseLength(buffer, index),PANASONIC_ZERO_SPACE))  codeBin += '0' ;
      else {
        // return false;
        break;
      }
    }

    // codeBin += '1';
    // index+=1;
    // if      (matchSpace(this._getPulseLength(buffer, index),PANASONIC_ONE_SPACE ))  codeBin += '1' ;
    // else if (matchSpace(this._getPulseLength(buffer, index),PANASONIC_ZERO_SPACE))  codeBin += '0' ;

    // results->value       = (unsigned long)data;
    // results->address     = (unsigned int)(data >> 32);
    // results->decode_type = PANASONIC;
    // results->bits        = PANASONIC_BITS;
    //
    // return true;

    // for (i = _i = 0, _ref = buffer.length - 4; _i <= _ref; i = _i += 2) {
    //   hi = this._getPulseLength(buffer, i);
    //   lo = this._getPulseLength(buffer, i + 2);
    //
    //   if (matchMark(hi, PANASONIC_HDR_MARK) && matchMark(lo, PANASONIC_HDR_SPACE) && i + 4 < buffer.length - 4) {
    //   // if ((3000 < hi && hi < 4000) && (1600 < lo && lo < 1800) && i + 4 < buffer.length - 4) {
    //     codeBin = '';
    //     for (j = _j = _ref1 = i + 4, _ref2 = buffer.length - 4; _j < _ref2; j = _j += 4) {
    //       hi = this._getPulseLength(buffer, j);
    //       lo = this._getPulseLength(buffer, j + 2);
    //       console.log(hi);
    //
    //       if (! matchMark(hi, PANASONIC_BIT_MARK)) return false;
    //
    //       // lo = this._getPulseLength(buffer, j + 2);
    //       if (matchSpace(hi, PANASONIC_ONE_SPACE)) {
    //       // if (1344 > hi && hi > 1144) {
    //         codeBin += '1';
    //       } else if (matchSpace(hi, PANASONIC_ZERO_SPACE)) {
    //         codeBin += '0';
    //       } else {
    //         this.emit('bad-data');
    //         console.log('bad data');
    //         return false;
    //         break;
    //       }
    //     }
    //     break;
    //   }
    // }

    if (codeBin.length >= 32) {
      address = parseInt(codeBin.substring(0, 16), 2);
      ircode = parseInt(codeBin.substring(16, 24), 2);
      // ircodeInv = parseInt(codeBin.substring(24, 32), 2);
      let codeBinary = codeBin.substring(-56);
      ircodeInv = parseInt(codeBin.substring(-56), 2);
      // let code = parseInt(codeBin.substring(55, 32), 2);
      this.emit('receive', {
        value: codeBin,
        address: address,
        inv: ircodeInv,
        codeBinary: codeBinary,
        type: 'panasonic'
      });
      return true;
    } else {
      return false;
    }
  };

  PanasonicParser.prototype.generate = function(cmd, address) {
    var addrBin, buff, c, codeBin, codeBinInv, commandInv, i, _i, _ref;
    codeBin = '0000000000000000'.substring(0, 16 - cmd.toString(2).length) + cmd.toString(2);
    console.log(parseInt(cmd));
    commandInv = (parseInt(cmd) ^ parseInt((new Array(cmd.toString(2).length - 1)).join("1"), 2)).toString(2);
    console.log(commandInv, 'commandInv')
    codeBinInv = '00000000'.substring(0, 16 - commandInv.length) + commandInv;
    console.log(codeBinInv, 'codeBinInv')
    addrBin = '0000000000000000'.substring(0, 16 - address.toString(2).length) + address.toString(2);
    c = addrBin + codeBin + codeBinInv;
    console.log(c);

    // c = '0000000001000000001011110010111101';
    // c = '010000000000010000000001000000001011110010111101';
    // c = '01000000000001';
    buff = new Buffer((c.length * 4))// + ((PANASONIC_HDR_MARK.length / USECPERTICK) * 4) + ((PANASONIC_HDR_SPACE.length / USECPERTICK) * 4));
    // buff.writeUInt16BE(Math.floor(PANASONIC_HDR_MARK, USECPERTICK), i * 4);
    // buff.writeUInt16BE(Math.floor(PANASONIC_HDR_SPACE, USECPERTICK), i * 4);
    for (i = _i = 0, _ref = c.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      buff.writeUInt16BE(Math.floor(PANASONIC_ZERO_SPACE, USECPERTICK), i * 4);
      if (c.charAt(i) === '0') {
        buff.writeUInt16BE(Math.floor(PANASONIC_ZERO_SPACE, USECPERTICK), (i * 4) + 2);
      } else {
        buff.writeUInt16BE(Math.floor(PANASONIC_ONE_SPACE, USECPERTICK), (i * 4) + 2);
      }
    }
    return Buffer.concat([Buffer([0x01, 0xAC, 0x00, 0xD6]), buff, Buffer([0xFF, 0xFF])]);
  };

  PanasonicParser.prototype._getBinary = function(val) {
    return '00000000'.substring(0, 8 - val.toString(2).length) + val.toString(2);
  };

  PanasonicParser.prototype._getPulseLength = function(buffer, index) {
    if (index > buffer.length - 2) {
      console.log("Index to large! " + index + " for buff of " + buffer.length + " ");
      return 0;
    } else {
      return Math.floor(USECPERTICK * buffer.readUInt16BE(index));
    }
  };

  return PanasonicParser;

})(EventEmitter);

module.exports = PanasonicParser;
