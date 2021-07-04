'use strict';
// Class definition
var currentKey = "";
var URL = "/ConfigurationPublishment";
var KTDatatableDataLocalDemo = function () {
    // Private functions

    // demo initializer
    var mainTableInit = function () {
        var dataJSONArray = '';
        //var dataJSONArrayConfigurationManagementQ = '';
        dataJSONArray = GetConfigurationPublishment();
        //dataJSONArrayConfigurationManagementQ = GetConfigurationManagementQ();
        debugger;

        var datatable = kt_datatable(dataJSONArray);

        $('#kt_datatable_search_capability').on('change', function () {
            datatable.search($(this).val().toLowerCase(), 'CapabilityId');
        });

        $('#kt_datatable_search_device_type').on('change', function () {
            datatable.search($(this).val().toLowerCase(), 'DeviceTypeId');
        });
        $('#kt_datatable_search_equipment').on('change', function () {
            datatable.search($(this).val().toLowerCase(), 'EquipmentId');
        });
        $('#kt_datatable_configuration').on('change', function () {
            datatable.search($(this).val().toLowerCase(), 'ConfigurationId');
        });

        //$('#kt_datatable_search_status, #kt_datatable_search_type').selectpicker();
    };

    return {
        // Public functions
        init: function () {
            //hideLoadPanel();

            // init dmeo
            mainTableInit();

            FillCapability();
            FillDeviceType();
            FillEquipment();
            FillConfiguration();
        },
    };
}();

jQuery(document).ready(function () {
    KTDatatableDataLocalDemo.init();
    //#region fill kt_datatable_ConfigurationManagementQ scrollable table
    kt_datatable_ConfigurationManagementQ();
    //#endregion


    $("#btnCreate").click(function () {
        var network = GetSelectNetwork();
        var deviceTypeId = GetSelectDeviceType();
        var device = GetSelectDevice();

        loadingPanel();
        $.ajax({
            url: '/ConfigurationPublishment/InsertConfigurationPublishment',
            type: 'POST',
            data: {
                Id: currentKey,
                network: network,
                deviceTypeId: deviceTypeId,
                device: device
                // jsonEditor: jsonEditor
            },
            success: function (result) {
                unloadingPanel();
                $("#xjsoneditor").val(result);
                prettyPrint();
            },

            error: function (xhr, textStatus, error) {
                unloadingPanel();
                command: toastr.error("Recording Failed..!");
            },
            complete: function () {
                unloadingPanel();
            }
        });
    });

    $("#btnSend").click(function () {
        loadingPanel();

        var jsonEditor = $("#xjsoneditor").val();

        $.ajax({
            url: '/ConfigurationPublishment/SendConfigurationPublishment',
            type: 'POST',
            data: {
                Id: currentKey,
                jsonEditor: jsonEditor
            },
            success: function (result) {
                unloadingPanel();
                $("#xjsoneditor").val(result);
                prettyPrint();
                $.ajax({
                    url: '/ConfigurationPublishment/GetConfigurationPublishmentNewPartial',
                    type: 'GET',
                    dataType: 'html',
                    success: function (resdata) {
                        debugger;
                        $('#partialView').html(resdata);
                        kt_datatable_ConfigurationManagementQ();
                    }
                });
            },
            error: function (xhr, textStatus, error) {
                unloadingPanel();
                command: toastr.error("Recording Failed..!");
                hideLoadPanel();
            },
            complete: function () {
                unloadingPanel();
            }
        });
    });
});

