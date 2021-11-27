import { Button } from "@material-ui/core";
import React from "react";
import { useHistory } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import "./ClassCard.css";
import { db, auth } from "../firebase";

//to display a class card on the dashboard
function ClassCard({ name, creatorName, creatorPhoto, id, style, creatorId }) {
  const history = useHistory();
  const goToClass = () => {
    history.push(`/class/${id}`);
  };
  const [user, loading, error] = useAuthState(auth);

  //function that unenrolls the user from the class
  const unEnrollFromClass = async () => {
    if (user) {
      try {
        // check if class exists

        const classRef = await db.collection("classes").doc(id).get();
        if (!classRef.exists) {
          return alert(`Class doesn't exist, please provide correct ID`);
        }
        const classData = await classRef.data();
        // add class to user
        const userRef = await db
          .collection("users")
          .where("uid", "==", user.uid);
        const userData = await (await userRef.get()).docs[0].data();
        let tempStudents = classData?.enrolledStudents;
        let tempClassrooms = userData?.enrolledClassrooms;
        let createdClasses = userData?.createdClassrooms;
        var deletedClasses = createdClasses.filter(function (classroom) {
          return classroom.id !== id;
        });
        var deletedClassArray = tempClassrooms.filter(function (classroom) {
          return classroom.id !== id;
        });
        var updatedStudents = tempStudents.filter(function (student) {
          return student.studentId !== user.uid;
        });
        //remove the class from the student's enrolled classrooms and created classrooms array
        await (
          await userRef.get()
        ).docs[0].ref.update({
          enrolledClassrooms: deletedClassArray,
          createdClassrooms: deletedClasses,
        });

        //remove the student from the list of students enrolled in the class
        await classRef.ref.update({
          enrolledStudents: updatedStudents,
        });
        alert("Unenrolled successfully");
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    } else {
      history.push("/");
    }
  };

  return (
    <div>
      <div className="classCard" style={style}>
        <div className="classCard__upper" onClick={goToClass}>
          <div className="classCard__className">{name}</div>
          <div className="classCard__creatorName">{creatorName}</div>

          <img src={creatorPhoto} className="classCard__creatorPhoto" />
        </div>
        <div className="classCard__middle">
          {user.uid === creatorId ? (
            <div style={{ padding: "5px" }}>
              Class ID: <div>{id}</div>{" "}
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="classCard__lower">
          {creatorId === user.uid ? (
            <Button
              onClick={(e) => {
                e.preventDefault();
                history.push("/class/" + id + "/reported-posts");
              }}
            >
              {" "}
              <p>Reported Posts</p>
            </Button>
          ) : (
            ""
          )}
          <Button onClick={unEnrollFromClass}>
            <p> Unenroll</p>{" "}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ClassCard;
