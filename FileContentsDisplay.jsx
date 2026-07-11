import './ManualEntry.css';
import './FileContentsDisplay.css'
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function FileContentsDisplay() {
    const navigate = useNavigate();
    const location = useLocation();

    const [questions, setQuestions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalQuestions, setOriginalQuestions] = useState([]);

    {/*Get question information from state from previous screen*/}
    useEffect(() => {
        if (!location.state) {
            navigate('/fileupload');
            return;
        }

        const questionsData = location.state.questions;

        if (!questionsData || !questionsData.questions || !Array.isArray(questionsData.questions)) {
            navigate('/fileupload');
            return;
        }

        const mapped = questionsData.questions.map((q, index) => ({
            id: index + 1,
            text: q.text || '',
            marks: parseInt(q.marks) || 0,
            label: q.label || '',
            confidence: q.confidence || 0,
            predictions: q.predictions || [],
            originalText: q.text || '',
            originalMarks: parseInt(q.marks) || 0
        }));

        setQuestions(mapped);
        setOriginalQuestions(JSON.parse(JSON.stringify(mapped)));
    }, [location, navigate]);

    {/*Handle updates to question set*/}
    const addQuestion = () => {
        const newQuestion = {
            id: questions.length + 1,
            text: '',
            marks: 0,
            label: '',
            confidence: 0,
            originalText: '',
            originalMarks: 0
        };
        setQuestions([...questions, newQuestion]);
        setHasChanges(true);
    };

    const updateQuestionText = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].text = value;
        setQuestions(newQuestions);
        setHasChanges(true);
    };

    const updateQuestionMarks = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].marks = parseInt(value) || 0;
        setQuestions(newQuestions);
        setHasChanges(true);
    };

    const removeQuestion = (index) => {
        if (questions.length > 1) {
            const newQuestions = questions.filter((_, i) => i !== index);
            const updatedQuestions = newQuestions.map((q, i) => ({
                ...q,
                id: i + 1
            }));
            setQuestions(updatedQuestions);
            setHasChanges(true);
        }
    };

    {/*Reset functionality*/}
    const resetChanges = () => {
        setQuestions(JSON.parse(JSON.stringify(originalQuestions)));
        setHasChanges(false);
    };

    {/*Handle submitting questions to backend - API call*/}
    const analyzeQuestions = async () => {
        const validQuestions = questions.filter(q => q.text.trim() !== '');
        if (validQuestions.length === 0) {
            alert('Please enter at least one question.');
            return;
        }

        setIsSubmitting(true);

        try {
            let classifiedQuestions = [];

            const questionsData = validQuestions.map(q => ({
                text: q.text.trim(),
                marks: q.marks
            }));

            const response = await fetch('http://localhost:5000/api/confirm_questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(questionsData),
            });

            if (!response.ok) throw new Error('Failed to submit updated questions');

            const result = await response.json();

            if (result.status === 'confirmed') {
                console.log(`Successfully processed ${result.processed_count} questions`);
                classifiedQuestions = result.questions;
                setHasChanges(false);
                setOriginalQuestions(JSON.parse(JSON.stringify(questions)));
            } else {
                throw new Error('Unexpected response from server');
            }

            navigate('/goalsubmit', {
                state: {
                    classifiedQuestions: classifiedQuestions,
                    examData: {
                        fileName: location.state.fileName,
                        questions: classifiedQuestions
                    }
                }
            });

        } catch (error) {
            console.error('Error analyzing questions:', error);
            alert('Error analyzing questions. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <Link to="/">
                <button className="logoHomeButton">
                    <img src="/images/cornerLogo.png" className="smallLogo" alt="Home" />
                </button>
            </Link>

            <Link to="/usermanual">
                <button className="userManualButton">User Manual</button>
            </Link>
            <Link to="/about">
                <button className="aboutButton">About BLA</button>
            </Link>

            <div className="me-lightgrey-container">
                <Link to="/fileupload">
                    <button className="ceBackButton">
                        <img src="/images/backButton.png" className="ceBackSymbol" alt="Back" />
                    </button>
                </Link>

                <div className="ceHeader">
                    <h1>Question Overview</h1>
                    {hasChanges && (
                        <p className="changes-indicator" style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                            Changes detected - click Analyze to apply
                        </p>
                    )}
                </div>

                <div className="columnLabels">
                    <h3 className="qLabel1">Edit Question:</h3>
                    <h3 className="mLabel1">Edit Marks:</h3>
                </div>

                <div className="scrollQuestions">
                    {questions.map((question, index) => (
                        <div key={question.id} className="row">
                            <div className="questionIDBox">
                                <h2>Q{question.id}</h2>
                            </div>

                            <div className="question_subsection">
                                <input
                                    type="text"
                                    className="questionInput"
                                    placeholder="Enter question.."
                                    value={question.text}
                                    onChange={(e) => updateQuestionText(index, e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="markInput"
                                    placeholder="0"
                                    value={question.marks}
                                    onChange={(e) => updateQuestionMarks(index, e.target.value)}
                                />
                            </div>

                            <button className="me_edit_delete_button" onClick={() => removeQuestion(index)} disabled={questions.length === 1}>
                                <img src="/images/cancelSymbol.png" className="me_edit_delete_symbol" alt="Delete" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="meFooter">
                    <button className="meAddQuestionButton" onClick={addQuestion}>
                        Add Question
                    </button>
                    {hasChanges && (
                        <button className="meResetButton" onClick={resetChanges}>
                            <img src="/images/undoButton.png" className="undoSymbol"></img>
                        </button>
                    )}
                    <button
                        className="meSubmitButton"
                        onClick={analyzeQuestions}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FileContentsDisplay;