import { createSlice } from '@reduxjs/toolkit'

export const slice = createSlice({
  name: 'slice',
  initialState: {
    routeInfo: {}
  },
  reducers: {
    setRouteInfo: (state, action) => {
      state.routeInfo = action.payload
    },
    clearRouteInfo: (state) => {
      state.routeInfo = {}
    }
  },
})

export const { actions } = slice

export default slice.reducer