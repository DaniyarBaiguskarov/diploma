import React, { useState } from 'react'
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage'
import { updateDoc, doc, setDoc } from 'firebase/firestore'

import { storage } from '../firebase.js'
import { db } from '../firebase.js'
import { Route, Link, Routes, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

/**
 * @callback requestCallback
 * @param {string} id id документа  в коллекции
 * @param {string} titleProp заголовок изменяемой записи
 * @param {string} descriptionProp описание изменяемой записи
 * @param {string} dateProp дата изменяемой записи в формате ISO 8601
 * @param {string[]} fileNamesProp массив имен прикрепленных файлов изменяемой записи
 * @param {string[]} urlsProp массив ссылок на прикрепленные файлы изменяемой записи
 * @param {requestCallback} handleComplete функция, которая меняет состояние isEditing компонента
 * TodoItem на false. Состояние отвечает за видимость компонента EditForm
 * @returns форма редактирования записи
 */

const EditForm = ({
  id,
  titleProp,
  descriptionProp,
  dateProp,
  fileNamesProp,
  urlsProp,
  timestampProp,
  handleComplete,
}) => {
  const params = useParams()
  const { uid } = useSelector((state) => state.user)
  const [title, setTitle] = useState(titleProp)
  const [desription, setDescription] = useState(descriptionProp)
  const [date, setDate] = useState(dateProp)
  const [fileNames, setFileNames] = useState(fileNamesProp)
  const [file, setFile] = useState([])
  const [disabled, setDisabled] = useState(false)
  const handleFileInput = (e) => {
    setFile([...file, ...e.target.files])
    setFileNames([...fileNames, ...[...e.target.files].map((item) => item.name)])
    e.target.value = null
  }
  let hrefs = urlsProp

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (file) {
      /**
       * @describe Promise.all, в котором загружаем файлы из массива file в storage, т.е. файлы,
       * которые были добавлены в результате редактирования записи, а также для каждого загруженного файла
       * формируем url, который в последствии также  загружаем в firestore
       *
       */
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
    console.log(title, desription, date, fileNames, hrefs)
    await upload()
    handleComplete()
  }
  const upload = async () => {
    // await updateDoc(doc(db, 'classrooms', params.id, 'todos', id), {
    //   title: title,
    //   description: desription,
    //   date: date,
    //   fileNames: fileNames,
    //   urls: hrefs,
    //   done: false,
    // })
    // await updateDoc(doc(db, 'classrooms', params.id, 'files', id), {
    //   fileNames: fileNames,
    //   urls: hrefs,
    //   addedBy: uid,
    // })
    const currentDone = (await db.collection('classrooms', params.id, 'todos').doc(id).get()).data().done
    await setDoc(doc(db, 'classrooms', params.id, 'todos', id), {
      // name: title + desription,
      title: title,
      description: desription,
      date: date,
      // fileNames: fileNames,
      // urls: hrefs,
      timestamp: timestampProp,
      done: currentDone,
      classId: params.id,
    })

    await setDoc(doc(db, 'classrooms', params.id, 'todos', id, 'files', uid), {
      fileNames: fileNames,
      urls: hrefs,
      addedBy: uid,
    })
  }
  /**
   *
   * @param {string} choosenFile имея удаляемого файла
   * @describe Проблема состоит в том, что firebase не определяет уникальные id
   * для файлов, поэтому удаление одного из двух одинаковых файлов в разных записях
   * приводит к удалению другого. Поэтому здесь пока костыль, т.к. по сути файлы продолжают
   * храниться в strorage, удаление происходит лишь ссылки и имени в конкретном документе
   */
  const deleteFile = async (choosenFile) => {
    setFile(file.filter((item) => item.name !== choosenFile))
    hrefs.splice(fileNames.indexOf(choosenFile), 1)
    setFileNames(fileNames.filter((item) => item !== choosenFile))
  }
  return (
    <form className="todo-form todo-form-edit " onSubmit={(e) => handleSubmit(e)}>
      <fieldset className="todo-fieldset todo-fieldset-edit" disabled={disabled}>
        <div className="todo-first-row-wrapper todo-first-row-wrapper-edit">
          <input
            className="todo-title todo-title-edit"
            type="text"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            placeholder="Заголовок..."
            required
          />
          <input
            className="todo-date todo-date-edit"
            type="datetime-local"
            onInput={(e) => {
              console.log(e.target.value)
              setDate(e.target.value)
            }}
            value={date}
            required
          />
          <input className="todo-submit todo-submit-edit" type="submit" value={'Изменить'} />
        </div>

        <input
          className="todo-description todo-description-edit"
          type="text"
          onChange={(e) => setDescription(e.target.value)}
          value={desription}
          required
          placeholder="Описание..."
        />

        <div className="file-area file-area-edit">
          <div className="browse-wrapper browse-wrapper-edit">
            <input
              type="file"
              id="selectedFileEdit"
              multiple
              style={{ display: 'none' }}
              onInput={(e) => {
                handleFileInput(e)
              }}
            />
            <input
              className="browse-button browse-button-edit"
              type="button"
              value="Browse..."
              onClick={() => document.getElementById('selectedFileEdit').click()}
            />
          </div>
          <div className="files-wrapper files-wrapper-edit">
            {fileNames &&
              fileNames.map((item, index) => (
                <div key={index} className="file-wrapper file-wrapper-edit">
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

export default EditForm
