import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@material-ui/core";
import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState } from "recoil";
import { auth, db } from "../firebase";
import { createDialogAtom } from "../utils/atoms";
import { useHistory } from "react-router-dom";

function CreateClass() {
  const history = useHistory();
  const [user, loading, error] = useAuthState(auth);
  const [open, setOpen] = useRecoilState(createDialogAtom);
  const [className, setClassName] = useState("");
  const [message, setMessage]=useState("");
  const handleClose = () => {
    setOpen(false);
  };

  const createClass = async () => {
    if(user)
      {
        try {
      
          const newClass = await db.collection("classes").add({
            creatorUid: user.uid,
            name: className,
            creatorName: user.displayName,
            creatorPhoto: user.photoURL,
            posts: [],
            reportedPosts: [],
            lectures:[],
            assignments:[],
            enrolledStudents:[]
          });
    
          // add to current user's class list
          const userRef = await db
            .collection("users")
            .where("uid", "==", user.uid)
            .get();
          const docId = userRef.docs[0].id;
          const userData = userRef.docs[0].data();
          let userClasses = userData.enrolledClassrooms;
          let createdClasses=userData.createdClassrooms;
          createdClasses.push(
            {
              id: newClass.id,
              name: className,
              creatorName: user.displayName,
              creatorPhoto: user.photoURL,
              creatorId: user.uid,
              enrolledStudents:[]

            }
          )

          userClasses.push({
            id: newClass.id,
            name: className,
            creatorName: user.displayName,
            creatorPhoto: user.photoURL,
            creatorId: user.uid,
            enrolledStudents:[]
          });
          const docRef = await db.collection("users").doc(docId);
          await docRef.update({
            enrolledClassrooms: userClasses,
            createdClassrooms:createdClasses
          });
          setMessage("Classroom created successfully!")
          handleClose();
          setMessage("");
          setClassName("");
          // alert("Done!!");
        } catch (err) {
          alert(`Cannot create class - ${err.message}`);
        }
      }
      else
      {
        history.push('/')
      }
    
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Create class</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the name of class and we will create a classroom for you!
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Class Name"
            type="text"
            fullWidth
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
        </DialogContent>
        {message}
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={createClass} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CreateClass;
