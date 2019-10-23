import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';

//This is the state of the register component, which just looks like a small data model
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  //This destructures the formData object/data model state
  const { email, password } = formData;
  //The elipses below copies formData into the setFormData function
  //Change the state of the form data based on the key of the "name attribute" in the html and the value designation in JSX that I put in html as well
  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  //this grabs from the formData state
  const onSubmit = async e => {
    e.preventDefault();
    console.log('SUCCESS');
  };

  return (
    <Fragment>
      <h1 className="large text-primary">Sign In</h1>
      <p className="lead">
        <i className="fas fa-user"></i> Sign Into Your Account
      </p>
      <form className="form" onSubmit={e => onSubmit(e)}>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={email}
            onChange={e => onChange(e)}
            required
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
            required
            minLength="6"
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Login" />
      </form>
      <p className="my-1">
        Don't have an account? <Link to="/register">Sign Up</Link>
      </p>
    </Fragment>
  );
};

export default Login;
