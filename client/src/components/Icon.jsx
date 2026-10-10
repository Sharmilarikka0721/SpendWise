const paths = {
  home: 'M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10',
  chart: 'M4 20V10m6 10V4m6 16v-7m4 7H2',
  wallet: 'M3 7.5A2.5 2.5 0 0 1 5.5 5H19v3M3 7.5V18a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5.5A2.5 2.5 0 0 1 3 7.5ZM16 14.5h.01',
  book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15ZM4 20.5A2.5 2.5 0 0 0 6.5 23H20',
  plus: 'M12 5v14M5 12h14',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-2.5.9.5-1.5 2.6-1-.3a7 7 0 0 1-1.6.9l-.2 1.1h-3l-.2-1.1a7 7 0 0 1-1.6-.9l-1 .3-1.5-2.6.9-.5a7 7 0 0 1 0-1.8l-.9-.5 1.5-2.6 1 .3a7 7 0 0 1 1.6-.9l.2-1.1h3l.2 1.1c.6.2 1.1.5 1.6.9l1-.3 1.5 2.6-.9.5c.1.6.1 1.2 0 1.8Z',
  left: 'm15 5-7 7 7 7',
  right: 'm9 5 7 7-7 7',
  scan: 'M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16',
  trash: 'M5 7h14M10 11v6m4-6v6M6 7l1 12h10l1-12M9 7V4h6v3',
  edit: 'm4 20 4-1 11-11-3-3L5 16l-1 4Z'
};

export default function Icon({ name, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}
