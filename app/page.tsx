'use client';

import { getCastText } from './utils/api';
import { SetStateAction, useState, useRef } from 'react';
import { SiFarcaster } from 'react-icons/si';
import { toPng } from 'html-to-image';

interface RoastResult {
  build_evaluation: {
    title: string;
    cash_grab_assessment: boolean;
    criteria_breakdown: {
      [key: string]: number;
    };
    detailed_feedback: string;
  };
}

export default function Home() {
  const [roastResult, setRoastResult] = useState<RoastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null);

  const downloadAsImage = async () => {
    if (resultRef.current) {
      try {
        const dataUrl = await toPng(resultRef.current, {
          quality: 1.0,
          backgroundColor: '#0f172a', // matching the dark background
          style: {
            borderRadius: '0' // Remove border radius for better image capture
          }
        });
        const link = document.createElement('a');
        link.download = 'base-roast-result.png';
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Error generating image:', err);
      }
    }
  };

  const shareToFarcaster = () => {
    const content =
      'Just roasted my base build for the week here, you can roast yours over here https://roastmybuild.vercel.app';
    console.log('Sharing to Farcaster:', content);
    // Implement actual sharing logic here
    // For example, you might open a new window with a Farcaster sharing URL
    window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(content)}`, '_blank');
  };

  const handleRoast = async (url: string) => {
    try {
      console.log(url);
      const result = (await getCastText(url)) as unknown as SetStateAction<RoastResult | null>;
      setRoastResult(result);
    } catch (error) {
      console.error('Error getting cast:', error);
      setRoastResult(null);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-8 gap-6 sm:gap-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-50"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10"></div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-400 relative text-center">
        Roast My Build
      </h1>

      <div className="w-full max-w-2xl px-4 sm:px-0 relative group">
        <input
          type="text"
          id="castUrl"
          placeholder="Paste your warpcast cast link here"
          className="w-full p-4 sm:p-6 bg-slate-900/80 backdrop-blur-sm border-2 border-slate-700 rounded-2xl shadow-lg focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-900 transition-all text-base sm:text-lg placeholder:text-slate-500 text-slate-200"
        />
        <button
          onClick={() => {
            setIsDownloaded(true)
            const input = document.getElementById('castUrl') as HTMLInputElement;
            if (input.value) {
              const button = document.querySelector('button');
              setLoading(true);
              button?.setAttribute('disabled', 'true');
              button?.classList.add('opacity-70');
              handleRoast(input.value).finally(() => {
                button?.removeAttribute('disabled');
                setLoading(false);
                button?.classList.remove('opacity-70');
              });
            }
          }}
          className="absolute right-6 sm:right-4 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-xl transition-all text-sm sm:text-base disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2">
            <span>Roast</span>
            {/* Only show loading spinner when button is disabled */}
            {loading && (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            )}
          </div>
        </button>
      </div>

      <div className="w-full max-w-4xl bg-slate-900/90 backdrop-blur-lg rounded-3xl sm:p-10 shadow-2xl border border-slate-800/50 relative hover:border-slate-700/50 transition-all duration-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-8 flex items-center gap-3">
          <div className="flex space-x-2">
            <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="w-3 h-3 rounded-full bg-purple-400 animate-pulse delay-75"></span>
            <span className="w-3 h-3 rounded-full bg-pink-400 animate-pulse delay-150"></span>
          </div>
          Roast Analysis
        </h2>

        <div className="text-slate-300 text-base sm:text-lg">
          {roastResult ? (
            <>
              <div className="">
                <div className="flex flex-col sm:flex-row justify-center gap-2 mb-4">
                  <button
                    onClick={downloadAsImage}
                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl transition-all text-sm font-medium flex items-center justify-center gap-2"
                  >
                    Download Image
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                  </button>
                  <button
                    onClick={shareToFarcaster}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition-all text-sm font-medium flex items-center justify-center gap-2"
                  >
                    Share
                    <SiFarcaster className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-col flex-grow">
                  <div className="flex justify-center mb-6 w-full" style={{ width: '100%' }}>
                    <div 
                      ref={resultRef} 
                      className="w-full min-w-[320px] max-w-[600px] space-y-6 animate-fade-in rounded-3xl overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      }}
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 pointer-events-none" />
                        <div className="p-8 relative">
                          <h3 className="text-2xl sm:text-3xl font-bold text-blue-400 mb-6 sm:mb-8">
                            {roastResult.build_evaluation.title}
                          </h3>

                          <div className="bg-[#1e293b]/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                roastResult.build_evaluation.cash_grab_assessment
                                  ? 'bg-red-500/20'
                                  : 'bg-emerald-500/20'
                              }`}>
                                {roastResult.build_evaluation.cash_grab_assessment ? (
                                  <span className="text-2xl">⚠️</span>
                                ) : (
                                  <span className="text-2xl">✅</span>
                                )}
                              </div>
                              <div>
                                <h4 className="text-base sm:text-lg font-semibold text-slate-100">Project Assessment</h4>
                                <p className={`text-base sm:text-lg font-medium ${
                                  roastResult.build_evaluation.cash_grab_assessment
                                    ? 'text-red-400'
                                    : 'text-emerald-400'
                                }`}>
                                  {roastResult.build_evaluation.cash_grab_assessment
                                    ? 'Potential Cash Grab Detected'
                                    : 'Verified Legitimate Build'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <h4 className="text-base sm:text-lg font-semibold text-slate-100 flex items-center gap-2">
                              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                              </svg>
                              Scoring Breakdown
                            </h4>
                            <div className="space-y-4">
                              {Object.entries(roastResult.build_evaluation.criteria_breakdown).map(
                                ([key, value], index) => (
                                  <div
                                    key={key}
                                    className="group"
                                  >
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs sm:text-sm font-medium text-slate-300 capitalize">
                                        {key.split('_').join(' ')}
                                      </span>
                                      <span className={`text-xs sm:text-sm font-semibold ${
                                        key === 'total_score' ? 'text-purple-400' : 'text-blue-400'
                                      }`}>
                                        {key === 'total_score' 
                                          ? `${Object.entries(roastResult.build_evaluation.criteria_breakdown)
                                              .reduce((sum, [k, v]) => 
                                                k !== 'total_score' ? sum + Number(v) : sum
                                              , 0)}/25` 
                                          : `${value}/5`}
                                      </span>
                                    </div>
                                    <div className="w-full bg-slate-700/30 rounded-full h-2 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          key === 'total_score'
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                            : 'bg-gradient-to-r from-blue-400 to-purple-400'
                                        }`}
                                        style={{
                                          width: `${
                                            key === 'total_score'
                                              ? (Object.entries(roastResult.build_evaluation.criteria_breakdown)
                                                  .reduce((sum, [k, v]) => 
                                                    k !== 'total_score' ? sum + Number(v) : sum
                                                  , 0) / 25) * 100
                                              : (Number(value) / 5) * 100
                                          }%`
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      <div className={`${isDownloaded ? '': 'hidden'} text-center text-sm text-slate-400 py-3 border-t border-slate-700/50`}>
                        Check yours at roastmybuild.vercel.app
                      </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="max-w-[600px] mx-auto w-full">
                    <div className="flex-grow bg-[#1e293b] rounded-2xl p-6">
                      <h4 className="text-base sm:text-lg font-semibold text-slate-100 mb-3 sm:mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        Detailed Feedback
                      </h4>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line">
                          {roastResult.build_evaluation.detailed_feedback}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              {loading && (
                <div className="flex justify-center space-x-2 hi">
                  <div className="w-3 h-3 rounded-full bg-blue-400 animate-bounce"></div>
                  <div
                    className="w-3 h-3 rounded-full bg-purple-400 animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="w-3 h-3 rounded-full bg-pink-400 animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
              )}
              <p className="text-slate-400 mt-4">
                {loading ? 'Analyzing your build...' : 'Your roast result would show here...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
