export type Script = {
  plain: string;
  vars: Record<string, string>;
};

export type Value =
  | { type: "number"; value: bigint }
  | { type: "string"; value: string }
  | { type: "account"; value: string }
  | { type: "asset"; value: string }
  | { type: "portion"; numerator: bigint; denominator: bigint };

export function number(value: bigint): Value {
  return { type: "number", value };
}

export function string(value: string): Value {
  return { type: "string", value };
}

export function account(value: string): Value {
  return { type: "account", value };
}

export function asset(value: string): Value {
  return { type: "asset", value };
}

function findVarPosition(t: TemplateStringsArray) {
  const joined = t.join("");
}

export function lit(
  fragments: TemplateStringsArray,
  ...values: Value[]
): Script {
  const cachedNamesForType = new Map<Value["type"], Map<string, string>>();

  const vars: Script["vars"] = {};
  // TODO handle when vars block already exists

  const varNames: string[] = [];
  const varsLines = values
    .flatMap((value) => {
      const cachedNames = defaultMapGet(
        cachedNamesForType,
        value.type,
        () => new Map<string, string>()
      );

      const stringified = stringifyVar(value);

      const lookup = cachedNames.get(stringified);
      if (lookup !== undefined) {
        varNames.push(lookup);
        return [];
      }

      const currentIndex = cachedNames.size + 1;
      const variableName = `autogen__${value.type}${currentIndex}`;
      varNames.push(variableName);

      cachedNames.set(stringified, variableName);
      vars[variableName] = stringified;

      return [`  ${value.type} $${variableName}`];
    })
    .join("\n");

  let plain = `vars {
${varsLines}
}
`;

  fragments.forEach((fragment, index) => {
    // cachedNamesForType

    plain += fragment;
    const value = values[index];
    if (value !== undefined) {
      plain += `$${varNames[index]}`;
    }
  });

  return { plain, vars };
}

function stringifyVar(value: Value): string {
  switch (value.type) {
    case "string":
    case "account":
    case "asset":
      return value.value;

    case "number":
      return value.value.toString();

    case "portion":
      return `${value.numerator}/${value.denominator}`;
  }
}

export function defaultMapGet<K, V>(wm: Map<K, V>, k: K, makeDefault: () => V) {
  const lookup = wm.get(k);
  if (lookup !== undefined) {
    return lookup;
  }

  const defaultValue = makeDefault();
  wm.set(k, defaultValue);
  return defaultValue;
}
