import './AnalyticsDisplay.css'
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';

function AnalyticsDisplay(){
    {/*State from goalSubmit or manualEntry*/}
    const location = useLocation();
    const analytics = location.state?.analytics;
    const examData = location.state?.examData;
    const isManualEntry = location.state?.isManualEntry;

    const [editingQuestion, setEditingQuestion] = useState(null);
    const [newLabel, setNewLabel] = useState('');
    const [questions, setQuestions] = useState([]);
    const [currentAnalytics, setCurrentAnalytics] = useState(analytics);
    const [goalTab, setGoalTab] = useState(false);

    {/*CONSTANTS*/}
    const red_confidence_threshold = 0.7;
    const orange_confidence_threshold = 0.9;

    const bloomCategories = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

    const labelColors = {
        'Remember': '#F6A611' ,
        'Understand': '#9536EB' ,
        'Apply': '#E12E2E' ,
        'Analyze': '#ED5D0E' ,
        'Evaluate': '#09A271' ,
        'Create': '#2A69ED'
    }

    {/*Handle warning symbols for low confidence classifications*/}
    const isLowConfidence = (question) => {
        if (question.manually_edited) return false;
        const confidence = question.confidence || question.confidence_score || 0;
        return confidence < red_confidence_threshold;
    }

    const isMediumConfidence = (question) => {
        if (question.manually_edited) return false;
        const confidence = question.confidence || question.confidence_score || 0;
        return confidence > red_confidence_threshold && confidence < orange_confidence_threshold;
    }

    {/*Handle editing of classification labels*/}
    const handleCancelEdit = () => {
        setEditingQuestion(null);
        setNewLabel('');
    }

    const handleSaveEdit = () => {
        if (!editingQuestion || !newLabel) return;

        const updatedQuestions = [...questions];

        updatedQuestions[editingQuestion.index] = {
            ...updatedQuestions[editingQuestion.index],
            label: newLabel,
            manually_edited: true
        };

        setQuestions(updatedQuestions);
        setCurrentAnalytics(recalculateAnalytics(updatedQuestions));

        console.log(`Updated Q${editingQuestion.index + 1} label to: ${newLabel}`);
    
        setEditingQuestion(null);
        setNewLabel('');
    }

    const handleEditClick = (question, index) => {
        setEditingQuestion({...question, index });
        setNewLabel('');
    };

    {/*Switching of tabs in left display box*/}
    const handleSwitchCurrent = () => {
        setGoalTab(false);
    }

    const handleSwitchGoal = () => {
        if (!isManualEntry) {
            setGoalTab(true);
        }
    }

    {/*Handle tooltip hover functionality that shows all probabilities for classification*/}
    const formatProbabilities = (classified_question) => {
        const rawPredictions =
            classified_question.predictions ||
            classified_question.all_predictions ||
            [];

        const flatPredictions = Array.isArray(rawPredictions[0])
            ? rawPredictions[0]
            : rawPredictions;

        let tooltip = "Probabilities:\n";

        bloomCategories.forEach(category => {
            const match = flatPredictions.find(
                p => p.label.toLowerCase() === category.toLowerCase()
            );

            const prob = match ? match.score : 0;

            tooltip += `• ${category}: ${prob.toFixed(3)}\n`;
        });

        return tooltip.trim();
    };
    
    {/*Handle analytics graphics - pie chart and bar graph*/}
    const pieChartData = Object.entries(currentAnalytics.distribution).map(([level, count]) => {
        const capitalizedLevel = level.charAt(0).toUpperCase() + level.slice(1);
        const percentage = (count/currentAnalytics.total_marks) * 100;

        return {
            name: capitalizedLevel,
            value: count,
            percentage: percentage.toFixed(1)
        };
    });

    const pieChartLabels = (entry) => {
        return `${entry.percentage}%`;
    }

    const barChartData = () => {
        return bloomCategories.map(category => {
            const currentMarks = currentAnalytics.distribution[category] || currentAnalytics.distribution[category.toLowerCase()] || 0;
            const currentPercentage = currentAnalytics.total_marks > 0 ? (currentMarks / currentAnalytics.total_marks * 100) : 0;

            const goalPercentage = parseFloat(analytics.goal_distribution[category.toLowerCase()] || 0);

            return {
                category: category,
                current: parseFloat(currentPercentage.toFixed(1)),
                goal: goalPercentage,
                currentMarks: currentMarks,
                goalMarks: Math.round((goalPercentage / 100) * currentAnalytics.total_marks)

            };
        });
    };

    {/*Export as pdf button functionality*/}
    const handleExportPDF = async () => {
        try {
            if (!examData || !analytics) {
                console.error("Missing exam or analytics data for PDF export.");
                return;
            }

            const examPayload = {
                title: examData.exam_name || examData.title || "Exam Report",
                questions: questions.map(q => ({
                    text: q.text,
                    marks: q.marks,
                    top_bloom_label: q.label || q.top_bloom_label || "",
                    confidence_score: q.confidence || q.confidence_score || 0
                }))
            };

            const response = await fetch('http://localhost:5000/api/generate_report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    exam: examPayload,
                    analytics: currentAnalytics
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server error:", errorText);
                throw new Error(`Server error: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'exam_report.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            console.log("PDF exported successfully.");
        } catch (error) {
            console.error("Error exporting PDF:", error);
            alert(`Error exporting PDF: ${error.message}`);
        }
    };

    {/*Ensure modifications to questions doesn't affect examData*/}
    useEffect(() => {
        if (examData?.questions) {
            setQuestions([...examData.questions]);
        }
    }, [examData]);

    {/*For handling of edits made to classification data for responsive visual graphics*/}
    const recalculateAnalytics = (updatedQuestions) => {
        const distribution = {};
        let totalMarks = 0;

        updatedQuestions.forEach(question => {
            const label = question.label.toLowerCase();
            const marks = question.marks || 0;
            
            distribution[label] = (distribution[label] || 0) + marks;
            totalMarks += marks;
        });

        return {
            ...currentAnalytics,
            distribution,
            total_marks: totalMarks
        };
    };

    return(
        <div> 
            <Link to="/">
                <button className="logoHomeButton">
                    <img src="/images/cornerLogo.png" className="smallLogo"></img>
                </button>
            </Link>

            <Link to="/usermanual">
                <button className="userManualButton">User Manual</button>
            </Link>
            <Link to="/about">
                <button className="aboutButton">About BLA</button>
            </Link>

            <div className="me-lightgrey-container">
                <div className="adHeader">
                    <h1>Analysis:</h1>
                    <h2>{examData.exam_name}</h2>
                    <button className="exportButton" onClick={handleExportPDF}>Export as PDF</button>
                </div>

                <div className="mainAnalytics">
                    <div className="distributionsBar">
                        {/*PIE CHART / BAR GRAPH*/}
                        <div className="distributionHeader">
                            <h3>Distributions</h3>
                            {!isManualEntry && (
                                <button className="goalButton" onClick={handleSwitchGoal}>Goal</button>
                            )}
                            <button className="currentButton" onClick={handleSwitchCurrent}>Current</button>
                        </div>

                        {!goalTab&&
                            <div className="pieChartSection">
                                <h4>Mark Distribution</h4>
                                    <ResponsiveContainer width="100%" height={160}>
                                            <PieChart>
                                                <Pie
                                                    data={pieChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={pieChartLabels}
                                                    outerRadius={45}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {pieChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={labelColors[entry.name]}/>
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value, name) => [value, name]}/>
                                            </PieChart>
                                    </ResponsiveContainer>
                            </div>
                        }
                        {goalTab &&
                            <div className="BarGraphSection">
                                <h4>Current vs Goal Mark Distribution:</h4>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart
                                        data={barChartData()}
                                        margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                    barCategoryGap={10}>
                                        <CartesianGrid strokeDasharray="3 3" />

                                        <XAxis 
                                            dataKey="category" 
                                            tick={{ fontSize: 12 }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        
                                        <YAxis 
                                            label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                                        />
                                        <Tooltip 
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    const current = payload.find(p => p.dataKey === 'current');
                                                    const goal = payload.find(p => p.dataKey === 'goal');

                                                    return (
                                                        <div className="custom-tooltip" style={{ backgroundColor: "#fff", padding: "10px", border: "1px solid #ccc" }}>
                                                            <p><strong>Category:</strong> {label}</p>
                                                            <p style={{ color: '#8884d8' }}>Current: {current?.value}%</p>
                                                            <p style={{ color: '#82ca9d' }}>Goal: {goal?.value}%</p>
                                                        </div>
                                                    );
                                                }

                                                return null;
                                            }}
                                        />
                                        <Bar 
                                            dataKey="current" 
                                            fill="#8884d8" 
                                            name="Current"
                                            radius={[2, 2, 0, 0]}
                                        />
                                        <Bar 
                                            dataKey="goal" 
                                            fill="#82ca9d" 
                                            name="Goal"
                                            radius={[2, 2, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        }
                        {/*DISTRIBUTION BARS / ACTIONS TO BE TAKEN*/}
                        {!goalTab &&
                            <div className="distributionBars">
                                {bloomCategories.map(category => {
                                    const count = currentAnalytics.distribution[category] || currentAnalytics.distribution[category.toLowerCase()] || 0;
                                    const percentage = currentAnalytics.total_marks > 0 ? (count / currentAnalytics.total_marks * 100) : 0;

                                    return (
                                        <div key={category.toLowerCase()} className="distributionBarRow">
                                            <div className="eachBar">
                                                <span className="categoryLabel">{category}:</span>
                                                <div className="barContainer">
                                                    <div 
                                                        className="distributionBar" 
                                                        style={{
                                                            width: `${Math.max(percentage, 3)}%`, 
                                                            backgroundColor: labelColors[category]
                                                        }}
                                                    >{count}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="totalQuestions">
                                    <h4>Total Questions: {examData.total_questions}</h4>
                                    <h4>Total Marks: {analytics.total_marks}</h4>
                                </div>
                            </div>
                        }

                        {goalTab &&
                            <div className="actionsToBeTaken">
                                <h4>Actions to Meet Target:</h4>
                                {bloomCategories.map(category => {
                                    const currentMarks = currentAnalytics.distribution[category] || currentAnalytics.distribution[category.toLowerCase()] || 0;
                                    const currentPercentage = currentAnalytics.total_marks > 0 ? (currentMarks / currentAnalytics.total_marks * 100) : 0;

                                    const goalPercentage = parseFloat(analytics.goal_distribution[category.toLowerCase()] || 0);
                                    const goalMarks = Math.round((goalPercentage/100) * currentAnalytics.total_marks);
                                    const difference = goalMarks - currentMarks;

                                    if (difference == 0) return null
                                    
                                    return (
                                        <div key={category} className="actionRow">
                                            <span className="actionCategory">{category}</span>
                                            <span 
                                                className={`actionNumber ${difference > 0 ? 'positive' : 'negative'}`}
                                                style={{
                                                    color: difference > 0 ? '#09A271' : '#E12E2E',
                                                }}
                                            >
                                                {difference > 0 ? `+${difference}` : difference} marks
                                            </span>
                                        </div>
                                    )
                                })}

                            </div>
                            
                        }
                    </div>
                    {/*QUESTION SCROLL*/}
                    <div className="labelledQuestionsBox">
                        <h3>Labelled Questions</h3>
                        <div className="analyticsScroll">
                            {questions.map((question, index) => (
                                <div className="analyticsRow" title={formatProbabilities(question)} key={index}>
                                    <div className="analyticsQuestionIDBox">
                                        <h2>Q{index+1}</h2>
                                    </div>

                                    <div className="questionTab">
                                        <div className="questionText">{question.text}</div>
                                        <div className="questionLabelContainer">
                                            <div className={`questionLabel ${question.label}`}>{question.label}</div>
                                            {isLowConfidence(question) && (
                                                <div className="warning">
                                                    <img src='/images/warningSymbol.png' className="warningSymbol"></img>
                                                </div>
                                            )}

                                            {isMediumConfidence(question) && (
                                                <div className="orangeWarning">
                                                    <img src="/images/orangeWarning.png" className="orangeWarningSymbol"></img>
                                                </div>
                                            )}

                                            {question.manually_edited &&
                                                <div className="edited_label">
                                                    <img src="/images/editedLabel.png" className="edit_label_symbol"></img>
                                                </div>    
                                            }

                                            <div className="questionMarks">
                                                <h4>Marks: {question.marks}</h4>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="edit">
                                        <button className="editLabel" onClick={() => handleEditClick(question, index)}>
                                            <img src="/images/editSymbol.png" className="editLabelButton"></img>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/*EDIT OVERLAY*/}
            {editingQuestion && (
                <div className="editOverlayBox">
                    <div className="editHeader">
                        <h3>Edit Mode:</h3>
                        <button className="editClose" onClick={handleCancelEdit}>X</button>
                    </div>

                    <div className="questionAndID">
                        <div className="editQuestionIDBox">
                            <h2>Q{editingQuestion.index + 1}</h2>
                        </div>

                        <div className="questionToEditBox">
                            <h3>{editingQuestion.text}</h3>
                        </div>
                    </div>

                    <div className="labelsOriginalNew">
                        <h2>Original:</h2>
                        <h2>New:</h2>
                    </div>

                    <div className="categoryLabels">
                        <div className={`originalLabel ${editingQuestion.label}`}>
                            {editingQuestion.label}
                        </div>
                        <div className="arrowSymbol">
                            <img src="/images/arrow.png" className="arrowSymbolImage"></img>
                        </div>
                        <div className="newLabel">
                            <select value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className={`label-select ${newLabel}`}>
                                <option value="" disabled>SELECT</option>
                                <option value="Remember">Remember</option>
                                <option value="Understand">Understand</option>
                                <option value="Analyze">Analyze</option>
                                <option value="Apply">Apply</option>
                                <option value="Evaluate">Evaluate</option>
                                <option value="Create">Create</option>
                            </select>
                        </div>
                    </div>

                    <div className="editFooter">
                        {newLabel && (
                            <button className="editConfirm" onClick={handleSaveEdit}>Confirm</button>
                        )}    
                    </div>
                </div>
            )}
        </div>
    )
}

export default AnalyticsDisplay;
