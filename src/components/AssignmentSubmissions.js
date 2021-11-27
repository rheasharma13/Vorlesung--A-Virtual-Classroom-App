import { IconButton, Button } from "@material-ui/core";
import { SendOutlined } from "@material-ui/icons";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory, useParams } from "react-router-dom";

import "./Announcement.css";
import "../screens/Class.css";
import { auth, db, storage } from "../firebase";
import { returnStatement } from "@babel/types";

function AssignmentSubmissions() {
  const [classData, setClassData] = useState({});

  const [assignmentData, setAssignmentData] = useState({});
  const [user, loading, error] = useAuthState(auth);
  const { id, assignmentNumber } = useParams();
  const history = useHistory();

  /*
    PLAN: Create a snapshot listener and fill in the data into classData, 
    and then map through it during render
  */

  useEffect(async () => {
    const myClassRef = await db.collection("classes").doc(id).get();
    const myClassData = await myClassRef.data();

    let reversedArray = myClassData?.assignments[assignmentNumber];
    setAssignmentData(reversedArray);
  }, [assignmentData]);

  useEffect(() => {
    db.collection("classes")
      .doc(id)
      .onSnapshot((snapshot) => {
        const data = snapshot.data();
        if (!data) history.replace("/");

        setClassData(data);
      });
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) history.replace("/");
  }, [loading, user]);

  const displayUploadedFiles = (files) => {
    return files?.map((file, index) => {
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
              Download File
            </a>
          </div>
        </div>
      );
    });
  };

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
      <div>
        
      </div>
      {assignmentData?.submissions?.map(submission=>{
          return(<div className="announcement">
           
           <div className="announcement__informationContainer">
             <div className="announcement__infoSection">
               <div className="announcement__imageContainer">
                 <img src={submission?.studentImage} alt="Profile photo" />
               </div>
               <div className="announcement__nameAndDate">
                 <div className="announcement__name">{submission?.studentName}</div>
               </div>
              
             </div>
             
             </div>
             <div className="announcement__content">
             <h3>Files:</h3>
             </div>
             {displayUploadedFiles(submission?.files)}
             </div>)

        })}
    </div>
   

  );
}

export default AssignmentSubmissions;
