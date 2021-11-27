import React, { useEffect } from "react";
import "./Dashboard.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import ClassCard from "../components/ClassCard";

//to display the list of classes the user has created
function Dashboard() {
  const [user, loading, error] = useAuthState(auth);
  const [classes, setClasses] = useState([]);
  const history = useHistory();
  useEffect(() => {
    if (loading) return;
    if (!user) history.replace("/");
  }, [user, loading]);

  useEffect(() => {
    if (loading) return;
    fetchClasses();
  }, [user, loading]);

  //get all the classes the user has created
  const fetchClasses = async () => {
    try {
      await db
        .collection("users")
        .where("uid", "==", user.uid)
        .onSnapshot((snapshot) => {
          setClasses(snapshot?.docs[0]?.data()?.createdClassrooms);
        });

      // 👇🏻 below code doesn't update realtime, so updated to snapshot listener
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="dashboard" style={{ marginTop: "60px" }}>
      {classes?.length === 0 ? (
        <div className="dashboard__404">
          No classes found! Join or create one!
        </div>
      ) : (
        <div className="dashboard__classContainer">
          
          {classes?.map((individualClass) => (
            <ClassCard
              creatorName={individualClass.creatorName}
              creatorPhoto={individualClass.creatorPhoto}
              name={individualClass.name}
              id={individualClass.id}
              style={{ marginRight: 30, marginBottom: 30 }}
              creatorId={individualClass.creatorId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
