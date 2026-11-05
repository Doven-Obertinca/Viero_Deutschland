/** Small, server-rendered brand marks; link names are supplied by the parent. */
export function SocialIcon({ name }: { name: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {name === "Instagram" ? (
        <>
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle
            cx="12"
            cy="12"
            r="4.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="17.5" cy="6.5" r="1.2" />
        </>
      ) : name === "LinkedIn" ? (
        <>
          <circle cx="4.5" cy="4.5" r="1.8" />
          <path d="M3 8h3v13H3zm5.5 0h3v1.8c.8-1.3 2-2.1 3.8-2.1 3.1 0 4.7 1.9 4.7 5.5V21h-3v-7.3c0-2.1-.7-3.2-2.4-3.2-1.9 0-3.1 1.4-3.1 3.5v7h-3z" />
        </>
      ) : name === "Facebook" ? (
        <path d="M14 22v-9h3l.5-3.5H14V7.3c0-1 .3-1.8 1.8-1.8h1.9V2.3A24 24 0 0 0 15 2c-2.8 0-4.7 1.7-4.7 4.9v2.6H7V13h3.3v9z" />
      ) : name === "Pinterest" ? (
        <path d="M12 2a10 10 0 0 0-3.6 19.3c0-.8 0-1.9.2-2.8l1.3-5.5s-.3-.6-.3-1.6c0-1.5.9-2.7 2-2.7 1 0 1.5.7 1.5 1.6 0 1-.6 2.4-1 3.7-.3 1.1.6 2 1.7 2 2 0 3.5-2.1 3.5-5.1 0-2.6-1.9-4.4-4.5-4.4-3.1 0-4.9 2.3-4.9 4.6 0 .9.3 1.9.8 2.4l.2.5-.3 1c0 .2-.2.3-.5.2-1.3-.6-2.1-2.4-2.1-4 0-3.3 2.4-6.3 6.8-6.3 3.6 0 6.4 2.6 6.4 6 0 3.6-2.3 6.6-5.4 6.6-1.1 0-2.1-.6-2.5-1.2l-.7 2.7c-.2 1-.9 2-1.3 2.8A10 10 0 1 0 12 2z" />
      ) : null}
    </svg>
  );
}
