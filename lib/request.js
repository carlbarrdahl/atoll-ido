import config from "../config";

export const request = (path, data) => {
  console.log("http request to", path, data);
  return fetch(config.apiURL + path, data)
    .then((res) => res.json())
    .catch((err) => {
      console.log(err);
      throw new Error(err);
    });
};
