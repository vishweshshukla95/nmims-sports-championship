const fs = require("fs");
const path = require("path");
const https = require("https");
const sharp = require("sharp");

const sports = [
  {
    name: "cricket.webp",
    url: "https://images.pexels.com/photos/3628912/pexels-photo-3628912.jpeg",
    sport: "Cricket",
    title: "Boys Playing Cricket",
    photographer: "Patrick Case",
    sourceUrl: "https://www.pexels.com/photo/3628912/"
  },
  {
    name: "football.webp",
    url: "https://images.pexels.com/photos/27394455/pexels-photo-27394455.jpeg",
    sport: "Football",
    title: "Men Playing Soccer",
    photographer: "Omar Ramadan",
    sourceUrl: "https://www.pexels.com/photo/27394455/"
  },
  {
    name: "basketball.webp",
    url: "https://images.pexels.com/photos/2820900/pexels-photo-2820900.jpeg",
    sport: "Basketball",
    title: "Men Playing Basketball",
    photographer: "Wallace Chuck",
    sourceUrl: "https://www.pexels.com/photo/2820900/"
  },
  {
    name: "volleyball.webp",
    url: "https://images.pexels.com/photos/6203582/pexels-photo-6203582.jpeg",
    sport: "Volleyball",
    title: "Men and Women Playing Volleyball",
    photographer: "Pavel Danilyuk",
    sourceUrl: "https://www.pexels.com/photo/6203582/"
  },
  {
    name: "table-tennis.webp",
    url: "https://images.pexels.com/photos/13699262/pexels-photo-13699262.jpeg",
    sport: "Table Tennis",
    title: "A Man Playing Table Tennis",
    photographer: "Michael Quaynor",
    sourceUrl: "https://www.pexels.com/photo/13699262/"
  },
  {
    name: "lawn-tennis.webp",
    url: "https://images.pexels.com/photos/1619860/pexels-photo-1619860.jpeg",
    sport: "Lawn Tennis",
    title: "Two Person Playing Tennis",
    photographer: "Mudassir Ali",
    sourceUrl: "https://www.pexels.com/photo/1619860/"
  }
];

const destDir = path.join(__dirname, "..", "public", "images", "sports");
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      rejectUnauthorized: false
    };

    https
      .get(options, (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          return fetchBuffer(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          return reject(
            new Error(`Failed to fetch ${url} with status ${res.statusCode}`)
          );
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

async function processImage(inputBuffer, outputPath) {
  let quality = 80;
  let webpBuffer;

  while (quality >= 30) {
    webpBuffer = await sharp(inputBuffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toBuffer();

    if (webpBuffer.length < 200 * 1024) {
      break;
    }
    quality -= 5;
  }

  await fs.promises.writeFile(outputPath, webpBuffer);
  const metadata = await sharp(webpBuffer).metadata();

  return {
    bytes: webpBuffer.length,
    quality,
    width: metadata.width,
    height: metadata.height
  };
}

async function run() {
  console.log("Starting sports images download and sharp optimization...\n");

  let creditsContent = "# Sports Images Credits\n\nAll sports action photos sourced royalty-free from Pexels under the Pexels License:\n\n";

  for (const s of sports) {
    const outputPath = path.join(destDir, s.name);
    console.log(`Fetching ${s.sport} from ${s.url}...`);

    try {
      const buffer = await fetchBuffer(s.url);
      console.log(`Downloaded ${s.name} (${(buffer.length / 1024).toFixed(1)} KB original)`);

      const result = await processImage(buffer, outputPath);
      const sizeKb = (result.bytes / 1024).toFixed(1);
      console.log(`Saved ${s.name} as WebP: ${sizeKb} KB (${result.width}x${result.height}, quality: ${result.quality})`);

      creditsContent += `- **${s.name}** (${s.sport}): *${s.title}* by ${s.photographer} on Pexels - [Photo Page](${s.sourceUrl})\n`;
    } catch (err) {
      console.error(`Error processing ${s.name}:`, err.message);
      process.exitCode = 1;
    }
  }

  const creditsPath = path.join(destDir, "CREDITS.md");
  fs.writeFileSync(creditsPath, creditsContent, "utf8");
  console.log(`\nUpdated credits written to ${creditsPath}`);
  console.log("Completed!");
}

run();
