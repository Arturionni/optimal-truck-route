import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

export const reducers = combineReducers({
    form: formReducer,
});