'use strict';
// Class definition
var URL = "/Monitoring";
var KTDatatableDataLocalDemox = function () {
    // Private functions

    var dataJSONArray = '';
    // demo initializer
    var mainTableInit = function () {
        debugger;
        dataJSONArray = GetMasterMonitoring();

        var datatable = kt_datatablex(dataJSONArray);
    };

    var initDatatableModal2 = function () {
        debugger;

        var modal = $('#kt_datatable_modal_2');

        var datatable = $('#kt_datatable_2').KTDatatable({
            // datasource definition
            data: {
                type: 'local',
                source: dataJSONArray[0].BanknNoteHopperTape,
                pageSize: 10,
            },

            // layout definition
            layout: {
                scroll: true, // enable/disable datatable scroll both horizontal and vertical when needed.
                height: 400, // datatable's body's fixed height
                minHeight: 400,
                footer: false, // display/hide footer
            },

            // column sorting
            sortable: true,

            pagination: false,

            //search: {
            //    input: modal.find('#kt_datatable_search_query_3'),
            //    key: 'generalSearch'
            //},

            // columns definition
            columns: [
                {
                    field: 'Name',
                    title: 'Name ID',
                    textAlign: 'center',
                    autoHide: false,
                }, {
                    field: 'No',
                    title: 'No',
                    textAlign: 'center',
                    autoHide: false,
                }, {
                    field: 'Type',
                    title: 'Type',
                    textAlign: 'center',
                    autoHide: false,
                }, {
                    field: 'Count',
                    title: 'Count',
                    textAlign: 'center',
                    autoHide: false,
                },
            ]
        });
        // fix datatable layout after modal shown
        datatable.hide();

        var alreadyReloaded = false;
        modal.on('shown.bs.modal', function () {
            if (!alreadyReloaded) {
                var modalContent = $(this).find('.modal-content');
                datatable.spinnerCallback(true, modalContent);

                datatable.reload();

                datatable.on('datatable-on-layout-updated', function () {
                    datatable.show();
                    datatable.spinnerCallback(false, modalContent);
                    datatable.redraw();
                });

                alreadyReloaded = true;
            }
        });
    };

    var initDatatableModal3 = function () {
        debugger;
        var modal = $('#kt_datatable_modal_3');

        var datatable = $('#kt_datatable_3').KTDatatable({
            // datasource definition
            data: {
                type: 'local',
                source: dataJSONArray[0].Alarms,
                pageSize: 10,
            },

            // layout definition
            layout: {
                scroll: true, // enable/disable datatable scroll both horizontal and vertical when needed.
                height: 400, // datatable's body's fixed height
                minHeight: 400,
                footer: false, // display/hide footer
            },

            // column sorting
            sortable: true,

            pagination: false,

            //search: {
            //    input: modal.find('#kt_datatable_search_query'),
            //    delay: 400,
            //    key: 'generalSearch'
            //},

            // columns definition
            columns: [
                {
                    field: 'createDate',
                    title: 'Create Date',
                    type: 'date',
                    format: "dd/MM/yy HH:mm:ss"
                }, {
                    field: 'alarm',
                    title: 'Alarm',
                    template: function (row) {
                        debugger;
                        var result = '';
                        if (row.alarm == true) {
                            result += "<div style='color: green; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        else {
                            result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        return result;;
                    },
                },
                {
                    field: 'connection',
                    title: 'Server Status',
                    template: function (row) {
                        debugger;
                        var result = '';
                        if (row.connection == true) {
                            result += "<div style='color: green; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        else {
                            result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        return result;;
                    },
                }, {
                    field: 'printerLED',
                    title: 'printerLED',
                    textAlign: 'left',
                    witdh: 55,
                    template: function (row) {
                        debugger;
                        var result = '';
                        if (row.printerLED == true) {
                            result += "<div style='color: green; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        else {
                            result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        return result;;
                    },
                }, {
                    field: 'banknoteHopperLED',
                    title: 'banknoteHopperLED',
                    textAlign: 'left',
                    witdh: 170,
                    template: function (row) {
                        debugger;
                        var result = '';
                        if (row.banknoteHopperLED == true) {
                            result += "<div style='color: green; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        else {
                            result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        return result;;
                    },
                }, {
                    field: 'coinHopperLED',
                    title: 'coinHopperLED',
                    textAlign: 'left',
                    witdh: 180,
                    template: function (row) {
                        debugger;
                        var result = '';
                        if (row.coinHopperLED == true) {
                            result += "<div style='color: green; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        else {
                            result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        return result;;
                    },
                }, {
                    field: 'coinAcceptorLED',
                    title: 'coinAcceptorLED',
                    textAlign: 'left',
                    witdh: 160,
                    template: function (row) {
                        debugger;
                        var result = '';
                        if (row.coinAcceptorLED == true) {
                            result += "<div style='color: green; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        else {
                            result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        return result;;
                    },
                },
                //{
                //    field: 'pc',
                //    title: 'pc',
                //    textAlign: 'left',
                //    width: 40,
                //    template: function (row) {
                //        debugger;
                //        var result = '';
                //        if (row.pc == true) {
                //            result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                //        }
                //        else {
                //            result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                //        }
                //        return result;;
                //    },
                //},
                {
                    field: 'antiPin',
                    title: 'antiPin',
                    textAlign: 'left',
                    width: 55,
                    template: function (row) {
                        debugger;
                        var result = '';
                        if (row.antiPin == true) {
                            result += "<div style='color: green; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        else {
                            result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        return result;;
                    },
                }, {
                    field: 'lcdFan',
                    title: 'lcdFan',
                    textAlign: 'left',
                    width: 55,
                    template: function (row) {
                        debugger;
                        var result = '';
                        if (row.lcdFan == true) {
                            result += "<div style='color: green; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        else {
                            result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        return result;;
                    },
                }, {
                    field: 'frontDoorImpact',
                    title: 'frontDoorImpact',
                    textAlign: 'left',
                    witdh: 110,
                    template: function (row) {
                        debugger;
                        var result = '';
                        if (row.frontDoorImpact == true) {
                            result += "<div style='color: green; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        else {
                            result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        return result;;
                    },
                }, {
                    field: 'coinAcceptorFullness',
                    title: 'coinAcceptorFullness',
                    textAlign: 'left',
                    witdh: 110,
                    template: function (row) {
                        debugger;
                        var result = '';
                        if (row.coinAcceptorFullness == true) {
                            result += "<div style='color: green; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        else {
                            result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        return result;;
                    },
                }, {
                    field: 'electricity',
                    title: 'electricity',
                    textAlign: 'left',
                    template: function (row) {
                        debugger;
                        var result = '';
                        if (row.electricity == true) {
                            result += "<div style='color: green; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        else {
                            result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        return result;;
                    },
                }, {
                    field: 'hopperCabinCover',
                    title: 'hopperCabinCover',
                    textAlign: 'left',
                    witdh: 110,
                    template: function (row) {
                        debugger;
                        var result = '';
                        if (row.hopperCabinCover == true) {
                            result += "<div style='color: green; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        else {
                            result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        return result;;
                    },
                }, {
                    field: 'cabinCover',
                    title: 'cabinCover',
                    textAlign: 'left',
                    template: function (row) {
                        debugger;
                        var result = '';
                        if (row.cabinCover == true) {
                            result += "<div style='color: green; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        else {
                            result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                        }
                        return result;;
                    },
                }, {
                    field: 'cabinInternalTemperature',
                    title: 'cabinInternalTemperature',
                    textAlign: 'left',
                    witdh: 110,
                }, {
                    field: 'lcdTemperature',
                    title: 'lcdTemperature',
                    textAlign: 'left',
                }],
        });

        $('#kt_datatable_search_status_4').on('change', function () {
            datatable.search($(this).val().toLowerCase(), 'Status');
        });

        $('#kt_datatable_search_type_4').on('change', function () {
            datatable.search($(this).val().toLowerCase(), 'Type');
        });

        $('#kt_datatable_search_status_4, #kt_datatable_search_type_4').selectpicker();

        // fix datatable layout after modal shown
        datatable.hide();
        var alreadyReloaded = false;
        modal.on('shown.bs.modal', function () {
            if (!alreadyReloaded) {
                var modalContent = $(this).find('.modal-content');
                datatable.spinnerCallback(true, modalContent);

                datatable.reload();

                datatable.on('datatable-on-layout-updated', function () {
                    datatable.show();
                    datatable.spinnerCallback(false, modalContent);
                    datatable.redraw();
                });

                alreadyReloaded = true;
            }
        });
    };

    return {
        // Public functions
        init: function () {
            // init dmeo
            mainTableInit();
            if (dataJSONArray != '') {
                initDatatableModal2();
                initDatatableModal3();
            }
        },
    };
}();

jQuery(document).ready(function () {
    KTDatatableDataLocalDemox.init();

});

function kt_datatablex(dataJSONArray) {
    debugger;
    var datatable = $('#kt_datatable').KTDatatable({
        // datasource definition
        data: {
            type: 'local',
            source: dataJSONArray,
            pageSize: 10,
        },

        // layout definition
        layout: {
            //theme: 'default',
            scroll: false,
            //height: null,
            footer: false,
        },

        // column sorting
        sortable: true,

        pagination: false,

        //search: {
        //    input: $('#kt_datatable_search_query'),
        //    key: 'generalSearch'
        //},

        // columns definition
        columns: [
            {
                field: 'DeviceId',
                title: 'Device Id',
                //sortable: false,
                //width: 30,
                textAlign: 'center',
                //visible: false,
            }, {
                field: 'DeviceType',
                title: 'Device Type',
                textAlign: 'center',
            }, {
                field: 'CreateDate',
                title: 'Create Date',
                textAlign: 'center',
                type: 'date',
                format: 'dd/MM/yy HH:mm:ss',
            }, {
                field: 'BankNoteAcceptorStatus',
                title: 'Bank Note Acceptor Status',
                textAlign: 'center',
                //autoHide: false,
                template: function (row) {
                    debugger;
                    var result = '';
                    if (row.BankNoteAcceptorStatus == true) {
                        result += "<div style='color: green; font-size:40px;text-align:center'>" + "●" + "</div>"
                    }
                    else {
                        result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                    }
                    return result;;
                },
            },
            {
                field: 'BanknNoteHopperStatus',
                title: 'Bank Note Hopper Status',
                textAlign: 'center',
                template: function (row) {
                    debugger;
                    var result = '';
                    if (row.BanknNoteHopperStatus == true) {
                        result += "<div style='color: green; font-size:40px;text-align:center'>" + "●" + "</div>"
                    }
                    else {
                        result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                    }
                    return result;;
                },
            },
            {
                field: 'BankNoteAcceptorCount',
                title: 'Bank Note Acceptor Amount',
                textAlign: 'center',
            },
            {
                field: 'CoinAcceptorStatus',
                title: 'Coin Acceptor Status',
                textAlign: 'center',
                template: function (row) {
                    debugger;
                    var result = '';
                    if (row.CoinAcceptorStatus == true) {
                        result += "<div style='color: green; font-size:40px;text-align:center'>" + "●" + "</div>"
                    }
                    else {
                        result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                    }
                    return result;;
                },
            },
            {
                field: 'CoinHopperStatus',
                title: 'Coin Hopper Status',
                textAlign: 'center',
                template: function (row) {
                    debugger;
                    var result = '';
                    if (row.CoinHopperStatus == true) {
                        result += "<div style='color: green; font-size:40px;text-align:center'>" + "●" + "</div>"
                    }
                    else {
                        result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                    }
                    return result;;
                },
            },
            {
                field: 'CoinAcceptorCount',
                title: 'Coin Acceptor Amount',
                textAlign: 'center',
            },
            {
                field: 'CardReaderStatus',
                title: 'Card Reader Status',
                textAlign: 'center',
                template: function (row) {
                    debugger;
                    var result = '';
                    if (row.CardReaderStatus == true) {
                        result += "<div style='color: green; font-size:40px;text-align:center'>" + "●" + "</div>"
                    }
                    else {
                        result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                    }
                    return result;;
                },
            },
            {
                field: 'TicketPrinterStatus',
                title: 'Ticket Printer Status',
                textAlign: 'center',
                template: function (row) {
                    debugger;
                    var result = '';
                    if (row.TicketPrinterStatus == true) {
                        result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                    }
                    else {
                        result += "<div style='color: red; font-size:40px;text-align:center'>" + "●" + "</div>"
                    }
                    return result;;
                },
            },
            {
                field: 'TicketPrinterCount',
                title: 'Ticket print total',
                textAlign: 'center',
            },
            {
                field: 'TicketPrinterTotal',
                title: 'Ticket Printer Toplam',
                textAlign: 'center',
            },
            {
                field: 'ApplicationVersion',
                title: 'Applicatio Version',
                textAlign: 'center',
            },
        ],
    });
    return datatable;
}

function GetMasterMonitoring() {
    debugger;
    var dataJSONArray = '';
    $.ajax({
        url: URL + '/GetMonitoringDetail',
        type: 'GET',
        async: false,
        success: function (res) {
            debugger;
            dataJSONArray = res;
        },
        error: function (xhr, textStatus, error) {
            //command: toastr["error"]("Komut Gönderilirken Hata Alındı..!");
            toastr.error("Komut Gönderilirken Hata Alındı..!");
            //loadPanel.hide();
        },
        complete: function () {
            //loadPanel.hide();
        }
    });
    return dataJSONArray;
}