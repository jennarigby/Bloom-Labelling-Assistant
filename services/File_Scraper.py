from abc import ABC, abstractmethod

class File_Scraper(ABC):
    """Super class for handling question extraction from documents"""
    def __init__(self, name, supported_formats = None):
        self.name = name
        supported_formats = supported_formats or []

    @abstractmethod
    def extract_questions(self, filepath):
        """Subclasses implement this method"""
        pass


    def is_supported(self, filepath):
        """Checks if a file with a given exntension is valid"""
        return any(filepath.endswith(ext) for ext in self.support_formats)

