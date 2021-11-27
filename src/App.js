import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Home from "./screens/Home";
import Dashboard from "./screens/Dashboard";
import Navigation from "./components/Navigation";
import Class from "./screens/Class";
import CreateClass from "./components/CreateClass";
import LectureScreen from "./screens/LectureScreen";
import AssignmentScreen from "./screens/AssignmentScreen";
import AssignmentSubmissions from "./components/AssignmentSubmissions";
import CreatedClasses from "./screens/CreatedClasses"
import ReportedPosts from "./screens/ReportedPosts"
import SmoothScroll from "smooth-scroll";
import "./style.css"
import "./bootstrap.css"


export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});
function App() {
  return (
    <div className="app">
      <Router>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/dashboard">
            <Navigation />
            <Dashboard />
          </Route>
          <Route exact path="/created-classes">
            <Navigation />
            <CreatedClasses />
          </Route>
          <Route exact path="/class/:id">
            <Navigation />
            <LectureScreen />
          </Route>
          <Route exact path="/class/:id/reported-posts">
            <Navigation />
            <ReportedPosts />
          </Route>
          <Route exact path="/class/:id/discussion">
            <Navigation />
            <Class />
          </Route>
          <Route exact path="/class/:id/assignments">
            <Navigation />
            <AssignmentScreen />
          </Route>
          <Route exact path="/class/:id/assignments/:assignmentNumber/submissions">
            <Navigation />
            <AssignmentSubmissions />
          </Route>
          {/* <Route exact path="/createclass">
            <Navigation />
            <CreateClass/>
          </Route> */}
        </Switch>
      </Router>
    </div>
  );
}

export default App;
