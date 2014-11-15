var CurrentPage,
Latitude = 0,
Longitude = 0,
Age, Gender, Weight, Height;
patient = new Firebase("https://dhoxstamp.firebaseio.com/");

var StampApp = {
  Init: function () {
    $(".btn[data-attr-next]").on("click",function(){
      var next = $(this).attr("data-attr-next");
      if(next == "complete"){
        StampApp.Store.Complete();
      }else{
        StampApp.Page.Switch(next);
      }
    });
  },
  Page: {
    Check:function(page){
      switch (page) {
        case 1:
          if($("input[name=year]").val() === "" && $("input[name=month]").val() === ""){
            StampApp.Error("You must say what age the baby is.");
            return false;
          }
            Age = StampApp.Store.Age($("input[name=year]").val(), $("input[name=month]").val());
          break;
        case 2:
          if(!$("input[name=female]").prop("checked") && !$("input[name=male]").prop("checked")){
            StampApp.Error("You must select what gender the baby is.");
            return false;
          }
          if($("input[name=female]").prop("checked")){
            Gender = StampApp.Store.Gender("F");
          }else{
            Gender = StampApp.Store.Gender("M");
          }
          break;
        case 3:
			$.getJSON("content/data.json", function(data) {
				var items = [];
				  $.each( data, function( key, val ) {
					items.push( "<li id='" + key + "'>" + val + "</li>" );
				  });
				 
				  $( "<ul/>", {
					"class": "my-new-list",
					html: items.join( "" )
				  }).appendTo( "body" );
			});
//			var jsonData, monthselection = '0  months';
//			json.boys.height[monthselection]
          if($("input[name=height]").val() === ""){
            StampApp.Error("Height is required to continue.");
            return false;
          }
          Height = $("input[name=height]").val();
          break;
        case 4:
          if($("input[name=weight]").val() === ""){
            StampApp.Error("You must enter the weight of the baby.");
            return false;
          }
          Weight = $("input[name=weight]").val();
          break;
      }
    },
    Switch:function(next){
      StampApp.Page.Check(next - 1);
      CurrentPage = next;
      $(".step").slideUp("fast",function(){
        $(".step[data-attr-num="+CurrentPage+"]").slideDown("fast");
      });
    }
  },
  Store: {
    Age: function(year, month){
      //format date
      if(month === ""){
        month = 0;
      }
      if(year === ""){
        year = 0;
      }
      age = (year * 12) + month;
      return age;
    },
    Gender: function(gender){
      return gender;
    },
    Weight: function(weight){
      // grams integer
      return weight;
    },
    Height: function(height){
      // mm
      return height;
    },
    Complete:function(){
      patient.child("records").push(
        {
          "age": Age,
          "gender": Gender,
          "weight":Weight,
          "height":Height,
          "longitude":Longitude,
          "latitude":Latitude,
        },
        console.log("push")
      );
    }
  },
  Error: {
    Message: function(errorMessage){
      $(".error p.message").append(errorMessage);
    }
  },
  Calculation:{
    Init:function(){

    }
  }
};


function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
}
function showPosition(position) {
    Latitude = position.coords.latitude;
    Longitude = position.coords.longitude; 
}

$(function () {
  getLocation();
  StampApp.Init();
});