import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  email: null,
  token: null,
  uid: null,
  name: null,
  role: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.email = action.payload.email
      state.token = action.payload.token
      state.uid = action.payload.uid
      state.name = action.payload.name
      state.role = action.payload.role
    },
    removeUser(state) {
      state.email = null
      state.token = null
      state.id = null
    },
  },
})

export const { setUser, removeUser } = userSlice.actions

export default userSlice.reducer
