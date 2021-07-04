"use strict";

// Class definition
var KTContactsAdd = function () {
    // Base elements
    var _wizardEl;
    var _formEl;
    var _wizard;
    var _avatar;
    var _validations = [];

    // Private functions
    var initWizard = function () {
        debugger;
        // Initialize form wizard
        _wizard = new KTWizard(_wizardEl, {
            startStep: 1, // initial active step number
            clickableSteps: true  // allow step clicking
        });

        // Validation before going to next page
        _wizard.on('beforeNext', function (wizard) {
            debugger;
            // Don't go to the next step yet
            _wizard.stop();

            // Validate form
            var validator = _validations[wizard.getStep() - 1]; // get validator for currnt step
            validator.validate().then(function (status) {
                debugger;
                //if (status == 'Valid') {
                _wizard.goNext();
                KTUtil.scrollTop();
            });
        });

        // Change Event
        _wizard.on('change', function (wizard) {
            KTUtil.scrollTop();
        });
    }

    var initValidation = function () {
        debugger;
        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/

        // Step 1
        _validations.push(FormValidation.formValidation(
            _formEl,
            {
                fields: {
                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap: new FormValidation.plugins.Bootstrap()
                }
            }
        ));

        // Step 2
        _validations.push(FormValidation.formValidation(
            _formEl,
            {
                fields: {
                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap: new FormValidation.plugins.Bootstrap()
                }
            }
        ));
    }

    var initAvatar = function () {
        _avatar = new KTImageInput('kt_contact_add_avatar');
    }

    return {
        // public functions
        init: function () {
            debugger;
            _wizardEl = KTUtil.getById('kt_contact_add');
            _formEl = KTUtil.getById('kt_contact_add_form');

            initWizard();
            initValidation();
            initAvatar();
        }
    };
}();

