# KWin Scripts

A collection of KWin scripts I use to improve my developper experience, coming from macOS.

Those scripts are provided as-is. I am not responsible for any misuage or bugs. Tested on the most recent (at the time 
of publication) KDE release available on openSUSE Tumbleweed.

Install command (unless instructed otherwise, after cloning this repository and from the repository root):

```bash
$ kpackagetool6 --type=KWin/Script --install ./kwin/scripts/<script-you-want>
```

## Available scripts

### Edge Reveal

```bash
$ kpackagetool6 --type=KWin/Script --install ./kwin/scripts/edgereveal
```

Makes the behavior of maximized windows feel close to fullscreen applications on macOS.

KDE already features dock and taskbar presets similar to Apple's distribution. However, they are tweaked differently, 
in a way that feels more restrictive and less user-friendly. What this script introduces:

- Larger buffer zone:\
  the dock and taskbar now show when the pointer enters a buffer zone instead of requiring it to be strictly on the edge.
  This also fixes issues with scaling and non-integer screen sizes (reveal could work improperly depending on screens
  arrangement with scaling turned on).\
  These buffer values can be edited in the following script variables:
  - `REVEAL_DISTANCE`: how close to each edge the pointer needs to be for the taskbar/dock to reveal\
    defaults (in pixels): `{ top: 8, bottom: 16 }`
  - `KEEP_DISTANCE`: how far from each edge the pointer can go until the taskbar/dock hides\
    default (in pixels); `{ top: 40, bottom: 72 }`
  - `HIDE_DELAY_MS`: how long the pointer must stay outside the keep zone before the taskbar/doc hides
    default (in milliseconds): `400`
  - `POLL_INTERVAL_MS`: how often the pointer is checked, so the worst-case delay before a reveal
    default (in milliseconds): `50`

**Prerequisites**\
The script is only effective against the following KDE configuration prerequisites:
- Panel visibility = `Dodge windows` (right-click panel → Show Panel Configuration → Visibility)
- Panel position = `top or bottom` (right-click panel → Show Panel Configuration → Position)
- Panel height = `top bar = 30, dock = 52` (right-click panel → Show Panel Configuration → Height)
  > Keep those values 10/20px under the `KEEP_DISTANCE` preset, otherwise the panel might disappear while you
  > interact with it (modify the script variable accordingly and reload it if you want to set custom panel heights)
- Script = `enabled` (System Settings → Window Management → KWin Scripts → Edge Reveal)

The following are not required for the script to be effective, but cosmetic recommendations to make the best use of it:
- Panel floating: `top bar: Disabled; dock: Panel and applets` (right-click panel → Show Panel Configuration → Floating)
- Panel width: `top bar: Fill width; dock: Fit content` (right-click panel → Show Panel Configuration → Width)
- Panel alignment: `dock: Center` (right-click panel → Show Panel Configuration → Alignment)
- Panel opacity: `default (Adaptative)` (right-click panel → Show Panel Configuration → Opacity)
- Dock contents: `dock: Icons-Only Task Manager` (right-click panel → Enter Edit Mode → Remove all widgets, then `Add Widget`)
- Top bar contents: `Application Launcher, Panel Spacer, System Tray, Digital Clock` (right-click panel → Enter Edit Mode)
- System-edge glow: `off` (System Settings → Window Management → Desktop Effects → untick Screen Edge → Apply)
