// Store banners: title on the left, two captures on the right, laid out on a 1024×500 stage that is
// scaled to fit each format (centered, the background fills the rest).
// android: Google Play feature graphic (1024×500).
// ios: App Store header (3840×1646) and search result image (3840×2560).
// Usage: node scripts/screenshots/banner.mjs <android|ios> <capture root from run.mjs> <stelau logo png>
// The logo is logo.stelau.png from the stelauconseil.github.io repository (white, transparent).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const [platform, captures, logo] = process.argv.slice(2);
const FORMATS = {
    android: [{ name: "feature-graphic", width: 1024, height: 500 }],
    ios: [{ name: "header", width: 3840, height: 1646 }, { name: "search", width: 3840, height: 2560 }],
}[platform];
if (!FORMATS || !captures || !existsSync(captures) || !logo || !existsSync(logo)) throw Error("Usage: banner.mjs <android|ios> <capture root> <stelau logo png>");
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TEXT = {
    fr: { title: "Vérifiez un 2D-Doc ou<br>un CEV <span>en un scan.</span>", sub: "Gratuit · Sans compte · Liste de confiance ANTS" },
    en: { title: "Verify a 2D-Doc or VDS<br><span>in one scan.</span>", sub: "Free · No account · ANTS trusted list" },
};
const out = path.resolve("assets/store", platform);
const tmp = path.resolve("build/store/.tmp");
mkdirSync(tmp, { recursive: true });
const file = p => `file://${path.resolve(p)}`;

for (const [lang, t] of Object.entries(TEXT)) {
    // Back: the paper document being scanned; front: the verdict it leads to.
    const back = path.join(captures, lang, "light", "06-document.png");
    const front = path.join(captures, lang, "light", "02-identity.png");
    for (const shot of [back, front]) if (!existsSync(shot)) throw Error(`Missing capture ${shot}`);
    for (const { name, width, height } of FORMATS) {
        const scale = Math.min(width / 1024, height / 500);
        const html = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden}
body{font-family:-apple-system,"SF Pro Display","Helvetica Neue",sans-serif;color:#fff;
 background:radial-gradient(ellipse 60% 80% at 80% 30%,#1c86d6 0%,transparent 70%),linear-gradient(160deg,#004f8a 0%,#0068b3 55%,#0b79c5 100%)}
.stage{position:absolute;width:1024px;height:500px;left:${(width - 1024 * scale) / 2}px;top:${(height - 500 * scale) / 2}px;transform:scale(${scale});transform-origin:0 0}
.brand{position:absolute;left:44px;top:40px;display:flex;align-items:center;gap:14px;font-size:27px;font-weight:700}
.brand img{width:52px;height:52px;border-radius:12px}
h1{position:absolute;left:44px;top:118px;margin:0;font-size:45px;line-height:1.12;font-weight:800;letter-spacing:-.01em}
h1 span{color:#8fd6ff}
p{position:absolute;left:44px;top:250px;margin:0;font-size:19px;font-weight:500;color:#dbeeff}
.logo{position:absolute;left:44px;bottom:38px;width:170px;filter:brightness(0) invert(1)} /* the logo's square is brand blue: all white here */
.phone{position:absolute;width:236px;border-radius:30px;background:#111;padding:7px;box-shadow:0 20px 40px rgba(0,30,70,.45)}
.phone img{display:block;width:100%;border-radius:24px}
.back{left:812px;top:92px;transform:rotate(6deg);opacity:.95}
.front{left:600px;top:52px;transform:rotate(-4deg)}
</style></head><body><div class="stage">
<div class="brand"><img src="${file("assets/icons/icon.png")}">VDS Verify</div>
<h1>${t.title}</h1><p>${t.sub}</p>
<img class="logo" src="${file(logo)}">
<div class="phone back"><img src="${file(back)}"></div>
<div class="phone front"><img src="${file(front)}"></div>
</div></body></html>`;
        const page = path.join(tmp, `${name}-${lang}.html`);
        writeFileSync(page, html);
        const png = path.join(out, `${name}-${lang}.png`);
        const result = spawnSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files", "--force-device-scale-factor=1", `--window-size=${width},${height}`, `--screenshot=${png}`, `file://${page}`], { stdio: "ignore" });
        if (result.status !== 0 || !existsSync(png)) throw Error(`Chrome failed on ${page}`);
        console.log(png);
    }
}
