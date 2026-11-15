
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUpRight, Sparkles } from "lucide-react";

import Button from "../../components/ui/Button";
import PixelArtifact from "../../components/effects/PixelArtifact";

function HeroSection() {
  const reduceMotion = useReducedMotion();

  const reveal = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="relative overflow-hidden pb-20 pt-16 md:pb-28 md:pt-24">
      <div className="cipher-container grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">

        <div className="relative z-10 ">
          <motion.div
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            variants={reveal}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-base-300 bg-base-100 px-4 py-2"
          >

            <span className="text-[10px] font-bold uppercase tracking-[0.15em] ">
              A different way to hide information
            </span>

            <Sparkles size={14} className="text-secondary" />
          </motion.div>

          <motion.h1
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            variants={reveal}
            className="font-display text-[clamp(60px,9vw,112px)] font-bold leading-[0.87] tracking-[-0.09em]"
          >
            Beyond
            <br />

            <span className="text-primary">visible</span>

            <br />

            <span className="relative inline-block">
              Into
              <span className="absolute -right-4 top-1 h-3 w-3 bg-secondary md:-right-6 md:top-3 md:h-5 md:w-5" />
            </span>

            <br />

            <span className="text-secondary">secret</span>
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            variants={reveal}
            className="mt-8 max-w-[440px] text-base leading-8 text-base-content/65 md:text-lg"
          >
            What if an ordinary image could carry an extraordinary secret?
            Explore the art of hiding information in plain sight through
            cryptography and steganography.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            variants={reveal}
            className="mt-9 flex flex-wrap gap-4"
          >
            <Button to="/studio">
              Enter the studio
            </Button>

            <Button
              variant="outline"
              href="#how-it-works"
              icon={false}
            >
              Discover how it works
            </Button>
          </motion.div>

          <div className="mt-12 flex flex-wrap items-center gap-5 text-xs font-semibold text-base-content/50">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 bg-success" />
              Browser-based processing
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2 w-2 bg-primary" />
              PNG image support
            </span>
          </div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          <div className="pixel-grid relative flex min-h-[390px] items-center justify-center overflow-hidden rounded-[30px] bg-base-200 p-5 md:min-h-[520px]">

            <span className="absolute left-6 top-6 font-pixel text-[9px] text-[#77746b]">
              FIG. 001
            </span>

            <span className="absolute right-6 top-6 text-xs font-bold text-[#77746b]">
              CIPHER / 001
            </span>

            <PixelArtifact />

            <div className="absolute bottom-6 left-6">
              <p className="font-pixel text-[8px] text-[#77746b]">
                TRANSMISSION
              </p>

              <p className="mt-2 font-display text-xl font-bold">
                Invisible / Visible
              </p>
            </div>

            <div className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-[#3857d6] text-white">
              <ArrowUpRight size={20} />
            </div>
          </div>
        </motion.div>

      </div>

      <div className="cipher-container mt-16 flex items-center justify-between border-t border-base-300 pt-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/45">
          Explore the unseen
        </span>

        <a
          href="#features"
          className="flex items-center gap-2 text-xs font-bold"
        >
          Scroll to explore
          <ArrowDown size={15} />
        </a>
      </div>
    </section>
  );
}

export default HeroSection;
