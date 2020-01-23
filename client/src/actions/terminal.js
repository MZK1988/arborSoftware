import axios from "axios";
import { setAlert } from "./alert";

import {
  GET_TAT,
  TAT_ERROR,
  GET_DEPARTMENTLIST,
  DEPARTMENTLIST_ERROR
} from "./types";

export const getTAT = () => async dispatch => {
  try {
    const res = await axios.get("api/copiaDb/terminal/tatDateSort");

    dispatch({
      type: GET_TAT,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: TAT_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

export const getDepartmentList = () => async dispatch => {
  try {
    const res = await axios.get("api/copiaDb/terminal/listDepartments");

    dispatch({
      type: GET_DEPARTMENTLIST,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: DEPARTMENTLIST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};
