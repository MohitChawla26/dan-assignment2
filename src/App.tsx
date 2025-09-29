import React, { useState, useCallback, useMemo } from "react";
import {
  Upload,
  FileText,
  RotateCcw,
  Users,
  TrendingUp,
  AlertTriangle,
  Search,
  BarChart3,
  Star,
  X,
  UserCheck,
  Layers,
  Award,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  LabelList,
} from "recharts";
import * as XLSX from "xlsx";

// Interfaces
interface StudentData {
  enrollmentNo: string;
  name: string;
  status: string;
  year: string;
  averageScore: number;
  semesterScores: { [key: string]: number };
  totalKTs: number;
}

interface SheetData {
  [sheetName: string]: StudentData[];
}

interface ConsolidatedStudent {
  enrollmentNo: string;
  name: string;
  status: string;
  semesterScores: { [key: string]: number };
}

interface YearlyStat {
  year: string;
  totalStudents: number;
  passRate: number;
  avgKts: number;
  statusDistribution: { [key: string]: number };
}

const COLORS = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

// --- Child Components ---

const StudentProfileModal = ({
  student,
  onClose,
}: {
  student: StudentData | null;
  onClose: () => void;
}) => {
  if (!student) return null;
  const semesterTrendData = Object.entries(student.semesterScores)
    .map(([sem, score]) => ({ name: sem.toUpperCase(), score }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700 p-6 relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">{student.name}</h2>
          <p className="text-gray-400">{student.enrollmentNo}</p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Avg Score</p>
            <p className="text-xl font-bold text-blue-400">
              {student.averageScore.toFixed(1)}
            </p>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Status</p>
            <p className="text-xl font-bold text-green-400">{student.status}</p>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Total KTs</p>
            <p className="text-xl font-bold text-yellow-400">
              {student.totalKTs}
            </p>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Semester Performance Trend
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={semesterTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="name" stroke="#A0AEC0" />
            <YAxis stroke="#A0AEC0" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A202C",
                border: "1px solid #2D3748",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#3B82F6" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#3B82F6"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const StudentProgressionView = ({
  allStudents,
}: {
  allStudents: ConsolidatedStudent[];
}) => {
  const [selectedStudent, setSelectedStudent] =
    useState<ConsolidatedStudent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredStudents = useMemo(() => {
    const sortedStudents = [...allStudents].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    if (!searchTerm) return sortedStudents;
    return sortedStudents.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allStudents, searchTerm]);
  const chartData = useMemo(() => {
    if (!selectedStudent) return [];
    return Object.entries(selectedStudent.semesterScores)
      .map(([sem, score]) => ({ name: sem.toUpperCase(), score }))
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true })
      );
  }, [selectedStudent]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-1 bg-gray-800 p-4 rounded-xl border border-gray-700 h-[600px] flex flex-col">
        <h3 className="font-semibold text-white mb-4 text-lg">
          All Students ({filteredStudents.length})
        </h3>
        <div className="relative mb-4">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 w-full text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="overflow-y-auto flex-grow">
          {filteredStudents.map((student) => (
            <div
              key={student.enrollmentNo}
              onClick={() => setSelectedStudent(student)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedStudent?.enrollmentNo === student.enrollmentNo
                  ? "bg-blue-600/50"
                  : "hover:bg-blue-500/20"
              }`}
            >
              <p className="font-medium text-white">{student.name}</p>
              <p className="text-xs text-gray-400">{student.enrollmentNo}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700 min-h-[600px] flex flex-col justify-center">
        {selectedStudent ? (
          <>
            <h3 className="font-semibold text-white text-lg mb-1 text-center">
              Progression for {selectedStudent.name}
            </h3>
            <p className="text-gray-400 text-sm mb-4 text-center">
              Status: {selectedStudent.status}
            </p>
            <ResponsiveContainer width="100%" height={450}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="name" stroke="#A0AEC0" />
                <YAxis stroke="#A0AEC0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A202C",
                    border: "1px solid #2D3748",
                    borderRadius: "0.5rem",
                  }}
                  labelStyle={{ color: "#fff" }}
                  itemStyle={{ color: "#3B82F6" }}
                />
                <Bar dataKey="score" name="Semester Score">
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                  <LabelList dataKey="score" position="top" fill="#A0AEC0" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        ) : (
          <div className="text-center text-gray-400">
            <UserCheck size={48} className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">
              Select a Student
            </h3>
            <p>
              Click on a student's name from the list to view their complete
              academic performance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const YearlyComparisonView = ({
  yearlyStats,
}: {
  yearlyStats: YearlyStat[];
}) => {
  const trendData = useMemo(() => {
    return yearlyStats.map((stat) => ({
      name: stat.year.replace(/CO |CE /g, ""),
      "Pass Rate (%)": stat.passRate,
      "Average KTs": stat.avgKts,
    }));
  }, [yearlyStats]);
  return (
    <div className="animate-fade-in">
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="font-semibold text-white mb-4 text-lg">
          Performance Trends Over Years
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="name" stroke="#A0AEC0" />
            <YAxis yAxisId="left" stroke="#82ca9d" />
            <YAxis yAxisId="right" orientation="right" stroke="#ffc658" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A202C",
                border: "1px solid #2D3748",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="Pass Rate (%)"
              stroke="#82ca9d"
              strokeWidth={2}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Average KTs"
              stroke="#ffc658"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const RankingsView = ({
  data,
  onStudentClick,
}: {
  data: SheetData;
  onStudentClick: (student: StudentData) => void;
}) => {
  const [selectedYear, setSelectedYear] = useState<string>(
    Object.keys(data)[0] || ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const rankedData = useMemo(() => {
    const yearData = data[selectedYear] || [];
    const sorted = [...yearData].sort(
      (a, b) => b.averageScore - a.averageScore
    );
    return sorted.map((student, index) => ({ ...student, rank: index + 1 }));
  }, [data, selectedYear]);
  const filteredData = useMemo(() => {
    if (!searchTerm) return rankedData;
    return rankedData.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.enrollmentNo.includes(searchTerm)
    );
  }, [rankedData, searchTerm]);
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {Object.keys(data).map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                selectedYear === year
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-auto">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 w-full sm:w-64 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="font-semibold text-white mb-4">
          Student Rankings for {selectedYear}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4 text-sm font-semibold text-gray-400">
                  Rank
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-400">
                  Enrollment No
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-400">
                  Name
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-400">
                  Average Score
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-400">
                  Status
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-400">
                  Total KTs
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((student) => (
                <tr
                  key={student.enrollmentNo}
                  onClick={() => onStudentClick(student)}
                  className="border-b border-gray-700 hover:bg-blue-500/20 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-bold text-lg">
                    {student.rank <= 3
                      ? ["🥇", "🥈", "🥉"][student.rank - 1]
                      : student.rank}
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {student.enrollmentNo}
                  </td>
                  <td className="py-3 px-4 text-white font-medium">
                    {student.name}
                  </td>
                  <td className="py-3 px-4 text-blue-400 font-semibold">
                    {student.averageScore.toFixed(1)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.status.toLowerCase().includes("fail") ||
                        student.status.toLowerCase().includes("kt")
                          ? "bg-red-500/20 text-red-300"
                          : student.status.toLowerCase().includes("dist")
                          ? "bg-green-500/20 text-green-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-yellow-400 font-semibold">
                    {student.totalKTs}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [data, setData] = useState<SheetData>({});
  const [allStudents, setAllStudents] = useState<ConsolidatedStudent[]>([]);
  const [yearlyStats, setYearlyStats] = useState<YearlyStat[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(
    null
  );
  const [activeView, setActiveView] = useState<
    "dashboard" | "progression" | "comparison" | "rankings"
  >("dashboard");

  const [sortConfig, setSortConfig] = useState<{
    key: keyof StudentData;
    direction: "ascending" | "descending";
  } | null>({ key: "averageScore", direction: "descending" }); // Default sort

  const requestSort = (key: keyof StudentData) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const processFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetData: SheetData = {};
      const consolidatedStudents: { [key: string]: ConsolidatedStudent } = {};
      const yearlyComparisonStats: YearlyStat[] = [];

      workbook.SheetNames.forEach((sheetName) => {
        if (sheetName.toLowerCase().includes("stipulated")) return;
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<any[]>(worksheet, {
          header: 1,
          blankrows: false,
        });
        let headerIndex = -1,
          headers: string[] = [];
        for (let i = 0; i < json.length; i++) {
          const row = json[i];
          if (
            Array.isArray(row) &&
            row.some(
              (cell) =>
                typeof cell === "string" &&
                cell.toUpperCase().includes("ENROLLMENT")
            )
          ) {
            headerIndex = i;
            headers = row.map((h) => String(h || "").trim());
            break;
          }
        }
        if (headerIndex === -1) return;
        const enrollmentIndex = headers.findIndex((h) =>
          h.toUpperCase().includes("ENROLLMENT")
        );
        const nameIndex = headers.findIndex((h) =>
          h.toUpperCase().includes("NAME")
        );
        const statusIndex = headers.findIndex(
          (h) =>
            h.toUpperCase().includes("STATUS") ||
            h.toUpperCase().includes("CLASS")
        );
        const ktIndex = headers.findIndex((h) =>
          h.toUpperCase().includes("TOTAL KT")
        );
        const semesterIndices: { [key: string]: number } = {};
        headers.forEach((h, i) => {
          if (h.toUpperCase().includes("SEM")) {
            const match = h.match(/\d/);
            if (match) semesterIndices[`sem${match[0]}`] = i;
          }
        });

        const cleanScore = (score: any): number => {
          if (!score) return 0;
          let s = String(score);
          if (s.includes("=")) s = s.split("=")[1];
          const c = parseInt(s.trim(), 10);
          return isNaN(c) ? 0 : c;
        };
        const cleanKT = (kt: any): number => {
          if (kt === null || kt === undefined || String(kt).trim() === "-")
            return 0;
          let s = String(kt);
          if (s.includes("+"))
            return s
              .split("+")
              .reduce((sum, v) => sum + (parseInt(v.trim(), 10) || 0), 0);
          const c = parseInt(s.trim(), 10);
          return isNaN(c) ? 0 : c;
        };

        const students = json
          .slice(headerIndex + 1)
          .map((row) => {
            const enrollmentNo = String(row[enrollmentIndex] || "");
            if (!enrollmentNo) return null;
            const semesterScores = Object.entries(semesterIndices).reduce(
              (acc, [key, index]) => {
                acc[key] = cleanScore(row[index]);
                return acc;
              },
              {} as { [key: string]: number }
            );
            const scores = Object.values(semesterScores).filter((s) => s > 0);
            const averageScore =
              scores.length > 0
                ? scores.reduce((a, b) => a + b, 0) / scores.length
                : 0;
            if (!consolidatedStudents[enrollmentNo]) {
              consolidatedStudents[enrollmentNo] = {
                enrollmentNo,
                name: String(row[nameIndex] || "N/A"),
                status: "",
                semesterScores: {},
              };
            }
            consolidatedStudents[enrollmentNo].semesterScores = {
              ...consolidatedStudents[enrollmentNo].semesterScores,
              ...semesterScores,
            };
            consolidatedStudents[enrollmentNo].status = String(
              row[statusIndex] || "Unknown"
            );
            return {
              enrollmentNo,
              name: String(row[nameIndex] || "N/A"),
              status: String(row[statusIndex] || "Unknown"),
              year: sheetName,
              averageScore,
              semesterScores,
              totalKTs: cleanKT(row[ktIndex]),
            };
          })
          .filter((s): s is StudentData => s !== null);

        if (students.length > 0) {
          sheetData[sheetName] = students;
          const totalStudents = students.length;
          const passedStudents = students.filter(
            (s) =>
              !s.status.toLowerCase().includes("fail") &&
              !s.status.toLowerCase().includes("kt")
          ).length;
          const passRate =
            totalStudents > 0 ? (passedStudents / totalStudents) * 100 : 0;
          const avgKts =
            totalStudents > 0
              ? students.reduce((acc, s) => acc + s.totalKTs, 0) / totalStudents
              : 0;
          const statusDistribution = students.reduce((acc, s) => {
            const status = s.status || "Unknown";
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {} as { [key: string]: number });
          yearlyComparisonStats.push({
            year: sheetName,
            totalStudents,
            passRate,
            avgKts,
            statusDistribution,
          });
        }
      });
      if (Object.keys(sheetData).length === 0)
        throw new Error("No valid student data found.");
      setData(sheetData);
      setAllStudents(Object.values(consolidatedStudents));
      setYearlyStats(
        yearlyComparisonStats.sort((a, b) => a.year.localeCompare(b.year))
      );
      setSelectedYear(Object.keys(sheetData)[0]);
    } catch (e) {
      setError("Failed to process file. Check format.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSampleFile = useCallback(
    async (url: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(url);
        if (!response.ok)
          throw new Error(
            `Network response was not ok (${response.statusText})`
          );
        const blob = await response.blob();
        const fileName = url.split("/").pop() || "sample.xlsx";
        const file = new File([blob], fileName, { type: blob.type });
        await processFile(file);
      } catch (e) {
        setError(
          "Failed to load the sample file. Please check the URL and hosting setup."
        );
        console.error(e);
        setIsLoading(false);
      }
    },
    [processFile]
  );

  const filteredData = useMemo(() => {
    const yearData = data[selectedYear] || [];
    if (!searchTerm) return yearData;
    return yearData.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.enrollmentNo.includes(searchTerm)
    );
  }, [data, selectedYear, searchTerm]);

  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === "number" && typeof bValue === "number") {
          if (aValue < bValue) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
        } else {
          const strA = String(aValue).toLowerCase();
          const strB = String(bValue).toLowerCase();
          if (strA < strB) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (strA > strB) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  const stats = useMemo(() => {
    const yearData = data[selectedYear] || [];
    if (yearData.length === 0) return null;

    const totalStudents = yearData.length;
    const passedStudents = yearData.filter(
      (s) =>
        !s.status.toLowerCase().includes("fail") &&
        !s.status.toLowerCase().includes("kt")
    ).length;

    // Data for Pass vs Fail Donut Chart
    const passFailData = [
      { name: "Pass", value: passedStudents },
      { name: "Fail", value: totalStudents - passedStudents },
    ];

    const passRate =
      totalStudents > 0 ? (passedStudents / totalStudents) * 100 : 0;
    const avgKts =
      totalStudents > 0
        ? yearData.reduce((acc, s) => acc + s.totalKTs, 0) / totalStudents
        : 0;
    const statusDistribution = yearData.reduce((acc, s) => {
      const status = s.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Data for Performance by Class Category Bar Chart
    const classCategoryData = Object.entries(statusDistribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const topRankersData = [...yearData]
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5)
      .map((s) => ({
        name: s.name.length > 15 ? s.name.substring(0, 15) + "..." : s.name,
        score: s.averageScore,
      }))
      .reverse();
    const topPerformers = [...yearData]
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 3)
      .map((s) => s.enrollmentNo);
    const semesterPerformance =
      yearData.length > 0
        ? Object.keys(yearData[0].semesterScores)
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
            .map((semKey) => {
              const totalScore = yearData.reduce(
                (acc, student) => acc + (student.semesterScores[semKey] || 0),
                0
              );
              return {
                name: semKey.toUpperCase(),
                "Average Score":
                  totalStudents > 0
                    ? Math.round(totalScore / totalStudents)
                    : 0,
              };
            })
        : [];
    return {
      totalStudents,
      passRate,
      avgKts,
      statusDistribution,
      topRankersData,
      topPerformers,
      semesterPerformance,
      passFailData, // Added for new chart
      classCategoryData, // Added for new chart
    };
  }, [data, selectedYear]);

  const handleShowProfile = useCallback(
    (studentFromTable: StudentData) => {
      const consolidatedStudent = allStudents.find(
        (s) => s.enrollmentNo === studentFromTable.enrollmentNo
      );

      if (consolidatedStudent) {
        const allScores = Object.values(
          consolidatedStudent.semesterScores
        ).filter((s) => s > 0);
        const overallAverage =
          allScores.length > 0
            ? allScores.reduce((a, b) => a + b, 0) / allScores.length
            : 0;

        const completeProfile: StudentData = {
          enrollmentNo: consolidatedStudent.enrollmentNo,
          name: consolidatedStudent.name,
          status: consolidatedStudent.status,
          year: studentFromTable.year,
          averageScore: overallAverage,
          semesterScores: consolidatedStudent.semesterScores,
          totalKTs: studentFromTable.totalKTs,
        };
        setSelectedStudent(completeProfile);
      } else {
        setSelectedStudent(studentFromTable);
      }
    },
    [allStudents]
  );

  const reset = () => {
    setData({});
    setAllStudents([]);
    setSelectedYear("");
    setError(null);
    setSearchTerm("");
    setActiveView("dashboard");
    setYearlyStats([]);
    setSortConfig({ key: "averageScore", direction: "descending" });
  };

  const SortableHeader = ({
    columnKey,
    title,
  }: {
    columnKey: keyof StudentData;
    title: string;
  }) => (
    <th
      onClick={() => requestSort(columnKey)}
      className="py-3 px-4 text-sm font-semibold text-gray-400 cursor-pointer select-none transition-colors hover:text-white group"
    >
      <div className="flex items-center gap-2">
        {title}
        <span className="flex-shrink-0 w-4">
          {sortConfig?.key === columnKey ? (
            sortConfig.direction === "ascending" ? (
              <ArrowUp size={14} />
            ) : (
              <ArrowDown size={14} />
            )
          ) : (
            <ArrowDown size={14} className="opacity-0 group-hover:opacity-30" />
          )}
        </span>
      </div>
    </th>
  );

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <BarChart3 size={32} className="text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">
                Student Performance Analytics
              </h1>
              <p className="text-sm text-gray-400">
                Advanced Data Visualization Dashboard
              </p>
            </div>
          </div>
          {Object.keys(data).length > 0 && (
            <button
              onClick={reset}
              className="flex items-center gap-2 bg-gray-700 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
            >
              <RotateCcw size={16} /> Upload New
            </button>
          )}
        </header>

        {Object.keys(data).length === 0 ? (
          <div
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files.length > 0)
                processFile(e.dataTransfer.files[0]);
            }}
            onDragOver={(e) => e.preventDefault()}
            className="mt-12 flex flex-col items-center"
          >
            <div className="text-center mb-8 animate-fade-in">
              <h2 className="text-3xl font-bold text-white">
                Welcome, Sonali Mam!
              </h2>
              <p className="text-gray-400 mt-2">
                Please upload the student performance file to begin the
                analysis.
              </p>
            </div>
            <div className="w-full max-w-lg text-center">
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-600 hover:border-blue-500 transition-all rounded-2xl p-10 flex flex-col items-center">
                  {isLoading ? (
                    <>
                      <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-600 rounded-full animate-spin"></div>
                      <p className="mt-4 text-lg">Processing...</p>
                    </>
                  ) : (
                    <>
                      <Upload size={48} className="text-gray-500 mb-4" />
                      <h2 className="text-xl font-semibold text-white">
                        Drag & Drop Excel File Here
                      </h2>
                      <p className="text-gray-400 mt-2">or click to browse</p>
                    </>
                  )}
                </div>
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".xlsx, .xls"
                onChange={(e) =>
                  e.target.files && processFile(e.target.files[0])
                }
              />
            </div>

            <div className="mt-8 text-center w-full max-w-lg">
              <p className="text-gray-400 mb-4 text-sm">
                Or load a sample dataset:
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() =>
                    handleSampleFile(
                      "https://raw.githubusercontent.com/MohitChawla26/dan-assignment2/main/Assigment%202%202020-2021_Data%20Analytics.xlsx"
                    )
                  }
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText size={18} />
                  Load Analytics Data (2020-23)
                </button>
                <button
                  onClick={() =>
                    handleSampleFile(
                      "https://raw.githubusercontent.com/MohitChawla26/dan-assignment2/main/DAN%20ASSIGNMENT2.xlsx"
                    )
                  }
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText size={18} />
                  Load DAN Data (2023-25)
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-6 flex items-center gap-2 bg-red-500/20 text-red-300 px-4 py-2 rounded-lg">
                <AlertTriangle size={20} />
                <span>{error}</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveView("dashboard")}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeView === "dashboard"
                    ? "border-b-2 border-blue-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <BarChart3 size={18} /> Yearly Dashboard
              </button>
              <button
                onClick={() => setActiveView("progression")}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeView === "progression"
                    ? "border-b-2 border-blue-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <UserCheck size={18} /> Student Progression
              </button>
              <button
                onClick={() => setActiveView("comparison")}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeView === "comparison"
                    ? "border-b-2 border-blue-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Layers size={18} /> Yearly Comparison
              </button>
              <button
                onClick={() => setActiveView("rankings")}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeView === "rankings"
                    ? "border-b-2 border-blue-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Award size={18} /> Rankings
              </button>
            </div>

            {activeView === "dashboard" && (
              <div className="animate-fade-in">
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  {Object.keys(data).map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                        selectedYear === year
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-800 p-5 rounded-xl flex items-center gap-4 border border-gray-700">
                    <Users size={32} className="text-blue-500" />
                    <div>
                      <p className="text-gray-400">Total Students</p>
                      <p className="text-2xl font-bold">
                        {stats?.totalStudents}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-800 p-5 rounded-xl flex items-center gap-4 border border-gray-700">
                    <TrendingUp size={32} className="text-green-500" />
                    <div>
                      <p className="text-gray-400">Pass Rate</p>
                      <p className="text-2xl font-bold">
                        {stats?.passRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-800 p-5 rounded-xl flex items-center gap-4 border border-gray-700">
                    <AlertTriangle size={32} className="text-yellow-500" />
                    <div>
                      <p className="text-gray-400">Average KTs</p>
                      <p className="text-2xl font-bold">
                        {stats?.avgKts.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 mb-6">
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="font-semibold text-white mb-4">
                      Semester Performance Comparison ({selectedYear})
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats?.semesterPerformance}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                        <XAxis dataKey="name" stroke="#A0AEC0" />
                        <YAxis stroke="#A0AEC0" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1A202C",
                            border: "1px solid #2D3748",
                            borderRadius: "0.5rem",
                          }}
                          labelStyle={{ color: "#fff" }}
                          itemStyle={{ color: "#8884d8" }}
                        />
                        <Legend />
                        <Bar dataKey="Average Score" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="font-semibold text-white mb-4">
                      Status Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Object.entries(
                            stats?.statusDistribution || {}
                          ).map(([name, value]) => ({ name, value }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {Object.entries(stats?.statusDistribution || {}).map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1A202C",
                            border: "1px solid #2D3748",
                            borderRadius: "0.5rem",
                          }}
                          labelStyle={{ color: "#fff" }}
                          itemStyle={{ color: "#82ca9d" }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="font-semibold text-white mb-4">
                      Top 5 Performers
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={stats?.topRankersData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                        <XAxis type="number" stroke="#A0AEC0" />
                        <YAxis
                          type="category"
                          dataKey="name"
                          stroke="#A0AEC0"
                          width={120}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1A202C",
                            border: "1px solid #2D3748",
                            borderRadius: "0.5rem",
                          }}
                          labelStyle={{ color: "#fff" }}
                          itemStyle={{ color: "#10B981" }}
                        />
                        <Bar dataKey="score" name="Average Score">
                          {stats?.topRankersData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="font-semibold text-white mb-4">
                      Pass vs. Fail Rate ({selectedYear})
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats?.passFailData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={110}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          <Cell key="cell-0" fill="#10B981" />{" "}
                          <Cell key="cell-1" fill="#EF4444" />
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1A202C",
                            border: "1px solid #2D3748",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="font-semibold text-white mb-4">
                      Performance by Class Category ({selectedYear})
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={stats?.classCategoryData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#4A5568"
                        />
                        <XAxis type="number" stroke="#A0AEC0" />
                        <YAxis
                          type="category"
                          dataKey="name"
                          stroke="#A0AEC0"
                          width={100}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1A202C",
                            border: "1px solid #2D3748",
                            borderRadius: "0.5rem",
                          }}
                          labelStyle={{ color: "#fff" }}
                        />
                        <Legend />
                        <Bar dataKey="value" name="No. of Students">
                          {stats?.classCategoryData?.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <div>
                      <h3 className="font-semibold text-white">
                        Student Roster for {selectedYear}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <Star
                          size={14}
                          className="text-yellow-400 fill-yellow-400 flex-shrink-0"
                        />
                        <span>Indicates a Top 3 Performer for the year.</span>
                      </div>
                    </div>
                    <div className="relative w-full md:w-auto">
                      <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-700 w-full md:w-64 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <SortableHeader
                            columnKey="enrollmentNo"
                            title="Enrollment No"
                          />
                          <SortableHeader columnKey="name" title="Name" />
                          <SortableHeader
                            columnKey="averageScore"
                            title="Average Score"
                          />
                          <SortableHeader columnKey="status" title="Status" />
                          <SortableHeader
                            columnKey="totalKTs"
                            title="Total KTs"
                          />
                        </tr>
                      </thead>
                      <tbody>
                        {sortedData.map((student) => (
                          <tr
                            key={student.enrollmentNo}
                            onClick={() => handleShowProfile(student)}
                            className="border-b border-gray-700 hover:bg-blue-500/20 transition-colors cursor-pointer"
                          >
                            <td className="py-3 px-4 text-gray-400">
                              {student.enrollmentNo}
                            </td>
                            <td className="py-3 px-4 text-white font-medium flex items-center gap-2">
                              {stats?.topPerformers.includes(
                                student.enrollmentNo
                              ) && (
                                <Star
                                  size={16}
                                  className="text-yellow-400 fill-yellow-400"
                                />
                              )}
                              {student.name}
                            </td>
                            <td className="py-3 px-4 text-blue-400 font-semibold">
                              {student.averageScore.toFixed(1)}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  student.status
                                    .toLowerCase()
                                    .includes("fail") ||
                                  student.status.toLowerCase().includes("kt")
                                    ? "bg-red-500/20 text-red-300"
                                    : student.status
                                        .toLowerCase()
                                        .includes("dist")
                                    ? "bg-green-500/20 text-green-300"
                                    : "bg-blue-500/20 text-blue-300"
                                }`}
                              >
                                {student.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-yellow-400 font-semibold">
                              {student.totalKTs}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {activeView === "progression" && (
              <StudentProgressionView allStudents={allStudents} />
            )}
            {activeView === "comparison" && (
              <YearlyComparisonView yearlyStats={yearlyStats} />
            )}
            {activeView === "rankings" && (
              <RankingsView data={data} onStudentClick={handleShowProfile} />
            )}
          </>
        )}
      </div>
      <StudentProfileModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
};

export default App;