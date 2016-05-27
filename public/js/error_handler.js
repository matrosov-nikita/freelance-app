
function success_callback(message) {
    swal({
        type: 'success',
        title: 'Успешно',
        text: message
    })
}

function error_callback(scopeForm,xhr,title) {
    if (xhr.status!=422)
    {
        swal({
            type: 'error',
            title: title,
            text: xhr.message
        })
    }
    else
    {
        for (var key in scopeForm)
        {
            if (scopeForm[key] && scopeForm[key].$error) {
                scopeForm[key].$error = {};
            }
        }
        for (key in xhr.message) {
            scopeForm[key].$error = xhr.message[key].message;
            console.log( scopeForm[key].$error);
        }

    }
}