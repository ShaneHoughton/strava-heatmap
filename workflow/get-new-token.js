import dotenv from "dotenv";

dotenv.config();

export const getNewToken = async () => {
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

  if (!response.ok) {
    throw new Error("Failed to fetch new token");
  }

  const data = await response.json();
  return data;
};
