import type { LeaderLineDashAnimationConfig, LeaderLineDashConfig, LeaderLineStyleConfiguration } from "./Types";
/**
 * Enum used to represent 'sockets', the midpoint of each line in a bounding rect, that LeaderLines
 * connect to.
 */
export declare const enum ESocket {
    left = 0,
    top = 1,
    right = 2,
    bottom = 3
}
export declare const FortyFiveDegrees: number;
export declare const OneHundredThirtyFiveDegrees: number;
export declare const TwoHundredTwentyFiveDegrees: number;
export declare const ThreeHundredFifteenDegrees: number;
export declare const ThreeHundredSixtyDegrees: number;
export declare const DefaultStyleConfig: Required<LeaderLineStyleConfiguration>;
export declare const DefaultDashConfig: Required<LeaderLineDashConfig>;
export declare const DefaultDashAnimationConfig: Required<LeaderLineDashAnimationConfig>;
