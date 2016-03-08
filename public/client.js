$(document).ready(function() {
    $("#submit").click(function(e) {
        var $btn=$(this);
        $btn.html("Processing...");
    });
    // call the tablesorter plugin and apply the uitheme widget
    $("#table").tablesorter({
      theme : "ice",
      sortList : [[0,0]],
      widthFixed: true,
      widgets : [ "uitheme", "filter"],
      widgetOptions : {
        // hide the filter row when not active
        filter_hideFilters : true,
        filter_ignoreCase : true,
        filter_reset : 'button.reset'
      }
    });
    
  });