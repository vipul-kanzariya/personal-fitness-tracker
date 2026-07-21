import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";

function Workout() {
  const [workouts, setWorkouts] = useState([]);
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState();
  const [reps, setReps] = useState();
  const [duration, setDuration] = useState();
  const [caloriesBurned, setCaloriesBurned] = useState();
  const [loading, setLoading] = useState(false);
  const [error,setError] = useState();
  const [editId, setEditId] = useState(null); 
const [editData, setEditData] = useState({}); 
  
  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const token = localStorage.getItem("token");
        setLoading(true);
        const workout = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/workouts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setWorkouts(workout.data);
      }catch(err) {
    setError('Failed to load workouts.');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkout();
  }, []);
  const handleEdit = (workout) => {
  setEditId(workout._id);
  setEditData({
    exerciseName: workout.exerciseName,
    sets: workout.sets,
    reps: workout.reps,
    duration: workout.duration,
    caloriesBurned: workout.caloriesBurned
  });
}
  const handleUpdate = async(id) => {
 if (!editData.exerciseName.trim()) {
  setError("Exercise name cannot be empty.");
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
if (!editData.caloriesBurned || editData.caloriesBurned <= 0) {
  setError("Calories must be greater than 0.");
  return;
}

  
  try{
    const token = localStorage.getItem('token');
    const res = await axios.put(
      `${import.meta.env.VITE_API_URL}/api/workouts/${id}`,
      editData,
      { headers: { Authorization: `Bearer ${token}` }}
    );
    setWorkouts(workouts.map(w => w._id === id ? res.data : w));
    setEditId(null); 
    setEditData({});
    setError(null); 
  }catch(err){
    setError('Failed to update workout.');
  }
}

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/workouts`,
        {
          exerciseName,
          sets,
          reps,
          duration,
          caloriesBurned,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setWorkouts([res.data, ...workouts]);

      setExerciseName("");
      setSets("");
      setReps("");
      setDuration("");
      setCaloriesBurned("");
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
      {error && (
  <div className='alert alert-danger mt-3'>
     {error}
  </div>
)}
      <div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="exercise">Exercise Name</label>
          <input
            type="text"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            id="exercise"
            placeholder="Enter Exercise Name"
          />

          <label htmlFor="sets">Sets</label>
          <input
            type="number"
            min="0"
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
            min="0"
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
            min="0"
            onKeyDown={(e) =>
              ["e", "-", "+"].includes(e.key) && e.preventDefault()
            }
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            id="duration"
            placeholder="Enter Duration"
          />

          <label htmlFor="calories">Calories</label>
          <input
            type="number"
            min="0"
            onKeyDown={(e) =>
              ["e", "-", "+"].includes(e.key) && e.preventDefault()
            }
            value={caloriesBurned}
            onChange={(e) => setCaloriesBurned(e.target.value)}
            id="calories"
            placeholder="Enter Calories"
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
          <input type='text' className='form-control'
            value={editData.exerciseName}
            onChange={(e) => setEditData({...editData, exerciseName: e.target.value})}/>
        </td>
        <td>
          <input type='number' className='form-control' min='0'
            value={editData.sets}
            onChange={(e) => setEditData({...editData, sets: e.target.value})}/>
        </td>
        <td>
          <input type='number' className='form-control' min='0'
            value={editData.reps}
            onChange={(e) => setEditData({...editData, reps: e.target.value})}/>
        </td>
        <td>
          <input type='number' className='form-control' min='0'
            value={editData.duration}
            onChange={(e) => setEditData({...editData, duration: e.target.value})}/>
        </td>
        <td>
          <input type='number' className='form-control' min='0'
            value={editData.caloriesBurned}
            onChange={(e) => setEditData({...editData, caloriesBurned: e.target.value})}/>
        </td>
        <td>
          <button className='btn btn-success btn-sm me-1'
            onClick={() => handleUpdate(w._id)}>Save</button>
          <button className='btn btn-secondary btn-sm'
            onClick={() => setEditId(null)}>Cancel</button>
        </td>
      </>
    ) : (
      // ✅ Normal mode
      <>
        <td>{w.exerciseName}</td>
        <td>{w.sets}</td>
        <td>{w.reps}</td>
        <td>{w.duration}</td>
        <td>{w.caloriesBurned}</td>
        <td>
          <button className='btn btn-warning btn-sm me-1'
            onClick={() => handleEdit(w)}>Edit</button>
          <button className='btn btn-danger btn-sm'
            onClick={() => handleDelete(w._id)}>Delete</button>
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
