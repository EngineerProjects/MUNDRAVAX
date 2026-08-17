#[cfg(target_os = "windows")]
mod windows;
#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "linux")]
mod linux;

/// Returns the current system output volume, from 0 to 100.
pub fn get() -> Result<u32, String> {
	#[cfg(target_os = "windows")]
	return windows::get();
	#[cfg(target_os = "macos")]
	return macos::get();
	#[cfg(target_os = "linux")]
	return linux::get();
	#[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
	Err("Unsupported platform".to_string())
}

/// Sets the system output volume, from 0 to 100.
pub fn set(level: u32) -> Result<(), String> {
	let level = level.min(100);

	#[cfg(target_os = "windows")]
	return windows::set(level);
	#[cfg(target_os = "macos")]
	return macos::set(level);
	#[cfg(target_os = "linux")]
	return linux::set(level);
	#[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
	Err("Unsupported platform".to_string())
}
