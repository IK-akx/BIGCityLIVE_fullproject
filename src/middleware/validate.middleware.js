module.exports = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,   // return all errors in one time
    stripUnknown: true,  // delete extra spaces
    convert: true        // convert types
  });

  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message
      }))
    });
  }

  req.body = value;
  next();
};