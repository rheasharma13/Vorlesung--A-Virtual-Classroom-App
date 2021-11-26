import { Avatar, IconButton, MenuItem, Menu, Button } from "@material-ui/core";
// import {Button} from 'react-bootstrap'
import { Add, Apps, Menu as MenuIcon } from "@material-ui/icons";
import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState } from "recoil";
import { auth, logout } from "../firebase";
import { createDialogAtom, joinDialogAtom } from "../utils/atoms";
import CreateClass from "./CreateClass";
import JoinClass from "./JoinClass";
import "./Navbar.css";
import {useHistory} from "react-router-dom"

function Navbar() {
  const [user, loading, error] = useAuthState(auth);
  const [anchorEl, setAnchorEl] = useState(null);
  const [createOpened, setCreateOpened] = useRecoilState(createDialogAtom);
  const [joinOpened, setJoinOpened] = useRecoilState(joinDialogAtom);
  const history=useHistory()
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <CreateClass />
      <JoinClass />
      <nav className="navbar">
        <div className="navbar__left">
         
         
          <span>Virtual Classroom</span>
        </div>
        <div className="navbar__right">
          
          {/* <IconButton>
            <Apps />
          </IconButton> */}
          <Button onClick={e=>{e.preventDefault(); history.push("/dashboard")}}>Enrolled Classes</Button>
          <Button onClick={e=>{e.preventDefault(); history.push("/created-classes")}}>Created Classes </Button>
          <Button  onClick={() => {
                setCreateOpened(true);
                handleClose();
              }}>Create Class</Button>
              <Button   onClick={() => {
                setJoinOpened(true);
                handleClose();
              }}>Join Class</Button>
              
                <Button onClick={logout}>Logout</Button>
              
              <IconButton onClick={logout}>
            <Avatar src={user?.photoURL} />
          </IconButton>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem
              onClick={() => {
                setCreateOpened(true);
                handleClose();
              }}
            >
              Create Class
            </MenuItem>
            <MenuItem
              onClick={() => {
                setJoinOpened(true);
                handleClose();
              }}
            >
              Join Class
            </MenuItem>
          </Menu>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
