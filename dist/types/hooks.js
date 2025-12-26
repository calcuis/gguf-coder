// Enum for all supported placeholder types - ensures type safety
export var PlaceholderType;
(function (PlaceholderType) {
    PlaceholderType["PASTE"] = "paste";
    PlaceholderType["FILE"] = "file";
    // Future types can be added here:
    // TEMPLATE = 'template',
    // ENV_VAR = 'env_var',
    // COMMAND_OUTPUT = 'command_output'
})(PlaceholderType || (PlaceholderType = {}));
//# sourceMappingURL=hooks.js.map