import './About.css';
import { Link } from 'react-router-dom';

function About(){
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
            <div className="about-lightgrey-container">
                <div className="abtHeader">
                    <Link to="/">
                        <button className="BackButton">
                            <img src="/images/backButton.png" className="BackSymbol"></img>
                        </button>
                    </Link>
                    <h1>Welcome to the Bloom Labelling Assistant!</h1>
                </div>
                <div className="inner">
                    <div className="abtText">
                        <h2>By using a language model, this application categorises test and exam questions according to Bloom's taxonomy.</h2>
                        <h2>This helps to save time, ensure balance, and improve the testing quality of educators by bridging technology and education!</h2>
                        <p>The LateBloomers Team</p>
                    </div>
                    <img src="/images/BloomPyramid.png" className="pyramidGraphic">
                    </img>
                </div>
            </div>

        </div>
    );
}

export default About;
