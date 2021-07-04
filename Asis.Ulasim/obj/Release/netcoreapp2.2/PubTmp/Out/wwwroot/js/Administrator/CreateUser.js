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
    KTContactsAdd.init();

    ////1.User Information içindeki alertler gizlendi. 
    //CheckFieldAlertHide();
    ////2.Update Account içindeki alertler gizlendi.
    //CheckFieldEditAlertHide();

    //2.Update Account içindeki kaydet butonu gizlendi..
    $('#updateAccountDiv').hide();
    //2.Update Account altındaki form elemanları gizlendi..
    $('#updateuserdetail').hide();

    $('#addaccount').click(function () {
        debugger;
        //1.User Information içindeki kaydet butonu gösterildi..
        $('#accountsaveBtn').show();
        //2.Update Account içindeki kaydet butonu gizlendi..
        $('#updateAccountDiv').hide();
    });
    $('#editaccount').click(function () {
        debugger;
        //1.User Information içindeki kaydet butonu gizlendi..
        $('#accountsaveBtn').hide();

        //2.Update Account içindeki Userslar çekiliyor...
        GetUpdateUsers();
        //2.Update Account altındaki form elemanları gizlendi..
        $('#updateuserdetail').hide();
    });

    $('#userlist').change(function () {
        debugger;
        //2.Update Account altındaki form elemanları gösterildi..
        $('#updateuserdetail').show();

        FillUserInfoModel();
    });
    //phonesFormat();

    var $phone;
    $('.phone-number').keydown(function (e) {
        debugger;
            var key = e.which || e.charCode || e.keyCode || 0;
            $phone = $(this);

            // Don't let them remove the starting '('
            if ($phone.val().length === 1 && (key === 8 || key === 46)) {
                $phone.val('(');
                return false;
            }
            // Reset if they highlight and type over first char.
            else if ($phone.val().charAt(0) !== '(') {
                $phone.val('(' + $phone.val());
            }

            // Auto-format- do not expose the mask as the user begins to type
            if (key !== 8 && key !== 9) {
                if ($phone.val().length === 4) {
                    $phone.val($phone.val() + ')');
                }
                if ($phone.val().length === 5) {
                    $phone.val($phone.val() + ' ');
                }
                if ($phone.val().length === 9) {
                    $phone.val($phone.val() + '-');
                }
            }

            // Allow numeric (and tab, backspace, delete) keys only
            return (key == 8 ||
                key == 9 ||
                key == 46 ||
                (key >= 48 && key <= 57) ||
                (key >= 96 && key <= 105));
        })

        .bind('focus click', function () {
            $phone = $(this);

            if ($phone.val().length === 0) {
                $phone.val('(');
            }
            else {
                var val = $phone.val();
                $phone.val('').val(val); // Ensure cursor remains at the end
            }
        })

        .blur(function () {
            $phone = $(this);

            if ($phone.val() === '(') {
                $phone.val('');
            }
        });

});

function FillUserInfoModel() {
    debugger;
    var userId = $("#userlist").val();
    loadingPanel();
    $.ajax({
        url: "/CreateUser/PartialUserInfoModel",
        type: "GET",
        data: {
            userId: userId
        },
        success: function (result) {
            unloadingPanel();
            debugger;
            //2.Update Account içindeki kaydet butonu  gösterildi..

            $('#updateAccountDiv').show();

            $("#usernameedit").val(result[0].UserName);
            $("#firstnameedit").val(result[0].FirstName);
            $("#lastnameedit").val(result[0].LastName);
            $("#identitynumberedit").val(result[0].IdentityNumber);
            $("#phoneedit").val(result[0].UserMobile);
            $("#emailedit").val(result[0].UserEmail);
            var active = result[0].IsActive;
            if (active == true) {
                $("#isactiveuser").prop("checked", true);
            } else {
                $("#isactiveuser").prop("checked", false);
            }
        },
        error: function (xhr, textStatus, error) {
            unloadingPanel();
            //command: toastr["error"]("Recording Failed..!");
            toastr.error('Recording Failed..!');
            //loadPanel.hide();
        },
        complete: function () {
            unloadingPanel();
        }
    });
}

