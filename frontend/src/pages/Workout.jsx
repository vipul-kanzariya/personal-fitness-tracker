// src/pages/Workout.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import "../style/Workout.css";

const EXERCISE_IMAGES = {
  pushups: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=800&auto=format&fit=crop",
  pushup: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=800&auto=format&fit=crop",
  running: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800&auto=format&fit=crop",
  squat: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop",
  deadlift: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop",
  cycling: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=800&auto=format&fit=crop",
  plank: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?q=80&w=800&auto=format&fit=crop",
};

const CATEGORY_DEFAULT_IMAGES = {
  Strength: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
  Cardio: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=800&auto=format&fit=crop",
  Flexibility: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
  Balance: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
};

const DEFAULT_WORKOUT_IMAGE = "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop";

const getWorkoutImage = (workoutType) => {
  if (!workoutType) return DEFAULT_WORKOUT_IMAGE;
  if (workoutType.imageUrl && workoutType.imageUrl.trim() !== "") return workoutType.imageUrl;

  const nameKey = workoutType.name?.toLowerCase().trim();
  for (const key in EXERCISE_IMAGES) {
    if (nameKey?.includes(key)) return EXERCISE_IMAGES[key];
  }

  if (CATEGORY_DEFAULT_IMAGES[workoutType.category]) {
    return CATEGORY_DEFAULT_IMAGES[workoutType.category];
  }

  return DEFAULT_WORKOUT_IMAGE;
};

const getCategoryClass = (category) => {
  switch (category?.toLowerCase()) {
    case "strength": return "cat-strength";
    case "cardio": return "cat-cardio";
    case "flexibility": return "cat-flexibility";
    default: return "cat-default";
  }
};

