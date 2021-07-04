'use strict';
// Class definition
var URL = "/ConfigurationManagement";
var sectionlistgeneral = '';
var KTDatatableChildDataLocalDemo = function () {
    var datatable;
    // demo initializer
    var mainTableInit = function () {
        var dataJSONArray = '';
        loadingPanel();
        $.ajax({
            url: URL + '/GetConfigurationManagement',
            type: 'GET',
            async: false,
            success: function (res) {
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

        datatable = $('#kt_datatable').KTDatatable({
            // datasource definition
            data: {
                type: 'local',
                source: dataJSONArray,
                pageSize: 10, // display 20 records per page
            },

            // layout definition
            layout: {
                scroll: false,
                height: null,
                footer: false,
            },

            sortable: true,

            filterable: false,

            pagination: true,

            detail: {
                title: 'Load sub table',
            },

            search: {
                input: $('#kt_datatable_search_query'),
                key: 'generalSearch'
            },

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
                },
                {
                    field: 'Actions',
                    width: 130,
                    title: 'Actions',
                    sortable: false,
                    overflow: 'visible',
                    template: function (row) {
                        return '\
                         <a href="javascript:;" data-toggle="modal" data-target="#kt_blockui_modal_edit" onclick="ConfigurationManagerEdit('+ row.CapabilityConfigurationId + ',' + row.CapabilityId + ',' + row.DeviceTypeId + ',' + row.EquipmentId + ',' + row.ConfigurationId + ');" class="btn btn-sm btn-clean btn-icon mr-2" title="Edit">\
                             <span class="svg-icon svg-icon-md">\
                                 <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version="1.1">\
                                     <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\
                                         <rect x="0" y="0" width="24" height="24"/>\
                                         <path d="M8,17.9148182 L8,5.96685884 C8,5.56391781 8.16211443,5.17792052 8.44982609,4.89581508 L10.965708,2.42895648 C11.5426798,1.86322723 12.4640974,1.85620921 13.0496196,2.41308426 L15.5337377,4.77566479 C15.8314604,5.0588212 16,5.45170806 16,5.86258077 L16,17.9148182 C16,18.7432453 15.3284271,19.4148182 14.5,19.4148182 L9.5,19.4148182 C8.67157288,19.4148182 8,18.7432453 8,17.9148182 Z" fill="#000000" fill-rule="nonzero"\ transform="translate(12.000000, 10.707409) rotate(-135.000000) translate(-12.000000, -10.707409) "/>\
                                         <rect fill="#000000" opacity="0.3" x="5" y="20" width="15" height="2" rx="1"/>\
                                     </g>\
                                 </svg>\
                             </span>\
                         </a>\
                         <a href="javascript:;" data-toggle="modal" data-target="#kt_blockui_modal_detail" class="btn btn-sm btn-clean btn-icon" onclick="ConfigurationManagerDetail(' + row.CapabilityConfigurationId + ',' + row.CapabilityId + ',' + row.DeviceTypeId + ',' + row.EquipmentId + ',' + row.ConfigurationId + ',\'' + $.trim(row.Version) + '\');" title="Detail">\
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
                }
            ],
        });

        $('#kt_datatable_search_status').on('change', function () {
            debugger;
            datatable.search($(this).val().toLowerCase(), 'EquipmentId');
        });

        return {
            datatable: function () {
                return datatable;
            }
        };
        //$('#kt_datatable_search_status, #kt_datatable_search_type').selectpicker();

    };

    return {
        // Public functions
        init: function () {
            // init dmeo
            mainTableInit();
        }
    };
}();

function ConfigurationManagerNewRecord() {
    FillCapability();
    FillDeviceType();
    FillEquipment();
    FillConfiguration();
}

function InsertConfigurationManagementTnj() {
    //#region loading başlatılıyor..
    KTApp.block('#kt_blockui_modal_edit .modal-content', {
        overlayColor: 'red',
        opacity: 0.1,
        state: 'primary' // a bootstrap color
    });
    //#endregion 
    debugger;
    var capabilityId = $("#kt_datatable_new_record_Capability option:selected").val();
    var device_TypeId = $("#kt_datatable_new_record_Device_Type option:selected").val();
    var equipmentId = $("#kt_datatable_new_record_Equipment option:selected").val();
    var configurationId = $("#kt_datatable_new_record_Configuration option:selected").val();
    loadingPanel();
    $.ajax({
        url: URL + '/InsertConfigurationManagementTnj',
        type: 'GET',
        data: {
            capabilityId: capabilityId,
            device_TypeId: device_TypeId,
            equipmentId: equipmentId,
            configurationId: configurationId
        },
        async: false,
        success: function (res) {
            unloadingPanel();
            KTApp.unblock('#kt_blockui_modal_edit .modal-content');// loading bitiriliyor..

            window.location.href = '/ConfigurationManagement/IndexTnj';
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

function ConfigurationManagerDetail(capabilityConfigurationId, capabilityId, deviceTypeId, equipmentId, configurationId, version, Id) {
    debugger;
    var schema;
    var versionNew;

    if (version != null && version != "") {
        schema = version.split('.')[0];
        versionNew = version.split('.')[3];
    }
    else {
        schema = 0;
        versionNew = 0;
    }

    FillVersion(capabilityConfigurationId, capabilityId, deviceTypeId, equipmentId, configurationId);
    GetSection(schema, versionNew, capabilityConfigurationId);
    GetConfigurationManagerDetail(sectionlistgeneral, schema, versionNew, capabilityConfigurationId, capabilityId, deviceTypeId, equipmentId, configurationId);
    GetConfigurationManagerMain(schema, versionNew, capabilityConfigurationId, capabilityId, deviceTypeId, equipmentId, Id, configurationId);
}

function ConfigurationManagerEdit(CapabilityConfigurationId, CapabilityId, DeviceTypeId, EquipmentId, ConfigurationId) {
    debugger;

    $('#capabilityConfigurationId').val(CapabilityConfigurationId);

    FillCapability(CapabilityId);
    FillDeviceType(DeviceTypeId);
    FillEquipment(EquipmentId);
    FillConfiguration(ConfigurationId);
}

function GetSection(schema, version, capabilityConfigurationId) {
    var res = '';
    debugger;
    loadingPanel();
    $.ajax({
        url: '/ConfigurationManagement/GetSection',
        type: 'GET',
        async: false,
        data: {
            schema: schema,
            version: version,
            Id: capabilityConfigurationId
        },
        success: function (result) {
            debugger;
            unloadingPanel();
            sectionlistgeneral = result;
        },
        error: function (xhr, textStatus, error) {
            unloadingPanel();
        },
        complete: function () {
            unloadingPanel();
        }
    });
}

function refreshSection(result, capabilityConfigurationId, capability, deviceTypeId, equipment, configuration) {
    debugger;
    loadVersion(result);
    var selectschema = $("#kt_datatable_Version option:selected").val();
    var schema = selectschema.split('.')[0];
    var version = selectschema.split('.')[3];

    GetSection(schema, version, capabilityConfigurationId);
    GetConfigurationManagerDetail(sectionlistgeneral, schema, version, capabilityConfigurationId, capability, deviceTypeId, equipment, configuration)
}
function loadVersion(result) {
    debugger;
    //region select option dolduruluyor..
    var $select = $('#kt_datatable_Version');
    $select.find('option').remove();
    $.each(result, function (key, value) {
        debugger;
        $select.append('<option value=' + value.Schema + '.' + value.Major + '.' + value.Minor + '.' + value.Tracking + '>' + value.Schema + '.' + value.Major + '.' + value.Minor + '.' + value.Tracking + '</option>');
    });
    //endregion
}

function FillVersion(capabilityConfigurationId, capabilityId, deviceTypeId, equipmentId, configurationId) {
    debugger;
    loadingPanel();
    $.ajax({
        url: URL + '/GetSchemaAndVersion',
        type: 'GET',
        async: false,
        data: { Id: capabilityConfigurationId },
        success: function (res) {
            debugger;

            //region select option dolduruluyor..
            var $select = $('#kt_datatable_Version');
            $select.attr('data-capabilityConfigurationId', capabilityConfigurationId);
            $select.attr('data-capabilityId', capabilityId);
            $select.attr('data-deviceTypeId', deviceTypeId);
            $select.attr('data-equipmentId', equipmentId);
            $select.attr('data-configurationId', configurationId);

            $select.find('option').remove();
            $.each(res, function (key, value) {
                $select.append('<option value=' + value.Schema + '.' + value.Major + '.' + value.Minor + '.' + value.Tracking + '>' + value.Schema + '.' + value.Major + '.' + value.Minor + '.' + value.Tracking + '</option>');
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
function FillCapability(CapabilityId) {
    var $select = "";
    loadingPanel();
    $.ajax({
        url: URL + '/FillCapability',
        type: 'GET',
        async: false,
        success: function (res) {
            debugger;
            //region select option dolduruluyor..
            if (CapabilityId != undefined) {//Edit
                $select = $('#kt_datatable_edit_Capability');
            }
            else {//New Record
                $select = $('#kt_datatable_new_record_Capability');
            }

            $select.find('option').remove();
            $.each(res, function (key, value) {
                $select.append('<option value=' + value.ID + '>' + value.Name + '</option>');
            });
            if (CapabilityId != undefined) {
                $('#kt_datatable_edit_Capability option[value=' + CapabilityId + ']').prop('selected', true);
            }
            else {
                $('#kt_datatable_new_record_Capability option[value=' + CapabilityId + ']').prop('selected', true);
            }
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
function FillDeviceType(DeviceTypeId) {
    var $select = "";
    loadingPanel();
    $.ajax({
        url: URL + '/FillDeviceType',
        type: 'GET',
        async: false,
        success: function (res) {
            debugger;

            //region select option dolduruluyor..

            if (DeviceTypeId != undefined) {//Edit
                $select = $('#kt_datatable_edit_Device_Type');
            }
            else {//New Record
                $select = $('#kt_datatable_new_record_Device_Type');
            }

            $select.find('option').remove();
            $.each(res, function (key, value) {
                debugger;
                $select.append('<option value=' + value.ID + '>' + value.Name + '</option>');
            });
            if (DeviceTypeId != undefined) {//Edit
                $('#kt_datatable_edit_Device_Type option[value=' + DeviceTypeId + ']').prop('selected', true);
            }
            else {
                $('#kt_datatable_new_record_Device_Type option[value=' + DeviceTypeId + ']').prop('selected', true);
            }
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
function FillEquipment(EquipmentId) {
    var $select = "";
    loadingPanel();
    $.ajax({
        url: URL + '/FillEquipment',
        type: 'GET',
        async: false,
        success: function (res) {
            debugger;

            //region select option dolduruluyor..
            if (EquipmentId != undefined) {//Edit
                $select = $('#kt_datatable_edit_Equipment');
            }
            else {
                $select = $('#kt_datatable_new_record_Equipment');
            }

            $select.find('option').remove();
            $.each(res, function (key, value) {
                debugger;
                $select.append('<option value=' + value.ID + '>' + value.Name + '</option>');
            });
            if (EquipmentId != undefined) {//Edit
                $('#kt_datatable_edit_Equipment option[value=' + EquipmentId + ']').prop('selected', true);
            }
            else {
                $('#kt_datatable_new_record_Equipment option[value=' + EquipmentId + ']').prop('selected', true);
            }
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
function FillConfiguration(ConfigurationId) {
    var $select = "";
    loadingPanel();
    $.ajax({
        url: URL + '/FillConfiguration',
        type: 'GET',
        async: false,
        success: function (res) {
            debugger;
            //region select option dolduruluyor..
            if (ConfigurationId != undefined) {//Edit
                $select = $('#kt_datatable_edit_Configuration');
            }
            else {
                $select = $('#kt_datatable_new_record_Configuration');
            }

            $select.find('option').remove();
            $.each(res, function (key, value) {
                debugger;
                $select.append('<option value=' + value.ID + '>' + value.Name + '</option>');
            });

            if (ConfigurationId != undefined) {//Edit
                $('#kt_datatable_edit_Configuration option[value=' + ConfigurationId + ']').prop('selected', true);
            }
            else {
                $('#kt_datatable_new_record_Configuration option[value=' + ConfigurationId + ']').prop('selected', true);
            }
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
function UpdateConfigurationManagementTnj() {
    //#region loading başlatılıyor..
    KTApp.block('#kt_blockui_modal_edit .modal-content', {
        overlayColor: 'red',
        opacity: 0.1,
        state: 'primary' // a bootstrap color
    });
    //#endregion 

    var capabilityId = $("#kt_datatable_Capability option:selected").val();
    var device_TypeId = $("#kt_datatable_Device_Type option:selected").val();
    var equipmentId = $("#kt_datatable_Equipment option:selected").val();
    var configurationId = $("#kt_datatable_Configuration option:selected").val();
    var capabilityConfigurationId = $('#capabilityConfigurationId').val();
    loadingPanel();
    $.ajax({
        url: URL + '/UpdateConfigurationManagementTnj',
        type: 'GET',
        data: {
            capabilityConfigurationId: capabilityConfigurationId,
            capabilityId: capabilityId,
            device_TypeId: device_TypeId,
            equipmentId: equipmentId,
            configurationId: configurationId
        },
        async: false,
        success: function (res) {
            unloadingPanel();
            KTApp.unblock('#kt_blockui_modal_edit .modal-content');// loading bitiriliyor..

            window.location.href = '/ConfigurationManagement/IndexTnj';
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

function ConfigurationManagementDetailClose() {
    debugger;
    //$('#kt_datatable').KTDatatable().reload();
    //KTDatatableChildDataLocalDemo.reload();
    //debugger;
    //$('#kt_datatable').KTDatatable().reload();
    ////setInterval(KTDatatableChildDataLocalDemo.reload(), 2000);
    window.location.href = '/ConfigurationManagement/IndexTnj';

}

function GetConfigurationManagerDetail(sectionlistgeneral, schema, versionNew, capabilityConfigurationId, capabilityId, deviceTypeId, equipmentId, configurationId) {
    debugger;
    var $select = $('#detailTable');
    $select.html('');

    var tablecontent = '<div class="table-responsive"><table class="table table-bordered">';
    tablecontent += '<thead><tr><th scope="col"></th><th scope="col">Item</th><th scope="col">Value</th><th scope="col">Type</th><th scope="col" style="text-align:center;">Actions</th></tr></thead>';
    tablecontent += '<tbody>';

    $.each(sectionlistgeneral, function (key, value) {
        debugger;
        if (value.ParentId == 0) {
            tablecontent += '<tr id="' + value.Id + '">';
            if (GetSectionSubCheck(sectionlistgeneral, value)) {
                tablecontent += '<th scope="row" id="th_' + value.Id + '" onclick="ShowSubDetail(' + value.Id + ',' + value.ParentId + ',' + schema + ',' + versionNew + ',' + capabilityConfigurationId + ',' + capabilityId + ',' + deviceTypeId + ',' + equipmentId + ',' + configurationId + '); "><img src="template/dist/assets/media/svg/icons/Code/Plus.svg"/></th>';
            }
            else {
                tablecontent += '<th scope="row" ><img src="template/dist/assets/media/svg/icons/Code/Minus.svg"/></th>';
            }
            tablecontent += '<td>' + value.Item + '</td><td>' + value.Value + '</td><td>' + value.Type + '</td><td style="text-align: center;"><div class="row">'
                + '<div class="col-4"><a href="#" data-toggle="modal" data-target="#kt_blockui_modal_new_section_record" onclick="InsertSectionNewRecord(' + schema + ',' + versionNew + ',' + capabilityId + ',' + deviceTypeId + ',' + equipmentId + ',' + configurationId + ',' + value.Id + ',' + capabilityConfigurationId + ')"><i class="icon-2x text-dark-50 flaticon2-sheet" style="font-size: 20px !important;" title="Insert"></i></a></div>'
                + '<div class="col-4"><a href="#" data-toggle="modal" data-target="#kt_blockui_modal_edit_section" onclick="EditSectionNewRecord(' + schema + ',' + versionNew + ',' + capabilityId + ',' + deviceTypeId + ',' + equipmentId + ',' + configurationId + ',' + value.Id + ',' + capabilityConfigurationId + ',\'' + value.Item + '\',\'' + value.Value + '\',' + value.Type + ')"><i class="icon-2x text-dark-50 flaticon2-file-1" style="font-size: 20px !important;" title="Edit"></i></a></div>'
                + '<div class="col-4"><a href="#" data-toggle="modal" data-target="#kt_blockui_modal_delete_section" onclick="DeleteSectionNewRecord(' + value.Id + ',' + capabilityConfigurationId + ',' + capabilityId + ',' + deviceTypeId + ',' + equipmentId + ',' + configurationId + ')"><i class="icon-2x text-dark-50 flaticon2-trash" style="font-size: 20px !important;" title="Delete"></i></a></div>'
                + '</div></td></tr>';
        }

    });

    debugger;
    tablecontent += '</tbody></table></div>';
    $select.append(tablecontent);
}
function GetConfigurationManagerMain(schema, versionNew, capabilityConfigurationId, capabilityId, deviceTypeId, equipmentId, Id, configurationId) {
    debugger;
    var $select = $('#insertSectionNewMainRecordImage');
    $select.html('');

    var tablecontent = '<a href="#" data-toggle="modal" data-target="#kt_blockui_modal_new_section_main_record" onclick="InsertSectionNewMainRecord(' + schema + ',' + versionNew + ',' + capabilityId + ',' + deviceTypeId + ',' + equipmentId + ',' + configurationId + ',' + Id + ',' + capabilityConfigurationId + ')" style="float: right;"><i class="icon-2x text-dark-50 flaticon2-sheet" style="font-size: 20px !important;" title="Insert"></i></a>';
    $select.append(tablecontent);
}

function GetSectionSubCheck(result, val) {
    debugger;
    var res = exists(result, "ParentId", val.Id); //returns false
    return res;
}
function exists(arr, prop, val) {
    debugger;
    var threads = arr.filter(function (e) {
        return e[prop] == val;
    });
    return !!threads.length;
}

function ShowSubDetail(Id, ParentId, schema, versionNew, capabilityConfigurationId, capabilityId, deviceTypeId, equipmentId, configurationId) {
    debugger;
    var $select = $('#' + Id);

    var $selectnext = $select.next();

    var $selectIcon = $('#th_' + Id);

    $selectIcon.html('');// icon sil
    //seçilen tr'nin altında başka bir tr varsa ve altındaki tr'nin data-id 'si seçilen tr nin Id değerine eşitse sil değilse ekle...
    if ($selectnext.length > 0) {
        debugger;
        var $selectIconlastdataId = $selectnext.attr("data-parentid");
        if ($selectIconlastdataId == Id) {
            $selectnext.remove();

            $selectIcon.html('<img src="template/dist/assets/media/svg/icons/Code/Plus.svg"/>');
        }
        else {
            $selectIcon.html('<i class="icon-2x text-dark-50 flaticon2-up"></i>');

            var reportRecipientsDuplicate = [];
            for (var i = 0; i < sectionlistgeneral.length; i++) {
                if (sectionlistgeneral[i].ParentId == Id) {
                    reportRecipientsDuplicate.push(sectionlistgeneral[i]);
                }
            }

            var tablecontent = '<tr data-parentid="' + Id + '"><td colspan="5"><div class="table-responsive"><table class="table table-bordered">';
            tablecontent += '<thead><tr><th scope="col"></th><th scope="col">Item</th><th scope="col">Value</th><th scope="col">Type</th><th scope="col" style="text-align:center;">Actions</th></tr></thead>';
            tablecontent += '<tbody>';

            $.each(reportRecipientsDuplicate, function (key, value) {
                debugger;
                tablecontent += '<tr id="' + value.Id + '">';
                if (GetSectionSubCheck(sectionlistgeneral, value)) {
                    tablecontent += '<th scope="row" id="th_' + value.Id + '" onclick="ShowSubDetail(' + value.Id + ',' + value.ParentId + ',' + schema + ',' + versionNew + ',' + capabilityConfigurationId + ',' + capabilityId + ',' + deviceTypeId + ',' + equipmentId + ',' + configurationId + '); "><img src="template/dist/assets/media/svg/icons/Code/Plus.svg"/></th>';
                }
                else {
                    tablecontent += '<th scope="row"><img src="template/dist/assets/media/svg/icons/Code/Minus.svg"/></th>';
                }
                tablecontent += '<td>' + value.Item + '</td><td>' + value.Value + '</td><td>' + value.Type + '</td><td style="text-align: center;"><div class="row">'
                    + '<div class="col-4"><a href="#" data-toggle="modal" data-target="#kt_blockui_modal_new_section_record" onclick="InsertSectionNewRecord(' + schema + ',' + versionNew + ',' + capabilityId + ',' + deviceTypeId + ',' + equipmentId + ',' + configurationId + ',' + value.Id + ',' + capabilityConfigurationId + ')"><i class="icon-2x text-dark-50 flaticon2-sheet" style="font-size: 20px !important;" title="Insert"></i></a></div>'
                    + '<div class="col-4"><a href="#" data-toggle="modal" data-target="#kt_blockui_modal_edit_section" onclick="EditSectionNewRecord(' + schema + ',' + versionNew + ',' + capabilityId + ',' + deviceTypeId + ',' + equipmentId + ',' + configurationId + ',' + value.Id + ',' + capabilityConfigurationId + ',\'' + value.Item + '\',\'' + value.Value + '\',' + value.Type + ')"><i class="icon-2x text-dark-50 flaticon2-file-1" style="font-size: 20px !important;" title="Edit"></i></a></div>'
                    + '<div class="col-4"><a href="#" data-toggle="modal" data-target="#kt_blockui_modal_delete_section" onclick="DeleteSectionNewRecord(' + value.Id + ',' + capabilityConfigurationId + ',' + capabilityId + ',' + deviceTypeId + ',' + equipmentId + ',' + configurationId + ')"><i class="icon-2x text-dark-50 flaticon2-trash" style="font-size: 20px !important;" title="Delete"></i></a></div>'
                    + '</div></td></tr>';
            });

            debugger;
            tablecontent += '</tbody></table></div></td></tr>';
            $select.after(tablecontent);
        }
    }
    else {

        $selectIcon.html('<i class="icon-2x text-dark-50 flaticon2-up"></i>');

        var reportRecipientsDuplicate = [];
        for (var i = 0; i < sectionlistgeneral.length; i++) {
            if (sectionlistgeneral[i].ParentId == Id) {
                reportRecipientsDuplicate.push(sectionlistgeneral[i]);
            }
        }

        debugger;
        var $select = $('#' + Id);
        //$select.html('');

        var tablecontent = '<tr data-parentid="' + Id + '"><td colspan="5"><div class="table-responsive"><table class="table table-bordered">';
        tablecontent += '<thead><tr><th scope="col"></th><th scope="col">Item</th><th scope="col">Value</th><th scope="col">Type</th><th scope="col" style="text-align:center;">Actions</th></tr></thead>';
        tablecontent += '<tbody>';

        $.each(reportRecipientsDuplicate, function (key, value) {
            debugger;
            tablecontent += '<tr id="' + value.Id + '">';
            if (GetSectionSubCheck(sectionlistgeneral, value)) {
                tablecontent += '<th scope="row" id="th_' + value.Id + '" onclick="ShowSubDetail(' + value.Id + ',' + value.ParentId + ',' + schema + ',' + versionNew + ',' + capabilityConfigurationId + ',' + capabilityId + ',' + deviceTypeId + ',' + equipmentId + ',' + configurationId + '); "><img src="template/dist/assets/media/svg/icons/Code/Plus.svg"/></th>';
            }
            else {
                tablecontent += '<th scope="row"><img src="template/dist/assets/media/svg/icons/Code/Minus.svg"/></th>';
            }
            tablecontent += '<td>' + value.Item + '</td><td>' + value.Value + '</td><td>' + value.Type + '</td><td style="text-align: center;"><div class="row">'
                + '<div class="col-4"><a href="#" data-toggle="modal" data-target="#kt_blockui_modal_new_section_record" onclick="InsertSectionNewRecord(' + schema + ',' + versionNew + ',' + capabilityId + ',' + deviceTypeId + ',' + equipmentId + ',' + configurationId + ',' + value.Id + ',' + capabilityConfigurationId + ')"><i class="icon-2x text-dark-50 flaticon2-sheet" style="font-size: 20px !important;" title="Insert"></i></a></div>'
                + '<div class="col-4"><a href="#" data-toggle="modal" data-target="#kt_blockui_modal_edit_section" onclick="EditSectionNewRecord(' + schema + ',' + versionNew + ',' + capabilityId + ',' + deviceTypeId + ',' + equipmentId + ',' + configurationId + ',' + value.Id + ',' + capabilityConfigurationId + ',\'' + value.Item + '\',\'' + value.Value + '\',' + value.Type + ')"><i class="icon-2x text-dark-50 flaticon2-file-1" style="font-size: 20px !important;" title="Edit"></i></a></div>'
                + '<div class="col-4"><a href="#" data-toggle="modal" data-target="#kt_blockui_modal_delete_section" onclick="DeleteSectionNewRecord(' + value.Id + ',' + capabilityConfigurationId + ',' + capabilityId + ',' + deviceTypeId + ',' + equipmentId + ',' + configurationId + ')"><i class="icon-2x text-dark-50 flaticon2-trash" style="font-size: 20px !important;" title="Delete"></i></a></div>'
                + '</div></td></tr>';
        });

        debugger;
        tablecontent += '</tbody></table></div></td></tr>';
        $select.after(tablecontent);
    }
}

function InsertSectionNewRecord(schema, version, capabilityId, deviceTypeId, equipmentId, configurationId, Id, capabilityConfigurationId) {
    debugger;
    var $select = $('#insertSectionNewRecord');
    $select.attr('data-schema', schema);
    $select.attr('data-version', version);
    $select.attr('data-capabilityId', capabilityId);
    $select.attr('data-deviceTypeId', deviceTypeId);
    $select.attr('data-equipmentId', equipmentId);
    $select.attr('data-configurationId', configurationId);
    $select.attr('data-Id', Id);
    $select.attr('data-capabilityConfigurationId', capabilityConfigurationId);
    FillSectionType('insert');
}
function InsertSectionNewMainRecord(schema, version, capabilityId, deviceTypeId, equipmentId, configurationId, Id, capabilityConfigurationId) {
    debugger;
    var $select = $('#insertSectionNewMainRecord');
    $select.attr('data-schema', schema);
    $select.attr('data-version', version);
    $select.attr('data-capabilityId', capabilityId);
    $select.attr('data-deviceTypeId', deviceTypeId);
    $select.attr('data-equipmentId', equipmentId);
    $select.attr('data-configurationId', configurationId);
    $select.attr('data-Id', Id);
    $select.attr('data-capabilityConfigurationId', capabilityConfigurationId);
    FillSectionType('insertMain');
}

function EditSectionNewRecord(schema, version, capabilityId, deviceTypeId, equipmentId, configurationId, Id, capabilityConfigurationId, item, value, type) {
    debugger;
    var $select = $('#editSection');
    $select.attr('data-schema', schema);
    $select.attr('data-version', version);
    $select.attr('data-capabilityId', capabilityId);
    $select.attr('data-deviceTypeId', deviceTypeId);
    $select.attr('data-equipmentId', equipmentId);
    $select.attr('data-configurationId', configurationId);
    $select.attr('data-Id', Id);
    $select.attr('data-capabilityConfigurationId', capabilityConfigurationId);

    FillSectionType('edit');

    $('#itemSectionEdit').val(item);
    $('#valueSectionEdit').val(value);
    $("#typeSectionEdit").val(type);

}

function DeleteSectionNewRecord(Id, capabilityConfigurationId, capability, deviceTypeId, equipment, configuration) {
    debugger;
    Swal.fire({
        //title: "Are you sure?",
        text: "Are you sure you want to delete this record?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No"
    }).then(function (result) {
        debugger;
        if (result.isConfirmed == true) {
            $.ajax({
                url: URL + "/DeleteSectionTnj",
                type: "DELETE",
                data: { key: Id, capabilityConfigurationId: capabilityConfigurationId }
            }).done(function (res) {
                refreshSection(res, capabilityConfigurationId, capability, deviceTypeId, equipment, configuration);
            });
        };
    });
}


function InsertSection() {
    var $select = $('#insertSectionNewRecord');
    debugger;
    $('#itemSectionNewRecordalert').hide();
    $('#valueSectionNewRecordalert').hide();
    $('#typeSectionNewRecordalert').hide();

    var item = $('#itemSectionNewRecord').val();
    var value = $('#valueSectionNewRecord').val();
    var type = $('#typeSectionNewRecord').val();

    if (item == "") {
        $('#itemSectionNewRecordalert').show();
    } else if (value == "") {
        $('#valueSectionNewRecordalert').show();
    } else if (type == "-1") {
        $('#typeSectionNewRecordalert').show();
    } else {
        debugger;
        var schema = $select.attr('data-schema');
        var version = $select.attr('data-version');
        var capability = $select.attr('data-capabilityId');
        var deviceTypeId = $select.attr('data-deviceTypeId');
        var equipment = $select.attr('data-equipmentId');
        var configuration = $select.attr('data-configurationId');
        var Id = $select.attr('data-Id');
        var capabilityConfigurationId = $select.attr('data-capabilityConfigurationId');
        var obj = { Item: item, ParentId: Id, Type: type, Value: value };
        loadingPanel();
        $.ajax({
            url: URL + "/InsertSection",
            type: "POST",
            async: false,
            data:
            {
                values: JSON.stringify(obj),
                schema: schema,
                version: version,
                capability: capability,
                deviceTypeId: deviceTypeId,
                equipment: equipment,
                configuration: configuration,
                Id: capabilityConfigurationId
            }
        }).done(function (res) {
            debugger;
            unloadingPanel();
            refreshSection(res, capabilityConfigurationId, capability, deviceTypeId, equipment, configuration);
            $('#kt_blockui_modal_new_section_record').modal('hide');
        })
    }


}
function InsertMainSection() {
    var $select = $('#insertSectionNewMainRecord');
    debugger;
    $('#itemSectionNewMainRecordalert').hide();
    $('#valueSectionNewMainRecordalert').hide();
    $('#typeSectionNewMainRecordalert').hide();

    var item = $('#itemSectionNewMainRecord').val();
    var value = $('#valueSectionNewMainRecord').val();
    var type = $('#typeSectionNewMainRecord').val();

    if (item == "") {
        $('#itemSectionNewMainRecordalert').show();
    } else if (value == "") {
        $('#valueSectionNewMainRecordalert').show();
    } else if (type == "-1") {
        $('#typeSectionNewMainRecordalert').show();
    } else {
        debugger;
        var schema = $select.attr('data-schema');
        var version = $select.attr('data-version');
        var capability = $select.attr('data-capabilityId');
        var deviceTypeId = $select.attr('data-deviceTypeId');
        var equipment = $select.attr('data-equipmentId');
        var configuration = $select.attr('data-configurationId');
        var Id = $select.attr('data-Id');
        var capabilityConfigurationId = $select.attr('data-capabilityConfigurationId');
        var obj = { Item: item, ParentId: Id, Type: type, Value: value };
        loadingPanel();
        $.ajax({
            url: URL + "/InsertSectionTnj",
            type: "POST",
            async: false,
            data:
            {
                values: JSON.stringify(obj),
                schema: schema,
                version: version,
                capability: capability,
                deviceTypeId: deviceTypeId,
                equipment: equipment,
                configuration: configuration,
                Id: capabilityConfigurationId
            }
        }).done(function (res) {
            debugger;
            unloadingPanel();
            refreshSection(res, capabilityConfigurationId, capability, deviceTypeId, equipment, configuration);
            $('#kt_blockui_modal_new_section_main_record').modal('hide');
        })
    }


}

function EditSection() {

    Swal.fire({
        title: "Update Configuration Info",
        text: "The new configuraiton will be saved as a version. For submission, you need to select the necessary options to enter and send the detail screen of the configuration.",
        icon: "question",
        buttonsStyling: false,
        confirmButtonText: "<i class='la la-headphones'></i> Create",
        showCancelButton: true,
        cancelButtonText: "<i class='la la-thumbs-down'></i> Cancel",
        customClass: {
            confirmButton: "btn btn-danger",
            cancelButton: "btn btn-default"
        }
    }).then(function (result) {
        debugger;
        if (result.isConfirmed == true) {
            var $select = $('#editSection');
            debugger;
            $('#itemSectionEditalert').hide();
            $('#valueSectionEditdalert').hide();
            $('#typeSectionEditalert').hide();

            var item = $('#itemSectionEdit').val();
            var value = $('#valueSectionEdit').val();
            var type = $('#typeSectionEdit').val();

            if (item == "") {
                $('#itemSectionEditalert').show();
            } else if (value == "") {
                $('#valueSectionEditdalert').show();
            } else if (type == "-1") {
                $('#typeSectionEditalert').show();
            } else {
                debugger;
                var schema = $select.attr('data-schema');
                var version = $select.attr('data-version');
                var capability = $select.attr('data-capabilityId');
                var deviceTypeId = $select.attr('data-deviceTypeId');
                var equipment = $select.attr('data-equipmentId');
                var configuration = $select.attr('data-configurationId');
                var Id = $select.attr('data-Id');
                var capabilityConfigurationId = $select.attr('data-capabilityConfigurationId');

                var obj = { Item: item, Type: type, Value: value };
                loadingPanel();
                $.ajax({
                    url: URL + "/UpdateSection",
                    type: "PUT",
                    async: false,
                    data:
                    {
                        key: Id,
                        values: JSON.stringify(obj),
                        schema: schema,
                        version: version,
                        capability: capability,
                        deviceTypeId: deviceTypeId,
                        equipment: equipment,
                        configuration: configuration,
                        Id: capabilityConfigurationId
                    },
                    success: function (result) {
                        unloadingPanel();
                        debugger;
                        refreshSection(result, capabilityConfigurationId, capability, deviceTypeId, equipment, configuration);
                        $('#kt_blockui_modal_edit_section').modal('hide');
                    },
                    error: function (xhr, textStatus, error) {
                        command: toastr.error("Recording Failed..!");
                    }
                });
            }
        }
    });
}

function FillSectionType(processtype) {
    debugger;
    var $select = "";
    loadingPanel();
    $.ajax({
        url: URL + '/FillSectionType',
        type: 'GET',
        async: false,
        success: function (res) {
            debugger;
            unloadingPanel();
            //region select option dolduruluyor..
            if (processtype == 'insert') {
                $select = $('#typeSectionNewRecord'); //Section Insert
            }
            else if (processtype == 'edit') {
                $select = $('#typeSectionEdit');//Section Edit 
            } else if (processtype == 'insertMain') {
                $select = $('#typeSectionNewMainRecord'); //Section Insert
            }

            $select.find('option').remove();
            $select.append('<option value="-1">Choice Type</option>');
            $.each(res, function (key, value) {
                debugger;
                $select.append('<option value=' + value.ID + '>' + value.Name + '</option>');
            });
            //endregion
        },
        error: function (xhr, textStatus, error) {
            //command: toastr["error"]("Komut Gönderilirken Hata Alındı..!");
            toastr.error("Komut Gönderilirken Hata Alındı..!");
            //loadPanel.hide();
        },
        complete: function () {
            //loadPanel.hide();
            //currentKey = -1;
        }
    });
}
jQuery(document).ready(function () {
    KTDatatableChildDataLocalDemo.init();


    $("#kt_datatable_Version").change(function (e) {
        debugger;
        var selectschema = $(this).find(':selected')[0].innerText;
        var schema = selectschema.split('.')[0];
        var version = selectschema.split('.')[3];

        var $select = $('#kt_datatable_Version');
        var capabilityConfigurationId = $select.attr('data-capabilityConfigurationId');
        var capability = $select.attr('data-capabilityId');
        var deviceTypeId = $select.attr('data-deviceTypeId');
        var equipment = $select.attr('data-equipmentId');
        var configuration = $select.attr('data-configurationId');
        loadingPanel();
        $.ajax({
            url: "/ConfigurationManagement/GetVersion",
            type: "GET",
            data: {
                schemaId: schema,
                version: version,
                configuration: capabilityConfigurationId
            },
            success: function (res) {
                debugger;
                unloadingPanel();
                sectionlistgeneral = res;
                if (res !== "") {
                    //GetSection(schema, version, capabilityConfigurationId);
                    GetConfigurationManagerDetail(sectionlistgeneral, schema, version, capabilityConfigurationId, capability, deviceTypeId, equipment, configuration)
                }
            }
        });
    });
});
