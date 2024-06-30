import { createSlice } from '@reduxjs/toolkit'
import {v4 as uuidv4} from "uuid";

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    name:"",
    id:uuidv4()
  },
  reducers: {
    update: (state,action) =>{
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      console.log(action.payload)
      sessionStorage.setItem("user",action.payload)
      state.name = action.payload
    }
  }
})

// Action creators are generated for each case reducer function
export const {update} = userSlice.actions

export default userSlice.reducer