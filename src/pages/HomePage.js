import { Redirect } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useAuth } from 'hooks/use-auth'
import { removeUser } from 'store/slices/userSlice'
import React, { useEffect, useState } from 'react'
import TodoForm from '../components/TodoForm'
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db, auth } from '../firebase.js'
import TodoItemsList from '../components/TodoItemsList'
import HomePageTeacher from 'components/HomePageTeacher'
import HomePageStudent from 'components/HomePageStudent'
import { useSelector } from 'react-redux'

const q = query(collection(db, 'todos'), orderBy('timestamp', 'desc'))

const HomePage = () => {
  const dispatch = useDispatch()
  const { role } = useSelector((state) => state.user)
  const { isAuth, email } = useAuth()
  const [todos, setTodos] = useState([])
  useEffect(() => {
    onSnapshot(q, (snapshot) => {
      setTodos(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          item: doc.data(),
        })),
      )
    })
  }, [])
  const handleDelete = (id) => {
    deleteDoc(doc(db, 'todos', id))
  }
  const handleDone = async (id) => {
    updateDoc(doc(db, 'todos', id), {
      done: !(await db.collection('todos').doc(id).get()).data().done,
    })
  }

  return isAuth ? (
    <div>
      {/* <div className="logout-button-wrapper"></div>
      <TodoForm />
      <TodoItemsList todoItems={todos} handleDelete={handleDelete} handleDone={handleDone} />

      <button onClick={() => dispatch(removeUser())}>Log out from {email}</button> */}
      {role === 'student' ? <HomePageStudent /> : <HomePageTeacher />}
    </div>
  ) : (
    <Redirect to="/login" />
  )
}

export default HomePage
