import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email')
        .required('Required'),
    password: Yup.string()
        .min(6, 'Too Short!')
        .max(30, 'Too Long!')
        .required('Required'),
});

export const addUserSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    password: Yup.string()
        .min(6, 'Password is too short - should be 6 chars minimum.')
        .matches(/[a-zA-Z]/, 'Password can only contain Latin letters.')
        .required('Required'),
    tags: Yup.array().min(1, 'Required'),
    email: Yup.string().email().required('Required')
})


export const EditserSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    password: Yup.string()
        .min(6, 'Password is too short - should be 6 chars minimum.')
        .matches(/[a-zA-Z]/, 'Password can only contain Latin letters.'),
    tags: Yup.array().min(1, 'Required'),
    email: Yup.string().email().required('Required')
})