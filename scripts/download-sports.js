const fs = require("fs");
const path = require("path");
const https = require("https");

const sports = [
  {
    name: "cricket.webp",
    url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?fm=webp&w=1200&q=80",
    credit: "Photo by Alessandro Bogliari on Unsplash (Cricket match action)"
  },
  {
    name: "football.webp",
    url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?fm=webp&w=1200&q=80",
    credit: "Photo by Fauzan Saari on Unsplash (Football stadium action)"
  },
  {
    name: "basketball.webp",
    url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?fm=webp&w=1200&q=80",
    credit: "Photo by Markus Spiske on Unsplash (Basketball court action)"
  },
  {
    name: "volleyball.webp",
    url: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?fm=webp&w=1200&q=80",
    credit: "Photo by Vince Fleming on Unsplash (Volleyball game match)"
  },
  {
    name: "table-tennis.webp",
    url: "https://images.unsplash.com/photo-1534158914592-062992fbe900?fm=webp&w=1200&q=80",
    credit: "Photo by Vladislav Vasnetsov on Unsplash (Table Tennis match)"
  },
  {
    name: "lawn-tennis.webp",
    url: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?fm=webp&w=1200&q=80",
    credit: "Photo by Valentin Balan on Unsplash (Lawn Tennis court match)"
  }
];

const destDir = path.join(__dirname, "..", "public", "images", "sports");
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: { "User-Agent": "Mozilla/5.0" },
      rejectUnauthorized: false
    };
    https.get(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
    }).on("error", reject);
  });
}

async function run() {
  let credits = "# Sports Images Credits\n\nAll sports images sourced royalty-free from Unsplash:\n\n";
  for (const s of sports) {
    const filePath = path.join(destDir, s.name);
    console.log(`Downloading ${s.name}...`);
    try {
      await download(s.url, filePath);
      credits += `- **${s.name}**: ${s.credit}\n`;
      console.log(`Downloaded ${s.name}`);
    } catch (err) {
      console.error(`Error downloading ${s.name}:`, err.message);
    }
  }

  fs.writeFileSync(path.join(destDir, "CREDITS.md"), credits);
  console.log("Done downloading sports images and wrote CREDITS.md.");
}

run();
