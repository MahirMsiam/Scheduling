import { signInWithEmailAndPassword } from "firebase/auth";
import { onValue, push, ref, remove, set } from "firebase/database";
import { useEffect, useState } from "react";
import "./App.css";
import { auth, database } from "./firebase"; // Import auth here
import Footer from './Footer';
import './index.css';

function App() {
  const [schedules, setSchedules] = useState([]);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    availability: {
      sunday: [
        { start: "", end: "" },
        { start: "", end: "" },
        { start: "", end: "" },
      ],
      monday: [
        { start: "", end: "" },
        { start: "", end: "" },
        { start: "", end: "" },
      ],
      tuesday: [
        { start: "", end: "" },
        { start: "", end: "" },
        { start: "", end: "" },
      ],
      wednesday: [
        { start: "", end: "" },
        { start: "", end: "" },
        { start: "", end: "" },
      ],
      thursday: [
        { start: "", end: "" },
        { start: "", end: "" },
        { start: "", end: "" },
      ],
    },
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Fetch schedules from Firebase
  useEffect(() => {
    const schedulesRef = ref(database, "schedules");

    const unsubscribe = onValue(schedulesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert Firebase object to array
        const schedulesArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setSchedules(schedulesArray);
      } else {
        setSchedules([]);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const handleSubmitSchedule = () => {
    setShowSubmitForm(true);
    setShowAdminLogin(false);
    setIsAdminLoggedIn(false);
  };

  const handleAdminLogin = () => {
    setShowAdminLogin(true);
    setShowSubmitForm(false);
    setIsAdminLoggedIn(false);
  };

  const handleBackToHome = () => {
    setShowSubmitForm(false);
    setShowAdminLogin(false);
    setIsAdminLoggedIn(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTimeChange = (day, index, type, value) => {
    const updatedAvailability = { ...formData.availability };
    updatedAvailability[day][index][type] = value;

    setFormData({
      ...formData,
      availability: updatedAvailability,
    });
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();

    const schedulesRef = ref(database, "schedules");

    onValue(
      schedulesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const schedulesArray = Object.values(data);

          // Check if user already submitted their info
          const isDuplicate = schedulesArray.some(
            (schedule) =>
              schedule.name === formData.name &&
              schedule.studentId === formData.studentId
          );

          if (isDuplicate) {
            alert("You have already submitted your schedule.");
            return;
          }

          // Proceed with submission if no duplicate found
          const newScheduleRef = push(schedulesRef);
          set(newScheduleRef, formData)
            .then(() => {
              alert("Schedule submitted successfully!");
              handleBackToHome();
            })
            .catch((error) => {
              console.error("Error adding schedule: ", error);
              alert("Error submitting schedule. Please try again.");
            });
        }
      },
      { onlyOnce: true }
    ); // Prevent multiple calls
  };

  const handleDeleteSchedule = (id) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      const scheduleRef = ref(database, `schedules/${id}`);
      remove(scheduleRef)
        .then(() => {
          alert("Schedule deleted successfully!");
        })
        .catch((error) => {
          console.error("Error deleting schedule: ", error);
          alert("Error deleting schedule. Please try again.");
        });
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, loginData.email, loginData.password)
      .then((userCredential) => {
        setIsAdminLoggedIn(true);
        setShowAdminLogin(false);
      })
      .catch((error) => {
        console.error("Error logging in: ", error);
        alert("Invalid credentials. Please try again.");
      });
  };

  const handleDeleteAllSchedules = () => {
    if (window.confirm("Are you sure you want to delete all schedules?")) {
      const schedulesRef = ref(database, "schedules");
      remove(schedulesRef)
        .then(() => {
          alert("All schedules deleted successfully!");
        })
        .catch((error) => {
          console.error("Error deleting all schedules: ", error);
          alert("Error deleting all schedules. Please try again.");
        });
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>AIUB English Club</h1>
      </header>

      {!showSubmitForm && !showAdminLogin && !isAdminLoggedIn ? (
        <main className="main-content">
          <h2>Volunteers Schedule</h2>
          <div className="button-container">
            <button className="primary-button" onClick={handleSubmitSchedule}>
              Submit Schedules
            </button>
            <button className="secondary-button" onClick={handleAdminLogin}>
              Admin Login
            </button>
          </div>
        </main>
      ) : showSubmitForm ? (
        <SubmitScheduleForm
          onBack={handleBackToHome}
          formData={formData}
          onChange={handleFormChange}
          onTimeChange={handleTimeChange}
          onSubmit={handleScheduleSubmit}
        />
      ) : showAdminLogin ? (
        <AdminLoginForm
          onBack={handleBackToHome}
          loginData={loginData}
          onChange={handleLoginChange}
          onSubmit={handleLoginSubmit}
        />
      ) : (
        <AdminDashboard
          schedules={schedules}
          onBack={handleBackToHome}
          onDelete={handleDeleteSchedule}
          loading={loading}
          onDeleteAll={handleDeleteAllSchedules} // Pass the delete all handler
        />
      )}
      <Footer />
    </div>
  );
}

function SubmitScheduleForm({
  onBack,
  formData,
  onChange,
  onTimeChange,
  onSubmit,
}) {
  const days = [
    { value: "sunday", label: "Sunday" },
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
  ];

  return (
    <div className="form-container">
      <h2>Submit Your Schedule</h2>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="contact">Contact Number</label>
          <input
            type="tel"
            id="contact"
            name="contact"
            value={formData.contact}
            onChange={onChange}
            required
            pattern="[0-9]{11}"
            placeholder="01XXXXXXXXX"
          />
        </div>
        <div className="form-group">
          <label htmlFor="studentId">Student ID</label>
          <input
            type="text"
            id="studentId"
            name="studentId"
            value={formData.studentId}
            onChange={onChange}
            required
            placeholder="20-57xxx-1"
          />
        </div>

        <div className="form-group">
          <h3 className="availability-heading">Available Time Slots</h3>
          <p className="availability-instruction">
            Please select up to 3 time ranges for each day
          </p>

          {days.map((day) => (
            <div key={day.value} className="day-time-container">
              <h4 className="day-heading">{day.label}</h4>
              <div className="time-slots-container">
                {[0, 1, 2].map((index) => (
                  <div key={`${day.value}-${index}`} className="time-slot">
                    <label htmlFor={`${day.value}-${index}-start`}>
                      Start Time
                    </label>
                    <input
                      type="time"
                      id={`${day.value}-${index}-start`}
                      value={formData.availability[day.value][index].start}
                      onChange={(e) =>
                        onTimeChange(day.value, index, "start", e.target.value)
                      }
                    />

                    <label htmlFor={`${day.value}-${index}-end`}>
                      End Time
                    </label>
                    <input
                      type="time"
                      id={`${day.value}-${index}-end`}
                      value={formData.availability[day.value][index].end}
                      onChange={(e) =>
                        onTimeChange(day.value, index, "end", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="button-container">
          <button type="submit" className="primary-button">
            Submit
          </button>
          <button type="button" className="secondary-button" onClick={onBack}>
            Back
          </button>
        </div>
      </form>
    </div>
  );
}

function AdminLoginForm({ onBack, loginData, onChange, onSubmit }) {
  return (
    <div className="form-container">
      <h2>Admin Login</h2>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            value={loginData.email}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={loginData.password}
            onChange={onChange}
            required
          />
        </div>
        <div className="button-container">
          <button type="submit" className="primary-button">
            Login
          </button>
          <button type="button" className="secondary-button" onClick={onBack}>
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
function AdminDashboard({ schedules, onBack, onDelete, loading, onDeleteAll }) {
  const [selectedDay, setSelectedDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query

  const isTimeInRange = (timeSlot) => {
    if (!startTime || !endTime) return true;
    return timeSlot.start >= startTime && timeSlot.end <= endTime;
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesDay =
      !selectedDay || schedule.availability[selectedDay]?.some(isTimeInRange);
    const matchesSearch = schedule.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesDay && matchesSearch;
  });

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        {/* Search Box */}
        <input
          type="text"
          id="search-box"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Name"
          className="search-box"
        />
      </div>

      {/* Delete All Schedules Button */}
      <div className="button-container">
        <button className="delete-all-button" onClick={onDeleteAll}>
          Delete All Schedules
        </button>
      </div>

      {/* Counter */}
      <div className="schedule-counter">
        <p>Total Schedules submitted: {schedules.length}</p>
      </div>

      {/* Filters */}
      <div className="filter-container">
        <label htmlFor="day-select">Select a day:</label>
        <select
          id="day-select"
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
        >
          <option value="">All Days</option>
          <option value="sunday">Sunday</option>
          <option value="monday">Monday</option>
          <option value="tuesday">Tuesday</option>
          <option value="wednesday">Wednesday</option>
          <option value="thursday">Thursday</option>
        </select>

        <label>Start Time:</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        <label>End Time:</label>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Loading schedules...</p>
        </div>
      ) : filteredSchedules.length > 0 ? (
        <div className="admin-tables-container">
          {filteredSchedules.map((schedule) => (
            <div key={schedule.id} className="user-schedule-card">
              <div className="user-info">
                <h3>{schedule.name}</h3>
                <p>
                  <strong>Contact Number:</strong> {schedule.contact}
                </p>
                <p>
                  <strong>Student ID:</strong> {schedule.studentId}
                </p>
                <button
                  className="delete-button"
                  onClick={() => onDelete(schedule.id)}
                >
                  Delete Schedule
                </button>
              </div>

              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Time Slot 1</th>
                    <th>Time Slot 2</th>
                    <th>Time Slot 3</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(schedule.availability)
                    .filter(([day]) => !selectedDay || day === selectedDay)
                    .map(([day, times]) => (
                      <tr key={day}>
                        <td className="day-cell">
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </td>
                        {times.map((time, index) => (
                          <td key={index} className="time-cell">
                            {time.start && time.end
                              ? `${time.start} - ${time.end}`
                              : "Not set"}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No volunteer schedules match your filters.</p>
        </div>
      )}

      <div className="button-container">
        <button className="secondary-button" onClick={onBack}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default App;
