var config =  {
  server: "http://localhost:8080"
};
$(document).ready(function() {
  $("#logout").click(function() {
    $.ajax({
      type: "post",
      url: "/user/logout"
    }).success(function(response) {
      window.location.href= response;
    });
  });
});
