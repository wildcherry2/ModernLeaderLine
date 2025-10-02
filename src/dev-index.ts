import "./index.css";
import "./LeaderLine";
import interact from "interactjs";
import type { LeaderLine } from "./LeaderLine";

document.addEventListener("DOMContentLoaded", (_ev) => {
    var leaderline = document.querySelector("#leaderline") as LeaderLine;
    interact('.draggable').draggable({
        enabled: true,
        autoScroll: true,
        listeners: {
            move: (event: Interact.DragEvent) => {
                var element = event.target;
                console.log("moved5");
                element["dx"] ??= 0;
                element["dy"] ??= 0;

                element["dx"] += event.dx;
                element["dy"] += event.dy;

                element.style.translate = `${element["dx"]}px ${element["dy"]}px`;
                leaderline.position();
            }
        }
    });
});