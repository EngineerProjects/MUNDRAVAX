mod crypto;
mod key;
mod path_safety;

use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

const FILE_NAME: &str = "virtual-drive.dat";
const FILES_DIR_NAME: &str = "files";
const FORMAT_VERSION: u8 = 1;

fn app_data_dir(app: &AppHandle) -> Result<PathBuf, String> {
	let dir = app.path().app_data_dir().map_err(|error| error.to_string())?;
	fs::create_dir_all(&dir).map_err(|error| error.to_string())?;
	Ok(dir)
}

fn file_path(app: &AppHandle) -> Result<PathBuf, String> {
	Ok(app_data_dir(app)?.join(FILE_NAME))
}

fn files_dir(app: &AppHandle) -> Result<PathBuf, String> {
	let dir = app_data_dir(app)?.join(FILES_DIR_NAME);
	fs::create_dir_all(&dir).map_err(|error| error.to_string())?;
	Ok(dir)
}

/// Reads and decrypts an encrypted blob file at `path`. `Ok(None)` means it doesn't exist yet.
fn read_encrypted(path: &PathBuf) -> Result<Option<String>, String> {
	if !path.exists() {
		return Ok(None);
	}

	let bytes = fs::read(path).map_err(|error| error.to_string())?;

	let Some((&version, payload)) = bytes.split_first() else {
		return Err("file is empty".to_string());
	};

	if version != FORMAT_VERSION {
		return Err(format!("unsupported file version: {version}"));
	}

	let key = key::get_or_create_key()?;
	crypto::decrypt(&key, payload).map(Some)
}

/// Encrypts `data` and writes it to `path`, overwriting any existing file.
fn write_encrypted(path: &PathBuf, data: &str) -> Result<(), String> {
	let key = key::get_or_create_key()?;
	let encrypted = crypto::encrypt(&key, data)?;

	let mut output = Vec::with_capacity(encrypted.len() + 1);
	output.push(FORMAT_VERSION);
	output.extend(encrypted);

	fs::write(path, output).map_err(|error| error.to_string())
}

/// Loads and decrypts the virtual drive index blob. `Ok(None)` means no file exists yet (first run).
pub fn load(app: &AppHandle) -> Result<Option<String>, String> {
	read_encrypted(&file_path(app)?)
}

/// Encrypts and writes the virtual drive index blob, overwriting any existing file.
pub fn save(app: &AppHandle, data: &str) -> Result<(), String> {
	write_encrypted(&file_path(app)?, data)
}

/// Deletes the virtual drive index and all per-file content. Idempotent.
pub fn clear(app: &AppHandle) -> Result<(), String> {
	let path = file_path(app)?;
	if path.exists() {
		fs::remove_file(&path).map_err(|error| error.to_string())?;
	}

	let dir = files_dir(app)?;
	if dir.exists() {
		fs::remove_dir_all(&dir).map_err(|error| error.to_string())?;
	}

	Ok(())
}

/// Reads and decrypts the content of one virtual file, identified by its
/// slash-separated path relative to the files directory. `Ok(None)` means it
/// doesn't exist (e.g. was never written, or was already deleted).
pub fn read_file(app: &AppHandle, relative_path: &str) -> Result<Option<String>, String> {
	let path = path_safety::resolve(&files_dir(app)?, relative_path)?;
	read_encrypted(&path)
}

/// Encrypts and writes the content of one virtual file to its mirrored disk path.
pub fn write_file(app: &AppHandle, relative_path: &str, content: &str) -> Result<(), String> {
	let path = path_safety::resolve(&files_dir(app)?, relative_path)?;
	write_encrypted(&path, content)
}

/// Deletes one virtual file's on-disk content, if present. Idempotent.
pub fn delete_file(app: &AppHandle, relative_path: &str) -> Result<(), String> {
	let path = path_safety::resolve(&files_dir(app)?, relative_path)?;
	if path.exists() {
		fs::remove_file(&path).map_err(|error| error.to_string())?;
	}
	Ok(())
}
