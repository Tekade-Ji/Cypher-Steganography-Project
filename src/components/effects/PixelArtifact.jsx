
import { motion, useReducedMotion } from "motion/react";

const pixels = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 2, 2, 2, 2, 1, 0],
  [1, 2, 3, 3, 3, 3, 2, 1],
  [1, 2, 3, 4, 4, 3, 2, 1],
  [1, 2, 3, 4, 4, 3, 2, 1],
  [1, 2, 3, 3, 3, 3, 2, 1],
  [0, 1, 2, 2, 2, 2, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
];

const colors = {
  0: "transparent",
  1: "#263f9e",
  2: "#3857d6",
  3: "#6982ed",
  4: "#b9c7ff",
};

function PixelArtifact() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[430px] items-center justify-center">

      <div className="absolute inset-[10%] rounded-full border border-primary/20" />

      <div className="absolute inset-[18%] rounded-full border border-dashed border-primary/30" />

      <motion.div
        className="absolute inset-0"
        animate={
          reduceMotion
            ? {}
            : { rotate: 360 }
        }
        transition={{
          duration: 55,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <span className="absolute left-1/2 top-[4%] h-3 w-3 -translate-x-1/2 bg-secondary" />
        <span className="absolute bottom-[7%] left-[14%] h-4 w-4 bg-accent" />
        <span className="absolute right-[9%] top-[28%] h-2 w-2 bg-primary" />
      </motion.div>

      <motion.div
        className="relative z-10"
        animate={
          reduceMotion
            ? {}
            : {
                y: [0, -15, 0],
                rotate: [-4, 2, -4],
              }
        }
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={
          reduceMotion
            ? {}
            : { scale: 1.07, rotate: 5 }
        }
      >
        <div className="relative">
          <div
            className="absolute -right-5 top-5 h-full w-full"
            style={{
              background: "#253da8",
              transform: "translate(12px, 12px)",
            }}
          />

          <div
            className="relative grid grid-cols-8 gap-[3px] border-[5px] border-[#263f9e] bg-[#263f9e] p-1.5"
            style={{
              imageRendering: "pixelated",
            }}
          >
            {pixels.flat().map((pixel, index) => (
              <div
                key={index}
                className="aspect-square w-[clamp(17px,4vw,34px)]"
                style={{
                  backgroundColor: colors[pixel],
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute right-[4%] top-[15%] z-20 bg-[#f5ca61] p-4 shadow-[5px_5px_0_#26251f]"
        animate={reduceMotion ? {} : { y: [0, -9, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      >
        <span className="font-pixel text-[9px] text-[#26251f]">
          0101
        </span>
      </motion.div>

      <div className="absolute bottom-[14%] left-[2%] z-20 rotate-[-7deg] border-2 border-[#26251f] bg-[#f17b50] px-4 py-3 shadow-[4px_4px_0_#26251f]">
        <span className="font-pixel text-[9px] text-[#26251f]">
          HIDDEN
        </span>
      </div>
    </div>
  );
}

export default PixelArtifact;
