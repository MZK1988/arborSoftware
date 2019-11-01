import React from 'react';
import { Link } from 'react-router-dom';

//This will get called in the event that the user has a profile and would like to edit th eprofile in the Dashboard
const DashboardActions = () => {
  return (
    <div class="dash-buttons">
      <Link to="/edit-profile" class="btn btn-light">
        <i class="fas fa-user-circle text-primary"></i> Edit Profile
      </Link>
      <Link to="/add-experience" class="btn btn-light">
        <i class="fab fa-black-tie text-primary"></i> Add Experience
      </Link>
      <Link to="/add-education" class="btn btn-light">
        <i class="fas fa-graduation-cap text-primary"></i> Add Education
      </Link>
    </div>
  );
};

export default DashboardActions;
