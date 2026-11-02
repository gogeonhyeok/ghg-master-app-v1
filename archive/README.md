# Archived Frogchat designs

`frogchat-illustrated-2026-10-27.tar.gz` preserves the complete illustrated three-pond implementation
as it existed before the minimal white-room redesign on 2026-10-27. It includes
the UI, all three frog designs, day/night artwork, realtime services, API handlers,
tests, documentation, and dependency/deployment configuration. No environment
files or credentials are included.

The adjacent manifest records SHA-256 checksums for all 40 files. The
archive was read back and every checksum verified before active files changed.

Archive SHA-256: `182e5fab1a6914fe871ad3d6d818ae86acb08cc5df4239a5cc2d1dc57a75af1a`

To inspect or restore, extract into a separate directory and copy the desired
files into a Next.js app:

```sh
mkdir -p /tmp/frogchat-illustrated
tar -xzf archive/frogchat-illustrated-2026-10-27.tar.gz -C /tmp/frogchat-illustrated
```

The active app is `app/frogchat`; this archive creates no extra Next.js routes.
