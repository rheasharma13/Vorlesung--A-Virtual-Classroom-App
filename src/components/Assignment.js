import { Button, LinearProgress } from "@material-ui/core";
import React, { useState } from "react";
import "./Announcement.css";
import { auth, db, storage } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router-dom";

//to display an assignment
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
  const [user, loading, error] = useAuthState(auth);
  const [keyString, setKeyString] = useState("keystring");
  const history = useHistory();
  const [classData, setClassData] = useState({});
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedFiles, setSubmittedFiles] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [marks, setMarksObtained] = useState("-1");
  //collect submissions
  React.useEffect(async () => {
    const myClassRef = await db.collection("classes").doc(classId).get();
    const myClassData = await myClassRef.data();
    setSubmissions(myClassData?.assignments[index]?.submissions);
    submissions?.map((submission) => {
      if (submission?.studentId === user.uid) {
        setIsSubmitted(true);
        setMarksObtained(submission?.marks);
        setSubmittedFiles(submission?.files);
      }
    });
  }, [submissions]);

  //collect class data
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

  //Display Uploaded Files
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

  //function to submit assignment
  const submitAssignment = async (e) => {
    e.preventDefault();
    try {
      if (isUploading == false) {
        const myClassRef = await db.collection("classes").doc(classId).get();
        const myClassData = await myClassRef.data();

        let tempAssignments = myClassData?.assignments;
        tempAssignments[index]?.submissions?.push({
          studentId: user.uid,
          studentName: user.displayName,
          studentImage: user.photoURL,
          files: uploadedFiles,
          marks: -1,
        });

        await myClassRef.ref.update({
          assignments: tempAssignments,
        });
        setSubmissions(myClassData?.assignments[index]?.submissions);

        setIsSubmitted(true);
        setFile(null);
        setUploadedFiles([]);
        setKeyString("");
        alert("Assignment submitted successfully!");
      }
    } catch (error) {
      console.error(error);
      alert(`There was an error creating the assignment, please try again!`);
    }
  };

  const uploadFile = (e) => {
    e.preventDefault();

    let uploadedfiles = uploadedFiles;
    let path;
    setIsUploading(true);
    //uploading the file to Firebase Storage
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
          <Button
            size="small"
            style={{ "background-color": "#99e699", width: "100%" }}
            onClick={(e) => {
              e.preventDefault();
              history.push(
                "/class/" + classId + "/assignments/" + index + "/submissions"
              );
            }}
          >
            <p>See Student Submissions</p>
          </Button>
        ) : (
          ""
        )}

        {user.uid !== creatorId && isSubmitted == false ? (
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
                onClick={(e) => {
                  uploadFile(e);
                }}
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
        {user.uid !== creatorId && isSubmitted ? (
          <div>
            {" "}
            <b>Assignment has been submitted. Submitted Files:</b>{" "}
            {displayUploadedFiles(submittedFiles)}
            {marks != "-1" ? <div>Marks Obtained: {marks}</div> : ""}
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

export default Assignment;
