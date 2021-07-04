try {
    var markers = new Array();
    var duraklarListe;
    var fArrow = {
        path: "M 0,0 4,4 1,4 0,3 -1,4 -4,4 z",
        fillColor: "white",
        fillOpacity: 0.35,
        scale: 2
    };
    var myMapStyle = [
        {
            featureType: "administrative",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        }, {
            featureType: "poi",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        }, {
            featureType: "water",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        }, {
            featureType: "road",
            elementType: "labels",
            stylers: [
                { visibility: "on" }
            ]
        }
    ];
    var mcOptions = {
        styles: [
            {
                height: 53,
                url: "../../image/clusterIcons/m1.png",

                width: 53
            },
            {
                height: 56,
                url: "../../image/clusterIcons/m2.png",
                width: 56
            },
            {
                height: 66,
                url: "../../image/clustericons/m3.png",
                width: 66
            },
            {
                height: 78,
                url: "../../image/clusterIcons/m4.png",
                width: 78
            },
            {
                height: 90,
                url: "../../image/clusterIcons/m5.png",
                width: 90
            }
        ]
    };
    var w;
    var RouteStationMarkers = new Array();
    $(document).ready(function () {
        $("#m_sortable_portlets").sortable({
            connectWith: ".m-portlet__head",
            items: ".m-portlet",
            opacity: 0.8,
            handle: '.m-portlet__head',
            coneHelperSize: true,
            placeholder: 'm-portlet--sortable-placeholder',
            forcePlaceholderSize: true,
            tolerance: "pointer",
            helper: "clone",
            tolerance: "pointer",
            forcePlaceholderSize: !0,
            helper: "clone",
            cancel: ".m-portlet--sortable-empty", // cancel dragging if portlet is in fullscreen mode
            revert: 250, // animation in milliseconds
            update: function (b, c) {
                if (c.item.prev().hasClass("m-portlet--sortable-empty")) {
                    c.item.prev().before(c.item);
                }
            }
        });
        $("#Institution > span").hide();
        $("#dvGroupCodes > span").hide();
        $("#UserDealer > span").hide();
        $("#datetimepicker1").datetimepicker();
        $("#corporation").selectpicker({
            maxOptions: 1
        });
        $("#corpDealers").selectpicker({
            maxOptions: 1
        });
        $("#groupCodes").selectpicker({
            maxOptions: 1
        });
        $(".bs-actionsbox").hide();
        //$("span").filter(".filter-option").text("Kurum Seçiniz...");
        $("#Institution").removeClass("col-lg-3 col-md-9").addClass("col-md-12");
        $("#UserDealer").removeClass("col-lg-3 col-md-9").addClass("col-md-12");
        $("#dvGroupCodes").removeClass("col-lg-3 col-md-9").addClass("col-md-12");
        $(".page-container").height($("body").height() - $(".header").height());
        $(".page-content").height($(".page-container").height());
        $("#dvMap").height($(".page-content").height() - $("#portlet_offlineTrackingFilter").height());
        InitializeMap();
        map.setOptions({ styles: myMapStyle });
        map.setOptions({ zoom: 12 });
        var centerPoint = new google.maps.LatLng(lat,long);
        map.setCenter(centerPoint);
        $("#polyLineWeight").spinner({ value: 2, min: 2, max: 8 });
        $("#portlet_trackingTools").css("left", ($("body").width() / 2 - $("#portlet_trackingTools").width() / 2) + "px");
       $.ajax({
            url: "/DealerCoordinates/GetBayiKoordinat",
            type: 'GET',
            data: {},
            success: function (res) {
                if (res !== "") {
                    if (res !== "1") {
                        map.setZoom(10);
                        duraklarListe = new Array();
                        for (var i = 0; i < res.length; i++) {
                            duraklarListe.push(res[i]);
                        }
                        for (var i = 0; i < duraklarListe.length; i++) {
                            var myLatlng = new google.maps.LatLng((duraklarListe[i]).enlemFStr, (duraklarListe[i]).boylamFStr);
                            CreateRouteStationMarkers(duraklarListe);
                            if (duraklarListe[i].tip != 'V') {

                                var iconata = "../../image/dealer.png";

                            } else {
                                iconata = "../../image/kiosk.png";
                            }

                            var marker = new google.maps.Marker({
                                map: map, title: duraklarListe[i].aciklama, position: myLatlng,  
                                icon:iconata
                            });
                            map.setCenter(marker.getPosition());
                            markers.push(marker);
                            var infowindow = new google.maps.InfoWindow();

                            google.maps.event.addListener(marker, 'click', (function (marker, contentString, infowindow) {
                                return function () {
                                    //infowindow.setContent(contentString);
                                    infowindow.open(map, marker);
                                };
                            })(marker, infowindow));

                        }

                    }
                    else {
                        toastr["warning"](window.DataYok, "Uyarı");
                    }
                }
                else {
                    toastr["warning"](window.DataYok, "Uyarı");
                }
            }
        });
        $("#aCloseQuickDraw").trigger("click");
    });
    function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }

    function clearMarkers() {
        setMapOnAll(null);
    }
    $("#btnQuery").click(function() {
        var dealerType = $("#ddlDealerType").val();
        var corps = GetUserCorps();
        var dealer = GetUserDealers();
        var groupCodes = GetGroupCode();
        $.ajax({
            url: "/DealerCoordinates/GetBayiKoordinatParam",
            type: 'POST',
            data: {
                corps: corps,
                dealer: dealer,
                groupCodes: groupCodes,
                dealerType: dealerType
            },
            success: function (res) {
                if (res !== "") {
                    if (res !== "1") {
                        map.setZoom(10);
                        clearMarkers();
                        duraklarListe = new Array();
                        for (var i = 0; i < res.length; i++) {
                            duraklarListe.push(res[i]);
                        }
                        for (var i = 0; i < duraklarListe.length; i++) {
                            var myLatlng = new google.maps.LatLng((duraklarListe[i]).enlemFStr, (duraklarListe[i]).boylamFStr);
                            CreateRouteStationMarkers(duraklarListe);
                            if (duraklarListe[i].tip != 'V') {
                                var iconata = "../../image/dealer.png";
                            } else {
                                iconata = "../../image/kiosk.png";
                            }
                            var marker = new google.maps.Marker({
                                map: map, title: duraklarListe[i].aciklama, position: myLatlng,
                                icon: iconata
                            });
                            map.setCenter(marker.getPosition());
                            markers.push(marker);
                            var infowindow = new google.maps.InfoWindow();                        
                            google.maps.event.addListener(marker, 'click', (function (marker, infowindow) {
                                return function () {
                                    //infowindow.setContent(contentString);
                                    infowindow.open(map, marker);
                                };
                            })(marker, infowindow));
                        }
                    }
                    else {
                        toastr["warning"](window.DataYok, "Uyarı");
                    }
                }
                else {
                    toastr["warning"](window.DataYok, "Uyarı");
                }
            }
        });
    });
    function CreateRouteStationMarkers(result) {
        var tmpPointsArray= new Array();
        var Datas = new Array();
        var tmpResArray = result;
        for (var i = 0; i < tmpResArray.length; i++) {
                tmpPointsArray.push(getLatLonObject(tmpResArray[i].enlemFStr, tmpResArray[i].boylamFStr));
                Datas.push(tmpResArray[i]);
        }
        RouteStationMarkers = new Array();
        CreateStationMarkers(tmpPointsArray,Datas);
    }
    function CreateStationMarkers(positionsArray, data) {
        $.each(positionsArray, function (i, v) {
            var infoPopup = new google.maps.InfoWindow({
                content: "<b><div class='iw-container' id='" + data[i].aciklama + "'><div class='iw-title'>" + data[i].aciklama + "</div></b>" +
                    "<div class='iw-content'>" +
                    "<table class='table table-bordered table-striped'>" +
                    "<tr><td width='50%'><b>" +"Adres" + ":</b></td><td>" + data[i].adres + "</td></tr>" +
                    "<tr><td width='50%'><b>" + "Telefon" + ":</b></td><td>" + data[i].telefon + "</td></tr>" +
                    "<tr><td width='50%'><b>" + "Bakiye" + ":</b></td><td>" + data[i].posGuncelBakiye + "</td></tr>" +
                    "</table></div></div>"
            });
            var marker = new MarkerWithLabel({
                position: v,
                icon: "../../image/" + (data[i].tip === "B" ? "dealer" : "kiosk") + ".png",
                infoWindow: infoPopup,
                draggable: true,
                map: map
            });
            RouteStationMarkers.push(marker);
            google.maps.event.addListener(marker, "click", function () {
                infoPopup.open(map, this);
            });
        });
    }
    function GetGroupCode() {
        var group = "";
        if ($("#groupCodes").val === "HI") {
            group = -1;
        }
        var groupArray = new Array();
        if (document.getElementById("groupCodes").selectedIndex === -1) {
            group = "";
        } else {
            $("#groupCodes :selected").each(function () {
                groupArray.push($(this).val());
            });
            group = groupArray.join(',');
        }
        return group;
    }
    function getLatLonObject(lat, lon) {
        return new google.maps.LatLng(lat, lon);
    }
    Array.prototype.remove = function () {
        var what, a = arguments, l = a.length, ax;
        while (l && this.length) {
            what = a[--l];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };
} catch (e) {

}

