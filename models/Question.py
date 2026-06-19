from services.Bloominizer import Bloominizer
import re

class Question:
    """Efficient question class with minimal context handling"""  
    # Mapping from old noun-based to modern verb-based Bloom's taxonomy
    BLOOM_MAPPING = {
        "Knowledge": "Remember",
        "Comprehension": "Understand",
        "Application": "Apply", 
        "Analysis": "Analyze",
        "Synthesis": "Create",
        "Evaluation": "Evaluate"
    }

    SYMBOL_MAPPING = {
    # Greek letters
    "α": "alpha",
    "β": "beta", 
    "γ": "gamma",
    "δ": "delta",
    "ε": "epsilon",
    "ζ": "zeta",
    "η": "eta",
    "θ": "theta",
    "λ": "lambda",
    "μ": "mu",
    "π": "pi",
    "ρ": "rho",
    "σ": "sigma",
    "τ": "tau",
    "φ": "phi",
    "χ": "chi",
    "ψ": "psi",
    "ω": "omega",
    "Δ": "Delta",
    "Σ": "Sigma",
    "Θ": "Theta",
    "Λ": "Lambda",
    "Π": "Pi",
    "Ω": "Omega",
    
    # Mathematical operators
    "∑": "sum",
    "∏": "product",
    "∫": "integral",
    "∂": "partial",
    "∇": "nabla",
    "∞": "infinity",
    "≤": "less than or equal",
    "≥": "greater than or equal",
    "≠": "not equal",
    "≈": "approximately",
    "∝": "proportional",
    "∈": "element of",
    "∉": "not element of",
    "⊂": "subset of",
    "⊆": "subset or equal",
    "∪": "union",
    "∩": "intersection",
    "→": "implies",
    "←": "implied by",
    "↔": "if and only if",
    "∀": "for all",
    "∃": "there exists",
    "∄": "there does not exist",
    
    # Superscripts/subscripts (common ones)
    "²": "squared",
    "³": "cubed",
    "⁻¹": "inverse",
    "₀": "0",
    "₁": "1", 
    "₂": "2",
    "ₓ": "x",
    "ᵢ": "i",
    "ₙ": "n",
    
    # Other mathematical symbols
    "±": "plus or minus",
    "×": "times",
    "÷": "divided by",
    "√": "square root",
    "°": "degrees",
    }

    def __init__(self, text: str, marks: int = 0, context_text: str = ""):
        self.text = text
        self.original_question = text
        self.context = context_text
        self.marks = marks
        self.top_bloom_label = ""
        self.top_bloom_label_modern = ""  
        self.all_predictions = []
        self.confidence_score = 0
        self.final_question = ""

    def set_label(self, new_label):
        """Change the highest bloom label of a question"""
        self.top_bloom_label = new_label
        self.top_bloom_label_modern = self._convert_to_modern_taxonomy(new_label)

    def _convert_to_modern_taxonomy(self, old_label):
        """Convert old noun-based taxonomy to modern verb-based taxonomy"""
        return self.BLOOM_MAPPING.get(old_label, old_label)

    def _prepare_for_classification(self):
        """Prepare question for classification by concatenating the context and question, and by removing question numbers/letters"""
        clean_text = self._remove_question_letters(self.text)
        clean_text = self._clean_symbols(clean_text)  # Clean symbols in question
        
        # Also clean the context
        clean_context = self._clean_symbols(self.context)
        
        clean_text = clean_context + ": " + clean_text
        self.final_question = clean_text
        return self.final_question
    
    def _clean_symbols(self, text):
        """Convert math/Greek symbols to words to handle PDF extraction issues"""
        cleaned_text = text
        for symbol, word in self.SYMBOL_MAPPING.items():
            cleaned_text = cleaned_text.replace(symbol, f" {word} ")
        
        # Clean up extra whitespace that might be introduced
        import re
        cleaned_text = re.sub(r'\s+', ' ', cleaned_text).strip()
        return cleaned_text
    
    def _remove_question_letters(self, text):
        """Remove question prefixes like 'a)', 'A.', 'ii)', '1)', '2.' etc."""
        # Remove single letters followed by ) or .
        clean = re.sub(r'^[a-z]\s*[\)\.]', '', text, flags=re.IGNORECASE)
        # Remove roman numerals followed by ) or .
        clean = re.sub(r'^[ivxlc]+\s*[\)\.]', '', clean, flags=re.IGNORECASE)  
        # Remove numbers followed by ) or .
        clean = re.sub(r'^\d+\s*[\)\.]', '', clean)
        return clean.strip()

    def get_most_confident(self):
        """Returns the Bloom label with highest confidence"""
        if not self.all_predictions or not self.all_predictions[0]:
            return 0, ""         
        max_score = 0
        best_label = ""     
        for prediction in self.all_predictions[0]:
            if prediction["score"] > max_score:
                max_score = prediction["score"]
                best_label = prediction["label"]      
        self.confidence_score = max_score
        self.top_bloom_label = best_label
        self.top_bloom_label_modern = self._convert_to_modern_taxonomy(best_label)
        return max_score, best_label

    def get_modern_taxonomy_label(self):
        """Get the modern verb-based taxonomy label"""
        return self.top_bloom_label_modern

    def convert_all_predictions_to_modern(self):
        """Convert all predictions from classic to modern taxonomy labels in place"""
        if not self.all_predictions:
            return
        
        for prediction_batch in self.all_predictions:
            for prediction in prediction_batch:
                prediction['label'] = self._convert_to_modern_taxonomy(prediction['label'])
