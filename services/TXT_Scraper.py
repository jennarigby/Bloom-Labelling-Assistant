from services.File_Scraper import File_Scraper
from models.Question import Question
from models.Exam import Exam
import re
import os

class TXT_Scraper(File_Scraper):
    """Class that extracts information from a .txt exam/test"""
    supported_formats = [".txt"]

    def __init__(self, file):
        super().__init__(name="TXT Scraper", supported_formats=[".txt"])
        self.file = file
        self.questions = []

    def extract_questions(self):
        """Extract questions, create exam object, and add question objects with section/question context"""
        if os.path.getsize(self.file) == 0:
            raise ValueError(f"Empty File Uploaded")
        total_marks = 0
        exam = None
        context = ""  # only local section/question context
        buffer = ""

        with open(self.file, "r", encoding="utf-8") as f:
            lines = f.readlines()

        # First non-empty line is exam title
        exam_title = lines[0].strip()
        exam = Exam(exam_title)

        for line in lines[1:]:
            line = line.strip()

            # Skip NOTES or front-matter entirely
            if line.upper().startswith("NOTES:"):
                continue
            if not line or line.lower().startswith("•"):
                continue

            # Capture SECTION headers as context
            if re.match(r"^SECTION", line, flags=re.IGNORECASE):
                context = re.sub(r"\s*\[\d+\]\s*$", "", line).strip()
                continue

            # Capture question headers like "Question 2 Logistic Regression [6]"
            if re.match(r"^Question\s+\d+", line, flags=re.IGNORECASE):
                # remove "Question X" and trailing [marks]
                context = re.sub(r"^Question\s+\d+\s*", "", line, flags=re.IGNORECASE)
                context = re.sub(r"\s*\[\d+\]\s*$", "", context).strip()
                continue

            # Skip multiple-choice answer options like "A. ..."
            if re.match(r"^[A-H]\.", line):
                continue

            # Match mark allocations [#] at end of question line
            mark_match = re.search(r"\[(\d+)\]\s*$", line)
            if mark_match:
                mark = mark_match.group(1)
                line_text = re.sub(r"\[(\d+)\]\s*$", "", line).strip()
                if line_text:
                    buffer += " " + line_text

                question = buffer.strip().replace("\n", " ")
                if question and not re.match(r"^[A-Z]{1,}$", question):
                    self.questions.append(question + ": " + mark)
                    question_obj = Question(question, mark, context)
                    exam.add_question(question_obj)
                    total_marks += int(mark)
                buffer = ""
                continue

            # Start of sub-question (a), b), i), etc.)
            if re.match(r"^[a-zA-Z]\)", line) or re.match(r"^\d+\)", line) or re.match(r"^[ivxlc]+\)", line.lower()):
                buffer = line
            else:
                # Continue building multi-line question text
                if buffer:
                    buffer += " " + line
                else:
                    if re.match(r"^\d+\.", line):
                        buffer = line

        exam.set_total_mark(total_marks)
        return exam
