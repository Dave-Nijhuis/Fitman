/* Fitman — icon set. Clean stroke icons, 24px grid. <Icon name="..." size strokeWidth /> */
function Icon({ name, size = 22, sw = 1.8, style, color }) {
  const p = { fill: 'none', stroke: color || 'currentColor', strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    home: <><path {...p} d="M3 10.5 12 3l9 7.5" /><path {...p} d="M5 9.5V20h14V9.5" /></>,
    dumbbell: <><path {...p} d="M6.5 8.5v7M3.5 10v4M17.5 8.5v7M20.5 10v4M6.5 12h11" /></>,
    history: <><circle {...p} cx="12" cy="12" r="8.5" /><path {...p} d="M12 7.5V12l3 2" /></>,
    library: <><path {...p} d="M5 4.5h11a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2V4.5Z" /><path {...p} d="M5 16.5a2 2 0 0 1 2-2h11" /></>,
    chart: <><path {...p} d="M4 4v16h16" /><path {...p} d="M8 14l3-3.5 2.5 2L19 7" /></>,
    plus: <><path {...p} d="M12 5v14M5 12h14" /></>,
    minus: <><path {...p} d="M5 12h14" /></>,
    check: <><path {...p} d="M5 12.5 10 17.5 19 6.5" /></>,
    play: <><path {...p} d="M7 5.5 18 12 7 18.5V5.5Z" /></>,
    search: <><circle {...p} cx="11" cy="11" r="6.5" /><path {...p} d="m16 16 4 4" /></>,
    flame: <><path {...p} d="M12 3c1 3-1.5 4-1.5 6.5C10.5 11 11.5 12 12 12s2-1 2-3c2 1.5 3 3.5 3 6a5 5 0 1 1-10 0c0-3 2-4 2-6.5C9 6 11 5 12 3Z" /></>,
    trophy: <><path {...p} d="M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path {...p} d="M7 5H4v1.5A3 3 0 0 0 7 9M17 5h3v1.5A3 3 0 0 1 17 9M9.5 13.5 9 18h6l-.5-4.5M7.5 21h9" /></>,
    chevron: <><path {...p} d="m9 5 7 7-7 7" /></>,
    back: <><path {...p} d="m15 5-7 7 7 7" /></>,
    x: <><path {...p} d="M6 6 18 18M18 6 6 18" /></>,
    timer: <><circle {...p} cx="12" cy="13" r="8" /><path {...p} d="M12 13V9M9 2.5h6" /></>,
    scale: <><path {...p} d="M4 8h16l-2 12H6L4 8Z" /><path {...p} d="M9 8a3 3 0 0 1 6 0" /><path {...p} d="M12 12v4" /></>,
    trend: <><path {...p} d="M4 16 10 10l3.5 3.5L20 7" /><path {...p} d="M15 7h5v5" /></>,
    calendar: <><rect {...p} x="4" y="5.5" width="16" height="15" rx="2.5" /><path {...p} d="M4 10h16M8 3.5v4M16 3.5v4" /></>,
    settings: <><circle {...p} cx="12" cy="12" r="3" /><path {...p} d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" /></>,
    pencil: <><path {...p} d="M5 19h3l9.5-9.5a2.1 2.1 0 0 0-3-3L5 16v3Z" /></>,
    clock: <><circle {...p} cx="12" cy="12" r="8.5" /><path {...p} d="M12 7v5l3.5 2" /></>,
    route: <><circle {...p} cx="6" cy="18" r="2.5" /><circle {...p} cx="18" cy="6" r="2.5" /><path {...p} d="M8.5 18H14a3 3 0 0 0 0-6H10a3 3 0 0 1 0-6h5.5" /></>,
    bolt: <><path {...p} d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z" /></>,
    target: <><circle {...p} cx="12" cy="12" r="8.5" /><circle {...p} cx="12" cy="12" r="4.5" /><circle {...p} cx="12" cy="12" r="0.6" /></>,
    weight: <><path {...p} d="M6 9h12l1 10H5L6 9Z" /><path {...p} d="M9 9V6.5a3 3 0 0 1 6 0V9" /></>,
    list: <><path {...p} d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></>,
    grid: <><rect {...p} x="4" y="4" width="7" height="7" rx="1.5" /><rect {...p} x="13" y="4" width="7" height="7" rx="1.5" /><rect {...p} x="4" y="13" width="7" height="7" rx="1.5" /><rect {...p} x="13" y="13" width="7" height="7" rx="1.5" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true">
      {paths[name] || null}
    </svg>
  );
}
Object.assign(window, { Icon });
