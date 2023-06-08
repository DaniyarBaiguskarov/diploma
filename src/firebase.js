import { initializeApp } from 'firebase/app'
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import 'firebase/compat/auth'
import 'firebase/compat/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyBGtGmX4d5zQkEkQd0M-6akvQz-KpDI5ac',
  authDomain: 'womanup-todo-813e8.firebaseapp.com',
  projectId: 'womanup-todo-813e8',
  storageBucket: 'womanup-todo-813e8.appspot.com',
  messagingSenderId: '825484615520',
  appId: '1:825484615520:web:27f31dcd6af010b3f8c805',
  measurementId: 'G-KTWS8WEZDM',
}

const app = firebase.initializeApp(firebaseConfig)

// Initialize Firebase

export const db = app.firestore()
export const auth = app.auth()
export const storage = app.storage()
// const analytics = getAnalytics(app);
