import { Github, Mail, Phone } from "lucide-react";
function Footer() {
  return (
    <div className="mt-20 w-full py-8 px-10 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
      <div className="text-slate-500 font-medium">EchoCare &copy; 2025</div>
      <div className="flex gap-6 items-center">
        <a href="tel:+917595882545" className="text-slate-400 hover:text-blue-600 transition-colors">
          <Phone className="stroke-[1.5]" size={20} />
        </a>
        <a href="mailto:ayantik.sarkar2020@gmail.com" className="text-slate-400 hover:text-blue-600 transition-colors">
          <Mail className="stroke-[1.5]" size={20} />
        </a>
        <a href="https://github.com/ayantik2006/EchoCare" target="_blank" className="text-slate-400 hover:text-slate-800 transition-colors">
          <Github
            className="stroke-[1.5]"
            size={20}
          />
        </a>
      </div>
    </div>
  );
}

export default Footer;
