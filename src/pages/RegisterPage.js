import { SignUp } from 'components/SignUp'
import { Link } from 'react-router-dom'

const RegisterPage = () => {
  return (
    <div className="App">
      <div className="auth-container auth-container__signup">
        <h1 className="auth-container_title">Регистрация</h1>
        <SignUp />
        <p className="auth-container_redirect">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
