import { useRef, useEffect, useState } from "react";
import { ShieldCheck, FileKey, Lock, Network, Tag, Scale } from "lucide-react";

function Security() {
    return (
        <section className="py-24 px-6 overflow-hidden">
            <div className="max-w-6xl mx-auto space-y-24">

                {/* Item 1 - Left Slide */}
                <SecurityCard
                    direction="left"
                    icon={<ShieldCheck size={48} className="text-[#DBC6AE]" />}
                    title="HITECH Act Compliance"
                    desc="EchoCare complies with the HITECH Act by enabling timely breach detection, reporting, and enforcement of HIPAA security requirements."
                />

                {/* Item 2 - Right Slide */}
                <SecurityCard
                    direction="right"
                    icon={<Lock size={48} className="text-[#DBC6AE]" />}
                    title="HIPAA-Aligned Security"
                    desc="EchoCare is designed with HIPAA-aligned privacy and security principles, ensuring your data remains protected at every step."
                />

                {/* Item 3 - Left Slide */}
                <SecurityCard
                    direction="left"
                    icon={<FileKey size={48} className="text-[#DBC6AE]" />}
                    title="DPDP Act Compliance"
                    desc="Adheres to the Digital Personal Data Protection Act, 2023, safeguarding personal and health data with strict privacy controls."
                />

                {/* Item 4 - Right Slide */}
                <SecurityCard
                    direction="right"
                    icon={<Network size={48} className="text-[#DBC6AE]" />}
                    title="HL7 / FHIR Standards"
                    desc="Implements HL7 and FHIR standards to ensure seamless and secure medical data exchange across different healthcare systems."
                />

                {/* Item 5 - Left Slide */}
                <SecurityCard
                    direction="left"
                    icon={<Tag size={48} className="text-[#DBC6AE]" />}
                    title="ICD / CPT Coding"
                    desc="Integrated support for ICD and CPT codes to facilitate accurate billing and structured clinical documentation."
                />

                {/* Item 6 - Right Slide */}
                <SecurityCard
                    direction="right"
                    icon={<Scale size={48} className="text-[#DBC6AE]" />}
                    title="Ethical AI & Consent"
                    desc="Strictly adheres to obtaining informed consent, maintaining audit logs, and minimizing data collection for defined purposes only."
                />

            </div>
        </section>
    );
}

function SecurityCard({ direction, icon, title, desc }) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.2 } // Trigger when 20% visible
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, []);

    const slideClass = direction === "left"
        ? (isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-24")
        : (isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-24");

    return (
        <div
            ref={ref}
            className={`flex flex-col md:flex-row items-center gap-10 transition-all duration-1000 ease-out ${slideClass}`}
        >
            {/* Visual/Icon Side */}
            <div className={`flex-shrink-0 w-24 h-24 rounded-3xl bg-[#192E46] flex items-center justify-center shadow-xl rotate-3 hover:rotate-6 transition-transform duration-500 ${direction === 'right' ? 'md:order-last' : ''}`}>
                {icon}
            </div>

            {/* Content Side */}
            <div className={`bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-lg hover:shadow-2xl transition-shadow duration-300 max-w-2xl ${direction === 'right' ? 'text-right md:ml-auto' : 'md:mr-auto'}`}>
                <h3 className="text-3xl md:text-4xl font-extrabold text-[#192E46] mb-4 tracking-tight leading-tight">
                    {title}
                </h3>
                <p className="text-lg text-[#2E5674] font-medium leading-relaxed">
                    {desc}
                </p>
            </div>
        </div>
    );
}

export default Security;
