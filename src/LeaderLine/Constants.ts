import type { LeaderLineDashAnimationConfig, LeaderLineDashConfig, LeaderLineStyleConfiguration } from "./Types";

/**
 * Enum used to represent 'sockets', the midpoint of each line in a bounding rect, that LeaderLines
 * connect to.
 */
export const enum ESocket {
    left,
    top,
    right,
    bottom
}

// Angular constants
export const FortyFiveDegrees = Math.PI / 4;
export const OneHundredThirtyFiveDegrees = 3 * Math.PI / 4;
export const TwoHundredTwentyFiveDegrees = 5 * Math.PI / 4;
export const ThreeHundredFifteenDegrees = 7 * Math.PI / 4;
export const ThreeHundredSixtyDegrees = 2 * Math.PI;

// Default LeaderLineStyleConfiguration
export const DefaultStyleConfig: Required<LeaderLineStyleConfiguration> = {
    arrowhead_thickness: 5,
    line_thickness: 2.5,
    color: 'coral',
    curve: 'linear',
    dashed: false,
    text: undefined
}

// Default LeaderLineDashConfig
export const DefaultDashConfig: Required<LeaderLineDashConfig> = {
    animate: false,
    dash_length: 10,
    start_offset: 0
}

// Default LeaderLineDashAnimationConfig
export const DefaultDashAnimationConfig: Required<LeaderLineDashAnimationConfig> = {
    duration: '0.5s',
    repeat: 'indefinite',
    timing: 'linear'
}