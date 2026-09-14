import React, { useState } from "react";
import { history, TagsInput, EditserSchema } from "../common";
import { envConstants, apiUrls } from "../env.constants";
import { Formik, Form, Field, ErrorMessage } from 'formik';

function doLogout(func) {
    typeof func === "function" && func();
    history.push("/");
}

function showPreference(func) {
    history.push("/home");
    typeof func === "function" && func(false);
}

export function ProfileContainer(props) {
    const { authData, setLogout, tags, setLoginData } = props;
    const [isProfileUpdate, setisProfileUpdate] = useState(false);
    if (!authData) return;
    return (
        <div className="w3-card w3-margin">
            <div className="w3-container w3-padding" style={{ backgroundColor: '#f1f1f1' }}>
                <h4>Profile Information</h4>
                <span className="w3-tag" onClick={() => showPreference(setisProfileUpdate)} style={{ cursor: 'pointer' }}>My Preferences</span>
                &nbsp;&nbsp;
                <span onClick={() => setisProfileUpdate(true)} className="w3-tag" style={{ cursor: 'pointer' }}>Edit Profile</span>
                &nbsp;&nbsp;
                <span className="w3-tag" onClick={() => doLogout(setLogout)} style={{ cursor: 'pointer' }}>Logout</span>
            </div>
            <div className="w3-container w3-white">
                {!isProfileUpdate ? (
                    <React.Fragment>
                        <p><b>Name:&nbsp;</b>{authData.name}</p>
                        <p><b>Email:&nbsp;</b>{authData.email}</p>
                        <p>
                            <b>Tags:&nbsp;</b>{authData.tags.map((tag, index) => <span key={index} style={{ marginRight: '3px' }} className="w3-tag w3-light-grey w3-small w3-margin-bottom">
                                {tag}
                            </span>)}
                        </p>
                    </React.Fragment>

                ) : (<React.Fragment>
                    <EditProfile tags={tags} authData={authData} setisProfileUpdate={setisProfileUpdate} setLoginData={setLoginData} />
                    <button onClick={() => setisProfileUpdate(false)} className="w3-btn w3-black" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                        Cancel
                    </button>
                </React.Fragment>)}
            </div>
        </div >
    )
}


//For formating the tags.
function formatEditProfileTag(tags) {
    return tags.map(tag => ({
        value: tag,
        label: tag
    }))
}


function EditProfile(props) {
    const { tags, name, email, id } = props.authData;
    const { setisProfileUpdate, setLoginData } = props;
    function handleSubmit(values, formikApi) {
        const Edit_User_Url = `${envConstants.BASE_URL}${apiUrls.EDIT_USER}`;
        const formValues = {
            id: id,
            ...values,
            tags: values.tags.map(tag => tag.value)
        }
        fetch(Edit_User_Url, {
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
                throw new Error('Something went wrong !');
            }
        }).then(response => {
            formikApi.setSubmitting(false);
            setLoginData(response.user);
            showPreference(setisProfileUpdate);
        }).catch(err => {
            formikApi.setErrors({
                email: 'Something went wrong email must be unique!',
                password: 'Something went wrong !',
                tags: 'Something went wrong !',
                name: 'Something went wrong !'
            })
            formikApi.setSubmitting(false);
        })
    }

    return (
        <Formik initialValues={{
            name: name || '',
            email: email || '',
            tags: formatEditProfileTag(tags) || [],
            password: ''
        }} validationSchema={EditserSchema} onSubmit={handleSubmit}>
            {({ errors, isSubmitting, touched }) => (<Form>
                <label ><b>Name:</b></label>
                <Field className="w3-input w3-border" name="name" type="text" />
                {errors.name && touched.name && <div className="error">{errors.name}</div>}
                <label ><b>Email:</b></label>
                <Field className="w3-input w3-border" name="email" type="text" />
                {errors.email && touched.email && <div className="error">{errors.email}</div>}
                <label ><b>Tags:</b></label>
                <Field name="tags" render={(formikprops) => <TagsInput {...formikprops} selectedOption={formatEditProfileTag(tags)} options={props.tags} />} />
                <ErrorMessage name="tags" className="error" component="div" />
                <label ><b>Password:</b></label>
                <Field className="w3-input w3-border" name="password" type="password" />
                {errors.password && touched.password && <div className="error">{errors.password}</div>}
                <button disabled={isSubmitting} type="submit" className="w3-btn w3-black" style={{ marginTop: '1rem', marginBottom: '1rem' }}>{isSubmitting ? "Submit ..." : "Submit"}</button>
            </Form>)}
        </Formik>
    )
}