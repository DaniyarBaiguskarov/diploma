import React from 'react'
import { useState } from 'react'

const AddStudentForm = ({ handleClick }) => {
  const [uid, setUid] = useState('')
  return (
    <div className="students_create">
      <input
        className="students_create_input"
        type="text"
        value={uid}
        onChange={(e) => setUid(e.target.value)}
        placeholder="Uid..."
      />
      <button className="students_create_button" onClick={() => handleClick(uid)}>
        добавить студента
      </button>
    </div>
  )
}

export default AddStudentForm
