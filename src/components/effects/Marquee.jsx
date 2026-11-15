
import { Asterisk, Box, Sparkles } from "lucide-react";

const words = ["HIDE", "ENCRYPT", "DISCOVER", "DECODE", "REVEAL"];

function MarqueeGroup() {
  return (
    <div className="cipher-marquee-group">
      {words.map((word, index) => (
        <div className="cipher-marquee-item" key={word}>
          <span>{word}</span>
          {index % 3 === 0 ? (
            <Asterisk />
          ) : index % 3 === 1 ? (
            <Box />
          ) : (
            <Sparkles />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <section className="cipher-marquee" aria-label="CIPHER">
      <div className="cipher-marquee-track">
        <MarqueeGroup />
        <MarqueeGroup />
      </div>
    </section>
  );
}
