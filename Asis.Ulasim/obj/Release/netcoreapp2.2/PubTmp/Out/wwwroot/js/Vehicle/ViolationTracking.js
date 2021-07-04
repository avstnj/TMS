try {
    var gridSourceStatus = false;
    var gridViewSettings = null;
    var liveTrackingResults;
    var currentMarkerGlobal;
    var interval = 200;
    var myTimer;
    var durakMarkers = new Array();
    var noRecords = new Array();
    var markers = new Array();
    var routeMarkers = new Array();
    var routeColors = new Array();
    var angleCorrectionTimer;
    var refreshTimer;
    var firstTimeLoaded = false;
    var markerCluster;
    var clusterFlag = 1;
    var clusterData;
    var tmpMarkers;
    var arabaHistoryDetails;
    var RouteStationMarkers = new Array();
    var fArrow = {
        path: "M 0,0 4,4 1,4 0,3 -1,4 -4,4 z",
        fillColor: "white",
        fillOpacity: 0.35,
        scale: 2
    };
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
    var duraklarListe;
    var allLineCodes = [];
    var allData = [];
    var selectedLines;
    var selectedPlates = "";
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
    var w;
    var linePolylines = new Array();
    var showPolyLines = false;
    var selectedPlaka = null;
    $("#loading-image").hide();
    var liveData;
    var xxx = 0;
    var liveDataForGrid;
    var boolWait = true;
    $(document).ready(function () {

        loadPanel.show();
        checkColorPanel();
        $(".m-content").height($(".m-body").height() - $(".m-header").height());
        //$("#dvMap").height($(".m-content").height() - 265);
        $("#dvMap").height($(".m-body").height());

        $.connection.hub.url = "http://185.28.3.135:1923/signalr";

        var liveLocationHub = $.connection.liveLocationHub;
        liveLocationHub.client.broadcastMessage = function (data) {

            if (data != undefined && data !== "}" && data !== "") {

                // signalr hub ından yayınlanan jsonstring mesaj Json a parse ediliyore.
                var jsonAt = JSON.parse(data);
                // Plaka-Hat Kodu ikilisi tablo seçimlerinde kullanılmak üzere alınıyore.
                ParseAllData(jsonAt);

                // Kullanıcıya atanmamış plakalar gösterilmemesi için kontrol yapılıyore.
                liveTrackingResults = $.grep(jsonAt,
                    function (n, i) {
                        return jQuery.inArray(n.plaka, window.userPlates.split(",")) !== -1;
                    });
                liveDataForGrid = (JSON.parse(JSON.stringify(liveTrackingResults))); //hard copy

                if (gridSourceStatus === false) {
                    // Sayfa ilk defa açıldığında grid tüm özellikleri kazandırılarak oluşturuluyore.
                    fillGridLive();
                    gridSourceStatus = true;
                } else {
                    // İlk açılış sonrası her güncellemede gridin sadece datasource unun güncellenmesi sağlandıyore.
                    $("#gridContainer").dxDataGrid("instance").option("dataSource.store.data", liveDataForGrid);
                }

                if (markers == undefined || markers.length === 0) {
                    CreateMarkers(jsonAt);
                    clusterData = jsonAt;
                } else {
                    UpdateMarkers(jsonAt);
                    clusterData = jsonAt;
                    liveData = jsonAt;
                }
            } else {
                console.log(Now() + " - Veri yok.");
            }
            loadPanel.hide();
        };

        $.connection.hub.start().done(function () {
            liveLocationHub.server.joinGroup(DBCode);  //"ABYS_31"
        });

        $("#btnDrawLines").click(function (e) {
            e.preventDefault();
            loadPanel.show();
            // if there were drawn lines aleady then clear them from map and reset arrays and set button text to Draw Lines
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
        $("#btnDrawMarkerCluster").click(function (e) {
            e.preventDefault();
            if (markerCluster == undefined) return;
            if (clusterFlag === 1) {
                clusterFlag = 0;
                markerCluster.clearMarkers();
                CreateMarkers(clusterData);
                $("#btnDrawMarkerCluster").children("i").removeClass("fa-object-ungroup");
                $("#btnDrawMarkerCluster").children("i").addClass("fa-object-group");
                $("#btnDrawMarkerCluster")
                    .html($("#btnDrawMarkerCluster").html().replace(window.resRemoveGroups, window.resCreateGroups));
            } else {
                clusterFlag = 1;
                markerCluster.clearMarkers();
                CreateMarkers(clusterData);
                $("#btnDrawMarkerCluster").children("i").removeClass("fa-object-group");
                $("#btnDrawMarkerCluster").children("i").addClass("fa-object-ungroup");
                $("#btnDrawMarkerCluster")
                    .html($("#btnDrawMarkerCluster").html().replace(window.resCreateGroups, window.resRemoveGroups));
            }
        });
        $("#btnShowBusStops").click(function (e) {
            e.preventDefault();
            // if the bus stops already exist then clear them from map and reset the array
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
            var lineCodes = [];
            lineCodes = selectedLines;
            if (lineCodes.length === 0) return;
            var stopUndefinedLines = [];
            $.ajax({
                url: "/VehicleTracking/GetRouteCoordinat",
                type: "POST",
                data: {
                    hatKodu: lineCodes.join(",")
                },
                success: function (res) {
                    if (res !== "") {
                        duraklarListe = JSON.parse(res);
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
        InitializeMap();
        map.setOptions({ styles: myMapStyle });
        var centerPoint = new google.maps.LatLng(lat, long);
        map.setCenter(centerPoint);
        google.maps.event.addListener(map,
            "zoom_changed",
            function () {
                try {
                    clearInterval(angleCorrectionTimer);
                } catch (ex) {
                }
                if (liveTrackingResults != undefined) {
                    angleCorrectionTimer = setInterval(function () { updateAngles() }, 1000);
                }
            });
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
        $.ajax({
            url: "/VehicleTracking/GetDepots",
            type: "GET",
            success: function (res) {
                if (res !== "" && res !== "[]") {
                    var depots = JSON.parse(res);
                    $.each(depots,
                        function () {
                            var strLatLongs = this.Polygon.replace(/,\s/g, ",").split(",");
                            var coords = new Array();
                            $.each(strLatLongs,
                                function () {
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
        $(".m-aside-left-close").click(function () {
            if ($("m-content").width() > 992) {
                $(".m-content").css("overflow", "hidden");
                setTimeout(function () {
                    $("#gridContainer").css("left", $(".m-aside-left").width() + "px");
                    $("#dvMap").width($(".m-body").width() - $(".m-aside-left").width());
                    $("#gridContainer").width($(".m-body").width() - $(".m-aside-left").width());
                    google.maps.event.trigger(map, "resize");
                },
                    0);
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
                $("#btnDrawMarkerCluster").show();
                $("#gridContainer .collapseWithCallback").click();
            }
        });
        $("#btnClearMap").click(function (e) {
            e.preventDefault();
            // Clear All Vehicle Markers 
            var i;
            for (i = 0; i < markers.length; i++) {
                if (markers[i] != undefined)
                    markers[i].marker.setMap(null);
            }
            markers = new Array();
            if (markerCluster != undefined)
                markerCluster.clearMarkers();
            // Clear All Vehicle Markers 
            if (RouteStationMarkers.length > 0) {
                for (i = 0; i < RouteStationMarkers.length; i++) {
                    RouteStationMarkers[i].setMap(null);
                }
                RouteStationMarkers = new Array();
                $("#btnShowBusStops").html($("#btnShowBusStops").html().replace(window.resBusStopMsg, window.resShowBusStops));
            }
            // Clear All PolyLines
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
            $("#btnClearMap").addClass("display-none");
            $("#btnDrawMarkerCluster").hide();
            selectedPlates = "";
        });

    });

    function getRandomColor() {
        var letters = "0123456789ABCDEF";
        var color = "";
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 12)];
        }
        return color;
    }

    function aracGecmisIzle() {
        var e = document.getElementById("selectTimeRange");
        var saat = e.options[e.selectedIndex].value;

        var nowDate = new Date();
        var month1 = nowDate.getMonth() + 1;
        var hour1 = nowDate.getHours() - parseInt(saat);
        var endDate = nowDate.getFullYear() +
            "-" +
            month1 +
            "-" +
            nowDate.getDate() +
            " " +
            hour1 +
            ":" +
            nowDate.getMinutes() +
            ":" +
            nowDate.getSeconds();
        var startDate = nowDate.getFullYear() +
            "-" +
            month1 +
            "-" +
            nowDate.getDate() +
            " " +
            nowDate.getHours() +
            ":" +
            nowDate.getMinutes() +
            ":" +
            nowDate.getSeconds();
        var plaka = selectedPlaka;
        var otoStart = 1;

        $.ajax({
            url: "/Maps/DataTransferBetweenScreens",
            type: "POST",
            data: {
                startDate: startDate,
                endDate: endDate,
                plaka: plaka,
                otoStart: otoStart
            },
            success: function () {
                window.open("http://hatay.abys-web.com//Maps/raporAracSonKonumBilgileri_tarihBazinda", "_blank");
            },
            complete: function () {
            }
        });
    }

    // Create vehicles Markers on the map from result array
    function CreateMarkers(liveTrackingResults) {
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
        for (i = 0; i < liveTrackingResults.length; i++) {
            // if the user specified some plates to only display its vehicles; then check if this vehicle belongs to the selected plates
            if (selectedPlates !== "") {
                if (jQuery.inArray(liveTrackingResults[i].plaka, selectedPlates.split(",")) === -1)
                    continue;
            } else continue;
            ControlPageItems();
            // get the marker icon corresponding with the vehicle status
            //var tmpImageUrl = getImgURLFromColor(liveTrackingResults[i].renk);
            // call marker creation function and add marker to the global Array
            var markerName = liveTrackingResults[i].validatorNo.toString() + " - " + liveTrackingResults[i].plaka.toString();
            var markerItem = CreateMarker(map,
                liveTrackingResults[i].enlem,
                liveTrackingResults[i].boylam,
                GetIconColor(liveTrackingResults[i].renk),
                markerName,
                CreateMarkerInfoContent(liveTrackingResults[i]),
                markers.length, liveTrackingResults[i].plaka);
            markers.push({
                plaka: liveTrackingResults[i].plaka,
                marker: markerItem
            });

            SetMarkerRotation(markerItem, liveTrackingResults[i].yon, GetIconColor(liveTrackingResults[i].renk));
            markers[markers.length - 1].marker.setMap(map);

            if (liveTrackingResults[i].renk === "00FF00") {
                greenCount++;
                $("#green").text("Active : " + greenCount);
            } else if (liveTrackingResults[i].renk === "A9A9A9") {
                grayCount++;
                $("#gray").text("No Data : " + grayCount);
            } else {
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
        $("#loading-image").hide();
    }

    // update vehicles Markers position on the map and infowindow content from result array
    function UpdateMarkers(liveTrackingResults) {
        //var tableVisible = document.getElementById("tableOptionsRadios").checked;
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
                var currntMarker = markers[currntMarkerId].marker;
                // get the marker icon corresponding with the vehicle status
                // generate info window content
                var tmpDate;
                var tmp;
                tmp = liveTrackingResults[i].editDate;
                tmp = tmp.replace("/Date(", "");
                tmp = tmp.replace(")/", "");
                tmpDate = new Date(Number(tmp));
                var markerName = liveTrackingResults[i].validatorNo.toString() +
                    " - " +
                    liveTrackingResults[i].plaka.toString();
                if (currntMarker != undefined) {
                    // change the marker position
                    currntMarker.setPosition(new google.maps.LatLng(liveTrackingResults[i].enlem, liveTrackingResults[i].boylam));
                    // rotate marker image
                    SetMarkerRotation(currntMarker, liveTrackingResults[i].yon, GetIconColor(liveTrackingResults[i].renk));
                    //$("#markerImage_" + currntMarkerId).rotate(liveTrackingResults[i].yon + 180);
                    // change makrer image content
                    currntMarker.labelContent = "<div><p id=\"markerText_" +
                        currntMarkerId +
                        "\" style=\"text-align:center;color:black;z-index:100\" class='markerLabelText'>" +
                        markerName +
                        "</p></div>";

                    currntMarker.infoWindow.setContent(CreateMarkerInfoContent(liveTrackingResults[i]));
                    currentMarkerGlobal = currntMarker;
                } else {
                    // create new marker
                    var tmpMarker = CreateMarker(map,
                        liveTrackingResults[i].enlem,
                        liveTrackingResults[i].boylam,
                        GetIconColor(liveTrackingResults[i].renk),
                        markerName,
                        CreateMarkerInfoContent(liveTrackingResults[i]),
                        markers.length, liveTrackingResults[i].plaka);
                    // add the new marker to the markers array
                    SetMarkerRotation(tmpMarker, liveTrackingResults[i].yon, GetIconColor(liveTrackingResults[i].renk));
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
                $("#loading-image").hide();
            }
        }
    }

    function CreateMarkerInfoContent(markerData) {
        var tmp;
        tmp = markerData.editDate;
        tmp = tmp.replace("/Date(", "");
        tmp = tmp.replace(")/", "");
        var content = "<div class='iw-container' id='" +
            markerData.plaka.replace(/ /g, "-") +
            "'><div class='iw-title'><b>" +
            window.resPlate +
            ":</b> " +
            markerData.plaka +
            "</div>" +
            "<div class='iw-content'>" +
            "<table class='table table-bordered table-striped'>" +
            "<tr><td width='50%'><b>" +
            window.resSpeed +
            ":</b></td><td>" +
            markerData.hiz +
            "</td></tr>" +
            "<tr><td width='50%'><b>" +
            window.resDistance +
            ":</b></td><td>" +
            markerData.mesafe +
            "</td></tr>" +
            "<tr><td width='50%'><b>" +
            window.resDriver +
            ":</b></td><td>" +
            markerData.surucu +
            "</td></tr>" +
            "<tr><td width='50%'><b>" +
            window.resDailyPassenger +
            ":</b></td><td>" +
            markerData.gunlukYolcu +
            "</td></tr>" +
            "<tr><td width='50%'><b>" +
            window.resTripPassenger +
            ":</b></td><td>" +
            markerData.seferYolcu +
            "</td></tr>" +
            "<tr><td width='50%'><b>" +
            window.resPreviousStopPassenger +
            ":</b></td><td>" +
            markerData.durakYolcu +
            "</td></tr>";
        content += ((window.IsNoAmount === "True"))
            ? ""
            : "<tr><td width='50%'><b>" +
            window.resTotalRevenue +
            ":</b></td><td>" +
            markerData.toplamHasilat +
            " TL</td></tr>";
        content += "<tr><td width='50%'><b>" +
            window.resMaxSpeed +
            ":</b></td><td>" +
            markerData.maxHiz +
            "</td></tr>" +
            "<tr><td width='50%'><b>" +
            window.resActualRoute +
            ":</b></td><td>" +
            markerData.uzunHatAdi +
            "</td></tr>" +
            "<tr><td width='50%'><b>" +
            window.resUpdateDate +
            ":</b></td><td>" +
            //(new Date(Number(tmp))).toLocaleString() +
            new Date(Date.parse(tmp, "MM/dd/yyyy HH:mm")).toLocaleString() +
            "</td></tr>" +
            "<tr><td width='50%'>" + "<a href='javascript:;' onclick='openLiveMessageModal(" + markerData.validatorNo + ")' class='btn btn-sm btn-info' >Mesaj Gönder</a>" + "</td><td></td></tr>" +
            "</table></div></div>";
        return content;
    }

    function openLiveMessageModal(valNo) {
        try {
            if (!valNo) {
                toastr["warning"]("Validatör numarası alınamadı.");
            } else {
                $("#liveMessageValNo").html(valNo);
                $("#hdnLiveMessageValNo").val(valNo);
                $("#modalLiveMessage").modal('show');
            }

        } catch (e) {

        }
    }

    function SendLiveMessage() {
        var valNo = $("#hdnLiveMessageValNo").val();
        var message = $("#txtLiveMessage").val();
        if (!valNo) {
            toastr["warning"]("Validatör numarası alınamadı.");
        }
        else if (!message) {
            toastr["warning"]("Mesaj içeriği girmelisiniz.");
        } else {
            loadPanel.show();
            $.ajax({
                url: '/WhatsApp/InsertDcpMessages',
                type: 'POST',
                data: { terminaNo: valNo, textMessage: message },
                success: function (res) {
                    loadPanel.hide();
                    var error = res.includes("toastr['error']");
                    if (error === true) {
                        toastr["error"]("Komut Gönderilirken Hata Alındı..!");
                    } else {
                        toastr["success"]("Seçili Dcp'lere komut gönderildi..!");
                        $("#liveMessageValNo").html('');
                        $("#hdnLiveMessageValNo").val('');
                        $('#modalLiveMessage').modal('hide');
                    }
                },
                error: function (xhr, textStatus, error) {
                    loadPanel.hide();
                    toastr["error"]("Komut Gönderilirken Hata Alındı..!");
                },
                complete: function () {
                    loadPanel.hide();
                }
            });
        }
    }

    // update marker image angles and set marker info window content
    function updateAngles() {
        try {
            clearInterval(angleCorrectionTimer);
        } catch (ex) {
        }
        try {
            for (var i = 0; i < liveTrackingResults.length; i++) {
                if (selectedPlates) {
                    if (jQuery.inArray(liveTrackingResults[i].plaka, selectedPlates.split(",")) === -1)
                        continue;
                    var currntMarkerId = getMarkerByPlaka(liveTrackingResults[i].plaka);
                    var currntMarker = markers[currntMarkerId].marker;
                    SetMarkerRotation(currntMarker, liveTrackingResults[i].yon, GetIconColor(liveTrackingResults[i].renk));
                }
            }
        } catch (e) {

        }
    }

    // get vehicle details (when dtails button on the result Table is clicked this functiond will be invoked)
    function getAracDetay(linkId) {
        // open details Modal and reset it
        $("#detailedInfoTable").hide();
        $("#popupLoadingImage").hide();
        $("#openMainModalButton").click();
        // get plate code
        var plakaKodu = linkId.replace("detaylarLink_", "");
        plakaKodu = document.getElementById("plaka_" + plakaKodu).innerHTML;
        // make ajax call to get vehicle details
        $.ajax({
            url: "/Maps/getAracSonKonumBilgileriWeb",
            type: "POST",
            data: {
                plakaList: plakaKodu
            },
            success: function (res) {
                if (res !== "") {
                    // fill the details section with result data
                    var aracInfo = JSON.parse(res)[0];
                    document.getElementById("lbl_plaka").innerHTML = aracInfo.plaka;
                    var islemDurum = aracInfo.renk;
                    // set status according to vehicle color
                    switch (islemDurum) {
                        case "00FF00":
                            islemDurum = window.resActive;
                            break;
                        case "FFFF00":
                            islemDurum = window.resRolanti;
                            break;
                        case "FF0000":
                            islemDurum = window.resStandBy;
                            break;
                        case "A9A9A9":
                            islemDurum = window.resNotAvailable;
                            break;
                        default:
                            islemDurum = window.resUnknown;
                            break;
                    }
                    document.getElementById("lbl_islem_durum").innerHTML = islemDurum;
                    document.getElementById("lbl_sofor").innerHTML = aracInfo.surucu;
                    try {
                        document.getElementById("lbl_odometre").innerHTML =
                            (Number(aracInfo.mesafe.toString()) / 1000).toString() + "km";
                    } catch (ex) {
                        document.getElementById("lbl_odometre").innerHTML = "0km";
                    }
                    try {
                        document.getElementById("lbl_gunluk_mesafe").innerHTML =
                            (Number(aracInfo.gunlukMesafe.toString()) / 1000).toString() + "km";
                    } catch (ex) {
                        document.getElementById("lbl_gunluk_mesafe").innerHTML = "0km";
                    }
                    document.getElementById("lbl_max_hiz").innerHTML = aracInfo.maxHiz;
                    document.getElementById("lbl_anlik_hiz").innerHTML = aracInfo.hiz;
                    document.getElementById("lbl_son_ileti_tipi").innerHTML = aracInfo.kayitTipi;
                    document.getElementById("lbl_detayli_konum").innerHTML = aracInfo.adres;
                } else {
                    toastr["error"](window.resError, "");
                }
            }
        });
    }

    // return the marker object of the specified plate
    function getMarkerByPlaka(plaka) {
        // loop global array and return the marker object of this plate
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].plaka === plaka) {
                return i;
            }
        }
        return null;
    }

    // draw a polyline on the map
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

    // get the specified line GPS coordinates
    function getAllLineCoordinates(hatKodu, noRecords, isLast) {
        // use ajax call to get specified line points
        $.ajax({
            url: "/VehicleTracking/GetRouteGpsCoordinates",
            type: "GET",
            data: {
                hatKodu: hatKodu
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
                        var forwardColor = getRandomColor();
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
            complete: function () {
                if (isLast && noRecords.length > 0) {
                    toastr["warning"](noRecords.join(", ") + " için tanımlı hat bilgisi bulunmamaktadır.");
                }
                fitBound();
                ControlPageItems();
            }
        });
    }

    // returns google maps LatLng object from the given coordinates
    function getLatLonObject(lat, lon) {
        return new google.maps.LatLng(lat, lon);
    }

    // create a marker object on the map
    function CreateMarker(map, lat, long, color, markerLabelText, infoWindowContent, markerId, plate) {
        // if the marker have an infowindow then create it and associate marker click event with opening it; otherwise do not create info window
        var markerIcon = {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 4,
            strokeColor: color,
            rotation: 0
        }
        if (infoWindowContent == undefined) {
            return new MarkerWithLabel({
                position: new google.maps.LatLng(lat, long),
                labelContent: "<div><p id=\"markerText_" +
                    markerId +
                    "\" style=\"text-align:center;color:black;z-index:100\" class='markerLabelText'>" +
                    markerLabelText +
                    "</p></div>",
                icon: markerIcon
            });
        } else {
            var infowindow = new google.maps.InfoWindow({
                content: infoWindowContent
            });
            var tmpMarker = new MarkerWithLabel({
                position: new google.maps.LatLng(lat, long),
                labelContent: "<div><p id=\"markerText_" +
                    markerId +
                    "\" style=\"text-align:center;color:black;z-index:100\" class='markerLabelText'>" +
                    markerLabelText +
                    "</p></div>",
                icon: markerIcon,
                infoWindow: infowindow
            });
            // set a function on marker click event that will open the infowindow and set the selected plate so the map will recenter with its changing position
            google.maps.event.addListener(tmpMarker,
                "click",
                function () {
                    this.infoWindow.open(map, this);
                    //selectedPlaka = this.label.labelDiv_.children[0].children[1].innerText.split('-')[1].trim();
                    selectedPlaka = plate;
                });
            google.maps.event.addListener(infowindow,
                "domready",
                function () {
                    var iwOuter = $("#" + selectedPlaka.replace(/ /g, "-")).parent("div").parent("div").parent("div.gm-style-iw");
                    var iwCloseBtn = iwOuter.next();
                    iwCloseBtn.css({
                        width: "19px",
                        height: "19px",
                        opacity: "1",
                        right: "27px",
                        top: "13px",
                        border: "3px solid #48b5e9",
                        'border-radius': "3px !important",
                        'box-shadow': "0 0 5px #3990B9"
                    });
                    iwCloseBtn.mouseout(function () {
                        $(this).css({ opacity: "1" });
                    });
                });
            return tmpMarker;
        }
    }

    function SetMarkerRotation(marker, val, color) {
        if (marker) {
            var icon = marker.getIcon();
            if (val)
                icon.rotation = val;
            if (color)
                icon.strokeColor = color;
            marker.setIcon(icon);
        }
    }

    function GetIconColor(color) {
        switch (color) {
            case "00FF00": //green
                return "#249C0B";
            case "FF0000": //red
                return "#E43F25";
            case "FFFF00": //yellow
                return "#E1EB44";
            case "A9A9A9": //grey
                return "#BFB49F";
            default:
                return "";
        }
    }

    // get marker icon url according to the vehicle status color
    function getImgURLFromColor(color) {
        switch (color) {
            case "00FF00": //green
                return "../../image/vehicleimg/icon/green_bus_croped_16_20.png";
            case "FF0000": //red
                return "../../image/vehicleimg/icon/red_bus_croped_16_20.png";
            case "FFFF00": //yellow
                return "../../image/vehicleimg/icon/yellow_bus_croped_16_20.png";
            case "A9A9A9": //grey
                return "../../image/vehicleimg/icon/grey_bus_croped_16_20.png";
            default:
                break;
        }
        return "";
    }

    function ControlPageItems() {
        checkColorPanel();
        if (RouteStationMarkers.length > 0 || linePolylines.length > 0 || markers.length > 0) {
            if ($("#btnClearMap").hasClass("display-none")) $("#btnClearMap").removeClass("display-none");
        } else if (RouteStationMarkers.length === 0 && linePolylines.length === 0 && markers.length === 0) {
            $("#btnClearMap").addClass("display-none");
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
        if ($.fn.DataTable.isDataTable("#tbl_liveTrackingFilter")) $("#tbl_liveTrackingFilter").DataTable().draw();
        $("#dvMap").height($(".m-body").height() - $(".m-aside-left").height() - $("#gridContainer").height());
        google.maps.event.trigger(map, "resize");

        $.each($("#tbl_liveTrackingFilter tbody tr:first-child td.col"),
            function () {
                $(".dataTables_scrollHead .col-" + $(this).attr("class").split("col-")[1]).outerWidth($(this).outerWidth());
            });
    }

    Array.prototype.remove = function () {
        var what, a = arguments, L = a.length, ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };

    function Now() {
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var secounds = date.getMinutes();
        var mounts = date.getMonth() + 1;
        var strTime = hours + ":" + minutes + ":" + secounds;
        return date.getDate() + "." + mounts + "." + date.getFullYear() + " " + strTime;
    }

    function fillGridLive() {
        // function fillGridLive() {
        $("#gridContainer").dxDataGrid({
            //dataSource: data,
            dataSource: {
                store: {
                    data: liveDataForGrid,
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
                    dataField: "kurumAdi",
                    caption: "Kurum Adı"
                },
                /*{
                  dataField: "grupKod",
                  caption: "Grup Kodu"
                },*/
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
                    dataField: "editDate",
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
        $(".colorPaneltBody").html('');
        try {
            if (linePolylines.length == 0)
                $("#trackingLines").hide();
            else {
                $.each(linePolylines, function (i, e) {
                    $(".colorPaneltBody").append(trHtml.replace("##colorCode##", e.polyline.strokeColor).replace("##lineCode##", e.lineCode + " " + (e.direction === "F" ? "İleri" : "Geri")));
                });
                $("#trackingLines").show();
            }
        } catch (e) {
            $("#trackingLines").hide();
        }
    }

    function CreateRouteStationMarkers(result) {
        var tmpPointsArrayForward = new Array();
        var tmpPointsArrayBackward = new Array();
        var forwardDatas = new Array();
        var backwardDatas = new Array();
        var tmpResArray = result;
        for (var i = 0; i < tmpResArray.length; i++) {
            if (tmpResArray[i].Yon === "G") {
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

} catch (e) {
    loadPanel.hide();
    toastr["error"](window.resError, "");
}
