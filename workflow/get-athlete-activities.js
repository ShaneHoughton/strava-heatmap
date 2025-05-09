import { getNewToken } from "./get-new-token.js";
// import activities from "../activities.json" assert { type: "json" };

export const getAllActivitiesYearFromToday = async () => {
  const tokenResult = await getNewToken();
  const { access_token } = tokenResult;
  let activities = [];
  let page = 1;
  const perPage = 200; // Number of activities per page
  let hasMore = true;

  // Calculate the date one year ago from today
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  while (hasMore) {
    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    const data = await response.json();

    // Check if the last activity is older than one year
    if (data.length > 0) {
      const lastActivityDate = new Date(data[data.length - 1].start_date);
      if (lastActivityDate < oneYearAgo) {
        hasMore = false;
      }
    } else {
      hasMore = false; // No more data to fetch
    }

    // Add activities to the list
    activities = activities.concat(data);

    // Increment the page number
    page++;
  }

  // console.log("Activities:", activities);
 
  const yearlyActivities = {};
  for (let i = 0; i < 365; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split("T")[0];
    yearlyActivities[dateString] = [];
  }

  activities.forEach((activity) => {
      const activityDate = new Date(activity.start_date);
      if (activityDate < oneYearAgo) {
        return;
      }
      const activityDateString = activityDate.toISOString().split("T")[0];
      if (yearlyActivities[activityDateString]) {
        yearlyActivities[activityDateString].push(activity);
      }
    });

  const activitiesArr = Object.entries(yearlyActivities)
    .map(([date, activities]) => ({ date, activities }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return activitiesArr;
};

getAllActivitiesYearFromToday();