function GetUpdateUsers() {
    debugger;
    var $select = $('#userlist');
    var dataType = 'application/json; charset=utf-8';
    loadingPanel();
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

function UpdateAccount() {
    debugger;
    CheckFieldEditAlertHide();

    var userId = $("#userlist").val();
    var usernameedit = $('#usernameedit').val();
    var firstnameedit = $('#firstnameedit').val();
    var lastnameedit = $('#lastnameedit').val();
    var identitynumberedit = $('#identitynumberedit').val();
    var phoneedit = $('#phoneedit').val();
    var emailedit = $('#emailedit').val();
    var isactiveuser = $("#isactiveuser").is(":checked");
    if (isactiveuser == true) {
        isactiveuser = "1";
    } else {
        isactiveuser = "0";
    }
    var task = $('#task').val();

    if (usernameedit === "") {
        $('#usernameeditalert').show();
    } else if (firstnameedit === "") {
        $('#firstnameeditalert').show();
    } else if (lastnameedit === "") {
        $('#lastnameeditalert').show();
    } else if (emailedit === "" || !isEmail(emailedit)) {
        $('#emaileditalert').show();
    }
    else {
        loadingPanel();
        debugger;
        //loadPanel.show();
        $.ajax({
            url: "/CreateUser/UpdateUser",
            type: "POST",
            data: {
                userId: userId,
                userName: usernameedit,
                name: firstnameedit,
                surName: lastnameedit,
                identificationNo: identitynumberedit,
                mobilNumber: phoneedit,
                email: emailedit,
                isAktine: isactiveuser,
                task: task
                //isDelete: isDelete
            },
            success: function (result) {
                debugger;
                unloadingPanel();
                toastr.success(result);
                //$("#m_form_1_msg_update").html(result);
                //$("#m_form_1_msg_update").attr("class", "m-alert m-alert--icon alert alert-danger m--hide");
                //GetUsers();
            },
            error: function (xhr, textStatus, error) {
                unloadingPanel();
                //command: toastr["error"]("Recording Failed..!");
                toastr.error("Recording Failed..!");
                //loadPanel.hide();
            },
            complete: function () {
                unloadingPanel();
                //loadPanel.hide();
                //$("#m_form_1_msg_update").attr("class", "m-alert m-alert--icon alert alert-danger m--hide");
            }
        });
    }

}

function InsertAccount(e) {
    debugger;
    //e.preventDefault();
    var username = $('#username').val();
    var firstname = $('#firstname').val();
    var lastname = $('#lastname').val();
    var password = $('#password').val();
    var identitynumber = $('#identitynumber').val();
    var mobilNumber = $('#phone').val();
    var email = $('#email').val();
    var task = $('#tasks').val();
    var userRole = 1; //$('#userRole option:selected').val();
    var cityname = $('#cityname').val();
    var number = password.match(/\d+/g);
    var upperCase = password.match(/([A-Z]+)/g);
    var lowerCase = password.match(/([a-z]+)/g);

    if (CheckField(username, firstname, lastname, password, identitynumber, mobilNumber, email, number, upperCase, lowerCase)) {
        debugger;
        loadingPanel();
        $.ajax({
            url: "/CreateUser/PartialInsertUser",
            type: "POST",
            data: {
                userName: username,
                password: password,
                name: firstname,
                surName: lastname,
                identificationNo: identitynumber,
                mobilNumber: mobilNumber,
                email: email,
                userRole: userRole,
                cityId: cityId,
                channelCode: channelCode,
                task: task,
                cityName: cityname
            },
            success: function (res) {
                unloadingPanel();
                debugger;
                //toastr.success(res);
            },
            error: function (xhr, textStatus, error) {
                unloadingPanel();
                //toastr.success("Recording Failed..!");
                command: toastr["error"]("Recording Failed..!");
            },
            complete: function () {
                unloadingPanel();
                //$("#m_form_1_msg").attr("class", "m-alert m-alert--icon alert alert-danger m--hide");
            }
        });
    }
}

function DeleteAccount() {
    debugger;
    var userId = $("#userlist").val();

    Swal.fire({
        title: "Caution?",
        text: "Are You Sure You Want To Delete",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: 'Cancel'
    }).then(function (result) {
        debugger;
        if (result.value) {
            loadingPanel();
            //loadPanel.show();
            $.ajax({
                url: '/CreateUser/DeleteUser',
                type: 'POST',
                data: {
                    userId: userId
                },
                success: function (res) {
                    debugger;
                    unloadingPanel();
                    var error = res.includes("toastr['error']");
                    if (error === true) {
                        toastr.error(res);
                        //$("#dvError").html(res);
                    } else {
                        toastr.success("User Deleted..!");
                        //command: toastr["success"]("User Deleted..!");
                    }
                    //GetUsers();
                },
                error: function (xhr, textStatus, error) {
                    unloadingPanel();
                    toastr.error("Error..!");
                    //command: toastr["error"]("Error..!");
                    //loadPanel.hide();
                },
                complete: function () {
                    unloadingPanel();
                }
            });
        }
    });
}

function ResetPassword() {
    debugger;
    var userId = $("#userlist").val();
    var username = $("#usernameedit").val();
    var email = $("#emailedit").val();
    var cityname = $('#cityname').val();
    //loadPanel.show();
    loadingPanel();
    $.ajax({
        url: "/CreateUser/PasswordUpdate",
        type: "POST",
        data: {
            userId: userId,
            userName: username,
            email: email,
            cityName: cityname
        },
        success: function (res) {
            unloadingPanel();
            //toastr["success"]("Resest Password successfully!");
            toastr.success('Resest Password successfully!');
        },
        error: function (xhr, textStatus, error) {
            unloadingPanel();
            //command: toastr["error"]("Recording Failed..!");
            toastr.error('Recording Failed..!');
        },
        complete: function () {
            unloadingPanel();
        }
    });
}

function CheckField(username, firstname, lastname, password, identitynumber, mobilNumber, email, number, upperCase, lowerCase) {
    debugger;
    CheckFieldAlertHide();
    if (username === "") {
        $('#usernamealert').show();
        return false;
    } else if (firstname === "") {
        $('#firstnamealert').show();
        return false;
    } else if (lastname === "") {
        $('#lastnamealert').show();
        return false;
    } else if (password === "" || password.length < 6) {
        $('#passwordalert').show();
        return false;
    } else if (email === "" || !isEmail(email)) {
        $('#emailalert').show();
        return false;
    } else {
        debugger;
        if (number === null || upperCase === null || lowerCase === null) {
            $('#passwordalert').show();
            $('#passwordalert').html('Password must consist of at least one uppercase, one lowercase letter and number...!');
            return false;
        } else {
            return true;
        }
    }
}

function CheckFieldAlertHide() {
    $('#usernamealert').hide();
    $('#firstnamealert').hide();
    $('#lastnamealert').hide();
    $('#passwordalert').hide();
    $('#emailalert').hide();
}
function CheckFieldEditAlertHide() {
    $('#usernameeditalert').hide();
    $('#firstnameeditalert').hide();
    $('#lastnameeditalert').hide();
    $('#emaileditalert').hide();
}

function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

//function phonesFormat() {
//    debugger;
//    var phones = [{ "mask": "(###) ###-####" }, { "mask": "(###) ###-####" }];
//    $('#phone').inputmask({
//        mask: phones,
//        greedy: false,
//        definitions: { '#': { validator: "[0-9]", cardinality: 1 } }
//    });
//    $('#phoneedit').inputmask({
//        mask: phones,
//        greedy: false,
//        definitions: { '#': { validator: "[0-9]", cardinality: 1 } }
//    });
//}

