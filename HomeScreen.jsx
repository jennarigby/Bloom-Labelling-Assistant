import './HomeScreen.css';
import { Link } from 'react-router-dom';

function HomeScreen(){
    return(
        
        <div className="home-lightgrey-container">
            <img src="/images/BLAtitleLogo.png" className="centre-logo">
            </img>
            <h4>Question Analysis System Based on Bloom's Taxonomy Framework</h4>
            <Link to="/entry">
                <button className="analyseButton">Analyse Questions</button>
            </Link>
            <Link to="/usermanual">
                <button className="userManualButtonHome">User Manual</button>
            </Link>
            <Link to="/about">
                <button className="aboutButtonHome">About BLA</button>
            </Link>
            
        </div>  
    );
}

export default HomeScreen;