<?php

/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

define('FLUID_IG_INCLUDE_PATH', 'include/');

include("include/vitals.inc.php");

// The constants
$allowed_file_extensions = array('gif', 'png', 'jpg', 'jpeg', 'tif', 'tiff'); // The array of allowed file extensions: gif, png, jpg, tif
$secs_to_timeout = 3600;  // The seconds to keep the uploaded images
$temp_dir = 'temp/';

// Remove all the folders that are older than 3600 seconds
clean_history($temp_dir, $secs_to_timeout);

if (isset($_REQUEST['isSingleUploader']) && $_REQUEST['isSingleUploader']) {
	$_REQUEST['session'] = 'single';
	$return_err_in_html = 1;
} else {
	$return_err_in_html = 0;
}

// Error checkings:
// 1. whether the file is received;
// 2. whether session id is provided;
// 3. whether the file extension is allowed;
// 4. whether $temp_dir exists;
// 5. whether the file has been uploaded.

// 1. Return error if there is no file received
if (count($_FILES) == 0) {
	return_error("No file is received at server.", $return_err_in_html);
	exit;
}

// 2. Return error if the session id is not given
if (!isset($_REQUEST['session']) || strlen($_REQUEST['session']) == 0) {
	return_error("Session ID is not provided.", $return_err_in_html);
	exit;
}

foreach ($_FILES as $name => $file_data) {
	// 3. Return error if the file extension is not in the list that is allowed
	$file_name = $file_data['name'];
	$file_extension = strtolower(substr($file_name, strrpos($file_name, '.') + 1));
	
	if (!in_array($file_extension, $allowed_file_extensions)) {
		return_error('File extension <span style="font: bold">'.$file_extension.'</span> is not allowed.', $return_err_in_html);
		exit;
	}
	
	// 4. Return error if $temp_dir does not exist
	if (!file_exists($temp_dir)) {
		return_error('Temp folder <span style="font: bold">'.$temp_dir.'</span> does not exist.', $return_err_in_html);
		exit;
	}
	
	// Find or even create the image folder, if it does not exist, for this round of upload 
	$image_folder = $temp_dir . $_REQUEST['session'].'/';
	if (!file_exists($image_folder) && !mkdir($image_folder)) {
		return_error('Cannot create image folder <span style="font: bold">'.$image_folder.'</span>.', $return_err_in_html);
		exit;
	}
	// END OF error checking
	
	$destination = $image_folder.$file_name;
	// 5. Return error if the file has been uploaded
	if (file_exists($destination)) {
		echo FLUID_IG_BASE_HREF.$destination;
		return_error($file_name.' has already been uploaded.', $return_err_in_html);
		exit;
	}
	
	// Copy the uploaded file into the image folder
	move_uploaded_file($file_data['tmp_name'], $destination);
	
	if (isset($_REQUEST['isSingleUploader']) && $_REQUEST['isSingleUploader']) {
		// At single file uploader, display the uploaded image right after upload
		echo '<a href="'.FLUID_IG_BASE_HREF.'uploader.html">Back to image gallery demo</a><br/><br/>';
		echo '<img src="'.htmlentities(FLUID_IG_BASE_HREF.$destination).'" alt="'.$file_name.'" />';
	} else {
		// At multi-file uploader, return the url to the uploaded image
		echo FLUID_IG_BASE_HREF.$destination;
	}
}
?>