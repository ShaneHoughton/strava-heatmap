export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ message: "Hello from strava-setup" });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const STRAVA_ID = process.env.STRAVA_ID; // Add this to Vercel env vars
  const STRAVA_SECRET = process.env.STRAVA_SECRET; // Add this to Vercel env vars
  const STRAVA_CALLBACK_URL = process.env.STRAVA_CALLBACK_URL;

  const response = await fetch(
    "https://www.strava.com/api/v3/push_subscriptions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: STRAVA_ID,
        client_secret: STRAVA_SECRET,
        callback_url: STRAVA_CALLBACK_URL,
        verify_token: 'STRAVA',
      }).toString(),
    }
  );

  console.log(response);

  if (response.ok) {
    res.status(200).json({ message: "Subscription submitted sucessfully" });
  } else {
    const error = await response.json();
    res
      .status(response.status)
      .json({ message: "Failed to trigger workflow", error });
  }
}
