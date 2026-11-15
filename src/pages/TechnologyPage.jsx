
import { motion } from "motion/react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Link } from "react-router";

import Navbar from "../components/navigation/Navbar";
import Footer from "../sections/footer/Footer";
import TechnologySection from "../sections/technology/TechnologySection";

function TechnologyPage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="relative overflow-hidden bg-base-200 py-24 md:py-36">
          <div className="cipher-container">

            <div className="mb-10 flex items-center justify-between">
              <span className="font-pixel text-[9px] text-primary">
                CIPHER / KNOWLEDGE BASE
              </span>

              <span className="text-xs text-base-content/50">
                001 — TECHNOLOGY
              </span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-display text-[clamp(55px,10vw,120px)] font-bold leading-[0.9] tracking-[-0.09em]"
            >
              Under the
              <br />
              <span className="text-primary">surface.</span>
            </motion.h1>

            <div className="mt-12 grid gap-8 border-t border-base-content/15 pt-8 md:grid-cols-2">

              <p className="max-w-md text-base leading-8 text-base-content/60">
                Every hidden message has a story beneath its pixels.
                Explore the algorithms, cryptographic primitives and
                browser technologies that power CIPHER.
              </p>

              <div className="flex items-end justify-between">
                <Link
                  to="/#how-it-works"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary"
                >
                  See the process
                  <ArrowUpRight size={17} />
                </Link>

                <a
                  href="#technology-details"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-content transition-transform hover:translate-y-1"
                  aria-label="Scroll to technologies"
                >
                  <ArrowDown size={20} />
                </a>
              </div>
            </div>

          </div>
        </section>

        <div id="technology-details">
          <TechnologySection />
        </div>

      </main>

      <Footer />
    </>
  );
}

export default TechnologyPage;
