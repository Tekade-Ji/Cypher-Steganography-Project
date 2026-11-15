
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";

function Button({
  children,
  variant = "primary",
  to,
  href,
  icon = true,
  className = "",
  ...props
}) {
  const classes = `cipher-button cipher-button-${variant} ${className}`;

  const content = (
    <>
      {children}
      {icon && <ArrowUpRight size={16} />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}

export default Button;
