import React, { useState, useEffect } from "react";
import axios from "../../axiosConfig";
import { Modal, Menu, MenuItem } from "@mui/material";
import {
  MoreVert,
  Group,
  Add,
  AccessTime,
  ArrowDropUp,
  ArrowDropDown,
} from "@mui/icons-material";
import CourseIcons, { getCourseIcon } from "../CourseIcons";

const RequestsDashboard = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [formType, setFormType] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);

  const [pendingIndex, setPendingIndex] = useState(0);
  const [acceptedIndex, setAcceptedIndex] = useState(0);

  const [newRequestData, setNewRequestData] = useState({
    title: "",
    duration: "15",
    time: "",
    date: "",
    cost: "",
    category: "MATHEMATICS",
    courseStatus: "WAITING_FOR_CONFIRMATION",
  });

  // Use empty strings so we show all courses by default
  const [groupRequestData, setGroupRequestData] = useState({
    duration: "",
    category: "",
    searchTitle: "",
    selectedGroup: "",
  });

  const [groupCourses, setGroupCourses] = useState([]);
  const [filteredGroupCourses, setFilteredGroupCourses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingRequests();
    fetchAcceptedRequests();
    fetchGroupCourses();
  }, []);

  // Whenever user changes filters or when we fetch new data, re-filter
  useEffect(() => {
    let filtered = groupCourses;

    // Filter by category only if it's not empty
    if (groupRequestData.category) {
      filtered = filtered.filter(
        (course) => course.category.toUpperCase() === groupRequestData.category
      );
    }

    // Filter by duration only if it's not empty
    if (groupRequestData.duration) {
      filtered = filtered.filter(
        (course) => parseInt(course.duration) === parseInt(groupRequestData.duration)
      );
    }

    // Filter by searchTitle only if it's not empty
    if (groupRequestData.searchTitle.trim()) {
      filtered = filtered.filter((course) =>
        course.title.toLowerCase().includes(groupRequestData.searchTitle.toLowerCase())
      );
    }

    setFilteredGroupCourses(filtered);
  }, [groupRequestData, groupCourses]);

  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get("/courses/status/WAITING_FOR_CONFIRMATION", {
        params: { page: 1, size: 50 },
      });
      setPendingRequests(res.data.courses || []);
    } catch (err) {
      console.error("Error fetching pending requests:", err);
    }
  };

  const fetchAcceptedRequests = async () => {
    try {
      const res = await axios.get("/courses/status/OPEN_FOR_JOINING", {
        params: { page: 1, size: 50 },
      });
      setAcceptedRequests(res.data.courses || []);
    } catch (err) {
      console.error("Error fetching accepted requests:", err);
    }
  };

  const fetchGroupCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/courses/type/GROUP", {
        params: { page: 1, size: 1000 },
      });
      setGroupCourses(res.data.courses || []);
      // Show all by default
      setFilteredGroupCourses(res.data.courses || []);
    } catch (err) {
      console.error("Error fetching group courses:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createNewRequest = async (e) => {
    e.preventDefault();
    try {
      const localDateTimeString = `${newRequestData.date}T${newRequestData.time}:00`; 
      const localDate = new Date(localDateTimeString);
      const utcDateTimeString = localDate.toISOString();
      console.log(utcDateTimeString);
      const payload = {
        title: newRequestData.title,
        description: newRequestData.title,
        courseType: "INDIVIDUAL",
        courseStatus: newRequestData.courseStatus,
        category: newRequestData.category.toUpperCase(),
        dateTime: utcDateTimeString,
        duration: parseInt(newRequestData.duration) || 15,
        cost: parseFloat(newRequestData.cost) || 0.0,
      };
      await axios.post("/courses", payload);
      alert("Request created successfully!");
      closeModal();
      fetchPendingRequests();
    } catch (err) {
      console.error("Error creating new request:", err);
      alert(err.response?.data || "Error creating request");
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!groupRequestData.selectedGroup) {
      alert("Please select a group/course to join.");
      return;
    }
    try {
      const courseId = groupRequestData.selectedGroup;
      const res = await axios.post(`/courses/${courseId}/join`);
      alert(res.data);
      closeModal();
      fetchAcceptedRequests();
    } catch (err) {
      console.error("Error joining group:", err);
      alert(err.response?.data || "Error joining group");
    }
  };

  const visiblePending = pendingRequests.slice(pendingIndex, pendingIndex + 5);
  const handlePendingUp = () => {
    setPendingIndex((prev) =>
      prev === 0 ? Math.max(pendingRequests.length - 5, 0) : prev - 1
    );
  };
  const handlePendingDown = () => {
    const maxIndex = Math.max(pendingRequests.length - 5, 0);
    setPendingIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const visibleAccepted = acceptedRequests.slice(acceptedIndex, acceptedIndex + 5);
  const handleAcceptedUp = () => {
    setAcceptedIndex((prev) =>
      prev === 0 ? Math.max(acceptedRequests.length - 5, 0) : prev - 1
    );
  };
  const handleAcceptedDown = () => {
    const maxIndex = Math.max(acceptedRequests.length - 5, 0);
    setAcceptedIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const openDropdown = (event) => setAnchorEl(event.currentTarget);
  const closeDropdown = () => setAnchorEl(null);

  const openModal = (type) => {
    setFormType(type);
    setModalOpen(true);
    closeDropdown();
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormType("");
    setNewRequestData({
      title: "",
      duration: "15",
      time: "",
      date: "",
      cost: "",
      category: "MATHEMATICS",
      courseStatus: "WAITING_FOR_CONFIRMATION",
    });
    setGroupRequestData({
      duration: "",
      category: "",
      searchTitle: "",
      selectedGroup: "",
    });
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-b from-white to-blue-50 relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">Requests</h1>
        <div>
          <button
            onClick={openDropdown}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 inline-flex items-center transition"
          >
            Request Options
            <MoreVert className="ml-1" />
          </button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={closeDropdown}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={() => openModal("new")}>
              <Add className="mr-2" /> Create New Request
            </MenuItem>
            <MenuItem onClick={() => openModal("group")}>
              <Group className="mr-2" /> Join Group
            </MenuItem>
          </Menu>
        </div>
      </div>

      {loading && <p className="text-blue-600 mb-4">Loading data...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h2 className="text-lg font-bold flex items-center space-x-2 text-gray-700 mb-4">
            <AccessTime className="text-blue-600" />
            <span>Pending Requests</span>
          </h2>
          {pendingRequests.length === 0 ? (
            <p className="text-gray-500">No pending requests.</p>
          ) : (
            <div className="flex flex-col items-center">
              <ArrowDropUp
                className="cursor-pointer text-gray-600 hover:text-gray-900"
                fontSize="large"
                onClick={handlePendingUp}
              />
              <div className="space-y-4 w-full mt-2">
                {visiblePending.map((course) => (
                  <div
                    key={course.courseId}
                    className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md shadow hover:shadow-lg transition"
                  >
                    <span className="text-3xl">{getCourseIcon(course.category)}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-700">{course.title}</p>
                      <span className="block text-xs text-gray-500">
                        {course.category} &mdash;{" "}
                        {new Date(course.dateTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <ArrowDropDown
                className="cursor-pointer text-gray-600 hover:text-gray-900 mt-2"
                fontSize="large"
                onClick={handlePendingDown}
              />
            </div>
          )}
        </div>

        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h2 className="text-lg font-bold flex items-center space-x-2 text-gray-700 mb-4">
            <Group className="text-green-600" />
            <span>Accepted Requests</span>
          </h2>
          {acceptedRequests.length === 0 ? (
            <p className="text-gray-500">No accepted requests.</p>
          ) : (
            <div className="flex flex-col items-center">
              <ArrowDropUp
                className="cursor-pointer text-gray-600 hover:text-gray-900"
                fontSize="large"
                onClick={handleAcceptedUp}
              />
              <div className="space-y-4 w-full mt-2">
                {visibleAccepted.map((course) => (
                  <div
                    key={course.courseId}
                    className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md shadow hover:shadow-lg transition"
                  >
                    <span className="text-3xl text-green-600">
                      {getCourseIcon(course.category)}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-green-700">{course.title}</p>
                      <p className="text-sm text-gray-600">
                        {course.category} &mdash;{" "}
                        {new Date(course.dateTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <ArrowDropDown
                className="cursor-pointer text-gray-600 hover:text-gray-900 mt-2"
                fontSize="large"
                onClick={handleAcceptedDown}
              />
            </div>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={closeModal}>
        <div className="bg-white w-11/12 sm:w-9/12 md:w-1/2 mx-auto mt-24 p-6 rounded-lg shadow-xl relative">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 font-bold"
            onClick={closeModal}
          >
            ✕
          </button>
          <h2 className="text-xl sm:text-2xl font-bold mb-6">
            {formType === "new" ? "Create New Request" : "Join Group"}
          </h2>
          {formType === "new" ? (
            <form className="space-y-5" onSubmit={createNewRequest}>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Title / Description
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-4 py-2"
                  placeholder="Enter title"
                  value={newRequestData.title}
                  onChange={(e) =>
                    setNewRequestData({ ...newRequestData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded px-4 py-2"
                    value={newRequestData.duration}
                    onChange={(e) =>
                      setNewRequestData({ ...newRequestData, duration: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    className="w-full border rounded px-4 py-2"
                    value={newRequestData.time}
                    onChange={(e) =>
                      setNewRequestData({ ...newRequestData, time: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full border rounded px-4 py-2"
                    value={newRequestData.date}
                    onChange={(e) =>
                      setNewRequestData({ ...newRequestData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Cost (RM)
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded px-4 py-2"
                    placeholder="Enter cost"
                    value={newRequestData.cost}
                    onChange={(e) =>
                      setNewRequestData({ ...newRequestData, cost: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Category
                </label>
                <select
                  className="w-full border rounded px-4 py-2"
                  value={newRequestData.category}
                  onChange={(e) =>
                    setNewRequestData({ ...newRequestData, category: e.target.value })
                  }
                  required
                >
                  <option value="">-- Select a Category --</option>
                  {Object.keys(CourseIcons).map((category) => (
                    <option key={category} value={category}>
                      {getCourseIcon(category)} {category}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition"
              >
                Submit Request
              </button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleJoinGroup}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Category
                  </label>
                  <select
                    className="w-full border rounded px-4 py-2"
                    value={groupRequestData.category}
                    onChange={(e) =>
                      setGroupRequestData({ ...groupRequestData, category: e.target.value })
                    }
                  >
                    <option value="">All Categories</option>
                    {Object.keys(CourseIcons).map((category) => (
                      <option key={category} value={category}>
                        {getCourseIcon(category)} {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Duration
                  </label>
                  <select
                    className="w-full border rounded px-4 py-2"
                    value={groupRequestData.duration}
                    onChange={(e) =>
                      setGroupRequestData({ ...groupRequestData, duration: e.target.value })
                    }
                  >
                    <option value="">All Durations</option>
                    <option value="15">15 mins</option>
                    <option value="30">30 mins</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Search by Title
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-4 py-2"
                  placeholder="Enter title to search"
                  value={groupRequestData.searchTitle}
                  onChange={(e) =>
                    setGroupRequestData({ ...groupRequestData, searchTitle: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Available Groups
                </label>
                <select
                  className="w-full border rounded px-4 py-2"
                  value={groupRequestData.selectedGroup}
                  onChange={(e) =>
                    setGroupRequestData({ ...groupRequestData, selectedGroup: e.target.value })
                  }
                >
                  <option value="">-- Select a Group --</option>
                  {filteredGroupCourses.map((course) => (
                    <option key={course.courseId} value={course.courseId}>
                      {getCourseIcon(course.category)} {course.title} (
                      {course.students?.length || 0} students)
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition"
              >
                Join Group
              </button>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default RequestsDashboard;
