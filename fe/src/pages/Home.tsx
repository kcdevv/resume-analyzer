import type React from "react"
import { useState } from "react"
import axios from "axios"
import { Upload, FileText, CheckCircle, AlertTriangle, Briefcase, Award } from "lucide-react"
import Header from "../components/Header"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const [jobDescription, setJobDescription] = useState<string>("")
  const [dragActive, setDragActive] = useState<boolean>(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files[0]) {
      setFile(files[0])
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    setLoading(true)
    try {
      const response = await axios.post<AnalysisResponse>(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setAnalysis(response.data)
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Failed to analyze resume.")
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score?: number) => {
    if (!score) return "bg-gray-300"
    if (score >= 80) return "bg-emerald-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 text-white">
      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <Header />

          {/* Upload Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl border border-white/20 mb-6 sm:mb-8">
            <div
              className={`border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 text-center transition-all ${
                dragActive ? "border-purple-400 bg-purple-900/20" : "border-gray-500 hover:border-purple-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-800/50 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-purple-300" />
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <h3 className="text-lg sm:text-xl font-semibold">
                    {file ? `Selected: ${file.name}` : "Upload Your Resume"}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300">Drag & drop your resume or click to browse</p>
                </div>

                <label className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-700 hover:bg-purple-600 rounded-lg cursor-pointer transition-colors text-sm sm:text-base">
                  Browse Files
                  <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" />
                </label>

                {file && (
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-purple-300">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px]">{file.name}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className={`mt-4 sm:mt-6 w-full py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-white transition-all text-sm sm:text-base ${
                !file || loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Analyzing Resume...
                </span>
              ) : (
                "Analyze Resume"
              )}
            </button>
          </div>

          {analysis && analysis.analysis && (
            <div className="space-y-6 sm:space-y-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl border border-white/20">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center">
                  <Award className="mr-2 text-purple-400 w-5 h-5 sm:w-6 sm:h-6" />
                  ATS Compatibility Score
                </h2>

                <div className="flex flex-col items-center">
                  <div className="relative w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 mb-3 sm:mb-4">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#374151" strokeWidth="10" />

                      {/* Score circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill={(analysis.analysis.score!>=75) ? "green" : (analysis.analysis.score!>=50) ? "#FFFF66" : "red"}
                        stroke={getScoreColor(analysis.analysis.score).replace("bg-", "text-")}
                        strokeWidth="10"
                        strokeDasharray={`${(analysis.analysis.score || 0) * 2.83} 283`}
                        strokeDashoffset="0"
                        transform="rotate(-90 50 50)"
                        className="transition-all duration-1000 ease-out"
                      />

                      <text
                        x="50"
                        y="50"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        fontSize="24"
                        fontWeight="bold"
                        fill="white"
                      >
                        {analysis.analysis.score || "N/A"}
                      </text>

                      <text x="50" y="65" dominantBaseline="middle" textAnchor="middle" fontSize="10" fill="#fff">
                        out of 100
                      </text>
                    </svg>
                  </div>

                  <div className="text-center">
                    <div
                      className={`text-base sm:text-lg font-bold ${
                        (analysis.analysis.score || 0) >= 80
                          ? "text-emerald-400"
                          : (analysis.analysis.score || 0) >= 60
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {(analysis.analysis.score || 0) >= 80
                        ? "Excellent"
                        : (analysis.analysis.score || 0) >= 60
                          ? "Good"
                          : "Needs Improvement"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl border border-white/20">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center">
                  <CheckCircle className="mr-2 text-purple-400 w-5 h-5 sm:w-6 sm:h-6" />
                  Resume Summary
                </h2>
                <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                  {analysis.analysis.summary || "No summary available."}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl border border-white/20">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center">
                  <AlertTriangle className="mr-2 text-purple-400 w-5 h-5 sm:w-6 sm:h-6" />
                  Suggestions for Improvement
                </h2>

                {analysis.analysis.improvements && analysis.analysis.improvements.length > 0 ? (
                  <ul className="space-y-2 sm:space-y-3">
                    {analysis.analysis.improvements.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="inline-flex items-center justify-center flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 bg-purple-900/50 rounded-full">
                          <span className="text-purple-300 text-xs sm:text-sm">{idx + 1}</span>
                        </span>
                        <span className="text-sm sm:text-base text-gray-200">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm sm:text-base text-gray-300">No suggestions available.</p>
                )}
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl border border-white/20">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center">
                  <Briefcase className="mr-2 text-purple-400 w-5 h-5 sm:w-6 sm:h-6" />
                  Keywords Extracted
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {["skills", "technologies", "job_related"].map((key) =>
                    analysis.analysis?.keywords?.[key as keyof typeof analysis.analysis.keywords]?.length ? (
                      <div key={key} className="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-5">
                        <h3 className="text-base sm:text-lg font-semibold capitalize text-purple-300 mb-2 sm:mb-3">
                          {key.replace("_", " ")}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {analysis.analysis.keywords?.[key as keyof typeof analysis.analysis.keywords]?.map(
                            (word, i) => (
                              <span
                                key={i}
                                className="px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-900/50 rounded-full text-xs sm:text-sm text-white"
                              >
                                {word}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    ) : null,
                  )}
                </div>
                {!Object.values(analysis.analysis.keywords || {}).some((arr) => arr && arr.length > 0) && (
                  <div className="text-center py-4">
                    <p className="text-sm sm:text-base text-gray-300">No keywords detected in your resume.</p>
                  </div>
                )}
              </div>

              {analysis.analysis.parts?.some((p) => p.text.toLowerCase().includes("provide the job description")) && (
                <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl border border-white/20">
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center">
                    <Briefcase className="mr-2 text-purple-400 w-5 h-5 sm:w-6 sm:h-6" />
                    Job Description
                  </h2>

                  <textarea
                    className="w-full h-24 sm:h-32 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
                    placeholder="Paste the job description here for a tailored analysis..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />

                  <button className="mt-3 sm:mt-4 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg sm:rounded-xl font-semibold transition-all text-sm sm:text-base">
                    Submit Job Description
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
