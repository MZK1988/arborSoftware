import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

//Ultimatley Output of Register Component in components/auth/register.js
const Alert = ({ alerts }) =>
  alerts !== null &&
  alerts.length > 0 &&
  alerts.map(alert => (
    <div key={alert.id} className={`alert alert-${alert.alertType}`}>
      {alert.msg}
    </div>
  ));

//Officially setting alerts as a prop here
Alert.propTypes = {
  alerts: PropTypes.array.isRequired
};

//This gets the alert state, mapping redux state to the prop in this component
//state.alert gets the "state" from the root reducer-the only reducer as of now is alert located in the index file of the reducer folder and puts it into a prop called "alerts"
const mapStateToProps = state => ({
  alerts: state.alert
});

export default connect(mapStateToProps)(Alert);
