import Link from "next/link";

const NotFound = () => (
  <main className="grid min-h-dvh place-items-center px-6 text-center">
    <div>
      <p className="text-5xl font-extrabold text-hospital">404</p>
      <p className="mt-2 text-muted">Bu sayfa bulunamadı.</p>
      <Link className="mt-6 inline-block rounded-xl bg-accent px-5 py-2.5 font-semibold text-accent-ink" href="/">
        Ana Sayfa
      </Link>
    </div>
  </main>
);

export default NotFound;
