import {
  CREATE_SUBDOMAIN_FAILURE,
  CREATE_SUBDOMAIN_SUCCESS,
  CREATE_SUBDOMAIN_REQUEST,
} from "./OperatorTypes";

const initialState = {
  loading: false,
  subdomain: "",
  error: "",
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_SUBDOMAIN_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case CREATE_SUBDOMAIN_SUCCESS:
      return {
        loading: false,
        subdomain: action.payload,
        error: "",
      };
    case CREATE_SUBDOMAIN_FAILURE:
      return {
        loading: false,
        subdomain: "",
        error: action.payload,
      };

    default:
      return state;
  }
};


export default reducer;