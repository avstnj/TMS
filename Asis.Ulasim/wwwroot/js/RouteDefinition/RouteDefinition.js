try {
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
    $("#LoadFile").hide();
    var versions;
    var lines = new Array();
    var points = new Array();
    var routeStops = [];
    var linePolylines = new Array();
    var tmpPointsArrayForward = new Array();
    var tmpPointsArrayBackward = new Array();
    var forwardStations = new Array();
    var backwardStations = new Array();
    var directionStops = [];
    var orderStops = [];
    var durakMarkers = new Array();
    var RouteStationMarkers = new Array();

    $("#btnSaveRoute").hide();
    $(".routeLines-panelitem").hide();
    $(document).ready(function () {
        Dropzone.autoDiscover = false;
        //$(".m-content").height($(".m-body").height() - $(".m-header").height());
        $("#dvMap").height($(".m-body").height() - ($(".m-portlet").height()));
        InitializeMap();
        map.setOptions({ styles: myMapStyle });
        //var selectedCityCoordinates = getCityCoordinates(31);
        //if (selectedCityCoordinates != undefined) {
        var centerPoint = new google.maps.LatLng(lat, long);
        map.setCenter(centerPoint);
        //}
        $.ajax({
            url: "/RouteDefinition/GetDepots",
            type: "GET",
            success: function (res) {
                if (res !== "" && res !== "[]") {
                    var depots = JSON.parse(res);
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
        $("#siraNo").TouchSpin({
            inputGroupClass: "input-small",
            spinUpClass: "blue",
            spinDownClass: "red",
            //min: 1,
            //max: 1000000000,
            //stepinterval: 1,
            disabled: true
        });
        $("#sure").inputmask("hh:mm:ss", {
            "placeholder": "_"
        });
        $(".sidebar-toggler").click(function () {
            if ($("body").width() > 992) {
                $(".page-container").css("overflow", "hidden");
                setTimeout(function () {
                    $("#dvMap").width($("body").width() - $(".page-sidebar").width());
                    google.maps.event.trigger(map, "resize");
                }, 0);
            }
        });
        $("#cbCizim").click(function () {
            var routeCode = GetRoute();
            if (routeCode === '-1') {
                toastr["warning"]("Hat Seçiniz!!");
                return false;
            }
            var checkBox = document.getElementById("cbCizim");
            if (checkBox.checked === true) {
                $("#LoadFile").show();
            } else {
                $("#LoadFile").hide();
            }
        });
        $("#btnSave").click(function () {
            //App.blockUI($(".page-content"));
            var routeCode = GetRoute();
            if (routeCode == -1) {
                toastr["warning"]("Lütfen hat seçiniz");
                return;
            }
            if (lines.length === 0) {
                toastr["warning"]("Hat çizimi bulunamadı.");
                return;
            }
            var latLongArry = new Array();
            var seqNo = 0;
            var userId = 0;
            var sessionId = 1;
            $.each(lines, function (i, v) {
                $.each(v.polyline.getPath().getArray(), function (ind, val) {
                    var jsonData = val.toJSON();
                    latLongArry.push({
                        sessionId: sessionId,
                        routeCode: GetRoute(),
                        latitude: jsonData.lat,
                        longitude: jsonData.lng,
                        direction: v.direction,
                        seqNbr: seqNo,
                        userId: userId
                    });
                    seqNo++;
                });
            });  
            $.ajax({
                url: "/RouteDefinition/UpdateRouteCoordinates",
                type: "POST",
                data: {
                    routeCode: GetRoute(),
                    latLongs: latLongArry
                },
                success: function (res) {
                    if (res !== "" & res !== "[]") {
                        versions = new Array();
                        var versionData = Enumerable.From(res).GroupBy("$.versionNo").ToArray();

                        ChangeVersionList(res);
                        SetSelectSources(versionData);

                        SetSelectSourceToNull("select-forward-version");
                        SetSelectSourceToNull("select-backward-version");

                        $("#btnClear").click();
                        window.toastr["success"](window.resCoordinatesSavedSuccessfully, window.resInformation);

                    } else {
                        var selectedRoute = GetRoute();
                        SetSelectSourceToNull("slVersion");
                        SetSelectSourceToNull("select-forward-version");
                        SetSelectSourceToNull("select-backward-version");

                        $("#portlet-match").hide();
                        CloseSelectDropDown("select-forward-version");
                        CloseSelectDropDown("select-backward-version");
                        $("#btnMergeContainerShow").hide();
                        toastr["warning"](window.resCoordinate_for_xxx_line_is_not_defined__Contact_your_system_administrator_for_identification.replace("xxx", selectedRoute), window.resAlert + "!");
                    }
                },
                complete: function () {
                    //App.unblockUI($(".page-content"));
                }
            });
        });
        $("#btnSaveStationList").click(function () {
            var routeCode = GetRoute();
            var latLongArry = new Array();
            var seqNo = 0;
            var userId = 0;
            var sessionId = 1;
            $.each(lines, function (i, v) {
                $.each(v.polyline.getPath().getArray(), function (ind, val) {
                    var jsonData = val.toJSON();
                    latLongArry.push({
                        sessionId: sessionId,
                        routeCode: GetRoute(),
                        latitude: jsonData.lat,
                        longitude: jsonData.lng,
                        direction: v.direction,
                        seqNbr: seqNo,
                        userId: userId
                    });
                    seqNo++;
                });
            });
        });
        $("#slRoute").change(function () {
            var selectedRoute = GetRoute();
            if (selectedRoute !== "") {

                $.ajax({
                    url: "/RouteDefinition/GetCoordinates",
                    type: "POST",
                    data: {
                        routeCode: selectedRoute
                    },
                    success: function (res) {
                        if (res !== "" & res !== "[]") {
                            var data = JSON.parse(res);
                            versions = new Array();
                            var versionData = Enumerable.From(data).GroupBy("$.versionNo").ToArray();
                            ChangeVersionList(data);
                            SetSelectSources(versionData);
                            for (var i = 0; i < durakMarkers.length; i++) {
                                durakMarkers[i].setMap(null);
                            }
                        } else {

                            SetSelectSourceToNull("slVersion");
                            SetSelectSourceToNull("select-forward-version");
                            SetSelectSourceToNull("select-backward-version");

                            $("#portlet-match").hide();
                            CloseSelectDropDown("select-forward-version");
                            CloseSelectDropDown("select-backward-version");
                            $("#btnMergeContainerShow").hide();
                            ChangeVersionList(res);
                            for (var i = 0; i < durakMarkers.length; i++) {
                                durakMarkers[i].setMap(null);
                            }
                            toastr["warning"](window.resCoordinate_for_xxx_line_is_not_defined__Contact_your_system_administrator_for_identification.replace("xxx", selectedRoute), window.resAlert + "!");
                        }
                    },
                    complete: function () {
                        //loadPanel.hide();
                    }
                });
            }
        });
        $("#btnDraw").click(function () {
            var selectedRoute = GetRoute();
            if (selectedRoute === '-1' || selectedRoute === '') {
                toastr["warning"]("Hat Seçiniz !!!");
                return;
            }
            var selectedVersion = $("#slVersion").val();
            if (selectedVersion === "") {
                toastr["warning"]("Lütfen versiyon seçiniz.");
                return;
            }
            //loadPanel.show();
            ClearMap();
            var tmpResArray = Enumerable.From(versions).Where("$.versionNo == " + selectedVersion).Select("$.lines").ToArray()[0];
            var tmpPointsArrayForward = new Array();
            var tmpPointsArrayBackward = new Array();
            var forwardDatas = new Array();
            var backwardDatas = new Array();

            var tmpHatKodu = tmpResArray[0].routeCode;
            for (var i = 0; i < tmpResArray.length; i++) {
                if (tmpResArray[i].routeDirection === "F") {
                    tmpPointsArrayForward.push(getLatLonObject(tmpResArray[i].latitude, tmpResArray[i].longitude));
                    forwardDatas.push(tmpResArray[i]);
                } else {
                    tmpPointsArrayBackward.push(getLatLonObject(tmpResArray[i].latitude, tmpResArray[i].longitude));
                    backwardDatas.push(tmpResArray[i]);
                }
            }
            lines = new Array();
            var forwardLine = drawPolyline("F", tmpHatKodu, tmpPointsArrayForward, forwardDatas);//Forward
            var backwardLine = drawPolyline("B", tmpHatKodu, tmpPointsArrayBackward, backwardDatas);//Backward
            FitBounds(forwardLine, backwardLine);

            $("#btnSave").show();
            $("#btnClear").show();
            //loadPanel.hide();
        });
        $("#btnNew").click(function () {
            var selectedRoute = GetRoute();
            if (selectedRoute === '-1') {
                toastr["warning"]("Hat Seçiniz !!!");
                return;
            }
            if (selectedRoute !== "") {
                $("#btnClear").click();
                var tmpPointsArrayForward = new Array();
                var tmpPointsArrayBackward = new Array();

                tmpPointsArrayForward.push(getLatLonObject(newforwardRouteCoordinates[0].lat, newforwardRouteCoordinates[0].lng));
                tmpPointsArrayForward.push(getLatLonObject(newforwardRouteCoordinates[1].lat, newforwardRouteCoordinates[1].lng));
                tmpPointsArrayBackward.push(getLatLonObject(backwardRouteCoordinates[0].lat, backwardRouteCoordinates[0].lng));
                tmpPointsArrayBackward.push(getLatLonObject(backwardRouteCoordinates[1].lat, backwardRouteCoordinates[1].lng));
                lines = new Array();
                var fpolyline = drawPolyline("F", selectedRoute, tmpPointsArrayForward);//Forward
                var bpolyline = drawPolyline("B", selectedRoute, tmpPointsArrayBackward);//Backward
                var latlngbounds = new google.maps.LatLngBounds();
                if (fpolyline) {
                    fpolyline.latLngs.getArray()[0].forEach(function (latLng) {
                        latlngbounds.extend(latLng);
                    });
                }
                if (bpolyline) {
                    bpolyline.latLngs.getArray()[0].forEach(function (latLng) {
                        latlngbounds.extend(latLng);
                    });
                }
                map.setCenter(latlngbounds.getCenter());
                map.fitBounds(latlngbounds);
                $("#btnSave").show();
                $("#btnClear").show();
                //loadPanel.hide();
            }
        });
        $("#btnClear").click(function () {
            //loadPanel.show();

            ClearMap();

            $("#btnSave").hide();
            $("#btnClear").hide();
            //loadPanel.hide();
        });
        setTimeout(function () { $("#cbForward").parent("span").addClass("checked"); }, 0);
        $(".direction").on("change", function () {
            if (!$("#cbForward").is(":checked") && !$("#cbBackward").is(":checked")) {
                $("#cbForward").parent("span").addClass("checked");
            }
        });

        $(window).resize(function () {
            setTimeout(function () {
                $(".page-container").height($("body").height() - $(".header").height());
                $(".page-content").height($("body").height() - $(".header").height());
                $("#dvMap").height($(".page-content").height());
                google.maps.event.trigger(map, "resize");
            }, 0);
        });

        $("#slVersion").change(function () {
            var selectedVersion = $("#slVersion").val();
            for (var i = 0; i < durakMarkers.length; i++) {
                durakMarkers[i].setMap(null);
            }
            if (selectedVersion != null) {
                if (selectedVersion.length > 0) {

                    /***********************************************************************************/
                    /* Seçilen hat kodu silinme için kullanılacak modala yazılıyor. */
                    try {
                        var mVersionText = $("#slVersion").select2('data').text;
                        if ($("#spn-delete-modal-version") != null) {
                            $("#spn-delete-modal-version").html(mVersionText);
                        }
                    } catch (e) {
                        // Ignored...
                    }
                    /************************************************************************************/

                    // $("#btnDelete").show();

                } else {
                    $("#btnDelete").hide();
                }
            } else {
                $("#btnDelete").hide();
            }
        });

        $("#btnNewStop").click(function () {
            var selectedRoute = GetRoute();
            if (selectedRoute === '-1') {
                toastr["warning"]("Hat Seçiniz !!!");
                return;
            }

            var version = $("#slVersion").val();
            if (selectedRoute === '' || selectedRoute === 0 || selectedRoute === -1) {
                toastr["warning"]("Lütfen hat seçiniz!");
                return;
            }
            if (version === 0 || version === '' || version === -1) {
                toastr["warning"]("Durak eklemeden önce hat çiziniz ya da versiyon seçiniz!");
                return;
            }
            var yon = $("#cbForward").is(":checked");
            var yon1 = $("#cbBackward").is(":checked");
            if (yon === true && yon1 == false) {
                yon = 'G';
            }
            else if (yon === false && yon1 == true) {
                yon = 'D';
            }
            else if (yon === true && yon1 == true) {
                yon = '';
            }
            $.ajax({
                url: "/RouteDefinition/GetRouteGpsCoordinates",
                type: "POST",
                data: {
                    lineCode: selectedRoute,
                    yon: yon
                },
                success: function (res) {
                    LoadSorteredStations(res);
                    $("#siraNo").val($("#ulStops li").length + 1);
                    $("#siraNo").trigger("touchspin.updatesettings", { max: $("#ulStops li").length + 1 });
                    $("#exampleModal").modal();
                    //document.getElementById('stops').options.length = 0;
                    //$('#stops option:selected').removeAttr('selected');
                    document.getElementById('stopTypes').value = '';
                    //$("#stopTypes").select2({});
                    document.getElementById('yon').value = '';
                    //$("#yon").select2({});
                    document.getElementById('fiyatlar').value = '';
                    document.getElementById('mesafe').value = '';
                    document.getElementById('sure').value = '';
                },
                complete: function () {
                }
            });

        });

        $("#btnSaveStations").click(function () {
            var routeCode = GetRoute();
            var routeCoordinates = new Array();
            //var date = new Date().toLocaleString();
            var versionData = $("#slVersion").val();
            var versions = versionData.split("-");
            var version = versions[0];
            var sure = $("#sure").val();
            var stationId = $("#stops").val();
            var siraNo = $("#siraNo").val();
            routeCoordinates.push({
                hatKodu: routeCode,
                durakId: $("#stops").val(),
                siraNo: ($("#siraNo").val()),
                fiyatTabloNo: $("#fiyatlar").val(),
                insertKullaniciId: 0,
                //insertDate: date,
                durakTipiId: $("#stopTypes").val(),
                sure: sure,
                iSure: 0,
                mesafe: $("#mesafe").val(),
                versionNo: version,
                yon: $("#yon").val()
            });
            $.ajax({
                url: "/RouteDefinition/UpdateStationsCoordinates",
                type: "POST",
                data: {
                    routeCode: routeCode,
                    stationId: stationId,
                    siraNo: siraNo,
                    routeCoordinates: routeCoordinates
                },
                success: function (res) {
                    toastr["success"]("Başarılı");
                    $('.close').click();
                },
                error: function (xhr) {
                    command: toastr["error"]("Recording Failed..!");
                }
            });
        });

        $("#btnShowStops").click(function () {
            var routeCode = GetRoute();
            if (routeCode === '-1') {
                toastr["warning"]("Hat Seçiniz!!");
                return false;
            }

            var yon = $("#cbForward").is(":checked");
            var yon1 = $("#cbBackward").is(":checked");
            if (yon === true && yon1 == false) {
                yon = 'G';
            }
            else if (yon === false && yon1 == true) {
                yon = 'D';
            } else if (yon === true && yon1 == true) {
                yon = '';
            } else {
                toastr["warning"]("Yön Seçiniz!!");
                return;
            }
            ClearRouteStationMarkers();
            $.ajax({
                url: "/RouteDefinition/GetStopsCoordinates",
                type: "POST",
                data: {
                    routeCode: routeCode,
                    yon: yon
                },
                success: function (res) {
                    if (res !== "") {
                        var tmpResArray = Enumerable.From(res).Select().ToArray();
                        duraklarListe = tmpResArray;
                        if (duraklarListe.length > 0)
                            map.set("center", new google.maps.LatLng(duraklarListe[0].enlemF, duraklarListe[0].boylamF));
                        //GetLatLongs(duraklarListe);
                    } else {
                        toastr["error"](ErrorVar, "");
                    }
                    $('#cbForward').change(function () {
                        for (var i = 0; i < durakMarkers.length; i++) {
                            durakMarkers[i].setMap(null);
                        }
                    });
                    $('#cbBackward').change(function () {
                        for (var i = 0; i < durakMarkers.length; i++) {
                            durakMarkers[i].setMap(null);
                        }
                    });
                    var i;
                    var linePolylines = new Array();
                    if (linePolylines.length > 0) {
                        showPolyLines = false;
                        for (i = 0; i < linePolylines.length; i++) {
                            linePolylines[i].polyline.setMap(null);
                        }

                    }
                    var lineCode = GetRoute().split(",");
                    showPolyLines = true;
                    for (i = 0; i < lineCode.length; i++) {
                        if (showPolyLines) {
                            if (lineCode[i] !== "") {
                                getAllLineCoordinates(lineCode[i]);
                            }
                        } else {
                            break;
                        }
                    }
                },
                complete: function () {
                }
            });
        });
        $("#btnDeleteStop").on("click", function () {
            var checks = new Array();
            var routeCode = GetRoute();
            var yon = $("#cbForward").is(":checked");
            var yon1 = $("#cbBackward").is(":checked");
            if (yon === true && yon1 == false) {
                yon = 'G';
            }
            else if (yon === false && yon1 == true) {
                yon = 'D';
            }
            else if (yon === true && yon1 == true) {
                yon = '';
            }
            else {
                toastr["warning"]("Yön Seçiniz!!");
                return;
            }
            ClearRouteStationMarkers();
            $("#ulStops li .chbStop:checked").each(function () {
                checks.push($(this).attr("id"));
            });
            var stationId = checks.join(',');
            if (stationId === null || stationId === '') {
                toastr["warning"]("Silmek İstediğiniz durağı seçiniz!!");
                return;
            }
            $.ajax({
                url: "/RouteDefinition/DeleteRouteStops",
                type: "POST",
                data: {
                    routeCode: routeCode,
                    stationId: stationId
                },
                success: function (res) {
                    var routeCode = GetRoute();
                    $.ajax({
                        url: "/RouteDefinition/GetRouteGpsCoordinates",
                        type: "POST",
                        data: {
                            lineCode: routeCode,
                            yon: ''
                        },
                        success: function (res) {
                            if (res) {
                                LoadSorteredStations(res);
                                toastr["success"]("İşlem Başarılı");
                            } else {
                                toastr["error"](ErrorVar, "");
                            }
                        },
                        complete: function () {
                        }
                    });
                },
                complete: function () {
                }
            });
        });
        $("#btnSaveOrderNo").click(function () {
            var orderNoArray = [];
            $.each($("#ulStops li"),
                function (e, i) {
                    var stopOrderNo = {};
                    stopOrderNo.durakId = $(this).attr("data-value");
                    stopOrderNo.hatKodu = GetRoute();
                    for (i = 0; i <= orderNoArray.length; i++) {
                        stopOrderNo.siraNo = (i + 1);
                    }
                    orderNoArray.push(stopOrderNo);
                });

            var jsondata = JSON.stringify(orderNoArray);
            var count = 0;
            $.ajax({
                url: "/RouteDefinition/UpdateOrderNoStop",
                type: "POST",
                data: {
                    routeCode: GetRoute(),
                    orderNo: jsondata
                },
                success: function (res) {
                    if ($("#ulStops").hasClass("ui-sortable")) $("#ulStops").sortable("destroy");
                    LoadSorteredStations(res);
                    toastr["success"]("Durak Sıralaması Değiştirildi!");
                },
                error: function (xhr, textStatus, error) {
                    command: toastr["error"]("Recording Failed..!");
                },
                complete: function () {

                }
            });
        });
        $("#btnListStops").click(function () {
            var routeCode = GetRoute();
            if (routeCode === '-1') {
                toastr["warning"]("Hat seçiniz!!!");
                return;
            }
            ClearRouteStationMarkers();
            //var selectedVersion = $("#slVersion").val();
            var yon = $("#cbForward").is(":checked");
            var yon1 = $("#cbBackward").is(":checked");
            if (yon === true && yon1 == false) {
                yon = 'G';
            }
            else if (yon === false && yon1 == true) {
                yon = 'D';
            }
            else if (yon === true && yon1 == true) {
                yon = '';
            }
            else {
                toastr["warning"]("Yön Seçiniz!!");
                return;
            }
            $("#ulStops").css("list-style", "none");
            $("#listStops").modal();
            $.ajax({
                url: "/RouteDefinition/GetRouteGpsCoordinates",
                type: "POST",
                data: {
                    lineCode: routeCode,
                    yon: yon
                },
                success: function (res) {
                    LoadSorteredStations(res);
                },
                complete: function () {
                }
            });

        });

        $("#btnMergeContainerShow").click(function () {

            $("#portlet-match").show();
            $("#btnMergeContainerShow").hide();
        });

        $("#btnSaveRoute").click(function () {
            saveMultipleLines();
        });
    });

    function drawPolyline(direction, tmpHatKodu, positionsArray) {
        var result;
        if (!positionsArray.length > 0) return null;
        var start = positionsArray[0];
        var end = positionsArray[positionsArray.length - 1];
        var deleteMenu = new DeleteMenu();
        var line = new google.maps.Polyline({
            path: positionsArray,
            icons: [{ icon: fArrow, repeat: "50px" }],
            geodesic: true,
            strokeColor: direction === "F" ? "#" + "0000FF" : "#" + "FF0000",
            strokeOpacity: 0.7,
            strokeWeight: 2,
            editable: true
        });
        var startMarker = new MarkerWithLabel({
            position: start,
            icon: "http://maps.google.com/mapfiles/ms/icons/" + (direction === "F" ? "blue" : "red") + "-dot.png",
            draggable: true,
            raiseOnDrag: true,
            labelContent: tmpHatKodu + "-" + (direction === "F" ? window.resForward : window.resBackward) +
                "<br />Başlangıç",
            labelAnchor: new google.maps.Point(35, 55),
            labelClass: "lblMarker lblMarker" + direction,
            labelStyle: { opacity: 1.0 }
        });
        var endMarker = new MarkerWithLabel({
            position: end,
            icon: "http://maps.google.com/mapfiles/ms/icons/" + (direction === "F" ? "blue" : "red") + "-dot.png",
            draggable: true,
            raiseOnDrag: true,
            labelContent: tmpHatKodu + "-" + (direction === "F" ? window.resForward : window.resBackward) +
                "<br />Bitiş",
            labelAnchor: new google.maps.Point(35, 55),
            labelClass: "lblMarker lblMarker" + direction,
            labelStyle: { opacity: 1.0 }
        });
        lines.push({
            routeCode: tmpHatKodu,
            direction: direction,
            polyline: line,
            startMarker: startMarker,
            endMarker: endMarker
        });

        if (direction === "F" && $("#cbForward").is(":checked")) {
            line.setMap(map);
            startMarker.setMap(map);
            endMarker.setMap(map);
            result = line;
        }
        else if (direction === "B" && $("#cbBackward").is(":checked")) {
            line.setMap(map);
            startMarker.setMap(map);
            endMarker.setMap(map);
            result = line;
        }

        google.maps.event.addListener(startMarker, "drag", function (mEvent) {
            var path = line.getPath();
            path.setAt(0, mEvent.latLng);
        });
        google.maps.event.addListener(endMarker, "drag", function (mEvent) {
            var path = line.getPath();
            path.setAt(path.length - 1, mEvent.latLng);
        });
        google.maps.event.addListener(line, "rightclick", function (e) {
            if (e.vertex == undefined) {
                return;
            }
            deleteMenu.open(map, line.getPath(), e.vertex);
        });
        return result;
    }

    function CreateStationMarkers(direction, positionsArray, data) {

        var deleteMenu = new DeleteMenu();
        $.each(positionsArray, function (i, v) {
            var infoPopup = new google.maps.InfoWindow({
                content: "<b><div class='iw-container' id='" + data[i].durakId + "'><div class='iw-title'>(" + data[i].siraNo + ") " + data[i].aciklama + "</div></b>" +
                    "<div class='iw-content'>" +
                    "<table class='table table-bordered table-striped'>" +
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
            google.maps.event.addListener(marker, "rightclick", function (e) {
                if (e.vertex === undefined) return;
                deleteMenu.open(map, marker.getPosition(), e.vertex);
            });
        });
    }

    function drawPolylineList(direction, tmpHatKodu, positionsArray, data) {
        lines = new Array();
        firstPath = positionsArray;
        var deleteMenu = new DeleteMenu();
        var lineMarkers = new Array();
        var line = new google.maps.Polyline({
            path: positionsArray,
            icons: [{ icon: fArrow, repeat: "50px" }],
            geodesic: true,
            strokeColor: direction === "F" ? "#" + "0000FF" : "#" + "FF0000",
            strokeOpacity: 0.7,
            strokeWeight: 2,
            map: map,
            editable: true
        });
        $.each(positionsArray, function (i, v) {
            var marker = new MarkerWithLabel({
                position: v,
                icon: "http://maps.google.com/mapfiles/ms/icons/" + (direction === "F" ? "blue" : "red") + "-dot.png",
                //infoWindow: new google.maps.InfoWindow({
                //    content: CreateMarkerInfoContentList(data[i])
                //}),
                map: map,
                draggable: true
            });
            lineMarkers.push({
                stopId: data[i].durakId,
                siraNo: data[i].siraNo,
                marker: marker
            });
            ////google.maps.event.addListener(marker, "click", function () {
            ////    this.infoWindow.open(map, this);
            ////});
            google.maps.event.addListener(marker, "rightclick", function (e) {
                if (e.vertex === undefined) return;
                deleteMenu.open(map, marker.getPosition(), e.vertex);
            });
        });
        lines.push({
            routeCode: tmpHatKodu,
            polyline: line,
            lineMarkers: lineMarkers
        });
    }
    function CreateMarkerInfoContent(markerData) {
        var content = "<b><div class='iw-container' id='" + markerData.seqNbr + "'><div class='iw-title'>(" + markerData.seqNbr + ") " + markerData.routeCode + "</div></b>" +
            "<div class='iw-content'>" +
            "<table class='table table-bordered table-striped'>" +
            "<tr><td width='50%'><b>" + window.resLatitude + ":</b></td><td>" + markerData.latitude + "</td></tr>" +
            "<tr><td width='50%'><b>" + window.resLongitude + ":</b></td><td>" + markerData.longitude + "</td></tr>" +
            "</table></div></div>";
        return content;
    }

    function enlemChange() {
        var enlem = $("#enlem").val();
        var boylam = $("#boylam").val();
        var latlng = new google.maps.LatLng(enlem, boylam);
        marker.setPosition(latlng);
        map.setCenter(marker.getPosition());
    }
    //Boylam TextBoxu değiştiğinde tetiklenir.
    function boylamChange() {
        var enlem = $("#enlem").val();
        var boylam = $("#boylam").val();
        var latlng = new google.maps.LatLng(enlem, boylam);
        marker.setPosition(latlng);
        map.setCenter(marker.getPosition());
    }
    function getLatLonObject(lat, lon) {
        return new google.maps.LatLng(lat, lon);
    }
    function GetLatLongs(data) {
        for (var i = 0; i < data.length; i++) {
            durakMarkers[i] = new MarkerWithLabel({
                'position': new google.maps.LatLng(data[i].enlemF, data[i].boylamF),
                'map': map,
                'labelClass': "labels",
                'labelAnchor': new google.maps.Point(22, 0)
            });
            durakMarkers[i].setIcon("/image/location.png");

            var infoContentString = "<div class='infoDiv iw-container' ><div class='iw-title'>" +
                data[i].durakId +
                " - " + data[i].aciklama + "</div>" +
                "<div class='iw-content'>" +
                "</div>" +
                "</div>";
            var infowindow = new google.maps.InfoWindow();
            google.maps.event.addListener(durakMarkers[i],
                "click",
                (function (mm, tt) {
                    return function () {
                        infowindow.setContent(tt);
                        infowindow.open(map, mm);
                    };
                })(durakMarkers[i], infoContentString));
        }
    }
    function SetSelectSources(data) {
        try {
            $.each(data, function (i, v) {
                var insertDateTime = (new Date(Number(v.source[0].insertDt.replace("/Date(", "").replace(")/", "")))).toLocaleString();
                versions.push({
                    versionNo: v.source[0].versionNo,
                    versionDt: insertDateTime,
                    lines: v.source
                });
            });
        } catch (e) {
            // Ignored...
        }
    }

    function ChangeVersionList(dataString) {
        var markup = "";
        if (dataString != "" & dataString !== "[]") {
            var tempData = dataString;

            //var JSONObject = JSON.parse(tempData);
            var versionData = Enumerable.From(tempData).GroupBy("$.versionNo").ToArray();

            //for (var i = 0; i < versionData.length; i++) {
            //    markup += "<option value='" + versionData[i].versionNo + "'>" + versionData[i].versionNo + " - " + versionData[i].insertDt + "</option>";
            //}
            markup = "<option value=''>" + window.resChooseVersion + "</option>";
            $.each(versionData, function (i, v) {
                var insertDateTime = v.source[0].insertDt.split('T').join(' ');

                markup += "<option value=\"" + v.source[0].versionNo + "\">" + v.source[0].versionNo + " - " + insertDateTime + "</option>";
            });
            $("#slVersion").html("");
            var tmpHtml = $("#slVersion").html();
            $("#slVersion").html(tmpHtml + markup);
            $("#slVersion").trigger("chosen:updated");
            $('#slVersion').selectpicker('refresh');
        } else {
            $("#slVersion").html("");
            markup += "<option value='" + -1 + "'>" + "Data Yok..!" + "</option>";
            var tmpHtml = $("#slVersion").html();
            $("#slVersion").html(tmpHtml + markup);
            $("#slVersion").trigger("chosen:updated");
            $('#slVersion').selectpicker('refresh');
        }

    }
    function setVersion() {
        var selectedRoute = GetRoute();
        if (selectedRoute !== "") {

            $("#btnClear").click();

            $.ajax({
                url: "/RouteDefinition/GetCoordinates",
                type: "POST",
                data: {
                    routeCode: selectedRoute
                },
                success: function (res) {
                    if (res !== "" & res !== "[]") {
                        var data = JSON.parse(res);
                        versions = new Array();
                        var versionData = Enumerable.From(data).GroupBy("$.versionNo").ToArray();
                        ChangeVersionList(data);
                        SetSelectSources(versionData);
                        for (var i = 0; i < durakMarkers.length; i++) {
                            durakMarkers[i].setMap(null);
                        }
                    } else {

                        SetSelectSourceToNull("slVersion");
                        SetSelectSourceToNull("select-forward-version");
                        SetSelectSourceToNull("select-backward-version");

                        $("#portlet-match").hide();
                        CloseSelectDropDown("select-forward-version");
                        CloseSelectDropDown("select-backward-version");
                        $("#btnMergeContainerShow").hide();
                        ChangeVersionList(res);
                        for (var i = 0; i < durakMarkers.length; i++) {
                            durakMarkers[i].setMap(null);
                        }
                        toastr["warning"](window.resCoordinate_for_xxx_line_is_not_defined__Contact_your_system_administrator_for_identification.replace("xxx", selectedRoute), window.resAlert + "!");
                    }
                },
                complete: function () {
                    //loadPanel.hide();
                }
            });
        }
    }
    function setKmlCoordinates(positionsArray, routeCode, direction) {
        if (positionsArray.length <= 0) return;
        var pointsArray = Enumerable.From(positionsArray).Select(function (x) { return new google.maps.LatLng(parseFloat(x.Latitude), parseFloat(x.Longitude)) }).ToArray();
        var start = pointsArray[0];
        var end = pointsArray[pointsArray.length - 1];
        var deleteMenu = new DeleteMenu();
        var line = new google.maps.Polyline({
            path: pointsArray,
            icons: [{ icon: fArrow, repeat: "50px" }],
            geodesic: true,
            strokeColor: direction === "F" ? "#" + "0000FF" : "#" + "FF0000",
            strokeOpacity: 0.7,
            strokeWeight: 2,
            editable: true
        });

        var startMarker = new MarkerWithLabel({
            position: start,
            icon: "http://maps.google.com/mapfiles/ms/icons/" + (direction === "F" ? "blue" : "red") + "-dot.png",
            draggable: true,
            raiseOnDrag: true,
            labelContent: routeCode + "-" + (direction === "F" ? window.resForward : window.resBackward) +
                "<br />Başlangıç",
            labelAnchor: new google.maps.Point(35, 55),
            labelClass: "lblMarker lblMarker" + direction,
            labelStyle: { opacity: 1.0 }
        });
        var endMarker = new MarkerWithLabel({
            position: end,
            icon: "http://maps.google.com/mapfiles/ms/icons/" + (direction === "F" ? "blue" : "red") + "-dot.png",
            draggable: true,
            raiseOnDrag: true,
            labelContent: routeCode + "-" + (direction === "F" ? window.resForward : window.resBackward) +
                "<br />Bitiş",
            labelAnchor: new google.maps.Point(35, 55),
            labelClass: "lblMarker lblMarker" + direction,
            labelStyle: { opacity: 1.0 }
        });
        var objLine = {
            routeCode: routeCode,
            direction: direction,
            polyline: line,
            startMarker: startMarker,
            endMarker: endMarker
        };
        lines.push(objLine);
        google.maps.event.addListener(startMarker, "drag", function (mEvent) {
            var path = line.getPath();
            path.setAt(0, mEvent.latLng);
        });
        google.maps.event.addListener(endMarker, "drag", function (mEvent) {
            var path = line.getPath();
            path.setAt(path.length - 1, mEvent.latLng);
        });
        google.maps.event.addListener(line, "rightclick", function (e) {
            if (e.vertex == undefined) {
                return;
            }
            deleteMenu.open(map, line.getPath(), e.vertex);
        });

        if (!($("#cbCizim").is(":checked"))) {
            addLineToMap(objLine);
        }
    }
    function addLineToMap(lineItem) {
        multipleLines.push(lineItem);

        lineItem.polyline.setMap(map);
        lineItem.startMarker.setMap(map);
        lineItem.endMarker.setMap(map);

        var latlngbounds = new google.maps.LatLngBounds();
        lineItem.polyline.latLngs.getArray()[0].forEach(function (latLng) {
            latlngbounds.extend(latLng);
        });
        map.setCenter(latlngbounds.getCenter());
        map.fitBounds(latlngbounds);
    }
    function removeLineToMap(lineItem) {
        var index = multipleLines.indexOf(lineItem);
        if (index > -1) {
            multipleLines.splice(index, 1);
        }

        lineItem.polyline.setMap(null);
        lineItem.startMarker.setMap(null);
        lineItem.endMarker.setMap(null);
    }
    function lineChange(e) {
        var lineIndx = $(e).val();
        var lineItem = lines[lineIndx];
        if (lineItem) {
            if ($(e).is(":checked")) {
                $(e).parent("span").addClass("checked");
                addLineToMap(lineItem);
            } else {
                $(e).parent("span").removeClass("checked");
                removeLineToMap(lineItem);
            }
        }
    }
    function getAllLineCoordinates(hatKodu) {
        $.ajax({
            url: "/RouteDefinition/GetRouteGpsCoordinates",
            type: "POST",
            dataType: "json",
            data: {
                lineCode: hatKodu
            },
            success: function (result) {
                if (result !== "" && result !== "[]") {
                    if (showPolyLines) {
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
                        if (RouteStationMarkers.length > 0) {
                            var bounds = new google.maps.LatLngBounds();
                            for (var i = 0; i < RouteStationMarkers.length; i++) {
                                bounds.extend(RouteStationMarkers[i].getPosition());
                            }
                            map.fitBounds(bounds);
                        }
                    }
                }
            },
            error: function () {
                console.log("Hata");
            }
        });
    }
    function updateCheckList() {
        if (lines.length > 0) {
            $(".routeLines-panelitem").css({ 'display': 'block' });
            $.each(lines, function (i, e) {
                $(".chkList-panel").append(checkboxItem.replace("##chkId##", "chkLineItem" + i).replace("##value##", i).replace("##text##", "(" + e.direction + ") " + e.routeCode));
            });
        }
        else
            $(".routeLines-panelitem").css({ 'display': 'none' });
    }
    function saveMultipleLines() {
        if (multipleLines.length <= 0) {
            window.toastr["warning"]("Harita üzerinde hat bilgisi bulunamadı!");
            return;
        }
        var routes = new Array();
        var seqNo = 0;
        var sessionId = 1;
        $.each(multipleLines, function (i, v) {
            $.each(v.polyline.getPath().getArray(), function (ind, val) {
                var jsonData = val.toJSON();
                routes.push({
                    routeCode: GetRoute(),
                    latitude: jsonData.lat,
                    longitude: jsonData.lng,
                    direction: v.direction
                });
            });
        });
        if (routes.length > 0) {
            $.ajax({
                url: "/RouteDefinition/UpdateMultipleRouteCoordinates",
                type: "POST",
                data: {
                    routeCode: GetRoute(),
                    latLongs: routes
                },
                success: function (res) {
                    if (res !== "" & res !== "[]") {
                        var data = res;
                        versions = new Array();
                        var versionData = Enumerable.From(data).GroupBy("$.versionNo").ToArray();
                        SetSelectSource("select_version", versionData);
                        SetSelectSource("select-forward-version", versionData);
                        SetSelectSource("select-backward-version", versionData);
                        /* Versiyon Birleştirme buton ve panelinin görünümü değiştirildi. */
                        $("#portlet-match").hide();
                        CloseSelectDropDown("select-forward-version");
                        CloseSelectDropDown("select-backward-version");

                        if (data != null && data.length >= 2) {
                            $("#btnMergeVersions").show();
                        } else {
                            $("#btnMergeVersions").hide();
                        }
                        $("#btnClear").click();
                        window.toastr["success"](window.resCoordinatesSavedSuccessfully, window.resInformation);
                        document.getElementById("slVersion").value = '';
                        setVersion();
                    } else {

                        SetSelectSourceToNull("slVersion");
                        SetSelectSourceToNull("select-forward-version");
                        SetSelectSourceToNull("select-backward-version");

                        $("#portlet-match").hide();
                        CloseSelectDropDown("select-forward-version");
                        CloseSelectDropDown("select-backward-version");
                        $("#btnMergeCbtnMergeVersionsontainerShow").hide();
                        toastr["warning"](
                            window
                                .resCoordinate_for_xxx_line_is_not_defined__Contact_your_system_administrator_for_identification
                                .replace("xxx", $("#slRoutes").val()),
                            window.resAlert + "!");
                    }
                },
                complete: function () {
                    //App.unblockUI($(".page-content"));
                }
            });
        }
    }

    function DeleteVersionConfim() {
        try {
            setTimeout(function () {
                var selectedRoute = GetRoute();
                var selectedVersion = $("#slVersion").val();
                if (selectedRoute !== "" && selectedVersion !== "") {
                    DeleteRouteCoordinates(selectedRoute, selectedVersion);
                } else {
                    window.toastr["warning"]("Seçili hat ve hat koordinat versiyonlarının alınması sırasında hata oluştu.", "İşlem tamamlanamadı!");
                }
            }, 100);
        } catch (e) {
            // Ignored...
        }
    }

    /* Seçili Hat Koordinat Versiyonunu Siler */
    function DeleteRouteCoordinates(routeCode, version) {
        //App.blockUI($(".page-content"));
        try {
            $.ajax({
                url: "/RouteDefinition/DeleteRouteCoordinates",
                type: "POST",
                data: {
                    routeCode: routeCode,
                    version: version
                },
                success: function (res) {
                    if (res != null) {
                        if (res.ObjectList != null && res.ObjectList.length > 0) {
                            versions = new Array();
                            var versionData = Enumerable.From(res.ObjectList).GroupBy("$.versionNo").ToArray();

                            SetSelectSource("slVersion", versionData);

                            SetSelectSource("select-forward-version", versionData);
                            SetSelectSource("select-backward-version", versionData);

                            $("#btnClear").click();
                            $("#btnDelete").hide();

                            /* Versiyon Birleştirme buton ve panelinin görünümü değiştirildi. */
                            $("#portlet-match").hide();
                            CloseSelectDropDown("select-forward-version");
                            CloseSelectDropDown("select-backward-version");
                            if (res.ObjectList != null && res.ObjectList.length >= 2) {
                                $("#btnMergeContainerShow").show();
                            } else {
                                $("#btnMergeContainerShow").hide();
                            }
                        } else {

                            SetSelectSourceToNull("slVersion");
                            SetSelectSourceToNull("select-forward-version");
                            SetSelectSourceToNull("select-backward-version");

                            $("#portlet-match").hide();
                            CloseSelectDropDown("select-forward-version");
                            CloseSelectDropDown("select-backward-version");
                            $("#btnMergeContainerShow").hide();
                            window.toastr["warning"]("Seçilen hat koordinat versiyonun silinmesi sırasında hata oluştu.", "İşlem tamamlanamadı!");
                        }

                        if (res.Result == true) {
                            window.toastr["success"](res.Message, window.resInformation);
                        } else {
                            window.toastr["warning"](res.Message, "İşlem tamamlanamadı!");
                        }
                    } else {

                        SetSelectSourceToNull("slVersion");
                        SetSelectSourceToNull("select-forward-version");
                        SetSelectSourceToNull("select-backward-version");

                        $("#portlet-match").hide();
                        CloseSelectDropDown("select-forward-version");
                        CloseSelectDropDown("select-backward-version");
                        $("#btnMergeContainerShow").hide();
                        window.toastr["warning"]("Seçilen hat koordinat versiyonun silinmesi sırasında hata oluştu.", "İşlem tamamlanamadı!");
                    }
                },
                complete: function () {
                    //App.unblockUI($(".page-content"));
                }
            });
        } catch (e) {
            //App.unblockUI($(".page-content"));
        }
    }

    function CloseMergeContainer() {
        try {
            $("#portlet-match").hide();
            CloseSelectDropDown("select-forward-version");
            CloseSelectDropDown("select-backward-version");
            $("#btnMergeContainerShow").show();
        } catch (e) {
            // Ignored...
        }
    }

    function MergeVersionsClick() {
        try {
            var selectedRoute = GetRoute();
            var selectedForwardVersion = $("#select-forward-version").val();
            var selectedBackwardVersion = $("#select-backward-version").val();

            if (selectedRoute != null && selectedRoute.length > 0) {
                if (selectedForwardVersion != null && selectedForwardVersion.length > 0) {
                    if (selectedBackwardVersion != null && selectedBackwardVersion.length > 0) {
                        if (parseInt(selectedForwardVersion) != parseInt(selectedBackwardVersion)) {
                            /***********************************************************************************/
                            /* Seçilen hat koduna tanımlı olan  versiyonlar modal lara yazılıyor. */
                            try {
                                var mRouteCodeText = $("#slRoute").select2('data').text;
                                if ($("#spn-merge-modal-routeCode") != null) {
                                    $("#spn-merge-modal-routeCode").html(mRouteCodeText);
                                }
                                var mForwardVersionText = $("#select-forward-version").select2('data').text;
                                if ($("#spn-merge-modal-forward") != null) {
                                    $("#spn-merge-modal-forward").html(mForwardVersionText);
                                }
                                var mBackwardVersionText = $("#select-backward-version").select2('data').text;
                                if ($("#spn-merge-modal-backward") != null) {
                                    $("#spn-merge-modal-backward").html(mBackwardVersionText);
                                }
                            } catch (e) {
                                // Ignored...
                            }
                            /***********************************************************************************/
                            $("#MergeVersionsModal").modal('show');
                        } else {
                            window.toastr["warning"]("Gidiş ve Dönüş versiyonları aynı olamaz.", "İşlem tamamlanamadı!");
                        }
                    } else {
                        window.toastr["warning"]("Dönüş versiyonu seçilmeden işleme devam edilemez.", "İşlem tamamlanamadı!");
                    }
                } else {
                    window.toastr["warning"]("Gidiş versiyonu seçilmeden işleme devam edilemez.", "İşlem tamamlanamadı!");
                }
            } else {
                window.toastr["warning"]("Seçilen hat bilgisi alınamıyor.", "İşlem tamamlanamadı!");
            }
        } catch (e) {
            // Ignored...
        }
    }

    function MergeVersionsConfirm() {
        try {
            setTimeout(function () {
                var selectedRoute = GetRoute();
                var selectedForwardVersion = $("#select-forward-version").val();
                var selectedBackwardVersion = $("#select-backward-version").val();

                if (selectedRoute != null && selectedRoute.length > 0) {
                    if (selectedForwardVersion != null && selectedForwardVersion.length > 0) {
                        if (selectedBackwardVersion != null && selectedBackwardVersion.length > 0) {
                            if (parseInt(selectedForwardVersion) != parseInt(selectedBackwardVersion)) {
                                MergeRouteCoordinateVersions(selectedRoute, selectedForwardVersion, selectedBackwardVersion);
                            } else {
                                window.toastr["warning"]("Gidiş ve Dönüş versiyonları aynı olamaz.", "İşlem tamamlanamadı!");
                            }
                        } else {
                            window.toastr["warning"]("Dönüş versiyonu seçilmeden işleme devam edilemez.", "İşlem tamamlanamadı!");
                        }
                    } else {
                        window.toastr["warning"]("Gidiş versiyonu seçilmeden işleme devam edilemez.", "İşlem tamamlanamadı!");
                    }
                } else {
                    window.toastr["warning"]("Seçilen hat bilgisi alınamıyor.", "İşlem tamamlanamadı!");
                }
            }, 100);
        } catch (e) {
            // Ignored...
        }
    }

    /* Yönlere Bağlı Olarak Hat Koordinat Versiyonlarını Birleştirir. */
    function MergeRouteCoordinateVersions(routeCode, forwardVersion, backwardVersion) {
        //App.blockUI($(".page-content"));
        try {
            $.ajax({
                url: "/RouteDefinition/MergeRouteCoordinateVersions",
                type: "POST",
                data: {
                    routeCode: routeCode,
                    forwardVersion: forwardVersion,
                    backwardVersion: backwardVersion
                },
                success: function (res) {
                    if (res != null) {
                        if (res.ObjectList != null && res.ObjectList.length > 0) {
                            versions = new Array();
                            var versionData = Enumerable.From(res.ObjectList).GroupBy("$.versionNo").ToArray();

                            SetSelectSource("slVersion", versionData);

                            SetSelectSource("select-forward-version", versionData);
                            SetSelectSource("select-backward-version", versionData);

                            $("#btnClear").click();
                            $("#btnDelete").hide();

                            /* Versiyon Birleştirme buton ve panelinin görünümü değiştirildi. */
                            $("#portlet-match").hide();
                            if (res.ObjectList != null && res.ObjectList.length >= 2) {
                                $("#btnMergeContainerShow").show();
                            } else {
                                $("#btnMergeContainerShow").hide();
                            }
                        } else {

                            SetSelectSourceToNull("slVersion");
                            SetSelectSourceToNull("select-forward-version");
                            SetSelectSourceToNull("select-backward-version");

                            $("#portlet-match").hide();
                            $("#btnMergeContainerShow").hide();
                            window.toastr["warning"]("[" + forwardVersion + "] versiyonunun gidiş - [" + backwardVersion + "] versiyonunun geliş koordinalarının birleştirilmesi sırasında hata oluştu.", "İşlem tamamlanamadı!");
                        }

                        if (res.Result == true) {
                            window.toastr["success"](res.Message, window.resInformation);
                        } else {
                            window.toastr["warning"](res.Message, "İşlem tamamlanamadı!");
                        }
                    } else {

                        SetSelectSourceToNull("slVersion");
                        SetSelectSourceToNull("select-forward-version");
                        SetSelectSourceToNull("select-backward-version");

                        $("#portlet-match").hide();
                        $("#btnMergeContainerShow").hide();
                        window.toastr["warning"]("[" + forwardVersion + "] versiyonunun gidiş - [" + backwardVersion + "] versiyonunun geliş koordinalarının birleştirilmesi sırasında hata oluştu.", "İşlem tamamlanamadı!");
                    }
                },
                complete: function () {
                    //App.unblockUI($(".page-content"));
                }
            });
        } catch (e) {
            //App.unblockUI($(".page-content"));
        }
    }

    function CloseSelectDropDown(id) {
        try {
            id = "#" + id;
            $(id).select2("close");
        } catch (e) {

        }
    }

    function SetSelectSourceToNull(id) {
        try {
            id = "#" + id;
            $(id).select2('data', null)
            $(id).html("<option value=\"\">" + window.resChooseVersion + "</option>");
            $(id).parent("div").parent("div").show();
            $(id).select2();
        } catch (e) {
            // Ignored...
        }
    }

    function LoadVersions(id) {
        try {
            id = "#" + id;
            $(id).select2('data', null)
            $(id).html("<option value=\"\">" + window.resChooseVersion + "</option>");
            $(id).parent("div").parent("div").show();
            $(id).select2();
        } catch (e) {
            // Ignored...
        }
    }

    function SetSelectSource(id, data) {
        try {
            id = "#" + id;
            if ($(id).data("select2")) $(id).select2("destroy");
            $(id).html("<option value=\"\">" + window.resChooseVersion + "</option>");
            $.each(data, function (i, v) {
                var insertDateTime = (new Date(Number(v.source[0].insertDt.replace("/Date(", "").replace(")/", "")))).toLocaleString();
                versions.push({
                    versionNo: v.source[0].versionNo,
                    versionDt: insertDateTime,
                    lines: v.source
                });
                $(id).append("<option value=\"" + v.source[0].versionNo + "\">" + v.source[0].versionNo + " - " + insertDateTime + "</option>");
            });
            $(id).parent("div").parent("div").show();
            $(id).select2();
        } catch (e) {
            // Ignored...
        }
    }

    function getLatLonObject(lat, lon) {
        return new google.maps.LatLng(lat, lon);
    }

    function DeleteMenu() {
        this.div_ = document.createElement("div");
        this.div_.className = "delete-menu";
        this.div_.innerHTML = window.resDelete;

        var menu = this;
        google.maps.event.addDomListener(this.div_, "click", function () {
            menu.removeVertex();
        });
    }
    DeleteMenu.prototype = new google.maps.OverlayView();

    DeleteMenu.prototype.onAdd = function () {
        var deleteMenu = this;
        var map = this.getMap();
        this.getPanes().floatPane.appendChild(this.div_);

        // mousedown anywhere on the map except on the menu div will close the
        // menu.
        this.divListener_ = google.maps.event.addDomListener(map.getDiv(), "mousedown", function (e) {
            if (e.target !== deleteMenu.div_) {
                deleteMenu.close();
            }
        }, true);
    };

    DeleteMenu.prototype.onRemove = function () {
        google.maps.event.removeListener(this.divListener_);
        this.div_.parentNode.removeChild(this.div_);

        // clean up
        this.set("position");
        this.set("path");
        this.set("vertex");
    };

    DeleteMenu.prototype.close = function () {
        this.setMap(null);
    };

    DeleteMenu.prototype.draw = function () {
        var position = this.get("position");
        var projection = this.getProjection();

        if (!position || !projection) {
            return;
        }

        var point = projection.fromLatLngToDivPixel(position);
        this.div_.style.top = point.y + "px";
        this.div_.style.left = point.x + "px";
    };

    /**
     * Opens the menu at a vertex of a given path.
     */
    DeleteMenu.prototype.open = function (map, path, vertex) {
        this.set("position", path.getAt(vertex));
        this.set("path", path);
        this.set("vertex", vertex);
        this.setMap(map);
        this.draw();
    };

    /**
     * Deletes the vertex from the path.
     */
    DeleteMenu.prototype.removeVertex = function () {
        var path = this.get("path");
        var vertex = this.get("vertex");

        if (!path || vertex == undefined) {
            this.close();
            return;
        }

        path.removeAt(vertex);
        this.close();
    };


    function FitBounds(fpolyline, bpolyline) {
        try {
            var latlngbounds = new google.maps.LatLngBounds();
            if (fpolyline) {
                fpolyline.latLngs.getArray()[0].forEach(function (latLng) {
                    latlngbounds.extend(latLng);
                });
            }
            if (bpolyline) {
                bpolyline.latLngs.getArray()[0].forEach(function (latLng) {
                    latlngbounds.extend(latLng);
                });
            }
            if (!fpolyline && !bpolyline) {
                return;
            }
            map.setCenter(latlngbounds.getCenter());
            map.fitBounds(latlngbounds);
        } catch (e) {

        }
    }

    function ClearMap() {
        if (RouteStationMarkers.length)
            $.each(RouteStationMarkers, function (i, v) {
                v.setMap(null);
            });
        RouteStationMarkers = new Array();

        if (lines.length)
            $.each(lines, function (i, v) {
                v.polyline.setMap(null);
                if (v.startMarker)
                    v.startMarker.setMap(null);
                if (v.endMarker)
                    v.endMarker.setMap(null);
                if (v.lineMarkers)
                    $.each(v.lineMarkers, function (j, t) {
                        t.marker.setMap(null);
                    });
            });
        lines = new Array();
    }
    function ClearRouteStationMarkers() {
        if (RouteStationMarkers.length)
            $.each(RouteStationMarkers, function (i, v) {
                v.setMap(null);
            });
        RouteStationMarkers = new Array();
    }

    function LoadSorteredStations(res) {
        $("#ulStops").html("");
        if (!res) return;
        var tmpResArray = Enumerable.From(res).Select().ToArray();
        var tmpPointsArrayForward = new Array();
        var tmpPointsArrayBackward = new Array();
        var forwardDatas = new Array();
        var backwardDatas = new Array();

        var duraklarListe = tmpResArray;
        if (duraklarListe.length > 0)
            map.set("center", new google.maps.LatLng(duraklarListe[0].enlemF, duraklarListe[0].boylamF));
        if ($("#ulStops").hasClass("ui-sortable")) $("#ulStops").sortable("destroy");
        $("#ulStops").html("");
        //var versionData = Enumerable.From(res).GroupBy("$.durakId").ToArray();
        var count = 0;
        for (var i = 0; i < duraklarListe.length; i++) {
            routeStops[i] = duraklarListe[i].durakId;
            orderStops[i] = duraklarListe[i].siraNo;
            count++;
            if ((duraklarListe[i].Yon && duraklarListe[i].Yon === "G") || (duraklarListe[i].yon && duraklarListe[i].yon === "G")) {
                tmpPointsArrayForward.push(getLatLonObject(duraklarListe[i].enlemF, duraklarListe[i].boylamF));
                forwardDatas.push(duraklarListe[i]);
                forwardStations.push({
                    durakId: duraklarListe[i].durakId,
                    siraNo: duraklarListe[i].siraNo
                });
            } else {
                tmpPointsArrayBackward.push(getLatLonObject(duraklarListe[i].enlemF, duraklarListe[i].boylamF));
                backwardDatas.push(duraklarListe[i]);
                backwardStations.push({
                    durakId: duraklarListe[i].durakId,
                    siraNo: duraklarListe[i].siraNo
                });
            }
            $("#ulStops").append("<li data-value=\"" +
                duraklarListe[i].durakId +
                "\"" +
                " data-faretableno=\"" +
                duraklarListe[i].fiyatTabloNo +
                "\"" +
                " data-stoptypeid=\"" +
                duraklarListe[i].durakTipiId +
                "\"" +
                " data-distance=\"" +
                duraklarListe[i].mesafe +
                "\"" +
                " data-time=\"" +
                (duraklarListe[i].sure ? duraklarListe[i].sure : "") +
                "\"" +
                " data-direction=\"" +
                duraklarListe[i].yon +
                "\"" +
                " data-orderNo=\"" +
                duraklarListe[i].siraNo +
                "\"" +
                " class=\"ui-state-default\">" + "<input class=\"chbStop\" type=\"checkbox\" id=\"" + duraklarListe[i].durakId + "\" />" + "   " + duraklarListe[i].siraNo + " - " + duraklarListe[i].aciklama +
                "<a id=\"" + duraklarListe[i].siraNo +
                "</li>");
        }
        RouteStationMarkers = new Array();
        CreateStationMarkers("F", tmpPointsArrayForward, forwardDatas);
        CreateStationMarkers("B", tmpPointsArrayBackward, backwardDatas);
        if (RouteStationMarkers.length > 0) {
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0; i < RouteStationMarkers.length; i++) {
                bounds.extend(RouteStationMarkers[i].getPosition());
            }
            map.fitBounds(bounds);
        }

        $("#ulStops").sortable();
        $("#ulStops").disableSelection();
        $("#divStops").show();
        $("#btnSave").show();
        $("#btnAddStop").show();
        $("#btnClear").show();
    }
} catch (e) {

}