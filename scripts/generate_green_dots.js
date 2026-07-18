/**
 * ⚡ GITHUB GREEN DOT GENERATOR UTILITY
 * --------------------------------------------------
 * This utility generates backdated commits in a git repository to populate your
 * GitHub contribution grid with green dots.
 * 
 * 💡 RECOMMENDED USE:
 * 1. Create a NEW private repository on GitHub (e.g. "contributions-archive").
 * 2. Run this script in a local clone of that repository.
 * 3. Push the commits to GitHub.
 * 4. Since it is private, the green dots will appear on your grid, but the repo itself 
 *    will remain hidden from public view!
 * 
 * RUN COMMAND:
 *   node scripts/generate_green_dots.js [daysToGoBack] [commitsPerDay]
 *   Example: node scripts/generate_green_dots.js 365 3
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Resolve configuration arguments
const daysToGoBack = parseInt(process.argv[2], 10) || 365; // Default: 1 year
const maxCommitsPerDay = parseInt(process.argv[3], 10) || 4;  // Default: Up to 4 commits per day

const dummyFilePath = path.join(process.cwd(), 'contributions.txt');

console.log('--------------------------------------------------');
console.log('🟢 GITHUB GREEN DOTS GENERATOR ACTIVE');
console.log(`⏱️ Period: Past ${daysToGoBack} days`);
console.log(`📦 Max commits per day: ${maxCommitsPerDay}`);
console.log('--------------------------------------------------');

// 2. Loop through each day and create commits
let totalCommits = 0;
const today = new Date();

for (let i = daysToGoBack; i >= 0; i--) {
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() - i);

  // Skip weekends occasionally to make the contribution graph look organic
  const dayOfWeek = targetDate.getDay();
  if ((dayOfWeek === 0 || dayOfWeek === 6) && Math.random() > 0.4) {
    continue;
  }

  // Generate a random number of commits for this day (organic pattern)
  const commitCount = Math.floor(Math.random() * (maxCommitsPerDay + 1));

  for (let c = 0; c < commitCount; c++) {
    // Offset the hours randomly so commits look scattered throughout the day
    const commitDate = new Date(targetDate);
    commitDate.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0);

    const dateISO = commitDate.toISOString();
    
    // Append dummy change to force commit
    fs.appendFileSync(dummyFilePath, `Contribution log entry at ${dateISO}\n`);

    // Run backdated Git commit command
    try {
      execSync('git add contributions.txt', { stdio: 'ignore' });
      
      const commitMessage = `chore: update contribution ledger [log ${totalCommits + 1}]`;
      
      // Override commit date via Git environment variables
      execSync(`git commit -m "${commitMessage}" --date="${dateISO}"`, {
        env: {
          ...process.env,
          GIT_AUTHOR_DATE: dateISO,
          GIT_COMMITTER_DATE: dateISO
        },
        stdio: 'ignore'
      });
      
      totalCommits++;
    } catch (err) {
      console.error(`❌ Failed to commit on date: ${dateISO}. Error:`, err.message);
      process.exit(1);
    }
  }
}

console.log('--------------------------------------------------');
console.log(`✅ SUCCESS: Generated ${totalCommits} commits over the past ${daysToGoBack} days!`);
console.log('👉 To push these commits, run:');
console.log('   git push origin main (or master)');
console.log('--------------------------------------------------');
