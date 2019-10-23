import { SET_ALERT, REMOVE_ALERT } from '../actions/types';

const initialState = [];

export default function(state = initialState, action) {
  //destructering,pulling out type and payload from alert action that was exported from actions/alert.js
  const { type, payload } = action;
  //takes the type of action that was transmitted from the action, in the case of SET_ALERT, return state and payload
  switch (type) {
    case SET_ALERT:
      return [...state, payload];
    case REMOVE_ALERT:
      //return everything but the payload with the correct id to state
      return state.filter(alert => alert.id !== payload);
    default:
      return state;
  }
}
