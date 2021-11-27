import { Avatar, IconButton, MenuItem, Menu, Button } from "@material-ui/core";
// import {Button} from 'react-bootstrap'
import { Add, Apps, Menu as MenuIcon } from "@material-ui/icons";
import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState } from "recoil";
import { auth, logout, signInWithGoogle } from "../firebase";
import { createDialogAtom, joinDialogAtom } from "../utils/atoms";
import CreateClass from "./CreateClass";
import JoinClass from "./JoinClass";
import "./Navbar.css";
import { useHistory } from "react-router-dom";

//to display the navigation bar
export default function Navigation() {
  const [user, loading, error] = useAuthState(auth);
  const [anchorEl, setAnchorEl] = useState(null);
  const [createOpened, setCreateOpened] = useRecoilState(createDialogAtom);
  const [joinOpened, setJoinOpened] = useRecoilState(joinDialogAtom);
  const history = useHistory();
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
      <nav id="menu" className="navbar navbar-default navbar-fixed-top">
        <div className="container">
          <div className="navbar-header">
            <button
              type="button"
              className="navbar-toggle collapsed"
              data-toggle="collapse"
              data-target="#bs-example-navbar-collapse-1"
            >
              {" "}
              <span className="sr-only">Toggle navigation</span>{" "}
              <span className="icon-bar"></span>{" "}
              <span className="icon-bar"></span>{" "}
              <span className="icon-bar"></span>{" "}
            </button>
            <a className="navbar-brand page-scroll" href="#page-top">
              Vorlesung
            </a>{" "}
          </div>

          <div
            className="collapse navbar-collapse"
            id="bs-example-navbar-collapse-1"
          >
            {user ? (
              <ul className="nav navbar-nav navbar-right">
                <li>
                  <a href="/dashboard" className="page-scroll">
                    Enrolled Classes
                  </a>
                </li>
                <li>
                  <a href="/created-classes" className="page-scroll">
                    Created Classes
                  </a>
                </li>

                <li>
                  {" "}
                  <a
                    className="page-scroll"
                    onClick={() => {
                      setCreateOpened(true);
                      handleClose();
                    }}
                  >
                    Create Class
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => {
                      setJoinOpened(true);
                      handleClose();
                    }}
                  >
                    Join Class
                  </a>
                </li>

                <li>
                  <a onClick={logout}>Logout</a>
                </li>
              </ul>
            ) : (
              <ul className="nav navbar-nav navbar-right">
                <li>
                  <a onClick={signInWithGoogle}>Login</a>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
