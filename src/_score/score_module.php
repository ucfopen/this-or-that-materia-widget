<?php

namespace Materia;

class Score_Modules_ThisOrThat extends Score_Module{

	public function check_answer($log)
	{
		// version 2 or higher will store the answer id in $log->text and answer text in $log->value
		// version 1 or less will store the answer text in $log->text and nothing in $log->value
		$use_answer_text = $this->inst->qset->version < 2;
		if (isset($this->questions[$log->item_id]))
		{
			foreach ($this->questions[$log->item_id]->answers as $answer)
			{
				if ($use_answer_text)
				{
					if ($log->text == $answer['text']) return $answer['value'];
				}
				else
				{
					if ($log->text == $answer['id']) return $answer['value'];
				}
			}
		}

		return 0;
	}

	public function get_ss_answer($log, $question)
	{
		return $this->inst->qset->version < 2 ? $log->text : $log->value;
	}

	protected function details_for_question_answered($log)
	{
		$q     = $this->questions[$log->item_id];
		$score = $this->check_answer($log);

		return [
			'data' => [
				$this->get_ss_question($log, $q),
				$q->id,
				$this->get_ss_answer($log, $q),
				$this->get_ss_expected_answers($log, $q)
			],
			'data_style'    => ['question', 'question_id', 'response', 'answer'],
			'score'         => $score,
			'feedback'      => $this->get_feedback($log, $q->answers),
			'type'          => $log->type,
			'style'         => $this->get_detail_style($score),
			'tag'           => 'div',
			'symbol'        => '%',
			'graphic'       => 'score',
			'display_score' => true
		];
	}
}
