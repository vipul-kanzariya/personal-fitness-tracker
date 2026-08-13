// src/components/Dashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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

function useTypewriter(text, speed = 60) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return displayed;
}

const isToday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

// ✅ Local date string (no UTC shift — fixes "1 Day" missing today's data in IST)
const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function Dashboard() {
  const { isLight, colors } = useTheme();
  const [workout, setWorkout] = useState([]);
  const [diet, setDiet] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const [range, setRange] = useState("week");
  const [customDate, setCustomDate] = useState(new Date());
  const [historyWorkouts, setHistoryWorkouts] = useState([]);
  const [historyDiet, setHistoryDiet] = useState([]);
  const [historyBmi, setHistoryBmi] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [visibleMetrics, setVisibleMetrics] = useState({
    workout: true,
    diet: true,
    bmi: true,
  });

  const activeRequestId = useRef(0);

  const userName = localStorage.getItem("name") || "Athlete";
  const typedName = useTypewriter(userName.toUpperCase(), 80);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        setLoading(true);
        const [workoutRes, dietRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/workouts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/diet`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setWorkout(workoutRes.data);
        setDiet(dietRes.data);
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Fixed: local date, no timezone shift
  const getDateRange = () => {
    const to = new Date();
    let from = new Date();
    if (range === "day") {
      from = new Date();
    } else if (range === "week") {
      from.setDate(to.getDate() - 6);
    } else if (range === "3months") {
      from.setMonth(to.getMonth() - 3);
    } else if (range === "custom") {
      from = new Date(customDate);
      return {
        from: toLocalDateString(from),
        to: toLocalDateString(from),
      };
    }
    return {
      from: toLocalDateString(from),
      to: toLocalDateString(to),
    };
  };

  useEffect(() => {
    const fetchHistory = async () => {
      const requestId = ++activeRequestId.current;
      try {
        setIsRefreshing(true);
        setHistoryLoading(true);

        const token = localStorage.getItem("token");
        const { from, to } = getDateRange();

        const [wRes, dRes, bRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_API_URL}/api/workouts?from=${from}&to=${to}`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
          axios.get(
            `${import.meta.env.VITE_API_URL}/api/diet?from=${from}&to=${to}`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
          axios.get(
            `${import.meta.env.VITE_API_URL}/api/bmi/history?from=${from}&to=${to}`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
        ]);

        if (requestId === activeRequestId.current) {
          setHistoryWorkouts(wRes.data || []);
          setHistoryDiet(dRes.data || []);
          setHistoryBmi(bRes.data || []);
        }
      } catch (err) {
        console.log(err.message);
      } finally {
        if (requestId === activeRequestId.current) {
          setHistoryLoading(false);
          setTimeout(() => {
            setIsRefreshing(false);
          }, 150);
        }
      }
    };

    fetchHistory();
  }, [range, customDate]);

  const toggleMetric = (metric) => {
    setVisibleMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric],
    }));
  };

  const getGradient = (ctx, colorHex, opacityTop = "50", opacityBottom = "00") => {
    if (!ctx) return colorHex;
    const gradient = ctx.createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, `${colorHex}${opacityTop}`);
    gradient.addColorStop(1, `${colorHex}${opacityBottom}`);
    return gradient;
  };

  const groupByDate = (items, dateField, valueField) => {
    const map = {};
    items.forEach((item) => {
      const dateObj = new Date(item[dateField] || item.createdAt);
      let d;
      if (range === "day") {
        // Hourly breakdown — e.g. "09 AM"
        d = dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", hour12: true });
      } else if (range === "3months") {
        // Monthly breakdown — e.g. "Aug '26"
        d = dateObj.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      } else {
        // Daily breakdown — e.g. "06 Aug" (week / custom date)
        d = dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      }
      map[d] = {
        value: (map[d]?.value || 0) + (Number(item[valueField]) || 0),
        rawDate: dateObj.getTime(),
      };
    });
    return map;
  };
  const getMonthLabels = () => {
    const labels = [];
    const now = new Date();
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }));
    }
    return labels;
  };

  const todayWorkouts = workout.filter((w) => isToday(w.createdAt || w.date));
  const todayDiet = diet.filter((d) => isToday(d.createdAt || d.date));

  const totalCaloriesBurned = todayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const totalCaloriesConsumed = todayDiet.reduce((sum, d) => sum + (d.calories || 0), 0);
  const totalDuration = todayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);

  const dailyGoal = 2000;
  const goalPercent = Math.min(Math.round((totalCaloriesConsumed / dailyGoal) * 100), 100);

  const formatLabel = (str) => {
    if (!str) return "Item";
    return str
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  };

  const ringData = {
    labels: ["Consumed", "Remaining"],
    datasets: [
      {
        data: [goalPercent, 100 - goalPercent],
        backgroundColor: [colors.accent, isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.08)"],
        borderWidth: 0,
        cutout: "80%",
      },
    ],
  };

  const workoutMapGrouped = groupByDate(historyWorkouts, "date", "caloriesBurned");
  const dietMapGrouped = groupByDate(historyDiet, "date", "calories");
  const bmiMapGrouped = groupByDate(historyBmi, "createdAt", "bmi");

  const dateMapEntries = new Map();
  [workoutMapGrouped, dietMapGrouped, bmiMapGrouped].forEach((group) => {
    Object.keys(group).forEach((label) => {
      if (!dateMapEntries.has(label)) {
        dateMapEntries.set(label, group[label].rawDate);
      }
    });
  });

    const sortedLabelsWithTime = Array.from(dateMapEntries.entries()).sort((a, b) => a[1] - b[1]);
  const sortedDates = range === "3months"
    ? getMonthLabels()
    : sortedLabelsWithTime.map((entry) => entry[0]);

  const workoutMap = {};
  Object.keys(workoutMapGrouped).forEach((k) => (workoutMap[k] = workoutMapGrouped[k].value));

  const dietMap = {};
  Object.keys(dietMapGrouped).forEach((k) => (dietMap[k] = dietMapGrouped[k].value));

  const bmiMap = {};
  Object.keys(bmiMapGrouped).forEach((k) => (bmiMap[k] = bmiMapGrouped[k].value));

  const workoutColor = colors.accent || "#00c6ff";
  const dietColor = "#ff5e7e";
  const bmiColor = "#10b981";

 // yeh line
