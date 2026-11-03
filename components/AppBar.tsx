import Link from "next/link";
import { auth, isGoogleAuthConfigured } from "../auth";
import { signInWithGoogle, signOutOfAccount } from "../app/actions/auth";
import AuthSubmitButton from "./AuthSubmitButton";
import { AppThemeToggle } from "./AppTheme";
import styles from "./AppBar.module.css";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M43.61 24.46c0-1.36-.12-2.66-.35-3.92H24v7.42h11a9.4 9.4 0 0 1-4.08 6.18v5.14h6.61c3.87-3.56 6.08-8.81 6.08-14.82Z" />
      <path fill="#34A853" d="M24 44c5.51 0 10.13-1.83 13.51-4.96l-6.61-5.14c-1.83 1.23-4.17 1.98-6.9 1.98-5.32 0-9.84-3.59-11.46-8.43H5.72v5.3A20 20 0 0 0 24 44Z" />
      <path fill="#FBBC05" d="M12.54 27.45a12 12 0 0 1 0-6.9v-5.3H5.72a20 20 0 0 0 0 17.5l6.82-5.3Z" />
      <path fill="#EA4335" d="M24 12.12c3.01 0 5.69 1.04 7.83 3.1l5.87-5.87A19.6 19.6 0 0 0 24 4 20 20 0 0 0 5.72 15.25l6.82 5.3c1.62-4.84 6.14-8.43 11.46-8.43Z" />
    </svg>
  );
}

export default async function AppBar() {
  const configured = isGoogleAuthConfigured();
  const session = configured ? await auth() : null;
  const user = session?.user;
  const name = user?.name || user?.email || "Your account";
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return (
    <header className={styles.appBar}>
      <nav className={styles.inner} aria-label="Main navigation">
        <Link href="/" className={styles.brand} aria-label="Go Gun Hyuk home">
          <span className={styles.logo} aria-hidden="true">g.</span>
          <span className={styles.brandName}>Go Gun Hyuk</span>
        </Link>
        <div className={styles.actions}>
          <a className={styles.contact} href="mailto:gogeonhyeok@outlook.com">
            Get in touch <span aria-hidden="true">↗</span>
          </a>
          <AppThemeToggle className={styles.themeToggle} />
          {user ? (
            <div className={styles.account}>
              <span className={styles.avatar} aria-hidden="true">{initials}</span>
              <span className={styles.userName} title={name}>{name}</span>
              <form action={signOutOfAccount}>
                <AuthSubmitButton className={styles.signOutButton} pendingLabel="Signing out…">
                  Sign out
                </AuthSubmitButton>
              </form>
            </div>
          ) : (
            <form action={signInWithGoogle}>
              <AuthSubmitButton className={styles.googleButton} pendingLabel="Connecting…" disabled={!configured}>
                <GoogleIcon />
                <span>Sign in with Google</span>
              </AuthSubmitButton>
            </form>
          )}
        </div>
      </nav>
    </header>
  );
}
