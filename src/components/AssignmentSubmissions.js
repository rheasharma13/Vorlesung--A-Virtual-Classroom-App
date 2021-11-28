import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory, useParams } from "react-router-dom";
import {Button} from "@material-ui/core"
import "./Announcement.css";
import "../screens/Class.css";
import { auth, db } from "../firebase";
import { catchClause } from "@babel/types";

//to display the assignment submissions by the students.
function AssignmentSubmissions() {
  const [classData, setClassData] = useState({});
  const [assignmentData, setAssignmentData] = useState({});
  const [user, loading, error] = useAuthState(auth);
  const { id, assignmentNumber } = useParams();
  const history = useHistory();
  const [marks,setMarks]=useState("");
  const [classRef,setClassRef]=useState({});
  
  /*
    PLAN: Create a snapshot listener and fill in the data into classData, 
    and then map through it during render
  */
  //collect assignment data
  useEffect(async () => {
    const myClassRef = await db.collection("classes").doc(id).get();
    const myClassData = await myClassRef.data();
    setClassRef(myClassRef)
    let reversedArray = myClassData?.assignments[assignmentNumber];
    setAssignmentData(reversedArray);
  }, [assignmentData]);

  //collect class data
  useEffect(() => {
    db.collection("classes")
      .doc(id)
      .onSnapshot((snapshot) => {
        const data = snapshot.data();
        if (!data) history.replace("/");

        setClassData(data);
        
      });
  }, []);

  //collect user data
  useEffect(() => {
    if (loading) return;
    if (!user) history.replace("/");
  }, [loading, user]);

  //function to display uploaded files
  const displayUploadedFiles = (files) =>
    files?.map((file, index) => {
      return (
        <div className="assignment-file" key={index}>
          <div
            style={{
              display: "flex",

              padding: "15px 20px",

              "justify-content": "space-between",
            }}
          >
            <p className="assignment-file-name">{file.fileName}</p>

            <a
              href={file.downloadURL}
              target="_blank"
              rel="noopener noreferrer"
            >
              View File
            </a>
          </div>
        </div>
      );
    });

    const submitMarks= async(index) =>{
      
      try{
        let tempAssignments = classData?.assignments;
        console.log(tempAssignments,assignmentNumber,index)
        tempAssignments[assignmentNumber].submissions[index].marks=marks;
        classRef.ref.update({
          assignments: tempAssignments,
        });
        console.log(tempAssignments);
        setMarks("");
        alert('Marks submitted successfully!')
      }
      catch(error)
      {
        console.log(error)
      }
      
    }
  return (
    <div className="class" style={{ "margin-top": "80px" }}>
      <div className="announcement">
        <div
          className="announcement__informationContainer"
          style={{
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            "text-align": "center",
            marginTop: "10px",
            marginBottom: "10px",
            width: "60%",
          }}
        >
          <h3>Assignment Details</h3>
        </div>
        <div className="announcement__content">
          <b>Title:</b> {assignmentData?.title}
        </div>
        <div className="announcement__content">
          <b>Submission Date:</b> {assignmentData?.submissionDate}
        </div>
        {assignmentData?.note !== "" ? (
          <div className="announcement__content">
            <b>Note: {assignmentData?.note}</b>
          </div>
        ) : (
          ""
        )}
        <div className="announcement__content">
          <b>Files attached:</b>
        </div>
        {/* {assignmentData?.files?.length} */}
        {displayUploadedFiles(assignmentData?.files)}
      </div>
      <div></div>
      {assignmentData?.submissions?.map((submission,index) => {
        return (
          <div className="announcement">
            <div className="announcement__informationContainer">
              <div className="announcement__infoSection">
                <div className="announcement__imageContainer">
                  <img src={submission?.studentImage} alt="Profile photo" />
                </div>
                <div className="announcement__nameAndDate">
                  <div className="announcement__name">
                    {submission?.studentName}
                  </div>
                </div>
              </div>
            </div>
            <div className="announcement__content">
              <h4><b>Files submitted:</b></h4>
             
            </div>

            {displayUploadedFiles(submission?.files)}
            <div style={{marginTop:"8px"}}>
            <p><b>Enter marks for this assignment: </b></p>
            </div>
           
            <div className="announcement_input">
             
            <input type="text" value={marks} onChange={(e)=> setMarks(e.target.value)} placeholder="Enter marks for this assignment(out of 100)"></input>
            </div>
            <Button
            variant="contained"
            size="medium"
            style={{
              "margin-left": "auto",
              display: "block",
              "background-color": "green",
              color: "white",
              fontSize: "15px",
            }}
            index={index}
            onClick={(e)=>{ e.preventDefault(); submitMarks(index)}}
          >
            Submit
          </Button>
            
          </div>
          
        );
      })}
    </div>
  );
}

export default AssignmentSubmissions;
