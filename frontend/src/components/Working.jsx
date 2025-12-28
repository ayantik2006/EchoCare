import React, { useRef, useEffect, useState } from "react";
import { Mic, FileText, Sparkles, FileStack, Stethoscope, Activity, FileAudio, FileCheck, Wand2, User, UserCheck, Play } from "lucide-react";

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
    <div className="py-20 overflow-hidden relative" id="how-it-works">

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
        <h2 className="text-[#DBC6AE] font-extrabold tracking-widest text-lg uppercase mb-3">Process Flow</h2>
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


      {/* --- DIARIZATION SECTION (TRANSCRIPT TO SPEECH) --- */}
      <div className="max-w-6xl mx-auto px-6 mb-32">
        <div className="bg-white/50 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 border border-[#DBC6AE]/30 relative overflow-hidden">
          {/* Background Blob */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#2E5674]/5 to-[#DBC6AE]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10 text-left">

            {/* Text Side (Left) */}
            <div className="space-y-6 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2E5674]/10 text-[#2E5674] font-bold text-sm">
                <UserCheck size={16} />
                <span>Speaker Diarization</span>
              </div>
              <DiarizationGraphics />
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#192E46] leading-tight">
                Who said what? <br /> <span className="text-[#2E5674]">Perfectly Clear.</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                EchoCare intelligently distinguishes between multiple speakers, separating doctor instructions from patient concerns with high precision.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge icon={<User size={14} />} text="Multi-Speaker" />
                <Badge icon={<Wand2 size={14} />} text="Auto-Labeling" />
              </div>
            </div>

            {/* Visual Side (Right - Animation) */}
            <div className="order-1 lg:order-2">
              <DiarizationDemo />
            </div>
          </div>
        </div>
      </div>

      {/* --- DEMO SECTION (SOAP & RECORDING) --- */}
      <div className="max-w-6xl mx-auto px-6 mt-32 mb-20">
        <div className="bg-white/50 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 border border-[#DBC6AE]/30 relative overflow-hidden">
          {/* Background Blob */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#2E5674]/5 to-[#DBC6AE]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">

            {/* Visual Side (Mockups) */}
            <div className="relative">
              {/* 1. Main Window: SOAP Note */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 relative z-10">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                  <div className="w-10 h-10 rounded-full bg-[#F0F7FF] flex items-center justify-center text-[#2E5674]">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#192E46]">Generated SOAP Note</h3>
                    <p className="text-xs text-gray-400">Just now</p>
                  </div>
                </div>
                <div className="space-y-4 font-medium text-sm md:text-base leading-relaxed text-[#192E46]/90">
                  <div>
                    <span className="text-[#2E5674] font-bold">S:</span> Middle-aged man reports gradual blurring of vision and difficulty reading small text for the past few months. No eye pain or redness.
                  </div>
                  <div>
                    <span className="text-[#2E5674] font-bold">O:</span> Vitals stable; reduced near vision noted; pupils reactive; no visible eye infection.
                  </div>
                  <div>
                    <span className="text-[#2E5674] font-bold">A:</span> Likely age-related vision change (presbyopia); rule out refractive error.
                  </div>
                  <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#DBC6AE]/20">
                    <span className="text-[#2E5674] font-bold">P:</span> Recommend eye examination, prescribe corrective lenses if needed, advise regular eye checkups.
                  </div>
                </div>
              </div>

              {/* 2. Floating Element: Recording (Animated) */}
              <div className="absolute -top-6 -left-4 md:-left-8 bg-[#192E46] text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-3 animate-bounce-slow z-20">
                <div className="relative w-3 h-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
                <span className="font-semibold text-sm tracking-wide">Recording... 04:12</span>
              </div>

              {/* 3. Floating Element: Transcript (Animated) */}
              <div className="absolute -bottom-6 -right-4 md:-right-8 bg-white/90 backdrop-blur-md border border-[#2E5674]/20 p-4 rounded-2xl shadow-lg max-w-[240px] z-30 hidden md:block animate-pulse-slow">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-[#DBC6AE]" />
                  <span className="text-xs font-bold text-[#2E5674] uppercase tracking-wider">AI Transcribing</span>
                </div>
                <p className="text-xs text-gray-600 italic">"Patient mentions difficulty reading..."</p>
              </div>
            </div>

            {/* Text Side */}
            <div className="space-y-6">
              <VoiceToTextGraphics />
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#192E46] leading-tight">
                From Conversation to <span className="text-[#2E5674]">Clinical Record</span> in Seconds.
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Watch as EchoCare captures the consultation in real-time and instantly structures it into a comprehensive SOAP note.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge icon={<Mic size={14} />} text="Voice Recognition" />
                <Badge icon={<Activity size={14} />} text="Context Aware" />
                <Badge icon={<FileCheck size={14} />} text="Instant Format" />
              </div>
            </div>
          </div>
        </div>
      </div>

      

      {/* --- STATISTICS SECTION --- */}
      <div className="max-w-6xl mx-auto px-6 mt-32 mb-20">
        <div className="grid md:grid-cols-2 gap-8">
          <StatCard
            number={200}
            suffix="+"
            label="Hours Saved"
            desc="Saves 200 hours per doctor per year by eliminating manual documentation."
          />
          <StatCard
            number={25}
            suffix="%"
            label="No-shows Reduced"
            desc="Reduces no-shows by 25%, recovering hundreds of billable visits annually."
          />
        </div>
      </div>

    </div >
  );
}

// Stats Card Component with Animation
function StatCard({ number, suffix, label, desc }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setHasAnimated(entries[0].isIntersecting);
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasAnimated) {
      setCount(0);
      return;
    }

    let start = 0;
    // Animation duration 2s
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const timePassed = now - startTime;
      const progress = Math.min(timePassed / duration, 1);

      // Ease out quart
      const ease = 1 - Math.pow(1 - progress, 4);

      const currentCount = Math.floor(ease * number);
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [hasAnimated, number]);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center text-center p-10 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[#DBC6AE]/20 hover:scale-105 transition-transform duration-500"
    >
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-6xl md:text-7xl font-extrabold text-[#192E46] tabular-nums tracking-tighter">
          {count}
        </span>
        <span className="text-4xl font-bold text-[#DBC6AE]">{suffix}</span>
      </div>
      <h3 className="text-xl font-bold text-[#2E5674] mb-3 uppercase tracking-wide">{label}</h3>
      <p className="text-gray-500 font-medium leading-relaxed max-w-sm">
        {desc}
      </p>
    </div>
  );
}

function Badge({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#192E46] border border-[#192E46]/10 shadow-sm cursor-default hover:bg-[#DBC6AE]/20 transition-colors">
      {icon}
      {text}
    </span>
  );
}

function VoiceToTextGraphics() {
  return (
    <div className="flex items-center gap-4 mb-4 select-none">
      {/* Animated Voice Waves */}
      <div className="flex items-center gap-1 h-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-1.5 bg-[#2E5674] rounded-full animate-bounce-custom"
            style={{
              height: '40%',
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1s'
            }}
          ></div>
        ))}
      </div>

      {/* Arrow */}
      <div className="text-[#DBC6AE]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="M12 5l7 7-7 7" />
        </svg>
      </div>

      {/* Animated Text Lines */}
      <div className="flex flex-col gap-1.5 justify-center h-8 w-12">
        <div className="h-1 bg-[#192E46] rounded-full w-full animate-pulse"></div>
        <div className="h-1 bg-[#192E46] rounded-full w-[80%] animate-pulse delay-75"></div>
        <div className="h-1 bg-[#192E46] rounded-full w-[90%] animate-pulse delay-150"></div>
      </div>
    </div>
  );
}

