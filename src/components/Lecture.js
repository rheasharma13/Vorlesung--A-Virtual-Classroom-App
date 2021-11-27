import { Button, Menu, MenuItem, IconButton } from "@material-ui/core";
import { MoreVert } from "@material-ui/icons";
import React from "react";
import "./Announcement.css";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router-dom";

//to display a Lecture
function Lecture({
  creatorId,
  title,
  date,
  time,
  note,
  meetingLink,
  classId,
  name,
  image,
  index,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [user, loading, error] = useAuthState(auth);
  const open = Boolean(anchorEl);
  const [classRef, setClassRef] = React.useState({});
  const [classData, setClassData] = React.useState({});
  const history = useHistory();

  //collect class data
  React.useEffect(() => {
    
    db.collection("classes")
      .doc(classId)
      .get()
      .then((classref) => {
      
        setClassRef(classref);
        return classref.data();
      })
      .then((classdata) => {
        console.log(classdata);
        setClassData(classdata);
      });
  }, []);
  

  return (
    <div className="announcement">
      <div className="announcement__informationContainer">
        <div className="announcement__infoSection">
          <div className="announcement__imageContainer">
            <img src={image} alt="Profile photo" />
          </div>
          <div className="announcement__nameAndDate">
            <div className="announcement__name">{name}</div>
          </div>
        </div>
        <div className="announcement__infoSection">
          <div>
            
          </div>
        </div>
      </div>
      <div className="announcement__content">Title: {title}</div>
      <div className="announcement__content">Date: {date}</div>
      <div className="announcement__content">Time: {time}</div>

      {meetingLink !== "" ? (
        <div className="announcement__content">
          Meeting link:{" "}
          <a
            href={"//" + meetingLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {meetingLink}
          </a>
        </div>
      ) : (
        ""
      )}
      {note !== "" ? <div className="announcement__content">{note}</div> : ""}
    </div>
  );
}

export default Lecture;
