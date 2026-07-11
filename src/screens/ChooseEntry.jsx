import './ChooseEntry.css';
import { Link } from 'react-router-dom';

function ChooseEntry(){
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

            <div className="ce-lightgrey-container">
                <Link to="/">
                    <button className="ceBackButton">
                        <img src="/images/backButton.png" className="ceBackSymbol"></img>
                    </button>
                </Link>
                <div className="ceHeader">
                    <h1>How would you like to analyse the questions?</h1>
                </div>
                <div className="options">
                    <Link to="/fileupload">
                        <button className="fileUpload">
                            <img src="/images/fileSymbol.png" className="ceFileSymbol"></img>
                            <h2>Submit File</h2>
                            <h4>Upload a question paper for grouped analysis</h4>
                        
                        </button>
                    </Link>
                    <Link to="/manualentry">
                        <button className="enterQuestion">
                            <img src="/images/pencilSymbol.png" className="cePencilSymbol"></img>
                            <h2>Manual Entry</h2>
                            <h4>Type your questions directly into the system for analysis</h4>
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ChooseEntry;
