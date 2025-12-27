import React from "react";

function Working() {
  const steps = [
    {
      id: 1,
      title: "Record",
      description: "Securely capture the doctor patient conversation",
      color: "bg-[#2E5674]",
      shadow: "shadow-[#2E5674]/20",
      numberColor: "text-[#192E46]",
    },
    {
      id: 2,
      title: "Transcribe",
      description: "Convert speech to text using medical grade accuracy",
      color: "bg-[#2E5674]",
      shadow: "shadow-[#2E5674]/20",
      numberColor: "text-[#192E46]",
    },
    {
      id: 3,
      title: "SOAP-ready Output",
      description: "Format the transcript into a structred SOAP note",
      color: "bg-[#2E5674]",
      shadow: "shadow-[#2E5674]/20",
      numberColor: "text-[#192E46]",
    },
    {
      id: 4,
      title: "Export",
      description: "Edit if needed, then export to PDF or EHR",
      color: "bg-[#2E5674]",
      shadow: "shadow-[#2E5674]/20",
      numberColor: "text-[#192E46]",
    },
  ];

  const seamlessSteps = [...steps, ...steps];

  return (
    <div className="mt-20 pb-20 overflow-hidden relative">
      <div className="flex flex-col items-center justify-center mb-12">
        <h1 className="text-[1.6rem] font-semibold text-[#192E46]">
          How it works
        </h1>
      </div>

      <div className="relative w-full max-w-7xl mx-auto overflow-hidden p-8 br-[50px]">
        <div
          className="absolute top-0 left-0 h-full w-24 md:w-48 z-20 pointer-events-none backdrop-blur-[2px]"
          style={{
            maskImage: "linear-gradient(to right, black, transparent)",
            WebkitMaskImage: "linear-gradient(to right, black, transparent)",
          }}
        ></div>

        <div
          className="absolute top-0 right-0 h-full w-24 md:w-48 z-20 pointer-events-none backdrop-blur-[2px]"
          style={{
            maskImage: "linear-gradient(to left, black, transparent)",
            WebkitMaskImage: "linear-gradient(to left, black, transparent)",
          }}
        ></div>

        <div className="flex animate-scroll w-max gap-8 px-4 br-[50px]">
          {seamlessSteps.map((step, index) => (
            <div
              key={`${step.id}-${index}`}
              className="flex flex-col items-start gap-4 p-8 bg-white rounded-2xl border border-[#DBC6AE]/20 shadow-xl relative overflow-hidden group hover:scale-105 transition-transform duration-300 w-[350px] shrink-0"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              </div>
              <div className="flex gap-4 items-center relative z-10">
                <div
                  className={`${step.color} text-white w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg ${step.shadow}`}
                >
                  {step.id}
                </div>
                <h2 className="text-xl font-bold text-[#192E46]">
                  {step.title}
                </h2>
              </div>
              <p className="text-[#192E46]/70 text-base leading-relaxed font-medium relative z-10 pl-14">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Working;
