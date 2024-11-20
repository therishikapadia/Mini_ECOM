
function validateAttributes(attributes, rules) {
    for (const key in rules) {
      const rule = rules[key];
      const value = attributes[key];
  
      if (rule.required && value === undefined) return false;
  
      if (rule.type === "array") {
        if (!Array.isArray(value)) return false;
        if (rule.allowedValues && !value.every((v) => rule.allowedValues.includes(v))) {
          return false;
        }
        if (rule.min !== undefined || rule.max !== undefined) {
          if (!value.every((v) => v >= rule.min && v <= rule.max)) return false;
        }
      }
  
      if (rule.type === "number") {
        if (typeof value !== "number") return false;
      }
    }
  
    return true;
  }
  
module.exports={validateAttributes}