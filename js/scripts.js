var CurrentPage,
Latitude = 0,
Longitude = 0,
Age, Gender, Weight, Height;
patient = new Firebase("https://dhoxstamp.firebaseio.com/");

var text = '{"boys": {' +
	'"height": [' +
	'  {"upto": 0, "values": [44.8,46.1,47.9,49.5,51,52.5,54.1,55.9,57.1]},' +
	'  {"upto": 2, "values": [53.1,54.5,55.8,57.1,58.4,59.8,61.1,62.5,63.7]}' +
	'],' +
	'"weight": ' +
	'[' +
	'  {"upto": 0, "values": [2.17,2.5,2.83,3.16,3.5,3.84,4.17,4.5,4.84]},' +
	'  {"upto": 2, "values": [3.95,4.3,4.7,5.12,5.56,6.05,6.55,7.2,7.65]}' +
	']' +
	'},' +
'"girls": {' +
        '"height": ' +
        '[' +
        '    {"upto": 0, "values": [44.7,46,47.3,48.6,50,51.3,52.7,54,55.3  ]},' +
        '    {"upto": 2, "values": [51.6,53,54.3,55.7,57,58.5,59.8,61.1,62.5  ]}' +
        '],' +
        '    "weight": ' +
        '[' +
        '    {"upto": 0, "values": [2.1,2.4,2.7,3.04,3.36,3.68,4,4.3,4.6  ]},' +
        '    {"upto": 2, "values": [3.6,3.9,4.3,4.7,5.12,5.6,6.1,6.6,7.2  ]}' +
        ']' +
	'}' +
'}';

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
            console.log(Age);
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
          
          
          console.log(Gender);
          
          var obj = JSON.parse(text);
          console.log(obj);
 //         $.getJSON(obj, function(data) {
 //             console.log("test");
 //             var items = [];
 //             $.each( data, function( key, val ) {
 //               items.push( "<li id='" + key + "'>" + val + "</li>" );
 //             });
//
 //             $( "<ul/>", {
 //               "class": "my-new-list",
 //                 html: items.join( "" )
 //             }).appendTo( "body" );
 //         });
        
          var jsonData, genderSelection = Gender, monthselection = Age;
          if(genderSelection === "M"){
            jsonData = obj.boys.height;
            alert("Hello! I am an alert box!!");
            console.log("step1");
            console.log(jsonData[0].upto);
            console.log("step2");
            console.log(jsonData[0]);
            alert("Hello! I am an alert box!!ttrr");
                var heightarray;
                var i=0;
                var j;
                while (monthselection > i) {
                    alert("loop");
                    i++;
                    j =jsonData[i].upto;
                    if (j == monthselection){
                        console.log("tetdtgdggd");
                        heightarray = jsonData[i].upto[i].values;
                        console.log(heightarray);
                    }
//                    console.log(i);
//                    console.log(j);
//                    heightarrayindex = jsonData[i].upto[j];
//                    console.log(heightarrayindex);
//                    heightarray = jsonData[i].upto[j].values;
//                    console.log(heightarray);
                }
                alert("Hello! I am an alert box!!");
                console.log("test");
                var items = [];
                $.each( heightarray, function( key, val ) {
                    if (key == 4){
                        items.push( "<option value='" + key + "' selected>" + val + "</option>" );
                    } else {
                        items.push( "<option value='" + key + "'>" + val + "</option>" );
                    }
                    
                  
                });

                $( "<ul/>", {
                  "class": "my-new-list",
                  html: items.join( "" )
                }).appendTo( "#height" );
                

 //           $.getJSON(jsonData, function(data, monthselection){
 //               alert("Hello! I am an alert box!!");
 //               var heightarray;
 //               while (monthselection < data.upto) {
 //                   heightarray = data.upto.values;
 //               }
 //               console.log("test");
 //               var items = [];
 //               $.each( heightarray, function( key, val ) {
 //                   if (key == 4){
 //                       items.push( "<option value='" + key + "' selected>" + val + "</option>" );
 //                   } else {
 //                       items.push( "<option value='" + key + "'>" + val + "</option>" );
 //                   }
 //                   
 //                 
 //               });
//
 //               $( "<ul/>", {
 //                 "class": "my-new-list",
 //                 html: items.join( "" )
 //               }).appendTo( "#height" );
 //               
 //           });
            
          }else{
            obj.girls.height[monthselection];
          }
          
          break;
        case 3:
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