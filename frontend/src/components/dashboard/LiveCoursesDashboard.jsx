// LiveCoursesDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "../../axiosConfig";
import { Pagination, TextField, MenuItem } from "@mui/material";
import {
  School,
  Group as GroupIcon,
  Person,
  Timer,
  AttachMoney,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  DoneAll,
  HelpOutline,
  AdminPanelSettings,
  SupervisorAccount,
  AccountCircle,
} from "@mui/icons-material";
import CourseIcons, { getCourseIcon } from "../CourseIcons";

// Status colors & icons
const statusStyles = {
  OPEN_FOR_JOINING: {
    bg: "bg-green-100",
    text: "text-green-700",
    icon: <CheckCircle fontSize="small" />,
  },
  WAITING_FOR_CONFIRMATION: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    icon: <HourglassEmpty fontSize="small" />,
  },
  COMPLETED: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: <DoneAll fontSize="small" />,
  },
  CANCELLED: {
    bg: "bg-red-100",
    text: "text-red-700",
    icon: <Cancel fontSize="small" />,
  },
  SCHEDULED: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    icon: <HelpOutline fontSize="small" />,
  },
};

// Creator role icons
const roleIcons = {
  ADMIN: <AdminPanelSettings className="text-purple-600" />,
  INSTRUCTOR: <SupervisorAccount className="text-blue-600" />,
  STUDENT: <Person className="text-green-600" />,
};

// Course type icons
const typeIcons = {
  INDIVIDUAL: <Person fontSize="small" className="text-gray-600" />,
  GROUP: <GroupIcon fontSize="small" className="text-gray-600" />,
};

const LiveCoursesDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, type, category]);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/courses/my-related-courses", {
        params: {
          page,
          size: 5
        },
      });
      const data = res.data;
      setCourses(data.courses || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleActionClick = (course, action) => {
    if (action === "Join/Accept") {
      axios
        .post(`/courses/${course.courseId}/join`)
        .then((res) => {
          alert(res.data || "You have successfully joined the course.");
          window.location.reload(); // Reload the page
        })
        .catch((err) => {
          alert(err.response?.data || "An error occurred while trying to join the course.");
        });
    } else if (action === "Cancel") {
      axios
        .delete(`/courses/${course.courseId}/cancel`)
        .then((res) => {
          alert(res.data || "You have successfully left the course.");
          window.location.reload(); // Reload the page
        })
        .catch((err) => {
          alert(err.response?.data || "An error occurred while trying to cancel your enrollment.");
        });
    } else {
      console.error("Unknown action:", action);
    }
  };  

  // Filter by title, type, category (client-side)
  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = type ? c.courseType === type : true;
    const matchesCategory = category
      ? c.category === category.toUpperCase()
      : true;
    return matchesSearch && matchesType && matchesCategory;
  });

  // Helper to render status with color + icon
  const renderStatusChip = (status) => {
    const style = statusStyles[status] || {
      bg: "bg-gray-100",
      text: "text-gray-700",
      icon: <HelpOutline fontSize="small" />,
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold ${style.bg} ${style.text}`}
      >
        {style.icon}
        <span className="ml-1">{status}</span>
      </span>
    );
  };

  // Helper to render creator's role icon
  const renderCreator = (creator) => {
    if (!creator) return <span className="text-gray-500">Unknown</span>;
    const roleIcon = roleIcons[creator.userRole] || <AccountCircle />;
    return (
      <div className="inline-flex items-center space-x-1">
        {roleIcon}
        <span>{creator.fullName}</span>
      </div>
    );
  };

  // Helper to render course type with an icon
  const renderType = (courseType) => {
    const icon = typeIcons[courseType] || <HelpOutline fontSize="small" />;
    return (
      <div className="inline-flex items-center space-x-1">
        {icon}
        <span>{courseType}</span>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gradient-to-b from-white to-blue-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6">
        Live Courses
      </h1>

      {loading && <p className="text-blue-600 mb-4">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          className="flex-grow"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <TextField
          select
          label="Type"
          variant="outlined"
          size="small"
          className="w-48"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="INDIVIDUAL">Individual</MenuItem>
          <MenuItem value="GROUP">Group</MenuItem>
        </TextField>
        <TextField
          select
          label="Category"
          variant="outlined"
          size="small"
          className="w-48"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {Object.keys(CourseIcons).map((cat) => (
            <MenuItem key={cat} value={cat}>
              {getCourseIcon(cat)} {cat}
            </MenuItem>
          ))}
        </TextField>
      </div>

      {/* Courses Table */}
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full bg-white rounded-lg">
          <thead>
            <tr className="bg-blue-700 text-white text-sm uppercase tracking-wider">
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Date & Time</th>
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-left">
                <span className="block">Course Status</span>
                <span className="block">Student Status</span>
              </th>
              <th className="px-6 py-3 text-left">Creator</th>
              <th className="px-6 py-3 text-left">Max Students</th>
              <th className="px-6 py-3 text-left">Duration (mins)</th>
              <th className="px-6 py-3 text-left">Cost (RM)</th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filtered.map((course, idx) => {
              const isCourseFull = course.studentCourses.length >= course.maxStudents;

              const isStudentEnrolled = course.studentCourses.some(
                (sc) => sc.studentId === course.currentUserId // Replace `currentUserId` with actual logged-in user ID
              );
              const isCourseCompleted = course.courseStatus === "COMPLETED";
              const isCourseExpired = new Date(course.dateTime) < new Date();

              return (
                <tr
                  key={course.courseId}
                  className={`transition hover:bg-gray-50 ${
                    idx % 2 === 0 ? "bg-gray-100/50" : ""
                  }`}
                >
                  {/* Course Title */}
                  <td className="px-6 py-4 flex items-center space-x-2">
                    {getCourseIcon(course.category)}
                    <span className="font-medium">{course.title}</span>
                  </td>

                  {/* Date & Time */}
                  <td className="px-6 py-4">
                    {new Date(course.dateTime).toLocaleString("en-GB", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>

                  {/* Course Type */}
                  <td className="px-6 py-4">{renderType(course.courseType)}</td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center space-x-1">
                      {getCourseIcon(course.category)}
                      <span>{course.category}</span>
                    </div>
                  </td>

                 {/* Status */}
                  <td className="px-6 py-4">
                    {/* Render course status once */}
                    <div className="mb-2">{renderStatusChip(course.courseStatus)}</div>

                    {course.studentCourses.length > 0 ? (
                      // Render individual student statuses
                      course.studentCourses.map((sc, i) => (
                        <div key={i} className="mb-1">
                          {renderStatusChip(sc.status)}
                        </div>
                      ))
                    ) : (
                      // Fallback if no students
                      <span className="text-gray-500 italic">No students</span>
                    )}
                  </td>

                  {/* Creator */}
                  <td className="px-6 py-4">{renderCreator(course.creator)}</td>

                  {/* Max Students */}
                  <td className="px-6 py-4">{course.maxStudents || 0}</td>

                  {/* Duration */}
                  <td className="px-6 py-4">{course.duration || 0}</td>

                  {/* Cost */}
                  <td className="px-6 py-4">{course.cost?.toFixed(2) ?? "0.00"}</td>

                  {/* Action */}
                  <td className="px-6 py-4">
                    {(() => {
                      if (isCourseCompleted || isCourseExpired) {
                        return (
                          <button
                            className="px-3 py-1 bg-gray-400 text-white rounded-md cursor-not-allowed text-sm"
                            disabled
                          >
                            Unavailable
                          </button>
                        );
                      }

                      if (isStudentEnrolled) {
                        return (
                          <button
                            className="px-3 py-1 bg-red-700 text-white rounded-md hover:bg-red-800 transition text-sm"
                            onClick={() => handleActionClick(course, "Cancel")}
                          >
                            Cancel
                          </button>
                        );
                      }

                      if (!isCourseFull) {
                        return (
                          <button
                            className="px-3 py-1 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition text-sm"
                            onClick={() => handleActionClick(course, "Join/Accept")}
                          >
                            Join/Accept
                          </button>
                        );
                      }

                      return (
                        <button
                          className="px-3 py-1 bg-gray-400 text-white rounded-md cursor-not-allowed text-sm"
                          disabled
                        >
                          Full
                        </button>
                      );
                    })()}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan="10" className="text-center py-4 text-gray-500">
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-end">
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </div>
    </div>
  );
};

export default LiveCoursesDashboard;
