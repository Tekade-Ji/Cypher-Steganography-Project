
import { motion } from "motion/react";
import {
  FileImage,
  LockKeyhole,
  ScanLine,
  Download,
} from "lucide-react";

import SectionHeading from "../../components/ui/SectionHeading";

const steps = [
  {
    number: "01",
    title: "Choose an image",
    text: "Start with an ordinary PNG image that will carry your secret message.",
    icon: FileImage,
    color: "#3857d6",
  },
  {
    number: "02",
    title: "Encrypt the message",
    text: "A password is transformed into a cryptographic key and protects your message using AES-GCM.",
    icon: LockKeyhole,
    color: "#e16d48",
  },
  {
    number: "03",
    title: "Hide the payload",
    text: "The encrypted data is embedded into selected pixel bits using an LSB technique.",
    icon: ScanLine,
    color: "#4d8067",
  },
  {
    number: "04",
    title: "Download and share",
    text: "Export the resulting PNG. The recipient can extract and decrypt the message with the correct key.",
    icon: Download,
    color: "#725381",
  },
];

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="overflow-hidden bg-neutral text-neutral-content md:py-32"
    >
      <div className="cipher-container">
        <div className="max-w-3xl">
          <span className="section-eyebrow !text-[#f5ca61]">
            <span className="h-2 w-2 bg-[#f17b50]" />
            Behind the pixels
          </span>

          <h2 className="section-title mt-5 text-[#f8f5ed]">
            A secret journey.
            <br />
            <span className="text-[#f5ca61]">
              Four simple steps.
            </span>
          </h2>

          <p className="mt-6 max-w-xl leading-8 text-white/55">
            Two different technologies work together:
            cryptography protects the message, while
            steganography conceals its existence.
          </p>
        </div>

        <div className="relative mt-16 grid gap-12 md:grid-cols-4">
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-white/20 md:block" />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                className="relative"
              >
                <div
                  className="relative z-10 flex h-16 w-16 items-center justify-center border-[5px] border-[#292a31]"
                  style={{
                    background: step.color,
                    color: "#ffffff",
                  }}
                >
                  <Icon size={26} />
                </div>

                <span className="mt-8 block font-pixel text-[9px] text-[#f5ca61]">
                  STEP {step.number}
                </span>

                <h3 className="mt-4 font-display text-2xl font-bold tracking-[-0.05em]">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-white/55">
                  {step.text}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
