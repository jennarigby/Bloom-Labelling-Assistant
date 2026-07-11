import os
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline

class Bloominizer:
    """CLass that initialises the Bloominixer model and classifies text according to Bloom's taxonomy"""
    def __init__(self,model_name = "uw-vta/bloominzer-0.1",save_dir = "./model", return_all_scores = True):
        self.model_name = model_name
        self.save_dir = save_dir
        self.return_all_scores = return_all_scores
        #checks if the model path exists
        if not os.path.exists(save_dir):
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForSequenceClassification.from_pretrained(model_name)
            tokenizer.save_pretrained(save_dir)
            model.save_pretrained(save_dir)
        else:
            print(f"Loading model from {save_dir}")

        tokenizer = AutoTokenizer.from_pretrained(save_dir)
        model = AutoModelForSequenceClassification.from_pretrained(save_dir)

        self.classify = pipeline("text-classification", model=save_dir, tokenizer=save_dir, top_k=None)

    def predict_label(self, text):
        """Classify text"""
        return self.classify(text)
