import React, { useState } from 'react';
import { AppRoutes, history, ProfileContainer } from "./common"
import { Header, Tags, PopularPost, AuthForm, Footer } from "./common"
import { Router, Route } from 'react-router-dom';
import { connect } from "react-redux";

const mapDispatchToProps = (dispatch) => {
  return {
    setLoginData: (payload) => {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload
      })
    },
    setLogout: () => {
      dispatch({ type: 'LOGOUT_SUCCESS' })
    }
  }
}

function mapStateToProps(state) {
  return ({ authData: state.authData })
}

export const App = connect(mapStateToProps, mapDispatchToProps)(function (props) {
  const { authData, setLoginData, setLogout } = props;
  const [tags, setTags] = useState([]);
  const profileProps = { setLoginData, authData, tags, setLogout };
  return (
    <Router history={history}>
      <div className="w3-content" style={{ maxWidth: "1400px" }}>
        <Route render={() => <Header authData={authData} />} />
        <div className="w3-row">
          <div className="w3-col l8 s12">
            <AppRoutes authData={authData} />
          </div>
          <div className="w3-col l4">
            {authData ? <ProfileContainer {...profileProps} /> : <AuthForm tags={tags} setLoginData={setLoginData} />}
            <Tags setListTags={setTags} />
            <PopularPost />
          </div>
        </div>
      </div>
      <Footer />
    </Router>

  );
})

export default App;
