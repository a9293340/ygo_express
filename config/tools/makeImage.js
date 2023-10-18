const { v4 } = require("uuid");
const fs = require("fs");

const makeImage = (photo, path, needToken = "make") => {
	const token = needToken === "make" ? v4() : needToken;
	const idx = photo.indexOf(";base64,") + 8;
	fs.writeFileSync(
		`./public/${path}/${token}.webp`,
		photo.substring(idx),
		"base64"
	);

	return token;
};

module.exports = {
	makeImage,
};
