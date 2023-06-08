import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { Form } from './Form'
import { setUser } from 'store/slices/userSlice'
import { collection, addDoc, serverTimestamp, doc, setDoc, updateDoc } from 'firebase/firestore'
import { storage } from '../firebase.js'
import { db } from '../firebase.js'

const SignUp = () => {
  const dispatch = useDispatch()
  const { push } = useHistory()

  const handleRegister = async (email, password, name, role) => {
    const auth = getAuth()
    await createUserWithEmailAndPassword(auth, email, password)
      .then(({ user }) => {
        console.log(user)
        // user.updateProfile({ displayName: name })
        dispatch(
          setUser({
            email: user.email,
            uid: user.uid,
            token: user.accessToken,
            name: user.name,
          }),
        )
        push('/')
      })
      .catch(console.error)
    await updateProfile(auth.currentUser, { displayName: name }).catch((err) => console.log(err))

    await addDoc(collection(db, 'roles'), {
      uid: auth.currentUser.uid,
      role: role,
      name: auth.currentUser.displayName,
    })
    if (role === 'teacher') {
      const docRef = collection(db, 'students', auth.currentUser.uid)

      await setDoc(docRef, {
        teacherUid: [''],
      })
    } else {
      await setDoc(doc(db, 'assignedTodos', auth.currentUser.uid), {
        todosList: [''],
      })
      await setDoc(doc(db, 'assignedClassrooms', auth.currentUser.uid), {
        classroomsList: [''],
      })
    }
  }

  return (
    <div className="auth-container_signup">
      <Form title="register" handleClick={handleRegister} isLogin={true} role="teacher" />{' '}
      <Form title="register" handleClick={handleRegister} isLogin={true} role="student" />
    </div>
  )
}

export { SignUp }
