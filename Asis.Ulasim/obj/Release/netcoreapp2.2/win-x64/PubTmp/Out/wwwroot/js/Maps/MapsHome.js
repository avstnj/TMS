var myMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
    },
    {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#263c3f' }]
    },
    {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#6b9a76' }]
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#38414e' }]
    },
    {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212a37' }]
    },
    {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9ca5b3' }]
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#746855' }]
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1f2835' }]
    },
    {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#f3d19c' }]
    },
    {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }]
    },
    {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#17263c' }]
    },
    {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#515c6d' }]
    },
    {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#17263c' }]
    }
];
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
        cancel: ".m-portlet--sortable-empty", // cancel dragging if portlet is in fullscreen mode
        revert: 250, // animation in milliseconds
        update: function (b, c) {
            if (c.item.prev().hasClass("m-portlet--sortable-empty")) {
                c.item.prev().before(c.item);
            }
        }
    });
    $(".bs-actionsbox").hide();
    $("span").filter(".filter-option").text();
    $(".page-container").height($("body").height() - $(".header").height());
    $(".page-content").height($(".page-container").height());
    $("#dvMap").height($(".page-content").height() - $("#portlet_offlineTrackingFilter").height());
    InitializeMap();
    map.setOptions({ styles: myMapStyle });
    map.setOptions({ zoom: 15 });
    var centerPoint = new google.maps.LatLng(lat, long);
    map.setCenter(centerPoint);
    var trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(map);
    $("#portlet_trackingTools").css("left", ($("body").width() / 2 - $("#portlet_trackingTools").width() / 2) + "px");
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
});