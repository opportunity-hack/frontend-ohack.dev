import React from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar, Line, Chart as ReactChart } from "react-chartjs-2";
import { DATA } from "./data";

ChartJS.register(
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
);

const C = {
    accent: "#FF5A1F",
    accent2: "#F7C948",
    good: "#7BC47F",
    bad: "#E5604F",
    neutral: "#7A8FA8",
    ink: "#F2EFE9",
    dim: "#9A9AA0",
    rule: "#2A2D35",
    bar: "#3A3F4D",
};

ChartJS.defaults.font.family = "'Inter Tight', 'Inter', sans-serif";
ChartJS.defaults.color = C.dim;
ChartJS.defaults.borderColor = C.rule;
ChartJS.defaults.font.size = 11;

const baseAxis = (gridColor = C.rule) => ({
    grid: { color: gridColor, drawBorder: false },
    ticks: { color: C.dim, font: { family: "'JetBrains Mono', monospace", size: 10 } },
});

const tooltipStyle = {
    backgroundColor: "#0E0F12",
    titleColor: C.ink,
    bodyColor: C.dim,
    borderColor: C.rule,
    borderWidth: 1,
    padding: 12,
    titleFont: { family: "'Inter Tight'", weight: "600", size: 12 },
    bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
};

const Panel = ({ title, sub, children, tall }) => (
    <div className="panel">
        <h3>{title}</h3>
        <div className="sub">{sub}</div>
        <div className={`chart-box${tall ? " tall" : ""}`}>{children}</div>
        <style jsx>{`
            .panel {
                background: #1B1E25;
                border: 1px solid ${C.rule};
                padding: 24px;
            }
            .panel h3 {
                font-family: 'Inter Tight', sans-serif;
                font-size: 14px;
                font-weight: 600;
                letter-spacing: 0.02em;
                margin-bottom: 4px;
                color: ${C.ink};
            }
            .panel .sub {
                font-size: 12px;
                color: ${C.dim};
                margin-bottom: 20px;
            }
            .chart-box {
                position: relative;
                height: 340px;
            }
            .chart-box.tall {
                height: 420px;
            }
            @media (max-width: 680px) {
                .chart-box {
                    height: 280px;
                }
            }
        `}</style>
    </div>
);

export const YearlyChart = () => (
    <Panel
        title="Registrations vs. Submissions by Year"
        sub="Bars = volume · Line = completion rate (right axis)"
        tall
    >
        <ReactChart
            type="bar"
            data={{
                labels: DATA.yearly.reg_year,
                datasets: [
                    { type: "bar", label: "Registered", data: DATA.yearly.total, backgroundColor: C.bar, borderRadius: 2, yAxisID: "y" },
                    { type: "bar", label: "Submitted", data: DATA.yearly.submitted, backgroundColor: C.accent, borderRadius: 2, yAxisID: "y" },
                    { type: "line", label: "Completion %", data: DATA.yearly.rate, borderColor: C.accent2, backgroundColor: C.accent2, tension: 0.3, yAxisID: "y1", pointRadius: 4, pointHoverRadius: 6, borderWidth: 2 },
                ],
            }}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: C.dim, font: { size: 11 } } }, tooltip: tooltipStyle },
                scales: {
                    x: baseAxis(),
                    y: { ...baseAxis(), title: { display: true, text: "Hackers", color: C.dim, font: { size: 10 } } },
                    y1: {
                        position: "right",
                        grid: { display: false },
                        ticks: { color: C.accent2, callback: (v) => v + "%", font: { family: "'JetBrains Mono'", size: 10 } },
                        title: { display: true, text: "Completion %", color: C.accent2, font: { size: 10 } },
                    },
                },
            }}
        />
    </Panel>
);

export const TeammateChart = () => (
    <Panel
        title="Completion by Team Status (at registration)"
        sub={`From the "Do you have teammates?" question · n=1,858`}
    >
        <Bar
            data={{
                labels: DATA.teammate.labels,
                datasets: [{ label: "Completion %", data: DATA.teammate.rate, backgroundColor: [C.good, C.accent2, C.bad], borderRadius: 2 }],
            }}
            options={{
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        ...tooltipStyle,
                        callbacks: {
                            label: (ctx) => `${ctx.parsed.x}% · ${DATA.teammate.submitted[ctx.dataIndex]}/${DATA.teammate.total[ctx.dataIndex]} submitted`,
                        },
                    },
                },
                scales: {
                    x: { ...baseAxis(), ticks: { ...baseAxis().ticks, callback: (v) => v + "%" }, max: 50 },
                    y: baseAxis(),
                },
            }}
        />
    </Panel>
);

