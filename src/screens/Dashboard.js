import React, { useEffect } from "react";
import "./Dashboard.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import ClassCard from "../components/ClassCard";

function Dashboard() {
  const [user, loading, error] = useAuthState(auth);
  const [classes, setClasses] = React.useState([]);
  const history = useHistory();

  const fetchClasses = async () => {
    try {
      await db
        .collection("users")
        .where("uid", "==", user.uid)
        .onSnapshot((snapshot) => {
          setClasses(snapshot?.docs[0]?.data()?.enrolledClassrooms);
        });
        // console.log(classes)
      // 👇🏻 below code doesn't update realtime, so updated to snapshot listener
      // const userData = querySnapshot.docs[0].data();
      // setClasses(userData.enrolledClassrooms);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) history.replace("/");
  }, [user, loading]);

  useEffect(() => {
    if (loading) return;
    fetchClasses();
  }, [user, loading]);

  return (
    <div className="dashboard " style={{marginTop:"50px"}}>
      {
      classes?.length === 0 ? (
        <div className="dashboard__404">
          No classes found! Join or create one!
        </div>
      ) : (
        <div className="dashboard__classContainer">
          {console.log("Classes",classes)}
          {classes?.map((individualClass) => (
            <ClassCard
              creatorName={individualClass.creatorName}
              creatorPhoto={individualClass.creatorPhoto}
              name={individualClass.name}
              id={individualClass.id}
              style={{ marginRight: 30, marginBottom: 30 }}
              creatorId={individualClass.creatorUid}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
