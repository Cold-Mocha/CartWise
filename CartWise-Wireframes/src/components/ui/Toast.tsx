export function Toast({message}: {message: string | null}) {
  return (
    <div className="cw-toast-region" role="status" aria-live="polite">
      {message && <div className="cw-toast">{message}</div>}
    </div>
  );
}
