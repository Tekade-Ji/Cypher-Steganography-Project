
import { Link } from "react-router";
import { Boxes } from "lucide-react";

function Logo({ light = false }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 ${
        light ? "text-white" : "text-base-content"
      }`}
      aria-label="CIPHER home"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-content">
        <Boxes size={21} strokeWidth={2.4} />
      </span>

      <span className="font-display text-xl font-bold tracking-[-0.07em]">
        CIPHER<span className="text-secondary">®</span>
      </span>
    </Link>
  );
}

export default Logo;
