


//You can calculate directions (using a variety of methods of transportation) by using the DirectionsService object.
var directionsService = new google.maps.DirectionsService();

//Define a variable with all map points.
var _mapPoints = new Array();

//Define a DirectionsRenderer variable.
var _directionsRenderer = '';

var map;




//InitializeMap() function is used to initialize google map on page load.
function InitializeMap() {

    //DirectionsRenderer() is a used to render the direction
    _directionsRenderer = new google.maps.DirectionsRenderer();

    //Set the your own options for map.
    var myOptions = {
        zoom: 13,
        center: new google.maps.LatLng(41.1365, 28.4644),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    //Define the map.
    map = new google.maps.Map(document.getElementById("dvMap"), myOptions);

    //Set the map for directionsRenderer
    _directionsRenderer.setMap(map);

    //Set different options for DirectionsRenderer mehtods.
    //draggable option will used to drag the route.
    _directionsRenderer.setOptions({
        draggable: true,
        preserveViewport: true
    });

    //Add an event to route direction. This will fire when the direction is changed.
    google.maps.event.addListener(_directionsRenderer, 'directions_changed', function () {
        computeTotalDistanceforRoute(_directionsRenderer.directions);
    });
}






//getRoutePointsAndWaypoints() will help you to pass points and waypoints to drawRoute() function
function getRoutePointsAndWaypoints() {
    console.log("points from: " + loadedPoints.toString() + " to: " + (loadedPoints - 9).toString() + " Is getRoutePointsAndWaypoints");
    //Define a variable for waypoints.
    var _waypoints = new Array();

    if (_mapPoints.length > 2) //Waypoints will be come.
    {
        for (var j = 1; j < _mapPoints.length - 1; j++) {
            var address = _mapPoints[j];
            if (address !== "") {
                _waypoints.push({
                    location: address,
                    stopover: true  //stopover is used to show marker on map for waypoints
                });
            }
        }
        //Call a drawRoute() function
        drawRoute(_mapPoints[0], _mapPoints[_mapPoints.length - 1], _waypoints);
    } else if (_mapPoints.length > 1) {
        //Call a drawRoute() function only for start and end locations
        drawRoute(_mapPoints[_mapPoints.length - 2], _mapPoints[_mapPoints.length - 1], _waypoints);
    } else {
        //Call a drawRoute() function only for one point as start and end locations.
        drawRoute(_mapPoints[_mapPoints.length - 1], _mapPoints[_mapPoints.length - 1], _waypoints);
    }

}






//drawRoute() will help actual draw the route on map.
function drawRoute(originAddress, destinationAddress, _waypoints) {
    console.log("points from: " + loadedPoints.toString() + " to: " + (loadedPoints - 9).toString() + " Is drawRoute");
    //Define a request variable for route .
    var _request = '';

    //This is for more then two locatins
    if (_waypoints.length > 0) {
        _request = {
            origin: originAddress,
            destination: destinationAddress,
            waypoints: _waypoints, //an array of waypoints
            optimizeWaypoints: true, //set to true if you want google to determine the shortest route or false to use the order specified.
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        };
    } else {
        //This is for one or two locations. Here noway point is used.
        _request = {
            origin: originAddress,
            destination: destinationAddress,
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        };
    }

    //This will take the request and draw the route and return response and status as output
    directionsService.route(_request, function (_response, _status) {
        if (_status == google.maps.DirectionsStatus.OK) {
            _directionsRenderer.setDirections(_response);
        }
    });

}





function drawPreviousRouteSingle(Legs) {
    console.log("points from: " + loadedPoints.toString() + " to: " + (loadedPoints - 9).toString() + " Is drawPreviousRoute");
    polyLinesSingleArray = new Array();
    for (var i = 0; i < Legs.length; i++) {
        var steps = Legs[i].steps;
        for (var j = 0; j < steps.length; j++) {
            var latLng = steps[j].lat_lngs;
            for (var h = 0; h < latLng.length; h++) {
                polyLinesSingleArray.push(latLng[h]);
            }
        }
    }
}


function drawPolySingle() {
    console.log("points from: " + loadedPoints.toString() + " to: " + (loadedPoints - 9).toString() + " Is drawPoly");
    var polyOptions = {
        path: polyLinesSingleArray,
        strokeColor: '#F75C54',
        strokeWeight: 3
    };
    var poly = new google.maps.Polyline(polyOptions);
    polyLinesArray.push(poly);
    poly.setMap(map);

}

function drawRegularPoly() {
    var polyOptions = {
        path: storedMapOneDimention,
        strokeColor: '#00FF00',
        strokeWeight: 3
    };

}

//computeTotalDistanceforRoute() will help you to calculate the total distance and render dynamic html.
function computeTotalDistanceforRoute(_result) {
    console.log("points from: " + loadedPoints.toString() + " to: " + (loadedPoints - 9).toString() + " Is computeTotalDistanceforRoute");
    //Get the route
    var _route = _result.routes[0];

    //Create temporary points variables.
    var _temPoint = new Array();

    _htmlTrCount = 0;
    for (var k = 0; k < _route.legs.length; k++) {
        //START Get the max lenth of steps.
        var lenght = 0;
        if ((_route.legs[k].steps.length) - 1 < 0) {
            var lenght = _route.legs[k].steps.length;
        } else {
            var lenght = _route.legs[k].steps.length - 1;
        }


        if (_route.legs[k].distance.value > 0) //This look is for more then one point i,e after B pionts
        {
            if (k == 0) //If there are only one route with two points.
            {
                _temPoint.push(_route.legs[k].steps[0].start_point); //E.g: A
                _temPoint.push(_route.legs[k].steps[lenght].end_point); //E.g: B
            } else // more routes and more points
            {
                _temPoint.push(_route.legs[k].steps[lenght].end_point); //E.g: C to may
            }
        } else // if distance is zero then it is the first point ie A
        {
            _temPoint.push(_route.legs[k].steps[lenght].start_point); //E.g: A
        }
    }

    //drawPreviousRoute(_route.legs);
    drawPreviousRouteSingle(_route.legs);
    drawPolySingle();
    loadNextPoints();
}

var polyLinesSingleArray = new Array();
var loadedPoints = 0;
var storedMapOneDimention = new Array();
var polyLinesArray = new Array();
var polyLinesArrayOfArrays = new Array();
var loadedPoliesIndex = 0;

function loadMapOneDimention(routePointsString) {
    console.log("Loading Started");
    polyLinesSingleArray = new Array();
    loadedPoints = 0;
    storedMapOneDimention = new Array();
    _mapPoints = new Array();
    //storedMapOneDimention = JSON.parse(localStorage["myMapOneDimention"]);
    try {
        storedMapOneDimention = JSON.parse(routePointsString);
    }
    catch (ex) {
        return;
    }

    if (polyLinesArray.length > 0)
    {
        polyLinesArrayOfArrays[loadedPoliesIndex] = polyLinesArray;
        loadedPoliesIndex++;
    }

    //DirectionsRenderer() is a used to render the direction
    _directionsRenderer = new google.maps.DirectionsRenderer();

    //Set the map for directionsRenderer
    _directionsRenderer.setMap(map);

    //Set different options for DirectionsRenderer mehtods.
    //draggable option will used to drag the route.
    _directionsRenderer.setOptions({
        draggable: true,
        preserveViewport: true
    });

    //Add an event to route direction. This will fire when the direction is changed.
    google.maps.event.addListener(_directionsRenderer, 'directions_changed', function () {
        computeTotalDistanceforRoute(_directionsRenderer.directions);

    });

    for (var i = 0; i < 9; i++) {
        if (loadedPoints < storedMapOneDimention.length) {
            var tmpLat = Number(storedMapOneDimention[loadedPoints].point.k);
            var tmpLng = Number(storedMapOneDimention[loadedPoints].point.A);
            var _currentPoints = new google.maps.LatLng(tmpLat, tmpLng);

            _mapPoints.push(_currentPoints);

            loadedPoints++;
        }
        else {
            break;
        }
    }
    console.log("points from: " + loadedPoints.toString() + " to: " + (loadedPoints - 9).toString() + " Is Loaded");
    map.set('center', new google.maps.LatLng(_mapPoints[0].k, _mapPoints[0].B));
    map.set('zoom', 13);
    getRoutePointsAndWaypoints();
}

function loadNextPoints() {
    console.log("points from: " + loadedPoints.toString() + " to: " + (loadedPoints - 9).toString() + " Is loadNextPoints");
    var lastPoint = _mapPoints[_mapPoints.length - 1];
    _mapPoints = new Array();
    _mapPoints.push(lastPoint);
    _directionsRenderer.setMap(null);
    _directionsRenderer = null;
    _directionsRenderer = new google.maps.DirectionsRenderer();
    _directionsRenderer.setMap(map);
    _directionsRenderer.setOptions({
        draggable: true,
        preserveViewport: true
    });
    google.maps.event.addListener(_directionsRenderer, 'directions_changed', function () {
        computeTotalDistanceforRoute(_directionsRenderer.directions);
    });

    for (var i = 0; i < 9; i++) {
        if (loadedPoints < storedMapOneDimention.length) {
            var tmpLat = Number(storedMapOneDimention[loadedPoints].point.k);
            var tmpLng = Number(storedMapOneDimention[loadedPoints].point.A);
            var _currentPoints = new google.maps.LatLng(tmpLat, tmpLng);

            _mapPoints.push(_currentPoints);

            loadedPoints++;
        }
        else {
            break;
        }
    }
    if (loadedPoints <= storedMapOneDimention.length) {
        getRoutePointsAndWaypoints();
        if (loadedPoints == storedMapOneDimention.length) {
            loadedPoints++;
        }
    }
    //else {
    //    drawPoly();
    //}
}


var startIndex = 0;
var tmpTimer;
var path = new google.maps.MVCArray(), poly;
var sucsessCounter = 0;

function loadPoly(tmpMapRouteString)
{
    try {
        storedMapOneDimention = tmpMapRouteString;
    }
    catch (ex) {
        return;
    }
    poly = new google.maps.Polyline({ map: map });
    tmpTimer = setInterval(function () { load10() }, 1200);

    //for (var i = 0; i < data.length; i++) {
    //    addPoly(data[i]);
    //}
}

function load10() {
    for (var i = 0; i < 10; i++) {
        if (startIndex > storedMapOneDimention.length - 1) {
            clearInterval(tmpTimer);
            return;
        }
        var tmpLat = Number(storedMapOneDimention[startIndex].point.k);
        var tmpLng = Number(storedMapOneDimention[startIndex].point.A);
        var point = new google.maps.LatLng(tmpLat, tmpLng);
        addPoly(point);
        startIndex++;
    }
}

function addPoly(point) {
    if (path.getLength() === 0) {
        path.push(point);
        poly.setPath(path);
    } else {
        directionsService.route({
            origin: path.getAt(path.getLength() - 1),
            destination: point,
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        }, function (result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                for (var i = 0, len = result.routes[0].overview_path.length;
                    i < len; i++) {
                    path.push(result.routes[0].overview_path[i]);
                }
                var polyOptions = {
                    path: path,
                    strokeColor: '#F75C54',
                    strokeWeight: 3
                };
                poly = new google.maps.Polyline(polyOptions);
                poly.setMap(map);
                sucsessCounter++;
                console.log("Success " + sucsessCounter.toString());
            }
        });
    }
}