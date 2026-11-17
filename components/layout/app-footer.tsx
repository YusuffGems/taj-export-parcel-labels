
export function AppFooter() {
  return (
    <footer className="border-t border-line bg-card px-4 py-5 sm:px-6">
      <div className="flex flex-col items-center justify-center gap-2 text-center">

        <p className="text-xs font-medium text-muted">
          © {new Date().getFullYear()} TAJ EXPORT
          <span className="mx-2 text-line">|</span>
          All rights reserved.
        </p>

        <p className="text-xs text-muted">
          Designed & developed by{" "}
          <a
            href="https://www.yusuffux.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-navy transition-colors hover:text-amber-600 hover:underline"
          >
            Mohammed Yusuff
          </a>
        </p>

        <a
          href="https://www.yusuffux.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-navy transition-colors hover:text-amber-600 hover:underline"
        >
          www.yusuffux.com
        </a>

      </div>
    </footer>
  );
}
