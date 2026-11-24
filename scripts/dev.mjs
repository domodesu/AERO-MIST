import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const autoUpdate = process.env.CODESPACES === 'true' && process.env.AERO_AUTO_UPDATE !== '0';
let server;
let stoppingServer = false;
let shuttingDown = false;
let checking = false;
let lastNotice = '';

function notice(message) {
  if (message !== lastNotice) console.log(`[auto-update] ${message}`);
  lastNotice = message;
}

async function git(...args) {
  const { stdout } = await exec('git', args, { timeout: 30000 });
  return stdout.trim();
}

function startServer() {
  stoppingServer = false;
  server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '0.0.0.0'], { stdio: 'inherit' });
  server.on('exit', (code, signal) => {
    if (!stoppingServer && !shuttingDown) {
      clearInterval(timer);
      process.exit(code ?? (signal ? 1 : 0));
    }
  });
}

async function stopServer() {
  if (!server || server.exitCode !== null || server.signalCode !== null) return;
  stoppingServer = true;
  await new Promise(resolve => {
    server.once('exit', resolve);
    server.kill('SIGTERM');
  });
}

async function checkForUpdates() {
  if (checking || shuttingDown) return;
  checking = true;
  try {
    // Never merge over local edits, including untracked files.
    if (await git('status', '--porcelain')) {
      notice('Local changes detected; automatic updates are paused until the working tree is clean.');
      return;
    }
    await git('rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}');
    await git('fetch', '--quiet');
    const current = await git('rev-parse', 'HEAD');
    const upstream = await git('rev-parse', '@{upstream}');
    if (current === upstream) { lastNotice = ''; return; }
    try {
      await git('merge-base', '--is-ancestor', current, upstream);
    } catch {
      notice('The local and remote branches have diverged; automatic updates are paused.');
      return;
    }
    // Check again after fetching, in case a file was edited while the network request ran.
    if (await git('status', '--porcelain')) {
      notice('Local changes detected; automatic updates are paused until the working tree is clean.');
      return;
    }
    const dependencyChanges = await git('diff', '--name-only', current, upstream, '--', 'package.json', 'package-lock.json');
    await git('merge', '--ff-only', '--quiet', upstream);
    notice('New version downloaded. The app will refresh automatically.');
    if (dependencyChanges) {
      console.log('[auto-update] Dependencies changed; restarting the app after npm ci.');
      await stopServer();
      try {
        await exec('npm', ['ci'], { timeout: 180000, maxBuffer: 1024 * 1024 });
        if (!shuttingDown) startServer();
      } catch (error) {
        console.error('[auto-update] Dependency installation failed. Run npm ci and npm run dev to restart.', error.stderr || error.message);
        process.exitCode = 1;
        clearInterval(timer);
      }
    }
  } catch (error) {
    notice(`Could not check for updates (${error.stderr?.trim() || error.message}). Will retry.`);
  } finally {
    checking = false;
  }
}

startServer();
const timer = autoUpdate ? setInterval(checkForUpdates, 60000) : null;
if (autoUpdate) {
  console.log('[auto-update] Checking the tracked branch every minute. Local edits pause updates.');
  checkForUpdates();
}
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    shuttingDown = true;
    clearInterval(timer);
    await stopServer();
    process.exit(0);
  });
}
