
import { motion } from "motion/react";
import { ArrowUpRight, Eye, Lightbulb } from "lucide-react";

function AboutSection() {
  return (
    <section id="about" className="bg-base-200 py-24 md:py-32">
      <div className="cipher-container grid items-center gap-12 lg:grid-cols-2">

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-[28px] bg-[#f5ca61] p-10"
        >
          <div className="absolute inset-0 pixel-grid opacity-40" />

          <div className="relative z-10 text-center">
            <div className="mx-auto flex h-36 w-36 items-center justify-center border-[8px] border-[#26251f] bg-[#3857d6] text-white shadow-[12px_12px_0_#26251f]">
              <Eye size={72} strokeWidth={1.4} />
            </div>

            <p className="mt-10 font-pixel text-[10px] leading-6">
              LOOK CLOSER.
            </p>
          </div>

          <span className="absolute right-6 top-6 font-pixel text-[9px]">
            OBJECT 001
          </span>
        </motion.div>

        <div>
          <span className="section-eyebrow">
            <Lightbulb size={15} />
            Why CIPHER exists
          </span>

          <h2 className="section-title mt-6">
            There's more
            <br />
            <span className="text-primary">than meets</span>
            <br />
            the eye.
          </h2>

          <p className="mt-7 text-base leading-8 text-base-content/65">
            Digital information is usually designed to be visible,
            accessible and easy to understand. But what if information
            could exist inside something that appears completely ordinary?
          </p>

          <p className="mt-5 text-base leading-8 text-base-content/65">
            CIPHER is an educational project exploring the relationship
            between cryptography and steganography. It demonstrates how
            messages can be encrypted and concealed within digital images,
            while making the underlying techniques accessible through an
            interactive interface.
          </p>

          <a
            href="#how-it-works"
            className="mt-8 inline-flex items-center gap-3 font-bold text-primary"
          >
            Explore the science
            <ArrowUpRight size={19} />
          </a>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