function Workout() {
  const [workouts, setWorkouts] = useState([]);
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [duration, setDuration] = useState("");
  const [workoutTypes, setWorkoutTypes] = useState([]);
  const [workoutTypeId, setWorkoutTypeId] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        setLoading(true);
        setError(null);
        const [workoutRes, typesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/workouts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/workout-types`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setWorkouts(workoutRes.data);
        setWorkoutTypes(typesRes.data);
      } catch (err) {
        setError("Failed to load workouts.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEdit = (workout) => {
    setEditId(workout._id);
    setEditData({
      workoutTypeId: workout.workoutTypeId?._id || workout.workoutTypeId,
      sets: workout.sets,
      reps: workout.reps,
      duration: workout.duration,
    });
  };

  const handleUpdate = async (id) => {
    if (!editData.workoutTypeId) return setError("Please select an exercise.");
    if (!editData.sets || Number(editData.sets) <= 0) return setError("Sets must be greater than 0.");
    if (!editData.reps || Number(editData.reps) <= 0) return setError("Reps must be greater than 0.");
    if (!editData.duration || Number(editData.duration) <= 0) return setError("Duration must be greater than 0.");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/workouts/${id}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const selectedType = workoutTypes.find((t) => t._id === editData.workoutTypeId);
      const updatedWorkout = {
        ...res.data,
        workoutTypeId: res.data.workoutTypeId?.name ? res.data.workoutTypeId : selectedType
      };

      setWorkouts(workouts.map((w) => (w._id === id ? updatedWorkout : w)));
      setEditId(null);
      setEditData({});
      setError(null);
    } catch (err) {
      setError("Failed to update workout.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!workoutTypeId) return setError('Please select an exercise.');
    if (!sets || Number(sets) <= 0) return setError('Please enter valid sets (> 0).');
    if (!reps || Number(reps) <= 0) return setError('Please enter valid reps (> 0).');
    if (!duration || Number(duration) <= 0) return setError('Please enter a valid duration (> 0).');

    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/workouts`,
        { workoutTypeId, sets, reps, duration },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const selectedType = workoutTypes.find((t) => t._id === workoutTypeId);
      const newWorkout = {
        ...res.data,
        workoutTypeId: res.data.workoutTypeId?.name ? res.data.workoutTypeId : selectedType
      };

      setWorkouts([newWorkout, ...workouts]);
      setWorkoutTypeId('');
      setSets('');
      setReps('');
      setDuration('');
    } catch (err) {
      setError("Failed to log workout.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      setError(null);
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/workouts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkouts(workouts.filter((w) => w._id !== id));
    } catch (err) {
      setError("Failed to delete workout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-wrapper">
      {/* Page Header */}
      <div className="apex-page-header">
        <div className="apex-subtitle">Activity Tracker</div>
        <h1 className="apex-title">LOG <span>WORKOUT</span></h1>
      </div>

      {error && <div className="dashboard-alert mb-4">{error}</div>}

      {/* Log Form */}
      <div className="apex-form-card mb-4">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label" htmlFor="workoutType">Exercise</label>
              <select
                id="workoutType"
                className="form-select apex-select"
                value={workoutTypeId}
                onChange={(e) => setWorkoutTypeId(e.target.value)}
              >
                <option value="">Select Exercise</option>
                {workoutTypes.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.caloriesPerMinute} cal/min)
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label" htmlFor="sets">Sets</label>
              <input
                type="number" className="form-control apex-input" min="0" step="0.1"
                onKeyDown={(e) => ["e", "-", "+"].includes(e.key) && e.preventDefault()}
                value={sets} onChange={(e) => setSets(e.target.value)}
                id="sets" placeholder="Sets"
              />
            </div>

            <div className="col-md-2">
              <label className="form-label" htmlFor="reps">Reps</label>
              <input
                type="number" className="form-control apex-input" min="0" step="0.1"
                onKeyDown={(e) => ["e", "-", "+"].includes(e.key) && e.preventDefault()}
                value={reps} onChange={(e) => setReps(e.target.value)}
                id="reps" placeholder="Reps"
              />
            </div>

            <div className="col-md-2">
              <label className="form-label" htmlFor="duration">Duration (min)</label>
              <input
                type="number" className="form-control apex-input" min="0" step="0.1"
                onKeyDown={(e) => ["e", "-", "+"].includes(e.key) && e.preventDefault()}
                value={duration} onChange={(e) => setDuration(e.target.value)}
                id="duration" placeholder="Mins"
              />
            </div>

            <div className="col-md-2 d-flex align-items-end">
              <button className="btn apex-btn-primary w-100" type="submit">
                LOG WORKOUT
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Unique Workout Cards */}
      {loading ? (
        <div className="text-center py-5"><Spinner /></div>
      ) : (
        <div className="row g-3">
          {workouts.length === 0 && (
            <div className="col-12 text-center text-muted py-5">No workouts logged yet. Start training!</div>
          )}
          {workouts.map((w) => (
            <div className="col-sm-6 col-lg-4" key={w._id}>
              <div className={`apex-unique-card h-100 ${getCategoryClass(w.workoutTypeId?.category)}`}>
                
                {/* Image Banner */}
                <div className="apex-banner-wrapper">
                  <img
                    src={getWorkoutImage(w.workoutTypeId)}
                    alt={w.workoutTypeId?.name || "Exercise"}
                    className="apex-banner-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_WORKOUT_IMAGE;
                    }}
                  />
                  <div className="apex-banner-overlay" />
                  <span className="apex-tag">
                    {w.workoutTypeId?.category || "WORKOUT"}
                  </span>
                </div>

                {/* Content Section */}
                <div className="apex-card-content d-flex flex-column justify-content-between">
                  {editId === w._id ? (
                    /* Edit Mode */
                    <div>
                      <select
                        className="form-select apex-select mb-2"
                        value={editData.workoutTypeId || ""}
                        onChange={(e) => setEditData({ ...editData, workoutTypeId: e.target.value })}
                      >
                        <option value="">Select Exercise</option>
                        {workoutTypes.map((t) => (
                          <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                      </select>
                      <div className="row g-2 mb-3">
                        <div className="col-4">
                          <input type="number" className="form-control apex-input" placeholder="Sets"
                            value={editData.sets} onChange={(e) => setEditData({ ...editData, sets: e.target.value })} />
                        </div>
                        <div className="col-4">
                          <input type="number" className="form-control apex-input" placeholder="Reps"
                            value={editData.reps} onChange={(e) => setEditData({ ...editData, reps: e.target.value })} />
                        </div>
                        <div className="col-4">
                          <input type="number" className="form-control apex-input" placeholder="Duration"
                            value={editData.duration} onChange={(e) => setEditData({ ...editData, duration: e.target.value })} />
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-success btn-sm flex-grow-1" onClick={() => handleUpdate(w._id)}>Save</button>
                        <button className="btn btn-secondary btn-sm flex-grow-1" onClick={() => setEditId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    /* Normal Mode */
                    <>
                      <div>
                        <h3 className="apex-title-text">{w.workoutTypeId?.name || "Exercise"}</h3>
                        
                        {/* Readable Metrics Line */}
                        <div className="apex-metrics-text">
                          {Number(w.sets) > 0 ? `${w.sets} sets × ` : ""}
                          {Number(w.reps) > 0 ? `${w.reps} reps · ` : ""}
                          {w.duration} mins
                        </div>

                        <div className="apex-calorie-pill mb-3">
                          🔥 {w.caloriesBurned} <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>KCAL</span>
                        </div>
                      </div>

                      <div className="d-flex gap-2 pt-2 apex-card-action-bar">
                        <button className="btn apex-btn-edit btn-sm flex-grow-1" onClick={() => handleEdit(w)}>Edit</button>
                        <button className="btn apex-btn-delete btn-sm flex-grow-1" onClick={() => handleDelete(w._id)}>Delete</button>
                      </div>
                    </>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Workout;