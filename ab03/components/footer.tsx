export default function Footer() {
  return (
    <footer className="border-t bg-[hsl(var(--footer-bg))]">
      <div className="container flex h-14 items-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Clinical Decision Support System. All rights reserved.
        </p>
        <nav className="ml-auto flex gap-4">
          <a href="#" className="text-sm text-accent underline underline-offset-4">
            Contact
          </a>
          <a href="#" className="text-sm text-accent underline underline-offset-4">
            Privacy
          </a>
          <a href="#" className="text-sm text-accent underline underline-offset-4">
            Terms
          </a>
        </nav>
      </div>
    </footer>
  )
}

