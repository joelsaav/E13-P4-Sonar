type LogoProps = {
  fill?: string;
  width?: number;
  height?: number;
  className?: string;
};

export default function Logo({
  fill = "currentColor",
  width = 32,
  height = 32,
  className,
}: Readonly<LogoProps>) {
  return (
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 200.000000 200.000000"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g
        transform="translate(0.000000,200.000000) scale(0.100000,-0.100000)"
        fill={fill}
        stroke="none"
      >
        <path d="M110 1045 l0 -695 850 0 850 0 0 695 0 695 -850 0 -850 0 0 -695z m1670 0 l0 -665 -820 0 -820 0 0 665 0 665 820 0 820 0 0 -665z" />
        <path d="M270 1505 l0 -65 105 0 105 0 0 -290 0 -290 75 0 75 0 0 290 0 290 105 0 105 0 0 65 0 65 -285 0 -285 0 0 -65z" />
        <path d="M1232 1205 c-81 -18 -138 -52 -193 -113 -150 -167 -98 -444 101 -547 150 -77 346 -42 442 78 41 53 75 146 79 223 l3 49 -187 3 -187 2 0 -65 0 -65 105 0 c71 0 105 -4 105 -11 0 -7 -9 -27 -21 -45 -64 -105 -229 -109 -318 -8 -113 129 -52 335 110 374 72 18 137 -1 191 -55 l27 -27 60 32 61 33 -21 28 c-70 98 -218 145 -357 114z" />
      </g>
    </svg>
  );
}
