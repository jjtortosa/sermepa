<?php
/* solución temporal hasta encontrar como encriptar en nodejs */

//error_reporting(E_ALL);
//ini_set('display_errors', true);
//var_dump($argv);exit;
$bytes = array(0,0,0,0,0,0,0,0); //byte [] IV = {0, 0, 0, 0, 0, 0, 0, 0}

$iv = implode(array_map("chr", $bytes)); //PHP 4 >= 4.0.2

$des3 = mcrypt_encrypt(MCRYPT_3DES, base64_decode($argv[2]), $argv[3], MCRYPT_MODE_CBC, $iv); //PHP 4 >= 4.0.2

$ent = $argv[1];

$res = hash_hmac('sha256', $ent, $des3, true);

echo json_encode(array(
	"sig" => base64_encode($res)
));