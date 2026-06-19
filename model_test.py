from services.Bloominizer import Bloominizer
#from services.test_scraper import TEST_Scraper
from services.PDF_Scraper import PDF_Scraper
from services.TXT_Scraper import TXT_Scraper
from services.Scraper_Factory import Scraper_Factory
from models.Exam import Exam
from models.Question import Question
import time

total_start = time.perf_counter()

bloom_start = time.perf_counter()
bloom = Bloominizer()
bloom_end = time.perf_counter()
bloom_total = bloom_end - bloom_start
print(f"TIME TO INITIALISE BLOOM: {bloom_total:.4f}")

classify_start = time.perf_counter()
print(bloom.predict_label("In what class of algorithms is Sorting by Counting? "))
classify_end = time.perf_counter()
classify_total_time = classify_end - classify_start
print(f"TIME TO CLASSIFY A SINGLE QUESTION: {classify_total_time:.4f}")

exam_start = time.perf_counter()
filepath = "Exam.pdf"
#scraper = TEST_Scraper(filepath)
scraper = Scraper_Factory.get_scraper(filepath)
exam = scraper.extract_questions()
exam_end = time.perf_counter()
exam_total_time = exam_end - exam_start
print(f"TIME TO EXTRACT EXAM: {exam_total_time:.4f}")

extract_start = time.perf_counter()
print("starting exam classification")
#all_questions = []
with open("exam_out.txt", "w", encoding = 'utf-8') as out:
    out.write(f"TITLE: {exam.title} \n")

    for question in exam.questions:
        question._prepare_for_classification()
        #all_questions.append(question.final_question)
        question.all_predictions = bloom.predict_label(question.final_question)
        question.convert_all_predictions_to_modern()
        question.get_most_confident()
        #out.write(f"QUESTION AND ALL: {question.text} + {question.all_predictions} /n")

    for question in exam.questions:
        out.write(f"QUESTION AND HIGHEST: {question.final_question} {question.top_bloom_label_modern} \n MARK: {question.marks} \n")
    out.write(f"TOTAL: {exam.total_marks}")
print("done with exam classification")
extract_end = time.perf_counter()
extract_time = extract_end - extract_start
print(f"TIME TO EXTRACT AND CLASSIFY: {extract_time:.4f}")
total_end = time.perf_counter()
total_time = total_end - total_start
print(f"TOTAL TIME: {total_time:.4f}")

