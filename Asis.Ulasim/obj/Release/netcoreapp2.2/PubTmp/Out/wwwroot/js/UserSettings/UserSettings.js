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
            _wizardEl = KTUtil.getById('kt_user_settings');
            _formEl = KTUtil.getById('kt_user_settings_form');

            initWizard();
            initValidation();
            initAvatar();
        }
    };
}();
jQuery(document).ready(function () {
    KTContactsAdd.init();

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

function UpdateUserInfo() {
    debugger;
    var username = $('#username').val();
    var firstname = $('#firstname').val();
    var lastname = $('#lastname').val();
    var identificationNo = $('#identitynumber').val();
    var mobilNumber = $('#phone').val();
    var email = $('#email').val();

    if (CheckField(username, firstname, lastname, email)) {
        loadingPanel();
        $.ajax({
            url: "/UserSettings/PartialUpdateUser",
            type: "POST",
            data: {
                userName: username,
                name: firstname,
                surName: lastname,
                identificationNo: identificationNo,
                mobilNumber: mobilNumber,
                email: email
            },
            success: function (res) {
                debugger;
                $("#dvMessage").html(res);
                //toastr.success(res);
            },
            error: function (xhr, textStatus, error) {
                command: toastr["error"]("Recording Failed..!");
                unloadingPanel();
            },
            complete: function () {
                unloadingPanel();
            }
        });
    }
}

$('#changePassword').click(function () {
    debugger;
    //1.User Information içindeki kaydet butonu gizlendi..
    $('#updateUserInfoDiv').hide();
    //2. Change Password içindeki kaydet butonu gösterildi..
    $('#changePasswordDiv').show();
});
$('#updateUserInfo').click(function () {
    debugger;
    //1.User Information içindeki kaydet butonu gösterildi..
    $('#updateUserInfoDiv').show();
    //2. Change Password içindeki kaydet butonu gizlendi..
    $('#changePasswordDiv').hide();
});

function CheckField(username, firstname, lastname, email) {
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
    } else if (email === "" || !isEmail(email)) {
        $('#emailalert').show();
        return false;
    } else {
        return true;
    }
}
function CheckFieldAlertHide() {
    $('#usernamealert').hide();
    $('#firstnamealert').hide();
    $('#lastnamealert').hide();
    $('#passwordalert').hide();
    $('#emailalert').hide();
}
function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}
function ChangePassword() {
    debugger;
    $('#newpasswordalert').hide();

    var userName = $('#usernameupdate').val();
    var password = $('#newpassword').val();
    var email = $('#emailupdate').val();

    var number = password.match(/\d+/g);
    var upperCase = password.match(/([A-Z]+)/g);
    var lowerCase = password.match(/([a-z]+)/g);

    if (number === null || upperCase === null || lowerCase === null) {
        $('#newpasswordalert').show();
    } else {
        loadingPanel();
        $.ajax({
            url: "/UserSettings/PartialChangePasswordUser",
            type: "POST",
            data: {
                userName: userName,
                password: password,
                email: email
            },
            success: function (res) {
                $("#dvMessage").html(res);
                toastr["success"]("Şifre değiştirildi! ");
            },
            error: function (xhr, textStatus, error) {
                unloadingPanel();
                command: toastr["error"]("Recording Failed..!");
            },
            complete: function () {
                unloadingPanel();
            }
        });
    }
}
$("#btnChange").click(function (e) {
    e.preventDefault();

});