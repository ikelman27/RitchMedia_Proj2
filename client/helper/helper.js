const handleError = (message) => {
    alert(message);
    console.log(message);
};

const redirect = (response) => {
    $("#domoMessage").animate({
        width: 'hide'
    }, 350);
    window.location = response.redirect;
}

const sendAjax = (type, action, data, success) => {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: "json",
        success: success,
        error: function (xhr, status, error) {
            console.log("error");
            var messageObj = JSON.parse(xhr.responseText);
            handleError(messageObj.error);
        }
    });
};