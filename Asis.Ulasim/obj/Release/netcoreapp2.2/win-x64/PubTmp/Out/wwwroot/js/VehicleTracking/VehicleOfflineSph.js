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
    var quickDrawData = new Array();
    var routeHistoryMarker;
    var lineMarkers = [];
    var markerQuickDrawStart, markerQuickDrawEnd;
    var tempStartDateTime, tempEndDateTime;
    var plates = new Array();
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
        $("#PlatesSelect > span").hide();
        $("#datetimepicker1").datetimepicker();
        $("#plates").selectpicker({
            maxOptions: 1
        });
        $(".bs-actionsbox").hide();
        $("span").filter(".filter-option").text("Plaka Seçiniz...");
        $("#PlatesSelect").removeClass("col-lg-3 col-md-9").addClass("col-md-12");
        $(".page-container").height($("body").height() - $(".header").height());
        $(".page-content").height($(".page-container").height());
        $("#dvMap").height($(".page-content").height() - $("#portlet_offlineTrackingFilter").height());
        InitializeMap();
        map.setOptions({ styles: myMapStyle });
        map.setOptions({ zoom: 12 });
        var centerPoint = new google.maps.LatLng("42.696022", "23.319869");
        map.setCenter(centerPoint);
        $("#polyLineWeight").spinner({ value: 2, min: 2, max: 8 });
        $("#portlet_trackingTools").css("left", ($("body").width() / 2 - $("#portlet_trackingTools").width() / 2) + "px");

        $("#btnQuery").click(function (e) {
            $("#gridContainer").show();
            e.preventDefault();
            startDateTime = GetStartDateTime();
            endDateTime = GetEndDateTime();
            tempStartDateTime = new Date(startDateTime);
            tempEndDateTime = new Date(endDateTime);
            tempFirstRowDt = null, lastRowDt = null;
            bulkBusData = [];
            GridTimeout();
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
        $("#btnDrawMarkerCluster").click(function (e) {
            e.preventDefault();
            if (markerCluster == undefined) return;
            if (clusterFlag === 1) {
                clusterFlag = 0;
                markerCluster.clearMarkers();
                CreateMarkers(clusterData);
                $("#btnDrawMarkerCluster").children("i").removeClass("fa-object-ungroup");
                $("#btnDrawMarkerCluster").children("i").addClass("fa-object-group");
                $("#btnDrawMarkerCluster").html($("#btnDrawMarkerCluster").html().replace(window.resRemoveGroups, window.resCreateGroups));
            } else {
                clusterFlag = 1;
                markerCluster.clearMarkers();
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
                return quickDrawData.length > 0 ? getDateTime2(quickDrawData[0].coreData[num].Date).toLocaleString() : "-";
            },
            onChange: function (data) {
                routeHistoryMarker.setPosition(quickDrawData[0].coords[data.from]);
                $("#vehicleQuickDrawDate").text(getDateTime2(quickDrawData[0].coreData[data.from].Date).toLocaleString());
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
                //allData.push({ plate: dataArray[i].plate, routeCode: dataArray[i].routeCode });
                allData.push({ plate: dataArray[i].plate });

            }
        }
    }
    function GetPlateRoute(Plate) {
        var mRouteCode = "";
        if (allData !== null && allData !== undefined && allData !== null) {
            for (var i = 0; i < allData.length; i++) {
                if (allData[i].Plate === Plate) {
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
            url: "/VehicleOfflineSph/GetVehicleOfflineSph",
            type: "POST",
            data: {
                vehicleId: window.selectedPlates,
                startDate: sd,
                endDate: ed
            },
            success: function (res) {
                if (res !== "" && res !== "[]") {
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
                firstRowDt = Enumerable.From(bulkBusData).OrderBy("$.Date").Take(1).SingleOrDefault(null, "$.Date").Date;
                lastRowDt = Enumerable.From(bulkBusData).OrderByDescending("$.Date").Take(1).SingleOrDefault(null, "$.Date").Date;
                distinctPlates = Enumerable.From(bulkBusData).Distinct("$.plate").Select("$.Plate").ToArray();
                trackingDateTime = firstRowDt;
                var data = [];
                for (var j = 0; j < distinctPlates.length; j++) {
                    var row = Enumerable.From(bulkBusData)
                        .Where(function (i) { return distinctPlates[j] === i.Plate; })
                        .Take(1)
                        .OrderBy(function (o) { return getDateTime2(o.Date) })
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
                    return i.Plate === plateItem && ((new Date(i.Date) >= tempFirstRowDt && new Date(i.Date) < new Date(nextDate))
                        || (new Date(i.Date) >= new Date(previousDate) && new Date(i.Date) < new Date(nextDate)));
                }).OrderBy("$.Date").Take(1).SingleOrDefault(null, "$.Date");
                if (tempRow != null) {
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
            window.toastr["success"]("Done", "Success");
        }
    }
    function GetRow(bulkBusData, Plate) {
        var row = null;
        for (var i = 0; i < bulkBusData.length; i++) {
            if (bulkBusData[i].Plate === Plate) {
                row = bulkBusData[i];
                break;
            }
        }
        return row;
    }
    function CreateMarkers(offlineTrackingResults) {
        var i;
        for (i = 0; i < markers.length; i++) {
            if (markers[i] != undefined)
                markers[i].marker.setMap(null);
        }
        markers = new Array();
        if (markerCluster != undefined)
            markerCluster.clearMarkers();
        for (i = 0; i < offlineTrackingResults.length; i++) {
            if (selectedPlates !== "") {
                if (jQuery.inArray(offlineTrackingResults[i].Plate, selectedPlates.split(",")) === -1)  
                    continue;
            } else continue;
            ControlPageItems();
            var tmpImageUrl = getImgURLFromColor("00FF00");  
            var markerName = offlineTrackingResults[i].Plate.toString(); 
            markers.push({
                Plate: offlineTrackingResults[i].Plate,
                marker: CreateMarker(map, offlineTrackingResults[i].Latitude, offlineTrackingResults[i].Longitude, tmpImageUrl, markerName, CreateMarkerInfoContent(offlineTrackingResults[i]), markers.length) 
            });
            markers[markers.length - 1].marker.setMap(map);
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
        $("#loading-image").hide();
    }
    function UpdateMarkers(liveTrackingResults) {
        for (var i = 0; i < liveTrackingResults.length; i++) {
            if (selectedPlates != undefined) {
                if (jQuery.inArray(liveTrackingResults[i].Plate, selectedPlates.split(",")) === -1) 
                    continue;
            }
            try {
                var currntMarkerId = getMarkerByPlaka(liveTrackingResults[i].Plate);
                var tmpImageUrl = getImgURLFromColor("00FF00");
                var markerName = liveTrackingResults[i].Plate.toString();
                if (currntMarkerId != undefined) {
                    var currntMarker = markers[currntMarkerId].marker;
                    var tmp;
                    tmp = liveTrackingResults[i].Date;
                    tmpDate = new Date(tmp);
                    currntMarker.setPosition(new google.maps.LatLng(liveTrackingResults[i].Latitude, liveTrackingResults[i].Longitude));
                    //$("#markerImage_" + currntMarkerId).rotate(liveTrackingResults[i].direction + 180); 
                    currntMarker.labelContent = "<div><img id=\"markerImage_" + currntMarkerId + "\" data-markerid=\"" + currntMarkerId + "\" src=\"../content/" + tmpImageUrl + "\" style=\"width:20px;height:20px\"/><p id=\"markerText_" + currntMarkerId + "\" style=\"text-align:center;color:black;z-index:100\">" + markerName + "</p></div>";
                    currntMarker.infoWindow.setContent(CreateMarkerInfoContent(liveTrackingResults[i]));
                    currentMarkerGlobal = currntMarker;
                } else {
                    var tmpMarker = CreateMarker(map, liveTrackingResults[i].Latitude, liveTrackingResults[i].Longitude, tmpImageUrl, markerName, CreateMarkerInfoContent(liveTrackingResults[i]), markers.length);  
                    markers.push({
                        Plate: liveTrackingResults[i].Plate, 
                        marker: tmpMarker
                    });
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
        if (clusterFlag === 1) {
            if (selectedPlates.split(",").length > 1) {
                markerCluster.repaint();
                $("#loading-image").hide();
            }
        }
    }
    function CreateMarkerInfoContent(markerData) {
        var tmp;
        tmp = markerData.tarih;
        var content = "<div class='iw-container' id='" + markerData.Plate.replace(/ /g, "-") + "'><div class='iw-title'><b>" + window.resPlate + ":</b> " + markerData.Plate + "</div>" +
            "<div class='iw-content'>" +
            "<table class='table table-bordered table-striped'>" +
            "<tr><td width='50%'><b>" + window.resSpeed + ":</b></td><td>" + markerData.Speed + "</td></tr>" +
            (markerData.Latitude ? "<tr><td width='50%'><b>" + window.resLatitude + ":</b></td><td>" + markerData.Latitude + "</td></tr>" : "") +
            (markerData.Longitude ? "<tr><td width='50%'><b>" + window.resLongitude + ":</b></td><td>" + markerData.Longitude + "</td></tr>" : "") +
            (markerData.tmp ? "<tr><td width='50%'><b>" + window.resUpdateDate + ":</b></td><td>" + (new Date(Number(tmp))).toLocaleString() + "</td></tr>" : "") +
            "</table></div></div>";
        return content;
    }
    function CreateMarker(map, lat, long, markerImageUrl, markerLabelText, infoWindowContent, markerId) {
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
            google.maps.event.addListener(tmpMarker, "click", function () {
                this.infoWindow.open(map, this);
                selectedPlaka = markers[parseInt(this.label.eventDiv_.children[0].children[0].id.replace("markerImage_", ""))].Plate;
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
    function GetDevxDateTime(elem) { //??gelen dataya göre değiştir all
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
        if (RouteStationMarkers.length > 0 || markers.length > 0) {
            if ($("#btnClearMap").hasClass("display-none")) $("#btnClearMap").show();
        } else if (RouteStationMarkers.length === 0 && markers.length === 0) {
            $("#btnClearMap").show("");
        }
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
    function getMarkerByPlaka(Plate) {
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].Plate === Plate) {
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
        var plate = window.selectedPlates;
        var vehicleId = plate.replace(",", "");
        $.ajax({
            url: "/VehicleOfflineSph/GetVehicleOfflineSph",
            type: "POST",
            data: {
                vehicleId: vehicleId,
                startDate: sd,
                endDate: ed
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
                firstRowDt = Enumerable.From(bulkBusData).OrderBy("$.Date").Take(1).SingleOrDefault(null, "$.Date").Date;
                lastRowDt = Enumerable.From(bulkBusData).OrderByDescending("$.Date").Take(1).SingleOrDefault(null, "$.Date").Date;
                distinctPlates = Enumerable.From(bulkBusData).Distinct("$.Plate").Select("$.Plate").ToArray();
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

