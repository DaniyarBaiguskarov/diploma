import React, { useState, useEffect } from 'react'
import * as dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/ru'
import EditFormTeacher from './EditFormTeacher'
import { useSelector } from 'react-redux'
import Student from './Student'
import SearchBar from './SearchBar'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Table from 'react-bootstrap/Table'
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
  getDocs,
  setDoc,
} from 'firebase/firestore'
import * as XLSX from 'xlsx'

import { db, auth } from '../firebase.js'

dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)
dayjs.locale('ru')

/**
 * поля todoItem
 * @callback requestCallback
 * @param {string} id id записи
 * @param {string} title заголовок записи
 * @param {string} descriptionProp описание записи
 * @param {string} dateProp дата записи в формате ISO 8601
 * @param {string[]} fileNamesProp массив имен прикрепленных файлов записи
 * @param {string[]} urlsProp массив ссылок на прикрепленные файлы записи
 * @param {requestCallback} handleDelete функция-оброботчик для удаления записи по id
 * @param {requestCallback} handleDone функция-оброботчик для пометки выполнено/не выполнено по id
 * @returns компонент-карточка записи. В случае, если isEditing === true, то возвращает форму редактирования EditForm
 */
const TodoItemTeacher = ({ id, todoItem, files, handleDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  // const [done, setDone] = useState(false)
  const [filesArr, setFilesArr] = useState({})
  const [doneStudents, setDoneStudents] = useState([])
  const { uid } = useSelector((state) => state.user)
  const handleComplete = () => {
    setIsEditing(false)
  }
  useEffect(() => {
    todoItem.done.filter((item) => {
      if (item.done === true) {
        // console.log('tut')
        setDoneStudents((current) => [...current, item.student])
      }
    })
  }, [todoItem.done])
  useEffect(() => {
    if (files) {
      const filesList = { fileNames: [], urls: [] }
      files.map((item) => {
        return item.addedBy === uid
          ? item.fileNames.forEach((file, index) => {
              filesList.fileNames.push(file)
              filesList.urls.push(item.urls[index])
            })
          : null
      })
      setFilesArr(filesList)
    }
  }, [files])
  // console.log(todoItem.done, files, 'filesArr')

  const [show, setShow] = useState(false)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const [squery, setQuery] = useState('')
  const [filtredStudents, setFiltredStudents] = useState([])
  const handleSearch = (e) => {
    setQuery(e)
    // console.log(query)
    // const q = query(collection(db, 'roles'), where('uid', '==', uid)).get()
    // console.log(q)
  }
  const search = async () => {
    // console.log(query)
    const q = query(collection(db, 'roles'), where('name', '==', squery))

    const querySnapshot = await getDocs(q)
    // const q = await db.collection('roles').get().docs
    // .get().data()
    let students = []
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      students.push(doc.data().uid)
      // console.log(doc.id, ' => ', doc.data())
    })
    students = todoItem.done.filter((item) => students.includes(item.student))
    students = await mapNames(students)
    // console.log(filtredStudents, todoItem.done, students)
    setFiltredStudents(
      // Promise.all(
      students,

      // ),
    )
  }
  const mapNames = async (arr) => {
    const newArr = arr.map(async (item) => {
      let name = await getName(item.student)
      return { ...item, name: name }
    })
    // console.log(Promise.all(newArr))
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

  console.log(todoItem.done, todoItem, 'todoitem.done')
  const accept = async (stid, accept) => {
    const current = todoItem.done
    console.log(
      current.map((student) => {
        return student.student === stid
          ? { student: student.student, done: accept, accepted: accept }
          : { student: student.student, done: student.done, accepted: student.accepted }
      }),
      stid,
      todoItem,
    )
    await updateDoc(doc(db, 'classrooms', todoItem.classId, 'todos', todoItem.title + todoItem.description), {
      done: current.map((student) => {
        return student.student === stid
          ? { student: student.student, done: accept, accepted: accept }
          : { student: student.student, done: student.done, accepted: student.accepted }
      }),
    })
  }
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
    table = document.getElementById('myTableTask' + todoItem.title)
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
    input = document.getElementById('myInputTask' + todoItem.title)
    filter = input.value.toUpperCase()
    table = document.getElementById('myTableTask' + todoItem.title)
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
  const options = [
    { value: 1, name: 'Имя' },
    { value: 2, name: 'Статус выполнения' },
    { value: 3, name: 'Статус подтверждения' },
  ]
  function htmlTableToExcel(e) {
    e.stopPropagation()
    var data = document.getElementById('myTableTask' + todoItem.title)
    const hiddens = [].slice.call(data.getElementsByClassName('hidden'))
    hiddens.forEach((item) => {
      item.style.display = 'none'
    })
    // headers[0].style.display = 'none'
    console.log(hiddens)
    if (data) {
      var excelFile = XLSX.utils.table_to_book(data, { sheet: 'sheet1', display: true })
      console.log(excelFile)

      // XLSX.write(excelFile, { bookType: type, bookSST: true, type: 'base64' })
      XLSX.writeFile(excelFile, 'Отчет.xlsx')
    }
    hiddens.forEach((item) => {
      item.style.display = 'table-cell'
    })
  }
  return !isEditing ? (
    <div
      className={
        dayjs(todoItem.date).valueOf() - dayjs().valueOf() < 0 || todoItem.done
          ? 'todo-item todo-item-done'
          : 'todo-item'
      }
    >
      <div className="todo-item-first-row-wrapper">
        {/* <input
          className="todo-item-checkbox"
          type="checkbox"
          checked={todoItem.done}
          onChange={() => handleDone(id)}
        ></input> */}
        <div className="todo-item-title">{todoItem.title}</div>
        <button className="todo-item-button" onClick={() => setIsEditing(true)}>
          редактировать
        </button>
        <button className="todo-item-button" onClick={() => handleDelete(id)}>
          удалить
        </button>
      </div>
      <div className="todo-item-second-row-wrapper">
        <div className="todo-item-description">{todoItem.description}</div>
        <span className="todo-item-date">
          {dayjs(todoItem.date).valueOf() - dayjs().valueOf() < 0
            ? 'Срок истек ' + dayjs(todoItem.date).fromNow()
            : dayjs(todoItem.date).format('LLL')}
        </span>
      </div>
      <div className="files-wrapper">
        {files &&
          files.map((item, index) => {
            return item.fileNames.map((file, index) => {
              return (
                <a className="file-wrapper" target="_blank" href={item.urls[index]} download key={index}>
                  {file}
                </a>
              )
            })
          })}
      </div>
      <div className="students-wrapper">
        {/* {doneStudents.map((student) => (
          <Student id={student} key={student} />
        ))} */}
        <Button
          variant="primary"
          onClick={handleShow}
          style={{ marginLeft: 'auto', backgroundColor: 'rgb(144, 127, 255)' }}
        >
          Отчет по задаче
        </Button>
      </div>
      {/* )} */}
      <Modal size="lg" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Отчет по задаче</Modal.Title>
        </Modal.Header>
        <Modal.Body
        // style={{ width: 'fit-content' }}
        >
          {' '}
          <SearchBar
            handleInput={handleSearch}
            search={filterTable}
            handleOptionChange={handleOptionChange}
            options={options}
            idProp={'myInputTask' + todoItem.title}
          />
          {filtredStudents && squery && (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Студент</th>
                  <th>Статус</th>
                  <th>Файлы</th>
                </tr>
              </thead>
              <tbody>
                {filtredStudents.map((student, index) => {
                  return (
                    <tr>
                      <td>{index + 1}</td>
                      <td>{student.name}</td>
                      <td>{student.done ? 'Выполнено' : 'Не выполнено'}</td>
                      <td>
                        {files &&
                          files
                            .filter((item) => item.addedBy === student.student)
                            .map((item, index) => {
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
                            })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          )}
          <Table id={'myTableTask' + todoItem.title} striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th onClick={() => sortTable(0)}>Студент</th>
                <th onClick={() => sortTable(1)}>Статус выполнения</th>
                <th>Статус подтверждения</th>
                <th className="hidden">Подтвердить</th>
                <th className="hidden">Файлы</th>
              </tr>
            </thead>
            <tbody>
              {todoItem.done.map((student, index) => {
                return (
                  <tr>
                    <td>{index + 1}</td>
                    <td>
                      <Student id={student.student} toTable={true} />
                    </td>
                    <td>
                      {student.done ? 'Выполнено' : 'Не выполнено'}
                      {/* {!student.accepted ? (student.done ? 'Выполнено' : 'Не выполнено') : ''}{' '}
                      {student.accepted ? 'Принято' : 'Не принято'} */}
                    </td>
                    <td>
                      {student.accepted ? 'Принято' : 'Не принято'}
                      {/* {!student.accepted ? (student.done ? 'Выполнено' : 'Не выполнено') : ''}{' '}
                      {student.accepted ? 'Принято' : 'Не принято'} */}
                    </td>
                    <td className="hidden">
                      {' '}
                      {
                        <div>
                          <Button
                            className="btn accept-button "
                            variant="success"
                            onClick={() => accept(student.student, true)}
                            style={{ margin: '5px' }}
                          >
                            Принять
                          </Button>
                          <Button
                            className="btn accept-button "
                            variant="danger"
                            onClick={() => accept(student.student, false)}
                            style={{ margin: '5px' }}
                          >
                            Отклонить
                          </Button>
                        </div>
                      }
                    </td>

                    <td className="hidden">
                      {files &&
                        files
                          .filter((item) => item.addedBy === student.student)
                          .map((item, index) => {
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
                          })}
                    </td>
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
  ) : (
    <EditFormTeacher
      id={id}
      titleProp={todoItem.title}
      classProp={todoItem.classId}
      descriptionProp={todoItem.description}
      dateProp={todoItem.date}
      // files={todoItem.files}
      fileNamesProp={filesArr.fileNames}
      urlsProp={filesArr.urls}
      timestampProp={todoItem.timestamp}
      handleComplete={handleComplete}
    />
  )
}

export default TodoItemTeacher
