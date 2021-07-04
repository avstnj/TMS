try {
    //DECLARETIONS
    var result = "";
    var SelectionCount = 0;
    var TramvayListeVal = 0;
    var busRouteHistory = new Array();
    busRouteHistory[0] = new Array();
    var trackingDateTime;
    var interval = 200;
    var myTimer;
    var marker;
    var lastRotation = 0;
    var trackingStartDateTime;
    var trackingEndDateTime;
    var currentState = "Idle";
    var flg = 0;
    var duraklarListe;
    var addBallonsTimer;
    var markersD = new Array();
    var mapReallocated = false;
    var loadedAddresses = 0;
    var tmpMapRouteString;
    var plateValues = new Array();
    var loadedIndex = 0;
    var markers = new Array();
    var finnishFlag = new Array();
    var linePolylines = new Array();
    var linePoly = new Array();
    var Ihlal = new Array();
    var routeMarkers = new Array();
    var routeColors = new Array();
    var showPolyLines = true;
    var lineCodes = "";
    var busRouteHistoryIhlal = new Array();
    var cordinat = new Array();
    var ihlalArray = new Array();
    var ihlalArrayRed = new Array();
    var Polylin = new Array();
    var fArrow = {
        path: "M 0,0 4,4 1,4 0,3 -1,4 -4,4 z",
        fillColor: "white",
        fillOpacity: 0.35,
        scale: 2
    };
    $(document).ready(function () {
        $(".chosen-select").chosen();
        $("#alertReportParams").show();
        $("#alertReport").hide();
        $("#line_top_x").hide();
        $("#back").hide();
        checkColorPanel();
        $("#selectAllLinesCheckBos").change(function (e) {
            var val = document.getElementById("selectAllLinesCheckBos").checked;
            if (val === true) {
                $("#ddlPlakalar option").prop("selected", false);
                $("#ddlPlakalar").prop("disabled", true).trigger("chosen:updated");
                document.getElementById("valid").innerHTML = "";
            } else {
                $("#ddlPlakalar option").prop("selected", false);
                $("#ddlPlakalar").prop("disabled", false).trigger("chosen:updated");
            }
        });
    });
    try {
        tmpMapRouteString = JSON.parse(document.getElementById("mapSavedRoutHiddenField").value);
        loadPoly(tmpMapRouteString);
    } catch (exception) { }
    function InitializeInnerMap() {
        map.setOptions({ styles: myMapStyle });
        map.setOptions({ zoom: 12 });
        var centerPoint = new google.maps.LatLng(lat, long);
        map.setCenter(centerPoint);
    }
    function getBusRouteHitory() {
        loadNextTrackIhlal();
    }
    function InitializePage() {
        Math.degrees = function (radians) {
            return radians * 180 / Math.PI;
        };
        getBusRouteHitory();
        $("#line_top_x").hide();
        $("#back").hide();
        $("#selectAllLinesCheckBos").change(function (e) {
            var val = document.getElementById("selectAllLinesCheckBos").checked;
            if (val === true) {
                $("#ddlPlakalar option").prop("selected", false);
                $("#ddlPlakalar").prop("disabled", true).trigger("chosen:updated");
                document.getElementById("valid").innerHTML = "";
            } else {
                $("#ddlPlakalar option").prop("selected", false);
                $("#ddlPlakalar").prop("disabled", false).trigger("chosen:updated");
            }
        });
        try {
            tmpMapRouteString = JSON.parse(document.getElementById("mapSavedRoutHiddenField").value);
            loadPoly(tmpMapRouteString);
        } catch (exeption) {
        }

        $(document).keyup(function (e) {
            if (e.keyCode === 27) { // esc
                $("#dvMap").css("position", "relative").css("top", 0).css("height", 600);
                google.maps.event.trigger(map, "resize");
            } else if (e.keyCode === 32) { // space
                if (currentState === "Paused") {
                    $("#resumeTrackingButton").click();
                } else {
                    $("#pauseTrackingButton").click();
                }
            }
        });
        $("#drawPolyButton").click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            makeFullScreen();
        });
    }
    function loadPlakaList(dataString) {
        var data = JSON.parse(dataString);
        var markup = "";
        for (var i = 0; i < data.length; i++) {
            markup += "<option value='" + data[i] + "'>" + data[i] + "</option>";
        }
        $("#ddlPlakalar").html(markup);
        $("#ddlPlakalar").trigger("chosen:updated");
    }
    function loadNextTrackIhlal() {
        $("#loadingImageDiv").show();
        currntMarker = undefined;
        $.ajax({
            url: "/ExpeditionControl/ExpControlGet",
            type: "POST",
            data: {
            },
            success: function (res) {
                if (res !== "[]") {
                    if (ihlalArray.length > 0) {
                        for (i = 0; i < ihlalArray.length; i++) {
                            ihlalArray[i].polyline.setMap(null);
                            //ihlalArray[i].Marker.setMap(null);
                        }
                        ihlalArray = new Array();
                        $(".colorPaneltBody").html('');
                        $(".colorPaneltBody2").html('');
                    }
                    if (ihlalArrayRed.length > 0) {
                        for (i = 0; i < ihlalArrayRed.length; i++) {
                            ihlalArrayRed[i].polyline.setMap(null);
                        }
                        ihlalArrayRed = new Array();
                        $(".colorPaneltBody").html('');
                        $(".colorPaneltBody2").html('');
                    }
                    busRouteHistoryIhlal = new Array();
                    window.busRouteHistoryIhlal = JSON.parse(res);
                    InitializeInnerMapEx(busRouteHistoryIhlal[0][1].Value, busRouteHistoryIhlal[0][2].Value);
                    lineCodes = busRouteHistoryIhlal[0][0].Value;
                    direction = busRouteHistoryIhlal[0][4].Value;
                    var cordinat = new Array();
                    var colorArray = new Array();
                    $.each(busRouteHistoryIhlal, function (i, v) {
                        if (i == 0 || busRouteHistoryIhlal[i][3].Value != busRouteHistoryIhlal[i - 1][3].Value) {
                            var cordinatX = new Array();
                            cordinat.push(cordinatX);
                            if (i > 0)
                                cordinat[cordinat.length - 1].push(getLatLonObject(busRouteHistoryIhlal[i - 1][1].Value,
                                    busRouteHistoryIhlal[i - 1][2].Value));
                            colorArray.push(busRouteHistoryIhlal[i][3].Value);
                        }
                        cordinat[cordinat.length - 1].push(getLatLonObject(busRouteHistoryIhlal[i][1].Value,
                            busRouteHistoryIhlal[i][2].Value));
                    });
                    $.each(cordinat,
                        function (i, v) {
                            var ihlalPoly = new google.maps.Polyline({
                                path: cordinat[i],
                                fillOpacity: 0.8,
                                scale: 3,
                                strokeColor: colorArray[i] ? "#f3421b" : "#0ce427",
                                strokeWeight: 5,
                                icons: [{ icon: fArrow, repeat: "50px" }],
                                geodesic: true,
                                strokeOpacity: 0.7
                            });
                            ihlalPoly.setMap(map);
                            if (ihlalPoly.strokeColor == "#0ce427") {
                                ihlalArray.push({
                                    lineCode: lineCodes,
                                    polyline: ihlalPoly
                                });
                            } else {
                                ihlalArrayRed.push({
                                    lineCode: lineCodes,
                                    polyline: ihlalPoly
                                });
                            }
                        });
                }
                else {
                    window.toastr["error"](window.ErrorVar, "Uyarı Veri Yok!");
                }
            },
            complete: function () {
                fitBound();
                checkColorPanel();
                ControlPageItems();
            }
        });
    }
    $("#btnDrawRouteLine").click(function () {
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
            $(".colorPaneltBody").html('');
            $("#btnDrawRouteLine").html($("#btnDrawRouteLine").html().replace(window.resHideRoutes, window.resDrawRoute));
            ControlPageItems();
            return;
        }
        var lineCodes = [];
        lineCodes = busRouteHistoryIhlal[0][0].Value;
        if (lineCodes.length === 0) return;
        showPolyLines = true;
        $("#btnDrawRouteLine").html($("#btnDrawRouteLine").html().replace(window.resDrawRoute, window.resHideRoutes));
        noRecords = new Array();
        if (lineCodes !== "") {
            getAllLineCoordinates(lineCodes, noRecords);
        }
    });
    function getAllLineCoordinates(hatKodu, noRecords) {
        // use ajax call to get specified line points
        $.ajax({
            url: "/Maps/GetRouteGpsCoordinates",
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
                        var tmpHatKodu = tmpResArray[0].routeCode;
                        var forwardColor = "0cbde4";
                        var backwardColor = getRandomColor();
                        for (var i = 0; i < tmpResArray.length; i++) {
                            if (tmpResArray[i].routeDirection === "F") {
                                tmpPointsArrayForward.push(getLatLonObject(tmpResArray[i].latitude, tmpResArray[i].longitude));
                            } else {
                                tmpPointsArrayBackward.push(getLatLonObject(tmpResArray[i].latitude, tmpResArray[i].longitude));
                            }
                        }
                        // draw the polyline on the map
                        //tmpPointsArrayForward = calculateTrueRoute(tmpPointsArrayForward);
                        drawPolyline(tmpHatKodu, tmpPointsArrayForward, forwardColor, "F"); //"0000FF"//F
                        //drawPolyline(tmpHatKodu, tmpPointsArrayBackward, backwardColor, "B"); //"FF0000"//B
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
            complete: function () {
                if (noRecords.length > 0) {
                    toastr["warning"](noRecords.join(", ") + " için tanımlı hat bilgisi bulunmamaktadır.");
                }
                fitBound();
                checkColorPanel();
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
            strokeWeight: 5
        });
        var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + color,
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34));
        var startMarker = new MarkerWithLabel({
            position: start,
            icon: pinImage,
            labelContent: "<b>" + lineCode + "- Hat" +
                "<br />Başlangıç</b>",
            labelAnchor: new google.maps.Point(35, 55),
            labelClass: "lblMarker lblMarker" + direction,
            labelStyle: { opacity: 1.0 }
        });
        var endMarker = new MarkerWithLabel({
            position: end,
            icon: pinImage,
            labelContent: "<b>" + lineCode + "- Hat" +
                "<br />Bitiş</b>",
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
    function getRandomColor() {
        var letters = "0123456789ABCDEF";
        var color = "";
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 12)];
        }
        return color;
    }
    function ControlPageItems() {
        if (linePolylines.length > 0 || markers.length > 0) {
            if ($("#btnClearMap").hasClass("display-none")) $("#btnClearMap").removeClass("display-none");
        } else if (linePolylines.length === 0 && markers.length === 0) {
            $("#btnClearMap").addClass("display-none");
        }
        if (linePolylines.length === 0)
            $("#btnDrawRouteLine").html($("#btnDrawRouteLine").html().replace(window.resHideRoutes, window.resDrawRoute));
        else
            $("#btnDrawRouteLine").html($("#btnDrawRouteLine").html().replace(window.resDrawRoute, window.resHideRoutes));
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
    function checkColorPanel() {
        var trHtml = " <tr> <th scope='row' style='background: ##colorCode##;width: 40px;'></th> <td colspan='2' >##lineCode##</td></tr>";
        try {
            if (linePolylines.length == 0 && ihlalArray.length == 0 && ihlalArrayRed.length == 0)
                $("#trackingLines").hide();
            else if (linePolylines.length != 0 && ihlalArray.length == 0 && ihlalArrayRed.length == 0) {
                $(".colorPaneltBody").html('');
                $.each(linePolylines, function (i, e) {
                    $(".colorPaneltBody").append(trHtml.replace("##colorCode##", e.polyline.strokeColor).replace("##lineCode##", e.lineCode + " - " + "Güzergah"));
                });
                $("#trackingLines").show();
            }
            else if (linePolylines.length == 0 && ihlalArray.length != 0 && ihlalArrayRed.length == 0) {
                $(".colorPaneltBody2").html('');
                $(".colorPaneltBody2").append(trHtml.replace("##colorCode##", ihlalArray[0].polyline.strokeColor)
                    .replace("##lineCode##", ihlalArray[0].lineCode + " - " + "Aracın İzlediği Güzergah"));
                $("#trackingLines").show();
            }
            else if (linePolylines.length == 0 && ihlalArray.length == 0 && ihlalArrayRed.length != 0) {
                $(".colorPaneltBody2").html('');
                $(".colorPaneltBody").html('');
                $(".colorPaneltBody2").append(trHtml.replace("##colorCode##", ihlalArrayRed[0].polyline.strokeColor)
                    .replace("##lineCode##", ihlalArrayRed[0].lineCode + " - " + "İhlal"));
                $("#trackingLines").show();
            }
            else if (linePolylines.length == 0 && ihlalArray.length != 0 && ihlalArrayRed.length != 0) {
                $(".colorPaneltBody2").html('');
                $(".colorPaneltBody").html('');
                $(".colorPaneltBody2").append(trHtml.replace("##colorCode##", ihlalArray[0].polyline.strokeColor)
                    .replace("##lineCode##", ihlalArray[0].lineCode + " - " + "Aracın İzlediği Güzergah"));
                $(".colorPaneltBody2").append(trHtml.replace("##colorCode##", ihlalArrayRed[0].polyline.strokeColor)
                    .replace("##lineCode##", ihlalArrayRed[0].lineCode + " - " + "İhlal"));
                $("#trackingLines").show();
            }
            else {
                $(".colorPaneltBody").html('');
                $(".colorPaneltBody2").html('');
                $.each(linePolylines, function (i, e) {
                    $(".colorPaneltBody").append(trHtml.replace("##colorCode##", e.polyline.strokeColor).replace("##lineCode##", e.lineCode + " - " + "Güzergah"));
                });
                $(".colorPaneltBody2").append(trHtml.replace("##colorCode##", ihlalArray[0].polyline.strokeColor)
                    .replace("##lineCode##", ihlalArray[0].lineCode + " - " + "Aracın İzlediği Güzergah"));
                $(".colorPaneltBody2").append(trHtml.replace("##colorCode##", ihlalArrayRed[0].polyline.strokeColor)
                    .replace("##lineCode##", ihlalArrayRed[0].lineCode + " - " + "İhlal"));
                $("#trackingLines").show();
            }
        } catch (e) {
            $("#trackingLines").hide();
        }
    }
    function makeFullScreen() {
        $("#allContentDiv").css({
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 999
        });
    }
    function getLatLonObject(lat, lon) {
        return new google.maps.LatLng(lat, lon);
    }
    $("#drawPolyButton").click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        makeFullScreen();
    });
}
catch (e) {
    //alert(ErrorVar);
    window.toastr["error"](window.ErrorVar, "Uyarı!");
}

