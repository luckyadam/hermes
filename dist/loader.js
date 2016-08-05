(function (global) {
  'use strict';

  /** 一些基础性方法 */
  var Util = {

    isIE: function () {
      var userAgent = navigator.userAgent.toLowerCase();
      return (userAgent.indexOf('msie') != -1) ? parseInt(userAgent.split('msie')[1]) : false;
    },

    /** 获取元素类型 */
    getType: function (arg) {
      return Object.prototype.toString.call(arg);
    },

    /** 改变函数执行作用域 */
    proxy: function (fn, context) {
      if (!fn) {
        return;
      }

      return function () {
        return fn.apply(context || this, arguments);
      };
    },

    /** 对象和数组的遍历 */
    forEach: function (arg, fn) {
      if (!arg) {
        return;
      }
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

    console: (function (str) {
      var console = global.console;
      if (console) {
        return console;
      }
      return {
        log: function () {},
        warn: function () {}
      };
    })(),

    uuid: function () {
      var s = [];
      var hexDigits = '0123456789ABCDEF';
      for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = '-';

      var uuid = s.join('');
      return uuid;
    },

    /** 仅仅是浅拷贝 */
    extend: function (destination, source) {
      for (var key in source) {
        if (source.hasOwnProperty(key)) {
          destination[key] = source[key];
        }
      }
      return destination;
    },

    /** 封装一下ajax **/
    ajax: function (options) {
      var xhr = null;
      if (global.XMLHttpRequest) {
        xhr = new global.XMLHttpRequest();
      } else if (global.ActiveXObject) {
        try {
          xhr = new global.ActiveXObject('Msxml2.XMLHTTP');
        } catch (e) {
          xhr = new global.ActiveXObjec('Microsoft.XMLHTTP');
        }
      }

      if (xhr === null) {
        return;
      }
      options = this.extend({
        method: 'GET',
        url: null,
        data: null,
        isAsync: true,
        success: null,
        error: null
      }, options);
      var dataStr = '';
      if (options.method === 'GET' && this.getType(options.data) === '[object Object]') {
        this.forEach(options.data, function (item, key) {
          dataStr += key + '=' + global.encodeURIComponent(item) + '&';
        });
        dataStr = dataStr.substr(0, dataStr.length - 1);
        if (options.url.indexOf('?') >= 0) {
          options.url += '&' + dataStr;
        } else {
          options.url += '?' + dataStr;
        }
      }
      xhr.open(options.method, options.url, options.isAsync);
      if (options.method === 'GET') {
        xhr.send(null);
      } else if (options.method === 'POST') {
        xhr.send(dataStr);
      }

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            options.success && options.success(xhr.responseText);
          } else {
            options.error && options.error();
          }
        }
      };
    },

    addEvent: (function add_event() {
      if (document.addEventListener) {
        return function (element, type, handle) {
          if (element.length) {
            for (var i = 0; i < element.length; i++) {
              add_event(element[i], type, handle);
            }
          } else {
            element.addEventListener(type, handle, false);
          }
        };
      } else {
        return function (element, type, handle) {
          if (element.length) {
            for (var i = 0; i < element.length; i++) {
              add_event(element[i], type, handle);
            }
          } else {
            element.attachEvent('on' + type, function (event) {
              return handle.call(element, event || global.event);
            });
          }
        };
      }
    })(),

    isDocument: function (obj) {
      return obj != null && obj.nodeType == obj.DOCUMENT_NODE;
    },

    // 一个简单的css选择器 from zepto
    qsa: function (element, selector) {
      var found, maybeID = selector[0] == '#',
          maybeClass = !maybeID && selector[0] == '.',
          nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
          isSimple = /^[\w-]*$/.test(nameOnly);
      return (Util.isDocument(element) && isSimple && maybeID) ? ((found = element.getElementById(nameOnly)) ? [found] : []) : (element.nodeType !== 1 && element.nodeType !== 9) ? [] : Array.prototype.slice.call(
      isSimple && !maybeID ? maybeClass ? element.getElementsByClassName(nameOnly) : element.getElementsByTagName(selector) : element.querySelectorAll(selector));
    },

    matches: function (element, selector) {
      if (!selector || !element || element.nodeType !== 1) {
        return false;
      }
      var matchesSelector = element.webkitMatchesSelector || element.msMatchesSelector || element.mozMatchesSelector || element.oMatchesSelector || element.matchesSelector
      if (matchesSelector) {
        return matchesSelector.call(element, selector);
      }

      var match, parent = element.parentNode,
          tempParent = document.createElement('div'),
          temp = !parent;
      if (temp) {
        (parent = tempParent).appendChild(element);
      }
      match = ~Util.qsa(parent, selector).indexOf(element);
      temp && tempParent.removeChild(element);
      return match;
    }
  };

  /**
   * 静态资源加载器
   * 串行下载，下载统计
   */

  /** 一些状态枚举 */
  var StatusEnum = { /** 整体下载流程中的各种状态 */
    ProcessStatus: {
      NOSTART: 0,
      RUNNING: 1,
      PAUSE: 2,
      COMPLETE: 3,
      ERROR: 4
    },

    /** 执行下载的指令 */
    ProcessCommand: {
      PAUSE: 0,
      STOP: 1,
      NONE: 2
    },

    /** 单个文件的下载状态 */
    FileStatus: {
      NOSTART: 0,
      RUNNING: 1,
      ERROR: 2,
      COMPLETE: 3
    }
  };

  /**
   * Loader - 单个文件下载类
   *
   * @param  {Object} [options] 一些参数
   * @return {Loader}
   */
  var Loader = function (options) {
    this.conf = Util.extend({

    }, options);
    this.handler = {
      onComplete: null,
      onError: null
    };
    this._file = {};
    this._status = StatusEnum.FileStatus.NOSTART;
    var ua = navigator.userAgent;
    this._isIE = ua.indexOf('MSIE') >= 0;
    this._body = document.body || document.getElementsByTagName('body')[0];
  };

  Loader.prototype = {
    constructor: Loader,

    /**
     * _onload - 文件下载完成后的回调函数
     *
     * @private
     */
    _onload: function () {
      this._status = StatusEnum.FileStatus.COMPLETE;
      this.runHandler(this.handler.onComplete, this._file);
    },

    /**
     * _onerror - 文件下载出错的回调函数
     *
     * @private
     */
    _onerror: function () {
      this._status = StatusEnum.FileStatus.ERROR;
      this.runHandler(this.handler.onError, this._file);
    },

    /**
     * status - 获取/设置文件下载状态
     *
     * @param {Boolean} [status] - 下载状态
     * @return {Boolean} status
     */
    status: function () {
      var arg = arguments[0];
      if (arg !== undefined) {
        this._status = arg;
      } else {
        return this._status;
      }
    },

    /**
     * process - 执行文件下载
     *
     * @param {Object} param
     * @param {String} param.url - 文件url
     * @param {String} param.type - 文件类型
     * @return {Loader} this
     */
    process: function (param) {
      this._file = param;
      if (!this._file.url) {
        return;
      }
      var object = null;
      this._status = StatusEnum.FileStatus.RUNNING;
      if (this._isIE) {
        object = new Image();
        object.src = this._file.url;
        object.onload = Util.proxy(this._onload, this);
        object.onerror = Util.proxy(this._onerror, this);
      } else {
        object = document.createElement('object');
        object.data = this._file.url;
        object.width = 0;
        object.height = 0;
        object.onload = Util.proxy(this._onload, this);
        object.onerror = Util.proxy(this._onerror, this);
        this._body.appendChild(object);
      }

      return this;
    },

    /**
     * bind - 绑定事件
     *
     * @param {String} handler - 事件名称
     * @param {Function} fn - 事件句柄
     * @return {Loader} this
     */
    bind: function (handler, fn) {
      this.handler[handler] = fn;
      return this;
    },

    /**
     * runHandler - 执行事件
     *
     * @param {String} handler - 事件名称
     * @param {Object} param - 参数
     * @return {Loader} this
     */
    runHandler: function (handler, param) {
      if ( !! handler) {
        handler(param);
      }

      return this;
    }
  };

  /**
   * LoaderPool - 串行下载池类
   *
   * @param  {Object} [options] 一些参数
   * @return {LoaderPool}
   */
  var LoaderPool = function (options) {
    this.conf = Util.extend({}, options);
    this._cache = [];
    this._complete = [];
    this.handler = {
      onItemComplete: null,
      onItemStart: null,
      onItemError: null,
      onComplete: null,
      onStart: null,
      onError: null,
      onPause: null,
    };
  };

  LoaderPool.prototype = {
    constructor: LoaderPool,

    /**
     * _createLoader - 创建单个资源下载器，并绑定相应事件
     *
     * @private
     * @return {Loader} loader
     */
    _createLoader: function () {
      var loader = new Loader();
      return loader.bind('onComplete', Util.proxy(this._onItemComplete, this)).bind('onError', Util.proxy(this._onItemError, this));
    },

    /**
     * _getLoader - 获取缓存中空闲的下载器，若没有则创建
     *
     * @private
     * @return {Loader} loader
     */
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

    /**
     * _onItemComplete - 单个文件下载完成后的回调
     *
     * @private
     * @param {Object} item
     * @param {String} item.url 文件url
     * @param {String} item.type 文件类型
     */
    _onItemComplete: function (item) {
      this.runHandler(this.handler.onItemComplete, item.url);
      this._complete.push(item);
      this._toComplete();
      this._toContinue();
      this._toPause();
    },

    /**
     * _onItemError - 单个文件下载失败时的回调
     *
     * @private
     * @param {Object} item
     * @param {String} item.url 文件url
     * @param {String} item.type 文件类型
     */
    _onItemError: function (item) {
      this.runHandler(this.handler.onItemError, item.url).runHandler(this.handler.onError, item);
      this._toComplete();
      this._toContinue();
      this._toPause();
    },

    /**
     * _toComplete - 判断是否下载完成，若下载完成则执行相应句柄
     *
     * @private
     * @return {Boolean} 是否下载完成
     */
    _toComplete: function () {
      if (this._queue.length === 0) {
        if (this._status !== StatusEnum.ProcessStatus.COMPLETE) {
          this._status = StatusEnum.ProcessStatus.COMPLETE;
          this.runHandler(this.handler.onComplete);
          return true;
        }
      }
      return false;
    },

    /**
     * _toContinue - 判断是否需要继续下载
     *
     * @private
     */
    _toContinue: function () {
      if (this._status !== StatusEnum.ProcessStatus.COMPLETE && this._command == StatusEnum.ProcessCommand.NONE) {
        this._process({
          queue: this._queue
        });
      }
    },

    /**
     * _toPause - 判断是否需要暂停下载
     *
     * @private
     */
    _toPause: function () {
      if (this._command === StatusEnum.ProcessCommand.PAUSE && this._status === StatusEnum.ProcessStatus.RUNNING) {
        this._status = StatusEnum.ProcessStatus.PAUSE;
        this.runHandler(this.handler.onPause);
      }
    },

    /**
     * _process - 执行下载
     *
     * @private
     */
    _process: function () {
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
          if ( !! item) {
            this.runHandler(this.handler.onItemStart, item.uri);
            loader.process({
              url: item.uri,
              type: item.type
            });
          }
        }
      }
    },

    /**
     * process - 开始执行下载
     *
     * @param {Object} param
     * @param {Array} param.queue - 文件列表
     * @return {LoaderPool} this
     */
    process: function (param) {
      this._queue = param.queue;
      this.runHandler(this.handler.onStart);
      this._process();
      return this;
    },

    /**
     * pause - 暂停下载
     *
     * @return {LoaderPool} this
     */
    pause: function () {
      this._command = StatusEnum.ProcessCommand.PAUSE;
      return this;
    },

    /**
     * goOn - 继续下载
     *
     * @return {LoaderPool} this
     */
    goOn: function () {
      this._process({
        queue: this._queue
      });
      return this;
    },

    /**
     * bind - 绑定事件
     *
     * @param {String} handler - 事件名称
     * @param {Function} fn - 事件句柄
     * @return {LoaderPool} this
     */
    bind: function (handler, fn) {
      this.handler[handler] = fn;
      return this;
    },

    /**
     * runHandler - 执行事件
     *
     * @param {String} handler - 事件名称
     * @param {Object} param - 参数
     * @return {LoaderPool} this
     */
    runHandler: function (handler, param) {
      if ( !! handler) {
        handler(param);
      }
      return this;
    }
  };

  /** 资源下载器，实例化下载池子 **/
  var ResourceLoader = {
    load: function (param) {
      var resources = param.resources || null;
      if (resources === null || !resources.length) {
        Util.console.warn('依赖资源列表为空，本次将不预加载任何内容！');
        return;
      }

      var timeStat = {};
      var loaderPool = new LoaderPool();

      // 生成一个UUID，用来标识资源的加载
      var flag = Util.uuid();

      // 绑定各种事件，开始执行下载
      loaderPool.bind('onStart', function () {
        Util.console.log('开始下载');
      }).bind('onItemStart', function (url) {
        var startDate = new Date();
        var startTimeStamp = startDate.getTime();
        timeStat[url] = {};
        timeStat[url].startTime = startTimeStamp;
      }).bind('onItemComplete', function (url) {
        var endDate = new Date();
        var endTimeStamp = endDate.getTime();
        timeStat[url] && (timeStat[url].endTime = endTimeStamp);
        Util.console.log('资源 ' + url + '下载完成！');
      }).bind('onItemError', function (url) {
        Util.console.log('资源 ' + url + '下载失败！');
      }).bind('onComplete', function () {
        Util.console.log(timeStat);
      }).process({
        queue: resources
      });
    }
  };
  var isIE = Util.isIE();
  if (!isIE || isIE >= 8) {
    // 在window onload中去预加载资源
    global.onload = function () {
      // 从cdn请求资源列表
      var hermesConf = global.hermesConf;
      Util.ajax({
        method: 'GET',
        url: hermesConf.resUrl,
        success: function (data) {
          try {
            data = JSON.parse(data);
          } catch (err) {
            data = null;
          }
          if (data) {
            ResourceLoader.load(data);
          }
        }
      });
    };
  }
  /**
   * 自动化统计
   */

  var AutoStat = {
    bind: function () {
      Util.addEvent(document, 'click', function (e) {
        var target = e.target || e.srcElement;
        var aCollection = Util.qsa(document, 'a');
        while (target && !(aCollection ? aCollection.indexOf(target) >= 0 : Util.matches(target, selector))) {
          target = target !== document && !Util.isDocument(target) && target.parentNode;
        }
        if (target === false || target.tagName.toLocaleLowerCase() !== 'a') {
          return;
        }
        var href = target.getAttribute('href'); // href属性
        var urlReg = /^(http[s]?:\/\/(www\.)?|ftp:\/\/(www\.)?|www\.){1}([0-9A-Za-z-\.@:%_+~#=]+)+((\.[a-zA-Z]{2,3})+)(\/(.)*)?(\?(.)*)?/;
        // 只统计包含href，并且href是正常url的情况
        if (!href || (!urlReg.test(href) && !href.indexOf('/') >= 0)) {
          return;
        }

        href = global.encodeURIComponent(href);
        var pageUrl = global.encodeURIComponent(global.location.href);
        var description = global.encodeURIComponent(document.title);

        var image = new Image();
        image.src = 'http://labs.qiang.it/tools/hermes/api.php?act=reportClick' + '&page=' + pageUrl + '&description=' + description + '&goto=' + href;
      });
    }
  };
})(window);