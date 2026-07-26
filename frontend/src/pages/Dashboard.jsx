import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
);
import { Line, Bar } from "react-chartjs-2";
import axios from "axios";
import Spinner from "../components/Spinner";
function Dashboard() {
  const [workout, setWorkout] = useState([]);
  const [diet, setDiet] = useState([]);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [error,setError] = useState();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log(token);
        setLoading(true);
         const [workoutRes, dietRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/workouts`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/diet`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setWorkout(workoutRes.data);
      setDiet(dietRes.data);
      }  catch(err) {
      setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
    {error && (
  <div className='alert alert-danger mt-3'>
     {error}
  </div>
)}
      {loading ? (
        <Spinner />
      ) : (
        <div className="container mt-4">
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card p-3 shadow">
                <h5>🏋️ Workout Summary</h5>
                <p>
                  Total Workouts: <strong>{workout.length}</strong>
                </p>
                <p>
                  Total Calories Burned:{" "}
                  <strong>
                    {workout.reduce(
                      (sum, w) => sum + (w.caloriesBurned || 0),
                      0,
                    ).toFixed(2)}
                  </strong>
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card p-3 shadow">
                <h5>🥗 Calorie Summary</h5>
                <p>
                  Total Food Logged: <strong>{diet.length}</strong>
                </p>
                <p>
                  Total Calories Consumed:{" "}
                  <strong>
                    {diet.reduce((sum, d) => sum + (d.calories || 0), 0)}
                  </strong>
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="card p-3 shadow">
                <h5>📊 Workout Chart</h5>
                <Bar
                  data={{
                    labels: workout.map((w) => w.exerciseName),
                    datasets: [
                      {
                        label: "Calories Burned",
                        data: workout.map((w) => w.caloriesBurned || 0),
                        backgroundColor: "rgba(54,162,235,0.6)",
                      },
                    ],
                  }}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="card p-3 shadow">
                <h5>📈 Calorie Chart</h5>
                <Line
                  data={{
                    labels: diet.map((d) => d.foodName),
                    datasets: [
                      {
                        label: "Calories Consumed",
                        data: diet.map((d) => d.calories || 0),
                        borderColor: "rgba(255,99,132,1)",
                        fill: false,
                      },
                    ],
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;
