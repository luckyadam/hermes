/**
 * 自动化统计
 */

var AutoStat = {
  bind: function () {
    Util.addEvent(document, 'click', function (e) {
      var target = e.target || e.srcElement;
      var aCollection = Util.qsa(document, 'a');
      while (target && !(aCollection ? aCollection.indexOf(target) >= 0 :  Util.matches(target, selector))) {
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