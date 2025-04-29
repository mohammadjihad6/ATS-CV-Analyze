'use client';

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [analysisSections, setAnalysisSections] = useState<{ [key: string]: string[] }>({});
  const [careerPlan, setCareerPlan] = useState<string[] | null>(null);
  const [jobTitles, setJobTitles] = useState<{ title: string; description: string }[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCareerPlan, setShowCareerPlan] = useState<boolean>(false);
  const [isCareerLoading, setIsCareerLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please upload a CV first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setIsLoading(true);

    try {
      const res = await fetch('https://mohammadnsairat6.app.n8n.cloud/webhook/analyze-cv', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Server responded with an error.");
      }

      const data = await res.json();
      setAtsScore(data.ats_score);
      setAnalysisSections(data.formatted_analysis);
      setShowCareerPlan(true);
    } catch (error) {
      console.error("Error analyzing CV:", error);
      alert("Failed to analyze the CV. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowCareerPlan = async () => {
    if (!file) {
      alert("Please upload a CV first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setIsCareerLoading(true);

    try {
      const response = await fetch('https://mohammadnsairat6.app.n8n.cloud/webhook/generate-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate career plan and job titles.");
      }

      const data = await response.json();
      setCareerPlan(data.careerPlan || []);
      setJobTitles(data.jobTitles || []);
    } catch (error) {
      console.error("Error generating career plan:", error);
      alert("Failed to generate career plan. Please try again later.");
    } finally {
      setIsCareerLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 text-white">
      <img
        src="/image.png"
        alt="CV Analyzer"
        className="mb-6 rounded-full shadow-lg border-4 border-white"
        style={{ width: '180px', height: '180px' }}
      />

      <h1 className="text-4xl font-bold text-center mb-6">ATS CV Analyzer</h1>

      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        className="mb-4 text-black bg-white p-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleAnalyze}
        className={`px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 ${
          isLoading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        } flex items-center gap-2`}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Analyzing...
          </>
        ) : (
          "Analyze CV"
        )}
      </button>

      {atsScore !== null && !isLoading && (
        <div className="mt-8 p-6 bg-slate-800 text-white rounded-xl shadow-lg w-full max-w-5xl">
          <h2 className="text-2xl font-bold mb-4 text-center text-green-400">ATS Compatibility Score</h2>
          <p className="text-center text-4xl text-green-300 font-extrabold mb-6">{atsScore}/100</p>

          {Object.entries(analysisSections).map(([section, points], index) => (
            <div key={index} className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-blue-300">{section}</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-200">
                {Array.isArray(points) && points.length > 0 ? (
                  points.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))
                ) : (
                  <li className="text-red-400">No points available for this section.</li>
                )}
              </ul>
            </div>
          ))}

          {showCareerPlan && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleShowCareerPlan}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                  isCareerLoading ? "bg-gray-500 cursor-not-allowed text-white" : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                disabled={isCareerLoading}
              >
                {isCareerLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Loading...
                  </>
                ) : (
                  "Show Career Plan and Job Titles"
                )}
              </button>
            </div>
          )}

          {(careerPlan || jobTitles) && (
            <div className="mt-8">
              {careerPlan && careerPlan.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-purple-300 mb-4">Career Development Plan</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-200">
                    {careerPlan.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {jobTitles && jobTitles.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-yellow-300 mb-4">Recommended Job Titles</h3>
                  <ul className="space-y-4 text-gray-200">
                    {jobTitles.map((job, idx) => (
                      <li key={idx}>
                        <p className="font-semibold">{job.title}</p>
                        <p className="text-sm text-gray-400">{job.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
