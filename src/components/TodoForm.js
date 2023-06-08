import React, { useState } from 'react'
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage'
import { collection, addDoc, serverTimestamp, setDoc, doc, updateDoc } from 'firebase/firestore'
import { storage } from '../firebase.js'
import { db } from '../firebase.js'
import { Route, Link, Routes, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

/**
 *
 * @describe форма составления записи. Создаем состояние file для хранения и отправки на сервер
 * загруженных файлов. Из массива file получаем имена файлов для соответсвующего поля записи. Ссылки получаем
 * во время отправки файлов на сервер при помощи функции getDownloadUrl()
 *
 *
 */

const TodoForm = () => {
  const params = useParams()
  const { uid } = useSelector((state) => state.user)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState()
  const [fileNames, setFileNames] = useState([])
  const [file, setFile] = useState([])
  const [disabled, setDisabled] = useState(false)

  const handleFileInput = (e) => {
    setFile([...file, ...e.target.files])
    setFileNames([...fileNames, ...[...e.target.files].map((item) => item.name)])
    e.target.value = null
    console.log('file', fileNames)
  }
  let hrefs = []

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (file) {
      await Promise.all(
        file.map(async (fileItem) => {
          const storageRef = ref(storage, `files/${fileItem.name}`)
          setDisabled(true)
          await uploadBytesResumable(storageRef, fileItem)

          setDisabled(false)

          let url = await getDownloadURL(storageRef)
          hrefs.push(url)
        }),
      )
    }
    // console.log(title, description, date, fileNames, hrefs)
    await upload()
  }
  const upload = async () => {
    let students = (await db.collection('classrooms').doc(params.id).get()).data().students
    const done = students.map((student) => {
      return { student: student, done: false, accepted: false }
    })
    await setDoc(doc(db, 'classrooms', params.id, 'todos', title + description), {
      // name: title + description,
      title: title,
      description: description,
      date: date,
      fileNames: fileNames,
      urls: hrefs,

      timestamp: serverTimestamp(),
      done: done,
      classId: params.id,
    })

    await setDoc(doc(db, 'classrooms', params.id, 'todos', title + description, 'files', uid), {
      fileNames: fileNames,
      urls: hrefs,
      addedBy: uid,
    })

    if (students) {
      await Promise.all(
        students.map(async (student) => {
          await updateDoc(doc(db, 'assignedTodos', student), {
            todosList: [
              ...(await db.collection('assignedTodos').doc(student).get())
                .data()
                .todosList.filter((item) => item !== ''),
              { todo: title + description, classroom: params.id },
            ],
          })
        }),
      )
    }

    console.log(students)
    setTitle('')
    setDescription('')
    setDate('')
    setFile([])
    setFileNames([])
    hrefs = []
  }
  const deleteFile = (choosenFile) => {
    setFile(file.filter((item) => item.name !== choosenFile))
    setFileNames(fileNames.filter((item) => item !== choosenFile))
  }
  return (
    <form className="todo-form" onSubmit={(e) => handleSubmit(e)}>
      <fieldset className="todo-fieldset" disabled={disabled}>
        <div className="todo-first-row-wrapper">
          <input
            className="todo-title"
            type="text"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            placeholder="Заголовок..."
            required
          />
          <input
            className="todo-date"
            type="datetime-local"
            onInput={(e) => {
              console.log(e.target.value)
              setDate(e.target.value)
            }}
            required
            value={date}
          />
          <input className="todo-submit" type="submit" value={'Добавить'} />
        </div>

        <input
          className="todo-description"
          type="text"
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          placeholder="Описание..."
          required
        />

        <div className="file-area">
          <div className="browse-wrapper">
            <input
              type="file"
              id="selectedFile"
              multiple
              style={{ display: 'none' }}
              onInput={(e) => {
                handleFileInput(e)
              }}
            />
            <input
              className="browse-button"
              type="button"
              value="Browse..."
              onClick={() => document.getElementById('selectedFile').click()}
            />
          </div>
          <div className="files-wrapper">
            {fileNames &&
              fileNames.map((item, index) => (
                <div key={index} className="file-wrapper">
                  <span>{item}</span>
                  <div
                    className="close"
                    onClick={(e) => {
                      deleteFile(item)
                    }}
                  >
                    {/* <span>Удалить</span> */}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </fieldset>
    </form>
  )
}

export default TodoForm
