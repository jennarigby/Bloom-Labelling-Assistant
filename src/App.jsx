import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import About from './screens/About';
import UserManual from './screens/UserManual';
import ChooseEntry from './screens/ChooseEntry';
import FileUpload from './screens/FileUpload';
import FileContentsDisplay from './screens/FileContentsDisplay';
import ManualEntry from './screens/ManualEntry';
import GoalSubmit from './screens/GoalSubmit';
import AnalyticsDisplay from './screens/AnalyticsDisplay';
import './App.css';

function App(){
  return(
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen/>}/>
        <Route path="/about" element={<About/>}/>
        <Route path="/usermanual" element={<UserManual/>}/>
        <Route path="/entry" element={<ChooseEntry/>}/>
        <Route path="/fileupload" element={<FileUpload/>}/>
        <Route path="/filecontents" element={<FileContentsDisplay/>}/>
        <Route path="/manualentry" element={<ManualEntry/>}/>
        <Route path="/goalsubmit" element={<GoalSubmit/>}/>
        <Route path="/analytics" element={<AnalyticsDisplay/>}/>
      </Routes>
    </Router>
  );
}

export default App;
