import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    orientation: 'PORTRAIT',
    hasConnection: false,
    darkMode: false,
    newElement: false
}

export const navSlice = createSlice({
    name: 'nav',
    initialState,
    reducers: {
        setOrientation: (state, action) => {state.orientation = action.payload},
        setNewElement: (state, action) => {state.newElement = action.payload},
    }
})

export const {setOrientation, setNewElement} = navSlice.actions

export const selectOrientation = (state) => state.navApp.orientation;
export const selectNewElement = (state) => state.navApp.newElement;

export default navSlice.reducer