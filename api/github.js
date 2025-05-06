export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ message: "Hello" });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Add this to Vercel env vars
  const REPO_API_URL = process.env.REPO_API_URL; // Add this to Vercel env vars
  const REF = "main"; // branch to run the workflow on

  const response = await fetch(REPO_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ref: REF,
    }),
  });

  console.log(response)

  if (response.ok) {
    res.status(200).json({ message: "Workflow triggered successfully" });
  } else {
    const error = await response.json();
    res
      .status(response.status)
      .json({ message: "Failed to trigger workflow", error });
  }
}
