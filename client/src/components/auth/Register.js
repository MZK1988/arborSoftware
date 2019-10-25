import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
//using Actions =>become available as props
import { setAlert } from '../../actions/alert';
import { register } from '../../actions/auth';
import PropTypes from 'prop-types';

//This is the state of the register component, which just looks like a small data model
//Destructuring setAlert actin from props
const Register = ({ setAlert, register, isAuthenticated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });

  const { name, email, password, password2 } = formData;
  //the elipses copies formData into the setFormData function
  //telling to change the state of the form data based on the key of the "name attribute" in the html and the value designation in JSX that I put in html as well
  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  //this grabs from the formData state
  const onSubmit = async e => {
    e.preventDefault();
    if (password !== password2) {
      //This gets passed in as a msg to actions/alert
      setAlert('Passwords do not match', 'danger');
    } else {
      register({ name, email, password });
      //   const newUser = {
      //     name,
      //     email,
      //     password
      //   };
      //   //This try/catch takes the newUser object from above and and sends it to the backend/user.js API route, data that we get back should be the token
      //   try {
      //     const config = {
      //       headers: {
      //         'Content-Type': 'Application/json'
      //       }
      //     };
      //     const body = JSON.stringify(newUser);
      //     const res = await axios.post('/api/users', body, config);
      //     console.log(res.data);
      //   } catch (err) {
      //     console.error(err.response.data);
      //   }
    }
  };

  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }
  return (
    <Fragment>
      <h1 className="large text-primary">Sign Up</h1>
      <p className="lead">
        <i className="fas fa-user"></i> Create Your Account
      </p>
      <form className="form" onSubmit={e => onSubmit(e)}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={name}
            onChange={e => onChange(e)}
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={email}
            onChange={e => onChange(e)}
          />
          <small className="form-text">
            This site uses Gravatar so if you want a profile image, use a
            Gravatar email
          </small>
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={e => onChange(e)}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            name="password2"
            value={password2}
            onChange={e => onChange(e)}
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Register" />
      </form>
      <p className="my-1">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </Fragment>
  );
};

Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool
};
const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});
//connecting to Actions
export default connect(
  mapStateToProps,
  { setAlert, register }
)(Register);