export const TeamSizeChart = () => (
    <Panel
        title="Submission Rate by Project Team Size"
        sub="Final team size on DevPost project records · n=492"
    >
        <Bar
            data={{
                labels: DATA.team_size.labels.map((t) => t + (t === 1 ? " person" : " people")),
                datasets: [{
                    label: "Submission %",
                    data: DATA.team_size.rate,
                    backgroundColor: DATA.team_size.labels.map((t) => (t === 1 ? C.bad : t === 2 ? C.accent2 : C.good)),
                    borderRadius: 2,
                }],
            }}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        ...tooltipStyle,
                        callbacks: {
                            label: (ctx) => `${ctx.parsed.y}% · ${DATA.team_size.submitted[ctx.dataIndex]}/${DATA.team_size.total[ctx.dataIndex]} shipped`,
                        },
                    },
                },
                scales: {
                    x: baseAxis(),
                    y: { ...baseAxis(), max: 100, ticks: { ...baseAxis().ticks, callback: (v) => v + "%" } },
                },
            }}
        />
    </Panel>
);

export const SourceChart = () => (
    <Panel
        title="Channel Volume vs. Completion Quality"
        sub="Bars = registrants · Diamonds = completion rate"
        tall
    >
        <ReactChart
            type="bar"
            data={{
                labels: DATA.sources.source_cat,
                datasets: [
                    { type: "bar", label: "Registrants", data: DATA.sources.total, backgroundColor: C.bar, borderRadius: 2, yAxisID: "y" },
                    { type: "line", label: "Completion %", data: DATA.sources.rate, borderColor: C.accent, backgroundColor: C.accent, tension: 0, pointStyle: "rectRot", pointRadius: 6, pointHoverRadius: 9, borderWidth: 0, showLine: false, yAxisID: "y1" },
                ],
            }}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: C.dim } }, tooltip: tooltipStyle },
                scales: {
                    x: { ...baseAxis(), ticks: { ...baseAxis().ticks, maxRotation: 35, minRotation: 35 } },
                    y: { ...baseAxis(), title: { display: true, text: "Registrants", color: C.dim, font: { size: 10 } } },
                    y1: {
                        position: "right",
                        grid: { display: false },
                        ticks: { color: C.accent, callback: (v) => v + "%", font: { family: "'JetBrains Mono'", size: 10 } },
                        title: { display: true, text: "Completion %", color: C.accent, font: { size: 10 } },
                        max: 80,
                    },
                },
            }}
        />
    </Panel>
);

export const UniversitiesChart = () => (
    <Panel
        title="Top Universities by Registration Volume"
        sub="Top 10 schools · cleaned for naming variants"
        tall
    >
        <Bar
            data={{
                labels: DATA.universities.labels,
                datasets: [
                    { label: "Registered", data: DATA.universities.total, backgroundColor: C.bar, borderRadius: 2 },
                    { label: "Submitted", data: DATA.universities.submitted, backgroundColor: C.accent, borderRadius: 2 },
                ],
            }}
            options={{
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: C.dim } }, tooltip: tooltipStyle },
                scales: {
                    x: { ...baseAxis(), type: "logarithmic" },
                    y: baseAxis(),
                },
            }}
        />
    </Panel>
);

export const CitiesChart = () => (
    <Panel
        title="Top US Cities — Volume × Completion"
        sub="Cities with ≥20 registrants"
        tall
    >
        <ReactChart
            type="bar"
            data={{
                labels: DATA.cities.labels,
                datasets: [
                    { type: "bar", label: "Registered", data: DATA.cities.total, backgroundColor: C.bar, borderRadius: 2, yAxisID: "y" },
                    { type: "line", label: "Completion %", data: DATA.cities.rate, borderColor: C.accent2, backgroundColor: C.accent2, tension: 0.2, pointRadius: 4, yAxisID: "y1" },
                ],
            }}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: C.dim } }, tooltip: tooltipStyle },
                scales: {
                    x: { ...baseAxis(), ticks: { ...baseAxis().ticks, maxRotation: 45, minRotation: 45, font: { size: 9 } } },
                    y: baseAxis(),
                    y1: { position: "right", grid: { display: false }, ticks: { color: C.accent2, callback: (v) => v + "%" }, max: 60 },
                },
            }}
        />
    </Panel>
);

