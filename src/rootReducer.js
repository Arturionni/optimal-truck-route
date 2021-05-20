import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import slice from './slice'

export const reducers = combineReducers({
    form: formReducer,
    main: slice
});