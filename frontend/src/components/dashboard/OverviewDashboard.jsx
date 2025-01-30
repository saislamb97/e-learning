import React, { useState, useEffect } from "react";
import axios from "../../axiosConfig";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import {
  CalendarToday,
  School,
  CheckCircle,
  HourglassEmpty,
  ArrowBackIos,
  ArrowForwardIos,
  Group,
  ArrowDropUp,
  ArrowDropDown,
} from "@mui/icons-material";
import { getCourseIcon } from "../CourseIcons";

ChartJS.register(ArcElement, Tooltip, Legend);

const OverviewDashboard = () => {
  const [currentMonth, setCurrentMonth] = useState(0);
  const [currentYear, setCurrentYear] = useState(2025);
  const [monthCourses, setMonthCourses] = useState([]);
  const [courseIndex, setCourseIndex] = useState(0);

  const [pendingRequestsList, setPendingRequestsList] = useState([]);
  const [acceptedRequestsList, setAcceptedRequestsList] = useState([]);
  const [pendingIndex, setPendingIndex] = useState(0);
  const [acceptedIndex, setAcceptedIndex] = useState(0);

  const [overviewSummary, setOverviewSummary] = useState(null);
  const [top5Categories, setTop5Categories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      try {
        const [summaryRes, catsRes] = await Promise.all([
          axios.get("/courses/overview-summary"),
          axios.get("/courses/categories/top-5"),
        ]);
        setOverviewSummary(summaryRes.data);
        setTop5Categories(catsRes.data);
      } catch (err) {
        setError("Error fetching overview data");
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  useEffect(() => {
    const fetchMonthCourses = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/courses/month-courses", {
          params: { year: currentYear, month: currentMonth + 1 },
        });
        setMonthCourses(res.data.courses || []);
        setCourseIndex(0);
      } catch (err) {
        setError("Error fetching month courses");
      } finally {
        setLoading(false);
      }
    };
    fetchMonthCourses();
  }, [currentMonth, currentYear]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const getByStatus = (status) =>
          axios
            .get(`/courses/status/${status}`, {
              params: { page: 1, size: 10, sortBy: "dateTime", direction: "ASC" },
            })
            .then((r) => r.data.courses || []);

        const [pending, accepted] = await Promise.all([
          getByStatus("WAITING_FOR_CONFIRMATION"),
          getByStatus("OPEN_FOR_JOINING"),
        ]);
        setPendingRequestsList(pending);
        setAcceptedRequestsList(accepted);
      } catch (err) {
        console.error("Error fetching requests:", err);
      }
    };
    fetchRequests();
  }, []);

  const handleMonthChange = (direction) => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((prev) => prev - 1);
      } else {
        setCurrentMonth((prev) => prev - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((prev) => prev + 1);
      } else {
        setCurrentMonth((prev) => prev + 1);
      }
    }
  };

  const handlePrevCourse = () => {
    setCourseIndex((prev) =>
      prev === 0 ? monthCourses.length - 1 : prev - 1
    );
  };

  const handleNextCourse = () => {
    setCourseIndex((prev) =>
      prev === monthCourses.length - 1 ? 0 : prev + 1
    );
  };

  const visibleCourses = monthCourses.slice(courseIndex, courseIndex + 3);

  const handleJoin = async (courseId) => {
    try {
      const response = await axios.post(`/courses/${courseId}/join`);
      alert(response.data);
    } catch (err) {
      alert(err.response?.data || "An error occurred");
      console.error(err);
    }
  };

  const handlePrev = (setIndex, length) => {
    setIndex((prev) => (prev === 0 ? length - 2 : prev - 1));
  };

  const handleNext = (setIndex, length) => {
    setIndex((prev) => (prev === length - 2 ? 0 : prev + 1));
  };

  const renderRequests = (requests, index) =>
    requests.slice(index, index + 2).map((req) => (
      <div
        key={req.courseId}
        className="bg-gray-50 p-4 rounded shadow hover:shadow-md transition"
      >
        <h4 className="font-semibold text-gray-700">{req.title}</h4>
        <p className="text-sm text-gray-600">
          {new Date(req.dateTime).toLocaleString()} | {req.courseType}
        </p>
        <p className="text-sm text-gray-600">
          RM {req.cost} | {req.category}
        </p>
      </div>
    ));

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const highlightedDays = new Set(
    monthCourses.map((c) => new Date(c.dateTime).getDate())
  );

  const chartLabels = top5Categories.map((cat) => {
    const icon = getCourseIcon(cat.category);
    return icon + " " + cat.category;
  });

  const chartValues = top5Categories.map((cat) => cat.count);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartValues,
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
        hoverBackgroundColor: [
          "#2563eb",
          "#059669",
          "#d97706",
          "#dc2626",
          "#7c3aed",
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 20,
          padding: 15,
        },
      },
    },
  };

  const pendingRequestsCount = overviewSummary?.pendingRequests?.value ?? 0;
  const pendingRequestsChange = overviewSummary?.pendingRequests?.change ?? "0%";
  const coursesCanceledCount = overviewSummary?.coursesCanceled?.value ?? 0;
  const coursesCanceledChange = overviewSummary?.coursesCanceled?.change ?? "0%";
  const completedCoursesCount = overviewSummary?.completedCourses?.value ?? 0;
  const completedCoursesChange = overviewSummary?.completedCourses?.change ?? "0%";
  const totalHoursStudiedCount = overviewSummary?.totalHoursStudied?.value ?? 0;
  const totalHoursStudiedChange = overviewSummary?.totalHoursStudied?.change ?? "0%";

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6">Overview</h1>

        {loading && (
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-blue-600 animate-spin rounded-full h-6 w-6 border-4 border-blue-600 border-t-transparent"></span>
            <p className="text-blue-800 font-medium">Loading...</p>
          </div>
        )}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-5 shadow rounded-md hover:shadow-lg transition">
            <h2 className="text-md font-bold text-gray-700 flex items-center justify-center mb-2">
              <CalendarToday className="text-blue-600 mr-2" />
              Total Hours Studied
            </h2>
            <p className="text-3xl font-extrabold text-blue-700">
              {totalHoursStudiedCount}{" "}
              <span className="text-base font-medium">
                {overviewSummary?.totalHoursStudied?.unit || "Hours"}
              </span>
            </p>
            <p
              className={`text-sm ${
                totalHoursStudiedChange.startsWith("-")
                  ? "text-red-500"
                  : "text-green-500"
              } mt-1`}
            >
              {totalHoursStudiedChange}
            </p>
          </div>

          <div className="bg-white p-5 shadow rounded-md hover:shadow-lg transition">
            <h2 className="text-md font-bold text-gray-700 flex items-center justify-center mb-2">
              <HourglassEmpty className="text-red-600 mr-2" />
              Courses Cancelled
            </h2>
            <p className="text-3xl font-extrabold text-red-600">
              {coursesCanceledCount}{" "}
              <span className="text-base font-medium">
                {overviewSummary?.coursesCanceled?.unit || "Courses"}
              </span>
            </p>
            <p
              className={`text-sm ${
                coursesCanceledChange.startsWith("-")
                  ? "text-red-500"
                  : "text-green-500"
              } mt-1`}
            >
              {coursesCanceledChange}
            </p>
          </div>

          <div className="bg-white p-5 shadow rounded-md hover:shadow-lg transition">
            <h2 className="text-md font-bold text-gray-700 flex items-center justify-center mb-2">
              <CheckCircle className="text-green-600 mr-2" />
              Completed Courses
            </h2>
            <p className="text-3xl font-extrabold text-blue-700">
              {completedCoursesCount}{" "}
              <span className="text-base font-medium">
                {overviewSummary?.completedCourses?.unit || "Courses"}
              </span>
            </p>
            <p
              className={`text-sm ${
                completedCoursesChange.startsWith("-")
                  ? "text-red-500"
                  : "text-green-500"
              } mt-1`}
            >
              {completedCoursesChange}
            </p>
          </div>

          <div className="bg-white p-5 shadow rounded-md hover:shadow-lg transition">
            <h2 className="text-md font-bold text-gray-700 flex items-center justify-center mb-2">
              <HourglassEmpty className="text-yellow-600 mr-2" />
              Pending Requests
            </h2>
            <p className="text-3xl font-extrabold text-blue-700">
              {pendingRequestsCount}{" "}
              <span className="text-base font-medium">
                {overviewSummary?.pendingRequests?.unit || "Requests"}
              </span>
            </p>
            <p
              className={`text-sm ${
                pendingRequestsChange.startsWith("-")
                  ? "text-red-500"
                  : "text-green-500"
              } mt-1`}
            >
              {pendingRequestsChange}
            </p>
          </div>
        </div>

        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 shadow rounded-md flex-1 flex flex-col">
            <h2 className="text-lg font-bold mb-4 text-gray-700">Calendar</h2>
            <div className="flex justify-between items-center mb-4">
              <button
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                onClick={() => handleMonthChange("prev")}
              >
                Previous
              </button>
              <h3 className="text-xl font-bold text-gray-700">
                {`${currentYear} - ${currentMonth + 1}`}
              </h3>
              <button
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                onClick={() => handleMonthChange("next")}
              >
                Next
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: daysInMonth }, (_, i) => (
                <div
                  key={i + 1}
                  className={`py-2 px-3 text-center text-sm font-medium rounded-full cursor-pointer transition ${
                    highlightedDays.has(i + 1)
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 shadow-lg rounded-md flex-1 flex flex-col">
            <h2 className="text-lg font-bold mb-4 flex items-center text-gray-700">
              <School className="text-blue-600 mr-2" />
              Courses in {`${currentYear} - ${currentMonth + 1}`}
            </h2>
            {monthCourses.length === 0 ? (
              <p className="text-gray-500">No courses for this month.</p>
            ) : (
              <div className="flex flex-col items-center mt-2">
                <ArrowDropUp
                  className="cursor-pointer text-gray-600 hover:text-gray-900 transition"
                  onClick={handlePrevCourse}
                />
                <div className="flex flex-col w-full px-4 space-y-4 mt-2">
                  {visibleCourses.map((course) => {
                    const isCourseFull =
                      course.studentCourses.length >= course.maxStudents;
                    const isStudentEnrolled = course.studentCourses.some(
                      (sc) => sc.studentId === course.currentUserId
                    );
                    const isCourseCompleted = course.courseStatus === "COMPLETED";
                    const isCourseExpired = new Date(course.dateTime) < new Date();

                    return (
                      <div
                        key={course.courseId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow hover:shadow-md transition"
                      >
                        <div className="flex items-center space-x-4">
                          <span className="text-3xl">{getCourseIcon(course.category)}</span>
                          <div className="text-sm font-medium text-gray-700">
                            <span className="block font-semibold text-base">
                              {course.title}
                            </span>
                            <span className="block text-xs text-gray-500">
                              {course.category} -{" "}
                              {new Date(course.dateTime).toLocaleString("en-GB", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>
                        </div>
                        <button
                          className={`px-4 py-1 rounded-md text-sm font-semibold transition ${
                            isCourseCompleted || isCourseExpired
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : isStudentEnrolled
                              ? "bg-red-700 text-white hover:bg-red-800"
                              : !isCourseFull
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-400 text-white cursor-not-allowed"
                          }`}
                          onClick={() =>
                            !isCourseCompleted &&
                            !isCourseExpired &&
                            (isStudentEnrolled
                              ? handleCancel(course.courseId)
                              : !isCourseFull && handleJoin(course.courseId))
                          }
                          disabled={isCourseCompleted || isCourseExpired || isCourseFull}
                        >
                          {isCourseCompleted || isCourseExpired
                            ? "Unavailable"
                            : isStudentEnrolled
                            ? "Cancel"
                            : !isCourseFull
                            ? "Join"
                            : "Full"}
                        </button>
                      </div>
                    );
                  })}
                </div>
                <ArrowDropDown
                  className="cursor-pointer text-gray-600 hover:text-gray-900 transition mt-4"
                  onClick={handleNextCourse}
                />
              </div>
            )}
          </div>
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 shadow rounded-md flex flex-col">
            <h2 className="text-lg font-bold mb-4 text-gray-700">
              Top 5 Popular Categories
            </h2>
            <div className="flex-1">
              <div className="h-72">
                <Doughnut data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 shadow rounded-md flex flex-col md:col-span-2">
            <h2 className="text-lg font-bold mb-4 flex items-center text-gray-700">
              <Group className="text-blue-600 mr-2" />
              Request Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-semibold mb-3 text-gray-800 flex items-center">
                  Pending
                  <ArrowBackIos
                    className="cursor-pointer text-gray-500 hover:text-gray-800 ml-2"
                    onClick={() =>
                      handlePrev(setPendingIndex, pendingRequestsList.length)
                    }
                  />
                  <ArrowForwardIos
                    className="cursor-pointer text-gray-500 hover:text-gray-800 ml-1"
                    onClick={() =>
                      handleNext(setPendingIndex, pendingRequestsList.length)
                    }
                  />
                </h3>
                <div className="space-y-3">
                  {pendingRequestsList
                    .slice(pendingIndex, pendingIndex + 2)
                    .map((req) => (
                      <div
                        key={req.courseId}
                        className="bg-gray-50 p-4 rounded shadow hover:shadow-md transition flex items-center space-x-3"
                      >
                        <span className="text-2xl">{getCourseIcon(req.category)}</span>
                        <div>
                          <h4 className="font-semibold text-gray-700">{req.title}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(req.dateTime).toLocaleString()} | {req.courseType}
                          </p>
                          <p className="text-sm text-gray-600">
                            RM {req.cost} &mdash; {req.category}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h3 className="text-md font-semibold mb-3 text-gray-800 flex items-center">
                  Accepted
                  <ArrowBackIos
                    className="cursor-pointer text-gray-500 hover:text-gray-800 ml-2"
                    onClick={() =>
                      handlePrev(setAcceptedIndex, acceptedRequestsList.length)
                    }
                  />
                  <ArrowForwardIos
                    className="cursor-pointer text-gray-500 hover:text-gray-800 ml-1"
                    onClick={() =>
                      handleNext(setAcceptedIndex, acceptedRequestsList.length)
                    }
                  />
                </h3>
                <div className="space-y-3">
                  {acceptedRequestsList
                    .slice(acceptedIndex, acceptedIndex + 2)
                    .map((req) => (
                      <div
                        key={req.courseId}
                        className="bg-gray-50 p-4 rounded shadow hover:shadow-md transition flex items-center space-x-3"
                      >
                        <span className="text-2xl">{getCourseIcon(req.category)}</span>
                        <div>
                          <h4 className="font-semibold text-green-700">{req.title}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(req.dateTime).toLocaleString()} | {req.courseType}
                          </p>
                          <p className="text-sm text-gray-600">
                            RM {req.cost} &mdash; {req.category}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
};

export default OverviewDashboard;
