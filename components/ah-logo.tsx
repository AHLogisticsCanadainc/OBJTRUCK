interface AHLogoProps {
  width?: number
  height?: number
  className?: string
}

export function AHLogo({ width = 40, height = 40, className = "" }: AHLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={width}
      height={height}
      viewBox="0 0 375 374.999991"
      preserveAspectRatio="xMidYMid meet"
      version="1.0"
      className={className}
    >
      <defs>
        <clipPath id="e56f4b6c41">
          <path d="M 175 254 L 201 254 L 201 306.609375 L 175 306.609375 Z M 175 254 " clipRule="nonzero" />
        </clipPath>
        <clipPath id="6b6c118a59">
          <path d="M 36.050781 0 L 339.414062 0 L 339.414062 276 L 36.050781 276 Z M 36.050781 0 " clipRule="nonzero" />
        </clipPath>
      </defs>
      <g fill="#ed1c23" fillOpacity="1">
        <g transform="translate(118.163879, 361.490499)">
          <g>
            <path d="M 26.734375 0 L 24.359375 -5.109375 L 9.671875 -5.109375 L 7.296875 0 L 0.34375 0 L 13.078125 -25.375 L 21.1875 -25.375 L 33.90625 0 Z M 11.953125 -10.046875 L 22.03125 -10.046875 L 16.984375 -20.890625 Z M 11.953125 -10.046875 " />
          </g>
        </g>
      </g>
      <g fill="#ed1c23" fillOpacity="1">
        <g transform="translate(181.425589, 361.490499)">
          <g>
            <path d="M 2.40625 0 L 2.40625 -5.953125 L 8.75 -5.953125 L 8.75 0 Z M 2.40625 0 " />
          </g>
        </g>
      </g>
      <g fill="#ed1c23" fillOpacity="1">
        <g transform="translate(221.652953, 361.490499)">
          <g>
            <path d="M 3.203125 0 L 3.203125 -25.375 L 9.890625 -25.375 L 9.890625 -15.4375 L 25.28125 -15.4375 L 25.28125 -25.375 L 31.9375 -25.375 L 31.9375 0 L 25.28125 0 L 25.28125 -10.25 L 9.890625 -10.25 L 9.890625 0 Z M 3.203125 0 " />
          </g>
        </g>
      </g>
      <g clipPath="url(#e56f4b6c41)">
        <path
          fill="#ed1c23"
          d="M 200.402344 254.527344 L 200.402344 306.476562 L 175.046875 306.476562 L 175.046875 254.527344 L 200.402344 254.527344 "
          fillOpacity="1"
          fillRule="nonzero"
        />
      </g>
      <g clipPath="url(#6b6c118a59)">
        <path
          fill="#ed1c23"
          d="M 336.773438 168.988281 L 262.214844 230.636719 L 272.78125 275.417969 L 240.695312 263.652344 L 235.699219 242.507812 L 288.699219 198.652344 L 281.023438 194.269531 L 293.335938 162.429688 L 260.574219 165.210938 L 256.898438 155.15625 L 215.960938 206.785156 L 223.171875 121.332031 L 211.214844 131.199219 L 187.71875 84.945312 L 164.246094 131.207031 L 152.277344 121.324219 L 159.46875 206.785156 L 118.527344 155.121094 L 114.84375 165.210938 L 82.121094 162.429688 L 94.425781 194.269531 L 86.722656 198.691406 L 139.71875 242.507812 L 134.753906 263.6875 L 102.679688 275.417969 L 113.1875 230.636719 L 38.667969 168.988281 L 54.914062 159.71875 L 36.050781 110.898438 L 87.804688 115.300781 L 96.980469 90.214844 L 135.800781 139.183594 L 127.835938 44.519531 L 154.117188 66.214844 L 187.714844 0.00390625 L 221.351562 66.214844 L 247.617188 44.519531 L 239.625 139.183594 L 278.492188 90.214844 L 287.625 115.300781 L 339.414062 110.898438 L 320.53125 159.71875 L 336.773438 168.988281 "
          fillOpacity="1"
          fillRule="nonzero"
        />
      </g>
    </svg>
  )
}
