import { createSlice } from '@reduxjs/toolkit'

export const gameSlice = createSlice({
    name: 'game',
    initialState: {
        host: "",
        round: 0,
        answers: [],
        users: [],
        gameMode: ""
    },
    reducers: {
        updateGame: (state, action) => {
            state.host = action.payload.host;
            state.round = action.payload.round;
            state.answers = action.payload.answers;
            state.users = action.payload.users;
            state.gameMode = action.payload.gameMode;
        },
        setHost: (state,action) => {
            state.host = action.payload;
        },
        updateUsers: (state,action) => {
            state.users = action.payload;
        },
        updateRound: (state,action) => {
            state.round = action.payload;
        }
    }
})

// Action creators are generated for each case reducer function
export const { updateGame, setHost, updateUsers, updateRound } = gameSlice.actions

export default gameSlice.reducer