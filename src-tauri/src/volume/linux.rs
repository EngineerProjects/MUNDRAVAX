use std::process::Command;

pub fn get() -> Result<u32, String> {
	let output = Command::new("pactl")
		.args(["get-sink-volume", "@DEFAULT_SINK@"])
		.output()
		.map_err(|error| error.to_string())?;

	let text = String::from_utf8_lossy(&output.stdout);

	// Output looks like "Volume: front-left: 65536 / 100% / 0.00 dB, ..." -
	// take the first "N%" occurrence.
	let percent_index = text.find('%').ok_or("Could not parse pactl output")?;
	let start = text[..percent_index]
		.rfind(|character: char| !character.is_ascii_digit())
		.map(|index| index + 1)
		.unwrap_or(0);

	text[start..percent_index].parse::<u32>().map_err(|error| error.to_string())
}

pub fn set(level: u32) -> Result<(), String> {
	let status = Command::new("pactl")
		.args(["set-sink-volume", "@DEFAULT_SINK@", &format!("{level}%")])
		.status()
		.map_err(|error| error.to_string())?;

	if status.success() {
		Ok(())
	} else {
		Err(format!("pactl exited with status {status}"))
	}
}
