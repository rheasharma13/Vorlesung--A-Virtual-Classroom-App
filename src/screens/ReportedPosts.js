import moment from "moment";
import { useEffect } from "react";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory, useParams } from "react-router-dom";
import Announcement from "../components/Announcement";
import { auth, db } from "../firebase";
import "./Class.css";

//to display the reported posts
function ReportedPosts() {
  const [classData, setClassData] = useState({});
  const [announcementContent, setAnnouncementContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [user, loading, error] = useAuthState(auth);
  const { id } = useParams();
  const history = useHistory();

  /*
    PLAN: Create a snapshot listener and fill in the data into classData, 
    and then map through it during render
  */

  useEffect(() => {
    // reverse the array
    let reversedArray = classData?.reportedPosts?.reverse();
    setPosts(reversedArray);
  }, [classData]);

  useEffect(() => {
    db.collection("classes")
      .doc(id)
      .onSnapshot((snapshot) => {
        const data = snapshot.data();
        if (!data) history.replace("/");
        console.log(data);
        setClassData(data);
      });
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) history.replace("/");
  }, [loading, user]);

  return (
    <div className="class">
      <div
        style={{
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
          "text-align": "center",
          marginTop: "20px",
          marginBottom: "20px",
          width: "60%",
        }}
      >
        <h3> Reported Posts</h3>
      </div>
      <div className="class__nameBox">
        <div className="class__name">{classData?.name}</div>
        <p>Created By: {classData?.creatorName}</p>
      </div>
      <div></div>

      {posts?.map((post, idx) => (
        <Announcement
          authorId={post.authorId}
          content={post.content}
          date={post.date}
          image={post.image}
          name={post.name}
          classId={id}
          index={posts?.length - idx - 1}
          // isReported={post.isReported}
        />
      ))}
    </div>
  );
}

export default ReportedPosts;
