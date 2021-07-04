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
    var versions;
    var lines = new Array();
    var points = new Array();
    var depots = new Array();
    var newDepot;
    $(document).ready(function () {
        $('.dropdown-menu').attr('style', 'width: 280px !important');
        $(".page-container").height($("body").height() - $(".header").height());
        $(".page-content").height($(".page-container").height());
        $("#dvMap").height($(".page-content").height());
        $("#portlet_buttons").draggable({
            handle: ".portlet-title",
            start: function () {
                $("#select_depot").select2("close");
                if ($("#select_version").data("select2")) $("#select_version").select2("close");
            }
        });
       // $("#ddlDepot").select2();
        InitializeMap();
        map.setOptions({ styles: myMapStyle, mapTypeId: "satellite" });
        var selectedCityCoordinates = getCityCoordinates(cityCode);
        if (selectedCityCoordinates != undefined) {
            var centerPoint = new google.maps.LatLng(selectedCityCoordinates.enlem, selectedCityCoordinates.boylam);
            map.setCenter(centerPoint);
        }
        $.ajax({
            url: "/DepotDefinitions/GetDepots",
            type: "GET",
            success: function (res) {
                if (res !== "" && res !== "[]") {
                    var depotsJson = JSON.parse(res);
                    $.each(depotsJson, function () {
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
                            fillOpacity: 0.35,
                            editable: true
                        });
                        depots.push({
                            
                            depotCode: this.depotCode,
                            polygon: depot,
                            depotId: this.depotId
                        });
                        $("#select_depot").append("<option value=\"" + this.depotCode + "\" data-id=\"" + this.depotId + "\">" + this.depotName + "</option>").val(this.depotCode);
                        $("#select_depot").val("").trigger("change");
                    });
                }
            }
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
        $("#btnSave").click(function () {
            var latLongStr = "";
            var latLongStr2 = "";
            var depotCode = "";
            var depotName = "";
            var firstLatLongStr = "";
            var transaction = $("#btnSave").attr("data-type");
            if (transaction === "update") {
                var selectedDepotId = $("#select_depot").val();
                if (selectedDepotId) {
                    var selectedDepot = Enumerable.From(depots).Where("$.depotCode == '" + selectedDepotId + "'").Select("$.polygon").ToArray()[0];
                    $.each(selectedDepot.getPath().getArray(), function (ind, val) {
                        var jsonData = val.toJSON();
                        if (ind == 0)
                            firstLatLongStr += jsonData.lat + " " + jsonData.lng; 
                        latLongStr += jsonData.lat + " " + jsonData.lng + (ind === selectedDepot.getPath().getArray().length - 1 ? "" : ", ");
                        if (ind === selectedDepot.getPath().getArray().length - 1) 
                            latLongStr += ", " + firstLatLongStr;
                        latLongStr2 += jsonData.lat + " " + jsonData.lng + (ind === selectedDepot.getPath().getArray().length - 1 ? "" : ", ");
                        polygon2 = "POLYGON((" + latLongStr + "))";
                    });
                    depotCode = selectedDepotId;
                    depotName = "";
                }
            } else if (transaction === "new") {
                $.each(newDepot.depot.getPath().getArray(), function (ind, val) {
                    var jsonData = val.toJSON();
                    if (ind == 0)
                        firstLatLongStr += jsonData.lat + " " + jsonData.lng; 
                    latLongStr += jsonData.lat + " " + jsonData.lng + (ind === newDepot.depot.getPath().getArray().length - 1 ? "" : ", ");
                    if (ind === newDepot.depot.getPath().getArray().length - 1)
                        latLongStr += ", " + firstLatLongStr;
                    latLongStr2 += jsonData.lat + " " + jsonData.lng + (ind === newDepot.depot.getPath().getArray().length - 1 ? "" : ", ");
                    polygon2 = "POLYGON((" + latLongStr + "))";
                });
                depotCode = newDepot.depotCode;
                depotName = newDepot.depotName;
            } else return;
            $.ajax({
                url: "/DepotDefinitions/SetData",
                type: "POST",
                data: {
                    depotCode: depotCode,
                    depotName: depotName,
                    polygon: latLongStr,
                    polygon2: polygon2 
                },
                success: function (res) {
                    if (res !== "" & res !== "[]") {
                        var depotsJson = JSON.parse(res);
                        depots = new Array();
                        $("#select_depot").empty();
                        $("#select_depot").append("<option value=\"\">Depo Seçiniz...</option>").val("");
                        if (newDepot) {
                            newDepot.depot.setMap(null);
                        }
                        $.each(depotsJson, function () {
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
                                fillOpacity: 0.35,
                                editable: true
                            });
                            depots.push({
                                depotCode: this.depotCode,
                                polygon: depot,
                                depotId: this.depotId
                            });
                            
                            $("#select_depot").append("<option value=\"" + this.depotCode + "\" data-id=\"" + this.depotId + "\">" + this.depotName + "</option>").val(this.depotCode);
                            $("#select_depot").val("").trigger("change");
                        });
                        window.toastr["success"](transaction === "new" ? depotName + " başarıyla oluşturuldu." : depotName + "başarıyla güncellendi.", window.resInformation);

                        $.each(depots, function (i, v) {
                            v.polygon.setMap(null);
                        });
                        if (newDepot) {
                            newDepot.depot.setMap(null);
                        }
                        if (transaction == "update") {
                            selectedDepot.setMap(null);
                        }
                        $("#select_depot").prop("disabled", false);
                        $("#select_depot").val("").trigger("change");
                        $("#btnSave").attr("data-type", "");
                        $("#btnCancel").hide();
                        $("#btnSave").hide();
                        $("#btnNew").show();
                        $("#btnDelete").hide();
                        $("#btnAssignment").hide();

                    } else {
                        window.toastr["error"]("İşlem sırasında hata oluştu. Lütfen sistem yöneticinize başvurunuz!", window.resInformation);
                    }
                },
                complete: function () {
                }
            });
        });
        $("#select_depot").change(function () {
            var selectedDepotId = $("#select_depot").val();
            if (selectedDepotId) {
                $.each(depots, function (i, v) {
                    v.polygon.setMap(null);
                });
                var selectedDepot = Enumerable.From(depots).Where("$.depotCode == '" + selectedDepotId + "'").Select("$.polygon").ToArray()[0];
                selectedDepot.setMap(map);
                var latlngbounds = new google.maps.LatLngBounds();

                selectedDepot.latLngs.getArray()[0].forEach(function (latLng) {
                    latlngbounds.extend(latLng);
                });
                map.setCenter(latlngbounds.getCenter());
                map.fitBounds(latlngbounds);
                $("#btnCancel").show();
                $("#btnSave").show();
                $("#btnAssignment").show();
                $("#btnSave").attr("data-type", "update");
                $("#btnNew").hide();
                $("#select_depot").prop("disabled", true);
                $("#btnDelete").show();
            } else {
                $.each(depots, function (i, v) {
                    v.polygon.setMap(null);
                });
                $("#btnDelete").hide();
            }
        });
        $("#btnAssignment").click(function () {
            $("#exampleModal").modal();
        });
        $("#btnNew").click(function () {
            $.each(depots, function (i, v) { v.polygon.setMap(null); });
            $("#btnNew").prop('disabled', true);
            bootbox.prompt({
                title: "Lütfen yeni depo adını giriniz.",
                buttons: {
                    confirm: {
                        label: 'Tamam',
                        className: 'btn btn-info'
                    },
                    cancel: {
                        label: 'İptal',
                        className: 'btn btn-danger'
                    }
                },
                callback: function (callback) {
                    if (callback === null || callback === "") {
                        $("#btnNew").prop('disabled', false);
                    }
                    if (callback) {
                        $.ajax({
                            url: "/DepotDefinitions/GetDepots",
                            type: "GET",
                            success: function (res) {
                                if (res !== "" && res !== "[]") {
                                    var depotsJson = JSON.parse(res);
                                    for (var i = 0; i < depotsJson.length; i++) {
                                        if (callback == depotsJson[i].depotName) {
                                            if (newDepot) {
                                                newDepot.depot.setMap(null);
                                            }
                                            window.toastr["error"]("Lütfen farklı isimde bir depo tanımlayınız!",
                                                window.resInformation);
                                            $("#btnNew").prop('disabled', false);
                                            $("#select_depot").prop("disabled", false);
                                            $("#select_depot").val("").trigger("change");
                                            $("#btnSave").attr("data-type", "");
                                            $("#btnCancel").hide();
                                            $("#btnSave").hide();
                                            $("#btnNew").show();
                                            $("#btnDelete").hide();
                                            break;
                                        } else {
                                            var newPolygonCoords = new Array();
                                            newPolygonCoords.push(new google.maps.LatLng(newDepotCoordinates[0].lat,
                                                newDepotCoordinates[0].lng));
                                            newPolygonCoords.push(new google.maps.LatLng(newDepotCoordinates[1].lat,
                                                newDepotCoordinates[1].lng));
                                            newPolygonCoords.push(new google.maps.LatLng(newDepotCoordinates[2].lat,
                                                newDepotCoordinates[2].lng));
                                            newPolygonCoords.push(new google.maps.LatLng(newDepotCoordinates[3].lat,
                                                newDepotCoordinates[3].lng));
                                            var depot = new google.maps.Polygon({
                                                paths: newPolygonCoords,
                                                strokeColor: "#FF0000",
                                                strokeOpacity: 0.8,
                                                strokeWeight: 2,
                                                fillColor: "#FF0000",
                                                fillOpacity: 0.35,
                                                draggable: true,
                                                editable: true
                                            });
                                            newDepot = {
                                                depotCode: convertDepotCode(callback),
                                                depotName: callback,
                                                depot: depot
                                            };
                                            depot.setMap(map);
                                            var latlngbounds = new google.maps.LatLngBounds();
                                            newPolygonCoords.forEach(function(latLng) {
                                                latlngbounds.extend(latLng);
                                            });

                                            map.setCenter(latlngbounds.getCenter());
                                            map.fitBounds(latlngbounds);
                                            $("#btnCancel").show();
                                            $("#btnSave").show();
                                            $("#btnSave").attr("data-type", "new");
                                            $("#btnNew").hide();
                                            $("#btnDelete").hide();
                                            $("#select_depot").prop("disabled", true);
                                            $("#btnNew").prop('disabled', false);

                                        }
                                    }
                                }
                                else {
                                    var newPolygonCoords = new Array();
                                    newPolygonCoords.push(new google.maps.LatLng(newDepotCoordinates[0].lat, newDepotCoordinates[0].lng));
                                    newPolygonCoords.push(new google.maps.LatLng(newDepotCoordinates[1].lat, newDepotCoordinates[1].lng));
                                    newPolygonCoords.push(new google.maps.LatLng(newDepotCoordinates[2].lat, newDepotCoordinates[2].lng));
                                    newPolygonCoords.push(new google.maps.LatLng(newDepotCoordinates[3].lat, newDepotCoordinates[3].lng));
                                    var depot = new google.maps.Polygon({
                                        paths: newPolygonCoords,
                                        strokeColor: "#FF0000",
                                        strokeOpacity: 0.8,
                                        strokeWeight: 2,
                                        fillColor: "#FF0000",
                                        fillOpacity: 0.35,
                                        draggable: true,
                                        editable: true
                                    });
                                    newDepot = {
                                        depotCode: convertDepotCode(callback),
                                        depotName: callback,
                                        depot: depot
                                    };
                                    depot.setMap(map);
                                    var latlngbounds = new google.maps.LatLngBounds();
                                    newPolygonCoords.forEach(function (latLng) {
                                        latlngbounds.extend(latLng);
                                    });

                                    map.setCenter(latlngbounds.getCenter());
                                    map.fitBounds(latlngbounds);
                                    $("#btnCancel").show();
                                    $("#btnSave").show();
                                    $("#btnSave").attr("data-type", "new");
                                    $("#btnNew").hide();
                                    $("#btnDelete").hide();
                                    $("#select_depot").prop("disabled", true);
                                    $("#btnNew").prop('disabled', false);
                                }
                            }
                        });
                  
                    }
                }
            });
        });
        $("#btnCancel").click(function () {
            //App.blockUI("body");
            $.each(depots, function (i, v) {
                v.polygon.setMap(null);

            });
            if (newDepot) {
                newDepot.depot.setMap(null);
            }
            $("#select_depot").prop("disabled", false);
            $("#select_depot").val("").trigger("change");
            $("#btnSave").attr("data-type", "");
            $("#btnCancel").hide();
            $("#btnSave").hide();
            $("#btnNew").show();
            $("#btnDelete").hide();
            $("#btnAssignment").hide();
            //App.unblockUI("body");
        });
        $("#btnDelete").click(function () {
            var depotCode = "";
            var $selectedDepot = $("#select_depot").selectpicker().find(":selected");
            var $selectedDepotId = $("#select_depot").val();
            var deneme = Enumerable.From(depots).Where("$.depotCode == '" + $selectedDepotId + "'").Select("$.depotId").ToArray()[0];
            bootbox.confirm({
                message: "\"" + $selectedDepot.text() + "\" deposunu silmek istediğinize emin misiniz?",
                buttons: {
                    confirm: {  
                        label: 'Tamam',
                        className: 'btn blue'
                    },
                    cancel: {
                        label: 'İptal',
                        className: 'btn red'
                    }
                },
                callback: function (result) {
                    if (result) {
                        $.ajax({
                            url: "/DepotDefinitions/DeleteDepot",
                            data: {
                                depotId: deneme
                            },
                            type: "POST",
                            success: function (res) {
                                if (res !== "") {
                                    var depotsJson = "";
                                    try {
                                        depotsJson = JSON.parse(res);
                                    } catch (e) {
                                        window.toastr["error"]("İşlem sırasında hata oluştu. Lütfen sistem yöneticinize başvurunuz!", window.resInformation);
                                        return;
                                    }
                                    location.reload();
                                    $("#select_depot").empty();
                                    $("#ddselect_depotlDepot").select2("data", null);
                                    $.each(depots, function (i, v) { v.polygon.setMap(null); });
                                    $("#select_depot").append("<option value=\"\">Depo Seçiniz...</option>").val("");
                                    $.each(depotsJson,
                                        function () {
                                            var strLatLongs = this.polygon.replace(/,\s/g, ",").split(",");
                                            var coords = new Array();
                                            $.each(strLatLongs,
                                                function () {
                                                    coords
                                                        .push({
                                                            lat: Number(this.split(" ")[0]),
                                                            lng: Number(this.split(" ")[1])
                                                        });
                                                });
                                            var depot = new google.maps.Polygon({
                                                paths: coords,
                                                strokeColor: "#FF0000",
                                                strokeOpacity: 0.8,
                                                strokeWeight: 2,
                                                fillColor: "#FF0000",
                                                fillOpacity: 0.35,
                                                editable: true
                                            });
                                            depots.push({
                                                depotCode: this.depotCode,
                                                polygon: depot
                                            });
                                            $("#select_depot")
                                                .append("<option value=\"" + this.depotCode + "\" data-id=\"" + this.depotId + "\">" + this.depotName +
                                                "</option>").val(this.depotCode);
                                        });
                                    $("#btnCancel").click();
                                } else {
                                    window.toastr["error"]("İşlem sırasında hata oluştu. Lütfen sistem yöneticinize başvurunuz!", window.resInformation);
                                    return;
                                }
                                
                            }
                        });
                        
                    }
                }
            });
        });
    });
    $("#btnSavePlate").click(function () {
        var selectPlateList = new Array();
        $('#plateSelectList :selected').each(function (i, selected) {
            selectPlateList.push(selected.value);
        });
        var depotId = $("#select_depot").val();
        var plate = selectPlateList.join(',');
        $.ajax({
            url: "/DepotDefinitions/UpdatePlateDepot",
            type: "POST",
            data: {
                plaka: plate,
                depotId: depotId
            },
            success: function (res) {
                if (res == "Başarılı") {
                    window.toastr["success"]("İşlem başarılı bir şekilde gerçekleştirilmiştir!!", window.resInformation);
                } else {
                    window.toastr["error"]("İşlem sırasında bir hata oluştu!!", window.resInformation);
                }

                $('#exampleModal').modal('hide');
                $('#corporation option').prop("selected", false).trigger('change');
                $('#plateSelectList').multiSelect('deselect_all');
            },
            complete: function () {
            }
        });
    });
    $("#btnCancelPlate").click(function () {
        $('#exampleModal').modal('hide');
        $('#corporation option').prop("selected", false).trigger('change');
        $('#plateSelectList').multiSelect('deselect_all');
    });
    $(window).resize(function () {
        setTimeout(function () {
            $(".page-container").height($("body").height() - $(".header").height());
            $(".page-content").height($("body").height() - $(".header").height());
            $("#dvMap").height($(".page-content").height());
            google.maps.event.trigger(map, "resize");
        }, 0);
    });
    function convertDepotCode(code) {
        var maxLength = 100;
        var depotCode = code.toLowerCase();
        //Convert Characters
        depotCode = depotCode.replace(/ö/g, "o");
        depotCode = depotCode.replace(/ç/g, "c");
        depotCode = depotCode.replace(/ş/g, "s");
        depotCode = depotCode.replace(/ı/g, "i");
        depotCode = depotCode.replace(/ğ/g, "g");
        depotCode = depotCode.replace(/ü/g, "u");

        // if there are other invalid chars, convert them into blank spaces
        depotCode = depotCode.replace(/[^a-z0-9\s-]/g, "");
        // convert multiple spaces and hyphens into one space       
        depotCode = depotCode.replace(/[\s-]+/g, " ");
        // trims current string
        depotCode = depotCode.replace(/^\s+|\s+$/g, "");
        // cuts string (if too long)
        if (depotCode.length > maxLength)
            depotCode = depotCode.substring(0, maxLength);
        // add hyphens
        depotCode = depotCode.replace(/\w\S*/g, function (depotCode) { return depotCode.charAt(0).toUpperCase() + depotCode.substr(1).toLowerCase(); });
        depotCode = "dp" + depotCode.replace(/\s/g, "");
        if (Enumerable.From(depots).Where("$.depotCode == '" + depotCode + "'").Count() > 0) {
            var counter = 1;
            while (true) {
                if (Enumerable.From(depots).Where("$.depotCode == '" + depotCode + counter.toString() + "'").Count() > 0) {
                    counter++;
                } else {
                    depotCode = depotCode + counter.toString();
                    break;
                }
            }
        }
        return depotCode;
    }
    /**
        * A menu that lets a user delete a selected vertex of a path.
        * @constructor
        */
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
} catch (e) {

}