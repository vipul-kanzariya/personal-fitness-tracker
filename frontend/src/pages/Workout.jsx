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
                  <td>{w.exerciseName}</td>
                  <td>{w.sets}</td>
                  <td>{w.reps}</td>
                  <td>{w.duration}</td>
                  <td>{w.caloriesBurned}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(w._id)}
                    >
                      Delete
                    </button>
                  </td>
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
