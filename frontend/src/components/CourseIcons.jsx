// CourseIcons.jsx
import React from "react";

const CourseIcons = {
  MATHEMATICS: "📐",
  SCIENCE: "🔬",
  LANGUAGE: "📖",
  ARTS: "🎨",
  TECHNOLOGY: "💻",
  BUSINESS: "📊",
  HISTORY: "🏺",
  LITERATURE: "📚",
  PHYSICS: "⚛️",
  CHEMISTRY: "🧪",
  BIOLOGY: "🌱",
};

// Optional: A utility function to get the icon
export const getCourseIcon = (category) => {
  return CourseIcons[category?.toUpperCase()] || "🎓"; // Default icon
};

export default CourseIcons;
