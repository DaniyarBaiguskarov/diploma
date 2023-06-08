import { Redirect } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useAuth } from 'hooks/use-auth'
import { removeUser } from 'store/slices/userSlice'
import React, { useEffect, useState } from 'react'
import TodoForm from '../components/TodoForm'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  where,
  documentId,
} from 'firebase/firestore'
import { db, auth } from '../firebase.js'
import TodoItemsList from '../components/TodoItemsList'
import { useSelector } from 'react-redux'

const HomePage = () => {
  const { uid } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const qTodosId = query(doc(db, 'assignedTodos', uid))
  const qClassrooms = query(doc(db, 'assignedClassrooms', uid))
  const q = query(collection(db, 'classrooms'), orderBy('timestamp', 'desc'))
  const { isAuth, email } = useAuth()
  const [todos, setTodos] = useState([])
  const [todosId, setTodosId] = useState([])
  const [classrooms, setClassrooms] = useState([])
  // const [todos, setTodos] = useState([])
  const getTodos = async () => {
    // console.log('get', todosId)
    let todos = await Promise.all(
      todosId
        // .filter(async (todo) => {
        //   const q = query(collection(db, 'classrooms', todo.classroom, 'todos'), where(documentId(), '==', todo.todo))
        //   const todosQ = await getDocs(q).docs
        //   console.log(todosQ, 'filter', todo, todosQ ? true : false)

        //   return todosQ ? true : false
        // })
        .map(async (todo) => {
          // const q = await db.collection('classrooms').doc(todo.classroom).collection('todos').get().data()
          const q = query(collection(db, 'classrooms', todo.classroom, 'todos'), where(documentId(), '==', todo.todo))
          const todosQ = await getDocs(q)
          const filesStudent = await (
            await db
              .collection('classrooms')
              .doc(todo.classroom)
              .collection('todos')
              .doc(todo.todo)
              .collection('files')
              .doc(uid)
              .get()
          ).data()
          const teacherUid = await (await db.collection('classrooms').doc(todo.classroom).get()).data().teacherUid
          const filesTeacher = await (
            await db
              .collection('classrooms')
              .doc(todo.classroom)
              .collection('todos')
              .doc(todo.todo)
              .collection('files')
              .doc(teacherUid)
              .get()
          ).data()
          console.log(filesStudent, teacherUid, 'filesSt')
          const files = []
          if (filesTeacher) {
            files.push(filesTeacher)
          }
          if (filesStudent) {
            files.push(filesStudent)
          }
          // console.log(todosQ.docs[0].data())
          // console.log('map', !!todosQ.docs.length ? todosQ.docs[0].data() : false)
          return !!todosQ.docs.length
            ? {
                id: todosQ.docs[0].data().title + todosQ.docs[0].data().description,
                item: todosQ.docs[0].data(),
                files: files,
              }
            : null
          // todosQ.map((item) => console.log(item.data()))
        }),
    )
    todos = todos.filter((item) => item)
    // console.log(todosTe, 'test')
    setTodos(todos)
    // setTodos(

    //   // .filter((item) => item !== []),
    // )
    // await updateDoc(doc(db, 'assignedTodos', uid), {
    //   todosList: todosId,
    // })
  }

  useEffect(() => {
    onSnapshot(qTodosId, (snapshot) => {
      setTodosId(snapshot.data().todosList)
    })
    onSnapshot(qClassrooms, (snapshot) => {
      setClassrooms(snapshot.data().classroomsList)
    })
  }, [])
  useEffect(() => {
    getTodos()
    todos.map((todo) => {
      const q = query(doc(db, 'classrooms', todo.item.classId, 'todos', todo.id))

      onSnapshot(q, (snapshot) => {
        console.log('snap')
        getTodos()
      })
    })
  }, [todosId, classrooms])
  // const handleDelete = (id) => {
  //   deleteDoc(doc(db, 'todos', id))
  // }
  const handleDone = async (classId, todoId) => {
    console.log(classId, todoId)
    const current = await (await db.collection('classrooms').doc(classId).collection('todos').doc(todoId).get()).data()
      .done
    console.log(current)
    await updateDoc(doc(db, 'classrooms', classId, 'todos', todoId), {
      done: current.map((student) => {
        return student.student === uid
          ? { student: student.student, done: !student.done }
          : { student: student.student, done: student.done }
      }),
    })
  }
  console.log(todos, 'tut')
  return (
    <div className="studentpage">
      {/* <TodoForm /> */}

      <TodoItemsList todoItems={todos} handleDone={handleDone} />
      <div className="student_uid">{uid}</div>
      <button className="logout logout__studentpage " onClick={() => dispatch(removeUser())}>
        Выйти
      </button>
    </div>
  )
}

export default HomePage