function kt_datatable(dataJSONArray) {
    var datatable = $('#kt_datatable').KTDatatable({
        // datasource definition
        data: {
            type: 'local',
            source: dataJSONArray,
            pageSize: 10,
        },

        // layout definition
        layout: {
            scroll: false, // enable/disable datatable scroll both horizontal and vertical when needed.
            // height: 450, // datatable's body's fixed height
            footer: false, // display/hide footer
        },

        // column sorting
        sortable: true,

        pagination: true,

        search: {
            input: $('#kt_datatable_search_query'),
            key: 'generalSearch'
        },

        // columns definition
        columns: [
            {
                field: 'ID',
                title: 'ID',
                sortable: false,
                width: 30,
                textAlign: 'center',
                visible: false,
            }, {
                field: 'CapabilityId',
                title: 'Capability',
                textAlign: 'center',
                // callback function support for column rendering
                template: function (row) {
                    var status = {
                        1: { 'title': 'Communication', 'class': 'label-primary' },
                        2: { 'title': 'Sale', 'class': ' label-danger' },
                        3: { 'title': 'Diagnostic', 'class': ' label-primary' },
                        4: { 'title': 'Display', 'class': ' label-success' },
                        5: { 'title': 'Sound', 'class': ' label-info' },
                        6: { 'title': 'Analytics', 'class': ' label-danger' },
                        7: { 'title': 'Profile', 'class': ' label-warning' },
                    };
                    return '<span class="label ' +
                        status[row.CapabilityId].class + ' label-inline label-pill">' +
                        status[row.CapabilityId].title + '</span>';
                },
            }, {
                field: 'DeviceTypeId',
                title: 'Device Type',
                textAlign: 'center',
                template: function (row) {
                    var status = {
                        1: { 'title': 'Test', 'class': ' label-warning' },
                        2: { 'title': 'Tvm', 'class': ' label-success' },
                        3: { 'title': 'Other', 'class': ' label-primary' },
                    };
                    return '<span class="label ' +
                        status[row.DeviceTypeId].class + ' label-inline label-pill">' +
                        status[row.DeviceTypeId].title + '</span>';
                },
            }, {
                field: 'EquipmentId',
                title: 'Equipment',
                textAlign: 'center',
                template: function (row) {
                    var status = {
                        1: { 'title': 'TicketPrinter', 'class': 'label-primary' },
                        2: { 'title': 'BanknoteHopper', 'class': ' label-danger' },
                        3: { 'title': 'BanknoteAcceptor', 'class': ' label-primary' },
                        4: { 'title': 'CardReader', 'class': ' label-success' },
                        5: { 'title': 'CoinHopper', 'class': ' label-info' },
                        6: { 'title': 'CoinAcceptor', 'class': ' label-danger' },
                        7: { 'title': 'ControlCard', 'class': ' label-warning' },
                    };
                    return '<span class="label ' +
                        status[row.EquipmentId].class + ' label-inline label-pill">' +
                        status[row.EquipmentId].title + '</span>';
                },
            }, {
                field: 'ConfigurationId',
                title: 'Configuration',
                textAlign: 'center',
                template: function (row) {
                    var status = {
                        1: { 'title': 'SoftwareSettings', 'class': 'label-primary' },
                        2: { 'title': 'DriverSettings', 'class': ' label-danger' },
                    };
                    return '<span class="label ' +
                        status[row.ConfigurationId].class + ' label-inline label-pill">' +
                        status[row.ConfigurationId].title + '</span>';
                },
            }, {
                field: 'Version',
                title: 'Version',
                textAlign: 'center',
            }, {
                field: 'CapabilityConfigurationId',
                title: 'CapabilityConfigurationId',
                visible: false,
            }, {
                field: 'Actions',
                title: 'Actions',
                sortable: false,
                width: 125,
                overflow: 'visible',
                autoHide: false,
                template: function (row) {
                    debugger;
                    return '\
                         <a href="javascript:;" data-toggle="modal" data-target="#kt_blockui_modal_detail" class="btn btn-sm btn-clean btn-icon" onclick="ConfigurationManagerDetail('+ row.ID + ',' + row.DeviceTypeId + ');" title="Detail">\
                            <span class="svg-icon svg-icon-primary svg-icon-2x">\
                            <svg xmlns="http://www.w3.org/2000/svg" xmlns: xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version = "1.1" >\
                            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" >\
                            <rect x="0" y="0" width="24" height="24" />\
                            <path d="M8,3 L8,3.5 C8,4.32842712 8.67157288,5 9.5,5 L14.5,5 C15.3284271,5 16,4.32842712 16,3.5 L16,3 L18,3 C19.1045695,3 20,3.8954305 20,5 L20,21 C20,22.1045695 19.1045695,23 18,23 L6,23 C4.8954305,23 4,22.1045695 4,21 L4,5 C4,3.8954305 4.8954305,3 6,3 L8,3 Z" fill="#000000" opacity="0.3" />\
                            <path d="M11,2 C11,1.44771525 11.4477153,1 12,1 C12.5522847,1 13,1.44771525 13,2 L14.5,2 C14.7761424,2 15,2.22385763 15,2.5 L15,3.5 C15,3.77614237 14.7761424,4 14.5,4 L9.5,4 C9.22385763,4 9,3.77614237 9,3.5 L9,2.5 C9,2.22385763 9.22385763,2 9.5,2 L11,2 Z" fill="#000000" />\
                            <rect fill="#000000" opacity="0.3" x="7" y="10" width="5" height="2" rx="1" />\
                            <rect fill="#000000" opacity="0.3" x="7" y="14" width="9" height="2" rx="1" />\
                            </g >\
                            </svg ></span >\
                         </a>\
						';
                },
            }],
    });
    return datatable;
}

