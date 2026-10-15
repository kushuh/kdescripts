/*
 * Edge Reveal: show hidden Plasma panels when the pointer nears a screen edge.
 *
 * Plasma reveals a "Dodge windows" panel only when the pointer touches the
 * exact edge pixel, only along the panel's own length, and never on an edge
 * shared with another screen. This script polls the pointer instead, and
 * reveals the panel on the nearest top or bottom edge across the whole
 * screen width, from a few pixels away.
 *
 * Every top and bottom panel set to "Dodge windows" is affected.
 */

// ---- Settings ---------------------------------------------------------------

// Distance from the edge, in logical pixels, that reveals a panel. The top
// stays thin so it doesn't fire while reaching for browser tabs.
const REVEAL_DISTANCE = { top: 8, bottom: 16 };

// Distance from the edge within which a revealed panel stays shown, so the
// pointer can move onto it. Roughly the panel's height plus a margin.
const KEEP_DISTANCE = { top: 40, bottom: 72 };

const POLL_INTERVAL_MS = 50;

// How long the pointer must stay away before the panel hides again.
const HIDE_DELAY_MS = 400;

// Plasma panel modes. "windowsgobelow" overlays windows without resizing
// them. Plasma's scripting accepts it but reads it back as "none", so this
// script always sets the mode and never compares against the current one.
const MODE_SHOWN = "windowsgobelow";
const MODE_HIDDEN = "dodgewindows";

// ---- Geometry -----------------------------------------------------------------

function screenAt(point) {
    return workspace.screens.find((screen) => {
        const g = screen.geometry;
        return point.x >= g.x && point.x < g.x + g.width
            && point.y >= g.y && point.y < g.y + g.height;
    });
}

function distanceToEdge(point, screen, edge) {
    const g = screen.geometry;
    return edge === "top" ? point.y - g.y : g.y + g.height - 1 - point.y;
}

// The edge zone the pointer is in, as { screen, edge }, or null. A revealed
// panel uses the larger KEEP_DISTANCE so the pointer can reach it.
function zoneAt(point, revealed) {
    const screen = screenAt(point);
    if (!screen) return null;

    for (const edge of ["bottom", "top"]) {
        const isRevealed = revealed !== null && revealed.screen === screen && revealed.edge === edge;
        const reach = isRevealed ? KEEP_DISTANCE[edge] : REVEAL_DISTANCE[edge];
        if (distanceToEdge(point, screen, edge) < reach) return { screen, edge };
    }
    return null;
}

function sameZone(a, b) {
    return a !== null && b !== null && a.screen === b.screen && a.edge === b.edge;
}

// ---- Plasma -------------------------------------------------------------------

// Plasma and KWin number screens differently, so the panel is matched by its
// screen's position rather than by index.
function setPanelMode(zone, mode) {
    const g = zone.screen.geometry;
    const plasmaScript = `
        panels().forEach(function (panel) {
            var s = screenGeometry(panel.screen);
            if (panel.location == "${zone.edge}" && s.x == ${g.x} && s.y == ${g.y})
                panel.hiding = "${mode}";
        });`;
    callDBus("org.kde.plasmashell", "/PlasmaShell", "org.kde.PlasmaShell",
        "evaluateScript", plasmaScript);
}

// ---- State --------------------------------------------------------------------

let revealed = null;   // the zone whose panel is shown, or null
let awaySince = null;  // when the pointer left the revealed zone, or null

function show(zone) {
    if (revealed !== null) setPanelMode(revealed, MODE_HIDDEN);
    setPanelMode(zone, MODE_SHOWN);
    revealed = zone;
}

function hide() {
    setPanelMode(revealed, MODE_HIDDEN);
    revealed = null;
}

function tick() {
    const zone = zoneAt(workspace.cursorPos, revealed);

    if (zone !== null) {
        awaySince = null;
        if (!sameZone(zone, revealed)) show(zone);
        return;
    }

    if (revealed === null) return;
    if (awaySince === null) {
        awaySince = Date.now();
    } else if (Date.now() - awaySince >= HIDE_DELAY_MS) {
        awaySince = null;
        hide();
    }
}

const timer = new QTimer();
timer.interval = POLL_INTERVAL_MS;
timer.timeout.connect(tick);
timer.start();