jQuery(document).ready(function () {
    debugger;
    KTContactsAdd.init();
    GetUpdateUsers();

    //User & Roles tabındaki User dropdown change olduğunda
    $("#userlist").change(function () {
        debugger;
        var userId = $("#userlist").val();
        loadingPanel();
        $.ajax({
            url: "/Authorize/RoleStatus",
            type: "GET",
            data: {
                userId: userId
            },
            success: function (result) {
                debugger;
                var chkArray = [];
                for (var i = 0; i < $('#dvChkRoleList').find('.mcheckbox').length; i++) {
                    debugger;
                    var checkbox = $('#dvChkRoleList').find('.mcheckbox')[i].control.value;
                    chkArray.push(checkbox);
                    $("#dvChkRoleList [type=checkbox]").prop('checked', false);
                }
                for (var j = 0; j < result.length; j++) {
                    debugger;
                    if (jQuery.inArray(result[j].RoleId, chkArray) !== '1') {
                        $("#chkRole_" + result[j].RoleId).prop("checked", true);
                    }
                }
                unloadingPanel();
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

    //User & Menus Tabındaki Roles dropdown change olduğunda
    $("#roles").change(function () {
        debugger;
        var roleId = window.GetRoles();
        loadingPanel();
        $.ajax({
            url: "/Authorize/MenuRoleStatus",
            type: "GET",
            data: {
                roleId: roleId
            },
            success: function (result) {
                debugger;
                var chkArray = [];
                for (var i = 0; i < $('#dvChkMenu').find('.mcheckbox').length; i++) {
                    var checkbox = $('#dvChkMenu').find('.mcheckbox')[i].control.value;
                    chkArray.push(checkbox);
                    $("#dvChkMenu [type=checkbox]").prop('checked', false);
                }
                for (var j = 0; j < result.length; j++) {
                    if (jQuery.inArray(result[j].SubMenuId, chkArray) !== '1') {
                        $("#chkMenu_" + result[j].Id).prop("checked", true);
                    }
                }
                unloadingPanel();
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

});

function GetUpdateUsers() {
    debugger;
    loadingPanel();
    var $select = $('#userlist');
    var dataType = 'application/json; charset=utf-8';
    $.ajax({
        type: 'GET',
        url: '/CreateUser/GetUser',
        dataType: 'json',
        //async: false,
        contentType: dataType,
        //data: data,
        success: function (result) {
            debugger;
            $select.html('');
            $select.append('<option value="' + -1 + '">' + 'User Choice' + '</option>');
            $.each(result, function (index, value) {
                $select.append('<option value="' + value.UserId + '">' + value.UserName + '</option>');
            });

            $select.trigger("chosen:updated");
            unloadingPanel();
        }
    });

};

function InsertUserRoleChange() {
    debugger;
    var userId = $("#userlist").val();
    if (userId === "-1") {
        //command: toastr["warning"]('Select User');
        command: toastr.warning('Select User')
        return false;
    }
    var chkArray = [];
    var roleId = "";
    for (var i = 0; i < $('#dvChkRoleList input[name="checkbox"]:checked').length; i++) {
        var checkbox = $('#dvChkRoleList [type=checkbox]:checked')[i].value;
        chkArray.push(checkbox);
    }
    roleId = chkArray.join(',');
    loadingPanel();
    //loadPanel.show();
    $.ajax({
        url: "/Authorize/InsertUserRoleChange",
        type: "POST",
        data: {
            roleId: roleId,
            userId: userId
        },
        success: function (result) {
            debugger;
            unloadingPanel();
            if (result == "0") {
                // toastr["warning"]('Kullanıcı için seçtiğiniz rol admin ise tüm yetki atamaları yapıldığı için işlem biraz uzun sürecektir.');
                //toastr["success"]('User Change Approved');
                //toastr.success('User Change Approved');
                toastr["success"]('User Change Approved');
            } else {
                toastr.error('Error');
            }
        },
        error: function (xhr, textStatus, error) {
            unloadingPanel();
            command: toastr.error("Recording Failed..!");
        },
        complete: function () {
            unloadingPanel();
        }
    });
}

function InsertNewRole() {
    debugger;
    var roleName = $("#rolename").val();
    if (roleName === "") {
        //command: toastr["warning"]('Role Name Write');
        command: toastr.warning('Role Name Write');
        return false;
    }
    loadingPanel();
    $.ajax({
        url: "/Authorize/InsertNewRole",
        type: "POST",
        data: {
            roleName: roleName
        },
        success: function (result) {
            debugger;
            //$("#dvMessage").html(result);
            $('#modal_newrole').modal('hide');
            if (result == "0") {
                //toastr["success"]('Role Added');
                toastr.success('Role Added');
            }
            else {
                //toastr["error"]('Error');
                toastr.error('Error');
            }
            $.ajax({
                url: "/Authorize/RoleNames",
                type: "GET",
                data: {},
                success: function (result) {
                    debugger;
                    var data = result[result.length - 1];
                    var content = "<label class='checkbox mcheckbox'>" +
                        "<input id='chkRole_" +
                        data.Id +
                        "' type='checkbox' name='checkbox' value='" +
                        data.Id +
                        "'>" +
                        "<span></span>" +
                        data.RoleName +
                        "</label>";
                    $("#dvChkRoleList").append(content);
                    unloadingPanel();
                },
                error: function (xhr, textStatus, error) {
                    unloadingPanel();
                    command: toastr.error("Recording Failed..!");
                },
                complete: function () {
                    unloadingPanel();
                }
            });
            unloadingPanel();
        },
        error: function (xhr, textStatus, error) {
            unloadingPanel();
            command: toastr.error("Recording Failed..!");
        },
        complete: function () {
            unloadingPanel();
        }
    });
}

function EditRole() {
    debugger;
    var roleId = GetRole();
    var roleName = $("#rolenameedit").val();
    if (roleName === "") {
        command: toastr.warning('Role Name Write');
        return false;
    }
    if (roleId === "-1") {
        command: toastr.warning('Select Role Change');
        return false;
    }
    loadingPanel();
    $.ajax({
        url: "/Authorize/EditRole",
        type: "POST",
        data: {
            roleId: roleId,
            roleName: roleName
        },
        success: function (result) {
            debugger;
            //$("#dvMessage").html(result);
            $('#modal_editrole').modal('hide');
            if (result == "0")
                toastr.success('Role Updated');
            else
                toastr.error('Error');
            $.ajax({
                url: "/Authorize/RoleNamesParameter",
                type: "GET",
                data: { roleId: roleId },
                success: function (result) {
                    debugger;
                    var data = result[0];
                    $("#chkRole_" + data.Id).parent().remove();
                    var content = "<label class='checkbox mcheckbox'>" +
                        "<input id='chkRole_" +
                        data.Id +
                        "' type='checkbox' name='checkbox' value='" +
                        data.Id +
                        "'>" +
                        "<span></span>" +
                        data.RoleName +
                        "</label>";
                    $("#dvChkRoleList").append(content);
                    unloadingPanel();
                },
                error: function (xhr, textStatus, error) {
                    command: toastr.error("Recording Failed..!");
                    unloadingPanel();
                },
                complete: function () {
                    unloadingPanel();
                }
            });
            unloadingPanel();
        },
        error: function (xhr, textStatus, error) {
            command: toastr.error("Recording Failed..!");
            unloadingPanel();
        },
        complete: function () {
            unloadingPanel();
        }
    });
}

function DeleteRole() {
    debugger;
    var roleId = GetRoleForRemove();
    if (roleId === "-1") {
        //command: toastr["warning"]('Select Role Delete');
        command: toastr.warning('Select Role Delete');
        return false;
    }
    loadingPanel();
    $.ajax({
        url: "/Authorize/DeleteRole",
        type: "POST",
        data: {
            roleId: roleId
        },
        success: function (result) {
            debugger;
            //$("#dvMessage").html(result);
            $('#modal_removerole').modal('hide');
            $("#chkRole_" + roleId).parent().remove();
            if (result == "0")
                toastr.success('Role Deleted');
            else
                toastr.error('Error');
            loadingPanel();
        },
        error: function (xhr, textStatus, error) {
            command: toastr.error("Recording Failed..!");
            unloadingPanel();
        },
        complete: function () {
            unloadingPanel();
        }
    });
}

function InsertRoleMenuChange() {
    debugger;
    var roleId = window.GetRoles();
    if (roleId === "-1") {
        command: toastr.warning('Select Role');
        return false;
    }
    var chkArray = [];
    var subMenuId = "";
    for (var i = 0; i < $('#dvChkMenu input[name="checkbox"]:checked').length; i++) {
        var checkbox = $('#dvChkMenu [type=checkbox]:checked')[i].value;
        chkArray.push(checkbox);
    }
    subMenuId = chkArray.join(',');
    loadingPanel();
    $.ajax({
        url: "/Authorize/InsertRoleMenuChange",
        type: "POST",
        data: {
            roleId: roleId,
            subMenuId: subMenuId
        },
        success: function (result) {
            debugger;
            //$("#dvMessage").html(result);
            if (result == "0")
                toastr.success('User Change Approved');
            else
                toastr.error('Error');
            unloadingPanel();
        },
        error: function (xhr, textStatus, error) {
            command: toastr.error("Recording Failed..!");
            unloadingPanel();
        },
        complete: function () {
            unloadingPanel();
        }
    });
}

function GetRole() {
    debugger;
    var mSelectedDealer = "";
    var lbl = $('#slRole').val();
    if (lbl === "HI") {
        mSelectedDealer = 'No Data';
    } else {
        var ddl = document.getElementById("slRole");
        if (ddl.options[0].value === "HI") {
            mSelectedDealer = "HI";
        } else if (ddl.selectedIndex === -1) {
            mSelectedDealer = "";
        } else {
            var selectedValueArray = [];
            $("#slRole :selected").each(function () {
                selectedValueArray.push($(this).val());
            });
            mSelectedDealer = selectedValueArray.join(',');
        }
    }
    return mSelectedDealer;
}
function GetRoleForRemove() {
    debugger;
    var mSelectedDealer = "";
    var lbl = $('#slRoleremove').val();
    if (lbl === "HI") {
        mSelectedDealer = 'No Data';
    } else {
        var ddl = document.getElementById("slRoleremove");
        if (ddl.options[0].value === "HI") {
            mSelectedDealer = "HI";
        } else if (ddl.selectedIndex === -1) {
            mSelectedDealer = "";
        } else {
            var selectedValueArray = [];
            $("#slRoleremove :selected").each(function () {
                selectedValueArray.push($(this).val());
            });
            mSelectedDealer = selectedValueArray.join(',');
        }
    }
    return mSelectedDealer;
}