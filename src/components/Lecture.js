import { Button,Menu, MenuItem,IconButton } from "@material-ui/core";
import {  MoreVert } from "@material-ui/icons";

import React from "react";
import "./Announcement.css";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {useHistory} from "react-router-dom"


function Lecture({ creatorId,title,date,time,note,meetingLink,classId,name,image,index}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [user, loading, error] = useAuthState(auth);
  const open = Boolean(anchorEl);
  const [classRef,setClassRef]=React.useState({});
  const[classData,setClassData]=React.useState({});
  const history=useHistory();
  
  React.useEffect(() => {
    // const myClassRef = await db.collection("classes").doc(id).get();
    // const myClassData = await myClassRef.data();
    db.collection("classes").doc(classId).get().then(classref=>{
      // console.log(classref.data());
      setClassRef(classref);
      return classref.data();
    }).then(classdata=>{
      console.log(classdata);
      setClassData(classdata)
    })
    
    


  }, [])
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
 
  
  // const deleteLecture = async () => {
  //   try {
  //     const myClassRef = await db.collection("classes").doc(classId).get();
  //     const myClassData = await myClassRef.data();
     
  //     let tempPosts = myClassData.posts;
      
  //     var postsAfterDeletion= tempPosts.filter(function(post){
       
  //       return post.date!=date && post.authorId===authorId 
  //     });
     
  //     // tempPosts.push({
  //     //   authorId: user.uid,
  //     //   content: announcementContent,
  //     //   date: moment().format("MMM Do YY"),
  //     //   image: user.photoURL,
  //     //   name: user.displayName,
  //     // });
  //     myClassRef.ref.update({
  //       posts: postsAfterDeletion,
  //     });
      
  //   } catch (error) {
  //     console.error(error);
  //     alert(`There was an error deleting the announcement, please try again!`);
  //   }
  //   handleClose();
  // };

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
          
          <div>
          <IconButton onClick={handleClick}
          aria-controls="basic-menu"
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}>
            <MoreVert />
          </IconButton>
      
       
      {/* <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={deleteAnnouncement}>Delete</MenuItem>
        <MenuItem onClick={handleClose}>Edit</MenuItem>
        <MenuItem onClick={reportPost}>{isReported==false?"Report to Admin":"Reported"}</MenuItem>
      </Menu> */}
    </div>
        </div>
      </div>
      <div className="announcement__content">Title: {title}</div>
      <div className="announcement__content">Date: {date}</div>
      <div className="announcement__content">Time: {time}</div>
      
      {meetingLink!==""?<div className="announcement__content">Meeting link: <a href={"//"+meetingLink} target="_blank" rel="noopener noreferrer">{meetingLink}</a></div>:""}
      {note!==""?<div className="announcement__content">{note}</div>:""}

    </div>
  );
}

export default Lecture;
