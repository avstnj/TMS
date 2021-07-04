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
        $(".m-content").height($(".m-body").height() - $(".m-header").height());
        $("#dvMap").height($(".m-body").height());
        $.connection.hub.url = "http://localhost:1923/signalr";
        var liveLocationHub = $.connection.liveLocationHub;
        liveLocationHub.client.addContosoChatMessageToPage = function (name, message) {
            console.log(name + ' ' + message);
        };
        liveLocationHub.client.broadcastMessage = function (data) {
            if (data !== undefined && data !== "}" && data !== "") {
                var jsonAt = JSON.parse(data);
                ParseAllData(jsonAt);
                liveTrackingResults = $.grep(jsonAt,
                    function (n, i) {
                        return n;
                    });
                liveDataForGrid =(JSON.parse(JSON.stringify(liveTrackingResults)));
                if (gridSourceStatus === false) {
                    fillGridLive();
                    gridSourceStatus = true;
                } else {
                    $("#gridContainer").dxDataGrid("instance").option("dataSource.store.data", liveDataForGrid);
                }
                if (markers === undefined || markers.length === 0) {
                    CreateMarkers(jsonAt);
                    clusterData = jsonAt;
                } else {
                    UpdateMarkers(jsonAt);
                    clusterData = jsonAt;
                    liveData = jsonAt;
                }
            } else {
                console.log(Now() + " -No Data.");
            }
            loadPanel.hide();
        };
        $.connection.hub.start().done(function () {
            // Wire up Send button to call NewContosoChatMessage on the server.
            liveLocationHub.server.joinGroup("ABYS_1");
        });
      
        InitializeMap();
        map.setOptions({ styles: myMapStyle });
        var centerPoint = new google.maps.LatLng("42.696022", "23.319869");
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

    //function aracGecmisIzle() {
    //    var e = document.getElementById("selectTimeRange");
    //    var saat = e.options[e.selectedIndex].value;

    //    var nowDate = new Date();
    //    var month1 = nowDate.getMonth() + 1;
    //    var hour1 = nowDate.getHours() - parseInt(saat);
    //    var endDate = nowDate.getFullYear() +
    //        "-" +
    //        month1 +
    //        "-" +
    //        nowDate.getDate() +
    //        " " +
    //        hour1 +
    //        ":" +
    //        nowDate.getMinutes() +
    //        ":" +
    //        nowDate.getSeconds();
    //    var startDate = nowDate.getFullYear() +
    //        "-" +
    //        month1 +
    //        "-" +
    //        nowDate.getDate() +
    //        " " +
    //        nowDate.getHours() +
    //        ":" +
    //        nowDate.getMinutes() +
    //        ":" +
    //        nowDate.getSeconds();
    //    var plaka = selectedPlaka;
    //    var otoStart = 1;

    //    $.ajax({
    //        url: "/Maps/DataTransferBetweenScreens",
    //        type: "POST",
    //        data: {
    //            startDate: startDate,
    //            endDate: endDate,
    //            plaka: plaka,
    //            otoStart: otoStart
    //        },
    //        success: function () {
    //            window.open("http://hatay.abys-web.com//Maps/raporAracSonKonumBilgileri_tarihBazinda", "_blank");
    //        },
    //        complete: function () {
    //        }
    //    });
    //}

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
                if (jQuery.inArray(liveTrackingResults[i].Plate, selectedPlates.split(",")) === -1)
                    continue;
            } else continue;
            ControlPageItems();
            // get the marker icon corresponding with the vehicle status
            //var tmpImageUrl = getImgURLFromColor(liveTrackingResults[i].renk);
            // call marker creation function and add marker to the global Array
            var markerName = liveTrackingResults[i].Plate;
            var markerItem = CreateMarker(map,
                liveTrackingResults[i].Latitude,
                liveTrackingResults[i].Longitude,
                GetIconColor("00FF00"),
                markerName,
                CreateMarkerInfoContent(liveTrackingResults[i]),
                markers.length, liveTrackingResults[i].Plate);
            markers.push({
                Plate: liveTrackingResults[i].Plate,
                marker: markerItem
            });

            //SetMarkerRotation(markerItem, liveTrackingResults[i].yon, GetIconColor(liveTrackingResults[i].renk));
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
                if (jQuery.inArray(liveTrackingResults[i].Plate, selectedPlates.split(",")) === -1)
                    continue;
            }
            try {
                // get the existing marker object for this vehicle
                var currntMarkerId = getMarkerByPlaka(liveTrackingResults[i].Plate);
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
                    liveTrackingResults[i].Plate.toString();
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
                        markers.length, liveTrackingResults[i].Plate);
                    // add the new marker to the markers array
                    SetMarkerRotation(tmpMarker, liveTrackingResults[i].yon, GetIconColor(liveTrackingResults[i].renk));
                    markers.push({
                        Plate: liveTrackingResults[i].Plate,
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
        tmp = markerData.Date;
        tmp = tmp.replace("/Date(", "");
        tmp = tmp.replace(")/", "");
        var content = "";
        return content;
    }

    function updateAngles() {
        try {
            clearInterval(angleCorrectionTimer);
        } catch (ex) {
        }
        try {
            for (var i = 0; i < liveTrackingResults.length; i++) {
                if (selectedPlates) {
                    if (jQuery.inArray(liveTrackingResults[i].Plate, selectedPlates.split(",")) === -1)
                        continue;
                    var currntMarkerId = getMarkerByPlaka(liveTrackingResults[i].Plate);
                    var currntMarker = markers[currntMarkerId].marker;
                    SetMarkerRotation(currntMarker, liveTrackingResults[i].yon, GetIconColor(liveTrackingResults[i].renk));
                }
            }
        } catch (e) {

        }
    }
    // return the marker object of the specified plate
    function getMarkerByPlaka(Plate) {
        // loop global array and return the marker object of this plate
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].Plate === Plate) {
                return i;
            }
        }
        return null;
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
        if (RouteStationMarkers.length > 0 || markers.length > 0) {
            if ($("#btnClearMap").hasClass("display-none")) $("#btnClearMap").removeClass("display-none");
        } else if (RouteStationMarkers.length === 0 &&  markers.length === 0) {
            $("#btnClearMap").addClass("display-none");
        }
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
        $("#gridContainer").dxDataGrid({
            dataSource: {
                store: {
                    data: liveDataForGrid,
                    type: 'array',
                    key: 'Plate'
                }
            },
            columns: [
                {
                    dataField: "DeviceId",
                    caption: "Device Id",
                    alignment: "left",
                    height: 35
                },
                {
                    dataField: "Plate",
                    caption: "Plate"
                },
                {
                    dataField: "Latitude",
                    caption: "Latitude"
                },
                {
                    dataField: "Longitude",
                    caption: "Longitude"
                },
                {
                    dataField: "Speed",
                    caption: "Speed",
                    alignment: "left"
                },
                {
                    dataField: "Date",
                    caption: "Date",
                    dataType: "datetime",
                    format: "yyyy-MM-dd HH:mm:ss"
                }
            ],
            selection: {
                mode: "multiple",
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
                fileName: "Vehicle Last Location Records",
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
                allData.push({ Plate: dataArray[i].Plate, hatKodu: dataArray[i].hatKodu });
            }
        }
    }

    function GetPlateRoute(plate) {
        var mRouteCode = "";
        if (allData !== null && allData !== undefined && allData !== null) {
            for (var i = 0; i < allData.length; i++) {
                if (allData[i].Plate === plate) {
                    //mRouteCode = allData[i].hatKodu;
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
} catch (e) {
    loadPanel.hide();
    toastr["error"](window.resError, "");
}
