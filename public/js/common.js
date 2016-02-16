function convertToFormData(obj) {
    var formData = new FormData();
    Object.keys(obj).forEach((item)=> {
        formData.append(item,obj[item]);
    });
    return formData;
}