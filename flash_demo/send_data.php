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
  $allp = $age               = $_POST["age"];
  $allp .=   $gender         = $_POST["gender"];
  $allp .= $weight           = $_POST["weight"];
  $allp .= $height           = $_POST["height"];
  $allp .= $muac             = $_POST["muac"];
  $allp .= $recorded_on      = $_POST["recorded_on"];
 $allp .=  $recorded_by      = $_POST["recorded_by"];
 $allp .=  $location         = $_POST["location"];
  $allp .= $lat              = $_POST["lat"];
 $allp .=  $long             = $_POST["long"];
 $allp .= $mother_weight    = $_POST["mother_weight"];
  $allp .= $risk             = $_POST["risk"];
  $allp .= $mobile           = $_POST["mobile"]; 
 $allp .= $time 			= time()."000";
 $allp .= $by				="Jennifer";
 $allp .= $location			= "Ox Launch Pad";
 $allp .= $lat				= 51.7530466 + (mt_rand(0,1000)/1000000) - (mt_rand(0,1000)/1000000);
 $allp .= $long				= -1.2674058 + (mt_rand(0,1000)/1000000) - (mt_rand(0,1000)/1000000);
 

error_log ("RECEIVED (post): ".$allp);
//error_log ("RECEIVED (get): ".$allg);

$url = 'https://dhoxstamp.firebaseio.com/records.json';

$fields = array(
						'age' => $age,
						'gender' => $gender,
						'height' => $height,
						'weight' => $weight,
						'muac' => $muac,
						'risk' => $risk,
						'mobile' => $mobile,
						'recorded_on'=>$time,
						'recorded_by'=>$by,
						'location'=>$location,
						'lat'=>$lat,
						'long'=>$long,
				);
/*
//url-ify the data for the POST
foreach($fields as $key=>$value) { 
	$fields_string .= '"'.$key.'":'.$value; 
	}
rtrim($fields_string, ",");
$fields_string .='}'; */
			$fields_string = '{"age":'.$age.',"gender":"'.$gender.'","height":'.$height.',"weight":'.$weight.',"muac":'.$muac.',"risk":'.$risk.',"mobile":"'.$mobile.'","recorded_by":"'.$by.'","recorded_on":'.$time.',"location":"'.$location.'","latitude":'.$lat.',"longitude":'.$long.'}';
error_log($fields_string);
//open connection
$ch = curl_init();

//set the url, number of POST vars, POST data
curl_setopt($ch,CURLOPT_URL, $url);
curl_setopt($ch,CURLOPT_POST, 1);
curl_setopt($ch,CURLOPT_POSTFIELDS, $fields_string);

//execute post
$result = curl_exec($ch);
error_log($result);
//close connection
curl_close($ch);
?>