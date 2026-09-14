import React, { useState } from "react";
import { loginSchema, addUserSchema, history, TagsInput } from "../common"
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { envConstants, apiUrls } from "../env.constants";

export function AuthForm(props) {
    const [login, setLogin] = useState(true);
    const [isSignUpSucess, setSignUpSucess] = useState(false);
    const { setLoginData, tags } = props;

    function resetForm() {
        setLogin(!login);
        setSignUpSucess(false);
    }

    return (
        <div className="w3-card w3-margin">
            <div className="w3-container w3-padding" style={{ backgroundColor: '#f1f1f1' }}>
                <h4>{login ? "Login" : "Register"}</h4>
            </div>
            <div className="w3-container w3-white" style={{ padding: '1rem' }}>
                {isSignUpSucess && (
                    <div className="w3-panel w3-green">
                        <h3>Success!</h3>
                        <p>Signup sucess now you can login </p>
                    </div>
                )}
                {login ? <Login setLoginData={setLoginData} /> : <Register setLogin={setLogin} setSignUpSucess={setSignUpSucess} tags={tags} />}
                <span style={{ cursor: 'pointer' }} onClick={resetForm}>
                    <u>{login ? "Register" : "Login"}</u>
                </span>
            </div>
        </div>
    )
}


function Login(props) {
    const { setLoginData } = props;
    function handleSubmit(values, formikApi) {
        const loginUrl = `${envConstants.BASE_URL}${apiUrls.LOGIN}`;
        fetch(loginUrl, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(values)
        }).then(res => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error('Something went wrong');
            }
        }).then(response => {
            formikApi.setSubmitting(false);
            setLoginData(response)
            history.push("/home")
        }).catch(err => {
            formikApi.setSubmitting(false);
            formikApi.setErrors({
                email: 'Invalid email',
                password: 'Invalid password'
            })
        })
    }
    return (
        <Formik initialValues={{
            email: '',
            password: ''
        }} validationSchema={loginSchema} onSubmit={handleSubmit}>
            {({ errors, isSubmitting, touched }) => (<Form>
                <label ><b>Email:</b></label>
                <Field className="w3-input w3-border" name="email" type="text" />
                {errors.email && touched.email && <div className="error">{errors.email}</div>}
                <label ><b>Password:</b></label>
                <Field className="w3-input w3-border" name="password" type="password" />
                {errors.password && touched.password && <div className="error">{errors.password}</div>}
                <button disabled={isSubmitting} type="submit" className="w3-btn w3-black" style={{ marginTop: '1rem', marginBottom: '1rem' }}>{isSubmitting ? "Login ..." : "Login"}</button>
            </Form>)}
        </Formik>
    )
}



function Register(props) {
    const { setSignUpSucess, setLogin } = props;
    function handleSubmit(values, formikApi) {
        const Add_User_Url = `${envConstants.BASE_URL}${apiUrls.ADD_USER}`;
        const formValues = {
            ...values,
            tags: values.tags.map(tag => tag.value)
        }
        fetch(Add_User_Url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(formValues)
        }).then(res => {
            if (res.ok) {
                return res.json();
            } else {
                if (res.status == 422) {
                    formikApi.setErrors({ email: 'Email already exists' })
                } else {
                    formikApi.setErrors({
                        email: 'Something went wrong !',
                        password: 'Something went wrong !',
                        tags: 'Something went wrong !',
                        name: 'Something went wrong !'
                    })
                }
                throw new Error('Something went wrong !');
            }
        }).then(response => {
            formikApi.setSubmitting(false);
            setSignUpSucess(true);
            setLogin(true);
        }).catch(err => {
            formikApi.setSubmitting(false);

        })
    }

    return (
        <Formik initialValues={{
            name: '',
            email: '',
            tags: [],
            password: ''
        }} validationSchema={addUserSchema} onSubmit={handleSubmit}>
            {({ errors, isSubmitting, touched }) => (<Form>
                <label ><b>Name:</b></label>
                <Field className="w3-input w3-border" name="name" type="text" />
                {errors.name && touched.name && <div className="error">{errors.name}</div>}
                <label ><b>Email:</b></label>
                <Field className="w3-input w3-border" name="email" type="text" />
                {errors.email && touched.email && <div className="error">{errors.email}</div>}
                <label ><b>Tags:</b></label>
                <Field name="tags" render={(formikprops) => <TagsInput {...formikprops} options={props.tags} />} />
                <ErrorMessage name="tags" className="error" component="div" />
                <label ><b>Password:</b></label>
                <Field className="w3-input w3-border" name="password" type="password" />
                {errors.password && touched.password && <div className="error">{errors.password}</div>}
                <button disabled={isSubmitting} type="submit" className="w3-btn w3-black" style={{ marginTop: '1rem', marginBottom: '1rem' }}>{isSubmitting ? "Register ..." : "Register"}</button>
            </Form>)}
        </Formik>
    )
}