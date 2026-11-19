// grąžina klaidų masyvą pagal paprastą schemą
function validate(body, schema, partial = false) {
  const errors = [];
  for (const [key, rule] of Object.entries(schema)) {
    const v = body[key];
    if (v === undefined || v === null || v === '') {
      // PUT metu laukas gali būti praleistas, bet privalomo lauko negalima išvalyti (null / "")
      if (rule.required && (!partial || v !== undefined)) errors.push(`${key} yra privalomas ir negali būti tuščias`);
      continue;
    }
    if (rule.type === 'string' && typeof v !== 'string') errors.push(`${key} turi būti tekstas`);
    else if (rule.type === 'number' && typeof v !== 'number') errors.push(`${key} turi būti skaičius`);
    else if (rule.type === 'boolean' && typeof v !== 'boolean') errors.push(`${key} turi būti true/false`);
    else {
      if (rule.min !== undefined && (rule.type === 'string' ? v.length : v) < rule.min) errors.push(`${key} per mažas (min ${rule.min})`);
      if (rule.max !== undefined && (rule.type === 'string' ? v.length : v) > rule.max) errors.push(`${key} per didelis (max ${rule.max})`);
      if (rule.date && isNaN(Date.parse(v))) errors.push(`${key} turi būti data (YYYY-MM-DD)`);
    }
  }
  return errors;
}

// 400 - kai body ne objektas / tuščias, 422 - kai laukai neteisingi
function check(schema, partial = false) {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body) || Object.keys(req.body).length === 0)
      return res.status(400).json({ error: 'Užklausos turinys turi būti JSON objektas' });
    const errors = validate(req.body, schema, partial);
    if (errors.length) return res.status(422).json({ error: 'Validacijos klaida', details: errors });
    next();
  };
}

module.exports = { check };
