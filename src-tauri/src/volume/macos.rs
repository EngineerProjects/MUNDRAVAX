use std::process::Command;

pub fn get() -> Result<u32, String> {
	let output = Command::new("osascript")
		.args(["-e", "output volume of (get volume settings)"])
		.output()
		.map_err(|error| error.to_string())?;

	let text = String::from_utf8_lossy(&output.stdout);
	text.trim().parse::<u32>().map_err(|error| error.to_string())
}

pub fn set(level: u32) -> Result<(), String> {
	let status = Command::new("osascript")
		.args(["-e", &format!("set volume output volume {level}")])
		.status()
		.map_err(|error| error.to_string())?;

	if status.success() {
		Ok(())
	} else {
		Err(format!("osascript exited with status {status}"))
	}
}