const chartKey = `history-${range}-${customDate ? customDate.toISOString().slice(0, 10) : ""}`;

  // ✅ Dummy fallback removed — real empty array now, "No data" message shown instead
  const workoutDataset = {
    label: "Workout (Calories Burned)",
    data: sortedDates.map((d) => workoutMap[d] || 0),
    borderColor: workoutColor,
    backgroundColor: (context) => getGradient(context.chart.ctx, workoutColor, "30", "00"),
    fill: true,
    tension: 0.45,
    cubicInterpolationMode: "monotone",
    pointRadius: 5,
    pointHoverRadius: 8,
    pointBackgroundColor: workoutColor,
    borderWidth: 3,
    yAxisID: "y",
  };

  const dietDataset = {
    label: "Diet (Calories Consumed)",
    data: sortedDates.map((d) => dietMap[d] || 0),
    borderColor: dietColor,
    backgroundColor: (context) => getGradient(context.chart.ctx, dietColor, "25", "00"),
    fill: true,
    tension: 0.45,
    cubicInterpolationMode: "monotone",
    pointRadius: 5,
    pointHoverRadius: 8,
    pointBackgroundColor: dietColor,
    borderWidth: 3,
    yAxisID: "y",
  };

  const bmiDataset = {
    label: "BMI",
    data: sortedDates.map((d) => bmiMap[d] || 0),
    borderColor: bmiColor,
    backgroundColor: (context) => getGradient(context.chart.ctx, bmiColor, "20", "00"),
    fill: false,
    tension: 0.45,
    cubicInterpolationMode: "monotone",
    pointRadius: 5,
    pointHoverRadius: 8,
    pointBackgroundColor: bmiColor,
    borderWidth: 3,
    yAxisID: "yBmi",
  };

  const visibleHistoryDatasets = [
    visibleMetrics.workout && workoutDataset,
    visibleMetrics.diet && dietDataset,
    visibleMetrics.bmi && bmiDataset,
  ].filter(Boolean);

  const multiWaveData = {
    labels: sortedDates,
    datasets: visibleHistoryDatasets,
  };

  const hasHistoryData = sortedDates.length > 0;

  return (
    <main className="main-content">
      {/* Header */}
      <div className="dashboard-header">
        <div className="apex-subtitle">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
        <h1 className="apex-title">
          WELCOME BACK,{" "}
          <span>
            {typedName}
            <span className="typing-cursor">|</span>
          </span>
        </h1>
        <p className="dashboard-streak">
          Here is your progress for today — view full history below.
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
                <div className="apex-card-val">{todayWorkouts.length}</div>
                <div className="apex-card-sub">Workouts Logged Today</div>
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
                    maintainAspectRatio: false,
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

            <div className="dashboard-chart-card">
              <div className="dashboard-chart-header">
                <div className="dashboard-chart-title">WORKOUT INTENSITY</div>
                <div className="apex-subtitle">Calories burned per exercise</div>
              </div>
              <div className="dashboard-chart-wrapper">
                <Bar
                  data={{
                    labels: todayWorkouts.map((w) => formatLabel(w.workoutTypeId?.name)),
                    datasets: [
                      {
                        label: "Calories Burned",
                        data: todayWorkouts.map((w) => w.caloriesBurned || 0),
                        backgroundColor: colors.accent,
                        borderRadius: 6,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: {
                        offset: true,
                        grid: { display: false },
                        ticks: { color: colors.textMuted, font: { family: "Fira Code", size: 10 } },
                      },
                      y: {
                        grid: { color: colors.chartGrid },
                        ticks: { color: colors.textMuted, font: { family: "Fira Code", size: 10 } },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="dashboard-chart-card">
              <div className="dashboard-chart-header">
                <div className="dashboard-chart-title">CALORIE INTAKE</div>
                <div className="apex-subtitle">Consumed per meal log</div>
              </div>
              <div className="dashboard-chart-wrapper">
                <Line
                  data={{
                    labels: todayDiet.map((d) => formatLabel(d.foodName)),
                    datasets: [
                      {
                        label: "Calories Consumed",
                        data: todayDiet.map((d) => d.calories || 0),
                        borderColor: colors.accent,
                        backgroundColor: isLight ? "rgba(79, 70, 229, 0.1)" : "rgba(163, 230, 53, 0.08)",
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: colors.accent,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: { padding: { right: 25, left: 10 } },
                    plugins: { legend: { display: false } },
                    scales: {
                      x: {
                        offset: true,
                        grid: { display: false },
                        ticks: {
                          color: colors.textMuted,
                          font: { family: "Fira Code", size: 10 },
                          maxRotation: 0,
                          autoSkip: false,
                        },
                      },
                      y: {
                        grid: { color: colors.chartGrid },
                        ticks: { color: colors.textMuted, font: { family: "Fira Code", size: 10 } },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* ==========================================
              HISTORY & PROGRESS SECTION
              — isRefreshing class scoped here only (not whole page)
              — Title always on its own row, controls always on their own row below
              ========================================== */}
          <div className={`mt-4 dashboard-refresh-container ${isRefreshing ? "dashboard-refreshing" : ""}`}>
            <div className="dashboard-chart-card p-4">

              {/* Row 1 — Title (always full width, own row) */}
              <div className="mb-3">
                <p
                  className="text-uppercase fw-semibold mb-1"
                  style={{ fontSize: "0.75rem", letterSpacing: "1px", color: colors.textMuted }}
                >
                  STATISTICS
                </p>
                <h2
                  className="d-flex flex-wrap align-items-center gap-2 fw-bold mb-0"
                  style={{ fontSize: "1.25rem", color: colors.textPrimary }}
                >
                  <span>🗓️</span>
                  <span>HISTORY & PROGRESS</span>
                  <span style={{ color: colors.textMuted }}>—</span>
                  <span style={{ color: colors.textMuted, fontWeight: "normal", fontSize: "1rem" }}>
                    WORKOUT, DIET & BMI
                  </span>
                </h2>
              </div>

              {/* Row 2 — Controls (ALWAYS its own row, never shares line with title) */}
              <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
                <button
                  className={`btn btn-sm ${range === "day" ? "btn-accent" : "btn-outline-secondary"}`}
                  onClick={() => setRange("day")}
                >
                  1 Day
                </button>
                <button
                  className={`btn btn-sm ${range === "week" ? "btn-accent" : "btn-outline-secondary"}`}
                  onClick={() => setRange("week")}
                >
                  1 Week
                </button>
                <button
                  className={`btn btn-sm ${range === "3months" ? "btn-accent" : "btn-outline-secondary"}`}
                  onClick={() => setRange("3months")}
                >
                  3 Months
                </button>
                <DatePicker
                  selected={customDate}
                  onChange={(date) => {
                    if (date) {
                      setCustomDate(date);
                      setRange("custom");
                    }
                  }}
                  className="form-control form-control-sm"
                  maxDate={new Date()}
                  placeholderText="📆 Pick date"
                />
              </div>

              {/* Chart / No-data state */}
              <div
                key={chartKey}
                className="dashboard-chart-wrapper history-chart-container"
                style={{ height: "350px", position: "relative" }}
              >
                {historyLoading && (
                  <div className="history-loading-overlay">
                    <div className="history-skeleton-shimmer"></div>
                    <Spinner />
                  </div>
                )}

                {!historyLoading && !hasHistoryData ? (
                  <div className="d-flex align-items-center justify-content-center h-100 text-subtle text-center px-3">
                    No workout, diet, or BMI records found in this date range.
                  </div>
                ) : (
                  <Line
                    data={multiWaveData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: { duration: 700, easing: "easeInOutQuart" },
                      interaction: { mode: "index", intersect: false },
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: isLight ? "rgba(255, 255, 255, 0.95)" : "rgba(22, 22, 22, 0.95)",
                          titleColor: isLight ? "#0f172a" : "#ffffff",
                          bodyColor: isLight ? "#475569" : "#cbd5e1",
                          borderColor: colors.borderColor || "#2a2a2a",
                          borderWidth: 1,
                          padding: 12,
                          boxPadding: 6,
                          usePointStyle: true,
                        },
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: {
                            color: colors.textMuted,
                            font: { family: "Inter, sans-serif", size: 11, weight: "500" },
                          },
                        },
                        y: {
                          type: "linear",
                          display: true,
                          position: "left",
                          title: { display: true, text: "Calories (kcal)", color: colors.textMuted },
                          grid: { color: colors.chartGrid || "rgba(255, 255, 255, 0.05)", drawBorder: false },
                          ticks: { color: colors.textMuted, font: { family: "Inter, sans-serif", size: 11 } },
                        },
                        yBmi: {
                          type: "linear",
                          display: visibleMetrics.bmi,
                          position: "right",
                          title: { display: true, text: "BMI", color: bmiColor },
                          grid: { drawOnChartArea: false },
                          ticks: { color: bmiColor, font: { family: "Inter, sans-serif", size: 11 } },
                        },
                      },
                    }}
                  />
                )}
              </div>

              {/* Metric Toggle Pills */}
              <div className="d-flex flex-wrap align-items-center justify-content-between mt-4 pt-3 border-top border-secondary border-opacity-10">
                <div className="history-filter-buttons d-flex flex-wrap align-items-center gap-3">
                  <button
                    type="button"
                    className="history-filter-btn border-0 rounded-pill px-4 py-2 text-white fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                    style={{
                      backgroundColor: visibleMetrics.workout ? workoutColor : isLight ? "#cbd5e1" : "#475569",
                      opacity: visibleMetrics.workout ? 1 : 0.75,
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "pointer",
                      letterSpacing: "0.3px",
                      boxShadow: visibleMetrics.workout ? "0 4px 12px rgba(99, 102, 241, 0.35)" : "none",
                    }}
                    onClick={() => toggleMetric("workout")}
                    aria-pressed={visibleMetrics.workout}
                  >
                    <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#ffffff", display: "inline-block" }}></span>
                    Workout
                  </button>

                  <button
                    type="button"
                    className="history-filter-btn border-0 rounded-pill px-4 py-2 text-white fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                    style={{
                      backgroundColor: visibleMetrics.diet ? dietColor : isLight ? "#cbd5e1" : "#475569",
                      opacity: visibleMetrics.diet ? 1 : 0.75,
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "pointer",
                      letterSpacing: "0.3px",
                      boxShadow: visibleMetrics.diet ? "0 4px 12px rgba(255, 94, 126, 0.35)" : "none",
                    }}
                    onClick={() => toggleMetric("diet")}
                    aria-pressed={visibleMetrics.diet}
                  >
                    <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#ffffff", display: "inline-block" }}></span>
                    Diet
                  </button>

                  <button
                    type="button"
                    className="history-filter-btn border-0 rounded-pill px-4 py-2 text-white fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                    style={{
                      backgroundColor: visibleMetrics.bmi ? bmiColor : isLight ? "#cbd5e1" : "#475569",
                      opacity: visibleMetrics.bmi ? 1 : 0.75,
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "pointer",
                      letterSpacing: "0.3px",
                      boxShadow: visibleMetrics.bmi ? "0 4px 12px rgba(16, 185, 129, 0.35)" : "none",
                    }}
                    onClick={() => toggleMetric("bmi")}
                    aria-pressed={visibleMetrics.bmi}
                  >
                    <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#ffffff", display: "inline-block" }}></span>
                    BMI
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default Dashboard;