import { IconButton, Button } from "@material-ui/core";
import { SendOutlined } from "@material-ui/icons";
import moment from "moment";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory, useParams } from "react-router-dom";
import Assignment from "../components/Assignment";

import { auth, db, storage } from "../firebase";

import "./Class.css";

function AssignmentScreen() {
  const [classData, setClassData] = useState({});
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentNote, setAssignmentNote] = useState("");
  const [assignmentSubmissionDate, setAssignmentSubmissionDate] =
    useState("2001-11-02");
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [percentage, setPercentage] = useState(0);

  const [assignmentData, setAssignmentData] = useState([]);
  const [user, loading, error] = useAuthState(auth);
  const { id } = useParams();
  const history = useHistory();

  /*
    PLAN: Create a snapshot listener and fill in the data into classData, 
    and then map through it during render
  */

  useEffect(async () => {
    const myClassRef = await db.collection("classes").doc(id).get();
    const myClassData = await myClassRef.data();

    let reversedArray = myClassData?.assignments?.reverse();
    setAssignmentData(reversedArray);
    
  }, [assignmentData]);

  const createAssignment = async () => {
    try {
      if (isUploading == false) {
        const myClassRef = await db.collection("classes").doc(id).get();
        const myClassData = await myClassRef.data();

        let tempAssignments = myClassData.assignments;
        tempAssignments.push({
          title: assignmentTitle,
          note: assignmentNote,
          assignmentNumber: assignmentData.length + 1,
          submissionDate: assignmentSubmissionDate,
          files: uploadedFiles,
          submissions: [],
        });
        myClassRef.ref.update({
          assignments: tempAssignments,
        });
        setAssignmentTitle("");
        setAssignmentData(tempAssignments)
        setAssignmentNote("");
        setAssignmentSubmissionDate("");
        setFile(null);
        setUploadedFiles([]);
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
    const assignmentNumber = assignmentData.length + 1;
    let uploadedfiles = uploadedFiles;
    let path;
    setIsUploading(true);
    // this.setState({ isUploading: true });
    // console.log("File",file.name)
    storage
      .ref("assignment_files/" + id + "_" + assignmentNumber + "/" + file.name)
      .put(file)
      .on(
        "state_changed",
        (fileSnapshot) => {
          // console.log("Snapshot",fileSnapshot.ref.fullPath)
          let percent =
            (fileSnapshot.bytesTransferred / fileSnapshot.totalBytes) * 100;
          // console.log("Percent",percent)
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
            });
        }
      );
  };
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

  return (
    <div className="class">
      <div className="class__nameBox">
        <div className="class__name">{classData?.name}</div>
        <p>Created By: {classData.creatorName}</p>
      </div>
      <div className="class__nav">
        <Button
          onClick={(e) => {
            e.preventDefault();
            history.push("/class/" + id);
          }}
        >
          Lectures
        </Button>
        <Button
          onClick={(e) => {
            e.preventDefault();
            history.push("/class/" + id + "/discussion");
          }}
        >
          Discussion
        </Button>

        <Button
          onClick={(e) => {
            e.preventDefault();
            history.push("/class/" + id + "/assignments");
          }}
        >
          Assignments
        </Button>
      </div>

      {user?.uid == classData.creatorUid ? (
        <div className="class__announce">
          <h2>Create an Assignment</h2>
          <input
            type="text"
            value={assignmentTitle}
            required
            onChange={(e) => setAssignmentTitle(e.target.value)}
            placeholder="Enter the Assignment Title"
          />

          {/* <MuiPickersUtilsProvider utils={MomentUtils}> */}
          <label>Submission Date: </label>
          <input
            placeholder="Enter the lecture date (DD/MM/YYYY)"
            type="date"
            value={assignmentSubmissionDate}
            required
            onChange={(e) => setAssignmentSubmissionDate(e.target.value)}
          />

          {/* </MuiPickersUtilsProvider> */}
          <input
            type="text"
            value={assignmentNote}
            onChange={(e) => setAssignmentNote(e.target.value)}
            placeholder="Add a note (optional)"
          />

          {/* <DatePicker
        value={lectureDate}
        onChange={(e)=> setLectureDate(e.target.value)}
        format="DD/MM/YYYY"
        autoOk
        disablePast
        
        ampm={false}
      /> */}

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
              onClick={(e) => uploadFile(e)}
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
            onClick={createAssignment}
          >
            Submit
          </Button>
        </div>
      ) : (
        ""
      )}
      {user?.uid!==classData?.creatorUid && assignmentData?.length===0 ? <div style={{
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            "text-align": "center",
            marginTop: "10px",
            marginBottom: "10px",
            width: "60%",
          }}
        > <h3>No assignments added yet!</h3></div>:""}
      {assignmentData?.map((assignment,index) => (
        <Assignment
          creatorId={classData.creatorUid}
          title={assignment.title}
          date={assignment.submissionDate}
          note={assignment.note}
          files={assignment.files}
          submissions={assignment.submissions}
          classId={id}
          name={classData.creatorName}
          image={classData.creatorPhoto}
          index={index}
          // isReported={post.isReported}
        />
      ))}
    </div>
  );
}

export default AssignmentScreen;