function FillCapability() {
    loadingPanel();
    $.ajax({
        url: URL + '/FillCapability',
        type: 'GET',
        async: false,
        success: function (res) {
            debugger;
            //region select option dolduruluyor..
            var $select = $('#kt_datatable_search_capability');
            $select.find('option').remove();
            $select.append('<option value="">All</option>');
            $.each(res, function (key, value) {
                debugger;
                $select.append('<option value=' + value.ID + '>' + value.Name + '</option>');
            });
            //endregion
            unloadingPanel();
        },
        error: function (xhr, textStatus, error) {
            unloadingPanel();
            toastr.error("Komut Gönderilirken Hata Alındı..!");
        },
        complete: function () {
            unloadingPanel();
        }
    });
}

function FillDeviceType() {
    loadingPanel();
    $.ajax({
        url: URL + '/FillDeviceType',
        type: 'GET',
        async: false,
        success: function (res) {
            debugger;
            //region select option dolduruluyor..
            var $select = $('#kt_datatable_search_device_type');
            $select.find('option').remove();
            $select.append('<option value="">All</option>');
            $.each(res, function (key, value) {
                debugger;
                $select.append('<option value=' + value.ID + '>' + value.Name + '</option>');
            });
            //endregion
            unloadingPanel();
        },
        error: function (xhr, textStatus, error) {
            unloadingPanel();
            toastr.error("Komut Gönderilirken Hata Alındı..!");
        },
        complete: function () {
            unloadingPanel();
        }
    });
}

function FillEquipment() {
    loadingPanel();
    $.ajax({
        url: URL + '/FillEquipment',
        type: 'GET',
        async: false,
        success: function (res) {
            debugger;
            //region select option dolduruluyor..
            var $select = $('#kt_datatable_search_equipment');
            $select.find('option').remove();
            $select.append('<option value="">All</option>');
            $.each(res, function (key, value) {
                debugger;
                $select.append('<option value=' + value.ID + '>' + value.Name + '</option>');
            });
            //endregion
            unloadingPanel();
        },
        error: function (xhr, textStatus, error) {
            unloadingPanel();
            toastr.error("Komut Gönderilirken Hata Alındı..!");
        },
        complete: function () {
            unloadingPanel();
        }
    });
}

function FillConfiguration() {
    loadingPanel();
    $.ajax({
        url: URL + '/FillConfiguration',
        type: 'GET',
        async: false,
        success: function (res) {
            debugger;
            //region select option dolduruluyor..
            var $select = $('#kt_datatable_configuration');
            $select.find('option').remove();
            $select.append('<option value="">All</option>');
            $.each(res, function (key, value) {
                debugger;
                $select.append('<option value=' + value.ID + '>' + value.Name + '</option>');
            });
            //endregion
            unloadingPanel();
        },
        error: function (xhr, textStatus, error) {
            unloadingPanel();
            toastr.error("Komut Gönderilirken Hata Alındı..!");
        },
        complete: function () {
            unloadingPanel();
        }
    });
}

function GetConfigurationPublishment() {
    var dataJSONArray = '';
    loadingPanel();
    $.ajax({
        url: URL + '/GetConfigurationPublishment',
        type: 'GET',
        async: false,
        success: function (res) {
            debugger;
            unloadingPanel();
            dataJSONArray = res;
        },
        error: function (xhr, textStatus, error) {
            unloadingPanel();
            toastr.error("Komut Gönderilirken Hata Alındı..!");
        },
        complete: function () {
            unloadingPanel();
        }
    });
    return dataJSONArray;
}

function ConfigurationManagerDetail(ID, DeviceTypeId) {
    debugger;
    $("#deviceType option[value='" + DeviceTypeId + "']").attr('selected', 'selected');
    $("#xjsoneditor").val('');
    currentKey = ID;
    showLoadPanel();
}
function prettyPrint() {
    var ugly = document.getElementById('xjsoneditor').value;
    var obj = JSON.parse(ugly);
    var pretty = JSON.stringify(obj, undefined, 4);
    document.getElementById('xjsoneditor').value = pretty;
}
function showLoadPanel() {
    $('#configurationPublishmentDetail_visible').show();
    $('#kt_datatable_ConfigurationManagementQ_visible').show();
}