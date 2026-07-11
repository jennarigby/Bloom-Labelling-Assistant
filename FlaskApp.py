from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


class FlaskApp:
    def __init__(self):
        self.app = Flask(__name__)
        CORS(self.app)

    # Return Flask instance
    def get_app(self):        
        return self.app

    # Run Flask to connect the backend to frontend
    def run(self):
        self.app.run(debug=True, host='0.0.0.0', port=5000)

if __name__ == '__main__':
    from controllers.APIController import APIController
    from services.LabellingService import LabellingService
    from services.Bloominizer import Bloominizer 
    from services.File_Scraper import File_Scraper  
    from services.Scraper_Factory import Scraper_Factory
    from services.ReportGenerator import ReportGenerator

    bloominizer = Bloominizer() 
    scraper_factory = Scraper_Factory()
    report_generator = ReportGenerator()

    labelling_service = LabellingService( bloominizer=bloominizer,
    report_generator=report_generator, scraper_factory= scraper_factory)
    api_controller = APIController(labelling_service)

    flask_app = FlaskApp()
    api_controller.register_routes(flask_app)
    flask_app.run()