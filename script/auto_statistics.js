/**
 * 自动化统计
 */

var AutoStat = {
  bind: function () {
    Util.addEvent(document, 'click', function (e) {
      var target = e.target || e.srcElement;
      var href = target.getAttribute('href'); // href属性
      var urlReg = /^(http[s]?:\/\/(www\.)?|ftp:\/\/(www\.)?|www\.){1}([0-9A-Za-z-\.@:%_+~#=]+)+((\.[a-zA-Z]{2,3})+)(\/(.)*)?(\?(.)*)?/;
      // 只统计包含href，并且href是正常url的情况
      if (!href || (!urlReg.test(href) && !href.indexOf('/') >= 0)) {
        return;
      }

      var pageUrl = window.location.href;
      var description = document.title;

      image = new Image();
      image.src = '' + '&page=' + pageUrl + '&description=' + description + '&goto=' + href;
    });
  }
};

AutoStat.bind();
