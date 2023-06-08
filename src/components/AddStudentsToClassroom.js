import { map } from '@firebase/util'
import React, { useEffect, useState } from 'react'
import ClassroomStudent from './ClassroomStudent'
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

const AddStudentsToClassroom = ({ addedStudents, students, id }) => {
  const [studentsToAdd, setStudentsToAdd] = useState([])
  useEffect(() => {
    if (addedStudents) {
      setStudentsToAdd(addedStudents)
    }
  }, [])
  const handleAddStudent = (checked, id) => {
    console.log(checked, id, 'tut')
    if (checked) {
      setStudentsToAdd((prev) => [...prev, id])
    } else {
      setStudentsToAdd((prev) => prev.filter((student) => student !== id))
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log(studentsToAdd, 'tut')
    const s = new Set(studentsToAdd)
    let notAdded = students.filter((e) => !s.has(e))
    const todosOfClassroom = (await db.collection('classrooms').doc(id).collection('todos').get()).docs.map(
      (doc) => doc.id,
    )
    const setOfTodos = new Set(todosOfClassroom)
    // console.log(notAdded)
    await updateDoc(doc(db, 'classrooms', id), {
      students: studentsToAdd,
    })
    await Promise.all(
      studentsToAdd.map(async (student) => {
        await updateDoc(doc(db, 'assignedClassrooms', student), {
          classroomsList: [
            ...(
              await db.collection('assignedClassrooms').doc(student).get()
            )
              .data()
              .classroomsList.filter((item) => item !== '')
              .filter((item) => item !== id),

            id,
          ],
        })
        await updateDoc(doc(db, 'assignedTodos', student), {
          todosList: [
            ...(
              await db.collection('assignedTodos').doc(student).get()
            )
              .data()
              .todosList.filter((item) => item !== '')
              .filter((item) => !setOfTodos.has(item.todo)),
            //   .filter((item) => item !== id)
            ...todosOfClassroom.map((item) => {
              return { todo: item, classroom: id }
            }),
            // .filter((item) => !setOfTodos.has(item.todo)),
          ],
        })
      }),
    )

    await Promise.all(
      notAdded.map(async (student) => {
        await updateDoc(doc(db, 'assignedClassrooms', student), {
          classroomsList: [
            ...(
              await db.collection('assignedClassrooms').doc(student).get()
            )
              .data()
              .classroomsList.filter((item) => item !== '')
              .filter((item) => item !== id),
          ],
        })
        await updateDoc(doc(db, 'assignedTodos', student), {
          todosList: [
            ...(
              await db.collection('assignedTodos').doc(student).get()
            )
              .data()
              .todosList.filter((item) => item !== '')
              .filter((item) => !setOfTodos.has(item.todo)),
          ],
        })
      }),
    )
  }
  //   console.log(studentsToAdd, 'toadd')
  return (
    <div className="classroom_students">
      <form className="classroom_students_list" onSubmit={handleSubmit}>
        {students.map((student) => (
          <ClassroomStudent
            id={student}
            handleClick={handleAddStudent}
            added={addedStudents && addedStudents.includes(student)}
            key={student}
          />
        ))}

        <button className="classroom_students_submit" type="submit">
          Сохранить
        </button>
      </form>
    </div>
  )
}

export default AddStudentsToClassroom
