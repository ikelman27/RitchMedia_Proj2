const handleLogin = (e) => {
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
}

const handleSignup = (e) => {
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
}

const loginWindow = (props) => {
    return (
        <form id="loginForm" name="loginForm"
            onSubmit={handleLogin}
            action="/login"
            method="POST"
            className="mainForm"
        >
            <label htmlFor="username"> Username: </label>
            <input id="user" type="text" name="username" placeholder="username" />
            <label htmlFor="pass"> password: </label>
            <input id="pass" type="password" name="pass" placeholder="password" />
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input className="formSubmit" type="submit" value="Sign in" />

        </form>


    );
};

const signupWindow = (props) => {
    return (
        <form id="signupForm" name="signupForm"
            onSubmit={handleSignup}
            action="/signup"
            method="POST"
            className="mainForm"
        >
            <label htmlFor="username"> Username: </label>
            <input id="user" type="text" name="username" placeholder="username" />
            <label htmlFor="pass"> password: </label>
            <input id="pass" type="password" name="pass" placeholder="password" />
            <label htmlFor="pass2"> password: </label>
            <input id="pass2" type="password" name="pass2" placeholder="retype password" />
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input className="formSubmit" type="submit" value="Sign up" />

        </form>


    );
};




//!--- Question for wednesday query selector jquery
const createLoginWindow = (csrf) => {
    ReactDOM.render(React.createElement(loginWindow, { csrf: csrf }),
        document.querySelector("#content")
    );
};

const createSignupWindow = (csrf) => {
    ReactDOM.render(React.createElement(signupWindow, { csrf: csrf }),
        document.querySelector("#content")
    );
};

/*
This
const createSignupWindow = (csrf) => {
    ReactDOM.render(
        <signupWindow csrf={csrf} />,
        document.querySelector("#content")
    );
};

Turns into this with quotes
const createSignupWindow = (csrf) => {
    ReactDOM.render(React.createElement("signupWindow", { csrf: csrf }),
        document.querySelector("#content")
    );
};

*/


const setup = (csrf) => {
    const loginButton = document.querySelector("#loginButton");
    const signupButton = document.querySelector("#signupButton");

    signupButton.addEventListener("click", (e) => {

        e.preventDefault();
        createSignupWindow(csrf);
        return false;
    });

    loginButton.addEventListener("click", (e) => {
        e.preventDefault();
        createLoginWindow(csrf);
        return false;
    });

    createLoginWindow(csrf);

};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function () {

    getToken();
});