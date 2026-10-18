const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const sharp = require("sharp");

const sports = [
  {
    name: "cricket.webp",
    rawFile: "cricket.jpg",
    url: "https://images.pexels.com/photos/3628912/pexels-photo-3628912.jpeg",
    sport: "Cricket",
    title: "Boys Playing Cricket",
    photographer: "Patrick Case",
    sourceUrl: "https://www.pexels.com/photo/3628912/"
  },
  {
    name: "football.webp",
    rawFile: "football.jpg",
    url: "https://images.pexels.com/photos/27394455/pexels-photo-27394455.jpeg",
    sport: "Football",
    title: "Men Playing Soccer",
    photographer: "Omar Ramadan",
    sourceUrl: "https://www.pexels.com/photo/27394455/"
  },
  {
    name: "basketball.webp",
    rawFile: "basketball.jpg",
    url: "https://images.pexels.com/photos/2820900/pexels-photo-2820900.jpeg",
    sport: "Basketball",
    title: "Men Playing Basketball",
    photographer: "Wallace Chuck",
    sourceUrl: "https://www.pexels.com/photo/2820900/"
  },
  {
    name: "volleyball.webp",
    rawFile: "volleyball.jpg",
    url: "https://images.pexels.com/photos/6203582/pexels-photo-6203582.jpeg",
    sport: "Volleyball",
    title: "Men and Women Playing Volleyball",
    photographer: "Pavel Danilyuk",
    sourceUrl: "https://www.pexels.com/photo/6203582/"
  },
  {
    name: "table-tennis.webp",
    rawFile: "table-tennis.jpg",
    url: "https://images.pexels.com/photos/13699262/pexels-photo-13699262.jpeg",
    sport: "Table Tennis",
    title: "A Man Playing Table Tennis",
    photographer: "Michael Quaynor",
    sourceUrl: "https://www.pexels.com/photo/13699262/"
  },
  {
    name: "lawn-tennis.webp",
    rawFile: "lawn-tennis.jpg",
    url: "https://images.pexels.com/photos/1619860/pexels-photo-1619860.jpeg",
    sport: "Lawn Tennis",
    title: "Two Person Playing Tennis",
    photographer: "Mudassir Ali",
    sourceUrl: "https://www.pexels.com/photo/1619860/"
  }
];

const scratchDir = "/Users/vishweshshukla/.gemini/antigravity/brain/69b5acb9-5bf1-4d84-b44e-f41f93bd83df/scratch";
const destDir = path.join(__dirname, "..", "public", "images", "sports");

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function downloadImage(url, destPath) {
  const cmd = `curl -s -L --retry 3 --connect-timeout 15 -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" -o "${destPath}" "${url}"`;
  execSync(cmd);
}

async function processImage(inputPath, outputPath) {
  let quality = 82;
  let webpBuffer;

  const image = sharp(inputPath);
  const metadata = await image.metadata();

  while (quality >= 30) {
    webpBuffer = await sharp(inputPath)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toBuffer();

    if (webpBuffer.length < 200 * 1024) {
      break;
    }
    quality -= 5;
  }

  await fs.promises.writeFile(outputPath, webpBuffer);
  const finalMeta = await sharp(webpBuffer).metadata();

  return {
    bytes: webpBuffer.length,
    quality,
    width: finalMeta.width,
    height: finalMeta.height
  };
}

async function run() {
  console.log("=== Sports Images Download and Optimization ===\n");

  let creditsContent = "# Sports Images Credits\n\nAll sports action photos sourced royalty-free from Pexels under the Pexels License:\n\n";

  for (const s of sports) {
    const rawPath = path.join(scratchDir, s.rawFile);
    const outputPath = path.join(destDir, s.name);

    if (!fs.existsSync(rawPath) || fs.statSync(rawPath).size === 0) {
      console.log(`Downloading ${s.sport} from ${s.url}...`);
      try {
        downloadImage(s.url, rawPath);
        console.log(`  Downloaded ${s.rawFile}: ${(fs.statSync(rawPath).size / 1024).toFixed(1)} KB`);
      } catch (err) {
        console.error(`  Error downloading ${s.name}:`, err.message);
        continue;
      }
    } else {
      console.log(`Using cached download for ${s.sport} (${(fs.statSync(rawPath).size / 1024).toFixed(1)} KB)`);
    }

    try {
      const result = await processImage(rawPath, outputPath);
      const sizeKb = (result.bytes / 1024).toFixed(1);
      console.log(`  Processed ${s.name}: ${sizeKb} KB (${result.width}x${result.height}, quality: ${result.quality})`);
      creditsContent += `- **${s.name}** (${s.sport}): *${s.title}* by ${s.photographer} on Pexels - [Photo Page](${s.sourceUrl})\n`;
    } catch (err) {
      console.error(`  Error processing ${s.name}:`, err.message);
    }
  }

  const creditsPath = path.join(destDir, "CREDITS.md");
  fs.writeFileSync(creditsPath, creditsContent, "utf8");
  console.log(`\nCredits file updated at: ${creditsPath}`);

  console.log("\n=== Final Verification of Files in public/images/sports/ ===");
  for (const s of sports) {
    const p = path.join(destDir, s.name);
    if (fs.existsSync(p)) {
      const stat = fs.statSync(p);
      const meta = await sharp(p).metadata();
      console.log(`✓ ${s.name}: ${(stat.size / 1024).toFixed(1)} KB (${meta.width}x${meta.height}, format: ${meta.format})`);
    } else {
      console.log(`✗ ${s.name}: MISSING`);
    }
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
