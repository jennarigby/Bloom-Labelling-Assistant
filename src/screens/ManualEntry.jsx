import './ManualEntry.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function ManualEntry(){
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([{id: 1, text: '', marks: 0}]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [noQuestions, setNoQuestions] = useState(false);

    {/*Handle adding another question*/}
    const addQuestion = () => {
        const newQuestion = {
            id: questions.length + 1,
            text: '',
            marks: 0
        };
        setQuestions([...questions, newQuestion]);
    };

    {/*Handle change to text input fields for question and marks box*/}
    const updateQuestionText = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].text = value;
        setQuestions(newQuestions);
    };

    const updateQuestionMarks = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].marks = parseInt(value) || 0;
        setQuestions(newQuestions);
    };

    {/*Delete functioanlity*/}
    const removeQuestion = (index) => {
        if (questions.length > 1) {
            const newQuestions = questions.filter((_, i) => i !== index);
            const updatedQuestions = newQuestions.map((q, i) => ({
                ...q,
                id: i + 1
            }));
            setQuestions(updatedQuestions);
        }
    };

    {/*Handle sending questions to backend - API call*/}
    const submitQuestions = async () => {
        const validQuestions = questions
            .filter(q => q.text.trim() !== '')
            .map(q => ({ text: q.text, marks: q.marks }));

        if (validQuestions.length === 0) {
            //alert('Please enter at least one question.');
            setNoQuestions(true);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:5000/api/enter_question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questions: validQuestions }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit questions');
            }

            const result = await response.json();

            const analytics = result.analytics;
            const updatedExamData = result.exam;

            navigate('/analytics', {
                state: {
                    analytics: analytics,
                    examData: updatedExamData,
                    isManualEntry: true
                }
            });

        } catch (error) {
            console.error('Error submitting questions:', error);
            alert('Error submitting questions. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };


    return(
        <div>
            <Link to="/">
                <button className="logoHomeButton">
                    <img src="/images/cornerLogo.png" className="smallLogo">
                    </img>
                </button>
            </Link>
            
            <Link to="/usermanual">
                <button className="userManualButton">User Manual</button>
            </Link>
            <Link to="/about">
                <button className="aboutButton">About BLA</button>
            </Link>

            <div className="me-lightgrey-container">
                <Link to="/entry">
                    <button className="ceBackButton">
                        <img src="/images/backButton.png" className="ceBackSymbol"></img>
                    </button>
                </Link>

                <div className="ceHeader">
                    <h1>Manual Entry</h1>
                </div>

                <div className="columnLabels">
                    <h3 className="qLabel">Question:</h3>
                    <h3 className="mLabel">Marks:</h3>
                </div>

                <div className="scrollQuestions">
                    {questions.map((question, index) => (
                        <div className="row">
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

                            <button 
                                className="me_edit_delete_button"
                                onClick={() => removeQuestion(index)}
                                disabled={questions.length == 1}
                            >
                                <img src="/images/cancelSymbol.png" className="me_edit_delete_symbol"></img>
                            </button>
                        </div>
                    ))}
                </div>

                <div className="meFooter">
                    {noQuestions &&
                        <h3>Please enter at least one question</h3>
                    }
                    <button className="meAddQuestionButton" onClick={addQuestion}>Add Question</button>
                    <button className="meSubmitButton" onClick={submitQuestions} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ManualEntry;


