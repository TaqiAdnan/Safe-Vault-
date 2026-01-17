module.exports = (schema) => (req, res, next) => {
    if (!schema || typeof schema.validate !== "function") {
      return res.status(500).json({
        message: "Server validation schema missing",
        code: "VALIDATION_SCHEMA_MISSING",
      });
    }
  
    const { error, value } = schema.validate(req.query, { abortEarly: true, stripUnknown: true });
  
    if (error) {
      return res.status(400).json({ message: "Validation error", code: "VALIDATION_ERROR" });
    }
  
    req.query = value;
    next();
  };
  