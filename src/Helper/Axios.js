import axios from "axios"

export default axios.create({
    baseURL: `https://home.passwordless.com.au:3115/webauth/`
  });