try {
    $(document).ready(function () {
        $(document).keyup(function (e) {
            if (e.keyCode === 27) {
                $("#dvMap").css("position", 'relative').
                    css('top', 0).
                    css("height", 600);
                google.maps.event.trigger(map, 'resize');
            }
        });
    });
    $("#fullScreenButton").click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        $("#dvMap").css("position", 'fixed').
            css('top', 42).
            css('left', 0).
            css("width", '100%').
            css("height", '100%').css("z-index", 1000);
        google.maps.event.trigger(map, 'resize');
    });
    $('#btnBack').click(function (e) {
        $('#mapDiv').hide();
        $('#initialDiv').show();
    });
    window.onload = function () {
        var map, heatmap, data;
        $('#loading-image').hide();
        $("#btnQuery").click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            $('#loading-image').show();
            var startDateTime = GetStartDateTime();
            var endDateTime = GetEndDateTime();
            var routes = GetRoutes();
            $.ajax({
                url: "/HeatMap/GetSignalQuarity",
                type: 'POST',
                data: {
                    startDate: startDateTime,
                    endDate: endDateTime,
                    routes: routes
                },
                success: function (res) {
                    if (res === "[]") {
                        toastr["error"]("No Data", "Error");
                    }
                    if (res !== "" && res !== "[]") {
                        resArray = JSON.parse(res);
                        if (resArray.length > 0) {
                            var myLatlng = new google.maps.LatLng(resArray[0]["Latitude"], resArray[0]["Longitude"]);
                            // define map properties
                            var myOptions = {
                                zoom: 20,
                                center: myLatlng,
                                mapTypeId: google.maps.MapTypeId.ROADMAP,
                                labelClass: "my_label", // the CSS class for the label
                                disableDefaultUI: true,
                                scrollwheel: true,
                                draggable: true,
                                navigationControl: true,
                                mapTypeControl: false,
                                scaleControl: true,
                                disableDoubleClickZoom: false
                            };
                            //var map = new google.maps.Map(document.getElementById("dvMap"), myOptions);

                            map = new google.maps.Map(document.getElementById("dvMap"), {
                                zoom: 14,
                                center: new google.maps.LatLng((resArray[0])["Latitude"], (resArray[0])["Longitude"]),
                                mapTypeId: google.maps.MapTypeId.ROADMAP,
                                styles: [{
                                    stylers: [{ saturation: -100 }]
                                }, {
                                    featureType: 'poi.park',
                                    stylers: [{ visibility: 'off' }]
                                }],
                                disableDefaultUI: true
                            });
                            data = new google.maps.MVCArray();
                            for (var i = 0; i < resArray.length; i++) {

                                data.push(new google.maps.LatLng(resArray[i]["Latitude"], resArray[i]["Longitude"]));

                            }
                            heatmap = new google.maps.visualization.HeatmapLayer({
                                map: map,
                                data: data,
                                radius: 28,
                                opacity: 0.5,
                                dissipate: false,
                                maxIntensity: 4,
                                gradient: [
                                    'rgba(0, 255, 255, 0)',
                                    'rgba(0, 255, 255, 1)',
                                    'rgba(0, 191, 255, 1)',
                                    'rgba(0, 127, 255, 1)',
                                    'rgba(0, 63, 255, 1)',
                                    'rgba(0, 0, 255, 1)',
                                    'rgba(0, 0, 223, 1)',
                                    'rgba(0, 0, 191, 1)',
                                    'rgba(0, 0, 159, 1)',
                                    'rgba(0, 0, 127, 1)',
                                    'rgba(63, 0, 91, 1)',
                                    'rgba(127, 0, 63, 1)',
                                    'rgba(191, 0, 31, 1)',
                                    'rgba(255, 0, 0, 1)'
                                ]
                            });
                            heatmap.setMap(map);
                            for (i = 0; i < resArray.length; i++) {
                                if ((resArray[i])[0] !== '0') {
                                    var homeLatLng = new google.maps.LatLng(resArray[i]["Latitude"], resArray[i]["Longitude"]);
                                    var marker = new MarkerWithLabel({
                                        position: homeLatLng,
                                        map: map,
                                        icon: 'marker.png',
                                        draggable: false,
                                        raiseOnDrag: true,
                                        labelContent: resArray[i]["SignalQuality"],
                                        labelAnchor: new google.maps.Point(3, 30),
                                        labelClass: "label2",
                                        labelInBackground: false,
                                        labelClass: "my_label"
                                    });
                                }
                            }
                        }

                        else {
                            DataVarBool = false;
                            ErrorVarBool = false;
                        }
                    }
                    else {
                        DataVarBool = false;
                        ErrorVarBool = false;
                    }
                },
                complete: function () {
                    $('#loading-image').hide();

                    $('#mapDiv').show();
                }
            });

        });
    };
}
catch (e) { toastr["error"](selectLine, "Error"); }