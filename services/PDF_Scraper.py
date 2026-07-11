import fitz, re
from models.Question import Question
from models.Exam import Exam
from services.File_Scraper import File_Scraper
import os

class PDF_Scraper(File_Scraper):
    """Class that extracts information from a PDF exam/test"""
    supported_formats = [".pdf"]
    def __init__(self, file):
        super().__init__(name="PDF Scraper")
        self.file = file
        self.doc = fitz.open(self.file)
        self.questions = []
    
    def extract_questions(self):
        """Extracts each question and mark allocation from the given paper. This method also creates exam and question objects with the extracted information"""
        if os.path.getsize(self.file) == 0:
            raise ValueError(f"Empty File Uploaded")
        total_marks = 0
        exam = None
        context = ""
        collecting_context = False
        context_buffer = []

        for i, page in enumerate(self.doc):
            text = page.get_text("text") 
            if i == 0:
                exam_title = self.get_exam_title(text)
                exam = Exam(exam_title)
            pattern = "*****"
            buffer = "" #works for questions that span multiple pages
            for line in text.splitlines():
                # Skip section headers
                if re.match(r"^SECTION", line):
                    continue

                # Detect start of question heading
                q_match = re.match(r"^Question\s+\d+\s*(.*)", line)
                if q_match:
                    collecting_context = True
                    context_buffer = [q_match.group(1).strip()]
                    continue 

                # If we’re collecting a heading, check if this line is just marks
                mark_match = re.match(r"^\s*\[(\d+)\]\s*$", line)
                if collecting_context and mark_match:
                    context = " ".join([part for part in context_buffer if part]).strip()
                    current_context_mark = int(mark_match.group(1))
                    collecting_context = False
                    continue

                # If still collecting heading (and no marks yet), add line to buffer
                if collecting_context:
                    context_buffer.append(line.strip())
                    continue

                # Skip multiple choice options like "A. something"
                if re.match(r"^[A-H]\.", line):
                    continue

                # Detect inline or standalone mark at end of question line
                mark_match = re.search(r"\[(\d+)\]\s*$", line)
                if mark_match:
                    mark = mark_match.group(1)
                    # Capture everything before the mark
                    line_text = re.sub(r"\[(\d+)\]\s*$", "", line).strip()
                    if line_text:
                        buffer += " " + line_text

                    question = buffer.strip().replace("\n", " ")
                    if question and not re.match(r"^[A-Z]{1,}", question):
                        self.questions.append(question + ": " + mark)
                        question_obj = Question(question, mark, context)
                        exam.add_question(question_obj)
                        total_marks += int(mark)
                    buffer = ""  # reset
                    continue

                # If this line alone is marks (standalone after buffer content)
                standalone_mark = re.match(r"^\s*\[(\d+)\]\s*$", line)
                if standalone_mark and buffer:
                    mark = standalone_mark.group(1)
                    question = buffer.strip().replace("\n", " ")
                    if question and not re.match(r"^[A-Z]{1,}", question):
                        self.questions.append(question + ": " + mark)
                        question_obj = Question(question, mark, context)
                        exam.add_question(question_obj)
                        total_marks += int(mark)
                    buffer = ""  # reset
                    continue

                # Start of sub-question (a), b), 1), etc.)
                if re.match(r"^[a-zA-Z]\)", line) or re.match(r"^[a-zA-Z]\.", line) or re.match(r"^\d+\.", line) or re.match(r"^\d+\)", line):
                    buffer = line                  
                else:
                    if buffer:
                        buffer += " " + line.strip()
                    else:
                        if re.search(r"^[ivxlc]+\)", line.lower()) or re.search(r"^\d+\)", line) or re.search(r"^\d+\.", line):
                            buffer = line.strip()

        exam.set_total_mark(total_marks)
        return exam
    
    def get_exam_title(self, text):
        """Returns the title of the test/exam"""
        title = ""
        lines = text.splitlines()
        for i, line in enumerate(lines):
            if re.match(r"^Computer Science", line) or re.match(r"^CSC", line):
                title += line + " "
                title += lines[i+1]
                return title
        return ""
    

