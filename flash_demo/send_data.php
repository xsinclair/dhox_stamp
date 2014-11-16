<!doctype html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Send Data</title>
  </head>
  <body>
      <p><?php echo "Hello php"; ?> </p>
  
  <script type="text/javascript" src="js/lib/jquery-2.1.1.min.js"></script>
  <script type="text/javascript" src="js/lib/firebase-2.03.js"></script>
  <script type="text/javascript" src="js/parameter.js"></script>
  </body>
</html>

<?php 
  $allp = $age               = $_POST["age"]." | ";
  $allp .=   $gender         = $_POST["gender"]." | ";
  $allp .= $weight           = $_POST["weight"]." | ";
  $allp .= $height           = $_POST["height"]." | ";
  $allp .= $muac             = $_POST["muac"]." | ";
  $allp .= $recorded_on      = $_POST["recorded_on"]." | ";
 $allp .=  $recorded_by      = $_POST["recorded_by"]." | ";
 $allp .=  $location         = $_POST["location"]." | ";
  $allp .= $lat              = $_POST["lat"]." | ";
 $allp .=  $long             = $_POST["long"]." | ";
 $allp .= $mother_weight    = $_POST["mother_weight"]." | ";
  $allp .= $risk             = $_POST["risk"]." | ";
  $allp .= $mobile           = $_POST["mobile"]." | "; 
 

error_log ("RECEIVED (post): ".$allp);
//error_log ("RECEIVED (get): ".$allg);
?>