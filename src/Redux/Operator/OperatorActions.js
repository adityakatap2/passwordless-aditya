import {
  CREATE_SUBDOMAIN_REQUEST,
  CREATE_SUBDOMAIN_FAILURE,
  CREATE_SUBDOMAIN_SUCCESS,
} from "./OperatorTypes";

import Axios from "../../Helper/Axios";


export const createSubdomainRequest = () => {
  return {
    type: CREATE_SUBDOMAIN_REQUEST,
  };
};

export const createSubdomainSuccess = (data) => {
  return {
    type: CREATE_SUBDOMAIN_SUCCESS,
    payload: data,
  };
};

export const createSubdomainFailure = (error) => {
  return {
    type: CREATE_SUBDOMAIN_FAILURE,
    payload: error,
  };
};

export const updateOpeartor = (data) => {
  return (dispatch) => {
    dispatch(createSubdomainRequest);
    Axios.post("createSubDomain", data)
      .then((response) => {
        const { subdomain } = response.data;
        dispatch(createSubdomainSuccess(subdomain));
      })
      .catch(() => {
        let errorMsg = error.message;
        if (error?.response?.data?.errorMessage)
          errorMsg = error?.response?.data?.errorMessage;

        dispatch(createSubdomainFailure(errorMsg));
      });
  };
};

