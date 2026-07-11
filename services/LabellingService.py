from models.AnalyticsReport import AnalyticsReport
from models.Question import Question

class LabellingService:
    def __init__(self, bloominizer, report_generator, scraper_factory):
        self.bloominizer = bloominizer
        # self.file_scraper = file_scraper
        self.scraper_factory = scraper_factory
        self.report_generator = report_generator
        self.exam = None
        self.analytics = None

    def classify_question(self, questions):
        """Receive questions as a dictionary of text and marks, classify using model, and return to user"""
        if not isinstance(questions, list):
            raise ValueError("Questions must be provided as a list of dicts with 'text' and 'marks'")

        # Create an exam object to store questions
        from models.Exam import Exam
        exam = Exam("Generated Exam")
        results = []

        # Classify each question and add to exam
        for q in questions:
            question_text = q.get("text")
            marks = q.get("marks", 0)
            if not question_text:
                continue  # skip empty questions

            question_obj = Question(question_text, marks=marks)

            # Classification
            question_obj._prepare_for_classification()
            predictions = self.bloominizer.predict_label(question_obj.final_question)
            question_obj.all_predictions = predictions
            question_obj.convert_all_predictions_to_modern()
            confidence, label = question_obj.get_most_confident()

            # Attach classification info
            question_obj.top_bloom_label = label
            question_obj.confidence_score = confidence
            exam.questions.append(question_obj)

        # Generate analytics
        analytics = AnalyticsReport(exam)

        # Create JSON exam object
        exam_serializable = {
            "exam_name": exam.title,
            "total_questions": len(exam.questions),
            "questions": [
                {
                    "text": q.text,
                    "marks": q.marks,
                    "label": q.top_bloom_label,
                    "confidence": q.confidence_score,
                    "predictions": q.all_predictions  
                } for q in exam.questions
            ]
        }


        # Create JSON analytics data
        analytics_data = {
            "distribution": getattr(analytics, "distribution", {}),
            "goal_distribution": getattr(analytics, "goal_distribution", {}),
            "total_marks": analytics.total_marks()
        }

        return {
            "status": "success",
            "message": "Questions classified successfully",
            "exam": exam_serializable,
            "analytics": analytics_data
        }


    def upload_exam(self, filePath):
        """ Parse all questions in an uploaded exam paper. """

        scraper = self.scraper_factory.get_scraper(filePath)
        self.exam = scraper.extract_questions()    

        # Prepare questions for display
        questions_data = []
        for q in self.exam.questions:
            # Prepare the question (clean symbols, remove letters, add context)
            q._prepare_for_classification() 
        

        # Store and return all the raw question data
        questions_data = []
        for q in self.exam.questions:
            questions_data.append({
                "text": q.final_question,
                "marks": q.marks,
                "label": q.top_bloom_label,
                "confidence": q.confidence_score,
                "scores": q.marks 
            })
        
        # Return parsed exam to user to confirm questions
        return {
            'exam_name': self.exam.title,
            'total_questions': len(self.exam.questions),
            'status': "parsed",
            'questions': questions_data
        }
    
    def confirm_questions(self, updated_questions_data):
        """ Classify each confirmed question """
        
        if not updated_questions_data:
            raise ValueError("No questions data provided")
        
        classified_questions = []
        
        # Loop through the updated questions:
        for i, q_data in enumerate(updated_questions_data):
            try:
                question_text = q_data.get('text', '').strip()
                marks = q_data.get('marks', 0)
                
                if not question_text:
                    print(f"Skipping empty question at index {i}")
                    continue
                    
                print(f"Processing question {i+1}: {question_text[:50]}...")
                
                # Create Question object
                question = Question(text=question_text, marks=marks)
                
                # Get predictions from bloominizer with final question
                question._prepare_for_classification()
                predictions = self.bloominizer.predict_label(question.text)
                
                # Set all_predictions in the question object
                question.all_predictions = predictions 
                question.convert_all_predictions_to_modern()

                confidence, label = question.get_most_confident()
                
                classified_questions.append({
                    "text": question_text,
                    "marks": marks,
                    "label": label,
                    "confidence": confidence,
                    "predictions": predictions 
                })
                
            except Exception as e:
                print(f"Error classifying question '{q_data.get('text', '')[:50]}...': {e}")
                import traceback
                traceback.print_exc()

        # Return classified questions to the user
        return {
            'status': 'confirmed',
            'message': 'Questions processed successfully',
            'processed_count': len(classified_questions),
            'questions': classified_questions
        }
        
    def export_results(self, exam=None, analytics=None):
        """Generate PDF report of analytics available for download."""
        from models.Exam import Exam
        from models.Question import Question
        from models.AnalyticsReport import AnalyticsReport

        # Reconstruct Exam object
        if isinstance(exam, dict):
            exam_obj = Exam(exam.get("title", "Exam"))
            for q_data in exam.get("questions", []):
                question = Question(
                    text=q_data.get("text", ""),
                    marks=q_data.get("marks", 0)
                )
                question.top_bloom_label = q_data.get("top_bloom_label", "")
                question.confidence_score = q_data.get("confidence_score", 0)
                exam_obj.questions.append(question)
            exam = exam_obj

        # Reconstruct AnalyticsReport
        if isinstance(analytics, dict):
            analytics_obj = AnalyticsReport(exam)
            analytics_obj.distribution = analytics.get("distribution", {})
            analytics_obj.goal_distribution = analytics.get("goal_distribution", {})
            analytics = analytics_obj

        elif analytics is None:
            analytics = AnalyticsReport(exam)
            analytics.set_distribution(exam)

        return self.report_generator.create_pdf(exam, exam.questions, analytics)

    def store_goal(self, goal_distribution, exam_data=None, classified_questions=None):
        """Stores the entered goal distribution and recreates exam/analytics"""
        
        # Recreate exam object
        if exam_data and classified_questions:
            from models.Exam import Exam
            
            exam = Exam(exam_data.get('exam_name', 'Goal Setting Exam'))
            for q_data in classified_questions:
                question = Question(
                    text=q_data.get('text', ''),
                    marks=q_data.get('marks', 0)
                )
                question.top_bloom_label = q_data.get('label', '')
                question.confidence_score = q_data.get('confidence', 0)
                exam.questions.append(question)
            
        else:
            exam = self.exam
            if not exam:
                raise ValueError("No exam data available for goal setting")
        
        # Create analytics object
        analytics = AnalyticsReport(exam)
        analytics.set_goal(goal_distribution)
        
        
        # Convert analytics object to JSON dictionary
        analytics_data = {
            "distribution": getattr(analytics, "distribution", {}),
            "goal_distribution": getattr(analytics, "goal_distribution", {}),
            "total_marks": analytics.total_marks()
        }
        
        # Return JSON object to frontend
        return {
            "status": "success", 
            "message": "Goal distribution stored successfully",
            "analytics": analytics_data
        }


