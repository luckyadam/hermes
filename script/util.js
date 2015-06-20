/** 一些基础性方法 */
var Util = {
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

    if (xhr !== null) {
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
      dataStr = substr(0, dataStr.length - 1);
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
      xhr.send(options.data);
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

  addEvent: function add_event() {
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
  }
};
