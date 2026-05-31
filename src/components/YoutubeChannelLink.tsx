const YOUTUBE_CHANNEL_URL =
  process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL ??
  `https://www.youtube.com/@${process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_HANDLE ?? "BurakDurgun"}`;

type Props = {
  className?: string;
};

export default function YoutubeChannelLink({ className = "" }: Props) {
  return (
    <a
      href={YOUTUBE_CHANNEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex shrink-0 rounded-md p-0.5 text-red-500 transition hover:text-red-400 active:scale-95 ${className}`}
      aria-label="Burak Durgun YouTube kanalı"
    >
      <YoutubeIcon />
    </a>
  );
}

function YoutubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
