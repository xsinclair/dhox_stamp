var CurrentPage,
Latitude = 0,
Longitude = 0,
Age, Gender, Weight, Height;
patient = new Firebase("https://dhoxstamp.firebaseio.com/");

var StampApp = {
  Init: function () {
      console.log("hello new app");
        $this.StampApp.Store;
      },
  Store: {
    Age: function(age){
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
  }

};

$(function () {
  StampApp.Init();
});