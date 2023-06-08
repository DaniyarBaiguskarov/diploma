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
  where,
  addDoc,
  documentId,
} from 'firebase/firestore'
import { db, auth } from '../firebase.js'
import TodoItemsList from '../components/TodoItemsList'
import { useSelector } from 'react-redux'
import CreateClassroom from './CreateClassroom'
import Classroom from './Classroom'
import AddStudentForm from './AddStudentForm'
import StudentsList from './StudentsList'
import Table from 'react-bootstrap/Table'
import { useHistory } from 'react-router-dom'
import SearchBar from './SearchBar'

const HomePageTeacher = () => {
  const { uid } = useSelector((state) => state.user)
  const dispatch = useDispatch()

  const qClassrooms = query(collection(db, 'classrooms'), where('teacherUid', '==', uid))
  const qStudents = query(collection(db, 'students'), where(documentId(), '==', uid))
  const { isAuth, email } = useAuth()
  const [todos, setTodos] = useState([])
  const [classrooms, setClassrooms] = useState([])
  const [students, setStudents] = useState([])
  useEffect(() => {
    onSnapshot(qClassrooms, (snapshot) => {
      setClassrooms(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          item: doc.data(),
        })),
      )
    })
    onSnapshot(qStudents, (snapshot) => {
      setStudents(
        snapshot.docs[0].data().studentsList.slice(1),
        // snapshot.docs.map((doc) => ({
        //   id: doc.id,
        //   item: doc.data(),
        // })),
      )
    })
  }, [])
  // const handleDelete = async (id) => {
  //   await deleteDoc(doc(db, 'todos', id))
  //   let students = (await db.collection('classrooms').doc(student).get()).data().classroomsList
  //   await Promise.all(
  //     studentsToAdd.map(async (student) => {
  //       await updateDoc(doc(db, 'assignedClassrooms', student), {
  //         classroomsList: [...(await db.collection('assignedClassrooms').doc(student).get()).data().classroomsList, id],
  //       })
  //     }),
  //   )

  // }
  const handleDone = async (id) => {
    updateDoc(doc(db, 'todos', id), {
      done: !(await db.collection('todos').doc(id).get()).data().done,
    })
  }
  const handleAddStudent = async (id) => {
    // console.log((await db.collection('students').doc(uid).get()).data().studentsList)
    await updateDoc(doc(db, 'students', uid), {
      studentsList: [...(await db.collection('students').doc(uid).get()).data().studentsList, id],
    })
  }
  const handleDeleteStudent = async (id) => {
    await updateDoc(doc(db, 'students', uid), {
      studentsList: (await db.collection('students').doc(uid).get())
        .data()
        .studentsList.filter((student) => student !== id),
    })
  }
  // console.log(students)
  const { push } = useHistory()

  const sortTable = (n) => {
    var table,
      rows,
      switching,
      i,
      x,
      y,
      shouldSwitch,
      dir,
      switchcount = 0
    table = document.getElementById('myTableClassList')
    console.log(table)
    console.log('click')
    if (table) {
      console.log(table, 'table1')
      switching = true
      // Set the sorting direction to ascending:
      dir = 'asc'
      /* Make a loop that will continue until
    no switching has been done: */
      while (switching) {
        // Start by saying: no switching is done:
        switching = false
        rows = table.rows
        /* Loop through all table rows (except the
      first, which contains table headers): */
        for (i = 1; i < rows.length - 1; i++) {
          // Start by saying there should be no switching:
          shouldSwitch = false
          /* Get the two elements you want to compare,
        one from current row and one from the next: */
          x = rows[i].getElementsByTagName('TD')[n]
          y = rows[i + 1].getElementsByTagName('TD')[n]
          /* Check if the two rows should switch place,
        based on the direction, asc or desc: */
          if (dir == 'asc') {
            if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
              // If so, mark as a switch and break the loop:
              shouldSwitch = true
              break
            }
          } else if (dir == 'desc') {
            if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
              // If so, mark as a switch and break the loop:
              shouldSwitch = true
              break
            }
          }
        }
        if (shouldSwitch) {
          /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
          rows[i].parentNode.insertBefore(rows[i + 1], rows[i])
          switching = true
          // Each time a switch is done, increase this count by 1:
          switchcount++
        } else {
          /* If no switching has been done AND the direction is "asc",
        set the direction to "desc" and run the while loop again. */
          if (switchcount == 0 && dir == 'asc') {
            dir = 'desc'
            switching = true
          }
        }
      }
    }
  }
  const [col, setCol] = useState(1)
  function filterTable() {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue
    input = document.getElementById('myInputClassList')
    filter = input.value.toUpperCase()
    table = document.getElementById('myTableClassList')
    tr = table.getElementsByTagName('tr')

    // Loop through all table rows, and hide those who don't match the search query
    console.log(col)
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName('td')[col]
      if (td) {
        txtValue = td.textContent || td.innerText
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = ''
        } else {
          tr[i].style.display = 'none'
        }
      }
    }
  }

  const handleOptionChange = (val) => {
    setCol(val)
    console.log('const [col, setCol] = useState(1)', col, val)
    filterTable()
  }
  const options = [
    { value: 1, name: 'Название' },
    { value: 2, name: 'Предмет' },
  ]

  const [squery, setQuery] = useState('')

  const handleSearch = (e) => {
    setQuery(e)
    // console.log(query)
    // const q = query(collection(db, 'roles'), where('uid', '==', uid)).get()
    // console.log(q)
  }
  return (
    <div className="homepage-teacher">
      {/* <div className="logout-button-wrapper"></div>
       <TodoForm />

       <TodoItemsList todoItems={todos} handleDelete={handleDelete} handleDone={handleDone} /> */}
      <div className="students">
        <AddStudentForm handleClick={handleAddStudent} />

        <StudentsList students={students} handleClick={handleDeleteStudent} />
      </div>
      <div className="classrooms">
        <CreateClassroom />
        <div className="classrooms_list">
          {/* {classrooms.map((classroom) => (
            <Classroom name={classroom.item.name} id={classroom.id} key={classroom.id} />
          ))} */}
          <SearchBar
            handleInput={handleSearch}
            search={filterTable}
            handleOptionChange={handleOptionChange}
            options={options}
            idProp={'myInputClassList'}
          />
          <Table id={'myTableClassList'} striped bordered hover>
            <thead>
              <tr>
                <th onClick={() => sortTable(0)}>Название</th>
                <th onClick={() => sortTable(1)}>Предмет</th>
                <th>Перейти</th>
              </tr>
            </thead>
            <tbody>
              {classrooms.map((classroom, index) => {
                return (
                  <tr>
                    <td>{classroom.item.name}</td>
                    <td>{classroom.item.subject}</td>
                    <td>
                      <button className="classrooms_list_item_button" onClick={() => push(`/${classroom.id}`)}>
                        Перейти к {classroom.item.name}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </div>
      </div>
      <button className="logout" onClick={() => dispatch(removeUser())}>
        Выйти
      </button>
    </div>
  )
}

export default HomePageTeacher
