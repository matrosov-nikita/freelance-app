$(document).ready(function() {

$("#tabs li>a").on("click",function() {
    $("#tabs li").removeClass("active");
    var link = $(this).attr("href");
    $(link).removeClass("active").addClass("fade");
});

    $("#addwork").click(function() {
       $("#upload").slideToggle();
    });
});






