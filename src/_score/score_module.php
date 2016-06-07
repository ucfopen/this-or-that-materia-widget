<?php
/**
 * Materia
 * It's a thing
 *
 * @package	    Materia
 * @version    1.0
 * @author     UCF New Media
 * @copyright  2011 New Media
 * @link       http://kogneato.com
 */


/**
 * NEEDS DOCUMENTATION
 *
 * The widget managers for the Materia package.
 *
 * @package	    Main
 * @subpackage  scoring
 * @category    Modules
  * @author      ADD NAME HERE
 */

namespace Materia;

class Score_Modules_ThisOrThat extends Score_Module{

	/*
	TODO: place scaffolding of what a score module can define
	along with instructions in this file
	 */
	public function check_answer($log)
	{
		if (isset($this->questions[$log->item_id]))
		{
			$question = $this->questions[$log->item_id];
			foreach ($question->answers as $answer)
			{
				if ($log->text == $answer['text'])
				{
					return $answer['value'];
					break;
				}
			}
		}

		return 0;
	}
}