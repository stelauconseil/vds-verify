// Store images: the whole device, the capture inside it, a title above.
// Usage: node scripts/screenshots/store.mjs <iphone|duo|ipad|android> <capture root from run.mjs>
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const [target, captures] = process.argv.slice(2);
// Canvas sizes accepted by App Store Connect (6.9" iPhone, iPhone Duo, 13" iPad) and Google Play (9:16 phone).
// Frame values are fractions of the device width: bezel, outer corner radius, side buttons.
// squareLeft: the iPhone Duo outer display has square corners on its hinge side.
const TARGETS = {
    iphone: { canvas: [1320, 2868], bezel: 0.035, radius: 0.16, buttons: { left: [[0.15, 0.04], [0.21, 0.07], [0.29, 0.07]], right: [[0.24, 0.1]] } },
    duo: { canvas: [1398, 2034], bezel: 0.03, radius: 0.11, squareLeft: true, buttons: { left: [], right: [[0.12, 0.08], [0.24, 0.12]] } },
    ipad: { canvas: [2064, 2752], bezel: 0.04, radius: 0.06, buttons: { left: [], right: [[0.06, 0.05], [0.13, 0.05]] } },
    android: { canvas: [1080, 1920], bezel: 0.03, radius: 0.12, buttons: { left: [], right: [[0.2, 0.06], [0.3, 0.12]] } },
};
const config = TARGETS[target];
if (!config || !captures || !existsSync(captures)) throw Error("Usage: store.mjs <iphone|duo|ipad|android> <capture root>");

const SLIDES = [
    { capture: "light/00-scan", fr: ["Scannez le cachet électronique", "Le code 2D-Doc des documents officiels"], en: ["Scan the digital seal", "The 2D-Doc code on official documents"] },
    { capture: "light/02-identity", fr: ["Un verdict immédiat", "Authentique ou non, en un coup d'œil"], en: ["An instant verdict", "Genuine or not, at a glance"] },
    { capture: "light/03-details", fr: ["Signature vérifiée", "Émetteur, certificat et date de signature"], en: ["Verified signature", "Issuer, certificate and signing date"] },
    { capture: "light/04-driving-record", fr: ["Aussi pour le permis", "Relevé d'information du permis de conduire"], en: ["Driving records too", "French driving licence statements"] },
    { capture: "light/01-history", fr: ["Retrouvez vos contrôles", "Recherche, filtres et favoris"], en: ["Find past checks", "Search, filters and pins"] },
    { capture: "dark/02-identity", fr: ["Clair ou sombre", "Suit l'apparence de votre téléphone"], en: ["Light or dark", "Follows your phone's appearance"] },
];
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const pngSize = file => {
    const result = spawnSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", file], { encoding: "utf8" });
    const [w, h] = [...result.stdout.matchAll(/: (\d+)/g)].map(m => Number(m[1]));
    return { w, h };
};

const [W, H] = config.canvas;
const out = path.resolve("build/store", target);
const tmp = path.join(out, ".tmp");
mkdirSync(tmp, { recursive: true });

for (const lang of ["fr", "en"]) {
    mkdirSync(path.join(out, lang), { recursive: true });
    SLIDES.forEach((slide, index) => {
        const shot = path.resolve(captures, lang, `${slide.capture}.png`);
        if (!existsSync(shot)) throw Error(`Missing capture ${shot}`);
        const { w, h } = pngSize(shot);
        // Fit the whole device below the text block, never wider than 84% of the canvas.
        const top = H * 0.2, bottom = H * 0.035;
        const screenH0 = (H - top - bottom) / (1 + 2 * config.bezel * (w / h));
        let screenW = screenH0 * (w / h), screenH = screenH0;
        if (screenW * (1 + 2 * config.bezel) > W * 0.84) {
            screenW = W * 0.84 / (1 + 2 * config.bezel);
            screenH = screenW * (h / w);
        }
        const bezel = screenW * config.bezel, deviceW = screenW + 2 * bezel, deviceH = screenH + 2 * bezel;
        const radius = deviceW * config.radius;
        const corners = r => (config.squareLeft ? `0 ${r}px ${r}px 0` : `${r}px`);
        const buttons = side => config.buttons[side].map(([y, len]) =>
            `<i style="${side}:${-deviceW * 0.008}px;top:${deviceH * y}px;height:${deviceH * len}px"></i>`).join("");
        const [title, subtitle] = slide[lang];
        const html = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden}
body{font-family:-apple-system,"SF Pro Display","Helvetica Neue",sans-serif;color:#0e1512;
 background:radial-gradient(ellipse 70% 45% at 50% 62%,#d9efe4 0%,transparent 70%),linear-gradient(180deg,#f6f8f7 0%,#e7ecea 100%)}
.head{position:absolute;top:${H * 0.02}px;height:${top - H * 0.035}px;left:${W * 0.07}px;right:${W * 0.07}px;
 display:flex;flex-direction:column;justify-content:center;gap:${H * 0.012}px;text-align:center}
h1{margin:0;font-size:${W * 0.071}px;line-height:1.08;font-weight:700;letter-spacing:-.02em}
p{margin:0 ${W * 0.03}px;font-size:${W * 0.04}px;line-height:1.2;color:#4b5563}
.dev{position:absolute;left:${(W - deviceW) / 2}px;top:${top}px;width:${deviceW}px;height:${deviceH}px;border-radius:${corners(radius)};
 background:#1c1c1e;box-shadow:0 0 0 ${deviceW * 0.004}px #48484a,0 ${H * 0.02}px ${H * 0.05}px rgba(14,21,18,.28)}
.dev img{position:absolute;left:${bezel}px;top:${bezel}px;width:${screenW}px;height:${screenH}px;border-radius:${corners(radius - bezel)}}
.dev i{position:absolute;width:${deviceW * 0.01}px;border-radius:${deviceW * 0.01}px;background:#2c2c2e}
</style></head><body><div class="head"><h1>${title}</h1><p>${subtitle}</p></div>
<div class="dev">${buttons("left")}${buttons("right")}<img src="file://${shot}"></div></body></html>`;
        const page = path.join(tmp, `${lang}-${index}.html`);
        writeFileSync(page, html);
        const file = path.join(out, lang, `${String(index + 1).padStart(2, "0")}-${slide.capture.split("/")[1].slice(3)}${slide.capture.startsWith("dark") ? "-dark" : ""}.png`);
        const result = spawnSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files", `--window-size=${W},${H}`, `--screenshot=${file}`, `file://${page}`], { stdio: "ignore" });
        if (result.status !== 0 || !existsSync(file)) throw Error(`Chrome failed on ${page}`);
        console.log(file);
    });
}
