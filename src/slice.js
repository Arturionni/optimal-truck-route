import { createSlice } from '@reduxjs/toolkit'

export const slice = createSlice({
  name: 'slice',
  initialState: {
    polylineLayer: 0,
  },
  reducers: {
	  setPolylineLayer: (state, action) => {
		state.polylineLayer = action.payload
	  }
  },
})

export const { actions } = slice

export default slice.reducer