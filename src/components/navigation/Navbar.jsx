import { Link } from "react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import Logo from "../brand/Logo";
import Button from "../ui/Button";
import ThemeSwitcher from "./ThemeSwitcher";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "Home", to: "/" },
    { label: "How it works", to: "/#how-it-works" },
    { label: "Technology", to: "/technology" },
    { label: "About", to: "/#about" },
  ];

  function closeMenu() {
    setMobileOpen(false);
  }

  return (
    <header className="site-navbar">
      <nav className="cipher-container flex h-[76px] items-center justify-between">
        <div onClick={closeMenu}>
          <Logo />
        </div>

        <div className="desktop-navigation flex items-center gap-8">
          {links.map((link) => (
            <Link key={link.label} to={link.to} className="nav-link">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />

          <div className="hidden sm:block">
            <Button to="/studio">Open Studio</Button>
          </div>

          <button
            className="btn btn-ghost btn-circle md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-base-300 bg-base-100 p-6 md:hidden">
          <div className="flex flex-col gap-6">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={closeMenu}
                className="font-semibold"
              >
                {link.label}
              </Link>
            ))}

            <Link
              to="/studio"
              onClick={closeMenu}
              className="cipher-button cipher-button-primary"
            >
              Open Studio
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
