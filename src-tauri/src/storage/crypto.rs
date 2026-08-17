use aes_gcm::{
	Aes256Gcm, Key, Nonce,
	aead::{Aead, KeyInit, OsRng, rand_core::RngCore},
};

const NONCE_LEN: usize = 12;

/// Encrypts `plaintext` with a fresh random nonce, returning `nonce || ciphertext+tag`.
pub fn encrypt(key: &[u8; 32], plaintext: &str) -> Result<Vec<u8>, String> {
	let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(key));

	let mut nonce_bytes = [0u8; NONCE_LEN];
	OsRng.fill_bytes(&mut nonce_bytes);
	let nonce = Nonce::from_slice(&nonce_bytes);

	let mut ciphertext = cipher
		.encrypt(nonce, plaintext.as_bytes())
		.map_err(|error| error.to_string())?;

	let mut output = nonce_bytes.to_vec();
	output.append(&mut ciphertext);
	Ok(output)
}

/// Splits `nonce || ciphertext+tag` back apart and decrypts it.
pub fn decrypt(key: &[u8; 32], data: &[u8]) -> Result<String, String> {
	if data.len() < NONCE_LEN {
		return Err("encrypted data is too short to contain a nonce".to_string());
	}

	let (nonce_bytes, ciphertext) = data.split_at(NONCE_LEN);
	let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(key));
	let nonce = Nonce::from_slice(nonce_bytes);

	let plaintext = cipher
		.decrypt(nonce, ciphertext)
		.map_err(|error| error.to_string())?;

	String::from_utf8(plaintext).map_err(|error| error.to_string())
}
