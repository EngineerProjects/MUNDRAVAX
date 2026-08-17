mod crypto;
mod key;

use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

const FILE_NAME: &str = "virtual-drive.dat";
const FORMAT_VERSION: u8 = 1;

fn file_path(app: &AppHandle) -> Result<PathBuf, String> {
	let dir = app.path().app_data_dir().map_err(|error| error.to_string())?;
	fs::create_dir_all(&dir).map_err(|error| error.to_string())?;
	Ok(dir.join(FILE_NAME))
}

/// Loads and decrypts the virtual drive blob. `Ok(None)` means no file exists yet (first run).
pub fn load(app: &AppHandle) -> Result<Option<String>, String> {
	let path = file_path(app)?;

	if !path.exists() {
		return Ok(None);
	}

	let bytes = fs::read(&path).map_err(|error| error.to_string())?;

	let Some((&version, payload)) = bytes.split_first() else {
		return Err("virtual drive file is empty".to_string());
	};

	if version != FORMAT_VERSION {
		return Err(format!("unsupported virtual drive file version: {version}"));
	}

	let key = key::get_or_create_key()?;
	crypto::decrypt(&key, payload).map(Some)
}

/// Encrypts and writes the virtual drive blob, overwriting any existing file.
pub fn save(app: &AppHandle, data: &str) -> Result<(), String> {
	let path = file_path(app)?;
	let key = key::get_or_create_key()?;
	let encrypted = crypto::encrypt(&key, data)?;

	let mut output = Vec::with_capacity(encrypted.len() + 1);
	output.push(FORMAT_VERSION);
	output.extend(encrypted);

	fs::write(&path, output).map_err(|error| error.to_string())
}

/// Deletes the virtual drive file, if present. Idempotent.
pub fn clear(app: &AppHandle) -> Result<(), String> {
	let path = file_path(app)?;

	if path.exists() {
		fs::remove_file(&path).map_err(|error| error.to_string())?;
	}

	Ok(())
}
