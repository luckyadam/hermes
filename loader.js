/**
 * 静态资源加载器
 * 串行下载，下载统计
 */

var ResourceLoader = (function (global) {

  var Util = {
    getType: function (arg) {
      return Object.prototype.toString.call(arg);
    },
    proxy: function (fn, context) {
      if (!fn) {
        return;
      }

      return function () {
        return fn.apply( context || this, arguments);
      };
    },
    forEach: function (arg, fn) {
      if (arg.forEach) {
        arg.forEach.call(arg, fn);
      } else {
        var type = this.getType(arg);
        if (type === '[object Array]') {
          for (var i = 0; i < arg.length; i++) {
            if (fn.call(arg[i], arg[i], i) === false) {
              return;
            }
          }
        } else if (type === '[object Object]') {
          for (var i in arg) {
            if (arg.hasOwnProperty(i)) {
              if (fn.call(arg[i], arg[i], i) === false) {
                return;
              }
            }
          }
        }
      }
    },
    // 仅仅是浅拷贝
    extend: function (destination, source) {
      for(var key in source) {
        if (source.hasOwnProperty(key)) {
          destination[key] = source[key];
        }
      }
      return destination;
    }
  };

  var StatusEnum = {
    ProcessStatus: {
      NOSTART: 0,
      RUNNING: 1,
      PAUSE: 2,
      COMPLETE: 3,
      ERROR: 4
    },
    ProcessCommand: {
      PAUSE: 0,
      STOP: 1,
      NONE: 2
    },
    FileStatus: {
      NOSTART: 0,
      RUNNING: 1,
      ERROR: 2,
      COMPLETE: 3
    }
  };

  var Loader = function (options) {
    this.conf = Util.extend({

    }, options);
    this.handler = {
      onComplete: null,
      onError: null
    };
    this._status = StatusEnum.FileStatus.NOSTART;
    var ua = navigator.userAgent;
    this._isIE = ua.indexOf('MSIE') >= 0;
    this._body = document.body || document.getElementsByTagName('body')[0];
  };

  Loader.prototype = {
    constructor: Loader,

    _onload: function (e) {
      this._status = StatusEnum.FileStatus.COMPLETE;
      this.runHandler(this.handler.onComplete, this._url);
    },

    _onerror: function (e) {
      this._status = StatusEnum.FileStatus.ERROR;
      this.runHandler(this.handler.onError, this._url);
    },

    status: function () {
      var arg = arguments[0];
      if (arg !== undefined) {
        this._status = arg;
      } else {
        return this._status;
      }
    },

    process: function (param) {
      this._url = param.url;
      if (!this._url) {
        return;
      }
      var object = null;
      this._status = StatusEnum.FileStatus.RUNNING;
      if (this._isIE) {
        object = new Image();
        object.src = this._url;
        object.onload = Util.proxy(this._onload, this);
        object.onerror = Util.proxy(this._onerror, this);
      } else {
        object = document.createElement('object');
        object.data = this._url;
        object.width  = 0;
        object.height = 0;
        object.onload = Util.proxy(this._onload, this);
        object.onerror = Util.proxy(this._onerror, this);
        this._body.appendChild(object);
      }
    },

    bind: function (handler, fn) {
      this.handler[handler] = fn;
      return this;
    },

    runHandler: function (handler, param) {
      if (!! handler) {
        handler(param);
      }
    }
  };

  var LoaderPool = function (options) {
    this.conf = Util.extend({
    }, options);
    this._cache = [];
    this._complete = [];
    this.handler = {
      onItemComplete: null,
      onItemStart: null,
      onItemError: null,
      onItemProcessing: null,
      onComplete: null,
      onStart: null,
      onError: null,
      onPause: null,
      onProcessing: null
    };
  };

  LoaderPool.prototype = {
    constructor: LoaderPool,

    _createLoader: function () {
      var loader = new Loader();
      return loader.bind('onComplete', Util.proxy(this._onItemComplete, this))
        .bind('onError', Util.proxy(this._onItemError, this));
    },

    _getLoader: function () {
      var ret = null;
      for (var i = 0; i < this._cache.length; i++) {
        var item = this._cache[i];
        if (item.status() !== StatusEnum.FileStatus.RUNNING) {
          ret = item;
          break;
        }
      }

      if (ret === null) {
        ret = this._createLoader();
        this._cache.push(ret);
      }

      return ret;
    },

    _onItemComplete: function (item) {
      this.runHandler(this.handler.onItemComplete, item);
      this._complete.push(item);
      this._toComplete();
      this._toContinue();
      this._toPause();
    },

    _onItemError: function () {
      this.runHandler(this.handler.onItemError, item)
        .runHandler(this.handler.onError, item);
      this._toComplete();
      this._toContinue();
      this._toPause();
    },

    _toComplete: function () {
      var isComplete = false;
      if (this._queue.length === this._complete.length) {
        for (var i = 0; i < this._queue.length; i++) {
          this._queue[i] = this._complete[i];
          isComplete = true;
        }

        if (isComplete && this._status !== StatusEnum.ProcessStatus.COMPLETE) {
          this._status = StatusEnum.ProcessStatus.COMPLETE;
          this.runHandler(this.handler.onComplete);
          return true;
        }
      }
      return false;
    },

    _toContinue: function () {
      if (this._status !== StatusEnum.ProcessStatus.COMPLETE && this._command == StatusEnum.ProcessCommand.NONE) {
        this.process({
          queue: this._queue
        });
      }
    },

    _toPause: function () {
      if (this._command === StatusEnum.ProcessCommand.PAUSE && this._status === StatusEnum.ProcessStatus.RUNNING) {
        this._status = StatusEnum.ProcessStatus.PAUSE;
        this.runHandler(this.handler.onPause);
      }
    },

    process: function (param) {
      this._queue = param.queue;
      this.runHandler(this.handler.onStart);
      if (!this._queue) {
        return;
      }
      this._command = StatusEnum.ProcessCommand.NONE;
      this._status = StatusEnum.ProcessStatus.RUNNING;

      if (this._toComplete()) {
        return;
      }

      if (this._queue.length > 0) {
        var loader = this._getLoader();
        if (loader !== null) {
          var item = this._queue.pop();
          if (!! item) {
            this.runHandler(this.handler.onItemStart, item);
            loader.process({
              url: item
            });
          }
        }
      }
    },

    pause: function () {
      this._command = StatusEnum.ProcessCommand.PAUSE;
    },

    goOn: function () {
      this.process({
        queue: this._queue
      });
    },

    bind: function (handler, fn) {
      this.handler[handler] = fn;
      return this;
    },

    runHandler: function (handler, param) {
      if (!! handler) {
        handler(param);
      }
      return this;
    }
  };

  var _ResourceLoader = {
    load: function (param) {
      var deps = param.deps || null;
      if (deps === null) {
        console.warn('依赖资源列表为空，本次将不预加载任何内容！');
        return;
      }

      var loaderPool = new LoaderPool();
      loaderPool.bind('onItemComplete', function (url) {
        console.log(url + ' 加载完成!');
      }).bind('onComplete', function () {
        console.log('全部加载完成');
      });
      loaderPool.process({
        queue: deps
      });
    }
  };

  return _ResourceLoader;

})(window);
