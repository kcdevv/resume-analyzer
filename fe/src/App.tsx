import { useState } from "react";
import axios from "axios";
import "./index.css";

interface AnalysisPart {
  text: string;
}

interface AnalysisResponse {
  extractedText: string;
  analysis?: {
    score?: number;
    summary?: string;
    improvements?: string[];
    keywords?: {
      skills?: string[];
      technologies?: string[];
      job_related?: string[];
    };
    parts?: AnalysisPart[];
  };
  message?: string;
}

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await axios.post<AnalysisResponse>(
        `${import.meta.env.VITE_BACKEND_URL}/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setAnalysis(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to analyze resume.");
    } finally {
      setFile(null);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center justify-center p-6">
      <div className="bg-white bg-opacity-5 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-700">
        <h1 className="text-4xl font-bold text-center mb-6">📄 Resume Analyzer</h1>

        <label className="block w-full cursor-pointer text-center py-3 border border-gray-400 rounded-xl bg-gray-800 hover:bg-gray-700 transition">
          {file ? "📎 Resume Selected: " + file.name : "Select Resume (PDF/DOCX)"}
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <button
          onClick={handleUpload}
          className="mt-4 w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Upload & Analyze"}
        </button>

        {analysis && (
          <div className="mt-8 space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-2">📜 Extracted Text</h2>
              <textarea
                className="w-full h-60 p-3 bg-gray-900 text-sm rounded-md text-white"
                readOnly
                value={analysis.extractedText || "No text extracted."}
              />
            </div>

            {analysis.analysis && (
              <>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-bold mb-2">✅ Resume Summary</h2>
                  <p className="text-green-400 font-semibold mb-2">ATS Score: {analysis.analysis.score ?? "N/A"}</p>
                  <p className="text-gray-300">{analysis.analysis.summary || "No summary available."}</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-bold mb-2">🛠️ Suggestions for Improvement</h2>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {analysis.analysis.improvements?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    )) || <li>No suggestions available.</li>}
                  </ul>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-bold mb-2">🔑 Keywords Extracted</h2>
                  {["skills", "technologies", "job_related"].map((key) => (
                    analysis.analysis?.keywords?.[key as keyof typeof analysis.analysis.keywords]?.length ? (
                      <div key={key} className="mb-4">
                        <p className="text-sm font-semibold capitalize text-gray-400 mb-2">{key.replace("_", " ")}:</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.analysis.keywords?.[key as keyof typeof analysis.analysis.keywords]?.map((word, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-gray-700 rounded-full text-sm text-white"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>

                {analysis.analysis.parts?.some((p) =>
                  p.text.toLowerCase().includes("provide the job description")
                ) && (
                  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <label className="block mb-2 text-gray-300 font-semibold">🏢 Enter Job Description:</label>
                    <textarea
                      className="w-full h-32 p-3 rounded-md bg-gray-900 text-white"
                      placeholder="Paste the job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                    <button className="mt-3 bg-blue-500 text-white py-2 px-4 rounded-xl hover:bg-blue-600 transition">
                      Submit Job Description
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
