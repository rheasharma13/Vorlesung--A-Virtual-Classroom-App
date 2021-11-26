import { Button, Menu, MenuItem, IconButton } from "@material-ui/core";
import { MoreVert } from "@material-ui/icons";

import React, { useState } from "react";
import "./Announcement.css";
import { auth, db, storage } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router-dom";
import AssignmentSubmissions from "./AssignmentSubmissions";

function Assignment({
  creatorId,
  title,
  date,
  note,
  files,
  classId,
  name,
  image,
  index,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [user, loading, error] = useAuthState(auth);
  const open = Boolean(anchorEl);
  
  const history = useHistory();
  const [classData,setClassData]=useState({})
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedFiles,setSubmittedFiles]=useState([]);
  const [submissions,setSubmissions]=useState([]);
  React.useEffect(async () => {
    const myClassRef = await db.collection("classes").doc(classId).get();
    const myClassData = await myClassRef.data();
    setSubmissions(myClassData?.assignments[index]?.submissions)
    submissions?.map(submission=>{
      if(submission?.studentId===user.uid) {
        setIsSubmitted(true)
        setSubmittedFiles(submission?.files)
      }
    })
    // console.log("submissions",submissions)
  }, [submissions]);
  React.useEffect(() => {
    db.collection("classes")
      .doc(classId)
      .onSnapshot((snapshot) => {
        const data = snapshot.data();
        if (!data) history.replace("/");

        setClassData(data);
      });
  }, []);

  React.useEffect(() => {
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

  
  

  const submitAssignment = async (e) => {
    e.preventDefault();
    try {
      if (isUploading == false) {

        const myClassRef = await db.collection("classes").doc(classId).get();
        const myClassData = await myClassRef.data();
        var student = user;
        let tempAssignments = myClassData?.assignments;
        tempAssignments[index]?.submissions?.push({
          studentId:user.uid,
          studentName:user.displayName,
          studentImage:user.photoURL,
          files: uploadedFiles,
          marks: -1
        });
        
        myClassRef.ref.update({
          assignments: tempAssignments,
        });
        // setSubmissions(myClassData?.assignments[index]?.submissions)
        // console.log("Submissions",submissions)

        setFile(null);
        setUploadedFiles([]);
        alert('Assignment submitted successfully!')
      }
    } catch (error) {
      console.error(error);
      alert(`There was an error creating the assignment, please try again!`);
    }
  };

  const uploadFile = (e) => {
    e.preventDefault();
    // const { file } = this.state;
    // const { subjectName, subjectCode } = this.props;
    console.log("FIle",file)
    let uploadedfiles = uploadedFiles;
    let path;
    setIsUploading(true);
    // this.setState({ isUploading: true });
    // console.log("File",file.name)
    storage
      .ref(
        "assignment_files/" +
          classId +
          "_" +
          "submissions" +
          user.uid +
          "/" +
          file.name
      )
      .put(file)
      .on(
        "state_changed",
        (fileSnapshot) => {
          // console.log("Snapshot",fileSnapshot.ref.fullPath)
          let percent =
            (fileSnapshot.bytesTransferred / fileSnapshot.totalBytes) * 100;
          console.log("Percent",percent)
          path = fileSnapshot.ref.fullPath;
          setPercentage(percent);
          // this.setState({ percentage });
        },
        (error) => {
          console.log(error);
        },
        () => {
          setTimeout(() => {
            setPercentage(0);
            setFile(null);
            setIsUploading(false);
            setUploadedFiles([]);
          }, 1000);

          storage
            .ref()
            .child(path)
            .getDownloadURL()
            .then((url) => {
              uploadedfiles.push({
                filePath: path,
                fileName: file.name,
                downloadURL: url,
              });
              setUploadedFiles(uploadedfiles);
              console.log(uploadedFiles);
              alert("File uploaded successfully!")
            });
        }
      );
  };

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
          <div></div>
        </div>
      </div>
      <div className="announcement__content">
        <b>Title:</b> {title}
      </div>
      <div className="announcement__content">
        <b>Submission Date:</b> {date}
      </div>
      {note !== "" ? (
        <div className="announcement__content">
          <b>Note: {note}</b>
        </div>
      ) : (
        ""
      )}
      <div className="announcement__content">
        <b>Files attached:</b>
      </div>
   

      {displayUploadedFiles(files)}
      <div className="huge-button">
        {user.uid === creatorId ? (
          <Button style={{ "background-color": "#99e699", width: "100%" }} onClick={(e)=>{e.preventDefault(); history.push("/class/"+classId+"/assignments/"+index+"/submissions")}}>
            See Student Submissions
          </Button>
          
        ) : (
          ""
        )}
        
      
       

        {user.uid !== creatorId && isSubmitted==false ? (
         
            <div>
              <div style={{ width: "100%" }}>
                <b>Submit Assignment here:</b>
              </div>
              <div
                style={{
                  display: "flex",
                  "margin-left": "20px",
                  padding: "15px 20px",
                  "margin-right": "20px",
                  "justify-content": "space-between",
                }}
              >
                <input
                  type="file"
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                  }}
                />

                <button
                  variant="contained"
                  style={{ "margin-right": "auto", display: "flex" }}
                  onClick={(e) => { uploadFile(e)}}
                >
                  {" "}
                  Upload File{" "}
                </button>
              </div>
              <Button
                variant="contained"
                style={{
                  "margin-left": "auto",
                  display: "block",
                  "background-color": "green",
                  color: "white",
                }}
                onClick={submitAssignment}
              >
                Submit
              </Button>
            </div>
         
        ) : (
          ""
        )}
        {user.uid!==creatorId && isSubmitted?<div> <b>Assignment has been submitted. Submitted Files:</b> {displayUploadedFiles(submittedFiles)}</div>:""}
        

      </div>
    </div>
  );
}

export default Assignment;
