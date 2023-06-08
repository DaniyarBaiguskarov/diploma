import React from 'react'
import TodoItemStudent from './TodoItemStudent'
import TodoItemTeacher from './TodoItemTeacher'
import { useSelector } from 'react-redux'
/**
 *
 * @return возвращает список карточек-записей
 */
const TodoItemsList = ({ todoItems, handleDelete, handleDone }) => {
  const { role } = useSelector((state) => state.user)

  return (
    <div className="classroom_todo">
      {todoItems &&
        todoItems.map((item) =>
          role === 'student' ? (
            <TodoItemStudent
              key={item.id}
              id={item.id}
              todoItem={item.item}
              files={item.files}
              // handleDelete={handleDelete}
              handleDone={handleDone}
            />
          ) : (
            <TodoItemTeacher
              key={item.id}
              id={item.id}
              todoItem={item.item}
              files={item.files}
              handleDelete={handleDelete}
              // handleDone={handleDone}
            />
          ),
        )}
    </div>
  )
}

export default TodoItemsList
