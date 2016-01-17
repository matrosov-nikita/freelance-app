var config =  {
  server: "http://localhost:8080"
};
$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip();
  $("#logout").click(function() {
    $.ajax({
      type: "post",
      url: "/user/logout"
    }).success(function(response) {
      window.location.href= response;
    });
  });

});
