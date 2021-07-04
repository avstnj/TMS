$("#ddlStations").html("");
$("#slRoute").change(function (e) {
    var hatKodu = $("#slRoute").val();
    $("#slRoute").removeAttr('multiple').removeAttr('data-actions-box');
    $("#ddlStations").html("");
    $("#ddlStations").trigger("chosen:updated");
    if (hatKodu === null || hatKodu.length === 0) { return ""; }
    $.ajax({
        url: "/CicoCharge/GetStations",
        type: "POST",
        data: {
            hatKodu: hatKodu//[i]
        },
        success: function (res) {
            if (res && res.length > 0) {
                loadDurakList(res);
            }
            else {
                toastr["warning"]("Veri bulunmamaktadır.");
                $('#ddlStations').selectpicker('refresh');
            }
        },
    });
    var hatKodu2 = $("#slRoute").val();
    if (hatKodu2 === null || hatKodu2.length === 0) {
        return "";
    }
    function loadDurakList(dataString) {
        var tempData = dataString;
        //var JSONObject = JSON.stringify(tempData);
        var markup = "";
        for (var i = 0; i < tempData.length; i++) {
            markup += "<option value='" + tempData[i].id + "'>" + tempData[i].aciklama +/* ' - ' + tempData[i].durakId +*/"</option>";
        }
        var tmpHtml = $("#ddlStations").html();
        $("#ddlStations").html(tmpHtml + markup);
        $("#ddlStations").trigger("chosen:updated");
        $('#ddlStations').selectpicker('refresh');
    }
});

$('#btnQuery').click(function (e) {
    e.preventDefault();
    var startDate = window.GetStartDateTime();
    var endDate = window.GetEndDateTime();
    var hatKodu = window.GetRoute();
    if (hatKodu === "" || hatKodu === '-1') {
        toastr["error"]("Lütfen hat seçiniz.");
        return;
    }
    else {
        hatKodu = window.GetRoute();
    }
    var durakId = window.GetRouteStation();

    var tripNo = "";
    var planli = $("#chkPlanli").is(":checked");
    if (planli === true) {
        planli = 1;
    }
    else {
        planli = 0;
    }
    var yolcuSayisi = $("#chkYolcuSayisi").is(":checked");
    if (yolcuSayisi === true) {
        yolcuSayisi = 1;
    }
    else {
        yolcuSayisi = 0;
    }
    var saatFarki = $("#chkSaatFarki").is(":checked");
    if (saatFarki === true) {
        saatFarki = 1;
    }
    else {
        saatFarki = 0;
    }
    var beklemeSuresi = $("#chkBeklemeSuresi").is(":checked");
    if (beklemeSuresi === true) {
        beklemeSuresi = 1;
    }
    else {
        beklemeSuresi = 0;
    }


    loadPanel.show();
    $.ajax({
        url: 'CicoCharge/GetCicoCharge',
        type: 'GET',
        data: { startDate: startDate, endDate: endDate, hatKodu: hatKodu, durakId: durakId, tripNo: tripNo, planli: planli, yolcuSayisi: yolcuSayisi, saatFarki: saatFarki, beklemeSuresi: beklemeSuresi },
        success: function (result) {
            $('#dvReportTables').html(result);
        },
        error: function (xhr, textStatus, error) {
            command: toastr["error"]("Recording Failed..!");
            loadPanel.hide();
        },
        complete: function () {
            loadPanel.hide();
        }
    });
});