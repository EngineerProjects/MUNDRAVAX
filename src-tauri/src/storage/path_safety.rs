use std::path::{Path, PathBuf};

const ILLEGAL_CHARACTERS: [char; 9] = ['<', '>', ':', '"', '/', '\\', '|', '?', '*'];

/// Validates and resolves a slash-separated relative path against `base_dir`,
/// rejecting anything that could escape it. This is the actual security
/// boundary - the TypeScript-side sanitizer is only a courtesy for readable
/// filenames and must never be trusted here.
pub fn resolve(base_dir: &Path, relative_path: &str) -> Result<PathBuf, String> {
	if relative_path.is_empty() {
		return Err("Path cannot be empty".to_string());
	}

	let mut resolved = base_dir.to_path_buf();

	for segment in relative_path.split('/') {
		if segment.is_empty() || segment == "." || segment == ".." {
			return Err(format!("Invalid path segment: {segment:?}"));
		}

		if segment.chars().any(|character| ILLEGAL_CHARACTERS.contains(&character) || character.is_control()) {
			return Err(format!("Invalid path segment: {segment:?}"));
		}

		resolved.push(segment);
	}

	// The file itself may not exist yet (on write), so canonicalize the
	// parent directory instead and verify it's still inside base_dir - the
	// actual boundary check, independent of the segment checks above.
	let parent = resolved.parent().ok_or("Path has no parent directory")?;
	std::fs::create_dir_all(parent).map_err(|error| error.to_string())?;

	let canonical_parent = parent.canonicalize().map_err(|error| error.to_string())?;
	let canonical_base = base_dir.canonicalize().map_err(|error| error.to_string())?;

	if !canonical_parent.starts_with(&canonical_base) {
		return Err("Resolved path escapes the storage directory".to_string());
	}

	Ok(resolved)
}

#[cfg(test)]
mod tests {
	use super::*;

	fn setup() -> PathBuf {
		let dir = std::env::temp_dir().join(format!("mundravax-path-safety-test-{}", std::process::id()));
		std::fs::create_dir_all(&dir).unwrap();
		dir
	}

	#[test]
	fn accepts_a_normal_nested_path() {
		let base = setup();
		assert!(resolve(&base, "home/prozilla-os/Documents/notes.txt").is_ok());
	}

	#[test]
	fn rejects_parent_directory_segments() {
		let base = setup();
		assert!(resolve(&base, "../../etc/passwd").is_err());
		assert!(resolve(&base, "home/../../../etc/passwd").is_err());
	}

	#[test]
	fn rejects_embedded_separators_and_illegal_characters() {
		let base = setup();
		assert!(resolve(&base, "home/a\\b").is_err());
		assert!(resolve(&base, "home/a:b").is_err());
		assert!(resolve(&base, "home/a*b").is_err());
	}

	#[test]
	fn rejects_empty_segments_and_empty_paths() {
		let base = setup();
		assert!(resolve(&base, "home//notes.txt").is_err());
		assert!(resolve(&base, "").is_err());
	}
}
