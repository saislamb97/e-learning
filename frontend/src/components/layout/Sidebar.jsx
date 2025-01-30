import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../axiosConfig';
import {
  AccountCircle,
  Settings,
  Dashboard,
  Receipt,
  PlayCircle,
  History,
} from '@mui/icons-material';
import { getCourseIcon } from '../CourseIcons';

const Sidebar = () => {
  const [user, setUser] = useState({
    userId: null,
    fullName: '',
    email: '',
    image: null,
  });

  const [liveCourses, setLiveCourses] = useState([]);

  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const isHovered = useRef(false);

  // Fetch user profile and set up periodic fetching of live courses on mount
  useEffect(() => {
    fetchUserProfile();
    fetchLiveCourses();

    const intervalId = setInterval(() => {
      fetchLiveCourses();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    return () => clearInterval(intervalId);
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollPosition = 0;
    const scrollSpeed = 1;

    const scrollContent = () => {
      if (isHovered.current) {
        animationRef.current = requestAnimationFrame(scrollContent);
        return;
      }

      scrollPosition += scrollSpeed;
      container.scrollTop = scrollPosition;

      // Reset scroll when bottom is reached
      if (scrollPosition >= container.scrollHeight - container.clientHeight) {
        scrollPosition = 0;
      }

      animationRef.current = requestAnimationFrame(scrollContent);
    };

    animationRef.current = requestAnimationFrame(scrollContent);
    return () => cancelAnimationFrame(animationRef.current);
  }, [liveCourses]);

  // --- API Calls ---
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/users/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchLiveCourses = async () => {
    try {
      const now = new Date().toISOString();
      const response = await axios.get('/courses/live-courses', {
        params: { currentTime: now }
      });
      const courses = response.data || [];
      setLiveCourses(courses);
    } catch (error) {
      console.error('Error fetching live courses:', error);
    }
  };

  const navItems = [
    { id: 1, name: 'Overview', path: '/learning/overview', icon: <Dashboard /> },
    { id: 2, name: 'Requests', path: '/learning/requests', icon: <Receipt /> },
    { id: 3, name: 'LIVE Courses', path: '/learning/live-courses', icon: <PlayCircle /> },
    { id: 4, name: 'Transaction History', path: '/learning/transaction-history', icon: <History /> },
  ];

  return (
    <aside className="hidden md:flex md:fixed md:top-0 md:left-0 md:w-80 md:h-screen bg-white shadow-lg p-6 md:flex-col md:space-y-6">
      {/* --- TOP SECTION: User Profile --- */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div className="flex items-center">
            {user.image ? (
              <img
                src={user.image}
                alt="Profile"
                className="w-16 h-16 rounded-full border-4 border-blue-700 shadow-lg"
              />
            ) : (
              <AccountCircle className="w-16 h-16 text-blue-700" />
            )}
            <div className="ml-4">
              <h2 className="text-xl font-bold text-gray-800">
                {user.fullName || 'Welcome, User'}
              </h2>
              <p className="text-sm text-gray-600">{user.email || 'email@example.com'}</p>
            </div>
          </div>
          <Link
            to={`/learning/users/${user.userId}`}
            className="text-gray-500 hover:text-blue-700 transition transform hover:scale-110"
          >
            <Settings className="text-2xl" />
          </Link>
        </div>

        {/* --- NAVIGATION MENU --- */}
        <nav className="mb-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className="flex items-center px-4 py-3 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors"
                >
                  <span className="mr-4 text-gray-500">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* --- LIVE COURSES SECTION --- */}
      <div className="w-full">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">LIVE Courses</h3>
        <div
          ref={containerRef}
          className="overflow-y-auto h-80 pr-2 scrollbar-hide"
          onMouseEnter={() => (isHovered.current = true)}
          onMouseLeave={() => (isHovered.current = false)}
        >
          {liveCourses.map((course) => (
            <div
              key={course.courseId ?? course.id}
              className="p-4 bg-gray-50 mb-4 rounded-lg shadow-sm hover:shadow-md flex items-center space-x-4 transition"
            >
              <span className="text-3xl text-green-600">{getCourseIcon(course.category)}</span>
              <div className="flex-1">
                <h4 className="font-medium text-blue-700 line-clamp-1">{course.title}</h4>
                <p className="text-sm text-gray-500">{course.category}</p>
                <p className="text-sm text-gray-600">
                  Ongoing | {course.students?.length || 0} Students
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
