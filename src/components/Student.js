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

const Student = ({ id, handleClick, toTable }) => {
  const qStudent = query(collection(db, 'roles'), where('uid', '==', id))
  const [name, setName] = useState('')
  useEffect(() => {
    onSnapshot(qStudent, (snapshot) => {
      setName(snapshot.docs[0].data().name)
    })
  }, [])

  //   console.log(getDoc(db.collection('role').doc(id)).then((res) => console.log(res.get(), 'res')))
  // console.log(name, id)
  return toTable ? (
    name
  ) : (
    <div className="students_list_item">
      <div className="students_list_item_title">{name}</div>
      {handleClick && (
        <div className="students_list_item_button" onClick={() => handleClick(id)}>
          Удалить
        </div>
      )}
    </div>
  )
}

export default Student
