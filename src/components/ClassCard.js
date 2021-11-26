import { IconButton , Button} from "@material-ui/core";
import { AssignmentIndOutlined, FolderOpenOutlined } from "@material-ui/icons";
import React from "react";
import { useHistory } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import "./ClassCard.css";
import {db,auth} from "../firebase"
function ClassCard({ name, creatorName, creatorPhoto, id, style,creatorId }) {
  const history = useHistory();

  const goToClass = () => {
    history.push(`/class/${id}`);
  };
  const [user, loading, error] = useAuthState(auth);
  const unEnrollFromClass = async () => {
    if(user)
    {
      try {
        // check if class exists
        console.log(id)
        const classRef = await db.collection("classes").doc(id).get();
        if (!classRef.exists) {
          return alert(`Class doesn't exist, please provide correct ID`);
        }
        const classData = await classRef.data();
        // add class to user
        const userRef = await db.collection("users").where("uid", "==", user.uid);
        const userData = await (await userRef.get()).docs[0].data();
        let tempClassrooms = userData.enrolledClassrooms;
        var deletedClassArray = tempClassrooms.filter(function(classroom) { return classroom.id !== id })
        console.log("Deleted",deletedClassArray)
        await (
          await userRef.get()
        ).docs[0].ref.update({
          enrolledClassrooms: deletedClassArray,
        });
        // alert done
        
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    }
    else
    {
      history.push('/');
    }
    
    
  };

  return (
    <div>
    <div className="classCard" style={style} >
      <div className="classCard__upper" onClick={goToClass}>
        <div className="classCard__className">{name}</div>
        <div className="classCard__creatorName">{creatorName}</div>
        <img src={creatorPhoto} className="classCard__creatorPhoto" />
      </div>
      <div className="classCard__middle"></div>
      <div className="classCard__lower">
      <Button onClick={(e)=>{e.preventDefault() ; history.push("/class/"+id+"/reported-posts")}}> Reported Posts</Button>
        <Button onClick={unEnrollFromClass}> Unenroll </Button>
        {console.log(creatorId)}
      </div>
    </div>
     
     </div>
  );
}

export default ClassCard;
