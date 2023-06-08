import { Redirect } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useAuth } from 'hooks/use-auth'
import { removeUser } from 'store/slices/userSlice'
import React, { useEffect, useState } from 'react'
import TodoForm from '../components/TodoForm'
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore'
import { db, auth } from '../firebase.js'
import TodoItemsList from '../components/TodoItemsList'
import { useHistory } from 'react-router-dom'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { useSelector } from 'react-redux'

const CreateClassroom = () => {
  const { uid } = useSelector((state) => state.user)
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const handleClick = async (name, subject) => {
    await addDoc(collection(db, 'classrooms'), {
      teacherUid: uid,
      name: name,
      subject: subject,
    })
    setName('')
  }
  return (
    <div className="classrooms_create">
      <input
        className="classrooms_create_input"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Название класса..."
      />
      <input
        className="classrooms_create_input"
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Предмет класса..."
      />
      <button className="classrooms_create_button" onClick={() => handleClick(name, subject)}>
        создать класс
      </button>
    </div>
  )
}

export default CreateClassroom
