import React, { useEffect, useState } from 'react'
import ClassroomPage from 'pages/ClassroomPage'
import HomePage from 'pages/HomePage'
import LoginPage from 'pages/LoginPage'
import RegisterPage from 'pages/RegisterPage'
import { Switch, Route } from 'react-router-dom'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  where,
  addDoc,
  documentId,
} from 'firebase/firestore'
import { db, auth } from './firebase.js'

import { useSelector } from 'react-redux'

function App() {
  // const { uid } = useSelector((state) => state.user)
  // const qAllStudents = query(collection(db, 'students'), where(documentId(), '==', uid))
  // const [allStudents, setAllStudents] = useState([])
  // useEffect(() => {
  //   onSnapshot(qStudents, (snapshot) => {
  //     setStudents(
  //       snapshot.docs[0].data().studentsList.slice(1),
  //       // snapshot.docs.map((doc) => ({
  //       //   id: doc.id,
  //       //   item: doc.data(),
  //       // })),
  //     )
  //   })
  // }, [])
  return (
    <Switch>
      <Route exact path="/" component={HomePage}></Route>
      <Route exact path="/login" component={LoginPage} />
      <Route exact path="/register" component={RegisterPage} />
      <Route path="/:id" component={ClassroomPage} />
    </Switch>
  )
}

export default App
