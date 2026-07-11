import './GoalSubmit.css';
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function GoalSubmit(){
    const navigate = useNavigate();
    const location = useLocation();

    {/*CONSTANTS*/}
    const MIN = 0;
    const MAX = 100;

    {/*FOR SLIDER*/}
    const [rememberValue, setRememberValue] = useState(50);
    const [understandValue, setUnderstandValue] = useState(50);
    const [applyValue, setApplyValue] = useState(50);
    const [analyzeValue, setAnalyzeValue] = useState(50);
    const [evaluateValue, setEvaluateValue] = useState(50);
    const [createValue, setCreateValue] = useState(50);

    {/*FOR TEXT INPUT*/}
    const [rememberInput, setRememberInput] = useState('50');
    const [understandInput, setUnderstandInput] = useState('50');
    const [applyInput, setApplyInput] = useState('50');
    const [analyzeInput, setAnalyzeInput] = useState('50');
    const [evaluateInput, setEvaluateInput] = useState('50');
    const [createInput, setCreateInput] = useState('50');

    const [isError, changeError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    {/*Handle slider input*/}
    const sliderChange = (e, changeValue, changeStringInput) => {
        const placeholder = e.target.value;
        changeValue(parseInt(placeholder));
        changeStringInput(placeholder);
    };

    {/*Handle text input*/}
    const inputTextboxChange = (e, changeValue, changeStringInput) => {
        const inputVal = e.target.value;
        changeStringInput(inputVal);
        
        const checkNumber = parseInt(inputVal);
        if (!isNaN(checkNumber) && checkNumber >= MIN && checkNumber <= MAX) {
            changeValue(checkNumber);
        }
    };

    const checkValidInput = (stringValue, numberValue, changeStringInput) => {
        const checkNumber = parseInt(stringValue);
        if (isNaN(checkNumber) || checkNumber < MIN || checkNumber > MAX) {
            changeStringInput(numberValue.toString());
        }
    };

    {/*Send to backend - API Call*/}
    const sendGoalDistribution = async (goalDistribution) => {
        try {
            setIsSubmitting(true);

            const examData = location.state?.examData;
            const classifiedQuestions = examData.questions;

            if (!examData) {
                throw new Error('Missing exam data. Please upload an exam first.');
            }

            if (!classifiedQuestions || classifiedQuestions.length === 0) {
                throw new Error('Missing classified questions. Please analyze questions first.');
            }

            console.log('Sending goal data:', {
                goalDistribution,
                examData,
                classifiedQuestions
            });

            const response = await fetch('http://localhost:5000/api/enter_goal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    goal_distribution: goalDistribution,
                    exam_data: examData,
                    classified_questions: classifiedQuestions
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit goal distribution');
            }

            const goalResult = await response.json();
            console.log('Goal distribution submitted successfully:', goalResult);

            const analytics = goalResult.analytics;

            navigate('/analytics', {
                state: {
                    analytics: analytics,
                    examData: examData,
                    
                }
            });

        } catch (error) {
            console.error('Failed to submit goal distribution:', error);
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    {/*Exception/error handling*/}
    const checkTotalValue = async () => {
        const totalValue = rememberValue + understandValue + applyValue + analyzeValue + evaluateValue + createValue;
        if (totalValue !== MAX) {
            changeError(true);
        } else {
            changeError(false);
        
            const goalDistribution = {
                remember: rememberValue,
                understand: understandValue,
                apply: applyValue,
                analyze: analyzeValue,
                evaluate: evaluateValue,
                create: createValue
            };
            
            await sendGoalDistribution(goalDistribution);
        }
    };

    {/*Predefined distributions*/}
    const recommendedDistributions = {
        firstYear: {
            remember: 30,
            understand: 30,
            apply: 20,
            analyze: 10,
            evaluate: 5,
            create: 5
        },

        secondYear: {
            remember: 10,
            understand: 20,
            apply: 35,
            analyze: 20,
            evaluate: 10,
            create: 5
        },

        thirdYear: {
            remember: 5,
            understand: 15,
            apply: 30,
            analyze: 25,
            evaluate: 15,
            create: 10
        }
    }
    const automaticallyPopulate = (year) => {
        const distribution = recommendedDistributions[year];

        setRememberValue(distribution.remember);
        setUnderstandValue(distribution.understand);
        setApplyValue(distribution.apply);
        setAnalyzeValue(distribution.analyze);
        setEvaluateValue(distribution.evaluate);
        setCreateValue(distribution.create);

        setRememberInput(distribution.remember.toString());
        setUnderstandInput(distribution.understand.toString());
        setApplyInput(distribution.apply.toString());
        setAnalyzeInput(distribution.analyze.toString());
        setEvaluateInput(distribution.evaluate.toString());
        setCreateInput(distribution.create.toString());
    }

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

            <div className="gs-lightgrey-container">
                <div className="gsHeader">
                    <Link to="/entry">
                        <button className="ceBackButton">
                            <img src="/images/backButton.png" className="ceBackSymbol"></img>
                        </button>
                    </Link>
                    <h1>Enter Target Distributions</h1>
                    <h3>Enter the goal distribution for each Bloom's taxonomical category</h3>
                </div>

                <div className="scrollableParent">
                    <div className="remember">
                        <div className="labelBackdrop">
                            <div className="rememberLabel"></div>
                            <h3>Remember</h3>
                        </div>
                        <div className="sliderAndBox">
                            <div className="rangeSlider">
                                <input type="range" min={MIN} max={MAX} value={rememberValue} onChange={(e) => sliderChange(e, setRememberValue, setRememberInput)}/>
                            </div>
                            <div className="textInputBox">
                                <input type="text" className="valueInput" min={MIN} max={MAX} maxLength="3" value={rememberInput} onChange={(e) => inputTextboxChange(e, setRememberValue, setRememberInput)} onBlur={() => checkValidInput(rememberInput, rememberValue, setRememberInput)}/>
                            </div>
                        </div>

                    </div>

                    <div className="understand">
                        <div className="labelBackdrop">
                            <div className="understandLabel"></div>
                            <h3>Understand</h3>
                        </div>
                        <div className="sliderAndBox">
                            <div className="rangeSlider">
                                <input type="range" min={MIN} max={MAX} value={understandValue} onChange={(e) => sliderChange(e, setUnderstandValue, setUnderstandInput)}/>
                            </div>
                            <div className="textInputBox">
                                <input type="text" className="valueInput" min={MIN} max={MAX} maxLength="3" value={understandInput} onChange={(e) => inputTextboxChange(e, setUnderstandValue, setUnderstandInput)} onBlur={() => checkValidInput(understandInput, understandValue, setUnderstandInput)}/>
                            </div>
                        </div>
                    </div>

                    <div className="apply">
                        <div className="labelBackdrop">
                            <div className="applyLabel"></div>
                            <h3>Apply</h3>
                        </div>
                        <div className="sliderAndBox">
                            <div className="rangeSlider">
                                <input type="range" min={MIN} max={MAX} value={applyValue} onChange={(e) => sliderChange(e, setApplyValue, setApplyInput)}/>
                            </div>
                            <div className="textInputBox">
                                <input type="text" className="valueInput" min={MIN} max={MAX} maxLength="3" value={applyInput} onChange={(e) => inputTextboxChange(e, setApplyValue, setApplyInput)} onBlur={() => checkValidInput(applyInput, applyValue, setApplyInput)}/>
                            </div>
                        </div>
                    </div>

                    <div className="analyze">
                        <div className="labelBackdrop">
                            <div className="analyzeLabel"></div>
                            <h3>Analyze</h3>
                        </div>
                        <div className="sliderAndBox">
                            <div className="rangeSlider">
                                <input type="range" min={MIN} max={MAX} value={analyzeValue} onChange={(e) => sliderChange(e, setAnalyzeValue, setAnalyzeInput)}/>
                            </div>
                            <div className="textInputBox">
                                <input type="text" className="valueInput" min={MIN} max={MAX} maxLength="3" value={analyzeInput} onChange={(e) => inputTextboxChange(e, setAnalyzeValue, setAnalyzeInput)} onBlur={() => checkValidInput(analyzeInput, analyzeValue, setAnalyzeInput)}/>
                            </div>
                        </div>
                    </div>

                    <div className="evaluate">
                        <div className="labelBackdrop">
                            <div className="evaluateLabel"></div>
                            <h3>Evaluate</h3>
                        </div>
                        <div className="sliderAndBox">
                            <div className="rangeSlider">
                                <input type="range" min={MIN} max={MAX} value={evaluateValue} onChange={(e) => sliderChange(e, setEvaluateValue, setEvaluateInput)}/>
                            </div>
                            <div className="textInputBox">
                                <input type="text" className="valueInput" min={MIN} max={MAX} maxLength="3" value={evaluateInput} onChange={(e) => inputTextboxChange(e, setEvaluateValue, setEvaluateInput)} onBlur={() => checkValidInput(evaluateInput, evaluateValue, setEvaluateInput)}/>
                            </div>
                        </div>
                    </div>

                    <div className="create">
                        <div className="labelBackdrop">
                            <div className="createLabel"></div>
                            <h3>Create</h3>
                        </div>
                        <div className="sliderAndBox">
                            <div className="rangeSlider">
                                <input type="range" min={MIN} max={MAX} value={createValue} onChange={(e) => sliderChange(e, setCreateValue, setCreateInput)}/>
                            </div>
                            <div className="textInputBox">
                                <input type="text" className="valueInput" min={MIN} max={MAX} maxLength="3" value={createInput} onChange={(e) => inputTextboxChange(e, setCreateValue, setCreateInput)} onBlur={() => checkValidInput(createInput, createValue, setCreateInput)}/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="gsFooter">
                    <h4>Recommended Distributions:</h4>
                    <button className="firstYear" onClick={() => automaticallyPopulate('firstYear')}>First Year</button>
                    <button className="secondYear" onClick={() => automaticallyPopulate('secondYear')}>Second Year</button>
                    <button className="thirdYear" onClick={() => automaticallyPopulate('thirdYear')}>Third Year</button>

                    <button className="meSubmitButton" onClick={checkTotalValue} disabled={isSubmitting}>{isSubmitting ? 'Processing...' : 'Confirm'}</button>
                    {isError && <h2>Values must add up to 100.</h2>}
                </div>
            </div>
        </div>
    )
}

export default GoalSubmit;
