<?php
if (!defined('FLUID_IG_INCLUDE_PATH')) { exit; }

define('FLUID_IG_DEVEL', 1);

// set the default timezone to avoid the warning of "cannot rely on system timezone"
date_default_timezone_set('America/New_York');

// get the protocol
if (isset($_SERVER['HTTPS']) && (strtolower($_SERVER['HTTPS']) == 'on')) {
	$server_protocol = 'https://';
} else {
	$server_protocol = 'http://';
}

// Calculate the base href
$dir_deep	 = substr_count(FLUID_IG_INCLUDE_PATH, '..');
$url_parts	 = explode('/', $_SERVER['HTTP_HOST'] . $_SERVER['PHP_SELF']);
$_base_href	 = array_slice($url_parts, 0, count($url_parts) - $dir_deep-1);
$_base_href	 = $server_protocol . implode('/', $_base_href).'/';

$endpos = strlen($_base_href); 

$_base_href	 = substr($_base_href, 0, $endpos);
$_base_path  = substr($_base_href, strlen($server_protocol . $_SERVER['HTTP_HOST']));

define('FLUID_IG_BASE_HREF', $_base_href);

/**
 * Get the list of all the sub-directories in the given directory
 * @access public
 * @param  string $directory       the directory to search in
 * @return an array of all the sub-directories
 */
function getAllDirs($directory) {
	$result = array();
	$handle =  opendir($directory);
	while ($datei = readdir($handle))
	{
		if (($datei != '.') && ($datei != '..'))
		{
			$file = $directory.$datei;
			if (is_dir($file)) {
				$result[] = $file;
			}
		}
	}
	closedir($handle);
	return $result;
}

/**
* Enables the deletion of a directory even if it is not empty
* @access  public
* @param   string $directory		the directory to delete
* @return  boolean			whether the deletion was successful
*/
function remove_dir($directory) {
	if(!$opendir = @opendir($directory)) {
		return false;
	}
	
	while(($readdir=readdir($opendir)) !== false) {
		if (($readdir !== '..') && ($readdir !== '.')) {
			$readdir = trim($readdir);

			clearstatcache(); /* especially needed for Windows machines: */

			if (is_file($directory.'/'.$readdir)) {
				if(!@unlink($directory.'/'.$readdir)) {
					return false;
				}
			} else if (is_dir($directory.'/'.$readdir)) {
				/* calls itself to clear subdirectories */
				if(!remove_dir($directory.'/'.$readdir)) {
					return false;
				}
			}
		}
	} /* end while */

	@closedir($opendir);
	
	if(!@rmdir($directory)) {
		return false;
	}
	return true;
}

/**
 * Scan through the given $directory, remove the sub-folders that are older than the given seconds.
 * @access public
 * @param  string $directory         the path to the folder
 *         integer $secs_to_live     the seconds that the folder should not be deleted since its creation 
 * @return boolean          
 */
function clean_history($directory, $secs_to_live) {
	$check_point = strtotime("-".$secs_to_live." seconds"); 

	$allDirs = getAllDirs($directory);
    
	$highestKnown = 0;
	foreach ($allDirs as $one_dir) {
		$currentValue = filectime($one_dir);
		$currentMValue = filemtime($one_dir);

		if ($currentMValue > $currentValue) {
			$currentValue = $currentMValue;
		}
          
		if ($currentValue < $check_point) {
			remove_dir($one_dir);
		}
     }
     return true;
}

/**
 * Return error message with the http status code 403
 * @access public
 * @param  string err_string          the error message
 *         integer return_err_in_html 1/0. Return error message in a complete html 
 */
function return_error($err_string, $return_err_in_html) {
    if ($return_err_in_html) {
    	$error = '<html><p><meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1"/>';
    }
    
    $error .= $err_string;
    
    if ($return_err_in_html) {
    	$error .= '</p></html>';
    }

    header("HTTP/1.1 403 Forbidden", TRUE, 403);
    header('Content-length: '. strlen($error));
    echo $error;
}

/**
 * Return success msg with http status code 200
 * @access public
 * @param  $success_string        the success message
 */
function return_success($success_string) {
    echo "<html><body><p>".$success_string."</p></body></html>";
}

/**
 * This function is used for printing variables for debugging.
 * @access public
 * @param  mixed $var	    The variable to output
 * @param  string $title	The name of the variable, or some mark-up identifier.
 */
function debug($var, $title='') {
	if (!defined('FLUID_IG_DEVEL') || !FLUID_IG_DEVEL) {
		return;
	}
	
	echo '<pre style="border: 1px black solid; padding: 0px; margin: 10px;" title="debugging box">';
	if ($title) {
		echo '<h4>'.$title.'</h4>';
	}
	
	ob_start();
	print_r($var);
	$str = ob_get_contents();
	ob_end_clean();

	$str = str_replace('<', '&lt;', $str);

	$str = str_replace('[', '<span style="color: red; font-weight: bold;">[', $str);
	$str = str_replace(']', ']</span>', $str);
	$str = str_replace('=>', '<span style="color: blue; font-weight: bold;">=></span>', $str);
	$str = str_replace('Array', '<span style="color: purple; font-weight: bold;">Array</span>', $str);
	echo $str;
	echo '</pre>';
}

/**
 * This function is used for printing variables into log file for debugging.
 * @access  public
 * @param   mixed $var	    The variable to output
 * @param   string $log	    The location of the log file. If not provided, use the default one.
 */
function debug_to_log($var, $log='') {
	if (!defined('FLUID_IG_DEVEL') || !FLUID_IG_DEVEL) {
		return;
	}
	
	if ($log == '') $log = 'temp/debug.log';
	
	$handle = fopen($log, 'a');
	fwrite($handle, "\n\n");
	fwrite($handle, date("F j, Y, g:i a"));
	fwrite($handle, "\n");
	fwrite($handle, var_export($var,1));
	
	fclose($handle);
}
?>
