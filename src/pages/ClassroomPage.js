import { Redirect } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useAuth } from 'hooks/use-auth'
import { removeUser } from 'store/slices/userSlice'
import React, { useEffect, useState } from 'react'
import TodoForm from '../components/TodoForm'
import SearchBar from '../components/SearchBar'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  where,
  documentId,
  getDoc,
  getDocs,
  get,
} from 'firebase/firestore'
import { db, auth } from '../firebase.js'
import TodoItemsList from '../components/TodoItemsList'
import { useSelector } from 'react-redux'
// import CreateClassroom from './CreateClassroom'
// import Classroom from './Classroom'
import { Route, Link, Routes, useParams } from 'react-router-dom'
import AddStudentForm from 'components/AddStudentForm'
import AddStudentsToClassroom from 'components/AddStudentsToClassroom'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Table from 'react-bootstrap/Table'
import { TableCell, TableRow, Table as TableDoc, Paragraph } from 'docx'
import { Document, Packer } from 'docx'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

const ClassroomPage = () => {
  const params = useParams()
  const dispatch = useDispatch()
  const { isAuth, email } = useAuth()
  const todosInClassroomsRef = collection(db, `classrooms/${params.id}/todos`)
  const studentsInClassroomsRef = collection(db, `classrooms`)
  // const filesInClassroomsRef = collection(db, `classrooms/${params.id}/files`)
  const qTodos = query(todosInClassroomsRef, orderBy('timestamp', 'desc'))
  const qStudents = query(studentsInClassroomsRef, where(documentId(), '==', params.id))
  // const qFiles = query(filesInClassroomsRef)

  const [todos, setTodos] = useState([])

  const [students, setStudents] = useState([])
  const [studentsWithNames, setStudentsWithNames] = useState([])
  const { uid } = useSelector((state) => state.user)
  const qAllStudents = query(collection(db, 'students'), where(documentId(), '==', uid))
  const [allStudents, setAllStudents] = useState([])
  useEffect(() => {
    onSnapshot(qAllStudents, (snapshot) => {
      setAllStudents(
        snapshot.docs[0].data().studentsList.slice(1),
        // snapshot.docs.map((doc) => ({
        //   id: doc.id,
        //   item: doc.data(),
        // })),
      )
    })
    onSnapshot(qTodos, async (snapshot) => {
      if (snapshot.docs) {
        setTodos(
          await Promise.all(
            snapshot.docs.map(async (doc) => {
              const files = await (
                await db
                  .collection('classrooms')
                  .doc(params.id)
                  .collection('todos')
                  .doc(doc.id)
                  .collection('files')

                  .get()
              ).docs.map((item) => item.data())
              console.log(files, 'ФАЙЛЫ')
              return { id: doc.id, item: { ...doc.data() }, files: files }
            }),
          ),
        )
      }
    })

    getStudents()
  }, [])
  const getStudents = async () => {
    let qstudents = await (await getDoc(doc(db, 'classrooms', params.id))).data().students
    setStudents(qstudents)
    if (qstudents) {
      let newStudents = await mapNames(qstudents)
      setStudentsWithNames(newStudents)
    }
    // console.log(newStudents, 'newStudents', qstudents)
  }
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'classrooms', params.id, 'todos', id))
    let students = (await db.collection('classrooms').doc(params.id).get()).data().students
    await Promise.all(
      students.map(async (student) => {
        await updateDoc(doc(db, 'assignedTodos', student), {
          todosList: (await db.collection('assignedTodos').doc(student).get())
            .data()
            .todosList.filter((item) => item !== id),
        })
      }),
    )
  }
  const handleDone = async (id) => {
    updateDoc(doc(db, 'classrooms', params.id, 'todos', id), {
      done: !(await db.collection('classrooms', params.id, 'todos').doc(id).get()).data().done,
    })
  }
  console.log(students, 'students')
  console.log(todos, 'todos')

  const [show, setShow] = useState(false)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const getDoneByTask = (taskId, studentID) => {
    let isDone
    todos
      .filter((item) => item.id === taskId)
      .map((item) => {
        isDone = item.item.done.filter((doneItem) => doneItem.student === studentID)[0].accepted
      })
    return isDone
  }

  const getFilesById = (taskId, studentID) => {
    let files = []
    todos
      .filter((item) => item.id === taskId)
      .map((item) => {
        files = item.files.filter((fileItem) => fileItem.addedBy === studentID)[0]
      })
    return files
  }
  // useEffect(() => {
  //   const map = async () => {
  //     let newStudents = await mapNames(students)
  //     console.log(newStudents, 'newStudents')
  //   }
  //   map()
  // }, [students])

  const mapNames = async (arr) => {
    const newArr = arr.map(async (item) => {
      let name = await getName(item)
      return { uid: item, name: name }
    })
    console.log(Promise.all(newArr))
    return Promise.all(newArr)
  }
  const getName = async (id) => {
    const q = query(collection(db, 'roles'), where('uid', '==', id))

    const querySnapshot = await getDocs(q)
    // const q = await db.collection('roles').get().docs
    // .get().data()
    // const students = []
    let name
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      name = doc.data().name
      // students.push(doc.data().uid)
      // console.log(doc.id, ' => ', doc.data())
    })

    return name
  }
  const createDoc = () => {
    const header = new TableRow({
      children: [
        new TableCell({
          width: { size: 100 / todos.length + 2 },
          children: [new Paragraph('#')],
        }),
        new TableCell({
          children: [new Paragraph('Студент')],
          width: { size: 100 / todos.length + 2 },
        }),
        ...todos.map((todo) => {
          return new TableCell({
            children: [new Paragraph(todo.item.title)],
            width: { size: 100 / todos.length + 2 },
          })
        }),
      ],
    })
    const rowsList = studentsWithNames.map((item, index) => {
      return new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph(index + 1)],
            width: { size: 100 / todos.length + 2 },
          }),
          new TableCell({
            children: [new Paragraph(item.name)],
            width: { size: 100 / todos.length + 2 },
          }),
          ...todos.map((todo) => {
            return new TableCell({
              children: [new Paragraph(getDoneByTask(todo.id, item.uid) ? 'Выполнено' : 'Не выполнено')],
              width: { size: 100 / todos.length + 2 },
            })
          }),
        ],
      })
    })
    const tableObj = new TableDoc({
      rows: [header, ...rowsList],
    })
    const document = new Document({
      sections: [
        {
          children: [tableObj],
        },
      ],
    })
    console.log(tableObj)
    getClassName()
    saveDocumentToFile(document, `Отчет по ${className}.docx`)
  }
  function saveDocumentToFile(doc, fileName) {
    // Create new instance of Packer for the docx module
    const packer = new Packer()
    // Create a mime type that will associate the new file with Microsoft Word
    const mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    // Create a Blob containing the Document instance and the mimeType
    console.log(doc)

    Packer.toBlob(doc).then((blob) => {
      const docblob = blob.slice(0, blob.size, mimeType)
      // Save the file using saveAs from the file-saver package
      saveAs(docblob, fileName)
    })
  }
  const [className, setClassName] = useState('')
  const getClassName = async () => {
    let name = (await db.collection('classrooms').doc(params.id).get()).data().name
    console.log(name)
    setClassName(name)
  }
  const [squery, setQuery] = useState('')
  const [filtredStudents, setFiltredStudents] = useState([])
  const handleSearch = (e) => {
    setQuery(e)
    // console.log(query)
    // const q = query(collection(db, 'roles'), where('uid', '==', uid)).get()
    // console.log(q)
  }
  const search = () => {
    setFiltredStudents(studentsWithNames.filter((item) => item.name === squery))
    console.log(filtredStudents, studentsWithNames)
    // console.log(query)
    // const q = query(collection(db, 'roles'), where('uid', '==', uid)).get()
    // console.log(q)
  }
  console.log('todos', todos)
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
    table = document.getElementById('myTableClass' + params.id)
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
    input = document.getElementById('myInputClass' + params.id)
    filter = input.value.toUpperCase()
    table = document.getElementById('myTableClass' + params.id)
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
  }
  let options = [{ value: 1, name: 'Имя' }]
  todos.map((item, index) => options.push({ value: index + 2, name: item.item.title }))
  console.log(options)

  function htmlTableToExcel(e) {
    e.stopPropagation()
    var data = document.getElementById('myTableClass' + params.id)
    if (data) {
      var excelFile = XLSX.utils.table_to_book(data, { sheet: 'sheet1' })
      // XLSX.write(excelFile, { bookType: type, bookSST: true, type: 'base64' })
      XLSX.writeFile(excelFile, 'Отчет.xlsx')
    }
  }
  return isAuth ? (
    <div className="classroompage">
      <div>
        <AddStudentsToClassroom addedStudents={students} students={allStudents} id={params.id} />
        <Button
          variant="primary"
          className="mt-3 table-button"
          onClick={handleShow}
          style={{ backgroundColor: 'rgb(144, 127, 255)' }}
        >
          Отчет по классу
        </Button>

        <Modal size="lg" show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Отчет по классу</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <SearchBar
              handleInput={handleSearch}
              search={filterTable}
              handleOptionChange={handleOptionChange}
              options={options}
              idProp={'myInputClass' + params.id}
            />

            <Table id={'myTableClass' + params.id} striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th onClick={() => sortTable(1)}>Студент</th>
                  {todos.map((item, index) => (
                    <th onClick={() => sortTable(index + 2)}>{item.item.title}</th>
                  ))}
                  {/* <th>Статус</th>
                  <th>Файлы</th> */}
                </tr>
              </thead>
              <tbody>
                {studentsWithNames.map((student, index) => {
                  return (
                    <tr>
                      <td>{index + 1}</td>
                      <td>{student.name}</td>
                      {todos.map((item) => (
                        <td>
                          {getDoneByTask(item.id, student.uid) ? 'Принято' : 'Не принято'}
                          {/* {getFilesById(item.id, student.uid) &&
                            getFilesById(item.id, student.uid).map((item, index) => {
                              return item.fileNames.map((file, index) => {
                                return (
                                  <a
                                    className="file-wrapper"
                                    target="_blank"
                                    href={item.urls[index]}
                                    download
                                    key={index}
                                  >
                                    {file}
                                  </a>
                                )
                              })
                            })} */}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Закрыть
            </Button>
            <Button variant="secondary" onClick={(e) => htmlTableToExcel(e)}>
              Сохранить как .xlsx
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
      <div className="classroom_todos">
        <TodoForm />
        <TodoItemsList todoItems={todos} handleDelete={handleDelete} handleDone={handleDone} />
      </div>
      <button className="logout" onClick={() => dispatch(removeUser())}>
        Выйти
      </button>
    </div>
  ) : (
    <Redirect to="/login" />
  )
}

export default ClassroomPage
