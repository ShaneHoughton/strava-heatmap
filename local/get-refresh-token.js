import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
// export const getRefreshToken = async () => {
//   const response = await axios.post(
//     "https://www.strava.com/oauth/token",
//     null,
//     {
//       params: {
//         code: process.env.STRAVA_AUTH_CODE,
//         client_id: process.env.STRAVA_ID,
//         client_secret: process.env.STRAVA_SECRET,
//         grant_type: "authorization_code",
//       },
//     }
//   );

//   return response.data;
// }


export const getRefreshToken = async () => {
  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.STRAVA_ID,
      client_secret: process.env.STRAVA_SECRET,
      refresh_token: process.env.STRAVA_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
};
result = await getRefreshToken();

console.log("Refresh token:", result);