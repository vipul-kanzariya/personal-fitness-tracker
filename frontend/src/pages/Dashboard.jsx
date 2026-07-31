import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
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
  ArcElement,
  Title,
  Tooltip,
  Legend,
);
import { Line, Bar, Doughnut } from "react-chartjs-2";
import axios from "axios";
import Spinner from "../components/Spinner";

function Dashboard() {
  const [workout, setWorkout] = useState([]);
  const [diet, setDiet] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
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
      } catch(err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalCaloriesBurned = workout.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const totalCaloriesConsumed = diet.reduce((sum, d) => sum + (d.calories || 0), 0);
  const totalDuration = workout.reduce((sum, w) => sum + (w.duration || 0), 0);
  const netCalories = totalCaloriesConsumed - totalCaloriesBurned;

  // Daily goal assumption for the ring (2000 kcal intake goal)
  const dailyGoal = 2000;
  const goalPercent = Math.min(Math.round((totalCaloriesConsumed / dailyGoal) * 100), 100);

  const ringData = {
    labels: ['Consumed', 'Remaining'],
    datasets: [{
      data: [goalPercent, 100 - goalPercent],
      backgroundColor: ['#4f46e5', '#e2e8f0'],
      borderWidth: 0,
      cutout: '75%'
    }]
  };

  return (
    <div className="container page-wrapper">
      <h2 className="page-title">Dashboard</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? <div className="text-center py-5"><Spinner /></div> : (
        <>
          {/* Stat Cards */}
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-3">
              <div className="card stat-card stat-card-workout" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
                <div className="stat-card-icon">🔥</div>
                <div className="stat-card-label">Calories Burned</div>
                <div className="stat-card-value">{totalCaloriesBurned}</div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="card stat-card stat-card-workout">
                <div className="stat-card-icon">🏋️</div>
                <div className="stat-card-label">Workouts Logged</div>
                <div className="stat-card-value">{workout.length}</div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="card stat-card stat-card-diet" style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
                <div className="stat-card-icon">⏱️</div>
                <div className="stat-card-label">Active Time</div>
                <div className="stat-card-value">{totalDuration}m</div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="card stat-card stat-card-diet">
                <div className="stat-card-icon">🍽️</div>
                <div className="stat-card-label">Calories Consumed</div>
                <div className="stat-card-value">{totalCaloriesConsumed}</div>
              </div>
            </div>
          </div>

          {/* Charts + Ring */}
          <div className="row g-3">
            <div className="col-md-4">
              <div className="card chart-card h-100 text-center">
                <div className="card-body">
                  <div className="chart-title">Daily Goal</div>
                  <div style={{ position: 'relative', maxWidth: '220px', margin: '0 auto' }}>
                    <Doughnut data={ringData} options={{
                      plugins: { legend: { display: false }, tooltip: { enabled: false } }
                    }} />
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)', textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#4f46e5' }}>{goalPercent}%</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>of goal</div>
                    </div>
                  </div>
                  <p className="text-muted mt-3 mb-0">{totalCaloriesConsumed} / {dailyGoal} kcal goal</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card chart-card h-100">
                <div className="card-body">
                  <div className="chart-title">📊 Workout Chart</div>
                  <Bar
                    data={{
                      labels: workout.map((w) => w.workoutTypeId?.name),
                      datasets: [{
                        label: "Calories Burned",
                        data: workout.map((w) => w.caloriesBurned || 0),
                        backgroundColor: "rgba(79,70,229,0.7)",
                        borderRadius: 6,
                      }],
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                        y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card chart-card h-100">
                <div className="card-body">
                  <div className="chart-title">📈 Calorie Chart</div>
                  <Line
                    data={{
                      labels: diet.map((d) => d.foodName),
                      datasets: [{
                        label: "Calories Consumed",
                        data: diet.map((d) => d.calories || 0),
                        borderColor: "rgba(16,185,129,1)",
                        backgroundColor: "rgba(16,185,129,0.1)",
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                      }],
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                        y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;