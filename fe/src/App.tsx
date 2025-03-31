import { useState } from "react";
import axios from "axios";
import "./index.css";

interface AnalysisPart {
  text: string;
}

interface AnalysisResponse {
  extractedText: string;
  analysis?: { parts?: AnalysisPart[] };
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
        "http://localhost:3000/upload",
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
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
      <div className="bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700">
        <h1 className="text-3xl font-extrabold text-black text-center mb-6">📄 Resume Analyzer</h1>

        {!file && <label className="block w-full cursor-pointer text-white text-center py-3 border border-gray-400 rounded-xl bg-gray-800 hover:bg-gray-700 transition">
          Select Resume (PDF/DOCX)
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>}
        {file && <div>File uploaded</div>}

        <button
          onClick={handleUpload}
          className="mt-4 w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition shadow-lg"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Upload & Analyze"}
        </button>

        {analysis && (
          <div className="mt-6 text-black">
            <h2 className="text-xl font-semibold">🔍 ATS Analysis:</h2>
            <div className="mt-2 p-4 bg-gray-800 rounded-lg">
              {analysis.analysis?.parts?.length ? (
                analysis.analysis.parts.map((part, index) => (
                  <pre key={index} className="bg-gray-700 p-3 rounded-md mt-2 text-white overflow-x-auto">{part.text}</pre>
                ))
              ) : (
                <p className="text-gray-400">No ATS analysis found.</p>
              )}
            </div>

            {analysis.analysis?.parts?.some((part) => part.text.includes("provide the job description")) && (
              <div className="mt-4">
                <label className="block text-gray-300 font-semibold mb-1">🏢 Enter Job Description:</label>
                <textarea
                  className="w-full h-24 p-3 border rounded-md bg-gray-800 text-white"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <button className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-xl font-semibold hover:bg-blue-600 transition shadow-lg">
                  Submit Job Description
                </button>
              </div>
            )}

            <h2 className="text-xl font-semibold mt-4">📜 Extracted Text:</h2>
            <textarea
              className="w-full h-60 p-3 border rounded-md bg-gray-800 text-white"
              readOnly
              value={analysis.extractedText || "No text extracted."}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;