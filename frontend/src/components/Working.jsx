import React, { useRef, useEffect, useState } from "react";
import { Mic, FileText, Sparkles, FileStack, Stethoscope, Activity, FileAudio } from "lucide-react";

function Working() {
  // --- Carousel Data ---
  const carouselSteps = [
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

  const seamlessSteps = [...carouselSteps, ...carouselSteps];

  // --- Timeline Logic & Data ---
  const timelineContainerRef = useRef(null);
  const pathRef = useRef(null);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const [pathD, setPathD] = useState("");
  const [activeStep, setActiveStep] = useState(0);

  const timelineSteps = [
    {
      id: 1,
      title: "Start Consultation",
      description: "Doctor starts a new consultation",
      icon: <Stethoscope className="text-white" size={24} />,
      color: "bg-[#2E5674]",
    },
    {
      id: 2,
      title: "Record Conversation",
      description: "System records the doctor-patient conversation",
      icon: <Activity className="text-white" size={24} />,
      color: "bg-[#192E46]",
    },
    {
      id: 3,
      title: "Transcribe Audio",
      description: "Audio is converted into raw transcript",
      icon: <FileAudio className="text-white" size={24} />,
      color: "bg-[#2E5674]",
    },
    {
      id: 4,
      title: "Generate SOAP",
      description: "Detailed SOAP notes are prepared",
      icon: <FileText className="text-white" size={24} />,
      color: "bg-[#192E46]",
    },
  ];

  // Generate SVG Path
  useEffect(() => {
    if (!timelineContainerRef.current) return;

    const updatePath = () => {
      const { width, height } = timelineContainerRef.current.getBoundingClientRect();
      const midX = width / 2;
      const waveWidth = Math.min(width * 0.35, 200); // Amplitude

      const numSteps = timelineSteps.length;
      const stepGap = height / numSteps;

      const points = timelineSteps.map((_, i) => {
        // Center the vertical point for the step
        const y = (i + 0.5) * stepGap;
        const isLeft = i % 2 === 0;
        const x = isLeft ? midX - waveWidth : midX + waveWidth;
        return { x, y };
      });

      // Start slightly above the first point, centered
      let d = `M ${midX} 0`;

      // Curve through points
      let prevX = midX;
      let prevY = 0;

      points.forEach((pt) => {
        const distY = pt.y - prevY;
        const cpOffset = distY * 0.5;

        // S-Curve logic
        d += ` C ${prevX} ${prevY + cpOffset}, ${pt.x} ${pt.y - cpOffset}, ${pt.x} ${pt.y}`;

        prevX = pt.x;
        prevY = pt.y;
      });

      // Finish curve at bottom center
      const finalY = height;
      const distY = finalY - prevY;
      const cpOffset = distY * 0.5;
      d += ` C ${prevX} ${prevY + cpOffset}, ${midX} ${finalY - cpOffset}, ${midX} ${finalY}`;

      setPathD(d);
    };

    // Use ResizeObserver to react to any layout changes
    const resizeObserver = new ResizeObserver(() => {
      // Wrap in requestAnimationFrame to avoid "ResizeObserver loop limit exceeded"
      window.requestAnimationFrame(() => {
        updatePath();
      });
    });

    resizeObserver.observe(timelineContainerRef.current);

    // Initial call
    updatePath();

    return () => resizeObserver.disconnect();
  }, []);

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (!timelineContainerRef.current || !pathRef.current) return;

      const rect = timelineContainerRef.current.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY; // Absolute position
      const height = rect.height;

      // Viewport properties
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;

      // Determine "active" scroll position.
      // We want the pointer to traverse the path as the user scrolls past the container.
      // Start: When container top enters bottom of screen (or slightly higher like 80%)
      // End: When container bottom leaves top of screen (or reasonable valid range)

      // Let's bind it to center-of-screen intersection for smoother UX.
      // Pointer maps to: How far is the screen center inside the container?

      const viewCenter = scrollY + (windowHeight / 2);
      const distFromTop = viewCenter - elementTop;
      let progress = distFromTop / height;

      // Clamp 0 to 1
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;

      setActiveStep(Math.floor(progress * timelineSteps.length));

      // Calculate proximity to step centers to fade pointer
      // Steps are at 0.125, 0.375 etc.
      const numSteps = timelineSteps.length;
      const stepSegment = 1 / numSteps;
      let targetOpacity = 1;

      for (let i = 0; i < numSteps; i++) {
        const stepCenter = (i + 0.5) * stepSegment;
        const dist = Math.abs(progress - stepCenter);
        // If within 5% of path length from center, fade
        if (dist < 0.05) {
          // Linear fade calculation? Or just boolean?
          // Let's make it smooth: 0 dist -> 0.05 opacity. 0.05 dist -> 1 opacity.
          // dist / 0.05 = normalized fade (0 to 1)
          const normalized = dist / 0.05;
          targetOpacity = 0.05 + (0.95 * normalized);
          break;
        }
      }

      try {
        const pathLength = pathRef.current.getTotalLength();
        const point = pathRef.current.getPointAtLength(progress * pathLength);
        setPointerPos({ x: point.x, y: point.y, opacity: targetOpacity });
      } catch (e) {
        // Ignore
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathD]);


  // Typing animation for "..."
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-20 overflow-hidden relative bg-gradient-to-b from-white via-[#F9FcfE] to-white" id="how-it-works">

      {/* --- CAROUSEL SECTION --- */}
      <div className="flex flex-col items-center justify-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#192E46] tracking-tight flex items-center justify-center">
          <span
            className="flex items-center gap-1 transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${dots.length * 5}px)` }}
          >
            <span>How it works</span>
            <span className="inline-block w-12 text-left">{dots}</span>
          </span>
        </h1>
      </div>

      <div className="relative w-full max-w-7xl mx-auto overflow-hidden p-8 br-[50px] mb-24">
        {/* Carousel Masks */}
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

      {/* --- TIMELINE SECTION --- */}
      <div className="flex flex-col items-center justify-center mb-16">
        <h2 className="text-[#DBC6AE] font-bold tracking-widest text-sm uppercase mb-3">Process Flow</h2>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#192E46] tracking-tight">Detailed Workflow</h1>
      </div>

      <div
        ref={timelineContainerRef}
        className="max-w-6xl mx-auto relative min-h-[1600px]"
      >
        {/* SVG Path */}
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
          style={{ overflow: 'visible' }}
        >
          <path
            d={pathD}
            fill="none"
            stroke="#DBC6AE"
            strokeWidth="2"
            strokeDasharray="8 8"
            className="opacity-40"
          />
          <path
            ref={pathRef}
            d={pathD}
            fill="none"
            stroke="transparent"
            strokeWidth="0"
          />

          {/* Turning Point Markers (Static Dots) */}
          {timelineSteps.map((_, i) => {
            const numSteps = timelineSteps.length;
            // Use the same logic as updatePath to find coordinates
            // But since we can't easily access the calculated 'x' here without state,
            // we rely on the component re-render or CSS. 
            // Actually, let's just create absolute divs for markers since we know the % positions.
            return null;
          })}
        </svg>

        {/* Pointer */}
        <div
          className="absolute z-20 w-10 h-10 rounded-full bg-[#192E46] border-4 border-[#DBC6AE] shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-opacity duration-75 ease-linear"
          style={{
            left: pointerPos.x,
            top: pointerPos.y,
            opacity: pointerPos.opacity !== undefined ? pointerPos.opacity : 1
          }}
        >
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>

        {/* Steps */}
        <div className="absolute inset-0 z-10 w-full h-full">
          {timelineSteps.map((step, index) => {
            const isLeft = index % 2 === 0;
            const topPos = (index + 0.5) * (100 / timelineSteps.length);

            return (
              <div
                key={step.id}
                className={`absolute w-full flex ${isLeft ? 'justify-start lg:w-[42%]' : 'justify-end lg:ml-[58%] lg:w-[42%]'} items-center px-6`}
                style={{
                  top: `${topPos}%`,
                  transform: 'translateY(-50%)'
                }}
              >
                {/* Checkpoint Dot on the Curve */}
                {/* We position this absolutely relative to the row to align with the curve center if possible, 
                            but since the curve X varies, we can't easily static place it.
                            Instead, we rely on the curve logic placing the Turning point exactly at this Y height.
                        */}

                <div
                  className={`
                                relative p-8 bg-white rounded-2xl shadow-md border border-gray-100 transition-all duration-500 w-full max-w-lg
                                ${activeStep === index ? 'border-[#DBC6AE] ring-4 ring-[#DBC6AE]/10 scale-100 opacity-100 shadow-xl' : 'scale-95 opacity-80'}
                            `}
                >
                  <div className="flex items-center gap-5">
                    <div className={`shrink-0 w-14 h-14 rounded-xl ${step.color} flex items-center justify-center shadow-lg text-white`}>
                      {step.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#DBC6AE] uppercase tracking-wider mb-1">Step 0{index + 1}</div>
                      <h3 className="text-xl font-bold text-[#192E46] mb-1">{step.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}

export default Working;
