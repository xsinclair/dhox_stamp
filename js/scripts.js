var patient = new Firebase("https://dhoxstamp.firebaseio.com/");
var StampApp = {
  Init: function () {
    //check if theres records that haven't been pushed
    // if so push

    $(".next").on("click",function(){
      var next_page = $(this).attr("next_page");
      StampApp.Page.Switch(next_page);
    });
  },
  Storage : function(){
    CurrentPage = 0;
    Latitude = 0;
    Longitude = 0;
  },
  Page: {
    Load:{
      
    },
    Switch:function(next){
      StampApp.Storage.CurrentPage = next;
      $(".step").slideUp("fast",function(){
        $(".step[number="+StampApp.Storage.CurrentPage+"]").slideDown("fast");
      });
    }
  },
  Store: {
    Init: function(){
      patient.child("records");
      StampApp.GeoLocation.Get();
    },
    Age: function(dob){
      //format date
      // months
      // integer
      return patient.set({"dob":dob});
    },
    Gender: function(gender){
      // format gender
      // M/F/O
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
    Complete:function(age, gender, weight){
      patient.push(
        {
          "age": StampApp.Store.Age(age),
          "gender": StampApp.Store.Gender(gender),
          "weight":StampApp.Store.weight(weight),
          "height":StampApp.Store.Height(height),
          "longitude":StampApp.Storage.Longitude,
          "latitude":StampApp.Storage.Latitude,
        }
      );
    }
  },
  Calculation:{
    Init:function(){

    }
  },
  GeoLocation:{
    Get: function(){
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(ShowPosition);
      }
    },
    ShowPosition: function(position){
      StampApp.Storage.Latitude = position.coords.latitude;
      StampApp.Storage.Longitude = position.coords.longitude;
    }
  }
};


$(function () {
  StampApp.Init();
});