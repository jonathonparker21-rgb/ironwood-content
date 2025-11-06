# Ironwood Land Development — Changelog

## [1.2.5] - 2025-11-06
### Added
- GitHub-connected photo sync for Equipment and Dumpsters carousels.
  - Fetches `config.json` from GitHub raw when repo info is stored in localStorage (`gh_owner`, `gh_repo`, `gh_branch`).
  - Uses jsDelivr CDN for instant photo updates without redeploying.

### Behavior
- Falls back to bundled `config.json` when GitHub connection not found.
- No other features or layout modified.

## [1.2.6] - 2025-11-06
### Changed
- Dumpsters page: moved the photo carousel to display directly **below the dumpster prices**.
- Removed placeholder texts (“Uploaded in Admin → Dumpster Photos” and “No dumpster photos yet”).

### Notes
- Carousel style, autoplay speed, and all other site features remain unchanged.
- No changes to Admin, Equipment, Jobs, branding, or colors.