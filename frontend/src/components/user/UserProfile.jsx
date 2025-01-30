import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../axiosConfig";
import { ArrowBack, Edit, Person } from "@mui/icons-material";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/users/${id}`);
      const data = response.data;
      setUser(data);
      setEditData({
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        userRole: data.userRole,
        userStatus: data.userStatus,
      });
    } catch {
      setError("Failed to fetch user details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await axios.put(`/users/${id}`, editData);
      fetchUser();
      setEditMode(false);
    } catch {
      setError("Failed to update user details. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium hover:underline"
          >
            <ArrowBack className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-lg font-semibold">User Details</h1>
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-200"
          >
            <Edit className="w-5 h-5" />
            Edit
          </button>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="loader" />
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-100 text-red-600 border border-red-200 rounded-lg p-4">
              {error}
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* User Profile Info */}
            <div className="flex items-center gap-4 mb-6">
              <Person className="w-14 h-14 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">
                  {user?.fullName || user?.username || "Unknown User"}
                </h2>
                <p className="text-gray-500">{user?.email || "No email provided"}</p>
              </div>
            </div>

            {/* User Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Username", value: user?.username },
                { label: "Phone", value: user?.phone },
                { label: "Gender", value: user?.gender },
                { label: "Role", value: user?.userRole },
                { label: "Status", value: user?.userStatus },
                { label: "Created At", value: new Date(user?.createdAt).toLocaleString() },
                { label: "Updated At", value: new Date(user?.updatedAt).toLocaleString() },
              ].map(({ label, value }, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border-l-4 border-blue-600 rounded-lg p-4"
                >
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-gray-800 font-medium">{value || "N/A"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="bg-blue-600 text-white px-6 py-4">
              <h3 className="text-lg font-semibold text-center">Edit User Details</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: "Username", name: "username" },
                  { label: "Full Name", name: "fullName" },
                  { label: "Email", name: "email" },
                  { label: "Phone", name: "phone" },
                  { label: "Gender", name: "gender", options: ["MALE", "FEMALE"] },
                  { label: "Role", name: "userRole", options: ["ADMIN", "INSTRUCTOR", "STUDENT"] },
                  { label: "Status", name: "userStatus", options: ["VERIFIED", "NOT_VERIFIED", "INACTIVE"] },
                ].map(({ label, name, options }) => (
                  <div key={name}>
                    <label className="block text-sm text-gray-600 mb-1">{label}</label>
                    {options ? (
                      <select
                        name={name}
                        value={editData[name] || ""}
                        onChange={handleEditChange}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-500"
                      >
                        {options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name={name}
                        value={editData[name] || ""}
                        onChange={handleEditChange}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-4 px-6 py-4 bg-gray-100">
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
