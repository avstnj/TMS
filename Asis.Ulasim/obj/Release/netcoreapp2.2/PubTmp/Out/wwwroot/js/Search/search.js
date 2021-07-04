/*jQuery(document).ready(function ($) {

  $('#mdw_main_search').keyup(function () {
    var query = $('#mdw_main_search').val();

    if (query !== '') {
      var data = {
        'action': 'mdw_search',
        'query': query
      };
      jQuery.post(window.mdw_search_object.ajaxurl, data,
        function (response) {
          li = '<li>';
          if (response.indexOf(li) !== -1) {
            jQuery('.dropdown-wrapper').html(
              response);
          } else {
            jQuery('.dropdown-wrapper').html('');
          }
        });
    } else {
      jQuery('.dropdown-wrapper').html('');
    }

  });

  $('#mdw_main_search').click(function () {
    var query = $('#mdw_main_search').val();

    if (query !== '') {
      var data = {
        'action': 'mdw_search',
        'query': query
      };
      jQuery.post(window.mdw_search_object.ajaxurl, data,
        function (response) {
          li = '<li>';
          if (response.indexOf(li) !== -1) {
            jQuery('.dropdown-wrapper').html(
              response);
          } else {
            jQuery('.dropdown-wrapper').html('');
          }
        });
    } else {
      jQuery('.dropdown-wrapper').html('');
    }

  });

  jQuery('.search-form').click(function (e) {
    e.stopPropagation();
  });

  jQuery('body').click(function () {
    jQuery('.dropdown-wrapper').html('');
  });

});*/


var Search = function () {

var menuSearchWorks = function () {
  $("#searchInput").on("keyup", function () {
    var filter = $(this).val();
    if (filter.trim() !== "") {
      
      $("ul.m-menu__nav li:not(#searchLi)").each(function () {
        if (SearchStringInArray($(this).find("span.m-menu__link-text"), filter.trim())) {
          
         // $(this).addClass("open");

          $(this).children("a").children("span.m-menu__arrow").addClass("open");
          $(".m-menu__section").show(); // static menü türlerini göstermek için tanım rapor vs
          $(this).show();

        } else {
          $(this).removeClass("open");
          $(this).children("a").children("span.m-menu__arrow").removeClass("open");
          $(this).hide();
         
        }

      });

      /*$("ul.m-menu__subnav span.m-menu__link-text").each(function () {
        if (SearchStringInArray($(this).find("li.m-menu__item--submenu"), filter.trim())) {
          $(this).parent().addClass("open");
          $(this).children("a").children("span.m-menu__arrow").addClass("open");
          $(this).show();
        } else {
          $(this).parent().removeClass("open");
          $(this).children("a").children("span.m-menu__arrow").removeClass("open");
          // $(this).hide();
        }
      });*/
    } else {
      $("ul.m-menu__nav li:not(#searchLi)").removeClass("open");
      $("ul.m-menu__nav li:not(#searchLi)").show();
      $("ul.m-menu__nav li > ul.m-menu__subnav").removeClass("open");
      $("ul.m-menu__nav li > ul.m-menu__subnav").hide();
      $("ul.m-menu__nav li:not(.open) a i.m-menu__ver-arrow").removeClass("open");
      $("ul.m-menu__nav li.open a i.m-menu__ver-arrow").addClass("open");
      $("ul.m-menu__nav li > ul.m-menu__subnav").show();

    }
  });

}
return {
    init: function() {

      menuSearchWorks();
    }
  }

}();

  function SearchStringInArray(items, str) {
    var res = false;
    $.each(items, function () {
      if ($(this).text().trim().toUpperCase().search(new RegExp(str.toUpperCase(), "i")) >= 0) {
        res = true;
        return;
      }
    });
    return res;
  }