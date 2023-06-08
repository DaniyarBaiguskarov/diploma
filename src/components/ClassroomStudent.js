import React, { useEffect, useState } from 'react'

import { db, auth } from '../firebase.js'
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
  getDoc,
} from 'firebase/firestore'

const ClassroomStudent = ({ handleClick, id, added }) => {
  const qStudent = query(collection(db, 'roles'), where('uid', '==', id))
  const [checked, setChecked] = useState(false)
  const [name, setName] = useState('')
  useEffect(() => {
    onSnapshot(qStudent, (snapshot) => {
      setName(snapshot.docs[0].data().name)
    })
  }, [])
  useEffect(() => {
    handleClick(checked, id)
  }, [checked])
  useEffect(() => {
    if (added) {
      setChecked(added)
    }
  }, [added])
  const handleChange = () => {
    setChecked(!checked)

    // setTimeout(() => {
    //   handleClick(checked, id)
    // }, 0)
  }
  console.log(checked, added)
  return (
    <div className="classroom_students_list_item">
      <div className="classroom_students_list_item_title">{name}</div>
      <input
        className="classroom_students_list_item_checkbox"
        type="checkbox"
        onChange={() => handleChange()}
        checked={checked}
      ></input>
    </div>
  )
}

export default ClassroomStudent
