import os
from services.PDF_Scraper import PDF_Scraper
from services.TXT_Scraper import TXT_Scraper

class Scraper_Factory:
    """Fcatory class that chooses valid formats for question extraction"""
    _scrapers = [PDF_Scraper, TXT_Scraper]

    @classmethod
    def get_scraper(cls,file_path):
        """Checks the file type extension and compares it the supported formats in File_Scraper"""
        ext = os.path.splitext(file_path)[1].lower()
        for scraper in cls._scrapers:
            if ext in scraper.supported_formats:
                return scraper(file_path)
        raise ValueError(f"No Scraper available for file type: {ext}")
