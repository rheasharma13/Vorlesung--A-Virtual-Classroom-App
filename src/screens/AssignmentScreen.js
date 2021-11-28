import { Button, LinearProgress } from "@material-ui/core";
import moment from "moment";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory, useParams } from "react-router-dom";
import Assignment from "../components/Assignment";
import async from "async";
import emailjs from "emailjs-com";
import { auth, db, storage } from "../firebase";
import "./Class.css";

//to display all the assignments
function AssignmentScreen() {
  const [classData, setClassData] = useState({});
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentNote, setAssignmentNote] = useState("");
  const [assignmentSubmissionDate, setAssignmentSubmissionDate] =
    useState("2021-11-24");
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [keyString, setKeyString] = useState("keyString");
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
        async.each(
          classData?.enrolledStudents,
          function (email) {
            async.waterfall([
              function () {
                const templateParams = {
                  item: "Assignment",
                  className: classData.name,
                  url: "localhost:3000/class/" + id + "/assignments",
                  recipient: email,
                };
                emailjs
                  .send(
                    "service_sndm6ld",
                    "template_bo7xt4c",
                    templateParams,
                    "user_3T2tYqOmDN3n8XpkX43g5"
                  )
                  .then(
                    function (response) {
                      console.log("SUCCESS!", response.status, response.text);
                    },
                    function (error) {
                      console.log("FAILED...", error);
                    }
                  );
              },
            ]);
          },
          function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log("All emails have been sent successfully");
            }
          }
        );
        alert("Assignment submitted successfully!");
        setAssignmentTitle("");
        setAssignmentData(tempAssignments);
        setAssignmentNote("");
        setAssignmentSubmissionDate("");
        setFile(null);
        setUploadedFiles([]);
        setKeyString("");
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

    storage
      .ref("assignment_files/" + id + "_" + assignmentNumber + "/" + file?.name)
      .put(file)
      .on(
        "state_changed",
        (fileSnapshot) => {
          let percent =
            (fileSnapshot.bytesTransferred / fileSnapshot.totalBytes) * 100;

          path = fileSnapshot.ref.fullPath;
          setPercentage(percent);
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
              alert("File uploaded successfully!");
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
    <div className="class" style={{ marginTop: "80px" }}>
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
          <p>Lectures</p>
        </Button>
        <Button
          onClick={(e) => {
            e.preventDefault();
            history.push("/class/" + id + "/discussion");
          }}
        >
          <p>Discussion</p>
        </Button>

        <Button
          onClick={(e) => {
            e.preventDefault();
            history.push("/class/" + id + "/assignments");
          }}
        >
          <p>Assignments</p>
        </Button>
      </div>

      {user?.uid == classData.creatorUid ? (
        <div className="class__announce">
          <h3><b>Create an Assignment</b></h3>
          <input
            type="text"
            value={assignmentTitle}
            required
            onChange={(e) => setAssignmentTitle(e.target.value)}
            placeholder="Enter the Assignment Title"
          />

          {/* <MuiPickersUtilsProvider utils={MomentUtils}> */}
          <label>
            <p>Submission Date:</p>{" "}
          </label>
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
              key={keyString}
              onChange={(e) => {
                e.preventDefault()
                setFile(e.target.files[0]);
               
              }}
            />

            <button
              variant="contained"
              disabled={isUploading}
              style={{ "margin-right": "auto", display: "flex" }}
              onClick={(e) => uploadFile(e)}
            >
              {" "}
              Upload File{" "}
            </button>
          </div>

          {isUploading ? (
            <LinearProgress
              style={{ width: "500px", marginLeft: "30px", padding: "4px" }}
              variant="determinate"
              value={percentage}
            />
          ) : (
            ""
          )}

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
            onClick={createAssignment}
          >
            Submit
          </Button>
        </div>
      ) : (
        ""
      )}
      {user?.uid !== classData?.creatorUid && assignmentData?.length === 0 ? (
        <div
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
          {" "}
          <h3>No assignments added yet!</h3>
        </div>
      ) : (
        ""
      )}
      {assignmentData?.map((assignment, index) => (
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
