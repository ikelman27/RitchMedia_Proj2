"use strict";

var handleLogin = function handleLogin(e) {
    e.preventDefault();
    $("#domoMessage").animate({
        width: 'hide'
    }, 350);

    if ($("#user").val() == '' || $("#pass").val() == '') {
        handleError("Username or password is empty");
        return false;
    }

    console.log($("input[name=_csrf").val());

    sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);
    return false;
};

var handleSignup = function handleSignup(e) {
    console.log("test");
    e.preventDefault();
    $("#domoMessage").animate({
        width: 'hide'
    }, 350);

    if ($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
        handleError(" Username or password is empty");
        return false;
    }

    if ($("#pass").val() !== $("#pass2").val()) {
        handleError(" Passwords do not match");
        return false;
    }

    sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), redirect);
    return false;
};

var loginWindow = function loginWindow(props) {
    return React.createElement(
        "form",
        { id: "loginForm", name: "loginForm",
            onSubmit: handleLogin,
            action: "/login",
            method: "POST",
            className: "mainForm"
        },
        React.createElement(
            "label",
            { htmlFor: "username" },
            " Username: "
        ),
        React.createElement("input", { id: "user", type: "text", name: "username", placeholder: "username" }),
        React.createElement(
            "label",
            { htmlFor: "pass" },
            " password: "
        ),
        React.createElement("input", { id: "pass", type: "password", name: "pass", placeholder: "password" }),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { className: "formSubmit", type: "submit", value: "Sign in" })
    );
};

var signupWindow = function signupWindow(props) {
    return React.createElement(
        "form",
        { id: "signupForm", name: "signupForm",
            onSubmit: handleSignup,
            action: "/signup",
            method: "POST",
            className: "mainForm"
        },
        React.createElement(
            "label",
            { htmlFor: "username" },
            " Username: "
        ),
        React.createElement("input", { id: "user", type: "text", name: "username", placeholder: "username" }),
        React.createElement(
            "label",
            { htmlFor: "pass" },
            " password: "
        ),
        React.createElement("input", { id: "pass", type: "password", name: "pass", placeholder: "password" }),
        React.createElement(
            "label",
            { htmlFor: "pass2" },
            " password: "
        ),
        React.createElement("input", { id: "pass2", type: "password", name: "pass2", placeholder: "retype password" }),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { className: "formSubmit", type: "submit", value: "Sign up" })
    );
};

var createLoginWindow = function createLoginWindow(csrf) {
    ReactDOM.render(React.createElement(loginWindow, { csrf: csrf }), document.querySelector("#content"));
};

var createSignupWindow = function createSignupWindow(csrf) {
    ReactDOM.render(React.createElement(signupWindow, { csrf: csrf }), document.querySelector("#content"));
};

var setup = function setup(csrf) {
    var loginButton = document.querySelector("#loginButton");
    var signupButton = document.querySelector("#signupButton");

    signupButton.addEventListener("click", function (e) {

        e.preventDefault();
        createSignupWindow(csrf);
        return false;
    });

    loginButton.addEventListener("click", function (e) {
        e.preventDefault();
        createLoginWindow(csrf);
        return false;
    });

    createLoginWindow(csrf);
};

var getToken = function getToken() {
    sendAjax('GET', '/getToken', null, function (result) {
        setup(result.csrfToken);
    });
};

$(document).ready(function () {

    getToken();
});
"use strict";

var handleError = function handleError(message) {
    alert(message);
    console.log(message);
};

var redirect = function redirect(response) {
    $("#domoMessage").animate({
        width: 'hide'
    }, 350);
    window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {

    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: "json",
        success: success,
        error: function error(xhr, status, _error) {
            console.log("error");
            var messageObj = JSON.parse(xhr.responseText);
            handleError(messageObj.error);
        }
    });
};
