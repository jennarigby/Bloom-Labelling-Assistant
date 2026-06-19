import os
import tempfile
from flask import request, jsonify, send_file

class APIController:
    def __init__(self, labelling_service):
        # Creates an instance of the LabellingService class:
        self.labelling_service = labelling_service

    
    def register_routes(self, flask_app): 
        """Register all API routes with the FlaskApp""" 
        app = flask_app.get_app()

        # Register routes pointing to methods:
        app.add_url_rule('/api/enter_question', 'enter_question', self.enter_question, methods=['POST'])
        app.add_url_rule('/api/upload_exam', 'upload_exam', self.upload_exam, methods=['POST'])
        app.add_url_rule('/api/generate_report', 'generate_report', self.generate_report, methods=['POST'])
        app.add_url_rule('/api/enter_goal', 'enter_goal', self.enter_goal, methods=['POST'])
        app.add_url_rule('/api/confirm_questions', 'confirm_questions', self.confirm_questions, methods=['POST'])
    
    def enter_question(self):
        """API Endpoint for entering a question"""
        try:
            data = request.get_json()
            if not data or 'questions' not in data:
                return jsonify({'error': 'Questions required'}), 400

            questions_list = data['questions'] 
            
            # Call classify_question method with the list of questions and marks
            result = self.labelling_service.classify_question(questions_list)
            
            return jsonify(result), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    
    def upload_exam(self):
        """API endpoint for uploading an exam paper for question classification"""
        try:
            if 'exam_file' not in request.files:
                return jsonify({'status': 'fail', 'message': 'No file part in request'}), 400
            file = request.files['exam_file']
            
            # File is saved to a temporary location on disk
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
                file.save(temp_file.name)
                tempPath = temp_file.name
            
            # classify_exam method gets a file path - this is where scraper exceptions come from
            result = self.labelling_service.upload_exam(tempPath)
            return jsonify({'success': True, 'data': result}), 200

        except Exception as e:
            # This will catch scraper exceptions like "Empty File Uploaded" or "No Scraper available"
            return jsonify({'error': str(e)}), 500
    
    def confirm_questions(self):
        """API endpoint to confirm questions after user edits them (if necessary)"""
        try:
            data = request.get_json()

            result = self.labelling_service.confirm_questions(data)
            return jsonify(result), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    def generate_report(self):
        """API endpoint for exporting a PDF report to user"""
        try:
            data = request.get_json()
            exam_data = data.get("exam") if data else None
            analytics_data = data.get("analytics") if data else None

            print(f"DEBUG: Received exam_data: {exam_data}")  # Debug log
            print(f"DEBUG: Received analytics_data: {analytics_data}")  # Debug log

            if not exam_data:
                return jsonify({'error': 'No exam provided for report generation.'}), 400

            pdf_path = self.labelling_service.export_results(exam=exam_data, analytics=analytics_data)

            return send_file(
                pdf_path,
                as_attachment=True,
                download_name="exam_report.pdf",
                mimetype='application/pdf'
            )
            
        except Exception as e:
            print(f"ERROR in generate_report: {e}") 
            return jsonify({'error': str(e)}), 500

    def enter_goal(self):
        """API endpoint to store user-entered goal"""
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'Goal distribution data required'}), 400

            goal_distribution = data.get("goal_distribution")
            exam_data = data.get("exam_data")
            classified_questions = data.get("classified_questions")
            
            if not goal_distribution or not isinstance(goal_distribution, dict):
                return jsonify({'error': 'Invalid goal distribution format'}), 400
            
            if not exam_data or not classified_questions:
                return jsonify({'error': 'Exam data and classified questions required'}), 400
            
            result = self.labelling_service.store_goal(
                goal_distribution, 
                exam_data, 
                classified_questions
            )
            
            return jsonify(result), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500
