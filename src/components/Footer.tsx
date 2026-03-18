export default function Footer() {
  return (
    <footer className="border-t border-slate-800 py-6 px-4">
      <div className="mx-auto max-w-6xl flex justify-center">
        <p className="text-xs text-slate-600">© {new Date().getFullYear()} Trayan Marinov</p>
      </div>
    </footer>
  );
}
