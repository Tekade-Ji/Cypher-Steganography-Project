
function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}) {
  return (
    <div
      className={`${
        align === "center" ? "mx-auto text-center" : ""
      } ${className}`}
    >
      <span className="section-eyebrow">
        <span className="h-2 w-2 bg-secondary" />
        {eyebrow}
      </span>

      <h2 className="section-title mt-5">
        {title}
      </h2>

      {description && (
        <p className="section-description mt-5">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
