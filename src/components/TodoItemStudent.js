import React, { useState, useEffect } from 'react'
import * as dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/ru'
import EditFormStudent from './EditFormStudent'
import { useSelector } from 'react-redux'

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
const TodoItemStudent = ({ id, todoItem, files, handleDelete, handleDone }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [done, setDone] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [filesArr, setFilesArr] = useState({})
  const { uid } = useSelector((state) => state.user)
  const handleComplete = () => {
    setIsEditing(false)
  }
  useEffect(() => {
    if (todoItem.done) {
      todoItem.done.filter((item) => {
        if (item.student === uid) {
          // console.log('tut')
          setDone(item.done)
        }
      })
    }
  }, [todoItem.done])
  useEffect(() => {
    if (todoItem.done) {
      todoItem.done.filter((item) => {
        if (item.student === uid) {
          // console.log('tut')
          setAccepted(item.accepted)
        }
      })
    }
  }, [])
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
  // useEffect(() => {
  //   if (todoItem.done) {
  //     getDone(todoItem.done)
  //   }
  // }, [todoItem.done])
  // const getDone = (arr) => {
  //   console.log(arr)
  //   arr.filter((item) => {
  //     if (item.student === uid) {
  //       console.log('tut')
  //       setDone(item.done)
  //     }
  //   })
  // }
  console.log(filesArr.fileNames, 'filesArr')
  return !isEditing ? (
    <div>
      <h3>{accepted ? 'Принято' : 'Не принято'}</h3>
      <div
        className={
          dayjs(todoItem.date).valueOf() - dayjs().valueOf() < 0 || todoItem.done
            ? 'todo-item todo-item-done'
            : 'todo-item'
        }
      >
        <div className="todo-item-first-row-wrapper">
          <input
            className="todo-item-checkbox"
            type="checkbox"
            checked={done}
            onChange={() => {
              handleDone(todoItem.classId, id)
              setDone(!done)
            }}
          ></input>
          <div className="todo-item-title">{todoItem.title}</div>
          <button className="todo-item-button" onClick={() => setIsEditing(true)}>
            редактировать
          </button>
          {/* <button className="todo-item-button" onClick={() => handleDelete(id)}>
          удалить
        </button> */}
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

        {/* )} */}
      </div>
    </div>
  ) : (
    <EditFormStudent
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

export default TodoItemStudent
