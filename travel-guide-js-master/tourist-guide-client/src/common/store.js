import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { authReducer } from './authReducer';

const middlewares = [thunkMiddleware];

export const store = createStore(authReducer, applyMiddleware(...middlewares));