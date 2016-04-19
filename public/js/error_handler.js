
function success_callback(message) {
    swal({
        type: 'success',
        title: 'Успешно',
        text: message
    })
}

function error_callback(scopeForm,xhr) {
    if (xhr.status!=422)
    {
        swal({
            type: 'error',
            title: 'Ошибка авторизации',
            text: xhr.message
        })
    }
    else
    {
        console.log(xhr);
        for (var key in scopeForm)
        {
            if (scopeForm[key] && scopeForm[key].$error) {
                scopeForm[key].$error = {};
            }
        }
        console.log(scopeForm);
        for (key in xhr.message) {
            scopeForm[key].$error = xhr.message[key].message;
        }

    }
}