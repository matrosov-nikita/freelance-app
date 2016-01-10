var html="";
$(document).ready(function() {

$.ajax({
    type: "POST",
    url: "/category/get",
    success: function(result) {
        console.log(result);
        parseData(result,null);
            $("#list_category").html(html);
        }
    });

    $("#list_category").on('click','li a', function() {
        var arr = $(this).siblings('ul');
        if (arr.length==1) {
            $(arr[0]).slideToggle();
        } else {
            $('#list_category a').css("background-color","#2B3E50").removeClass("active");
            $(this).css("background-color","red").addClass("active");
        }
    });


var byParent = function(data, parent){
    var arrayCopy = data.slice(0);
    return arrayCopy.filter(function(element) {
        return element.parent === parent;
    }).map(function(el){
        return {
            id: el._id,
            name: el.name,
            ordersPerMonth: el.ordersPerMonth
        }
    });
};

var parseData = function(data, parent){
    var result = byParent(data, parent);
    if (result.length>0) {
        html += "<ul>";
        result.forEach(function (element) {
            console.log(element);
            if (byParent(data,element.id).length==0) {
                html += "<li class='last'>"+ "<a data-id=" + element.id + ">" +  element.name +"("+element.ordersPerMonth + ")" +  "</a>";
                element.children = parseData(data, element.id);
            }
            else {
            html += "<li>" + "<a data-id=" + element.id + ">" +  element.name + "</a>";
            element.children = parseData(data, element.id);
        }
        });
        html += "</ul>";
    }
    return result;
};

});
