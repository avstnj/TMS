try {
    var linePolylines = new Array();
    var liveTrackingResults;
    var linePoly = new Array();
    var Ihlal = new Array();
    var markers = new Array();
    var routeMarkers = new Array();
    var routeColors = new Array();
    var showPolyLines = true;
    var lineCodes = "";
    var startEndMarkers = new Array();
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
    $(document).ready(function() {
        checkColorPanel();
    });
    function InitializePage() {
        //InitializeInnerMapEx(lat,long);
        InitializeMap();
        map.setOptions({ styles: myMapStyle });
        var centerPoint = new google.maps.LatLng(lat, long);
        map.setCenter(centerPoint);
        //google.maps.event.addListener(map,
        //    "zoom_changed",
        //    function () {
        //        try {
        //            clearInterval(angleCorrectionTimer);
        //        } catch (ex) {
        //        }
        //        if (liveTrackingResults != undefined) {
        //            angleCorrectionTimer = setInterval(function () { updateAngles() }, 1000);
        //        }
        //    });
        google.maps.event.addListener(map,
            "center_changed",
            function () {
                try {
                    clearInterval(angleCorrectionTimer);
                } catch (ex) {
                }
                if (liveTrackingResults != undefined) {
                    angleCorrectionTimer = setInterval(function () { updateAngles() }, 1000);
                }
            });
    }
    function InitializeInnerMapEx(lat,lng) {
        _directionsRenderer = new google.maps.DirectionsRenderer();
        var myOptions = {
            zoom: 15,
            center: new google.maps.LatLng(lat, lng),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
       var map = new google.maps.Map(document.getElementById("dvMap"), myOptions);
        _directionsRenderer.setMap(map);
        _directionsRenderer.setOptions({
            draggable: true,
            preserveViewport: true
        });
        //Add an event to route direction. This will fire when the direction is changed.
        google.maps.event.addListener(_directionsRenderer, "directions_changed", function () {
            computeTotalDistanceforRoute(_directionsRenderer.directions);
        });
    }
    function detayButtonClick(data,s,e) {
        var key = data.hbbId;
        $("#raporMapDiv").show();
        loadPanel.show();
        $.ajax({
            url: '/ExpeditionControl/ExpeditionControlMap',
            type: 'GET',
            data: { key: key},
            success: function (res) {
                $("#mapDiv").html(res);
                $("#btnDrawRouteLine").show();
                InitializePage();
                loadNextTrackIhlal(res);
            },
            error: function (xhr, textStatus, error) {
                command: toastr["error"]("Recording Failed..!");
                loadPanel.hide();
            },
            complete: function () {         
                loadPanel.hide();
            }
        });
    }
    function loadNextTrackIhlal(res) {
                if (res != []) {
                    
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
                        $("#btnDrawRouteLine").html($("#btnDrawRouteLine").html().replace("Hat Gizle", "Hat Çiz"));
                    }
                    busRouteHistoryIhlal = new Array();
                    $.each(res, function(i) {

                        busRouteHistoryIhlal.push(res[i]);
                    });
                    //InitializeInnerMapEx(busRouteHistoryIhlal[0][1].Value, busRouteHistoryIhlal[0][2].Value);
                    lineCodes = busRouteHistoryIhlal[0].hatKodu;
                    direction = busRouteHistoryIhlal[0].yon;
                    var cordinat = new Array();
                    var colorArray = new Array();
                    $.each(busRouteHistoryIhlal, function (i, v) {
                        if (i == 0 || busRouteHistoryIhlal[i].ihlal != busRouteHistoryIhlal[i - 1].ihlal) {
                            var cordinatX = new Array();
                            cordinat.push(cordinatX);
                            if (i > 0)
                                cordinat[cordinat.length - 1].push(getLatLonObject(busRouteHistoryIhlal[i - 1].enlem,
                                    busRouteHistoryIhlal[i - 1].boylam));
                            colorArray.push(busRouteHistoryIhlal[i].ihlal);
                        }
                        cordinat[cordinat.length - 1].push(getLatLonObject(busRouteHistoryIhlal[i].enlem,
                            busRouteHistoryIhlal[i].boylam));
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
                    $.each(busRouteHistoryIhlal,
                        function (i, v) {
                            if (i == 0|| busRouteHistoryIhlal[i].ihlal != busRouteHistoryIhlal[i - 1].ihlal) {
                                if (i > 0)
                                    var start = getLatLonObject(busRouteHistoryIhlal[i - 1].enlem, busRouteHistoryIhlal[i - 1].boylam);
                                else
                                    start = getLatLonObject(busRouteHistoryIhlal[i].enlem, busRouteHistoryIhlal[i].boylam);
                                var startMarker = new MarkerWithLabel({
                                    position: start,
                                    icon: "http://maps.google.com/mapfiles/ms/icons/" + "red" + "-dot.png",
                                    //labelContent: "<b>İhlal</b>",
                                    labelAnchor: new google.maps.Point(35, 55),
                                    labelStyle: { opacity: 1.0 }
                                });
                                //var endMarker = new MarkerWithLabel({
                                //    position: busRouteHistoryIhlal[busRouteHistoryIhlal.length],
                                //    icon: "http://maps.google.com/mapfiles/ms/icons/" + "red" + "-dot.png",
                                //    //labelContent: "<b>İhlal</b>",
                                //    labelAnchor: new google.maps.Point(35, 55),
                                //    labelStyle: { opacity: 1.0 }
                                //});
                                startEndMarkers.push(startMarker);
                                startMarker.setMap(map);
                                //endMarker.setMap(map);
                            }
                        });
                }
                else {
                    window.toastr["error"](window.ErrorVar, "Uyarı Veri Yok!");
                }

                fitBound();
                checkColorPanel();
                ControlPageItems(); 

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
            $("#btnDrawRouteLine").html($("#btnDrawRouteLine").html().replace("Hat Gizle", "Hat Çiz"));
            ControlPageItems();
            return;
        }
        var lineCodes = [];
        lineCodes = busRouteHistoryIhlal[0].hatKodu;
        if (lineCodes.length === 0) return;
        showPolyLines = true;
        $("#btnDrawRouteLine").html($("#btnDrawRouteLine").html().replace("Hat Çiz", "Hat Gizle"));
        noRecords = new Array();
        if (lineCodes !== "") {
            getAllLineCoordinates(lineCodes, noRecords);
        }
    });
     function getAllLineCoordinates(hatKodu, noRecords) {
        // use ajax call to get specified line points
        $.ajax({
            url: "/RouteDefinition/GetRouteGpsCoordinates",
            type: "GET",
            data: {
                lineCode: hatKodu
            },
            success: function (res) {
                if (res !== "" && res !== "[]") {
                    // if the user did not click hide lines button
                    if (showPolyLines) {
                        // create an array of point objects for the line coordinates points
                        var tmpResArray = res;
                        var tmpPointsArrayForward = new Array();
                        var tmpPointsArrayBackward = new Array();
                        var tmpHatKodu = tmpResArray[0].hatKodu;
                        var forwardColor = "0cbde4";
                        //var backwardColor = getRandomColor();
                        for (var i = 0; i < tmpResArray.length; i++) {
                            if (tmpResArray[i].Yon === "G") {
                                tmpPointsArrayForward.push(getLatLonObject(tmpResArray[i].enlemF, tmpResArray[i].boylamF));
                            } else {
                                tmpPointsArrayBackward.push(getLatLonObject(tmpResArray[i].enlemF, tmpResArray[i].boylamF));
                            }
                        }
                        // draw the polyline on the map
                        //tmpPointsArrayForward = calculateTrueRoute(tmpPointsArrayForward);
                        drawPolyline(tmpHatKodu, tmpPointsArrayForward, forwardColor, "G"); //"0000FF"//F
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
                            forwardColor: forwardColor
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
    function ControlPageItems() {
        if (linePolylines.length > 0 || markers.length > 0) {
            if ($("#btnClearMap").hasClass("display-none")) $("#btnClearMap").removeClass("display-none");
        } else if (linePolylines.length === 0 && markers.length === 0) {
            $("#btnClearMap").addClass("display-none");
        }
        if (linePolylines.length === 0)
            $("#btnDrawRouteLine").html($("#btnDrawRouteLine").html().replace("Hat Gizle","Hat Çiz"));
        else
            $("#btnDrawRouteLine").html($("#btnDrawRouteLine").html().replace("Hat Çiz","Hat Gizle"));
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
    function getLatLonObject(lat, lon) {
        return new google.maps.LatLng(lat, lon);
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
                    .replace("##lineCode##","<b>" + ihlalArray[0].lineCode + "</b>" + "<b>- Aracın İzlediği Güzergah</b>"));
                $("#trackingLines").show();
            }
            else if (linePolylines.length == 0 && ihlalArray.length == 0 && ihlalArrayRed.length != 0) {
                $(".colorPaneltBody2").html('');
                $(".colorPaneltBody").html('');
                $(".colorPaneltBody2").append(trHtml.replace("##colorCode##", ihlalArrayRed[0].polyline.strokeColor)
                    .replace("##lineCode##","<b>" + ihlalArrayRed[0].lineCode + "</b>" + "<b>- İhlal</b>"));
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
                    $(".colorPaneltBody").append(trHtml.replace("##colorCode##", e.polyline.strokeColor).replace("##lineCode##", e.lineCode + " - " +"Güzergah"));
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
