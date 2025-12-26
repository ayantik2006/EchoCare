function Features() {
  return (
    <div className="flex gap-15 flex-wrap items-center justify-center p-[2rem] px-[2rem]">
      <div className="flex flex-col items-start gap-2 ">
        <h1 className="flex gap-3 items-start">
          <img src="../../mic.png" alt="mic" className="w-[2rem]" />
          <div className="text-[1.2rem] font-semibold ">Built for Doctors</div>
        </h1>
        <p className="max-w-[17rem] text-[1rem] ml-10 text-neutral-600 font-semibold [@media(max-width:461px)]:w-full">
          Designed to reduce charting time without changing clinical workflows
        </p>
      </div>
      <div className="flex flex-col items-start gap-2">
        <h1 className="flex gap-3 items-start">
          <img src="../../transcription.png" alt="transcription" className="w-[2.5rem]" />
          <div className="text-[1.2rem] font-semibold ">Accurate Transcription</div>
        </h1>
        <p className="max-w-[17rem] text-[1rem] ml-10 text-neutral-600 font-semibold [@media(max-width:461px)]:w-full">
          Medical grade text-to-speech with structured summaries
        </p>
      </div>
      <div className="flex flex-col items-start gap-2">
        <h1 className="flex gap-3 items-start">
          <img src="../../soap.png" alt="soap" className="w-[2rem]" />
          <div className="text-[1.2rem] font-semibold ">SOAP-ready Output</div>
        </h1>
        <p className="max-w-[17rem] text-[1rem] ml-10 text-neutral-600 font-semibold [@media(max-width:461px)]:w-full">
          Subjective, Objective, Assesment, Plan - instantly formatted
        </p>
      </div>
    </div>
  );
}

export default Features;
