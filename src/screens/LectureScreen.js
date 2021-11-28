import { IconButton, Button } from "@material-ui/core";

import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory, useParams } from "react-router-dom";
import Lecture from "../components/Lecture";
import emailjs from "emailjs-com";
import async from "async";
import { auth, db } from "../firebase";
import "./Class.css";

//to display the list of lectures
function LectureScreen() {
  var today = new Date();
  const [classData, setClassData] = useState({});
  const [lectureData, setLectureData] = useState([]);
  const [lectureDate, setLectureDate] = useState(
    today.getDate() + " " + (today.getMonth() + 1) + " " + today.getFullYear()
  );
  const [lectureTime, setLectureTime] = useState(
    ""
  );
  const [lectureNote, setLectureNote] = useState("");
  const [lectureLink, setLectureLink] = useState("");
  const [lectureTitle, setLectureTitle] = useState("");
  const [lectures, setLectures] = useState([]);
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

    let reversedArray = myClassData?.lectures?.reverse();
    setLectureData(reversedArray);
  }, [lectureData]);

  const createLecture = async () => {
    try {
      const myClassRef = await db.collection("classes").doc(id).get();
      const myClassData = await myClassRef.data();

      let tempLectures = myClassData.lectures;
      tempLectures.push({
        title: lectureTitle,
        date: lectureDate,
        time: lectureTime,

        note: lectureNote,
        meetingLink: lectureLink,
      });
      myClassRef.ref.update({
        lectures: tempLectures,
      });
      async.each(
        classData?.enrolledStudents,
        function (email) {
          async.waterfall([
            function () {
              const templateParams = {
                item: "Lecture",
                className: classData.name,
                url: "localhost:3000/class/" + id,
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
            alert("All emails have been sent successfully");
          }
        }
      );
      setLectureTitle("");
      setLectureLink("");
      setLectureNote("");
      setLectureDate("");
      setLectureTime("");
    } catch (error) {
      console.error(error);
      alert(`There was an error creating the lecture, please try again!`);
    }
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
        <p>Created By: {classData?.creatorName}</p>
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
         
          <h3 ><b>Create a Lecture</b></h3>
          <input
            type="text"
            value={lectureTitle}
            required
            onChange={(e) => setLectureTitle(e.target.value)}
            placeholder="Enter the Lecture Title"
          />

          {/* <MuiPickersUtilsProvider utils={MomentUtils}> */}
          <label>
            <p>Lecture Date:</p>{" "}
          </label>
          <input
            placeholder="Enter the lecture date (DD/MM/YYYY)"
            type="date"
            value={lectureDate}
            required
            onChange={(e) => setLectureDate(e.target.value)}
          />
          
          <label>
            <p>Lecture Time:</p>
          </label>
          <input
            type="text"
            value={lectureTime}
            required
            onChange={(e) => setLectureTime(e.target.value)}
            placeholder="Enter the lecture time (hh:mm)"
          />
          
          
          <input
            type="text"
            value={lectureNote}
            onChange={(e) => setLectureNote(e.target.value)}
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

          <input
            type="text"
            value={lectureLink}
            onChange={(e) => setLectureLink(e.target.value)}
            placeholder="Enter the Meeting Link for this lecture (optional)"
          />

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
            onClick={createLecture}
          >
            Submit
          </Button>
        </div>
      ) : (
        ""
      )}
      {user?.uid !== classData?.creatorUid && lectureData?.length === 0 ? (
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
          <h3>No lectures added yet!</h3>
        </div>
      ) : (
        ""
      )}

      {lectureData?.map((lecture) => (
        <Lecture
          creatorId={classData.creatorUid}
          title={lecture.title}
          date={lecture.date}
          time={lecture.time}
          note={lecture.note}
          meetingLink={lecture.meetingLink}
          classId={id}
          name={classData.creatorName}
          image={classData.creatorPhoto}
          // isReported={post.isReported}
        />
      ))}
    </div>
  );
}

export default LectureScreen;
