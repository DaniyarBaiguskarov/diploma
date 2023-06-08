import { Redirect } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useAuth } from 'hooks/use-auth'
import { removeUser } from 'store/slices/userSlice'
import React, { useEffect, useState } from 'react'
import TodoForm from '../components/TodoForm'
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db, auth } from '../firebase.js'
import TodoItemsList from '../components/TodoItemsList'
import { useHistory } from 'react-router-dom'

const Classroom = ({ id, name }) => {
  // const [todos, setTodos]=useState([])
  const { push } = useHistory()
  return (
    <div className="classrooms_list_item">
      <div className="classrooms_list_item_title">{name}</div>
      <button className="classrooms_list_item_button" onClick={() => push(`/${id}`)}>
        Перейти к {name}
      </button>
    </div>
  )
}

export default Classroom
