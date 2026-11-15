import { ArrowUpRight, ArrowUp, Code2 } from "lucide-react";

import Logo from "../../components/brand/Logo";

import { Link } from "react-router";

const footerGroups = [
  {
    title: "EXPLORE",
    links: [
      ["Home", "/"],
      ["About CIPHER", "/#about"],
      ["How it works", "/#how-it-works"],
      ["Frequently asked questions", "/#faq"],
    ],
  },
  {
    title: "THE STUDIO",
    links: [
      ["Encrypt & Hide", "/studio/encrypt"],
      ["Decrypt & Extract", "/studio/decrypt"],
      ["Metadata Inspector", "/studio/metadata"],
      ["Metadata Cleaner", "/studio/cleaner"],
      ["Key Vault", "/studio/vault"],
    ],
  },
  {
    title: "THE SCIENCE",
    links: [
      ["AES-256-GCM", "/learn/aes"],
      ["PBKDF2", "/learn/pbkdf2"],
      ["LSB Steganography", "/learn/lsb"],
      ["PNG Processing", "/learn/png"],
    ],
  },
  {
    title: "PROJECT",
    links: [
      ["Technology overview", "/technology"],
      ["Documentation", "https://github.com/Tekade-Ji/Cypher-Steganography-Project/blob/main/docs/PROJECT_DOCUMENTATION.md"],
    ],
  },
];

function Footer() {
  return (
    <footer className="overflow-hidden bg-neutral text-neutral-content">
      <div className="cipher-container py-20 md:py-24">
        <div className="grid gap-12 border-b border-white/15 pb-14 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Logo light />

            <h2 className="mt-8 max-w-md font-display text-4xl font-bold leading-tight tracking-[-0.07em] md:text-5xl">
              Not everything
              <br />
              needs to be
              <span className="text-[#f5ca61]"> seen.</span>
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/50">
              A creative exploration of cryptography, steganography and the
              hidden side of digital images.
            </p>

            <a
              href="https://github.com/Tekade-Ji/Cypher-Steganography-Project"
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-3 rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold transition-colors hover:bg-white hover:text-[#292a31]"
            >
              <Code2 size={17} />
              Project repository
              <ArrowUpRight size={15} />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="font-pixel text-[8px] leading-5 text-[#f5ca61]">
                  {group.title}
                </h3>

                <ul className="mt-6 space-y-4">
                  {group.links.map(([label, href]) => (
                    <li key={label}>
                      <Link
                        to={href}
                        className="text-xs leading-6 text-neutral-content/60 transition-colors hover:text-neutral-content"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-5 pt-8 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-lg font-bold">CIPHER®</p>

            <p className="mt-1 text-xs text-white/40">
              Beyond visible information.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-white/40">
            <span>Educational project</span>
            <span>© {new Date().getFullYear()} CIPHER</span>

            <button
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5ca61] text-[#292a31] transition-transform hover:-translate-y-1"
              aria-label="Back to top"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-4 text-center">
        <p className="font-pixel text-[8px] text-white/25">
          LOOK CLOSER. THINK DEEPER.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
