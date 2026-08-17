use crate::storage;
use crate::volume;
use tauri::AppHandle;

#[tauri::command]
pub fn load_drive(app: AppHandle) -> Result<Option<String>, String> {
	storage::load(&app)
}

#[tauri::command]
pub fn save_drive(app: AppHandle, data: String) -> Result<(), String> {
	storage::save(&app, &data)
}

#[tauri::command]
pub fn clear_drive(app: AppHandle) -> Result<(), String> {
	storage::clear(&app)
}

#[tauri::command]
pub fn read_drive_file(app: AppHandle, path: String) -> Result<Option<String>, String> {
	storage::read_file(&app, &path)
}

#[tauri::command]
pub fn write_drive_file(app: AppHandle, path: String, content: String) -> Result<(), String> {
	storage::write_file(&app, &path, &content)
}

#[tauri::command]
pub fn delete_drive_file(app: AppHandle, path: String) -> Result<(), String> {
	storage::delete_file(&app, &path)
}

#[tauri::command]
pub fn get_volume() -> Result<u32, String> {
	volume::get()
}

#[tauri::command]
pub fn set_volume(level: u32) -> Result<(), String> {
	volume::set(level)
}
