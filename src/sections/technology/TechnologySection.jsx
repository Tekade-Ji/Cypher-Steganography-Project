
import { motion } from "motion/react";
import {
  Cpu,
  Fingerprint,
  Binary,
  Image,
  Database,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

import SectionHeading from "../../components/ui/SectionHeading";

const technologies = [
  {
    name: "AES-256-GCM",
    category: "ENCRYPTION",
    description:
      "Authenticated symmetric encryption that protects the confidentiality and integrity of hidden messages.",
    icon: ShieldCheck,
    color: "#3857d6",
    background: "#e2e8ff",
    label: "THE FIRST LAYER",
  },
  {
    name: "PBKDF2",
    category: "KEY DERIVATION",
    description:
      "Transforms a password and random salt into a cryptographic encryption key.",
    icon: Fingerprint,
    color: "#e16d48",
    background: "#ffe5d8",
  },
  {
    name: "RGB LSB",
    category: "STEGANOGRAPHY",
    description:
      "Uses the least significant bits of image colour channels to encode encrypted information.",
    icon: Binary,
    color: "#4d8067",
    background: "#dcece1",
  },
  {
    name: "PNG",
    category: "IMAGE FORMAT",
    description:
      "A lossless image format that preserves pixel information required for extraction.",
    icon: Image,
    color: "#b37a21",
    background: "#f8edc9",
  },
  {
    name: "WEB CRYPTO",
    category: "BROWSER SECURITY",
    description:
      "Native browser cryptographic functionality for secure encryption and key derivation.",
    icon: Cpu,
    color: "#725381",
    background: "#eae0f0",
  },
  {
    name: "INDEXEDDB",
    category: "LOCAL STORAGE",
    description:
      "Browser database for locally maintaining encrypted history and image thumbnails.",
    icon: Database,
    color: "#3857d6",
    background: "#e2e8ff",
  },
];

function TechnologySection() {
  return (
    <section className="py-24 md:py-32">
      <div className="cipher-container">

        <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="The technical architecture"
            title={
              <>
                Small pixels.
                <br />
                <span className="text-primary">
                  Serious science.
                </span>
              </>
            }
            description="Explore the algorithms, image formats and browser technologies behind CIPHER. Each component has a specific responsibility in the protection and concealment of information."
          />

          <div className="hidden text-right md:block">
            <p className="font-pixel text-[9px] text-base-content/40">
              SYSTEM OVERVIEW
            </p>
            <p className="mt-2 font-display text-3xl font-bold">
              06 <span className="text-primary">MODULES</span>
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

          {technologies.map((tech, index) => {
            const Icon = tech.icon;
            const featured = index === 0;

            return (
              <motion.article
                key={tech.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.07,
                }}
                whileHover={{ y: -5 }}
                className={`group relative overflow-hidden rounded-[22px] border border-base-300 bg-base-200 p-7 transition-colors duration-300 hover:bg-base-100 ${
                  featured ? "md:col-span-2 lg:col-span-2" : ""
                }`}
              >

                <div className="flex items-start justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      background: tech.background,
                      color: tech.color,
                    }}
                  >
                    <Icon size={25} />
                  </div>

                  <span className="font-pixel text-[8px] text-base-content/40">
                    0{index + 1}
                  </span>
                </div>

                <div className={featured ? "mt-12 max-w-xl" : "mt-10"}>
                  <p className="font-pixel text-[8px] tracking-wider text-primary">
                    {tech.category}
                  </p>

                  <h3 className="mt-4 font-display text-3xl font-bold tracking-[-0.07em] md:text-4xl">
                    {tech.name}
                  </h3>

                  <p className="mt-4 max-w-lg text-sm leading-7 text-base-content/65">
                    {tech.description}
                  </p>
                </div>

                {featured && (
                  <div className="absolute bottom-7 right-7 hidden h-24 w-24 items-center justify-center rounded-full border border-primary/20 bg-primary/5 md:flex">
                    <ShieldCheck
                      size={43}
                      className="text-primary"
                    />
                  </div>
                )}

                <div className="mt-8 flex items-center justify-between border-t border-base-content/10 pt-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-base-content/40">
                    {featured ? "CORE CRYPTOGRAPHY" : tech.category}
                  </span>

                  <ArrowUpRight
                    size={17}
                    className="text-base-content/40 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary"
                  />
                </div>

              </motion.article>
            );
          })}

        </div>

        <div className="mt-10 rounded-2xl border border-base-300 p-6 md:flex md:items-center md:justify-between">
          <div>
            <p className="font-pixel text-[9px] text-primary">
              A NOTE ON THE ARCHITECTURE
            </p>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-base-content/60">
              These technologies work together, but they are not
              interchangeable. Encryption protects the contents;
              steganography conceals the presence of the encrypted data.
            </p>
          </div>

          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary md:mt-0">
            Built with established techniques
            <ShieldCheck size={18} />
          </span>
        </div>

      </div>
    </section>
  );
}

export default TechnologySection;
