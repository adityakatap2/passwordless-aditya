import { nanoid } from "nanoid";
import Axios from "./Axios";

export function getOS() {
  var userAgent = window.navigator.userAgent,
    platform = window.navigator.platform,
    macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"],
    windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"],
    iosPlatforms = ["iPhone", "iPad", "iPod"],
    os = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = "Mac OS";
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = "iOS";
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = "Windows";
  } else if (/Android/.test(userAgent)) {
    os = "Android";
  } else if (!os && /Linux/.test(platform)) {
    os = "Linux";
  }

  return os;
}

export const sendMail = async (data) => {
  try {
    const response = await Axios.post("sendMail", data);
    return response.data;
  } catch (error) {
    let errorMsg = error.message;
    if (error?.response?.data?.errorMessage)
      errorMsg = error?.response?.data?.errorMessage;

    throw new Error(errorMsg);
  }
};

export const generateQRCode = async (data) => {
  try {
    const response = await Axios.post("generateQrCode", data);

    return response.data;
  } catch (error) {
    let errorMsg = error.message;
    if (error?.response?.data?.errorMessage)
      errorMsg = error?.response?.data?.errorMessage;

    throw new Error(errorMsg);
  }
};

export const getLocation = () => {
  if (!navigator.geolocation)
    throw new Error("Geolocation is not supported by your browser");

  function success(pos) {
    const crd = pos.coords;

    return crd;
  }

  function error(err) {
    throw new Error(err.message);
  }

  navigator.geolocation.getCurrentPosition(success, error, {
    enableHighAccuracy: true,
  });
};
