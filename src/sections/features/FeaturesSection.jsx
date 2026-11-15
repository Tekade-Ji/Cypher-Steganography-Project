
import { motion } from "motion/react";
import {
  Eye,
  EyeOff,
  Image,
  KeyRound,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import SectionHeading from "../../components/ui/SectionHeading";

const features = [
  {
    number: "01",
    title: "Hide a message",
    description:
      "Embed encrypted messages inside ordinary PNG images using pixel-level steganography.",
    icon: EyeOff,
    color: "#3857d6",
    background: "#e2e8ff",
  },
  {
    number: "02",
    title: "Reveal the secret",
    description:
      "Extract hidden information and recover its original message using the correct secret key.",
    icon: Eye,
    color: "#e16d48",
    background: "#ffe5d8",
  },
  {
    number: "03",
    title: "Encrypt with AES",
    description:
      "Protect message contents using authenticated AES-256-GCM encryption.",
    icon: ShieldCheck,
    color: "#4d8067",
    background: "#dcece1",
  },
  {
    number: "04",
    title: "Inspect metadata",
    description:
      "Explore image properties, embedded metadata and supported PNG information.",
    icon: ScanSearch,
    color: "#725381",
    background: "#eae0f0",
  },
  {
    number: "05",
    title: "Clean your image",
    description:
      "Remove metadata or clear an embedded CIPHER payload without knowing its secret key.",
    icon: Image,
    color: "#b37a21",
    background: "#f8edc9",
  },
  {
    number: "06",
    title: "Keep your keys",
    description:
      "Maintain a locally encrypted history of associated images and secret keys.",
    icon: KeyRound,
    color: "#3857d6",
    background: "#e2e8ff",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="cipher-container">
        <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="The CIPHER toolkit"
            title={
              <>
                Six ways to
                <br />
                explore the <span className="text-primary">unseen.</span>
              </>
            }
            description="A collection of tools designed around the fascinating relationship between digital images, cryptography and hidden information."
          />

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-[#26251f]">
            <Sparkles size={27} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.number}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.07,
                }}
                whileHover={{ y: -7 }}
                className="group rounded-[22px] border border-base-300 bg-base-100 p-7 transition-shadow duration-300 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110"
                    style={{
                      background: feature.background,
                      color: feature.color,
                    }}
                  >
                    <Icon size={27} />
                  </div>

                  <span className="font-pixel text-[9px] text-base-content/40">
                    {feature.number}
                  </span>
                </div>

                <h3 className="mt-9 font-display text-2xl font-bold tracking-[-0.05em]">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-base-content/60">
                  {feature.description}
                </p>

                <div className="mt-7 h-1 w-10 bg-secondary transition-all duration-300 group-hover:w-full" />
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
