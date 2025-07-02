function formatValidationError(errors) {
	return "Invalid Values: " + errors.map((error) => error.path).join(", ");
}

module.exports = {
	formatValidationError,
};