export const SpecialtyChart = () => (
    <Panel
        title="Job Specialty: Volume vs. Completion"
        sub="Self-declared role at registration"
    >
        <ReactChart
            type="bar"
            data={{
                labels: DATA.specialty.labels,
                datasets: [
                    { type: "bar", label: "Registered", data: DATA.specialty.total, backgroundColor: C.bar, borderRadius: 2, yAxisID: "y" },
                    { type: "line", label: "Completion %", data: DATA.specialty.rate, borderColor: C.accent, backgroundColor: C.accent, tension: 0.2, pointRadius: 4, yAxisID: "y1" },
                ],
            }}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: C.dim } }, tooltip: tooltipStyle },
                scales: {
                    x: { ...baseAxis(), ticks: { ...baseAxis().ticks, maxRotation: 35, minRotation: 35, font: { size: 9 } } },
                    y: baseAxis(),
                    y1: { position: "right", grid: { display: false }, ticks: { color: C.accent, callback: (v) => v + "%" }, max: 50 },
                },
            }}
        />
    </Panel>
);

export const DomainChart = () => (
    <Panel
        title="Email Domain Type → Completion"
        sub="A proxy for student vs. working professional"
    >
        <Bar
            data={{
                labels: DATA.domain.labels,
                datasets: [{ label: "Completion %", data: DATA.domain.rate, backgroundColor: [C.good, C.bad, C.neutral], borderRadius: 2 }],
            }}
            options={{
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        ...tooltipStyle,
                        callbacks: {
                            label: (ctx) => `${ctx.parsed.x}% · ${DATA.domain.submitted[ctx.dataIndex]}/${DATA.domain.total[ctx.dataIndex]}`,
                        },
                    },
                },
                scales: {
                    x: { ...baseAxis(), ticks: { ...baseAxis().ticks, callback: (v) => v + "%" }, max: 40 },
                    y: baseAxis(),
                },
            }}
        />
    </Panel>
);

export const TimingChart = () => (
    <Panel
        title="Registration Timing → Completion Rate"
        sub="Days before event close · last-minute is best"
    >
        <ReactChart
            type="bar"
            data={{
                labels: DATA.timing.labels,
                datasets: [
                    { type: "bar", label: "Registrants", data: DATA.timing.total, backgroundColor: C.bar, borderRadius: 2, yAxisID: "y" },
                    { type: "line", label: "Completion %", data: DATA.timing.rate, borderColor: C.accent2, backgroundColor: C.accent2, tension: 0.2, pointRadius: 5, yAxisID: "y1" },
                ],
            }}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: C.dim } }, tooltip: tooltipStyle },
                scales: {
                    x: baseAxis(),
                    y: baseAxis(),
                    y1: { position: "right", grid: { display: false }, ticks: { color: C.accent2, callback: (v) => v + "%" }, max: 50 },
                },
            }}
        />
    </Panel>
);

export const RepeatChart = () => (
    <Panel
        title="First-Timers vs. Repeat Hackers"
        sub="219 hackers attend 2+ events; max is 4"
    >
        <Bar
            data={{
                labels: DATA.repeat.labels,
                datasets: [
                    { label: "Total hackers", data: DATA.repeat.total, backgroundColor: C.bar, borderRadius: 2, yAxisID: "y" },
                    { label: "Completion %", data: DATA.repeat.rate, backgroundColor: C.accent, borderRadius: 2, yAxisID: "y1" },
                ],
            }}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: C.dim } }, tooltip: tooltipStyle },
                scales: {
                    x: baseAxis(),
                    y: { ...baseAxis(), title: { display: true, text: "Hackers", color: C.dim, font: { size: 10 } } },
                    y1: {
                        position: "right",
                        grid: { display: false },
                        ticks: { color: C.accent, callback: (v) => v + "%" },
                        max: 60,
                        title: { display: true, text: "Completion %", color: C.accent, font: { size: 10 } },
                    },
                },
            }}
        />
    </Panel>
);

export const TechChart = () => (
    <Panel
        title="Top 15 Technologies in Submitted Projects"
        sub={`From DevPost "Built With" field · across all events`}
        tall
    >
        <Bar
            data={{
                labels: DATA.tech_stack.labels,
                datasets: [{ label: "Projects using", data: DATA.tech_stack.counts, backgroundColor: C.accent, borderRadius: 2 }],
            }}
            options={{
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: tooltipStyle },
                scales: { x: baseAxis(), y: baseAxis() },
            }}
        />
    </Panel>
);

const Charts = {
    YearlyChart,
    TeammateChart,
    TeamSizeChart,
    SourceChart,
    UniversitiesChart,
    CitiesChart,
    SpecialtyChart,
    DomainChart,
    TimingChart,
    RepeatChart,
    TechChart,
};

export default Charts;
