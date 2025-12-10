from scoring.module import ScoreModule
from core.models import Question

class ThisOrThat(ScoreModule):
    
    def get_question_version(self):
        qsetId = self.qset["items"][0]["id"]                                                                                                                            
        question = Question.objects.get(item_id=qsetId)                                                                                                                 
        version = question.qset.version
        return int(version)
    
    def check_answer(self, log):
        q = self.get_question_by_item_id(log.item_id)
        version = self.get_question_version()
        use_answer_text = version < 2
        if q is not None:
            for answer in q["answers"]:
                if use_answer_text:
                    if log.text == answer['text']:
                        return answer['value']
                else:
                    if log.text == answer['id']:
                        return answer['value']

        return 0

    def get_ss_answer(self, log, question):
        version = self.get_question_version()
        return log.text if version < 2 else log.value

    
    def details_for_question_answered(self, log):
        question = self.get_question_by_item_id(log.item_id)
        score = self.check_answer(log)
        
        return {
            "data": [
                self.get_ss_question(log, question),
                question["id"],
                self.get_ss_answer(log, question),
                self.get_ss_expected_answers(log, question)
            ],
            "data_style": ["question", "question_id", "response", "answer"],
            "score": score,
            "feedback": self.get_feedback(log, question["answers"]),
            "type": log.log_type,
            "style": self.get_detail_style(score),
            "tag": 'div',
            "symbol": '%',
            "graphic": 'score',
            "display_score": True
        }
