import { Menu, MenuItem, IconButton } from "@material-ui/core";
import { MoreVert } from "@material-ui/icons";
import React from "react";
import "./Announcement.css";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router-dom";

// to display a post/announcement
function Announcement({
  image,
  name,
  date,
  content,
  authorId,
  classId,
  index,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [user, loading, error] = useAuthState(auth);
  const open = Boolean(anchorEl);
  const [classRef, setClassRef] = React.useState({});
  const [classData, setClassData] = React.useState({});
  const history = useHistory();
  const [isReported, setReported] = React.useState(false);


  React.useEffect(() => {
    //collecting class Data
    db.collection("classes")
      .doc(classId)
      .get()
      .then((classref) => {
       
        setClassRef(classref);
        return classref.data();
      })
      .then((classdata) => {
      
        setClassData(classdata);
        setReported(classdata[classId]?.posts[index]?.isReported);
      });
      return setReported(false);
  }, []);


  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
//function to report a post to the admin
  const reportPost = async () => {
    if (user) {
      try {
        setReported(true);
        let reportedPosts = classData.reportedPosts;
        let allPosts = classData.posts;
        for (var post in allPosts) {
          if (post.authorId == authorId && post.date == date) {
           
            post.isReported = true;
          }
        }
      
        reportedPosts.push({
          authorId: user.uid,
          content: content,
          date: date,
          image: image,
          name: name,
        });
        classRef.ref.update({
          reportedPosts: reportedPosts,
          posts: allPosts,
        });
      } catch (error) {
        console.error(error);
        alert(`There was an error reporting the post, please try again!`);
      }
    } else {
      history.push("/");
    }
    handleClose();
  };

//function to delete a post
  const deletePost = async () => {
    try {
      const myClassRef = await db.collection("classes").doc(classId).get();
      const myClassData = await myClassRef.data();

      let tempPosts = myClassData.posts;

      var postsAfterDeletion = tempPosts.filter(function (post) {
        return post.date != date && post.authorId === authorId;
      });

      // tempPosts.push({
      //   authorId: user.uid,
      //   content: announcementContent,
      //   date: moment().format("MMM Do YY"),
      //   image: user.photoURL,
      //   name: user.displayName,
      // });
      myClassRef.ref.update({
        posts: postsAfterDeletion,
      });
    } catch (error) {
      console.error(error);
      alert(`There was an error deleting the announcement, please try again!`);
    }
    handleClose();
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
            <div className="announcement__date">{date}</div>
          </div>
        </div>
        <div className="announcement__infoSection">
          <div>
            <IconButton
              onClick={handleClick}
              aria-controls="basic-menu"
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <MoreVert />
            </IconButton>

            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              <MenuItem onClick={deletePost}>Delete</MenuItem>

              <MenuItem onClick={reportPost}>
                {isReported == false ? "Report to Admin" : "Reported"}
              </MenuItem>
            </Menu>
          </div>
        </div>
      </div>
      <div className="announcement__content">{content}</div>
    </div>
  );
}

export default Announcement;
