import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { Form } from './Form'
import { setUser } from 'store/slices/userSlice'
import { collection, query, onSnapshot, where } from 'firebase/firestore'
import { db } from '../firebase.js'

const Login = () => {
  const dispatch = useDispatch()
  const { push } = useHistory()

  const handleLogin = (email, password) => {
    const auth = getAuth()
    signInWithEmailAndPassword(auth, email, password)
      .then(async ({ user }) => {
        const q = query(collection(db, 'roles'), where('uid', '==', user.uid))
        onSnapshot(q, (snapshot) => {
          dispatch(
            setUser({
              email: user.email,
              uid: user.uid,
              token: user.accessToken,
              name: user.displayName,
              role: snapshot.docs[0].data().role,
            }),
          )
          push('/')
        })
      })
      .catch(() => alert('Invalid user!'))
  }

  return (
    <div className="auth-conatiner_login">
      <Form title="Войти" handleClick={handleLogin} />
    </div>
  )
}

export { Login }
