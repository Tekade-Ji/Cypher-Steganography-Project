
import { Link } from "react-router";
import { ArrowLeft, ArrowUpRight, Home } from "lucide-react";
import { motion } from "motion/react";

import Navbar from "../components/navigation/Navbar";
import Footer from "../sections/footer/Footer";

const pixels = [
  [0, 1, 0, 0, 1, 0, 0],
  [1, 1, 1, 0, 1, 1, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 0, 1, 0, 0],
  [0, 1, 0, 0, 0, 1, 0],
];

function PixelIllustration() {
  return (
    <div className="grid grid-cols-7 gap-2 md:gap-3">
      {pixels.flatMap((row, rowIndex) =>
        row.map((filled, colIndex) => {
          const active = Boolean(filled);

          return (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: active ? 1 : 0,
                scale: active ? 1 : 0,
                rotate: active ? [0, 5, 0] : 0,
              }}
              transition={{
                duration: 0.5,
                delay: (rowIndex * 7 + colIndex) * 0.025,
                rotate: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="aspect-square rounded-[3px]"
              style={{
                background: active
                  ? (rowIndex + colIndex) % 3 === 0
                    ? "#f17b50"
                    : "#3857d6"
                  : "transparent",
              }}
            />
          );
        })
      )}
    </div>
  );
}

function NotFoundPage() {
  return (
    <>
      <Navbar />

      <main className="relative flex min-h-[80vh] items-center overflow-hidden bg-base-200 py-20">

        <div className="pointer-events-none absolute inset-0 pixel-grid opacity-50" />

        <div className="cipher-container relative z-10 grid items-center gap-16 md:grid-cols-2">

          <div>
            <span className="section-eyebrow">
              ERROR / 404 / LOST PIXEL
            </span>

            <h1 className="mt-7 font-display text-[clamp(90px,17vw,170px)] font-bold leading-[0.8] tracking-[-0.12em]">
              4<span className="text-primary">0</span>4
            </h1>

            <h2 className="mt-9 font-display text-3xl font-bold tracking-[-0.06em] md:text-4xl">
              Well, this is
              <br />
              <span className="text-secondary">
                a little awkward.
              </span>
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-base-content/60">
              The information you're looking for seems to have
              disappeared into the invisible world. Either the
              pixel is missing, or the page never existed.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/"
                className="cipher-button cipher-button-primary"
              >
                <Home size={17} />
                Back to homepage
              </Link>

              <Link
                to="/studio"
                className="cipher-button cipher-button-outline"
              >
                Open Studio
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[380px]">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="rounded-[28px] border border-base-300 bg-base-100 p-10 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[8px] text-primary">
                  MISSING DATA
                </span>

                <span className="text-xs text-base-content/40">
                  404.001
                </span>
              </div>

              <div className="mx-auto my-12 max-w-[220px]">
                <PixelIllustration />
              </div>

              <div className="border-t border-base-300 pt-5">
                <p className="font-display text-xl font-bold">
                  Pixel not found.
                </p>

                <p className="mt-2 text-xs leading-6 text-base-content/50">
                  We searched everywhere. Even between the bits.
                </p>
              </div>
            </motion.div>

            <div className="absolute -right-5 -top-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-content shadow-lg">
              <ArrowLeft size={24} />
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}

export default NotFoundPage;
