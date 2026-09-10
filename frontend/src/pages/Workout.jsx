import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import NumberInput from "../components/NumberInput";
import FilterButtons from "../components/FilterButtons";
import { useDateFilter } from "../hooks/useDateFilter";
import { useAuthFetch } from "../hooks/useAuthFetch";
import { API_BASE_URL } from "../utils/api";
import "../style/Workout.css";
import { toast } from "react-toastify";
import { FiZap } from "react-icons/fi";

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

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const { loading, error, execute, setError } = useAuthFetch();
  const { filter, setFilter, filteredItems: filteredWorkouts } = useDateFilter(workouts, "date");

  // Memoize selected type to prevent unnecessary re-renders
  const selectedType = useMemo(
    () => workoutTypes.find(t => t._id === workoutTypeId),
    [workoutTypeId, workoutTypes]
  );

  const trackingType = selectedType?.trackingType || 'both';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [workoutRes, typesRes] = await Promise.all([
        execute({ method: 'GET', url: '/api/workouts' }),
        execute({ method: 'GET', url: '/api/workout-types' }),
      ]);
      setWorkouts(workoutRes);
      setWorkoutTypes(typesRes);
    } catch (err) {
      toast.error("Failed to load workouts.");
    }
  };

  const validateWorkout = (data, type) => {
    const trackType = type?.trackingType || 'both';

    if ((trackType === 'sets_reps' || trackType === 'both') && (!data.sets || Number(data.sets) <= 0)) {
      setError('Sets must be greater than 0.');
      return false;
    }
    if ((trackType === 'sets_reps' || trackType === 'both') && (!data.reps || Number(data.reps) <= 0)) {
      setError('Reps must be greater than 0.');
      return false;
    }
    if ((trackType === 'duration_only' || trackType === 'both') && (!data.duration || Number(data.duration) <= 0)) {
      setError('Duration must be greater than 0.');
      return false;
    }
    return true;
  };

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
    const editSelectedType = workoutTypes.find(t => t._id === editData.workoutTypeId);

    if (!validateWorkout(editData, editSelectedType)) {
      return;
    }

    try {
      const data = await execute({
        method: 'PUT',
        url: `/api/workouts/${id}`,
        data: editData,
      });

      const selectedType = workoutTypes.find((t) => t._id === editData.workoutTypeId);
      const updatedWorkout = {
        ...data,
        workoutTypeId: data.workoutTypeId?.name ? data.workoutTypeId : selectedType
      };

      setWorkouts(workouts.map((w) => (w._id === id ? updatedWorkout : w)));
      setEditId(null);
      setEditData({});
      setError(null);
      toast.success("Workout updated!");
    } catch (err) {
      toast.error("Failed to update workout.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!workoutTypeId) {
      setError('Please select an exercise.');
      return;
    }

    if (!validateWorkout({ sets, reps, duration }, selectedType)) {
      return;
    }

    try {
      const data = await execute({
        method: 'POST',
        url: '/api/workouts',
        data: { workoutTypeId, sets, reps, duration },
      });

      const selectedType = workoutTypes.find((t) => t._id === workoutTypeId);
      const newWorkout = {
        ...data,
        workoutTypeId: data.workoutTypeId?.name ? data.workoutTypeId : selectedType
      };

      setWorkouts([newWorkout, ...workouts]);
      setWorkoutTypeId('');
      setSets('');
      setReps('');
      setDuration('');
      toast.success("Workout logged! 💪");
    } catch (err) {
      toast.error("Failed to log workout.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await execute({
        method: 'DELETE',
        url: `/api/workouts/${id}`,
      });
      setWorkouts(workouts.filter((w) => w._id !== id));
      toast.success("Workout deleted.");
    } catch (err) {
      toast.error("Failed to delete workout.");
    }
  };

  return (
    <div className="container page-wrapper">
      {/* Page Header */}
      <div className="apex-page-header">
        <div className="apex-subtitle">Activity Tracker</div>
        <h1 className="apex-title">LOG <span>WORKOUT</span></h1>
      </div>

      {error && <div className="dashboard-alert mb-4" role="alert">{error}</div>}

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
                required
                aria-required="true"
              >
                <option value="">Select Exercise</option>
                {workoutTypes.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.caloriesPerMinute} cal/min)
                  </option>
                ))}
              </select>
            </div>

            {/* Sets — only show for sets_reps or both */}
            {(trackingType === 'sets_reps' || trackingType === 'both') && (
              <NumberInput
                name="sets"
                label="Sets"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                placeholder="Sets"
                min={0}
                className="col-md-2"
              />
            )}

            {/* Reps — only show for sets_reps or both */}
            {(trackingType === 'sets_reps' || trackingType === 'both') && (
              <NumberInput
                name="reps"
                label="Reps"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="Reps"
                min={0}
                className="col-md-2"
              />
            )}

            {/* Duration — only show for duration_only or both */}
            {(trackingType === 'duration_only' || trackingType === 'both') && (
              <NumberInput
                name="duration"
                label="Duration (min)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Mins"
                min={0}
                className="col-md-2"
              />
            )}

            <div className="col-md-2 d-flex align-items-end">
              <button className="btn apex-btn-primary w-100" type="submit" disabled={loading}>
                {loading ? "Logging..." : "LOG WORKOUT"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Date Filter Buttons */}
      <FilterButtons filter={filter} setFilter={setFilter} />

      {/* Workout Cards */}
      {loading && workouts.length === 0 ? (
        <div className="text-center py-5"><Spinner /></div>
      ) : (
        <div className="row g-3">
          {filteredWorkouts.length === 0 && (
            <div className="col-12 text-center text-muted py-5">
              No workouts logged for this filter. Start training!
            </div>
          )}
          {filteredWorkouts.map((w) => (
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
                        aria-label="Select exercise to edit"
                      >
                        <option value="">Select Exercise</option>
                        {workoutTypes.map((t) => (
                          <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                      </select>
                      <div className="row g-2 mb-3">
                        {(() => {
                          const eType = workoutTypes.find(t => t._id === editData.workoutTypeId);
                          const et = eType?.trackingType || 'both';
                          return (
                            <>
                              {(et === 'sets_reps' || et === 'both') && (
                                <div className="col-4">
                                  <input
                                    type="number"
                                    className="form-control apex-input"
                                    placeholder="Sets"
                                    min={0}
                                    value={editData.sets}
                                    onChange={(e) => setEditData({...editData, sets: e.target.value})}
                                    aria-label="Edit sets"
                                  />
                                </div>
                              )}
                              {(et === 'sets_reps' || et === 'both') && (
                                <div className="col-4">
                                  <input
                                    type="number"
                                    className="form-control apex-input"
                                    placeholder="Reps"
                                    min={0}
                                    value={editData.reps}
                                    onChange={(e) => setEditData({...editData, reps: e.target.value})}
                                    aria-label="Edit reps"
                                  />
                                </div>
                              )}
                              {(et === 'duration_only' || et === 'both') && (
                                <div className="col-4">
                                  <input
                                    type="number"
                                    className="form-control apex-input"
                                    placeholder="Duration"
                                    min={0}
                                    value={editData.duration}
                                    onChange={(e) => setEditData({...editData, duration: e.target.value})}
                                    aria-label="Edit duration"
                                  />
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-success btn-sm flex-grow-1" onClick={() => handleUpdate(w._id)} aria-label="Save changes">
                          Save
                        </button>
                        <button className="btn btn-secondary btn-sm flex-grow-1" onClick={() => setEditId(null)} aria-label="Cancel editing">
                          Cancel
                        </button>
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
                          <FiZap aria-hidden="true" /> {w.caloriesBurned} <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>KCAL</span>
                        </div>
                      </div>

                      <div className="d-flex gap-2 pt-2 apex-card-action-bar">
                        <button className="btn apex-btn-edit btn-sm flex-grow-1" onClick={() => handleEdit(w)} aria-label={`Edit ${w.workoutTypeId?.name}`}>
                          Edit
                        </button>
                        <button className="btn apex-btn-delete btn-sm flex-grow-1" onClick={() => handleDelete(w._id)} aria-label={`Delete ${w.workoutTypeId?.name}`}>
                          Delete
                        </button>
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