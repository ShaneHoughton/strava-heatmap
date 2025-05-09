import fs from "fs";
import { getAllActivitiesYearFromToday } from "./get-athlete-activities.js";
import { MONTHS } from "../constants/index.js";

const getMonthFromDate = (date) => {
  const monthIndex = parseInt(date.split("-")[1]) - 1;
  return MONTHS[monthIndex];
};
async function createSVGFromArray(activities) {
  const squareSize = 20;
  const spacing = 5;
  const squaresPerColumn = 7;

  let svgContent = "";
  let currentMonth = getMonthFromDate(activities[0].date);
  console.log("Current month index:", currentMonth);
  activities.forEach((_item, index) => {
    const column = Math.floor(index / squaresPerColumn) + 2;
    const row = index % squaresPerColumn;

    const x = column * (squareSize + spacing);
    const y = row * (squareSize + spacing) + 30;

    const activityMonth = getMonthFromDate(_item.date);

    if (activityMonth !== currentMonth || index === 0) {
      currentMonth = activityMonth;
      console.log("Current month changed:", currentMonth);

      const column = Math.floor(index / squaresPerColumn) + 2;
      const x = column * (squareSize + spacing) + 1;
      const y = 18; // position above the column

      svgContent += `
      <text x="${x}" y="${y}" font-size="22" fill="white" text-anchor="start" font-family="Open Sans">
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

  const firstCol = -1;

  svgContent += `
      <text x="${firstCol}" y="${
    squareSize + spacing + 45
  }" font-size="22" fill="white" text-anchor="start" font-family="Open Sans">
        Mon
      </text>
      <text x="${firstCol}" y="${
    3 * (squareSize + spacing) + 45
  }" font-size="22" fill="white" text-anchor="start" font-family="Open Sans">
        Wed
      </text>
      <text x="${firstCol}" y="${
    5 * (squareSize + spacing) + 45
  }" font-size="22" fill="white" text-anchor="start" font-family="Open Sans">
        Fri
      </text>
      `;

  const columns = Math.ceil(activities.length / squaresPerColumn);
  const width = (columns + 3) * (squareSize + spacing);
  const height = squaresPerColumn * (squareSize + spacing) + 100;

  const legendXStart = width - (5 * (squareSize + spacing)) - 250; // Start 10px from the right edge
  const legendY = height - (squareSize + spacing) - 10; // Start 10px from the bottom edge

   svgContent += `
      <text x="${legendXStart - 50}" y="${
     legendY + 17
   }" font-size="22" fill="white" text-anchor="start" font-family="Open Sans">
        Less
      </text>
     `;

  svgContent += `
      <text x="${legendXStart - 50}" y="${
    legendY + 17
  }" font-size="22" fill="white" text-anchor="start" font-family="Open Sans">
        Less
      </text>
  `;

  for (let i = 0; i < 5; i++) {
    const x = legendXStart + i * (squareSize + spacing);
    const y = legendY;
    svgContent += `
      <rect x="${x}" y="${y}" width="${squareSize}" height="${squareSize}" fill="#fc4c02" opacity="${(i + 1) / 5}" rx="3" ry="3">
      <title>Legend ${i + 1}</title>
      </rect>
    `;
  }

  svgContent += `
      <text x="${legendXStart + 5 * (squareSize + spacing)}" y="${
    legendY + 17
  }" font-size="22" fill="white" text-anchor="start" font-family="Open Sans">
        More activities
      </text>
  `;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" style="background-color: #1e1e1e;">
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
