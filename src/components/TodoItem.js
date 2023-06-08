import React, { useState } from 'react'
import * as dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/ru'
import EditForm from './EditForm.js'

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
const TodoItem = ({ id, todoItem, handleDelete, handleDone }) => {
  const [isEditing, setIsEditing] = useState(false)
  const handleComplete = () => {
    setIsEditing(false)
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
        <input
          className="todo-item-checkbox"
          type="checkbox"
          checked={todoItem.done}
          onChange={() => handleDone(id)}
        ></input>
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
        {todoItem.files &&
          todoItem.files.fileNames.map((item, index) => {
            return (
              <a className="file-wrapper" target="_blank" href={todoItem.files.urls[index]} download key={index}>
                {item}
              </a>
            )
          })}
      </div>

      {/* )} */}
    </div>
  ) : (
    <EditForm
      id={id}
      titleProp={todoItem.title}
      descriptionProp={todoItem.description}
      dateProp={todoItem.date}
      fileNamesProp={todoItem.files.fileNames}
      urlsProp={todoItem.files.urls}
      timestampProp={todoItem.timestamp}
      handleComplete={handleComplete}
    />
  )
}

export default TodoItem
