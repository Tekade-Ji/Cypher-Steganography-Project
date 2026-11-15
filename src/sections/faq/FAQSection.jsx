
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";

import SectionHeading from "../../components/ui/SectionHeading";

const questions = [
  {
    question: "What is steganography?",
    answer:
      "Steganography is the technique of concealing information within another medium. In CIPHER, encrypted messages are embedded into PNG images by modifying selected least significant pixel bits.",
  },
  {
    question: "How is steganography different from encryption?",
    answer:
      "Encryption transforms readable information into ciphertext so its contents cannot be understood without the correct key. Steganography conceals the existence of that information. CIPHER combines both techniques.",
  },
  {
    question: "Why does CIPHER use PNG images?",
    answer:
      "PNG is a lossless image format. Its pixel values can be preserved during saving and reopening, making it suitable for our LSB embedding and extraction process.",
  },
  {
    question: "Can I recover a message without its password?",
    answer:
      "No. The encrypted message requires the correct secret key for authenticated decryption. Our separate payload-clearing utility can remove a CIPHER payload without decrypting it.",
  },
  {
    question: "What happens if an image is resized or compressed?",
    answer:
      "Image transformations can alter pixel values and destroy embedded information. Always preserve the original encrypted PNG. Lossy image conversions are particularly unsuitable.",
  },
  {
    question: "Are my images uploaded to a server?",
    answer:
      "CIPHER is designed for local browser processing. Images, messages and keys are processed on the user's device rather than uploaded to an application backend.",
  },
  {
    question: "What is AES-256-GCM?",
    answer:
      "AES-256-GCM is an authenticated encryption mode that uses a 256-bit key. It provides confidentiality and detects unauthorized modification of encrypted data.",
  },
  {
    question: "What is the CIPHER Key Vault?",
    answer:
      "It is a local browser-based history system that maintains image thumbnails and associated secret-key records in encrypted storage. Records are subject to a 48-hour expiration policy.",
  },
];

function FAQSection() {
  const [active, setActive] = useState(0);

  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="cipher-container grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">

        <div>
          <SectionHeading
            eyebrow="Curiosity corner"
            title={
              <>
                Questions
                <br />
                worth <span className="text-primary">asking.</span>
              </>
            }
            description="A few things you might want to understand before entering the world of hidden information."
          />

          <div className="mt-9 inline-flex items-center gap-3 rounded-xl bg-[#f5ca61] px-5 py-4">
            <span className="font-pixel text-[9px]">
              STILL CURIOUS?
            </span>
          </div>
        </div>

        <div>
          {questions.map((item, index) => {
            const isOpen = active === index;

            return (
              <div className="faq-item py-5" key={item.question}>
                <button
                  onClick={() => setActive(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-start gap-4">
                    <span className="font-pixel pt-1 text-[8px] text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="font-display text-lg font-bold tracking-[-0.03em]">
                      {item.question}
                    </span>
                  </span>

                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isOpen
                      ? "bg-primary text-white"
                      : "bg-base-200"
                  }`}>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                    >
                      <Plus size={17} />
                    </motion.span>
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="faq-answer"
                    >
                      <p className="pb-3 pl-9 pr-12 pt-4 text-sm leading-7 text-base-content/60">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
