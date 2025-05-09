import fs from "fs";
import { getAllActivitiesYearFromToday } from "./get-athlete-activities.js";
import { MONTHS } from "../constants/index.js";

const getMonthFromDate = (date) => {
  const monthIndex = parseInt(date.split("-")[1]) - 1;
  return MONTHS[monthIndex];
}
async function createSVGFromArray(activities) {
  const squareSize = 20;
  const spacing = 5;
  const squaresPerColumn = 7;

  let svgContent = "";
  let currentMonth = getMonthFromDate(activities[0].date);
  console.log("Current month index:", currentMonth);
  activities.forEach((_item, index) => {
    const column = Math.floor(index / squaresPerColumn);
    const row = index % squaresPerColumn;

    const x = column * (squareSize + spacing);
    const y = row * (squareSize + spacing) + 30;

    const activityMonth = getMonthFromDate(_item.date);
    if (activityMonth !== currentMonth || index === 0) {
      currentMonth = activityMonth;
      console.log("Current month changed:", currentMonth);

      const column = Math.floor(index / squaresPerColumn);
      const x = column * (squareSize + spacing) + 17;
      const y = 15; // position above the column

      svgContent += `
      <text x="${x}" y="${y}" font-size="18" fill="white" text-anchor="middle" font-family="Open Sans">
        ${currentMonth}
      </text>
      `;
    }
    
    const opacity = Math.min(_item.activities.length / 3, 1);
    svgContent += `
      <rect x="${x}" y="${y}" width="${squareSize}" height="${squareSize}" fill="#fc4c02" opacity="${opacity}" rx="3" ry="3">
      <title>${MONTHS[currentMonth]} ${_item.date}</title>
      </rect>
    `;
  });

  const columns = Math.ceil(activities.length / squaresPerColumn);
  const width = columns * (squareSize + spacing);
  const height = squaresPerColumn * (squareSize + spacing) + 100;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      ${svgContent}
    </svg>
  `;

  return svg.trim();
}

const activities = await getAllActivitiesYearFromToday(); // or Array(20).fill(null) for testing

const svgString = await createSVGFromArray(activities);

// Save to file
fs.writeFileSync("test.svg", svgString, "utf8");

console.log("SVG file created: test.svg");
