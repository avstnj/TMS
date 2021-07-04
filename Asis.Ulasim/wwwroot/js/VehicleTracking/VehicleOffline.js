try {
    gridSourceStatus = false;
    var busRouteHistory = new Array();
    var noRecords = new Array();
    var trackingDateTime;
    var finnishFlag;
    var myTimer;
    var currentState = "Idle";
    var currentMarkerGlobal;
    var durakMarkers = new Array();
    var markers = new Array();
    var angleCorrectionTimer;
    var refreshTimer;
    var firstTimeLoaded = false;
    var markerCluster;
    var clusterFlag = 1;
    var clusterData;
    var tmpMarkers;
    var arabaHistoryDetails;
    var duraklarListe;
    var selectedLines;
    var selectedPlates = "";
    var routeMarkers = new Array();
    var routeColors = new Array();
    var RouteStationMarkers = new Array();
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
    var linePolylines = new Array();
    var showPolyLines = false;
    var selectedPlaka = null;
    var boolWait = true;
    var startDateTime;
    var endDateTime;
    var trackingEndDateTime;
    var tempFirstRowDt, tempPausedDt, firstRowDt, lastRowDt, distinctPlates, bulkBusData, offlineTrackinGridData = [];
    var speed = 1000;
    var dtStep = 10000;
    var tempBulkData = [];
    var PlatestopUndefinedLines = [];
    var quickDrawData = new Array();
    var routeHistoryMarker;
    var lineMarkers = [];
    var markerQuickDrawStart, markerQuickDrawEnd;
    var tempStartDateTime, tempEndDateTime;
    var plates = new Array();
    var Choiceplaka;
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
        $("#SelectStops").hide();
        $("#PlatesSelect > span").hide();
        $("#datetimepicker1").datetimepicker();
        $("#plates").selectpicker({
            maxOptions: 1
        });
        $("#stops").selectpicker({
            maxOptions: 1
        });
        $(".bs-actionsbox").hide();
        $("span").filter(".filter-option").text();
        $("#stop").removeClass("col-lg-3 col-md-9").addClass("col-md-12");
        $("#PlatesSelect").removeClass("col-lg-3 col-md-9").addClass("col-md-12");
        $(".page-container").height($("body").height() - $(".header").height());
        $(".page-content").height($(".page-container").height());
        $("#dvMap").height($(".page-content").height() - $("#portlet_offlineTrackingFilter").height());
        InitializeMap();
        map.setOptions({ styles: myMapStyle });
        map.setOptions({ zoom: 12 });
        var centerPoint = new google.maps.LatLng(lat, long);
        map.setCenter(centerPoint);
        $("#polyLineWeight").spinner({ value: 2, min: 2, max: 8 });
        $("#portlet_trackingTools").css("left", ($("body").width() / 2 - $("#portlet_trackingTools").width() / 2) + "px");
        $.ajax({
            url: "/VehicleOffline/GetDepots",
            type: "GET",
            success: function (res) {
                if (res !== "" && res !== "[]") {
                    var depots = res;
                    $.each(depots, function () {
                        var strLatLongs = this.polygon.replace(/,\s/g, ",").split(",");
                        var coords = new Array();
                        $.each(strLatLongs, function () {
                            coords.push({ lat: Number(this.split(" ")[0]), lng: Number(this.split(" ")[1]) });
                        });
                        var depot = new google.maps.Polygon({
                            paths: coords,
                            strokeColor: "#FF0000",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#FF0000",
                            fillOpacity: 0.35
                        });
                        depot.setMap(map);
                    });
                }
            }
        });
        google.maps.event.addListener(map, 'zoom_changed',
            function () {
                if (map.zoom < 9) {
                    console.log(map.zoom);
                    if (RouteStationMarkers.length > 0) {
                        for (i = 0; i < RouteStationMarkers.length; i++) {
                            RouteStationMarkers[i].setMap(null);
                        }
                        RouteStationMarkers = new Array();
                        $("#btnShowBusStops").html($("#btnShowBusStops").html().replace(window.resBusStopMsg, window.resShowBusStops));
                    }
                }
                //else if (map.zoom > 9) {
                //    if(duraklarListe != undefined)
                //    CreateRouteStationMarkers(duraklarListe);
                //}
            });
        $("#btnQuery").click(function (e) {
            $("#gridContainer").show();
            e.preventDefault();
            startDateTime = GetStartDateTime();
            endDateTime = GetEndDateTime();
            Choiceplaka = GetUserPlates2();
            tempStartDateTime = new Date(startDateTime);
            tempEndDateTime = new Date(endDateTime);
            tempFirstRowDt = null, lastRowDt = null;
            bulkBusData = [];
            GridTimeout();
        });
        $("#btnDrawHistoryLine").click(function (e) {
            e.preventDefault();
            var fDt = GetStartDateTime2();
            var lDt = GetEndDateTime2();
            tempFirstRowDt = null, lastRowDt = null;
            var plates = GetUserPlates();
            if (plates) {
                loadPanel.show();
                $.ajax({
                    url: "/VehicleOffline/GetBusLocationHistory",
                    type: "POST",
                    data: {
                        palkaKoduListe: plates,
                        firstDate: fDt,
                        lastDate: lDt
                    },
                    success: function (res) {
                        if (res.length <= 0) {
                            loadPanel.hide();
                            toastr["warning"]('@Localizer["NoData"]');
                            return;
                        }
                        if (res !== "" && res !== "[]") {
                            if (markerQuickDrawStart != undefined) markerQuickDrawStart.setMap(null);
                            if (markerQuickDrawEnd != undefined) markerQuickDrawEnd.setMap(null);
                            if (routeHistoryMarker != undefined) routeHistoryMarker.setMap(null);
                            if (quickDrawData.length > 0) {
                                quickDrawData[0].polyline.setMap(null);
                                quickDrawData = new Array();
                            };
                            var routeData = res;
                            var coords = new Array();
                            var start = getLatLonObject(routeData[0].enlem, routeData[0].boylam);
                            var end = getLatLonObject(routeData[routeData.length - 1].enlem, routeData[routeData.length - 1].boylam);
                            $.each(routeData, function () {
                                coords.push(getLatLonObject($(this)[0].enlem, $(this)[0].boylam));
                            });
                            quickDrawData = new Array();
                            quickDrawData.push({
                                coreData: routeData,
                                coords: coords,
                                polyline: new google.maps.Polyline({
                                    path: coords,
                                    geodesic: true,
                                    strokeColor: "#" + $(".jscolor").val(),
                                    strokeOpacity: 1,
                                    strokeWeight: parseInt($("#inputPolyLineWeight").val()),
                                    clickable: true
                                })
                            });
                            quickDrawData[0].polyline.setMap(map);
                            routeHistoryMarker = new google.maps.Marker({
                                position: start,
                                icon: "../../image/vehicleImg/icon/2.5.png",
                                map: map
                            });
                            markerQuickDrawStart = new google.maps.Marker({
                                position: start,
                                label: "S",
                                map: map
                            });
                            markerQuickDrawEnd = new google.maps.Marker({
                                position: end,
                                label: "E",
                                map: map
                            });
                            var vehicleSlider = $("#vehicleSlider").data("ionRangeSlider");
                            vehicleSlider.reset();
                            vehicleSlider.update({
                                max: routeData.length - 1,
                                keyboard_step: (100 / quickDrawData[0].coreData.length).toPrecision(1)
                            });
                            $("#vehicleQuickDrawDate").text(getDateTime2(quickDrawData[0].coreData[0].tarih).toLocaleString());
                            $("#vehicleQuickDrawSpeed").text(window.resSpeed + " : " + quickDrawData[0].coreData[0].hiz);
                            $("#vehicleSlider").parent("div").parent("div").show();
                            $("#displayTimeSpeed").show();
                            $("#btnDrawRouteLine").show();
                            if (quickDrawData[0].coords.length > 0) {
                                var latlngbounds = new google.maps.LatLngBounds();
                                quickDrawData[0].coords.forEach(function (e) {
                                    latlngbounds.extend(e);
                                });
                                map.setCenter(latlngbounds.getCenter());
                                map.fitBounds(latlngbounds);
                            }
                        } else {
                            loadPanel.hide();
                            window.toastr["warning"](window.resNoData, window.resInformation);
                        }
                    },
                    error: function (res) {
                        loadPanel.hide();
                        console.log("");
                    },
                    complete: function () {
                        loadPanel.hide();
                        //App.unblockUI($("#tbl_offlineTrackingFilter"));
                    }
                });
            } else {
                loadPanel.hide();
                toastr["warning"]("Plaka Seçiniz.");
            }
        });
        $("#btnShowOnMap").click(function (e) {
            e.preventDefault();
            selectedPlates = "";
            for (var i = 0; i < markers.length; i++) {
                if (markers[i] != undefined)
                    markers[i].marker.setMap(null);
            }
            markers = new Array();
            if (markerCluster != undefined)
                markerCluster.clearMarkers();
            var mSelectedPlates = GetSelectedPlates();
            for (var j = 0; j < mSelectedPlates.length; j++) {
                selectedPlates += mSelectedPlates[j] + ",";
            };
            if (selectedPlates !== "") {
                $("#btnClearMap").show();
                $("#gridContainer .collapseWithCallback").click();
                $("#btnDrawMarkerCluster").show();
                loadHistories();
                clusterFlag = 0;
                //markerCluster.clearMarkers();
                //CreateMarkers(clusterData);
                $("#btnDrawMarkerCluster").children("i").removeClass("fa-object-ungroup");
                $("#btnDrawMarkerCluster").children("i").addClass("fa-object-group");
                $("#btnDrawMarkerCluster").html($("#btnDrawMarkerCluster").html().replace("Grup Kaldır", "Grupla"));
            } else {
                toastr["warning"]("Araç seçimi yapılmamış.Lütfen araç seçiniz!");
            }
        });
        $("#btnClearMap").click(function (e) {
            e.preventDefault();
            try {
                if (quickDrawData.length > 0) {
                    quickDrawData[0].polyline.setMap(null);
                    quickDrawData = new Array();
                };
                routeHistoryMarker.setMap(null);
                markerQuickDrawEnd.setMap(null);
                markerQuickDrawStart.setMap(null);
            } catch (e) {

            }
            // Clear All Vehicle Markers 
            var i;
            for (i = 0; i < markers.length; i++) {
                if (markers[i] != undefined)
                    markers[i].marker.setMap(null);
            }
            for (i = 0; i < routeMarkers.length; i++) {
                if (routeMarkers[i] != undefined)
                    routeMarkers[i].setMap(null);
            }
            routeMarkers = new Array();
            markers = new Array();
            if (markerCluster != undefined)
                markerCluster.clearMarkers();
            if (RouteStationMarkers.length > 0) {
                for (i = 0; i < RouteStationMarkers.length; i++) {
                    RouteStationMarkers[i].setMap(null);
                }
                RouteStationMarkers = new Array();
                $("#btnShowBusStops").html($("#btnShowBusStops").html().replace(window.resBusStopMsg, window.resShowBusStops));
            }
            if (linePolylines.length > 0) {
                showPolyLines = false;
                for (i = 0; i < linePolylines.length; i++) {
                    linePolylines[i].polyline.setMap(null);
                    linePolylines[i].startMarker.setMap(null);
                    linePolylines[i].endMarker.setMap(null);
                }
                linePolylines = new Array();
                $("#btnDrawLines").html($("#btnDrawLines").html().replace(window.resHideRoutes, window.resDrawRoute));
            }
            $("#btnClearMap").hide();
            $("#btnShowTrackingTools").hide();
            $("#btnStopTracking").click();
            $("#portlet_trackingTools").hide();
            $("#btnShowOnMap").hide();
            $("#btnShowBusStops").hide();
            $("#btnDrawLines").hide();
            $("#btnDrawMarkerCluster").hide();
            selectedPlates = "";
            $("#btnDrawMarkerCluster").show();
        });
        $("#btnDrawLines").click(function (e) {
            e.preventDefault();
            loadPanel.show();
            var i;
            if (linePolylines.length > 0) {
                showPolyLines = false;
                for (i = 0; i < linePolylines.length; i++) {
                    linePolylines[i].polyline.setMap(null);
                    linePolylines[i].startMarker.setMap(null);
                    linePolylines[i].endMarker.setMap(null);
                }
                linePolylines = new Array();
                for (i = 0; i < routeMarkers.length; i++) {
                    if (routeMarkers[i] != undefined)
                        routeMarkers[i].setMap(null);
                }
                routeMarkers = new Array();
                $("#btnDrawLines").html($("#btnDrawLines").html().replace(window.resHideRoutes, window.resDrawRoute));
                ControlPageItems();
                loadPanel.hide();
                return;
            }
            var lineCodes = [];
            lineCodes = selectedLines;
            if (lineCodes.length === 0) return;
            showPolyLines = true;
            $("#btnDrawLines").html($("#btnDrawLines").html().replace(window.resDrawRoute, window.resHideRoutes));
            noRecords = new Array();
            for (i = 0; i < lineCodes.length; i++) {
                if (showPolyLines) {
                    if (lineCodes[i] !== "") {
                        getAllLineCoordinates(lineCodes[i], noRecords, ((lineCodes.length - 1) === i));
                    }
                } else {
                    break;
                }
            }

            ControlPageItems();
            loadPanel.hide();
        });
        $("#btnShowBusStops").click(function (e) {
            e.preventDefault();
            if (RouteStationMarkers.length > 0) {
                if (RouteStationMarkers.length > 0)
                    for (var i = 0; i < RouteStationMarkers.length; i++) {
                        RouteStationMarkers[i].setMap(null);
                    }
                RouteStationMarkers = new Array();
                $("#btnShowBusStops").html($("#btnShowBusStops").html().replace(window.resBusStopMsg, window.resShowBusStops));
                ControlPageItems();
                return;
            }
            var lineCodes = selectedLines;
            if (lineCodes.length === 0) return;
            var stopUndefinedLines = [];
            $("#loadpanel").show();
            $.ajax({
                url: "/VehicleOffline/GetLineStationCoordinates",
                type: "POST",
                data: {
                    hatKodu: lineCodes.join(",")
                },
                success: function (res) {
                    if (res !== "") {
                        duraklarListe = res;
                        var routeCodes = Enumerable.From(duraklarListe).Select("$.hatKodu").Distinct().ToArray();
                        $.each(lineCodes, function (i, v) {
                            if ($.inArray(v, routeCodes) === -1)
                                stopUndefinedLines.push(v);
                        });

                        CreateRouteStationMarkers(duraklarListe);

                        if (RouteStationMarkers.length > 0) {
                            $("#btnShowBusStops").html($("#btnShowBusStops").html().replace(window.resShowBusStops, window.resBusStopMsg));

                            var bounds = new google.maps.LatLngBounds();
                            for (var i = 0; i < RouteStationMarkers.length; i++) {
                                bounds.extend(RouteStationMarkers[i].getPosition());
                            }
                            map.fitBounds(bounds);
                        }

                        $.each(stopUndefinedLines,
                            function (i, v) {
                                setTimeout(function () {
                                    toastr["warning"](
                                        window
                                            .resThe_stops_for_line_xxx_are_undefined__Contact_your_system_administrator_for_identification
                                            .replace("xxx", v),
                                        window.resAlert + "!");
                                },
                                    500);
                            });
                    } else {
                        $.each(lineCodes,
                            function (i, v) {
                                setTimeout(function () {
                                    toastr["warning"](
                                        window
                                            .resThe_stops_for_line_xxx_are_undefined__Contact_your_system_administrator_for_identification
                                            .replace("xxx", v),
                                        window.resAlert + "!");
                                },
                                    500);
                            });
                    }
                },
                complete: function () {
                    ControlPageItems();
                }
            });
        });
        $("#btnDrawMarkerCluster").click(function (e) {
            e.preventDefault();
            //if (markerCluster == undefined) return;
            if (clusterFlag === 1) {
                clusterFlag = 0;
                //markerCluster.clearMarkers();
                CreateMarkers(clusterData);
                $("#btnDrawMarkerCluster").children("i").removeClass("fa-object-ungroup");
                $("#btnDrawMarkerCluster").children("i").addClass("fa-object-group");
                $("#btnDrawMarkerCluster").html($("#btnDrawMarkerCluster").html().replace(window.resRemoveGroups, window.resCreateGroups));
            } else {
                clusterFlag = 1;
                //markerCluster.clearMarkers();
                CreateMarkers(clusterData);
                $("#btnDrawMarkerCluster").children("i").removeClass("fa-object-group");
                $("#btnDrawMarkerCluster").children("i").addClass("fa-object-ungroup");
                $("#btnDrawMarkerCluster").html($("#btnDrawMarkerCluster").html().replace(window.resCreateGroups, window.resRemoveGroups));
            }
        });
        $(".sidebar-toggler").click(function () {
            if ($("body").width() > 992) {
                $(".page-container").css("overflow", "hidden");
                setTimeout(function () {
                    $("#portlet_offlineTrackingFilter").css("left", $(".page-sidebar").width() + "px");
                    $("#dvMap").width($("body").width() - $(".page-sidebar").width());
                    $("#portlet_offlineTrackingFilter").width($("body").width() - $(".page-sidebar").width());
                    if ($.fn.DataTable.isDataTable("#tbl_offlineTrackingFilter")) $("#tbl_offlineTrackingFilter").DataTable().draw(false);
                    google.maps.event.trigger(map, "resize");
                }, 0);
            }
        });
        $("#btnPauseTracking").click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            pausMonitoring();

            tempPausedDt = tempFirstRowDt;
            tempFirstRowDt = null;
            $("#btnPauseTracking").hide();
            $("#btnResumeTracking").show();
        });
        $("#btnResumeTracking").click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            resumeMonitoring();
            if (new Date(tempFirstRowDt) <= new Date(lastRowDt)) {
                setTimeout(function () { PlayTimeOut(); }, speed);
                $("#btnPauseTracking").show();
                $("#btnResumeTracking").hide();
            }
        });
        $("#btnStopTracking").click(function (e) {
            e.preventDefault();
            tempFirstRowDt = null;
            var playSlider = $("#playSlider").data("ionRangeSlider");
            var startDt = new Date(GetStartDateTime());
            tempPausedDt = firstRowDt;
            lastRowDt = new Date(lastRowDt);
            playSlider.update({
                max: lastRowDt.getTime(),
                min: startDt.getTime(),
                from: 0
            });
            var selectedItems = [];
            selectedItems = GetSelectedPlates();
            var scrollTop = $(".dataTables_scrollBody").scrollTop();
            offlineTrackinGridData = [];
            for (var j = 0; j < distinctPlates.length; j++) {
                var row = Enumerable.From(tempBulkData)
                    .Where(function (i) { return distinctPlates[j] === i.plaka; })
                    .OrderBy("$.tarih").Take(1).SingleOrDefault(null, "$.tarih");;
                offlineTrackinGridData.push(row);
            }
            fillGridLive();
            if (selectedItems === []) return;
            $.each(selectedItems, function () {
                $(".checkboxes[value=\"" + this + "\"]").prop("checked", true);
                $(".checkboxes[value=\"" + this + "\"]").parents("tr").toggleClass("active");
            });
            $(".dataTables_scrollBody").scrollTop(scrollTop);
            $("#btnPauseTracking").hide();
            $("#btnResumeTracking").show();
        });
        $("#btnQuickDraw").click(function (e) {
            e.preventDefault();
            if (markerQuickDrawStart != undefined) markerQuickDrawStart.setMap(null);
            if (markerQuickDrawEnd != undefined) markerQuickDrawEnd.setMap(null);
            if (routeHistoryMarker != undefined) routeHistoryMarker.setMap(null);
            if (quickDrawData.length > 0) {
                quickDrawData[0].polyline.setMap(null);
                quickDrawData = new Array();
            };
            $("#portlet_vehicleQuickDraw").css({ "left": "100px" }, { "top": "50px" });
            $("#portlet_vehicleQuickDraw").show();
            $("#gridCollapse").click();
        });
        $("#btnCloseQuickDraw").click(function (e) {
            e.preventDefault();
            $("#portlet_vehicleQuickDraw").hide();
            $("#btnQuickDraw").show();
            if (markerQuickDrawStart != undefined) markerQuickDrawStart.setMap(null);
            if (markerQuickDrawEnd != undefined) markerQuickDrawEnd.setMap(null);
            if (routeHistoryMarker != undefined) routeHistoryMarker.setMap(null);
            if (quickDrawData.length > 0) {
                quickDrawData[0].polyline.setMap(null);
                quickDrawData = new Array();
            };
            if (linePolylines.length > 0) {
                showPolyLines = false;
                for (var i = 0; i < linePolylines.length; i++) {
                    linePolylines[i].polyline.setMap(null);
                    linePolylines[i].startMarker.setMap(null);
                    linePolylines[i].endMarker.setMap(null);
                }
                linePolylines = new Array();
                $("#btnDrawLines").html($("#btnDrawLines").html().replace(window.resHideRoutes, window.resDrawRoute));
            }
            var slider = $("#vehicleSlider").data("ionRangeSlider");
            slider.reset();
            $("#btnDrawRouteLine").html($("#btnDrawRouteLine").html().replace(window.resHideRoutes, window.resDrawRoute));
            $("#portlet_vehicleQuickDraw").hide();
            $("#btnDrawRouteLine").hide();
            $("#gridCollapse").click();
            $("#vehicleSlider").parent("div").parent("div").hide();
            $("#displayTimeSpeed").hide();
        });
        $("#btnDrawRouteLine").click(function () {
            try {
                if (linePolylines.length > 0) {
                    showPolyLines = false;
                    for (i = 0; i < linePolylines.length; i++) {
                        linePolylines[i].polyline.setMap(null);
                        linePolylines[i].startMarker.setMap(null);
                        linePolylines[i].endMarker.setMap(null);
                    }
                    linePolylines = new Array();
                    for (i = 0; i < routeMarkers.length; i++) {
                        if (routeMarkers[i] != undefined)
                            routeMarkers[i].setMap(null);
                    }
                    routeMarkers = new Array();
                }
                if (quickDrawData && quickDrawData.length > 0) {
                    var lineCode = quickDrawData[0].coreData[0].hatKodu;
                    loadPanel.show();
                    $.ajax({
                        url: "/VehicleTracking/GetRouteGpsCoordinates",
                        type: "GET",
                        data: {
                            hatKodu: lineCode
                        },
                        success: function (res) {
                            if (res !== "" && res !== "[]") {
                                var tmpResArray = JSON.parse(res);
                                var tmpPointsArrayForward = new Array();
                                var tmpPointsArrayBackward = new Array();
                                var tmpHatKodu = tmpResArray[0].routeCode;
                                var forwardColor = getRandomColor();
                                var backwardColor = getRandomColor();
                                for (var i = 0; i < tmpResArray.length; i++) {
                                    if (tmpResArray[i].routeDirection === "F") {
                                        tmpPointsArrayForward.push(getLatLonObject(tmpResArray[i].latitude,
                                            tmpResArray[i].longitude));
                                    } else {
                                        tmpPointsArrayBackward.push(getLatLonObject(tmpResArray[i].latitude,
                                            tmpResArray[i].longitude));
                                    }
                                }
                                drawPolyline(tmpHatKodu, tmpPointsArrayForward, forwardColor, "F"); //"0000FF"//F
                                drawPolyline(tmpHatKodu, tmpPointsArrayBackward, backwardColor, "B"); //"FF0000"//B
                                if (linePolylines.length > 0) {
                                    var bounds = new google.maps.LatLngBounds();
                                    for (var i = 0; i < linePolylines.length; i++) {
                                        bounds.extend(linePolylines[i].startMarker.getPosition());
                                        bounds.extend(linePolylines[i].endMarker.getPosition());
                                    }
                                    map.fitBounds(bounds);
                                }
                                routeColors.push({
                                    routeCode: tmpHatKodu,
                                    forwardColor: forwardColor,
                                    backwardColor: backwardColor
                                });
                            } else {
                                loadPanel.hide();
                                toastr["warning"]("Hat için tanımlı bir veri bulunmamaktadır.");
                            }
                        },
                        error: function (xr, ajaxOptions, thrownError) {
                            loadPanel.hide();
                            toastr["warning"]("Hat için tanımlı bir veri bulunmamaktadır.");
                            return;
                        },
                        complete: function () {
                            loadPanel.hide();
                            fitBound();
                            ControlPageItems();
                        }
                    });

                }

            } catch (e) {

            }

        });
        $("#PlatesSelect").change(function () {
            var fDt = GetStartDateTime2();
            var lDt = GetEndDateTime2();
            var plates = $("#plates").val();
            $("#stops").html("");
            $("#stops").trigger("chosen:updated");
            if (plates.length == 0) {
                toastr["warning"]("Plaka boş geçilemez!!");
                return;
            }
            $.ajax({
                url: "/VehicleOffline/GetPlateInStops",
                type: 'POST',
                data: {
                    startDate: fDt,
                    endDate: lDt,
                    plates: plates[0],
                    stops: ''
                },
                success: function (res) {
                    if (res.length > 0) {
                        loadDurakList(res);
                        $("#btnShowBusStopsHistory").show();
                    }
                    else {
                        toastr["warning"]("Bu Plakaya ait durak bulunamadı!", "Uyarı");
                        //$('#duraklarDropDownListVal').hide();
                        //$('#noDataDurak').show();
                        //document.getElementById("noDataDurak").innerHTML = NoData;
                    }
                }
            });
        });

        function loadDurakList(dataString) {
            $("#SelectStops").show();
            $("#btnShowBusStopsHistory").show();
            var markup = "";
            for (var i = 0; i < dataString.length; i++) {
                markup += "<option value='" + dataString[i].durakId + "'>" + dataString[i].durakAdi + "</option>";
            }
            var tmpHtml = $("#stops").html();
            $("#stops").html(tmpHtml + markup);
            $("#stops").trigger("chosen:updated");
            $('#stops').selectpicker('refresh');
        }

        $("#btnShowBusStopsHistory").click(function () {
            loadPanel.show();
            var fDt = GetStartDateTime2();
            var lDt = GetEndDateTime2();
            tempFirstRowDt = null, lastRowDt = null;
            var plates = $("#plates").val();
            var stops = $("#stops").val();
            $.ajax({
                url: "/VehicleOffline/GetBusLocationHistory",
                type: "POST",
                data: {
                    palkaKoduListe: plates[0],
                    firstDate: fDt,
                    lastDate: lDt
                },
                success: function (res) {
                    if (res.length > 0) {
                        if (durakMarkers.length > 0) {
                            for (i = 0; i < durakMarkers.length; i++) {
                                durakMarkers[i].setMap(null);
                            }
                            durakMarkers = new Array();
                            $("#btnShowBusStopsHistory").html($("#btnShowBusStopsHistory").html().replace(window.resBusStopMsg, window.resShowBusStops));
                            return;
                        }
                        var routeData = res;
                        //if (stops != "") {
                        //    $.each(stops,
                        //        function (i, v) {
                        //            GetPlatesInStops(fDt, lDt, plates[0], stops[i]);
                        //        });
                        //} else {
                        //    GetPlatesInStops(fDt, lDt, plates[0], stops);
                        //}
                        GetPlatesInStops(fDt, lDt, plates[0], stops);
                        $("#btnShowBusStopsHistory").html($("#btnShowBusStopsHistory").html().replace(window.resShowBusStops, window.resBusStopMsg));
                    } else {
                        window.toastr["warning"](window.resNoData, window.resInformation);
                    }
                },
                error: function (res) {
                    console.log("");
                },
                complete: function () {
                    loadPanel.hide();
                }
            });
        });
        function GetPlatesInStops(StartDate, EndDate, Plates, stops) {
            $.ajax({
                url: "/VehicleOffline/GetPlateInStops",
                type: "POST",
                data: {
                    plates: Plates,
                    startDate: StartDate,
                    endDate: EndDate,
                    stops: stops
                },
                success: function (res) {
                    if (res !== "") {
                        duraklarListe = res;
                        // set map center to the first bus stop
                        if (duraklarListe.length > 0)
                            map.set("center", new google.maps.LatLng(duraklarListe[0].enlemF, duraklarListe[0].boylamF));
                        $.each(duraklarListe, function (i, v) {
                            if ($.inArray(v.hatKodu, PlatestopUndefinedLines) === -1)
                                PlatestopUndefinedLines.push(v.hatKodu);
                        });
                        // draw bus stop markers on map
                        for (var i = 0; i < duraklarListe.length; i++) {
                            durakMarkers[i] = new google.maps.Marker({
                                'position': new google.maps.LatLng(duraklarListe[i].enlemF, duraklarListe[i].boylamF),
                                'map': map
                            });
                            // select marker logo
                            
                            durakMarkers[i].setIcon("../../image/durak.png");
                            //
                            //if (duraklarListe[i].yon == 'G') {
                            //    durakMarkers[i].setIcon("../../assets/img/bus_blue.png");
                            //} else {
                            //    durakMarkers[i].setIcon("../../assets/img/bus_red.png");
                            //}
                            // add info
                            var infoContentString = "<div class='infoDiv iw-container' data-durakid=\"" + duraklarListe[i].durakId + "\" >" +
                                "<div class='iw-title'>" + window.resLine + ": " + duraklarListe[i].hatKodu + "<br /><hr style=\"margin:0;\"/><h5 style=\"margin:2px;\">" + duraklarListe[i].uzunHatAdi + "</h5></div><div class='iw-content'>" +
                                "<table class='table table-bordered table-striped'><tbody>" +
                                "<tr><td><b>" + window.resExplanation + " :" + "</td><td><b>" + duraklarListe[i].durakAdi + "</b></td></tr>" +

                                "</tbody></table></div></div>";
                            var infowindow = new google.maps.InfoWindow();

                            // add event when a marker is clicked
                            google.maps.event.addListener(durakMarkers[i], "click", (function (mm, tt) {
                                return function () {
                                    infowindow.setContent(tt);
                                    infowindow.open(map, mm);
                                };
                            })(durakMarkers[i], infoContentString));

                            google.maps.event.addListener(infowindow, "domready", function () {
                                var iwOuter = $(".gm-style-iw");

                                var iwCloseBtn = iwOuter.next();
                                iwCloseBtn.css({
                                    width: "19px",
                                    height: "19px",
                                    opacity: "1",
                                    right: "38px",
                                    top: "3px",
                                    border: "3px solid #48b5e9",
                                    'border-radius': "3px !impoertant",
                                    'box-shadow': "0 0 5px #3990B9"
                                });
                                iwCloseBtn.mouseout(function () {
                                    $(this).css({ opacity: "1" });
                                });
                            });
                            PlatestopUndefinedLines.remove(duraklarListe[i].hatKodu);
                        }
                        //$("#btnShowBusStops").html($("#btnShowBusStops").html().replace(window.resShowBusStops, window.resBusStopMsg));
                        $.each(PlatestopUndefinedLines, function (i, v) {
                            setTimeout(function () {
                                toastr["warning"](window.resThe_stops_for_line_xxx_are_undefined__Contact_your_system_administrator_for_identification.replace("xxx", v), window.resAlert + "!");
                            }, 500);
                        });
                    }
                    else {
                        $.each(lineCodes, function (i, v) {
                            setTimeout(function () {
                                toastr["warning"](window.resThe_stops_for_line_xxx_are_undefined__Contact_your_system_administrator_for_identification.replace("xxx", v), window.resAlert + "!");
                            }, 500);
                        });
                    }
                },
                error: function (res) {
                    console.log("");
                },
                complete: function () {
                }
            });

        }
        $("#playSlider").ionRangeSlider({
            min: 0,
            type: "single",
            step: dtStep,
            from: 0,
            hide_min_max: true,
            keyboard: true,
            disable: true,
            prettify: function (num) {
                var millisecindsToAdd = num;
                trackingDateTime = new Date(millisecindsToAdd);

                var tmp = trackingDateTime.getMilliseconds();
                trackingDateTime.setMilliseconds(tmp + dtStep);

                return trackingDateTime.toLocaleString();
            }
        });
        $("#speedSlider").ionRangeSlider({
            min: 0,
            max: 100,
            from_min: 1,
            type: "single",
            step: 10,
            from: 50,
            keyboard: true,
            postfix: "x",
            grid: true,
            grid_num: 10,
            onChange: function (data) {
                speed = 50000 / data.from;
            }
        });
        $("#vehicleSlider").ionRangeSlider({
            min: 0,
            max: 100,
            type: "single",
            step: 1,
            from: 0,
            keyboard: true,
            hide_min_max: true,
            prettify: function (num) {
                return quickDrawData.length > 0 ? getDateTime2(quickDrawData[0].coreData[num].tarih).toLocaleString() : "-";
            },
            onChange: function (data) {
                routeHistoryMarker.setPosition(quickDrawData[0].coords[data.from]);
                $("#vehicleQuickDrawDate").text(getDateTime2(quickDrawData[0].coreData[data.from].tarih).toLocaleString());
                $("#vehicleQuickDrawSpeed").text(window.resSpeed + " : " + quickDrawData[0].coreData[data.from].hiz + " km");
            }
        });
        $("#btnCloseTrackingTools").click(function (e) {
            e.preventDefault();
            $("#btnShowTrackingTools").show();
            setTimeout(function () {
                $("#portlet_trackingTools").fadeOut("slow");
                $("#portlet_trackingTools").hide();
            }, 0);
        });
        $("#btnShowTrackingTools").click(function (e) {
            e.preventDefault();
            $("#portlet_trackingTools").show();
            $("#btnShowTrackingTools").hide();
        });
        $("#aCloseQuickDraw").trigger("click");
    });
    function fillGridLive() {
        // function fillGridLive() {
        $("#gridContainer").dxDataGrid({
            //dataSource: data,
            dataSource: {
                store: {
                    data: offlineTrackinGridData,
                    type: 'array',
                    key: 'plaka'
                }
            },
            columns: [
                {
                    dataField: "validatorNo",
                    caption: "Araç No",
                    alignment: "left",
                    height: 35

                },
                {
                    dataField: "plaka",
                    caption: "Plaka"
                    //width: 130,
                },
                {
                    dataField: "kurumKodu",
                    caption: "Kurum Adı"
                },
                {
                    dataField: "grupKodu",
                    caption: "Grup Kodu"
                },
                {
                    dataField: "hatKodu",
                    caption: "Hat  Kodu"
                },
                {
                    dataField: "uzunHatAdi",
                    caption: "Güzergah"
                },
                {
                    dataField: "hiz",
                    caption: "Hız",
                    alignment: "left"
                },
                {
                    dataField: "tarih",
                    caption: "Güncelleme Zamanı",
                    dataType: "datetime",
                    format: "yyyy-MM-dd HH:mm:ss"
                }
            ],
            //keyExpr: "plaka",
            selection: {
                mode: "multiple",
                //deferred: true,
                showCheckBoxesMode: "always",
                allowSelectAll: true
            },
            paging: {
                pageSize: 8
            },
            pager: {
                showPageSizeSelector: true,
                allowedPageSizes: [8],
                showInfo: true
            },
            sorting: {
                mode: "multiple"
            },
            columnsAutoWidth: true,
            filterRow: {
                visible: true,
                applyFilter: "auto"
            },
            headerFilter: {
                visible: true
            },
            "export": {
                enabled: true,
                fileName: "Araç Son Konum Kayıtları",
                allowExportSelectedData: true
            },
            allowColumnReordering: true,
            allowColumnResizing: true,
            columnAutoWidth: true,
            columnChooser: {
                enabled: true
            },
            columnFixing: {
                enabled: true
            },
            scrolling: {
                mode: "Standard"
            },
            rowAlternationEnabled: true,
            showBorders: true,
            showRowLines: true,
            showColumnLines: true,
            onSelectionChanged: function (items) {
                var mSelectedPlates = GetSelectedPlates();
                if (mSelectedPlates.length > 0) {
                    $("#btnShowOnMap").show();
                    $("#btnShowBusStops").show();
                    $("#btnDrawLines").show();
                    $("#btnDrawMarkerCluster").show();
                    if (items.currentSelectedRowKeys.length > 0) {
                        for (var i = 0; i < items.currentSelectedRowKeys.length; i++) {
                            var mRouteCode = GetPlateRoute(items.currentSelectedRowKeys[i]);
                            if (mRouteCode !== null && mRouteCode !== undefined && mRouteCode !== "") {
                                selectedLines = AddValueToArray(selectedLines, mRouteCode);
                            }
                        }
                    } else {
                        for (var i = 0; i < items.currentDeselectedRowKeys.length; i++) {
                            var mRouteCode = GetPlateRoute(items.currentDeselectedRowKeys[i]);
                            if (mRouteCode !== null && mRouteCode !== undefined && mRouteCode !== "") {
                                selectedLines = RemoveValueFromArray(selectedLines, mRouteCode);
                            }
                        }
                    }
                } else {
                    $("#btnShowOnMap").hide();
                    $("#btnShowBusStops").hide();
                    $("#btnDrawLines").hide();
                    $("#btnDrawMarkerCluster").hide();
                    selectedLines = [];
                }
            }
        }).dxDataGrid("instance");
        $("#getSelectedRowKeysButton").dxButton({
            text: 'Get Selected Row Keys',
            onClick: function (info) {
                var dataGrid = $('#gridContainer').dxDataGrid('instance');
                var keys = dataGrid.getSelectedRowKeys();
                $('#textArea').html('');
                $('#textArea').html(JSON.stringify(keys));
            }
        });
    };
    function GetSelectedPlates() {
        var dataGrid = $('#gridContainer').dxDataGrid('instance');
        var keys = dataGrid.getSelectedRowKeys();
        return keys;
    }
    function AddValueToArray(array, value) {
        if (array === null || array === undefined) {
            array = [];
        }
        var isExists = false;
        for (var i = 0; i < array.length; i++) {
            if (array[i] === value) {
                isExists = true;
                break;
            }
        }
        if (!isExists) {
            array.push(value);
        }
        return array;
    }
    function RemoveValueFromArray(array, value) {
        var mArray = [];
        for (var i = 0; i < array.length; i++) {
            if (array[i] !== value) {
                mArray.push(array[i]);
            }
        }
        return mArray;
    }
    function ParseAllData(dataArray) {
        allData = [];
        if (dataArray !== null && dataArray !== undefined && dataArray.length > 0) {
            for (var i = 0; i < dataArray.length; i++) {
                allData.push({ plaka: dataArray[i].plaka, hatKodu: dataArray[i].hatKodu });
            }
        }
    }
    function GetPlateRoute(plate) {
        var mRouteCode = "";
        if (allData !== null && allData !== undefined && allData !== null) {
            for (var i = 0; i < allData.length; i++) {
                if (allData[i].plaka === plate) {
                    mRouteCode = allData[i].hatKodu;
                    break;
                }
            }
        }
        return mRouteCode;
    }
    $(window).resize(function () {
        setTimeout(function () {
            $(".page-container").height($("body").height() - $(".header").height());
            $(".page-content").height($("body").height() - $(".header").height());
            $("#portlet_offlineTrackingFilter").css("left", $(".page-sidebar").width() + "px");
            $("#dvMap").width($("body").width() - $(".page-sidebar").width());
            $("#dvMap").height($(".page-content").height() - $("#portlet_offlineTrackingFilter").height());
            $("#portlet_offlineTrackingFilter").width($("body").width() - $(".page-sidebar").width());
            google.maps.event.trigger(map, "resize");
            if ($.fn.DataTable.isDataTable("#tbl_offlineTrackingFilter")) $("#tbl_offlineTrackingFilter").DataTable().draw(false);
        }, 0);
    });
    function GridTimeout() {
        loadPanel.show();
        var sd = window.GetStartDateTime();
        var ed = window.GetEndDateTime();
        $.ajax({
            url: "/VehicleOffline/GetBusLocationHistory",
            type: "POST",
            data: {
                palkaKoduListe: Choiceplaka,
                firstDate: sd,
                lastDate: ed
            },
            success: function (res) {
                if (res !== "" && res !== "[]") {
                    //bulkBusData = bulkBusData.length > 0 ? bulkBusData.concat(res) : res;
                    //tempBulkData = tempBulkData ? tempBulkData.concat(res) : res;
                    bulkBusData = res;
                    tempBulkData = res;
                    loadPanel.hide();
                }
            },
            error: function (res) {
                loadPanel.hide();
                console.log("");
            },
            complete: function () {
                loadPanel.hide();
                if (bulkBusData.length === 0) {
                    window.toastr["warning"](window.resNoData, window.resInformation);
                    return;
                }
                firstRowDt = Enumerable.From(bulkBusData).OrderBy("$.tarih").Take(1).SingleOrDefault(null, "$.tarih").tarih;//Rapor başlangıç tarih saati
                lastRowDt = Enumerable.From(bulkBusData).OrderByDescending("$.tarih").Take(1).SingleOrDefault(null, "$.tarih").tarih;//Rapor bitiş tarih saati
                distinctPlates = Enumerable.From(bulkBusData).Distinct("$.plaka").Select("$.plaka").ToArray();
                trackingDateTime = firstRowDt;
                var data = [];
                for (var j = 0; j < distinctPlates.length; j++) {
                    var row = Enumerable.From(bulkBusData)
                        .Where(function (i) { return distinctPlates[j] === i.plaka; })
                        .Take(1)
                        .OrderBy(function (o) { return getDateTime2(o.tarih) })
                        .ToArray();
                    data = data.concat(row);
                }
                offlineTrackinGridData = data;
                ParseAllData(data);
                setTimeout(function () {
                    if (gridSourceStatus === false) {
                        fillGridLive();
                        gridSourceStatus = true;
                    }
                    else {
                        $("#gridContainer").dxDataGrid("instance").option("dataSource.store.data", offlineTrackinGridData);
                    }
                }, 0);
                return;
            }
        });
    }
    function PlayTimeOut() {
        if (tempFirstRowDt == null || lastRowDt == null) return;
        var nextDate = new Date(tempFirstRowDt);
        nextDate = nextDate.setSeconds(nextDate.getSeconds() + (dtStep / 1000));

        var previousDate = new Date(tempFirstRowDt);
        previousDate = previousDate.setSeconds(previousDate.getSeconds() - (dtStep / 1000));

        var selectedItems = [];
        selectedItems = GetSelectedPlates();
        var tempData = [];
        for (var k = 0; k < selectedItems.length; k++) {
            var plateItem = selectedItems[k];
            if (plateItem) {
                var tempRow = Enumerable.From(bulkBusData).Where(function (i) {
                    return i.plaka === plateItem && ((new Date(i.tarih) >= tempFirstRowDt && new Date(i.tarih) < new Date(nextDate))
                        || (new Date(i.tarih) >= new Date(previousDate) && new Date(i.tarih) < new Date(nextDate)));
                }).OrderBy("$.tarih").Take(1).SingleOrDefault(null, "$.tarih");

                if (tempRow != null) {
                    //console.log("plateItem: "+plateItem+" > " + tempRow.tarih);
                    tempData.push(tempRow);
                }
            }
        }
        if (markers == undefined || markers.length === 0) {
            CreateMarkers(tempData);
            clusterData = tempData;
        } else {
            UpdateMarkers(tempData);
            clusterData = tempData;
        }
        offlineTrackinGridData = tempData;
        var playSlider = $("#playSlider").data("ionRangeSlider");
        trackingDateTime = new Date(tempFirstRowDt);
        playSlider.update({
            from: trackingDateTime.getTime()
        });
        if (selectedItems === []) return;
        tempFirstRowDt = new Date(nextDate);
        if (tempFirstRowDt <= new Date(lastRowDt)) setTimeout(function () { PlayTimeOut(); }, speed);
        else {
            $("#btnStopTracking").trigger("click");
            window.toastr["success"](window.resTrackingFinished, window.resInformation);
        }
    }
    function GetRow(bulkBusData, plaka) {
        var row = null;
        for (var i = 0; i < bulkBusData.length; i++) {
            if (bulkBusData[i].plaka === plaka) {
                row = bulkBusData[i];
                break;
            }
        }
        return row;
    }
    function CreateMarkers(offlineTrackingResults) {
        // clear all previous markers and markers clusters
        var i;
        for (i = 0; i < markers.length; i++) {
            if (markers[i] != undefined)
                markers[i].marker.setMap(null);
        }
        markers = new Array();
        if (markerCluster != undefined)
            markerCluster.clearMarkers();
        var greenCount = 0;
        var grayCount = 0;
        var redCount = 0;
        // loop result array to create markers
        for (i = 0; i < offlineTrackingResults.length; i++) {
            // if the user specified some plates to only display its vehicles; then check if this vehicle belongs to the selected plates
            if (selectedPlates !== "") {
                if (jQuery.inArray(offlineTrackingResults[i].plaka, selectedPlates.split(",")) === -1)
                    continue;
            } else continue;
            ControlPageItems();
            // get the marker icon corresponding with the vehicle status
            var tmpImageUrl = getImgURLFromColor(offlineTrackingResults[i].renk);
            // call marker creation function and add marker to the global Array
            var markerName = offlineTrackingResults[i].validatorNo.toString() + " - " + offlineTrackingResults[i].plaka.toString();
            markers.push({
                plaka: offlineTrackingResults[i].plaka,
                marker: CreateMarker(map, offlineTrackingResults[i].enlem, offlineTrackingResults[i].boylam, tmpImageUrl, markerName, CreateMarkerInfoContent(offlineTrackingResults[i]), markers.length)
            });
            markers[markers.length - 1].marker.setMap(map);

            if (offlineTrackingResults[i].renk === "00FF00") {
                greenCount++;
                $("#green").text("Active : " + greenCount);
            }
            else if (offlineTrackingResults[i].renk === "A9A9A9") {
                grayCount++;
                $("#gray").text("No Data : " + grayCount);
            }
            else {
                redCount++;
                $("#red").text("Stand-By : " + redCount);
            }
        }
        if (markers.length > 0) {
            var latlngbounds = new google.maps.LatLngBounds();
            markers.forEach(function (markerWithLabel) {
                latlngbounds.extend(markerWithLabel.marker.position);
            });
            map.setCenter(latlngbounds.getCenter());
            map.fitBounds(latlngbounds);
        }
        if (clusterFlag === 1) {
            if (selectedPlates.split(",").length > 1) {
                tmpMarkers = new Array();
                for (i = 0; i < markers.length; i++) {
                    tmpMarkers.push(markers[i].marker);
                }
                if (clusterFlag === 1) {
                    markerCluster = new MarkerClusterer(map, tmpMarkers, mcOptions);
                }
            }
        }

        // hide loading images
        loadPanel.hide();
    }
    function UpdateMarkers(liveTrackingResults) {
        // loop array and update markers
        for (var i = 0; i < liveTrackingResults.length; i++) {
            // if user specified specific vehicle statuses to show then determine if the current vehicle need to be shown or not
            // if the user specified some Plates to only display its vehicles; then check if this vehicle belongs to the selected Plates
            if (selectedPlates != undefined) {
                if (jQuery.inArray(liveTrackingResults[i].plaka, selectedPlates.split(",")) === -1)
                    continue;
            }
            try {
                // get the existing marker object for this vehicle
                var currntMarkerId = getMarkerByPlaka(liveTrackingResults[i].plaka);
                // get the marker icon corresponding with the vehicle status
                var tmpImageUrl = getImgURLFromColor(liveTrackingResults[i].renk);
                // generate info window content
                var markerName = liveTrackingResults[i].validatorNo.toString() + " - " + liveTrackingResults[i].plaka.toString();
                if (currntMarkerId != undefined) {
                    var currntMarker = markers[currntMarkerId].marker;
                    var tmpDate;
                    var tmp;
                    tmp = liveTrackingResults[i].tarih;
                    tmpDate = new Date(tmp);
                    // change the marker position
                    currntMarker.setPosition(new google.maps.LatLng(liveTrackingResults[i].enlem, liveTrackingResults[i].boylam));
                    // rotate marker image
                    $("#markerImage_" + currntMarkerId).rotate(liveTrackingResults[i].yon + 180);
                    // change makrer image content
                    currntMarker.labelContent = "<div><img id=\"markerImage_" + currntMarkerId + "\" data-markerid=\"" + currntMarkerId + "\" src=\"../content/" + tmpImageUrl + "\" style=\"width:20px;height:20px\"/><p id=\"markerText_" + currntMarkerId + "\" style=\"text-align:center;color:black;z-index:100\">" + markerName + "</p></div>";

                    // change the markers info window content
                    currntMarker.infoWindow.setContent(CreateMarkerInfoContent(liveTrackingResults[i]));
                    currentMarkerGlobal = currntMarker;
                } else {
                    // create new marker
                    var tmpMarker = CreateMarker(map, liveTrackingResults[i].enlem, liveTrackingResults[i].boylam, tmpImageUrl, markerName, CreateMarkerInfoContent(liveTrackingResults[i]), markers.length);
                    // generate result table row for this vehicle
                    //AddDataToTblLiveTracking(i, liveTrackingResults[i]);
                    // add the new marker to the markers array
                    markers.push({
                        plaka: liveTrackingResults[i].plaka,
                        marker: tmpMarker
                    });
                    //if user did not specify some plates only to show then add the generated marker to the markers cluster
                    if (clusterFlag === 1) {
                        if (selectedPlates.split(",").length > 1) {
                            markerCluster.addMarker(tmpMarker);
                        }
                    }
                }
            } catch (e) {
                console.log("");
            }
        }
        //if user did not specify some plates only to show then refresh the markers cluster
        if (clusterFlag === 1) {
            if (selectedPlates.split(",").length > 1) {
                markerCluster.repaint();
                loadPanel.hide();
            }
        }
    }
    function CreateMarkerInfoContent(markerData) {
        var tmp;
        tmp = markerData.tarih;
        var content = "<div class='iw-container' id='" + markerData.plaka.replace(/ /g, "-") + "'><div class='iw-title'><b>" + window.resPlate + ":</b> " + markerData.plaka + "</div>" +
            "<div class='iw-content'>" +
            "<table class='table table-bordered table-striped'>" +
            "<tr><td width='50%'><b>" + window.resSpeed + ":</b></td><td>" + markerData.hiz + "</td></tr>" +
            (markerData.mesafe ? "<tr><td width='50%'><b>" + window.resDistance + ":</b></td><td>" + markerData.mesafe + "</td></tr>" : "") +
            (markerData.surucu ? "<tr><td width='50%'><b>" + window.resDriver + ":</b></td><td>" + markerData.surucu + "</td></tr>" : "") +
            (markerData.gunlukYolcu ? "<tr><td width='50%'><b>" + window.resDailyPassenger + ":</b></td><td>" + markerData.gunlukYolcu + "</td></tr>" : "") +
            (markerData.seferYolcu ? "<tr><td width='50%'><b>" + window.resTripPassenger + ":</b></td><td>" + markerData.seferYolcu + "</td></tr>" : "") +
            (markerData.durakYolcu ? "<tr><td width='50%'><b>" + window.resPreviousStopPassenger + ":</b></td><td>" + markerData.durakYolcu + "</td></tr>" : "");
        content += ((window.IsNoAmount === "True")) ? "" :
            (markerData.toplamHasilat ? "<tr><td width='50%'><b>" + window.resTotalRevenue + ":</b></td><td>" + markerData.toplamHasilat + " TL</td></tr>" : "");
        content +=
            (markerData.maxHiz ? "<tr><td width='50%'><b>" + window.resMaxSpeed + ":</b></td><td>" + markerData.maxHiz + "</td></tr>" : "") +
            (markerData.resActualRoute ? "<tr><td width='50%'><b>" + window.resActualRoute + ":</b></td><td>" + markerData.uzunHatAdi + "</td></tr>" : "") +
            (markerData.tmp ? "<tr><td width='50%'><b>" + window.resUpdateDate + ":</b></td><td>" + (new Date(Number(tmp))).toLocaleString() + "</td></tr>" : "") +
            "</table></div></div>";
        return content;
    }
    function CreateMarker(map, lat, long, markerImageUrl, markerLabelText, infoWindowContent, markerId) {
        // if the marker have an infowindow then create it and associate marker click event with opening it; otherwise do not create info window
        if (infoWindowContent == undefined) {
            return new MarkerWithLabel({
                position: new google.maps.LatLng(lat, long),
                labelContent: "<div><img id=\"markerImage_" + markerId + "\" data-markerid=\"" + markerId + "\" src=\"../content/" + markerImageUrl + "\" style=\"width:20px;height:20px\"/><p id=\"markerText_" + markerId + "\" style=\"text-align:center;color:black;z-index:100\">" + markerLabelText + "</p></div>",
                icon: "../../image/vehicleImg/transparent_icon_8.png"
            });
        } else {
            var infowindow = new google.maps.InfoWindow({
                content: infoWindowContent
            });
            var tmpMarker = new MarkerWithLabel({
                position: new google.maps.LatLng(lat, long),
                labelContent: "<div><img id=\"markerImage_" + markerId + "\" data-markerid=\"" + markerId + "\" src=\"../content/" + markerImageUrl + "\" style=\"width:20px;height:20px\"/><p id=\"markerText_" + markerId + "\" style=\"text-align:center;color:black;z-index:100\">" + markerLabelText + "</p></div>",
                icon: "../../image/vehicleImg/transparent_icon_8.png",
                infoWindow: infowindow
            });
            // set a function on marker click event that will open the infowindow and set the selected plate so the map will recenter with its changing position
            google.maps.event.addListener(tmpMarker, "click", function () {
                this.infoWindow.open(map, this);
                selectedPlaka = markers[parseInt(this.label.eventDiv_.children[0].children[0].id.replace("markerImage_", ""))].plaka;
            });
            google.maps.event.addListener(infowindow, "domready", function () {
                var iwOuter = $("#" + selectedPlaka.replace(/ /g, "-")).parent("div").parent("div").parent("div.gm-style-iw");
                var iwCloseBtn = iwOuter.next();
                iwCloseBtn.css({
                    width: "19px",
                    height: "19px",
                    opacity: "1",
                    right: "6px",
                    top: "8px",
                    border: "3px solid #48b5e9",
                    'border-radius': "3px !impoertant",
                    'box-shadow': "0 0 5px #3990B9"
                });
                iwCloseBtn.mouseout(function () {
                    $(this).css({ opacity: "1" });
                });
            });
            return tmpMarker;
        }
    }
    function getAllLineCoordinates(hatKodu, noRecords, isLast) {
        $.ajax({
            url: "/VehicleOffline/GetRouteGpsCoordinates",
            type: "GET",
            data: {
                lineCode: hatKodu
            },
            success: function (res) {
                if (res !== "" && res !== "[]") {
                    // if the user did not click hide lines button
                    if (showPolyLines) {
                        // create an array of point objects for the line coordinates points
                        var tmpResArray = JSON.parse(res);
                        var tmpPointsArrayForward = new Array();
                        var tmpPointsArrayBackward = new Array();
                        var tmpHatKodu = tmpResArray[0].hatKodu;
                        var forwardColor = getRandomColor();
                        var backwardColor = getRandomColor();
                        for (var i = 0; i < tmpResArray.length; i++) {
                            if (tmpResArray[i].Yon === "F") {
                                tmpPointsArrayForward.push(getLatLonObject(tmpResArray[i].enlemF,
                                    tmpResArray[i].boylamF));
                            } else {
                                tmpPointsArrayBackward.push(getLatLonObject(tmpResArray[i].enlemF,
                                    tmpResArray[i].boylamF));
                            }
                        }
                        // draw the polyline on the map
                        //tmpPointsArrayForward = calculateTrueRoute(tmpPointsArrayForward);
                        drawPolyline(tmpHatKodu, tmpPointsArrayForward, forwardColor, "F"); //"0000FF"//F
                        drawPolyline(tmpHatKodu, tmpPointsArrayBackward, backwardColor, "B"); //"FF0000"//B
                        if (linePolylines.length > 0) {
                            var bounds = new google.maps.LatLngBounds();
                            for (var i = 0; i < linePolylines.length; i++) {
                                bounds.extend(linePolylines[i].startMarker.getPosition());
                                bounds.extend(linePolylines[i].endMarker.getPosition());
                            }
                            map.fitBounds(bounds);
                        }
                        routeColors.push({
                            routeCode: tmpHatKodu,
                            forwardColor: forwardColor,
                            backwardColor: backwardColor
                        });
                    }
                } else {
                    noRecords.push(hatKodu);
                }
            },
            error: function (xr, ajaxOptions, thrownError) {
                toastr["warning"]("Hat için tanımlı bir veri bulunmamaktadır.");
                return;
            },
            complete: function () {
                if (isLast && noRecords.length > 0) {
                    toastr["warning"](noRecords.join(", ") + " için tanımlı hat bilgisi bulunmamaktadır.");
                }
                fitBound();
                ControlPageItems();
            }
        });
    }
    function drawPolyline(lineCode, positionsArray, color, direction) {
        if (!positionsArray || positionsArray.length === 0) return;

        var start = positionsArray[0];
        var end = positionsArray[positionsArray.length - 1];
        var polyLine = new google.maps.Polyline({
            path: positionsArray,
            icons: [{ icon: fArrow, repeat: "50px" }],
            geodesic: true,
            strokeColor: "#" + color,
            strokeOpacity: 0.7,
            strokeWeight: 2
        });
        var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + color,
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34));
        var startMarker = new MarkerWithLabel({
            position: start,
            icon: pinImage,
            labelContent: lineCode + "-" + (direction === "F" ? window.resForward : window.resBackward) +
                "<br />Başlangıç",
            labelAnchor: new google.maps.Point(35, 55),
            labelClass: "lblMarker lblMarker" + direction,
            labelStyle: { opacity: 1.0 }
        });
        var endMarker = new MarkerWithLabel({
            position: end,
            icon: pinImage,
            labelContent: lineCode + "-" + (direction === "F" ? window.resForward : window.resBackward) +
                "<br />Bitiş",
            labelAnchor: new google.maps.Point(35, 55),
            labelClass: "lblMarker lblMarker" + direction,
            labelStyle: { opacity: 1.0 }
        });

        polyLine.setMap(map);
        startMarker.setMap(map);
        endMarker.setMap(map);

        linePolylines.push({
            direction: direction,
            lineCode: lineCode,
            polyline: polyLine,
            startMarker: startMarker,
            endMarker: endMarker
        });
    }
    function GetDevxDateTime(elem) {
        var elemDateVal = elem.GetDate();
        var day = elemDateVal.getDate().toString().length === 1
            ? "0" + elemDateVal.getDate().toString()
            : elemDateVal.getDate().toString();
        var month = elemDateVal.getMonth() + 1;
        month = month.toString().length === 1
            ? "0" + month.toString()
            : month.toString();
        var hours = elemDateVal.getHours().toString().length === 1
            ? "0" + elemDateVal.getHours().toString()
            : elemDateVal.getHours().toString();
        var minutes = elemDateVal.getMinutes().toString().length === 1
            ? "0" + elemDateVal.getMinutes().toString()
            : elemDateVal.getMinutes().toString();
        var secounds = elemDateVal.getSeconds().toString().length === 1
            ? "0" + elemDateVal.getSeconds().toString()
            : elemDateVal.getSeconds().toString();
        return elemDateVal.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + secounds;
    }
    function getDateTime2(timeSpanString) {
        try {
            if (timeSpanString != null) {
                var nDate = new Date(timeSpanString);
                return nDate.toLocaleString();
                //var tmpDateString = timeSpanString.replace("/Date(", "").replace(")/", "");
                //var tmpDate = new Date(parseInt(tmpDateString));
                //return tmpDate;
            }
        } catch (e) {
        }
        return new Date();
    }
    function ControlPageItems() {
        if (RouteStationMarkers.length > 0 || linePolylines.length > 0 || markers.length > 0) {
            if ($("#btnClearMap").hasClass("display-none")) $("#btnClearMap").show();
        } else if (RouteStationMarkers.length === 0 && linePolylines.length === 0 && markers.length === 0) {
            $("#btnClearMap").show("");
        }
        if (RouteStationMarkers.length === 0)
            $("#btnShowBusStops").html($("#btnShowBusStops").html().replace(window.resBusStopMsg, window.resShowBusStops));
        else
            $("#btnShowBusStops").html($("#btnShowBusStops").html().replace(window.resShowBusStops, window.resBusStopMsg));
        if (linePolylines.length === 0)
            $("#btnDrawLines").html($("#btnDrawLines").html().replace(window.resHideRoutes, window.resDrawRoute));
        else
            $("#btnDrawLines").html($("#btnDrawLines").html().replace(window.resDrawRoute, window.resHideRoutes));
    }
    function collapseExpandCallback() {
        if ($.fn.DataTable.isDataTable("#tbl_offlineTrackingFilter")) $("#tbl_offlineTrackingFilter").DataTable().draw(false);
        $("#dvMap").height($(".page-content").height() - $("#portlet_offlineTrackingFilter").height());
        google.maps.event.trigger(map, "resize");
        $.each($("#tbl_offlineTrackingFilter tbody tr:first-child td.col"), function () {
            var selector = ".dataTables_scrollHead .col-" + $(this).attr("class").split("col-")[1].split(" ")[0];
            $(selector).outerWidth($(this).outerWidth());
        });
    }
    function getLatLonObject(lat, lon) {
        return new google.maps.LatLng(lat, lon);
    }
    function getImgURLFromColor(color) {
        switch (color) {
            case "00FF00"://green
                return "../../image/vehicleImg/icon/green_bus_croped_16_20.png";
            case "FF0000"://red
                return "../../image/vehicleImg/icon/red_bus_croped_16_20.png";
            case "FFFF00"://yellow
                return "../../image/vehicleImg/icon/yellow_bus_croped_16_20.png";
            case "A9A9A9"://grey
                return "../image/vehicleImg/icon/grey_bus_croped_16_20.png";
            default:
                break;
        }
        return "";
    }
    function getMarkerByPlaka(plaka) {
        // loop global array and return the marker object of this plate
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].plaka === plaka) {
                return i;
            }
        }
        return null;
    }
    function getRandomColor() {
        var letters = "0123456789ABCDEF";
        var color = "";
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    function fitBound() {
        if (routeMarkers.length > 0) {
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0; i < routeMarkers.length; i++) {
                bounds.extend(routeMarkers[i].getPosition());
            }
            map.fitBounds(bounds);
        }
    }
    function pausMonitoring() {
        var playSlider = $("#playSlider").data("ionRangeSlider");
        playSlider.update({
            disable: false
        });
    }
    function resumeMonitoring() {
        var playSlider = $("#playSlider").data("ionRangeSlider");
        var tmp = trackingDateTime.getMilliseconds();
        trackingDateTime.setMilliseconds(tmp + 1000);
        tempFirstRowDt = trackingDateTime;
        playSlider.update({
            disable: true,
            from: trackingDateTime.getTime()
        });
    }
    function loadHistories() {
        loadPanel.show();
        var sd = window.GetStartDateTime();
        var ed = window.GetEndDateTime();
        $.ajax({
            url: "/VehicleOffline/GetBusLocationHistory",
            type: "POST",
            data: {
                palkaKoduListe: window.selectedPlates,
                firstDate: sd,
                lastDate: ed
            },
            success: function (res) {
                if (res !== "" && res !== "[]") {
                    bulkBusData = res;
                }
            },
            error: function (res) {
                loadPanel.hide();
            },
            complete: function () {
                loadPanel.hide();
                if (bulkBusData.length === 0) {
                    window.toastr["warning"](window.resNoData, window.resInformation);
                }
                firstRowDt = Enumerable.From(bulkBusData).OrderBy("$.tarih").Take(1).SingleOrDefault(null, "$.tarih").tarih;//Rapor başlangıç tarih saati
                lastRowDt = Enumerable.From(bulkBusData).OrderByDescending("$.tarih").Take(1).SingleOrDefault(null, "$.tarih").tarih;//Rapor bitiş tarih saati
                distinctPlates = Enumerable.From(bulkBusData).Distinct("$.plaka").Select("$.plaka").ToArray();
                trackingDateTime = firstRowDt;
                setTimeout(function () {
                    tempFirstRowDt = firstRowDt;
                    var playSlider = $("#playSlider").data("ionRangeSlider");
                    var startDt = new Date(firstRowDt);
                    var endDt = new Date(lastRowDt);
                    playSlider.update({
                        max: endDt.getTime(),
                        min: startDt.getTime(),
                        from: 0
                    });
                    $("#portlet_trackingTools").show();
                    $("#btnPauseTracking").show();
                    $("#btnResumeTracking").hide();
                    PlayTimeOut();
                }, 0);
            }
        });
    }
    function CreateRouteStationMarkers(result) {
        var tmpPointsArrayForward = new Array();
        var tmpPointsArrayBackward = new Array();
        var forwardDatas = new Array();
        var backwardDatas = new Array();
        var tmpResArray = result;
        for (var i = 0; i < tmpResArray.length; i++) {
            if (tmpResArray[i].yon === "G") {
                tmpPointsArrayForward.push(getLatLonObject(tmpResArray[i].enlemF, tmpResArray[i].boylamF));
                forwardDatas.push(tmpResArray[i]);
            } else {
                tmpPointsArrayBackward.push(getLatLonObject(tmpResArray[i].enlemF, tmpResArray[i].boylamF));
                backwardDatas.push(tmpResArray[i]);
            }
        }
        RouteStationMarkers = new Array();
        CreateStationMarkers("F", tmpPointsArrayForward, forwardDatas);
        CreateStationMarkers("B", tmpPointsArrayBackward, backwardDatas);
    }
    function CreateStationMarkers(direction, positionsArray, data) {
        $.each(positionsArray, function (i, v) {
            var infoPopup = new google.maps.InfoWindow({
                content: "<b><div class='iw-container' id='" + data[i].durakId + "'><div class='iw-title'>(" + data[i].siraNo + ") " + data[i].aciklama + "</div></b>" +
                    "<div class='iw-content'>" +
                    "<table class='table table-bordered table-striped'>" +
                    "<tr><td width='50%'><b>" + window.resBoarding + ":</b></td><td>" + data[i].boardingCount + "</td></tr>" +
                    "<tr><td width='50%'><b>" + window.resDurak_Hasılat + ":</b></td><td>" + data[i].totalRevenue + "</td></tr>" +
                    "<tr><td width='50%'><b>" + window.resLatitude + ":</b></td><td>" + data[i].enlemF + "</td></tr>" +
                    "<tr><td width='50%'><b>" + window.resLongitude + ":</b></td><td>" + data[i].boylamF + "</td></tr>" +
                    "</table></div></div>"
            });
            var marker = new MarkerWithLabel({
                position: v,
                icon: "http://maps.google.com/mapfiles/ms/icons/" + (direction === "F" ? "blue" : "red") + "-dot.png",
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

