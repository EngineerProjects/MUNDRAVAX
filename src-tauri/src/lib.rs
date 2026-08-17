mod commands;
mod storage;
mod volume;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_process::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      commands::load_drive,
      commands::save_drive,
      commands::clear_drive,
      commands::read_drive_file,
      commands::write_drive_file,
      commands::delete_drive_file,
      commands::get_volume,
      commands::set_volume,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
