// Generated by CoffeeScript 1.6.3
var EventEmitter, IRToy, SerialPort, async, delay, list,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

SerialPort = require("serialport");

list = require("serialport").list;

EventEmitter = require('events').EventEmitter;

async = require('async');

delay = function(ms, func) {
  return setTimeout(func, ms);
};

IRToy = (function(_super) {
  __extends(IRToy, _super);

  function IRToy(onReady) {
    this.writeData = __bind(this.writeData, this);
    this.cleanUp = __bind(this.cleanUp, this);
    this.parseData = __bind(this.parseData, this);
    this.handleReceivedData = __bind(this.handleReceivedData, this);
    this.transmitHandshakeData = __bind(this.transmitHandshakeData, this);
    this.transmitCode = __bind(this.transmitCode, this);
    this.transmit = __bind(this.transmit, this);
    this.onOpen = __bind(this.onOpen, this);
    this.onReceive = __bind(this.onReceive, this);
    this.findIRToy = __bind(this.findIRToy, this);
    this.dataCallBack = null;
    this.codeParsed = false;
    this.transmited = 0;
    this.timeOut = null;
    this.rBuff = new Buffer([]);
    this.tBuff = new Buffer([]);
    this.buffers = [];
    this.parsers = new Array();
    this.processing = false;
    this.onReady = __bind(onReady, this);
    this.findIRToy();
  }

  IRToy.prototype.findIRToy = function() {
    var _this = this;
    return list(function(err, ports) {
      var port, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = ports.length; _i < _len; _i++) {
        port = ports[_i];
        if (port.productId == '0xfd08' && port.vendorId == '0x04d8') {
        // if (port.pnpId === "usb-Dangerous_Prototypes_CDC_Test_00000001-if00") {
          _results.push(_this.onFindIrToy(port.comName));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    });
  };

  IRToy.prototype.onFindIrToy = function(serial_path) {
    var _this = this;
    if (serial_path != null) {
      this.sp = new SerialPort('/dev/cu.usbmodem1421', {
      // this.sp = new SerialPort(serial_path, {
        baudRate: 19200,
        // baudRate: 9600,
        bufferSize: 512,
        // buffersize: 4096,
        autoOpen: false,
        parser: SerialPort.parsers.raw,
        // highWaterMark: 512,
        // parser: SerialPort.parsers.byteLength(),
        // parser: SerialPort.parsers.byteLength(134),
        // parser: SerialPort.parsers.byteDelimiter([0,512]),
      });
      this.sp.on('open', this.onOpen);
      this.sp.on('data', function(data) {
        if (_this.dataCallBack != null) {
          return _this.dataCallBack(data);
        }
      });
      return this.sp.open();
    }
  };

  IRToy.prototype.registerParser = function(parser) {
    var _this = this;
    parser.on('receive', this.onReceive);
    parser.on('bad-data', function() {
      _this.cleanUp();
      return _this.onOpen();
    });
    return this.parsers.push(parser);
  };

  IRToy.prototype.onReceive = function(ir_code) {
    return this.emit('ircodereceived', ir_code);
  };

  IRToy.prototype.onOpen = function(args) {
    var that;
    that = this;
    return async.series([
      function(cb) {
        that.writeData([0xFF, 0xFF]);
        return delay(25, function() {
          return cb(null);
        });
      },
       function(cb) {
        that.writeData([0x00, 0x00, 0x00, 0x00, 0x00]);
        return delay(20, function() {
          return cb(null);
        });
      }, function(cb) {
        that.writeData('S', that.handleReceivedData);
        return delay(20, function() {
          return cb(null);
        });
      }
    ], (err, results) => {
      if (typeof this.onReady === 'function') {
        this.onReady();
      }
    });
  };

  IRToy.prototype.transmit = function(ircode) {
    var parser, _i, _len, _ref, _results;
    _ref = this.parsers;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      parser = _ref[_i];
      if (parser.type === ircode.type) {
        this.transmitCode(parser.generate(ircode.code, ircode.address));
        break;
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  IRToy.prototype.transmitCode = function(buffer) {
    var that;
    this.tBuff = buffer;
    this.transmited = 0;
    that = this;
    return async.series([
      function(cb) {
        that.writeData([0x00, 0x00, 0x00, 0x00, 0x00]);
        return delay(20, function() {
          return cb(null);
        });
      }, function(cb) {
        that.writeData('S');
        return delay(20, function() {
          return cb(null, Date.now());
        });
      }, function(cb) {
        that.writeData([0x26]);
        return delay(10, function() {
          return cb(null, Date.now());
        });
      }, function(cb) {
        that.writeData([0x25]);
        return delay(10, function() {
          return cb(null, Date.now());
        });
      }, function(cb) {
        that.writeData([0x24]);
        return delay(10, function() {
          return cb(null, Date.now());
        });
      }, function(cb) {
        that.writeData([0x03], that.transmitHandshakeData);
        return delay(10, function() {
          return cb(null, Date.now());
        });
      }
    ]);
  };

  IRToy.prototype.transmitHandshakeData = function(data) {
    var ch, data2Send, end, _i, _len, _results;
    if (parseInt(data[0]) === 62 && this.tBuff.length > this.transmited) {
      end = this.tBuff.length - this.transmited > 62 ? 62 : this.tBuff.length - this.transmited;
      data2Send = this.tBuff.slice(this.transmited, this.transmited + end);
      this.transmited += data2Send.length;
      return this.writeData(data2Send, this.transmitHandshakeData);
    } else {
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        ch = data[_i];
        if (ch === 67 || ch === 70) {
          _results.push(this.onOpen());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  };

  IRToy.prototype.handleReceivedData = function(data) {
    var _this = this;
    if (this.timeOut != null) {
      clearTimeout(this.timeOut);
    }
    if (data.length === 3 && data.toString('ascii') === "S01") {

    } else if (data.length === 2 && data.readUInt16BE(0) === 0xFFFF) {
      this.cleanUp();
    } else {
      if (!this.codeParsed) {
        this.parseData(data);
      }
    }
    if (!!this.codeParsed) {
      return this.timeOut = setTimeout(function() {
        return _this.cleanUp();
      }, 150);
    }
  };

  IRToy.prototype.parseData = function(data) {
    var parser, _i, _len, _ref;
    if (! this.processing) {
      if (this.rBuff.length > 196) {
        this.rBuff = new Buffer([]);
      }

      this.rBuff = Buffer.concat([this.rBuff, data]);

      _ref = this.parsers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        parser = _ref[_i];
        // console.log(this.rBuff.length);
        this.processing = true;
        if (parser.parse(this.rBuff)) {
          this.codeParsed = true;
            // this.concatBuffers();
            this.cleanUp();
            this.sp.flush();
          break;
        }
      }

      this.processing = false;

      return this.rBuff;
    }
  };

  // IRToy.prototype.concatBuffers = function() {
  //   this.rBuff = new Buffer([]);
  //   this.buffers.forEach(buffer => {
  //       this.rBuff = Buffer.concat([this.rBuff, buffer]);
  //   })
  // }

  IRToy.prototype.cleanUp = function() {
    this.timeOut = null;
    this.codeParsed = false;
    return this.rBuff = new Buffer([]);
  };

  IRToy.prototype.writeData = function(data, dataCB) {
    console.log(data);
    var _this = this;
    if (dataCB == null) {
      dataCB = null;
    }
    this.sp.flush();
    return this.sp.write(data, function(error, res) {
      if (error != null) {
        console.log(error);
      }
      return _this.dataCallBack = dataCB;
    });
  };

  return IRToy;

})(EventEmitter);

module.exports = IRToy;