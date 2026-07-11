import './UserManual.css';
import { Link } from 'react-router-dom';

function UserManual(){
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

            <div className="um-lightgrey-container">
                <div className="umHeader">
                    <Link to="/">
                        <button className="BackButton">
                            <img src="/images/backButton.png" className="BackSymbol"></img>
                        </button>
                    </Link>
                </div>

                <div className="umColumnHeaders">
                    <h1>Submit File:</h1>
                    <h1>Manual Entry:</h1>
                </div>

                <div className="umDescriptors">
                    <h4>Submit questions by uploading a .pdf/.docx file</h4>
                    <h4>Submit questions by typing each one manually</h4>
                </div>

                <div className="umInstructions">
                    <div className="submitFile">
                        <h2>1. Select .pdf/.txt file to upload </h2>
                        <h2>2. Enter distribution goals</h2>
                        <h2>3. Click 'Analyze' to analyze questions</h2>
                        <h2>4. View analytics</h2>
                        <h2>5. Export the final report</h2>
                        <img src="/images/fileSymbol.png" className="umFileSymbol"></img>

                    </div>
                    <div className="manualEntry">
                        <h2>1. Enter a question in the text box</h2>
                        <h2>2. Add more questions</h2>
                        <h2>3. Click 'Analyze' to analyze questions</h2>
                        <img src="/images/pencilSymbol.png" className="umPencilSymbol"></img>
                    </div>
                </div>
            </div>


        </div>
    )
}

export default UserManual;