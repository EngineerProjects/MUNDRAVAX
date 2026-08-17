use crate::storage;
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
