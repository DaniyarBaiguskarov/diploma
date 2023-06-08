import { useState } from 'react'

const Form = ({ title, handleClick, isLogin, role }) => {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [name, setName] = useState('')
  const [fuculty, setFuculty] = useState('')
  const [spec, setSpec] = useState('')
  return (
    <div className="auth-container_fields">
      <input
        className="auth-container_field"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Почта..."
      />
      <input
        className="auth-container_field"
        type="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        placeholder="Пароль..."
      />

      {isLogin && (
        <input
          className="auth-container_field"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Имя"
        />
      )}
      <button className="auth-container_button" onClick={() => handleClick(email, pass, name, role)}>
        {role ? (role === 'teacher' ? 'Зарегистрироваться как учитель' : 'Зарегистрироваться как студент') : title}
      </button>
    </div>
  )
}

export { Form }
