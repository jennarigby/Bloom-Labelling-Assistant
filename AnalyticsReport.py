class AnalyticsReport:

    def __init__(self, exam):
        self.exam = exam
        self.exam_title = exam.title
        self.total_questions: int = 0
        self.distribution: dict[str, int] = {}  # e.g. {"Remember": 15, "Understand": 7} with the number being no. of marks
        self.set_distribution()
        self.goal_distribution: dict[str, int] = {}

  
    def total_marks(self):    
        """ Return the total number of marks in the exam """  
        return sum(self.distribution.values())

   
    def set_goal(self, goal_distribution):
        """ Sets the goal distribution """
        self.goal_distribution = goal_distribution
    
    
    def set_distribution(self, exam =None):
        """ Determines the distribution from the exam object """
        if exam:
            self.exam = exam

        self.distribution = {}
        
        # Set the number of questions in the exam
        self.total_questions = len(self.exam.questions)
        
        for question in self.exam.questions:
            label = question.top_bloom_label
            marks = question.marks
            
            # Add marks to distribution
            if label in self.distribution:
                self.distribution[label] += marks
            else:
                self.distribution[label] = marks

  
    
