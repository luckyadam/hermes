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
      return fn.apply( context || this, arguments);
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
    s[14] = '4';  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = '-';

    var uuid = s.join('');
    return uuid;
  },

  /** 仅仅是浅拷贝 */
  extend: function (destination, source) {
    for(var key in source) {
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
          for (var i = 0;i < element.length; i++) {
            add_event(element[i], type, handle);
          }
        }else{
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
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
        isSimple = /^[\w-]*$/.test(nameOnly);
    return (Util.isDocument(element) && isSimple && maybeID) ?
      ((found = element.getElementById(nameOnly)) ? [found] : []) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      Array.prototype.slice.call(
        isSimple && !maybeID ?
          maybeClass ? element.getElementsByClassName(nameOnly) :
          element.getElementsByTagName(selector) :
          element.querySelectorAll(selector)
      );
  },

  matches: function (element, selector) {
    if (!selector || !element || element.nodeType !== 1) {
      return false;
    }
    var matchesSelector = element.webkitMatchesSelector || element.msMatchesSelector ||
                          element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) {
      return matchesSelector.call(element, selector);
    }

    var match,
        parent = element.parentNode,
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
