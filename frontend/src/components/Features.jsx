function Features() {
  return (
    <div className="flex gap-8 flex-wrap items-stretch justify-center p-8 md:p-12 max-w-7xl mx-auto">

      <div className="flex flex-col items-start gap-4 p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex-1 min-w-[300px]">
        <div className="flex gap-4 items-center mb-2">
          <div className="p-3 bg-blue-50 rounded-xl">
            <img src="../../mic.png" alt="mic" className="w-8 h-8 object-contain" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Built for Doctors</h2>
        </div>
        <p className="text-slate-600 text-base leading-relaxed font-medium">
          Designed to reduce charting time without changing clinical workflows
        </p>
      </div>
      <div className="flex flex-col items-start gap-4 p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex-1 min-w-[300px]">
        <div className="flex gap-4 items-center mb-2">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <img src="../../transcription.png" alt="transcription" className="w-8 h-8 object-contain" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Accurate Transcription</h2>
        </div>
        <p className="text-slate-600 text-base leading-relaxed font-medium">
          Medical grade text-to-speech with structured summaries
        </p>
      </div>
      <div className="flex flex-col items-start gap-4 p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex-1 min-w-[300px]">
        <div className="flex gap-4 items-center mb-2">
          <div className="p-3 bg-purple-50 rounded-xl">
            <img src="../../soap.png" alt="soap" className="w-8 h-8 object-contain" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">SOAP-ready Output</h2>
        </div>
        <p className="text-slate-600 text-base leading-relaxed font-medium">
          Subjective, Objective, Assesment, Plan - instantly formatted
        </p>
      </div>
    </div>

  );
}

export default Features;
