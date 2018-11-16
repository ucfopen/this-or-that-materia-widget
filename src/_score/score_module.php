<?php

namespace Materia;

class Score_Modules_ThisOrThat extends Score_Module{

	public function check_answer($log)
	{
		// version 2 or higher will store the answer id in $log->text and answer text in $log->value
		// version 1 or less will store the answer text in $log->text and nothing in $log->value
		$use_answer_ids = $this->inst->qset->version < 2;
		if (isset($this->questions[$log->item_id]))
		{
			foreach ($this->questions[$log->item_id]->answers as $answer)
			{
				if ($use_answer_ids)
				{
					if ($log->text == $answer['id']) return $answer['value'];
				}
				else
				{
					if ($log->text == $answer['text']) return $answer['value'];
				}
			}
		}

		return 0;
	}

	public function get_ss_answer($log, $question)
	{
		return $this->inst->qset->version < 2 ? $log->text : $log->value;
	}
}
