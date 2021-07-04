"use strict";

// Class Definition
var KTLogin = function () {
    var _login;

    var _showForm = function (form) {
        var cls = 'login-' + form + '-on';
        var form = 'kt_login_' + form + '_form';

        _login.removeClass('login-forgot-on');
        _login.removeClass('login-signin-on');
        _login.removeClass('login-signup-on');

        _login.addClass(cls);

        KTUtil.animateClass(KTUtil.getById(form), 'animate__animated animate__backInUp');
    }

    var _handleSignInForm = function () {
        var validation;

        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        validation = FormValidation.formValidation(
            KTUtil.getById('kt_login_signin_form'),
            {
                fields: {
                    //username: {
                    //    validators: {
                    //        notEmpty: {
                    //            message: 'Username is required'
                    //        }
                    //    }
                    //},
                    //password: {
                    //    validators: {
                    //        notEmpty: {
                    //            message: 'Password is required'
                    //        }
                    //    }
                    //}
                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    submitButton: new FormValidation.plugins.SubmitButton(),
                    //defaultSubmit: new FormValidation.plugins.DefaultSubmit(), // Uncomment this line to enable normal button submit after form validation
                    bootstrap: new FormValidation.plugins.Bootstrap()
                }
            }
        );

        $('#kt_login_signin_submit').on('click', function (e) {
            e.preventDefault();

            var userName = $('#userName').val();
            var password = $('#Password').val();
            var remember = $("#Remember").is(":checked"); 

            SignIn(userName, password, remember);

        });

        // Handle forgot button
        $('#kt_login_forgot').on('click', function (e) {
            e.preventDefault();
            _showForm('forgot');
        });

        // Handle signup
        $('#kt_login_signup').on('click', function (e) {
            e.preventDefault();
            _showForm('signup');
        });
    }

    var _handleSignUpForm = function (e) {
        var validation;
        var form = KTUtil.getById('kt_login_signup_form');

        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        validation = FormValidation.formValidation(
            form,
            {
                fields: {
                    fullname: {
                        validators: {
                            notEmpty: {
                                message: 'Username is required'
                            }
                        }
                    },
                    email: {
                        validators: {
                            notEmpty: {
                                message: 'Email address is required'
                            },
                            emailAddress: {
                                message: 'The value is not a valid email address'
                            }
                        }
                    },
                    password: {
                        validators: {
                            notEmpty: {
                                message: 'The password is required'
                            }
                        }
                    },
                    cpassword: {
                        validators: {
                            notEmpty: {
                                message: 'The password confirmation is required'
                            },
                            identical: {
                                compare: function () {
                                    return form.querySelector('[name="password"]').value;
                                },
                                message: 'The password and its confirm are not the same'
                            }
                        }
                    },
                    agree: {
                        validators: {
                            notEmpty: {
                                message: 'You must accept the terms and conditions'
                            }
                        }
                    },
                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap: new FormValidation.plugins.Bootstrap()
                }
            }
        );

        $('#kt_login_signup_submit').on('click', function (e) {
            e.preventDefault();

        });

        // Handle cancel button
        $('#kt_login_signup_cancel').on('click', function (e) {
            e.preventDefault();

            _showForm('signin');
        });
    }

    var _handleForgotForm = function (e) {
        var validation;

        // Handle submit button
        $('#kt_login_forgot_submit').on('click', function (e) {
            e.preventDefault();
            debugger;
            CheckSignInFieldAlertHide(); 
            var email = $('#email').val();
            var userName = $('#fullname').val();

            ForgotPassword(email, userName);

        });

        // Handle cancel button
        $('#kt_login_forgot_cancel').on('click', function (e) {
            e.preventDefault();

            _showForm('signin');
        });
    }

    // Public Functions
    return {
        // public functions
        init: function () {
            _login = $('#kt_login');

            _handleSignInForm();
            _handleSignUpForm();
            _handleForgotForm();
        }
    };
}();

// Class Initialization
jQuery(document).ready(function () {
    KTLogin.init();
    CheckSignInFieldAlertHide();
});

function CheckSignInFieldAlertHide() {
    $('#usernamealert').hide();
    $('#passwordalert').hide();
    $('#emailalert').hide();
    $('#userNamealert').hide();
}

function SignIn(userName, password, remember) {
    if (userName === "") {
        $('#usernamealert').show();
    } else if (password === "") {
        $('#passwordalert').show();
    } else {
        loadingPanel();
        $.ajax({
            url: "/Account/IndexTnj",
            type: "POST",
            data: {
                UserName: userName,
                Password: password,
                Remember: remember
            },
            success: function (res) {
                unloadingPanel();
                if (!res) {
                    toastr.warning('Giriş Başarısız. Kullanıcı Adınızı veya Şifrenizi Kontrol Ediniz..!');
                }
                else {
                    window.location = '/Home/IndexTnj';
                }
            },
            error: function (xhr, textStatus, error) {
                unloadingPanel();
                toastr.error("Recording Failed..!");
            },
            complete: function () {
                unloadingPanel();
            }
        });
    }
}

function ForgotPassword(email, userName) {
    if (userName === "") {
        $('#userNamealert').show();
    } else if (email === "" || !isEmail(email)) {
        $('#emailalert').show();
    } else {
        loadingPanel();
        $.ajax({
            url: "/Account/ForgetPassword",
            type: "POST",
            data: {
                fullname: userName,
                email: email
            },
            success: function (res) {
                unloadingPanel();
                toastr.success('Guzel! Sifre kurtarma talimati e-postaniza gonderilmistir.');
                $("#kt_login_forgot_cancel").trigger("click");
            },
            error: function (xhr, textStatus, error) {
                unloadingPanel();
                toastr.error("Kullanıcı Adı ile Mail Adresi Uyuşmamaktadır..!");
            },
            complete: function () {
                unloadingPanel();
            }
        });

    }


}

function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}
