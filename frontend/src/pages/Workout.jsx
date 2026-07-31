import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";

function Workout() {
  const [workouts, setWorkouts] = useState([]);
  const [sets, setSets] = useState();
  const [reps, setReps] = useState();
  const [duration, setDuration] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [workoutTypes, setWorkoutTypes] = useState([]);
  const [workoutTypeId, setWorkoutTypeId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        setLoading(true);
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
    if (!editData.workoutTypeId) {
      setError("Please select an exercise.");
      return;
    }
    if (!editData.sets || editData.sets <= 0) {
      setError("Sets must be greater than 0.");
      return;
    }
    if (!editData.reps || editData.reps <= 0) {
      setError("Reps must be greater than 0.");
      return;
    }
    if (!editData.duration || editData.duration <= 0) {
      setError("Duration must be greater than 0.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/workouts/${id}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setWorkouts(workouts.map((w) => (w._id === id ? res.data : w)));
      setEditId(null);
      setEditData({});
      setError(null);
    } catch (err) {
      setError("Failed to update workout.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      setLoading(true);
     const res = await axios.post(
  `${import.meta.env.VITE_API_URL}/api/workouts`,
  { workoutTypeId, sets, reps, duration }, 
  { headers: { Authorization: `Bearer ${token}` } }
);
setWorkouts([res.data, ...workouts]);
setWorkoutTypeId('');  
setSets(''); setReps(''); setDuration('');
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/workouts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkouts(workouts.filter((w) => w._id !== id));
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      <div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="workoutType">Exercise</label>
          <select
            id="workoutType"
            className="form-select"
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

          <label htmlFor="sets">Sets</label>
          <input
            type="number"
             min="0" step="0.1" 
            onKeyDown={(e) =>
              ["e", "-", "+"].includes(e.key) && e.preventDefault()
            }
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            id="sets"
            placeholder="Enter Sets"
          />

          <label htmlFor="reps">Reps</label>
          <input
            type="number"
             min="0" step="0.1" 
            onKeyDown={(e) =>
              ["e", "-", "+"].includes(e.key) && e.preventDefault()
            }
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            id="reps"
            placeholder="Enter Reps"
          />

          <label htmlFor="duration">Duration</label>
          <input
            type="number"
             min="0" step="0.1" 
            onKeyDown={(e) =>
              ["e", "-", "+"].includes(e.key) && e.preventDefault()
            }
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            id="duration"
            placeholder="Enter Duration"
          />

          
          <button type="submit">Submit</button>
        </form>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <div className="container mt-4">
          <table className="table table-bordered mt-3">
            <thead className="table-dark">
              <tr>
                <th>Exercise</th>
                <th>Sets</th>
                <th>Reps</th>
                <th>Duration</th>
                <th>Calories</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {workouts.map((w) => (
                <tr key={w._id}>
                  {editId === w._id ? (
                    // ✅ Edit mode
                    <>
                      <td>
                        <select
                          className="form-select"
                          value={editData.workoutTypeId || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              workoutTypeId: e.target.value,
                            })
                          }
                        >
                          <option value="">Select Exercise</option>
                          {workoutTypes.map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.name} ({t.caloriesPerMinute} cal/min)
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                           min="0" step="0.1" 
                          value={editData.sets}
                          onChange={(e) =>
                            setEditData({ ...editData, sets: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                           min="0" step="0.1" 
                          value={editData.reps}
                          onChange={(e) =>
                            setEditData({ ...editData, reps: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                           min="0" step="0.1" 
                          value={editData.duration}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              duration: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>{w.caloriesBurned} <small className="text-muted">(recalculated on save)</small></td>
                      <td>
                        <button
                          className="btn btn-success btn-sm me-1"
                          onClick={() => handleUpdate(w._id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditId(null)}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    // ✅ Normal mode
                    <>
                      <td>{w.workoutTypeId?.name}</td>
                      <td>{w.sets}</td>
                      <td>{w.reps}</td>
                      <td>{w.duration}</td>
                      <td>{w.caloriesBurned}</td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm me-1"
                          onClick={() => handleEdit(w)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(w._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default Workout;