import os
from fpdf import FPDF
import io
import tempfile
from functools import lru_cache

import matplotlib
matplotlib.use("Agg") 
import matplotlib.pyplot as plt
from models import AnalyticsReport

class ReportGenerator:
    def __init__(self, path: str = "reports/"):
        self.path = path
        os.makedirs(self.path, exist_ok=True)
        
        # Cache frequently-used calculations
        self.matplotlib_configured = False
        self.fonts_available = None  
        
    def configure_matplotlib_once(self):
        """Configure matplotlib settings once for better performance"""
        if not self.matplotlib_configured:
            plt.rcParams['font.size'] = 10
            plt.rcParams['axes.titlesize'] = 14
            plt.rcParams['axes.labelsize'] = 12
            plt.rcParams['legend.fontsize'] = 11
            plt.rcParams['figure.facecolor'] = 'white'
            self.matplotlib_configured = True
    
    def register_fonts(self, pdf):
        """Register fonts for each PDF instance"""
        if self.fonts_available is None:
            # Check if fonts are available
            try:
                if os.path.exists(os.path.join("fonts", "DejaVuSans.ttf")) and \
                   os.path.exists(os.path.join("fonts", "DejaVuSans-Bold.ttf")):
                    self.fonts_available = True
                else:
                    self.fonts_available = False
            except:
                self.fonts_available = False
        
        if self.fonts_available:
            try:
                pdf.add_font("DejaVu", "", os.path.join("fonts", "DejaVuSans.ttf"), uni=True)
                pdf.add_font("DejaVu", "B", os.path.join("fonts", "DejaVuSans-Bold.ttf"), uni=True)
                return True
            except Exception as e:
                print(f"Font registration failed: {e}")
                self.fonts_available = False
                return False
        return False

    def create_pdf(self, exam, questions, analytics: AnalyticsReport):
        """Generate pdf with all graphs and statistics"""
        self.configure_matplotlib_once()
        
        # Calculate all statistics
        confidence_stats = self.calculate_confidence_stats(exam)
        distribution_stats = self.calculate_distribution_stats(analytics, exam)
        
        # Generate graphs
        graph_path = self.generate_graph(analytics, exam)
        pie_chart_path = self.generate_pie_chart(analytics)
        
        # Create PDF 
        pdf = FPDF()
        pdf.add_page()

        # Register fonts for this PDF instance
        fonts_registered = self.register_fonts(pdf)
        
        # Set fonts
        if fonts_registered:
            pdf.set_font("DejaVu", "", 12)
        else:
            pdf.set_font("Arial", "", 12)
            
        # Add PDF sections
        font_family = "DejaVu" if fonts_registered else "Arial"
        self.add_header(pdf, analytics, font_family)
        self.add_executive_summary(pdf, analytics, font_family)
        self.add_distribution_graph(pdf, analytics, exam, graph_path, font_family)
        self.add_pie_chart_and_stats(pdf, analytics, exam, pie_chart_path, confidence_stats, distribution_stats, font_family)
        self.add_question_analysis(pdf, exam, font_family)
        
        # Save PDF
        file_path = os.path.join(self.path, f"{analytics.exam_title.replace(' ', '_')}_report.pdf")
        pdf.output(file_path)
        
        # Clean up temporary files
        self.cleanup_temp_files([graph_path, pie_chart_path])
        
        return file_path
    
    def cleanup_temp_files(self, file_paths):
        """Clean up temporary image files"""
        for file_path in file_paths:
            try:
                if file_path and os.path.exists(file_path):
                    os.remove(file_path)
            except:
                pass 
    
    def add_header(self, pdf, analytics, font_family):
        """Create heading of PDF"""
        pdf.set_font(font_family, "B", 20)
        pdf.set_text_color(44, 62, 80)
        pdf.cell(0, 15, "EXAMINATION ANALYSIS REPORT", ln=True, align="C")
        
        pdf.set_font(font_family, "B", 16)
        pdf.set_text_color(52, 73, 94)
        pdf.cell(0, 10, f"{analytics.exam_title}", ln=True, align="C")
        
        pdf.set_draw_color(189, 195, 199)
        pdf.line(20, pdf.get_y() + 5, 190, pdf.get_y() + 5)
        pdf.ln(15)
    
    def add_executive_summary(self, pdf, analytics, font_family):
        """Add exam summary"""
        pdf.set_font(font_family, "B", 14)
        pdf.set_text_color(44, 62, 80)
        pdf.cell(0, 8, "EXECUTIVE SUMMARY", ln=True)
        pdf.ln(5)
        
        pdf.set_fill_color(245, 247, 249)
        pdf.set_draw_color(189, 195, 199)
        pdf.rect(15, pdf.get_y(), 180, 20, 'DF')
        
        pdf.set_font(font_family, "", 11)
        pdf.set_text_color(85, 85, 85)
        
        y_start = pdf.get_y() + 5
        pdf.set_y(y_start)
        
        pdf.set_x(20)
        pdf.cell(85, 6, f"Total Questions: {analytics.total_questions}", ln=False)
        pdf.cell(85, 6, f"Total Marks: {analytics.total_marks()}", ln=True)
        pdf.ln(10)
    
    def add_distribution_graph(self, pdf, analytics, exam, graph_path, font_family):
        """Add pre-generated distribution graph"""
        pdf.set_font(font_family, "B", 14)
        pdf.set_text_color(44, 62, 80)
        pdf.ln(5)
        
        if graph_path and os.path.exists(graph_path):
            pdf.image(graph_path, x=15, y=pdf.get_y(), w=180)
            pdf.ln(110)
        
    def add_pie_chart_and_stats(self, pdf, analytics, exam, pie_chart_path, confidence_stats, distribution_stats, font_family):
        """Add pie chart with pre-calculated statistics"""
        if pdf.get_y() > 150:
            pdf.add_page()
            pdf.ln(10)
        
        pdf.set_font(font_family, "B", 14)
        pdf.set_text_color(44, 62, 80)
        pdf.cell(0, 8, "CONFIDENCE ANALYSIS", ln=True)
        pdf.ln(5)
        
        pdf.set_font(font_family, "B", 12)
        pdf.set_text_color(52, 73, 94)
        pdf.cell(90, 6, "Question Distribution by Cognitive Level", ln=False)
        pdf.ln(8)
        
        if pie_chart_path and os.path.exists(pie_chart_path):
            pdf.image(pie_chart_path, x=15, y=pdf.get_y(), w=90)
        
        # Add pre-calculated statistics
        stats_y = pdf.get_y()
        pdf.set_y(stats_y)
        pdf.set_x(110)
        
        # Use pre-calculated confidence stats
        self.add_confidence_stats_section(pdf, confidence_stats, font_family)
        self.add_distribution_stats_section(pdf, distribution_stats, font_family)
        
        pdf.ln(20)
    
    def add_confidence_stats_section(self, pdf, confidence_stats, font_family):
        """Add confidence statistics section with pre-calculated data"""
        pdf.set_font(font_family, "B", 11)
        pdf.set_text_color(44, 62, 80)
        pdf.cell(80, 6, "CONFIDENCE ANALYSIS", ln=True)
        pdf.set_x(110)
        pdf.ln(2)
        
        pdf.set_font(font_family, "", 9)
        pdf.set_text_color(85, 85, 85)
        
        stats_data = [
            f"High Confidence (90%+): {confidence_stats['high']} ({confidence_stats['high_pct']:.1f}%)",
            f"Medium Confidence (70-89%): {confidence_stats['medium']} ({confidence_stats['medium_pct']:.1f}%)",
            f"Low Confidence (under 70%): {confidence_stats['low']} ({confidence_stats['low_pct']:.1f}%)",
            "",
            f"Average Confidence: {confidence_stats['average']:.1f}%",
            f"Standard Deviation: {confidence_stats['std_dev']:.1f}%"
        ]
        
        for stat in stats_data:
            pdf.set_x(110)
            pdf.cell(80, 5, stat, ln=True)
    
    def add_distribution_stats_section(self, pdf, distribution_stats, font_family):
        """Add distribution statistics section with pre-calculated data"""
        pdf.set_x(110)
        pdf.ln(3)
        pdf.set_font(font_family, "B", 11)
        pdf.set_text_color(44, 62, 80)
        pdf.set_x(110)
        pdf.ln(2)
        
        pdf.set_font(font_family, "", 9)
        pdf.set_text_color(85, 85, 85)
        
        dist_data = [
            f"Most Common Level: {distribution_stats['most_common']}",
            f"Least Common Level: {distribution_stats['least_common']}",
            f"Coverage: {distribution_stats['coverage']}/6 levels",
        ]
        
        for stat in dist_data:
            pdf.set_x(110)
            pdf.cell(80, 5, stat, ln=True)
    
    def add_question_analysis(self, pdf, exam, font_family):
        """Add all questions with labels"""
        pdf.ln(10)
        pdf.set_font(font_family, "B", 14)
        pdf.set_text_color(44, 62, 80)
        pdf.cell(0, 8, "DETAILED QUESTION ANALYSIS", ln=True)
        pdf.ln(5)
        
        # Process questions
        for i, question in enumerate(exam.questions, 1):
            if pdf.get_y() > 250:
                pdf.add_page()
                pdf.ln(10)
            
            # Question header
            pdf.set_font(font_family, "B", 11)
            pdf.set_text_color(52, 73, 94)
            pdf.cell(0, 7, f"Question {i}", ln=True)
            
            # Question text
            pdf.set_font(font_family, "", 10)
            pdf.set_text_color(85, 85, 85)
            pdf.multi_cell(0, 6, f"Text: {question.text[:200]}{'...' if len(question.text) > 200 else ''}")  # Truncate long text
            
            # Classification details 
            pdf.ln(2)
            pdf.set_font(font_family, "B", 10)
            pdf.set_text_color(52, 73, 94)
            pdf.cell(45, 6, "Cognitive Level:", ln=False)
            pdf.set_font(font_family, "", 10)
            pdf.cell(50, 6, question.top_bloom_label, ln=False)
            
            pdf.set_font(font_family, "B", 10)
            pdf.cell(35, 6, "Confidence Score:  ", ln=False)
            pdf.cell(15, 6, "", ln=False)
            pdf.set_text_color(85, 85, 85)
            pdf.cell(27, 6, f"{question.confidence_score:.3f}", ln=True)
            
            pdf.set_draw_color(230, 230, 230)
            pdf.line(15, pdf.get_y() + 3, 195, pdf.get_y() + 3)
            pdf.ln(8)
    
    @lru_cache(maxsize=32)
    def get_bloom_colors(self):
        """Cache Bloom's taxonomy colors cached for efficiency"""
        return {
            'Remember': '#F6A611',
            'Understand': '#9536EB',
            'Apply': '#E12E2E',
            'Analyze': '#ED5D0E',
            'Evaluate': '#09A271',
            'Create': '#2A69ED'
        }
    
    def calculate_confidence_stats(self, exam):
        """Optimized confidence statistics calculation"""
        confidences = [q.confidence_score for q in exam.questions]
        if not confidences:
            return {}
            
        total_questions = len(confidences)
        
        # Use list comprehensions for better performance
        high_confidence = sum(1 for c in confidences if c >= 0.9)
        medium_confidence = sum(1 for c in confidences if 0.7 <= c < 0.9)
        low_confidence = total_questions - high_confidence - medium_confidence
        
        mean_conf = sum(confidences) / total_questions
        variance = sum((c - mean_conf) ** 2 for c in confidences) / total_questions
        std_dev = variance ** 0.5
        
        return {
            'high': high_confidence,
            'medium': medium_confidence,
            'low': low_confidence,
            'high_pct': (high_confidence / total_questions) * 100,
            'medium_pct': (medium_confidence / total_questions) * 100,
            'low_pct': (low_confidence / total_questions) * 100,
            'average': mean_conf * 100,
            'std_dev': std_dev * 100,
        }
    
    def calculate_distribution_stats(self, analytics: AnalyticsReport, exam):
        """Optimized distribution statistics calculations"""
        distribution = analytics.distribution
        goal_distribution = analytics.goal_distribution
        
        if not distribution:
            return {}
        
        most_common = max(distribution, key=distribution.get)
        least_common = min(distribution, key=distribution.get)
        coverage = sum(1 for count in distribution.values() if count > 0)
        
        total_questions = sum(distribution.values())
        if total_questions > 0:
            ideal_per_level = total_questions / 6
            avg_deviation = sum(abs(count - ideal_per_level) for count in distribution.values()) / len(distribution)
        
        return {
            'most_common': most_common,
            'least_common': least_common,
            'coverage': coverage,
        }
    
    def generate_pie_chart(self, analytics: AnalyticsReport):
        """Pie chart generation"""
        self.configure_matplotlib_once()
        
        filtered_data = [(label, size) for label, size in analytics.distribution.items() if size > 0]
        if not filtered_data:
            return None
            
        labels, sizes = zip(*filtered_data)
        bloom_colors = self.get_bloom_colors()
        
        # Capitalize the first letter of each label to match color keys
        capitalized_labels = [label.capitalize() for label in labels]
        colors = [bloom_colors.get(label, '#95a5a6') for label in capitalized_labels]

        # Use smaller figure size and optimize settings
        fig, ax = plt.subplots(figsize=(5, 5))
        
        wedges, texts, autotexts = ax.pie(
        sizes, labels=capitalized_labels, colors=colors, autopct='%1.1f%%',
        startangle=90, textprops={'fontsize': 9, 'fontweight': 'bold'}
        )

        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')
            autotext.set_fontsize(8)

        plt.tight_layout()

        # Use temporary file
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False, dir=self.path) as tmp:
            file_path = tmp.name
            
        plt.savefig(file_path, format="PNG", dpi=100, bbox_inches='tight',
                    facecolor='white', edgecolor='none')
        plt.close(fig)
        return file_path
    
    def generate_graph(self, analytics: AnalyticsReport, exam):
        """Optimized bar graph generation"""
        self.configure_matplotlib_once()
        
        def normalize_key(k: str) -> str:
            return k.capitalize()

        actual_dist = {normalize_key(k): v for k, v in analytics.distribution.items()}
        goal_dist = {normalize_key(k): v for k, v in analytics.goal_distribution.items()}

        labels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]
        actual_counts = [actual_dist.get(label, 0) for label in labels]
        goal_counts = [goal_dist.get(label, 0) * analytics.total_marks() / 100 for label in labels]

        x = range(len(labels))
        width = 0.35
        bloom_colors = self.get_bloom_colors()
        colors = [bloom_colors.get(label, '#95a5a6') for label in labels]

        # Use smaller figure and optimize
        fig, ax = plt.subplots(figsize=(10, 6))

        bars1 = ax.bar([i - width/2 for i in x], actual_counts, width=width,
                    label="Current Distribution", color=colors,
                    edgecolor="white", linewidth=1, alpha=0.9)

        bars2 = ax.bar([i + width/2 for i in x], goal_counts, width=width,
                    label="Target Distribution", color=colors,
                    alpha=0.5, edgecolor="white", linewidth=1, hatch='///')

        ax.set_xticks(x)
        ax.set_xticklabels(labels, fontsize=10, fontweight='bold')
        ax.set_title(f"Cognitive Level Distribution Analysis\n{analytics.exam_title}",
                    fontsize=13, fontweight='bold', pad=15, color='#2c3e50')
        ax.set_xlabel("Bloom's Taxonomy Levels", fontsize=11, fontweight='bold', color='#34495e')
        ax.set_ylabel("Number of Marks", fontsize=11, fontweight='bold', color='#34495e')

        # Text rendering
        for bars in [bars1, bars2]:
            for bar in bars:
                height = bar.get_height()
                if height > 0:
                    ax.text(bar.get_x() + bar.get_width()/2., height,
                            f'{height:.1f}', ha='center', va='bottom',
                            fontweight='bold', fontsize=8)

        ax.legend(loc='upper right', frameon=True, fontsize=10)
        ax.grid(True, alpha=0.3, linestyle='--')
        ax.set_axisbelow(True)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)

        plt.tight_layout()

        # Use temporary file
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False, dir=self.path) as tmp:
            file_path = tmp.name
            
        plt.savefig(file_path, format="PNG", dpi=100, bbox_inches='tight',
                    facecolor='white', edgecolor='none')
        plt.close(fig)
        return file_path