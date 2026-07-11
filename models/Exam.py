from models.Question import Question

class Exam:
    """Exam object stores information about a given exam/test"""
    def __init__(self, title:str):
        self.title = title
        self.total_marks = 0
        self.total_questions = 0
        self.questions = []
        self.status = "unclassified"

    def add_question(self, question:Question):
        """Add a Question object to the list of questions"""
        self.questions.append(question)

    def set_total_mark(self, total:int):
        """Set the total marks for the exam"""
        self.total_marks = total

    def get_total_questions(self):
        """Returns the number of questions"""
        return len(self.questions)
