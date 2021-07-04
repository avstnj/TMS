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
    var flightPath;
    var currntMarker;
    var myTimer1;



    try {
        tmpMapRouteString = JSON.parse(document.getElementById("mapSavedRoutHiddenField").value);
        loadPoly(tmpMapRouteString);
    } catch (exception) {
    }
    function InitializeInnerMap() {

        _directionsRenderer = new google.maps.DirectionsRenderer();

        var myOptions = {
            zoom: 15,
            center: new google.maps.LatLng(40.1264583, 30.2757556),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById("dvMap"), myOptions);

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
    function InitializePage() {
        Math.degrees = function (radians) {
            return radians * 180 / Math.PI;
        };
        getBusRouteHitory();


        $("#drawPolyButton").click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            makeFullScreen();
        });

        $("#startTrackingButton").click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            $("#navigationDiv").show();
            $("#loading-image").show();
            getBusRouteHitory();
        });

        $("#pauseTrackingButton").click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            pausMonitoring();
        });

        $("#resumeTrackingButton").click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            resumeMonitoring();
        });
        $("#stopTrackingButton").click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            stopMonitoring();
        });
    }


    function getBusRouteHitory() {
        loadNextTrack();
    }

    function loadNextTrack() {

        var StartDate = new Date(Date.parse(window.firstDate));
        StartDate = new Date(StartDate.getTime() - (1000 * 30*2));
        StartDate = StartDate.getFullYear() + "/" + (StartDate.getMonth()+1) + "/" + StartDate.getDate() + " " + StartDate.getHours()
            + ":" + StartDate.getMinutes() + ":" + StartDate.getSeconds();
        var EndDate = new Date(Date.parse(window.lastDate));
        EndDate = new Date(EndDate.getTime() + (1000 * 30*2));
        EndDate = EndDate.getFullYear() + "/" + (EndDate.getMonth()+1) + "/" + EndDate.getDate() + " " + EndDate.getHours()
            + ":" + EndDate.getMinutes() + ":" + EndDate.getSeconds();
       
        var tram = window.plaka;

        if (Number(StartDate) > Number(EndDate)) {
            toastr["error"]("Başlangıç Tarihi Bitiş Tarihinden büyük olamaz");
        }
          
        $("#loadingImageDiv").show();
        currntMarker = undefined;
        $.ajax({
            url: "/VehicleSpeed/GetBusLocationHistory",
            type: "POST",
            data: {
                palkaKoduListe: tram,
                firstDate: StartDate,
                lastDate: EndDate
            },
            dataType:"json",
            success: function (res) {
                if (res !== "") {
                    busRouteHistory = new Array();
                    window.busRouteHistory = res;
                    if (window.busRouteHistory == undefined || window.busRouteHistory.length == 0)
                        return;
                    var tmp = busRouteHistory[0].tarih.toString();
                    trackingDateTime = new Date(tmp);
                    trackingDateTime.setSeconds(trackingDateTime.getSeconds() - 1);
                    trackingStartDateTime = new Date(trackingDateTime.getFullYear(), trackingDateTime.getMonth(), trackingDateTime.getDate(), trackingDateTime.getHours(), trackingDateTime.getMinutes(), trackingDateTime.getSeconds(), trackingDateTime.getMilliseconds());
                    tmp = busRouteHistory[busRouteHistory.length - 1].tarih.toString();
                    var tmpDate = new Date(tmp);
                    trackingEndDateTime = tmpDate;
                }
                else {
                    //alert(ErrorVar);
                    toastr["warning"]("Data Yok");
                }
            },
            complete: function () {
                startTrackingForFirstCall();
            }
        });
    }

    function startTrackingForFirstCall() {
        finnishFlag = false;
        $("#loading-image").hide();
        var noData = true;
        if (window.busRouteHistory != undefined && window.busRouteHistory.length != 0) {
            noData = false;
        }
        if (noData) {
            $("#navigationDiv").hide();
            toastr["warning"]("Veri Bulunamadı");
            clearInterval(myTimer);
            return false;
        }
        if (busRouteHistory.length == 1) {
            toastr["warning"]("Veri Bulunamadı");
            clearInterval(myTimer);
            return false;
        }
        clearInterval(this.myTimer);
        myTimer = setInterval(function () { trackForFirstCall() }, interval);
       
        currentState = "Running";
        $("#contentDiv").show();
        createHTMLTable();
        try { map.set("center", new google.maps.LatLng(busRouteHistory[0].enlem, busRouteHistory[0].boylam)); }
        catch (ex) { }
    }

    function startTracking() {
        finnishFlag = false;
        $("#loading-image").hide();
        var noData = true;
        if (window.busRouteHistory != undefined && window.busRouteHistory.length != 0) {
            noData = false;
        }
        if (noData) {
            $("#navigationDiv").hide();
            alert(DataYok);
            return;
        }
        //interval = $("#slider").slider("values", 0);
        myTimer = setInterval(function () { track() }, interval);
        
        currentState = "Running";
        //$("#playSlider").slider("option", "max", trackingEndDateTime.getTime());
        //$("#playSlider").slider("option", "min", trackingStartDateTime.getTime());
        $("#contentDiv").show();
        createHTMLTable();
        try { map.set("center", new google.maps.LatLng(busRouteHistory[0].enlem, busRouteHistory[0].boylam)); }
        catch (ex) { }
    }

    function restartTracking() {
        finnishFlag = false;
        trackingDateTime = new Date(trackingStartDateTime.getFullYear(), trackingStartDateTime.getMonth(), trackingStartDateTime.getDate(), trackingStartDateTime.getHours(), trackingStartDateTime.getMinutes(), trackingStartDateTime.getSeconds(), trackingStartDateTime.getMilliseconds());
        myTimer = setInterval(function () { track() }, interval);
        currentState = "Running";
        try { map.set("center", new google.maps.LatLng(busRouteHistory[0].enlem, busRouteHistory[0].boylam)); }
        catch (ex) { }
    }

    function createHTMLTable() {
        if (window.busRouteHistory == undefined)
            return;
        if (window.busRouteHistory.length === 0)
            return;
        var html = "<tr id=\"tableRow_" + "\">";
        html += "<td id=\"validaterNo_" + "\">" + window.busRouteHistory[0].validatorNo + "</td>";
        html += "<td id=\"plakaKodu_" + "\">" + window.busRouteHistory[0].plaka + "</td>";
        var tmp = window.busRouteHistory[0].tarih.toString();
        var tmpDate = new Date(tmp);
        html += "<td id=\"time_" + "\">" + tmpDate.toLocaleString() + "</td>";
        //html += "<td id=\"address_" + "\">&nbsp;</td>";  adres boş geldiğinden talep doğrultusunda kapattım
        html = html + "</tr>";
        $("#tblBody").html(html);
        $("#address_").hide();
    }

    function trackForFirstCall() { // Sayfa açılırken biten takip popup ının açılmasını istemiyollar. İstersen kaldır!!!
        var tmp = trackingDateTime.getMilliseconds();
        trackingDateTime.setMilliseconds(tmp + 1000);
        document.getElementById("CurrentTimeTD").innerHTML = trackingDateTime.toLocaleString();//TODO Bakılacak!!!
        //$("#playSlider").slider("option", "value", trackingDateTime.getTime());


        var flightPlanCoordinates = [];
        var tmpDate;
        for (var i = 0; i < busRouteHistory.length; i++) {

            flightPlanCoordinates.push({ lat: busRouteHistory[i].enlem, lng: busRouteHistory[i].boylam });


            finnishFlag = false;
            if (i === busRouteHistory.length - 1) {
                finnishFlag = true;                    
                   // toastr["success"]("Biten Takip");
                    swal({
                        title: 'Biten Takip!',
                        text: "Takip tamamlanmıştır !",
                        type: 'info',
                        confirmButtonText: 'Tamam'
                });  
                clearInterval(this.myTimer);
                    //$("#playSlider").slider("enable");
                currentState = "Stopped";
                return false;
                
            } else {
                tmpDate = new Date(busRouteHistory[i].tarih.toString());
                if (tmpDate > trackingDateTime) {

                    tmpCurrentInfoWindowContent = "<table class=\"table table-bordered\" style=\"height: 100px;\">" +
                        "<thead><tr><th>" + gPlaka + "</th>" +
                        "<th>" + trackingDate + "</th>" +
                        "<th>Hız</th>" +
                        "</tr></thead>" +
                        "<tbody><tr><td>" + busRouteHistory[i].plaka + "</td>" +
                        "<td>" + (tmpDate.toLocaleString()) + "</td>" +
                        "<td>" + busRouteHistory[i].hiz +"</td></tr></table>";
                    var tmpImageUrl = "";
                    var tmpIconColor = "";
                    switch (busRouteHistory[i].renk) {
                        case "00FF00": //green
                            tmpImageUrl = "../../image/vehicleImg/icon/green_bus_croped_16_20.png";
                            tmpIconColor = "green";
                            break;
                        case "FF0000": //red
                            tmpImageUrl = "../../image/vehicleImg/icon/red_bus_croped_16_20.png";
                            tmpIconColor = "red";
                            break;
                        case "FFFF00": //yellow
                            tmpImageUrl = "../../image/vehicleImg/icon/yellow_bus_croped_16_20.png";
                            tmpIconColor = "yellow";
                            break;
                        case "A9A9A9": //grey
                            tmpImageUrl = "../../image/vehicleImg/icon/grey_bus_croped_16_20.png";
                            tmpIconColor = "grey";
                            break;
                        default:
                            break;
                    }

                    var tmpPlaka = busRouteHistory[i].plaka;

                    if (currntMarker != undefined) {
                        var centerPoint = new google.maps.LatLng(busRouteHistory[i].enlem, busRouteHistory[i].boylam);
                        currntMarker.setPosition(centerPoint);

                        map.setCenter(centerPoint);
                        currntMarker.labelContent = "</p><img id=\"markerImage_Main\" src=\"" +
                            tmpImageUrl +
                            "\" style=\"position:relative\"/>";
                    /*$("#markerImage_Main").rotate(busRouteHistory[i].yon + 180)*/;
                        currntMarker.infoWindow.setContent(tmpCurrentInfoWindowContent);

                        if (markers.length > 0) {
                            $("#markerImage_" + (markers.length - 1).toString()).rotate(busRouteHistory[i].yon + 180);
                        }

                        var tmpAngl;
                        if (markers.length > 0) {
                            tmpAngl = bearing(markers[markers.length - 1].marker.position, centerPoint);
                        } else {
                            tmpAngl = busRouteHistory[i].yon + 180;
                        }



                        //var flightPath = new google.maps.Polyline({

                        //    path: flightPlanCoordinates,
                        //    strokeColor: '#FF0000',
                        //    strokeWeight: 2
                        //});


                        markers.push({
                            plaka: tmpPlaka,
                            marker: new MarkerWithLabel({
                                position: new google.maps.LatLng(busRouteHistory[i].enlem, busRouteHistory[i].boylam),
                                map: map,
                                //labelAnchor: new google.maps.Point(16, 20),
                                //labelContent: '<img id="markerImage_' + (markers.length).toString() + '" src="' + tmpImageUrl + '" style="position:relative"/>',
                                //icon: '../../Content/transparent_icon_8.png',
                                icon: {
                                    path: google.maps.SymbolPath.CIRCLE,
                                    rotation: tmpAngl,//TODO
                                    fillColor: tmpIconColor,
                                    fillOpacity: 0.5,
                                    scale: 3,
                                    strokeColor: tmpIconColor,
                                    strokeWeight: 1
                                },
                                infoWindow: new google.maps.InfoWindow({
                                    content: tmpCurrentInfoWindowContent,
                                    pixelOffset: new google.maps.Size(0, -16)
                                })
                            })
                        });


                        flightPath = new google.maps.Polyline({
                            path: flightPlanCoordinates,
                            strokeColor: '#FF0000',
                            strokeWeight: 2
                        });
                        flightPath.setMap(map);

                        google.maps.event.addListener(markers[markers.length - 1].marker,
                            "click",
                            function () {
                                this.infoWindow.open(map, this);
                            });
                    } else {
                        var tmpPlaka = busRouteHistory[i].plaka;

                        var infoPopup = new google.maps.InfoWindow({
                            content: tmpCurrentInfoWindowContent,
                            pixelOffset: new google.maps.Size(0, -16)
                        });
                        currntMarker = new MarkerWithLabel({
                            position: new google.maps.LatLng(busRouteHistory[i].enlem, busRouteHistory[i].boylam),
                            map: map,
                            labelAnchor: new google.maps.Point(8, 10),
                            labelContent: "<img id=\"markerImage_Main\" src=\"" +
                                tmpImageUrl +
                                "\" style=\"position:relative\"/>",
                            icon: "../image/transparent_icon_8.png",
                            infoWindow: infoPopup
                        });
                        infoPopup.open(map, currntMarker);

                        google.maps.event.addListener(currntMarker,
                            "click",
                            function () {
                                this.infoWindow.open(map, this);
                            });
                    }

                    break;
                }
            }           
        }
    }

    function track() {
        var tmp = trackingDateTime.getMilliseconds();
        trackingDateTime.setMilliseconds(tmp + 1000);
        document.getElementById("CurrentTimeTD").innerHTML = trackingDateTime.toLocaleString();//TODO Bakılacak
        //$("#playSlider").slider("option", "value", trackingDateTime.getTime());

        var flightPlanCoordinates = [];
        var tmpDate;
        for (var i = 0; i < busRouteHistory.length; i++) {


            flightPlanCoordinates.push({ lat: busRouteHistory[i].enlem, lng: busRouteHistory[i].boylam });


            flightPath = new google.maps.Polyline({
                path: flightPlanCoordinates,
                strokeColor: '#FF0000',
                strokeWeight: 2
            });
            flightPath.setMap(map);

            finnishFlag = false;
            if (i === busRouteHistory.length - 1) {
                finnishFlag = true;
                var allFinnished = true;
                if (allFinnished) {
                    
                    //toastr["success"]("Biten Takip");
                    swal({
                        title: 'Biten Takip!',
                        text: "Takip tamamlanmıştır !",
                        type: 'info',
                        confirmButtonText: 'Tamam'
                    });
                    clearInterval(myTimer);
                    currentState = "Stopped";
                    return false;
                }
                clearInterval(myTimer);
            }
            tmpDate = new Date(busRouteHistory[i].tarih.toString());
            if (tmpDate > trackingDateTime) {

                tmpCurrentInfoWindowContent = "<table class=\"table table-bordered\" style=\"height: 100px;\">" +
                    "<thead><tr><th>" + gPlaka + "</th>" +
                    "<th>" + trackingDate + "</th>" +
                    "<th>Hız</th>" +
                    "</tr></thead>" +
                    "<tbody><tr><td>" + busRouteHistory[i].plaka + "</td>" +
                    "<td>" + (tmpDate.toLocaleString()) + "</td>" +
                    "<td>" + busRouteHistory[i].hiz + "</td></tr></table>";
                var tmpImageUrl = "";
                var tmpIconColor = "";
                switch (busRouteHistory[i].renk) {
                    case "00FF00": //green
                        tmpImageUrl = "../../image/vehicleImg/icon/green_bus_croped_16_20.png";
                        tmpIconColor = "green";
                        break;
                    case "FF0000": //red
                        tmpImageUrl = "../../image/vehicleImg/icon/red_bus_croped_16_20.png";
                        tmpIconColor = "red";
                        break;
                    case "FFFF00": //yellow
                        tmpImageUrl = "../../image/vehicleImg/icon/yellow_bus_croped_16_20.png";
                        tmpIconColor = "yellow";
                        break;
                    case "A9A9A9": //grey
                        tmpImageUrl = "../../image/vehicleImg/icon/grey_bus_croped_16_20.png";
                        tmpIconColor = "grey";
                        break;
                    default:
                        break;
                }

                var tmpPlaka = busRouteHistory[i].plaka;

                if (currntMarker != undefined) {
                    var centerPoint = new google.maps.LatLng(busRouteHistory[i].enlem, busRouteHistory[i].boylam);
                    currntMarker.setPosition(centerPoint);

                    map.setCenter(centerPoint);
                    currntMarker.labelContent = "</p><img id=\"markerImage_Main\" src=\"" +
                        tmpImageUrl +
                        "\" style=\"position:relative\"/>";
                    /*$("#markerImage_Main").rotate(busRouteHistory[i].yon + 180)*/;//TODO
                    currntMarker.infoWindow.setContent(tmpCurrentInfoWindowContent);

                    if (markers.length > 0) {
                        $("#markerImage_" + (markers.length - 1).toString()).rotate(busRouteHistory[i].yon + 180);
                    }

                    var tmpAngl;
                    if (markers.length > 0) {
                        tmpAngl = bearing(markers[markers.length - 1].marker.position, centerPoint);
                    } else {
                        tmpAngl = busRouteHistory[i].yon + 180;
                    }


                    markers.push({
                        plaka: tmpPlaka,
                        marker: new MarkerWithLabel({
                            position: new google.maps.LatLng(busRouteHistory[i].enlem, busRouteHistory[i].boylam),
                            map: map,
                            //labelAnchor: new google.maps.Point(16, 20),
                            //labelContent: '<img id="markerImage_' + (markers.length).toString() + '" src="' + tmpImageUrl + '" style="position:relative"/>',
                            //icon: '../../Content/transparent_icon_8.png',
                            icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                rotation: tmpAngl,//TODO
                                fillColor: tmpIconColor,
                                fillOpacity: 0.5,
                                scale: 3,
                                strokeColor: tmpIconColor,
                                strokeWeight: 1
                            },
                            infoWindow: new google.maps.InfoWindow({
                                content: tmpCurrentInfoWindowContent,
                                pixelOffset: new google.maps.Size(0, -16)
                            })
                        })
                    });


                    

                    google.maps.event.addListener(markers[markers.length - 1].marker,
                        "click",
                        function () {
                            this.infoWindow.open(map, this);
                        });
                } else {
                    var tmpPlaka = busRouteHistory[i].plaka;

                    currntMarker = new MarkerWithLabel({
                        position: new google.maps.LatLng(busRouteHistory[i].enlem, busRouteHistory[i].boylam),
                        map: map,
                        labelAnchor: new google.maps.Point(8, 10),
                        labelContent: "<img id=\"markerImage_Main\" src=\"" +
                            tmpImageUrl +
                            "\" style=\"position:relative\"/>",
                        icon: "../image/transparent_icon_8.png",
                        infoWindow: new google.maps.InfoWindow({
                            content: tmpCurrentInfoWindowContent,
                            pixelOffset: new google.maps.Size(0, -16)
                        })
                    });

                    google.maps.event.addListener(currntMarker,
                        "click",
                        function () {
                            this.infoWindow.open(map, this);
                        });
                }

                break;
            }
        }
    }

    function bearing(from, to) {
        // Convert to radians.
        var lat1 = from.lat();
        var lon1 = from.lng();
        var lat2 = to.lat();
        var lon2 = to.lng();
        // Compute the angle.
        var angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2));
        if (angle < 0.0)
            angle += Math.PI * 2.0;
        if (angle === 0) { angle = 1.5; }
        return Math.degrees(angle) + 180;
    }
    function pausMonitoring() {
        clearInterval(myTimer);
        currentState = "Paused";
        //$("#playSlider").slider("enable");
        loadedAddresses = 0;
        //$("#addressHeader").show();
        $("#address_").show();
    }

    function resumeMonitoring() {
        if (currentState === "Paused") {
            myTimer = setInterval(function () { track(); }, interval);
            currentState = "Running";
            //$("#playSlider").slider("disable");

            $("#addressHeader").hide();

            $("#address_").hide();
        } else if (currentState === "Stopped") {
            restartTracking();
        }
    }

    function stopMonitoring() {
        clearInterval(myTimer);
        currentState = "Stopped";
        trackingDateTime = new Date(busRouteHistory[0].tarih.toString());
        //$("#playSlider").slider("option", "value", trackingDateTime.getTime());

        flightPath.setMap(null);
        if (currntMarker != null) {
            currntMarker.setMap(null);
        }
      
        currntMarker = undefined;
        for (var i = 0; i < markers.length; i++) {
            markers[i].marker.setMap(null);
        }
        markers = new Array();

        for (var i = 0; i < markersD.length; i++) {
            markersD[i].marker.setMap(null);
        }
        markersD = new Array();

    }

    function loadNextAddress() {
        var tmpDate, address;
        for (var i = 0; i < busRouteHistory.length; i++) {
            tmpDate = new Date(Number(busRouteHistory[i].tarih.toString()));
            if (tmpDate > trackingDateTime) {
                var tmpLatLng = new google.maps.LatLng(window.busRouteHistory[i].enlem, window.busRouteHistory[i].boylam);
                geocoder.geocode({
                    "latLng": tmpLatLng
                }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        address = results[0].formatted_address;
                        document.getElementById("address_" + loadedAddresses.toString()).innerHTML = address;
                    }
                    else {
                        address = "&nbsp;";
                    }
                    return;
                });
                break;
            }
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

    function setInitialBeginAndEndDate() {
        var tmpNow = new Date();
        var tmpStartDate = new Date(tmpNow.getYear, tmpNow.getMonth, tmpNow.getDay, 00, 00, 00, 00);
        var tmpEndDate = new Date(tmpNow.getYear, tmpNow.getMonth, tmpNow.getDay, 23, 59, 59, 999);
        jQuery("#StartDatetimepicker").datetimepicker({ startDate: tmpStartDate });
        jQuery("#endDatetimepicker").datetimepicker({ startDate: tmpEndDate });
        $("#StartDatetimepicker").datetimepicker({
            value: tmpStartDate
        });
    }

    function addBallons() {
        clearInterval(addBallonsTimer);
        for (var i = 0; i < duraklarListe.length; i++) {
            $("#markerImageD_" + duraklarListe[i].durakId.toString()).balloon({
                contents: "<p>" + duraklarListe[i].aciklama + "</p>"
            });
        }
    }

    function hideBusStops() {
        for (var i = 0; i < markersD.length; i++) {
            markersD[i].setMap(null);
        }
        markersD = new Array();
    }

    $("#drawPolyButton").click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        makeFullScreen();
    });

    $("#startTrackingButton").click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        $("#navigationDiv").show();
        $("#loading-image").show();
        getBusRouteHitory();
    });

    $("#pauseTrackingButton").click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        pausMonitoring();
    });

    $("#resumeTrackingButton").click(function (e) {
        e.preventDefault();
        e.stopPropagation();  
        resumeMonitoring();
    });
    $("#stopTrackingButton").click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        stopMonitoring();
    });

    function clearMap() {
        try {
            if (flightPath) 
            flightPath.setMap(null);
            if (currntMarker != null) {
                currntMarker.setMap(null);
                currntMarker = undefined;
            }
            for (var i = 0; i < markers.length; i++) {
                markers[i].marker.setMap(null);
            }
            markers = new Array();
            for (var i = 0; i < markersD.length; i++) {
                markersD[i].marker.setMap(null);
            }
            markersD = new Array();
        } catch (e) {
        }
        try {
            InitializeInnerMap();
            $("#stopTrackingButton").trigger("click");
            $("#allContentDiv").hide();
        } catch (e) {

        } 
    }

} catch (e) {
    alert(ErrorVar);
}