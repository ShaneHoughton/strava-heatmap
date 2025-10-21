import fs from "fs";
import { getAllActivitiesYearFromToday as getDaysWithActivities } from "./get-athlete-activities.js";
import { MONTHS } from "../constants/index.js";

const X_OFFSET = 50;
const Y_OFFSET = 50;
const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const SQUARE_SIZE = 20;
const SPACING = 5;
const SQUARES_PER_COLUMN = 7;
const MOST_KUDOS = 30;

const BACKGROUND_COLOR = "#0D1117";


const getMonthFromDate = (date) => {
  // make tz configurable based on activity timezone
  const monthIndex = new Date(date + "T00:00:00-05:00").getMonth(); // Adjust for Eastern Time
  return MONTHS[monthIndex];
};
const getDayOfWeekFromDate = (date) => {
  const easternDate = new Date(
    new Date(date).toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  return easternDate.getDay() + 1;
};

const calculateColumn = (index) => {
  return Math.floor(index / SQUARES_PER_COLUMN) + 2;
};

const calculateRow = (index) => {
  return index % SQUARES_PER_COLUMN;
};
async function createSVGFromArray(activities) {
  let svgContent = "";
  let currentMonth = getMonthFromDate(activities[0].date);
  let rowIndex = getDayOfWeekFromDate(activities[0].date);

  activities.forEach((_item, index) => {
    const dayActivities = (_item.activities || []).sort(
      (a, b) => b.kudos_count - a.kudos_count
    );
    const mostKudoedActivity = dayActivities[0] || { kudos_count: 0 }; // fix

    const column =
      calculateColumn(index + getDayOfWeekFromDate(activities[0].date)) + 2;
    const row = calculateRow(index + getDayOfWeekFromDate(activities[0].date));

    const x = column * (SQUARE_SIZE + SPACING);
    const y = row * (SQUARE_SIZE + SPACING) + Y_OFFSET;

    const activityMonth = getMonthFromDate(_item.date);

    if (activityMonth !== currentMonth) {
      currentMonth = activityMonth;
      console.log("Current month changed:", currentMonth);

      const column = Math.floor(index / SQUARES_PER_COLUMN) + 2;
      const x =
        column * (SQUARE_SIZE + SPACING) +
        X_OFFSET +
        SQUARE_SIZE +
        1.5 * SPACING;
      const y = Y_OFFSET - 18; // position above the column

      svgContent += `
      <text x="${x}" y="${y}" font-size="22" fill="#fc4c02" text-anchor="start" font-family="${FONT_FAMILY}">
        ${currentMonth}
      </text>
      `;
    }
    if (getDayOfWeekFromDate(_item.date) === 6) {
      console.log(_item.date);
      rowIndex = 0; // reset rowIndex to start at the top of the next column
    }

    // opacity is based on the number of activities
    // const opacity =
    //   _item.activities.length === 0
    //     ? 1
    //     : Math.min(_item.activities.length / 3, 1);

    //opacity is based on the kudos of the most kudoed activity
    const opacity = isNaN(
      Math.min(mostKudoedActivity.kudos_count / MOST_KUDOS, 1)
    )
      ? 0
      : Math.min(mostKudoedActivity.kudos_count / MOST_KUDOS, 1);

    const squareColor = _item.activities.length === 0 ? "#141C24" : "#fc4c02";
    const borderColor = _item.activities.length === 0 ? "#3C4752" : squareColor;
    const borderOpacity = Math.min(opacity + 0.2, 1);
    svgContent += `
      <rect x="${x + 1}" y="${y + 1}" width="${SQUARE_SIZE - 2}" height="${
      SQUARE_SIZE - 2
    }" fill="${squareColor}" fill-opacity="${opacity}" rx="3" ry="3" stroke="${borderColor}" stroke-width="2" stroke-opacity="${borderOpacity}">
      <title>${_item.date}</title>
      </rect>
    `;
  });

  svgContent += `
      <text x="${X_OFFSET}" y="${
    SQUARE_SIZE + SPACING + 68
  }" font-size="22" fill="#fc4c02" text-anchor="start" font-family="${FONT_FAMILY}">
        Mon
      </text>
      <text x="${X_OFFSET}" y="${
    3 * (SQUARE_SIZE + SPACING) + 68
  }" font-size="22" fill="#fc4c02" text-anchor="start" font-family="${FONT_FAMILY}">
        Wed
      </text>
      <text x="${X_OFFSET}" y="${
    5 * (SQUARE_SIZE + SPACING) + 68
  }" font-size="22" fill="#fc4c02" text-anchor="start" font-family="${FONT_FAMILY}">
        Fri
      </text>
      `;

  const columns = Math.ceil(activities.length / SQUARES_PER_COLUMN);
  const width = (columns + 3) * (SQUARE_SIZE + SPACING) + 100;
  const height = SQUARES_PER_COLUMN * (SQUARE_SIZE + SPACING) + 100;

  const legendXStart = width - 5 * (SQUARE_SIZE + SPACING) - 250; // Start 10px from the right edge
  const legendY = height - (SQUARE_SIZE + SPACING) - 10; // Start 10px from the bottom edge

  svgContent += `
      <text x="${legendXStart - 50}" y="${
    legendY + 17
  }" font-size="22" fill="#fc4c02" text-anchor="start" font-family="${FONT_FAMILY}">
        Less
      </text>
     `;

  for (let i = 0; i < 5; i++) {
    const x = legendXStart + i * (SQUARE_SIZE + SPACING);
    const y = legendY;
    svgContent += `
      <rect x="${x}" y="${y}" width="${SQUARE_SIZE}" height="${SQUARE_SIZE}" fill="#fc4c02" opacity="${
      (i + 1) / 5
    }" rx="3" ry="3">
      <title>Legend ${i + 1}</title>
      </rect>
    `;
  }

  svgContent += `
      <text x="${legendXStart + 5 * (SQUARE_SIZE + SPACING)}" y="${
    legendY + 17
  }" font-size="22" fill="#fc4c02" text-anchor="start" font-family="${FONT_FAMILY}">
        More kudos
      </text>
  `;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <clipPath id="rounded-border">
        <rect width="${width}" height="${height}" rx="10" ry="10" />
      </clipPath>
    </defs>
    <g clip-path="url(#rounded-border)">
      <rect width="${width}" height="${height}" fill="none" />
      ${svgContent}
    </g>
  </svg>
`;

  return svg.trim();
}

const activities = await getDaysWithActivities();

const svgString = await createSVGFromArray(activities);

// Save to file
fs.writeFileSync("test.svg", svgString, "utf8");

console.log("SVG file created: test.svg");
