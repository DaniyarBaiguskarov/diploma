import { Login } from 'components/Login'
import { Link } from 'react-router-dom'

const LoginPage = () => {
  return (
    <div className="App">
      <div className="auth-container auth-container__login">
        <h1 className="auth-container_title">Войти</h1>
        <Login />
        <p className="auth-container_redirect">
          Или <Link to="/register">зарегистрироваться</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
