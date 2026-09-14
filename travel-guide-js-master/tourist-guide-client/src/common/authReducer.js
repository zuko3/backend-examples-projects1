const initState = { authData: null }
export const authReducer = (state = initState, action) => {
    if (action.type === 'LOGIN_SUCCESS') {
        return ({
            ...state,
            authData: action.payload
        })
    } else if (action.type === 'LOGOUT_SUCCESS') {
        return ({
            ...state,
            authData: null
        })
    } else {
        return state;
    }
}