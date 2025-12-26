function Working() {
  return (
    <div className="mt-20 flex flex-col items-center justify-center pb-10">
      <h1 className="text-[1.6rem] font-semibold text-[#2D384A]">
        How it works
      </h1>
      <div className="flex gap-10 flex-wrap items-center justify-center p-[2rem] px-[2rem]">
        <div className="flex flex-col items-start gap-2 ">
          <h1 className="flex gap-3 items-start">
            <div className="bg-[#A5C1E7] text-white w-[2rem] h-[2rem] rounded-full flex items-center justify-center text-[1.3rem]">
              1
            </div>
            <div className="text-[1.2rem] font-semibold ">Record</div>
          </h1>
          <p className="max-w-[17rem] text-[1rem] ml-10 text-neutral-600 font-semibold [@media(max-width:461px)]:w-full">
            Securely capture the doctor patient conversation
          </p>
        </div>
        <div className="flex flex-col items-start gap-2">
          <h1 className="flex gap-3 items-start">
            <div className="bg-[#A5C1E7] text-white w-[2rem] h-[2rem] rounded-full flex items-center justify-center text-[1.3rem]">2</div>
            <div className="text-[1.2rem] font-semibold ">
              Transcribe
            </div>
          </h1>
          <p className="max-w-[17rem] text-[1rem] ml-10 text-neutral-600 font-semibold [@media(max-width:461px)]:w-full">
            Convert speech to text using medical grade accuracy
          </p>
        </div>
        <div className="flex flex-col items-start gap-2">
          <h1 className="flex gap-3 items-start">
            <div className="bg-[#A5C1E7] text-white w-[2rem] h-[2rem] rounded-full flex items-center justify-center text-[1.3rem]">3</div>
            <div className="text-[1.2rem] font-semibold ">SOAP-ready Output</div>
          </h1>
          <p className="max-w-[17rem] text-[1rem] ml-10 text-neutral-600 font-semibold [@media(max-width:461px)]:w-full">
            Format the transcript into a structred SOAP note
          </p>
        </div>
        <div className="flex flex-col items-start gap-2">
          <h1 className="flex gap-3 items-start">
            <div className="bg-[#A5C1E7] text-white w-[2rem] h-[2rem] rounded-full flex items-center justify-center text-[1.3rem]">4</div>
            <div className="text-[1.2rem] font-semibold ">Export</div>
          </h1>
          <p className="max-w-[17rem] text-[1rem] ml-10 text-neutral-600 font-semibold [@media(max-width:461px)]:w-full">
            Edit if needed, then export to PDF or EHR
          </p>
        </div>
      </div>
    </div>
  );
}

export default Working;
