import React from 'react'
import { auth } from '../firebase.js'

/**
 *
 * @description анонимная авторизация
 */

const Auth = () => {
  const signin = () => {
    auth.signInAnonymously().catch(alert)
  }
  return (
    <button className="login-button" onClick={signin}>
      <span>Начать работу</span>
    </button>
  )
}

export default Auth
