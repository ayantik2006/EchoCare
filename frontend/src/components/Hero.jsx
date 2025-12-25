function Hero() {
  return (
    <div className="min-h-[80vh] py-20 bg-gradient-to-b from-blue-50/50 to-white flex flex-col items-center justify-center gap-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none"></div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mx-5 mt-3 leading-tight tracking-tight">
        <span className="text-slate-800">AI-powered clinical notes. </span>
        <br className="hidden md:block" />
        <span className="text-blue-600">Without the <span className="text-green-600 font-['Homemade_Apple']">paperwork</span></span>
      </h1>
      <h2 className="text-slate-600 text-lg md:text-xl text-center max-w-2xl mx-3 font-medium">
        EchoCare records doctor-patient conversation and converts them into
        structured SOAP notes - ready to review and export
      </h2>
      <button className="group flex items-center text-lg gap-3 bg-blue-600 px-8 py-3.5 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
        <span className="mt-[0.1rem] group-hover:scale-110 transition-transform">
          <i className="devicon-google-plain"></i>
        </span>
        <span className="font-medium">Continue with Google</span>
      </button>
    </div>
  );
}

export default Hero;
