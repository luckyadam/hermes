/**
 * 自动化统计
 */

var AutoStat = {
  bind: function () {
    Util.addEvent(document, 'click', function (e) {
      var target = e.target || e.srcElement;
      var locate = target.getAttribute('locate');
      var project = null; // 项目名称
      var page = null; // 具体页面
      var region = null; // 区域名称
      var pageUrl = global.location.href;
      var image = null;
      if (!locate) {
        return;
      }
      locate = locate.split('#');
      var len = lcoate.length;
      if (len >= 3) {
        project = locate[0];
        page = locate[1];
        region = locate[2];
      } else {
        page = locate[0];
        region = locate[1];
      }
      image = new Image();
      image.src = '' + '&u=' + pageUrl + '&project=' + project + '&page=' + page + '&region=' + region;
    });
  }
};

AutoStat.bind();
