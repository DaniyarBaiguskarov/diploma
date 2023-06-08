import React from 'react'
import Student from './Student'

const StudentsList = ({ students, handleClick }) => {
  return (
    <div className="students_list">
      {students.map((student) => (
        <Student id={student} handleClick={handleClick} key={student} />
      ))}
    </div>
  )
}

export default StudentsList
