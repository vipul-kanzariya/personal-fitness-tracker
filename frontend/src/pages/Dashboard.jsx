// src/components/Dashboard.jsx
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
  Filler, 
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import axios from "axios";
import Spinner from "../components/Spinner";
import { useTheme } from "../context/ThemeContext";
import "../style/Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Filler,  
  Tooltip,
  Legend,
);

function Dashboard() {
  const { isLight, colors } = useTheme();
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

  const dailyGoal = 2000;
  const goalPercent = Math.min(Math.round((totalCaloriesConsumed / dailyGoal) * 100), 100);

  // Capitalize exercise and food labels (e.g. pushUps -> Push Ups)
  const formatLabel = (str) => {
    if (!str) return "Item";
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  };

  // Theme-aware ring colors
  const ringData = {
    labels: ['Consumed', 'Remaining'],
    datasets: [{
      data: [goalPercent, 100 - goalPercent],
      backgroundColor: [
        colors.accent, 
        isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)'
      ],
      borderWidth: 0,
      cutout: '80%'
    }]
  };

  return (
    <main className="main-content">
      {/* Header */}
      <div className="dashboard-header">
        <div className="apex-subtitle">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <h1 className="apex-title">
          WELCOME BACK, <span>ATHLETE.</span>
        </h1>
        <p className="dashboard-streak">
          Here is your latest workout and nutrition overview.
        </p>
      </div>

      {error && <div className="dashboard-alert">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="dashboard-metrics-grid">
            <div className="apex-card-highlight dashboard-card-inner">
              <div className="dashboard-card-icon-highlight">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <div>
                <div className="apex-card-val">{totalCaloriesBurned.toFixed(2)}</div>
                <div className="apex-card-sub">Calories Burned</div>
              </div>
              <div className="dashboard-card-trend-highlight">Total energy expended</div>
            </div>

            <div className="dashboard-card-inner">
              <div className="dashboard-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="apex-card-val">{workout.length}</div>
                <div className="apex-card-sub">Workouts Logged</div>
              </div>
              <div className="dashboard-card-trend">Completed sessions</div>
            </div>

            <div className="dashboard-card-inner">
              <div className="dashboard-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="apex-card-val">{totalDuration}m</div>
                <div className="apex-card-sub">Active Time</div>
              </div>
              <div className="dashboard-card-trend">Time spent training</div>
            </div>

            <div className="dashboard-card-inner">
              <div className="dashboard-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <div className="apex-card-val">{totalCaloriesConsumed}</div>
                <div className="apex-card-sub">Calories Consumed</div>
              </div>
              <div className="dashboard-card-trend">Total dietary intake</div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="dashboard-charts-grid">
            
            {/* 1. Daily Goal Ring */}
            <div className="dashboard-chart-card">
              <div>
                <div className="dashboard-chart-title">DAILY GOAL</div>
                <div className="apex-subtitle">{totalCaloriesConsumed} / {dailyGoal} kcal goal</div>
              </div>

              <div className="dashboard-ring-container">
                <Doughnut 
                  data={ringData} 
                  options={{
                    rotation: -90,
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    responsive: true,
                    maintainAspectRatio: false
                  }} 
                />
                <div className="dashboard-ring-center">
                  <div className="dashboard-ring-val">{goalPercent}%</div>
                  <div className="dashboard-ring-sub">OF GOAL</div>
                </div>
              </div>

              <div className="dashboard-ring-footer">
                <div className="dashboard-mini-metric">
                  <div className="dashboard-mini-val">{totalCaloriesConsumed}</div>
                  <div className="dashboard-mini-label">Kcal In</div>
                </div>
                <div className="dashboard-mini-metric">
                  <div className="dashboard-mini-val">{totalCaloriesBurned.toFixed(0)}</div>
                  <div className="dashboard-mini-label">Kcal Out</div>
                </div>
              </div>
            </div>

            {/* 2. Workout Intensity Bar Chart */}
            <div className="dashboard-chart-card">
              <div className="dashboard-chart-header">
                <div className="dashboard-chart-title">WORKOUT INTENSITY</div>
                <div className="apex-subtitle">Calories burned per exercise</div>
              </div>
              <div className="dashboard-chart-wrapper">
                <Bar
                  data={{
                    labels: workout.map((w) => formatLabel(w.workoutTypeId?.name)),
                    datasets: [{
                      label: "Calories Burned",
                      data: workout.map((w) => w.caloriesBurned || 0),
                      backgroundColor: colors.accent,
                      borderRadius: 6,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { 
                        offset: true,
                        grid: { display: false }, 
                        ticks: { color: colors.textMuted, font: { family: 'Fira Code', size: 10 } } 
                      },
                      y: { 
                        grid: { color: colors.chartGrid }, 
                        ticks: { color: colors.textMuted, font: { family: 'Fira Code', size: 10 } } 
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* 3. Calorie Intake Line Chart */}
            <div className="dashboard-chart-card">
              <div className="dashboard-chart-header">
                <div className="dashboard-chart-title">CALORIE INTAKE</div>
                <div className="apex-subtitle">Consumed per meal log</div>
              </div>
              <div className="dashboard-chart-wrapper">
                <Line
                  data={{
                    labels: diet.map((d) => formatLabel(d.foodName)),
                    datasets: [{
                      label: "Calories Consumed",
                      data: diet.map((d) => d.calories || 0),
                      borderColor: colors.accent,
                      backgroundColor: isLight ? "rgba(79, 70, 229, 0.1)" : "rgba(163, 230, 53, 0.08)",
                      fill: true,
                      tension: 0.4,
                      pointRadius: 4,
                      pointBackgroundColor: colors.accent,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                      padding: { right: 25, left: 10 }
                    },
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { 
                        offset: true,
                        grid: { display: false }, 
                        ticks: { 
                          color: colors.textMuted, 
                          font: { family: 'Fira Code', size: 10 },
                          maxRotation: 0,
                          autoSkip: false
                        } 
                      },
                      y: { 
                        grid: { color: colors.chartGrid }, 
                        ticks: { color: colors.textMuted, font: { family: 'Fira Code', size: 10 } } 
                      }
                    }
                  }}
                />
              </div>
            </div>

          </div>
        </>
      )}
    </main>
  );
}

export default Dashboard;