function DiarizationDemo() {
  const [step, setStep] = useState(0); // 0: Raw, 1: Processing, 2: Diarized

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(prev => (prev === 2 ? 0 : prev + 1));
    }, 4000); // Change state every 4 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mx-auto max-w-sm h-[320px] bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
      {/* Fake Browser Header */}
      <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4 bg-white z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F0F7FF] flex items-center justify-center text-[#2E5674] font-bold">
            Tr
          </div>
          <span className="font-bold text-[#192E46]">Transcript</span>
        </div>
        <button className="text-xs font-medium text-white bg-[#2E5674] px-3 py-1.5 rounded-lg hover:bg-[#192E46] transition-colors cursor-default shadow-sm">
          Re-Enhance
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-5 relative overflow-hidden">
        {/* Checkbox Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${step === 2 ? 'bg-[#2E5674] border-[#2E5674]' : 'border-gray-300'}`}>
            {step === 2 && <FileCheck size={10} className="text-white" />}
          </div>
          <span className="text-xs font-semibold text-[#192E46]">Show AI Enhanced Version</span>
        </div>

        {/* State 0: Raw Text */}
        <div className={`absolute top-14 left-5 right-5 transition-all duration-700 ${step === 0 ? 'opacity-100 translate-y-0 blur-none' : 'opacity-0 -translate-y-4 blur-sm'}`}>
          <p className="text-sm text-gray-600 leading-relaxed font-mono">
            hello doctor I am having a mild fever and nausea for the last couple of days okay I understand I prescribe you this medicine and I prefer you to have some sleep even take some rest a fever and nausea comes back when make sure you visit once more thank you thank you doctor
          </p>
        </div>

        {/* State 1: Processing Overlay */}
        <div className={`absolute inset-0 bg-white/80 z-20 flex items-center justify-center flex-col gap-3 transition-opacity duration-500 ${step === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="w-12 h-12 rounded-full border-4 border-[#DBC6AE]/30 border-t-[#2E5674] animate-spin"></div>
          <span className="text-sm font-bold text-[#2E5674] animate-pulse">Analysing Speakers...</span>
        </div>

        {/* State 2: Diarized View */}
        <div className={`absolute top-14 left-5 right-5 flex flex-col gap-3 transition-all duration-700 ${step === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Patient Bubble */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-500">P</div>
            <div className="bg-gray-50 rounded-2xl rounded-tl-none p-3 text-xs text-gray-700 border border-gray-100">
              Hello doctor, I am having a mild fever and nausea...
            </div>
          </div>
          {/* Doctor Bubble */}
          <div className="flex gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-[#EBF5FF] flex-shrink-0 flex items-center justify-center text-xs font-bold text-[#2E5674]">D</div>
            <div className="bg-[#EBF5FF] rounded-2xl rounded-tr-none p-3 text-xs text-[#192E46] border border-[#dcecfc]">
              Okay, I understand. I prescribe you this medicine...
            </div>
          </div>
          {/* Patient Bubble */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-500">P</div>
            <div className="bg-gray-50 rounded-2xl rounded-tl-none p-3 text-xs text-gray-700 border border-gray-100">
              Thank you doctor.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function DiarizationGraphics() {
  return (
    <div className="flex items-center gap-4 mb-4 select-none">
      {/* Input: Mixed Audio */}
      <div className="flex items-center gap-1 h-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-1.5 bg-gray-400 rounded-full animate-bounce-custom"
            style={{
              height: '40%',
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1.5s'
            }}
          ></div>
        ))}
      </div>

      {/* Arrow */}
      <div className="text-[#DBC6AE]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="M12 5l7 7-7 7" />
        </svg>
      </div>

      {/* Output: Separated Speakers */}
      <div className="flex flex-col gap-2 justify-center">
        {/* Speaker 1 */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#2E5674]"></div>
          <div className="h-1 bg-[#2E5674]/50 rounded-full w-8 animate-pulse"></div>
        </div>
        {/* Speaker 2 */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
          <div className="h-1 bg-gray-400/50 rounded-full w-6 animate-pulse delay-75"></div>
        </div>
      </div>
    </div>
  );
}

export default Working;
