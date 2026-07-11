# Bloom Labelling Assistant

## Student Names 

Jenna Rigby,
Joshua Diegaardt,
Aqeelah Ismail

## User Manual

The Bloom Labelling Assistant (BLA) is used to classify questions according to Bloom’s taxonomy. Each classification in the hierarchy is indicative of the cognitive level required to answer a question. This system helps educators and examiners to test student understanding in a nuanced way that includes questions from a range of categories in the taxonomy.

The system assists in the creation of tests and exams as it helps classify questions and show the distribution of each category. Additionally, the system allows for a desired distribution to be given and offers practical steps on how to reach this distribution after questions have been classified.

The system also allows for the classification of manually entered questions for quicker classification.

**Minimum System Requirements:**  
The minimum system requirements are at least 4GB of RAM, 256GB of storage and at least a dual core CPU. Although the system will run with these requirements, question classification and report generation will take longer.

The recommended system requirements are at least 8GB of RAM, 256GB of storage and at least 4 cores. The CPU should be optimised for matrix multiplication to ensure fast question classification.

**Installation and SetUp:**

**Prerequisites:**  
•	Python must be installed (3.13)  
•	Git must be initialised and git bash must be installed  
•	UV package manager must be installed  
•	NPM (Node Package Manager) must be installed  
•	Vite must be installed  
•	NodeJS 22.20.0 LTS must be installed  

A stable internet connection is necessary for the following steps.

To begin, clone the repository.

Next, navigate to the directory of the cloned repository and create a virtual environment by typing “python -m venv .venv” in the terminal of the project. After this, activate the virtual environment by typing “.\.venv\Scripts\Activate.ps1” in Windows powershell or “source .venv/bin/activate” if using  MAC or Linux. After the virtual environment has been activated, install the necessary python dependencies by typing “uv pip install -r uv.lock”.

For Node packages, run “npm install” to install the necessary Node packages.

If there are access issues on Windows powershell that prevents commands from being run, change the access for a given user by typing “Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser” and then activate the virtual environment.

After all packages are installed, run FlaskApp.py, and type “npm run dev” in a new terminal. After this, click on the localhost link that appears in the terminal that is running the ‘npm run dev’ command. When running for the first time, the model will be downloaded, so the first run will be longer. 

**Guide:**

_Exam Upload:_  
1. Upload an exam (either a .pdf or .txt format). If a .txt file, the expected format is pasting the contents of the document into a .txt file.
1. Edit the question and mark allocation.  
1. Enter the desired goal distribution or use presets for common distributions for different university years.  
1. Review the question classification. Questions with a low confidence score are flagged. If a question has a score below 90% confidence, it gets an orange flag, and if below 70% confidence, it gets a red flag. These classifications can be manually edited as the model is not entirely accurate.  
1. Export the final pdf report that summarises the question classifications, distribution and provides a short analysis of the classifications.

_Manual Entry:_

1. Manually enter at least one question and a mark allocation for each question.
1. Submit the question for classification.
1. Review the analytics report to see question classifications and edit classifications if necessary.
1. Export the final pdf report that summarises the question classifications, distribution and provides a short analysis of the classifications.


